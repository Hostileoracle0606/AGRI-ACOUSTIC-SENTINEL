@echo off
REM Quick deployment script for backend to Railway (Windows)

echo 🚀 Deploying Agri-Acoustic Sentinel Backend to Railway
echo.
echo Prerequisites:
echo 1. Railway CLI installed: npm install -g @railway/cli
echo 2. Logged in: railway login
echo.
pause

REM Deploy to Railway
echo 📦 Deploying to Railway...
railway up

echo.
echo ✅ Deployment initiated!
echo Check Railway dashboard for deployment status and URL
echo.
echo Next steps:
echo 1. Copy your Railway backend URL
echo 2. Deploy frontend to Netlify
echo 3. Set REACT_APP_API_URL and REACT_APP_SOCKET_URL in Netlify
echo 4. Update backend CORS with FRONTEND_URL environment variable
pause

