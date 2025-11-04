@echo off
REM Setup script for ImageBind local installation (Windows)

echo Setting up ImageBind from GitHub...

REM Navigate to project root
cd /d "%~dp0\.."

REM Clone ImageBind repository if it doesn't exist
if not exist "ImageBind" (
    echo Cloning ImageBind repository...
    git clone https://github.com/facebookresearch/ImageBind.git
) else (
    echo ImageBind repository already exists
)

cd ImageBind

REM Create Python virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing dependencies...
call venv\Scripts\activate.bat

REM Install PyTorch (CPU version for compatibility)
echo Installing PyTorch...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

REM Install ImageBind dependencies
echo Installing ImageBind dependencies...
pip install -r requirements.txt

REM Install ImageBind package
echo Installing ImageBind package...
pip install .

REM Install soundfile for audio processing
echo Installing soundfile...
pip install soundfile

echo.
echo ImageBind setup complete!
echo.
echo To use ImageBind:
echo   ImageBind\venv\Scripts\activate.bat
echo   python server\imagebind-local.py

