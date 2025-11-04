# ImageBind Local Setup Guide

This guide will help you set up ImageBind locally from the [GitHub repository](https://github.com/facebookresearch/ImageBind) instead of using the Replicate API.

## Prerequisites

- Python 3.10 or higher
- Git
- pip (Python package manager)

## Installation Steps

### Windows

1. **Run the setup script:**
   ```bash
   cd server
   setup-imagebind.bat
   ```

2. **Or manually:**
   ```bash
   cd ..
   git clone https://github.com/facebookresearch/ImageBind.git
   cd ImageBind
   python -m venv venv
   venv\Scripts\activate.bat
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   pip install -r requirements.txt
   pip install .
   pip install soundfile
   ```

### Linux/Mac

1. **Run the setup script:**
   ```bash
   cd server
   chmod +x setup-imagebind.sh
   ./setup-imagebind.sh
   ```

2. **Or manually:**
   ```bash
   cd ..
   git clone https://github.com/facebookresearch/ImageBind.git
   cd ImageBind
   python3 -m venv venv
   source venv/bin/activate
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   pip install -r requirements.txt
   pip install .
   pip install soundfile
   ```

## Verification

To test if ImageBind is working:

```bash
# Activate virtual environment
# Windows:
ImageBind\venv\Scripts\activate.bat

# Linux/Mac:
source ImageBind/venv/bin/activate

# Test the script
python server/imagebind-local.py
```

## Usage

Once set up, the server will automatically use the local ImageBind model when you upload audio files. No API keys or Replicate account needed!

## Troubleshooting

### "ImageBind not installed" error
- Make sure you've run the setup script
- Verify the ImageBind directory exists in the project root
- Check that the virtual environment is set up correctly

### "Python not found" error
- Ensure Python 3.10+ is installed
- Add Python to your system PATH
- On Windows, try using `py` instead of `python`

### Model download issues
- The model checkpoint will be downloaded automatically on first use
- Make sure you have internet connection for the first run
- Model size is ~2GB, so ensure you have enough disk space

## Model Information

- **Repository**: https://github.com/facebookresearch/ImageBind
- **Model**: imagebind_huge (pretrained)
- **License**: CC-BY-NC 4.0 (non-commercial use)
- **Requirements**: PyTorch 2.0+, Python 3.10+

## Notes

- The first run will download the model checkpoint (~2GB)
- Analysis runs locally on your machine (no API calls)
- GPU acceleration is automatic if CUDA is available
- CPU-only mode is also supported

