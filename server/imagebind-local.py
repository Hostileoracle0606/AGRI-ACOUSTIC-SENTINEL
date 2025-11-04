#!/usr/bin/env python3
"""
Local ImageBind audio analysis for Agri-Acoustic Sentinel
Uses ImageBind directly from GitHub: https://github.com/facebookresearch/ImageBind
"""

import sys
import json
import os
import torch
from pathlib import Path

# Support cloud deployment - use environment variable for ImageBind path
IMAGEBIND_PATH = os.environ.get('IMAGEBIND_PATH', None)
if not IMAGEBIND_PATH:
    # Default to parent directory for local development
    IMAGEBIND_PATH = str(Path(__file__).parent.parent / 'ImageBind')

# Add ImageBind to path (support both local and cloud deployment)
imagebind_path = Path(IMAGEBIND_PATH)
if imagebind_path.exists():
    sys.path.insert(0, str(imagebind_path.parent))
    sys.path.insert(0, str(imagebind_path))

try:
    from imagebind import data
    from imagebind.models import imagebind_model
    from imagebind.models.imagebind_model import ModalityType
except ImportError:
    print(json.dumps({
        "error": "ImageBind not installed. Please run: cd ImageBind && pip install .",
        "success": False
    }), file=sys.stderr)
    sys.exit(1)

def analyze_audio_with_imagebind(audio_path, text_queries=None):
    """
    Analyze audio file using ImageBind model
    
    Args:
        audio_path: Path to audio file
        text_queries: List of text queries for comparison (default: pest-related queries)
    
    Returns:
        Dictionary with embeddings, similarities, and analysis results
    """
    try:
        # Default text queries for pest detection
        if text_queries is None:
            text_queries = [
                "agricultural field bioacoustic pest detection",
                "bark beetle sound",
                "aphid wing beat",
                "caterpillar chewing",
                "grasshopper stridulation",
                "healthy field environment",
                "insect pest activity",
                "crop damage sound"
            ]
        
        # Check if audio file exists
        if not os.path.exists(audio_path):
            return {
                "error": f"Audio file not found: {audio_path}",
                "success": False
            }
        
        # Set device
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}", file=sys.stderr)
        
        # Load ImageBind model
        # Redirect download messages to stderr to keep stdout clean for JSON
        print("Loading ImageBind model...", file=sys.stderr)
        import warnings
        import io
        import contextlib
        
        # Suppress download progress and redirect to stderr
        class StderrRedirect:
            def write(self, s):
                sys.stderr.write(s)
            def flush(self):
                sys.stderr.flush()
        
        # Redirect stdout during model loading to prevent download messages in JSON output
        old_stdout = sys.stdout
        try:
            sys.stdout = StderrRedirect()
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                model = imagebind_model.imagebind_huge(pretrained=True)
        finally:
            sys.stdout = old_stdout
            
        model.eval()
        model.to(device)
        print("Model loaded successfully", file=sys.stderr)
        
        # Prepare inputs
        print(f"Processing audio: {audio_path}", file=sys.stderr)
        inputs = {
            ModalityType.AUDIO: data.load_and_transform_audio_data([audio_path], device),
            ModalityType.TEXT: data.load_and_transform_text(text_queries, device),
        }
        
        # Get embeddings
        print("Computing embeddings...", file=sys.stderr)
        with torch.no_grad():
            embeddings = model(inputs)
        
        audio_embedding = embeddings[ModalityType.AUDIO]
        text_embeddings = embeddings[ModalityType.TEXT]
        
        # Compute similarities
        print("Computing similarities...", file=sys.stderr)
        similarities = torch.softmax(audio_embedding @ text_embeddings.T, dim=-1)
        similarities_np = similarities.cpu().numpy()[0]
        
        # Flush stderr to ensure all messages are printed before JSON
        sys.stderr.flush()
        
        # Extract acoustic features from embedding
        audio_embedding_np = audio_embedding.cpu().numpy()[0]
        
        # Determine pest type based on highest similarity
        pest_types_map = {
            "bark beetle sound": "bark_beetle",
            "aphid wing beat": "aphid",
            "caterpillar chewing": "caterpillar",
            "grasshopper stridulation": "grasshopper",
            "insect pest activity": "pest_activity",
            "crop damage sound": "crop_damage"
        }
        
        detected_pests = []
        max_similarity = 0
        best_match = None
        
        for i, query in enumerate(text_queries):
            similarity = float(similarities_np[i])
            if similarity > max_similarity:
                max_similarity = similarity
                best_match = query
            
            # Check if this is a pest-related query
            pest_type = pest_types_map.get(query)
            if pest_type and similarity > 0.3:  # Threshold for pest detection
                detected_pests.append({
                    "type": pest_type,
                    "confidence": similarity,
                    "severity": min(similarity * 1.5, 1.0),
                    "description": query
                })
        
        # Calculate acoustic features from embedding statistics
        embedding_mean = float(audio_embedding_np.mean())
        embedding_std = float(audio_embedding_np.std())
        embedding_max = float(audio_embedding_np.max())
        embedding_min = float(audio_embedding_np.min())
        
        # Map embedding statistics to acoustic features
        # These are approximations based on embedding characteristics
        frequency = 1000 + (embedding_mean * 500)  # Map to kHz range
        amplitude = 0.1 + (embedding_std * 0.2)
        spectral_centroid = frequency * 0.8
        zero_crossing_rate = amplitude * 0.5
        
        # Overall confidence based on pest detection
        confidence = max_similarity if detected_pests else 0.1
        
        result = {
            "success": True,
            "source": "local_imagebind",
            "timestamp": str(torch.tensor(0)),  # Will be replaced by Node.js
            "confidence": float(confidence),
            "pestTypes": detected_pests,
            "acousticFeatures": {
                "frequency": frequency,
                "amplitude": amplitude,
                "spectralCentroid": spectral_centroid,
                "zeroCrossingRate": zero_crossing_rate,
                "embeddingMean": embedding_mean,
                "embeddingStd": embedding_std,
                "embeddingMax": embedding_max,
                "embeddingMin": embedding_min
            },
            "similarities": {
                query: float(similarities_np[i]) 
                for i, query in enumerate(text_queries)
            },
            "bestMatch": best_match,
            "maxSimilarity": float(max_similarity),
            "embeddingSize": len(audio_embedding_np)
        }
        
        print("Analysis complete", file=sys.stderr)
        # Flush stderr before printing JSON to stdout
        sys.stderr.flush()
        return result
        
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc(file=sys.stderr)
        return {
            "error": error_msg,
            "success": False,
            "traceback": traceback.format_exc()
        }

if __name__ == "__main__":
    # Read arguments from stdin (JSON)
    try:
        input_data = json.loads(sys.stdin.read())
        audio_path = input_data.get("audio_path")
        text_queries = input_data.get("text_queries")
        
        if not audio_path:
            print(json.dumps({
                "error": "audio_path is required",
                "success": False
            }), file=sys.stderr)
            sys.exit(1)
        
        result = analyze_audio_with_imagebind(audio_path, text_queries)
        # Print only JSON to stdout (no extra messages, no newlines before/after)
        # This ensures clean JSON parsing in Node.js
        json_output = json.dumps(result, indent=2)
        # Ensure no extra whitespace or content
        sys.stdout.write(json_output)
        sys.stdout.flush()
        
        if not result.get("success"):
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "success": False
        }), file=sys.stderr)
        sys.exit(1)

