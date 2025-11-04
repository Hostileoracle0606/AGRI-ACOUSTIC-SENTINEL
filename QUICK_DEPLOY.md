# Quick Deployment to aas.netlify.app

## 🚀 Quick Start

### Step 1: Deploy Backend First (Required)

The backend with ImageBind **must be deployed separately**. Here's the fastest option:

#### Railway.app (5 minutes)

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your `AGRI-ACOUSTIC-SENTINEL` repository
4. Railway will auto-detect the Dockerfile and deploy
5. Wait for deployment (5-10 minutes for first build)
6. Copy the deployment URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Netlify

#### Option A: Netlify CLI (Fastest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Navigate to client directory
cd client

# Initialize and deploy
netlify init
# When prompted:
# - Create & configure a new site: Yes
# - Site name: aas
# - Build command: npm run build
# - Directory to deploy: build

# Set backend URL (replace with your Railway URL)
netlify env:set REACT_APP_API_URL https://your-app.up.railway.app
netlify env:set REACT_APP_SOCKET_URL https://your-app.up.railway.app

# Deploy
netlify deploy --prod
```

#### Option B: Netlify Dashboard (Easiest)

1. **Go to [app.netlify.com](https://app.netlify.com)**
2. **Click "Add new site" > "Import an existing project"**
3. **Connect GitHub** and select `AGRI-ACOUSTIC-SENTINEL`
4. **Configure build settings:**
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/build`
   - **Branch:** `main`
5. **Set environment variables:**
   - Go to **Site settings** > **Environment variables**
   - Add:
     - `REACT_APP_API_URL` = `https://your-backend-url.com` (from Railway)
     - `REACT_APP_SOCKET_URL` = `https://your-backend-url.com` (from Railway)
6. **Deploy:**
   - Click "Deploy site"
   - Or it will auto-deploy on next git push

### Step 3: Update Backend CORS

After deploying frontend, update backend CORS to allow Netlify:

1. **Go to Railway dashboard** (or your backend platform)
2. **Add environment variable:**
   - `FRONTEND_URL` = `https://aas.netlify.app`
   - `NETLIFY_URL` = `https://aas.netlify.app`
3. **Redeploy backend** (or it will auto-restart)

### Step 4: Set Custom Domain (Optional)

In Netlify dashboard:
1. Go to **Site settings** > **Domain management**
2. Add custom domain: `aas.netlify.app`
3. Netlify will provide DNS instructions

## ✅ Verification

1. **Frontend:** Visit `https://aas.netlify.app`
2. **Backend Health:** Visit `https://your-backend-url.com/api/health`
3. **Check Browser Console:** Should see "Connected to server" message
4. **Test Features:** Try uploading an audio file

## 🔧 Troubleshooting

### CORS Errors

- Verify backend has `FRONTEND_URL` environment variable set
- Check backend logs for CORS errors
- Ensure backend URL in Netlify env vars is correct

### Socket.IO Not Connecting

- Check browser console for connection errors
- Verify `REACT_APP_SOCKET_URL` is set correctly
- Check backend Socket.IO CORS configuration

### Build Fails

- Check Netlify build logs
- Verify Node version is 18
- Ensure all dependencies are in package.json

## 📝 Next Steps

- Monitor backend logs for ImageBind processing
- Set up custom domain if desired
- Configure monitoring/analytics
- Set up automatic deployments

