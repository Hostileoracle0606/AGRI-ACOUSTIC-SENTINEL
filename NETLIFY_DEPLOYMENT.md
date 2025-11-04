# Netlify Deployment Guide

This guide covers deploying the frontend to Netlify at `aas.netlify.app`.

## ⚠️ Important: Backend Deployment Required

The backend (Node.js + ImageBind) **must be deployed separately** to a platform that supports Docker or long-running processes. Netlify only hosts static frontends.

**Recommended backend platforms:**
- Railway.app (easiest)
- Render.com (free tier available)
- Fly.io
- AWS, GCP, Azure

## 🚀 Deploying Frontend to Netlify

### Option 1: Netlify CLI (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and deploy:**
   ```bash
   cd client
   netlify init
   # Follow prompts to create new site or link existing
   # Site name: aas
   # Build command: npm run build
   # Publish directory: build
   ```

4. **Set environment variables:**
   ```bash
   netlify env:set REACT_APP_API_URL https://your-backend-url.com
   netlify env:set REACT_APP_SOCKET_URL https://your-backend-url.com
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option 2: GitHub Integration (Recommended for CI/CD)

1. **Push code to GitHub** (already done)

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect to your GitHub repository
   - Select repository: `AGRI-ACOUSTIC-SENTINEL`

3. **Configure build settings:**
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/build`
   - **Branch to deploy:** `main` or `master`

4. **Set environment variables:**
   - Go to Site settings > Environment variables
   - Add:
     - `REACT_APP_API_URL` = `https://your-backend-url.com`
     - `REACT_APP_SOCKET_URL` = `https://your-backend-url.com`
   - Replace `your-backend-url.com` with your actual backend deployment URL

5. **Deploy:**
   - Netlify will automatically deploy on every push to the main branch
   - Or trigger manually from the Deploys tab

### Option 3: Netlify Drop (Manual)

1. **Build locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Go to Netlify Drop:**
   - Visit [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop the `client/build` folder

## 🔧 Backend Deployment (Required)

Before deploying the frontend, you **must** deploy the backend first. Here are quick options:

### Railway.app (Recommended - Easiest)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure:**
   - Railway will auto-detect Dockerfile
   - Set environment variables if needed
   - Railway will provide a URL like `https://your-app.up.railway.app`

4. **Update Netlify environment variables:**
   - `REACT_APP_API_URL` = `https://your-app.up.railway.app`
   - `REACT_APP_SOCKET_URL` = `https://your-app.up.railway.app`

### Render.com (Free Tier Available)

1. **Sign up at [render.com](https://render.com)**

2. **Create new Web Service:**
   - Connect GitHub repository
   - Select "Docker"
   - Build command: `docker build -t agri-sentinel .`
   - Start command: `docker run -p $PORT:5000 agri-sentinel`

3. **Environment variables:**
   - Render will provide a URL like `https://your-app.onrender.com`

4. **Update Netlify environment variables** with Render URL

## 📝 Post-Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend health check endpoint works: `https://your-backend.com/api/health`
- [ ] Netlify environment variables are set correctly
- [ ] Frontend builds successfully on Netlify
- [ ] Frontend connects to backend API
- [ ] Socket.IO connections work (check browser console)
- [ ] CORS is configured on backend (if needed)

## 🔍 Troubleshooting

### Frontend can't connect to backend

1. **Check environment variables:**
   - Go to Netlify Dashboard > Site settings > Environment variables
   - Verify `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` are set
   - **Redeploy** after changing environment variables

2. **Check CORS on backend:**
   - Backend must allow requests from `https://aas.netlify.app`
   - Update CORS settings in `server/index.js`:
     ```javascript
     app.use(cors({
       origin: ['https://aas.netlify.app', 'http://localhost:3000']
     }));
     ```

3. **Check browser console:**
   - Look for CORS errors
   - Check network tab for failed requests

### Socket.IO not connecting

1. **Verify Socket.IO URL:**
   - Check browser console for connection errors
   - Ensure backend URL is correct

2. **Backend Socket.IO configuration:**
   - Ensure Socket.IO CORS is configured:
     ```javascript
     const io = socketIo(server, {
       cors: {
         origin: ['https://aas.netlify.app', 'http://localhost:3000'],
         methods: ["GET", "POST"]
       }
     });
     ```

### Build fails on Netlify

1. **Check build logs:**
   - Go to Deploys > Click on failed build > View logs

2. **Common issues:**
   - Missing dependencies: Check `package.json`
   - Node version: Set `NODE_VERSION=18` in environment variables
   - Build timeout: Increase timeout in Netlify settings

## 🌐 Custom Domain

To use `aas.netlify.app`:

1. **Set custom domain in Netlify:**
   - Go to Site settings > Domain management
   - Add custom domain: `aas.netlify.app`
   - Follow DNS configuration instructions

2. **Update backend CORS:**
   - Add `https://aas.netlify.app` to allowed origins

## 📊 Monitoring

- **Netlify Analytics:** View site traffic and performance
- **Backend Logs:** Check your backend platform's logs
- **Error Tracking:** Consider adding Sentry or similar

## 🔄 Continuous Deployment

With GitHub integration:
- Every push to `main` branch automatically triggers a new deployment
- Netlify will rebuild and deploy the frontend
- Ensure backend is also updated if needed

