#!/bin/bash
# Setup script for ImageBind local installation

echo "🚀 Setting up ImageBind from GitHub..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Clone ImageBind repository if it doesn't exist
if [ ! -d "ImageBind" ]; then
    echo "📦 Cloning ImageBind repository..."
    git clone https://github.com/facebookresearch/ImageBind.git
else
    echo "✅ ImageBind repository already exists"
fi

cd ImageBind

# Create Python virtual environment
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install PyTorch (CPU version for compatibility)
echo "📦 Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install ImageBind dependencies
echo "📦 Installing ImageBind dependencies..."
pip install -r requirements.txt

# Install ImageBind package
echo "📦 Installing ImageBind package..."
pip install .

# Install soundfile for audio processing
echo "📦 Installing soundfile..."
pip install soundfile

# Download model checkpoint (optional - will download automatically on first use)
echo "📥 Model checkpoint will be downloaded automatically on first use"

echo ""
echo "✅ ImageBind setup complete!"
echo ""
echo "To use ImageBind:"
echo "  source ImageBind/venv/bin/activate"
echo "  python server/imagebind-local.py"

