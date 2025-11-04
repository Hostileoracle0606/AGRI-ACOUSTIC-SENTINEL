#!/bin/bash
# Quick deployment script for frontend to Netlify

echo "🌐 Deploying Agri-Acoustic Sentinel Frontend to Netlify"
echo ""
echo "Prerequisites:"
echo "1. Netlify CLI installed: npm install -g netlify-cli"
echo "2. Logged in: netlify login"
echo "3. Backend deployed and URL available"
echo ""
read -p "Enter your backend URL (e.g., https://your-app.up.railway.app): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required!"
    exit 1
fi

# Navigate to client directory
cd client

# Set environment variables
echo "🔧 Setting environment variables..."
netlify env:set REACT_APP_API_URL "$BACKEND_URL"
netlify env:set REACT_APP_SOCKET_URL "$BACKEND_URL"

# Initialize if needed
if [ ! -f ".netlify/state.json" ]; then
    echo "📝 Initializing Netlify site..."
    netlify init
    # When prompted:
    # - Create & configure a new site: Yes
    # - Site name: aas
    # - Build command: npm run build
    # - Directory to deploy: build
fi

# Deploy
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "✅ Frontend deployed!"
echo "Your site should be at: https://aas.netlify.app"
echo ""
echo "Next steps:"
echo "1. Update backend CORS with FRONTEND_URL=https://aas.netlify.app"
echo "2. Test the deployment"

