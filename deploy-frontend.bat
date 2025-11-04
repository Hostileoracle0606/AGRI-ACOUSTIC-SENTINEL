@echo off
REM Quick deployment script for frontend to Netlify (Windows)

echo 🌐 Deploying Agri-Acoustic Sentinel Frontend to Netlify
echo.
echo Prerequisites:
echo 1. Netlify CLI installed: npm install -g netlify-cli
echo 2. Logged in: netlify login
echo 3. Backend deployed and URL available
echo.
set /p BACKEND_URL="Enter your backend URL (e.g., https://your-app.up.railway.app): "

if "%BACKEND_URL%"=="" (
    echo ❌ Backend URL is required!
    pause
    exit /b 1
)

REM Navigate to client directory
cd client

REM Set environment variables
echo 🔧 Setting environment variables...
netlify env:set REACT_APP_API_URL "%BACKEND_URL%"
netlify env:set REACT_APP_SOCKET_URL "%BACKEND_URL%"

REM Initialize if needed
if not exist ".netlify\state.json" (
    echo 📝 Initializing Netlify site...
    netlify init
    REM When prompted:
    REM - Create & configure a new site: Yes
    REM - Site name: aas
    REM - Build command: npm run build
    REM - Directory to deploy: build
)

REM Deploy
echo 🚀 Deploying to Netlify...
netlify deploy --prod

echo.
echo ✅ Frontend deployed!
echo Your site should be at: https://aas.netlify.app
echo.
echo Next steps:
echo 1. Update backend CORS with FRONTEND_URL=https://aas.netlify.app
echo 2. Test the deployment
pause

