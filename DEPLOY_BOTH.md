# Deploy Both Backend and Frontend

This guide will help you deploy both the backend (with ImageBind) and frontend (to Netlify) in the correct order.

## 🎯 Deployment Order

1. **Backend First** (Railway/Render) - Takes 10-15 minutes
2. **Frontend Second** (Netlify) - Takes 5 minutes

---

## 📦 Part 1: Deploy Backend

### Option A: Railway.app (Recommended - Easiest)

1. **Sign up/Login:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (easiest)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Find and select `AGRI-ACOUSTIC-SENTINEL`
   - Click "Deploy Now"

3. **Configure:**
   - Railway will auto-detect the Dockerfile
   - Wait for build to complete (10-15 minutes first time)
   - The build will:
     - Clone ImageBind repository
     - Install Python dependencies
     - Install Node.js dependencies
     - Build the Docker image

4. **Get Your Backend URL:**
   - Once deployed, click on your service
   - Go to "Settings" > "Networking"
   - Copy the "Public Domain" (e.g., `agri-acoustic-sentinel-production.up.railway.app`)
   - Or generate a custom domain

5. **Set Environment Variables (Optional):**
   - Go to "Variables" tab
   - Add:
     - `FRONTEND_URL` = `https://aas.netlify.app` (will set after frontend deploy)
     - `NETLIFY_URL` = `https://aas.netlify.app` (will set after frontend deploy)

6. **Test Backend:**
   - Visit: `https://your-backend-url.com/api/health`
   - Should return: `{"status":"healthy",...}`

### Option B: Render.com (Free Tier Available)

1. **Sign up/Login:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service:**
   - Click "New" > "Web Service"
   - Connect GitHub repository: `AGRI-ACOUSTIC-SENTINEL`
   - Configure:
     - **Name:** `agri-acoustic-sentinel-backend`
     - **Region:** Choose closest to you
     - **Branch:** `main`
     - **Root Directory:** (leave empty)
     - **Runtime:** Docker
     - **Dockerfile Path:** `Dockerfile`
     - **Docker Context:** `.` (root)
     - **Plan:** Free (or Starter for better performance)

3. **Environment Variables:**
   - Add:
     - `NODE_ENV` = `production`
     - `PORT` = `5000`
     - `PYTHONUNBUFFERED` = `1`
     - `IMAGEBIND_PATH` = `/app/ImageBind`
     - `PYTHON_PATH` = `/usr/bin/python3`

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build (15-20 minutes first time)
   - Render will provide a URL like: `https://agri-acoustic-sentinel-backend.onrender.com`

5. **Test Backend:**
   - Visit: `https://your-backend-url.onrender.com/api/health`

---

## 🌐 Part 2: Deploy Frontend to Netlify

### Step 1: Deploy via Netlify Dashboard

1. **Go to Netlify:**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign up/Login with GitHub

2. **Import Project:**
   - Click "Add new site" > "Import an existing project"
   - Click "Deploy with GitHub"
   - Authorize Netlify
   - Select repository: `AGRI-ACOUSTIC-SENTINEL`

3. **Configure Build Settings:**
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/build`
   - **Branch to deploy:** `main`

4. **Set Environment Variables:**
   - Click "Show advanced" or go to Site settings after deployment
   - Go to "Environment variables"
   - Add:
     - `REACT_APP_API_URL` = `https://your-backend-url.com` (from Railway/Render)
     - `REACT_APP_SOCKET_URL` = `https://your-backend-url.com` (same as above)
   - **Important:** Replace `your-backend-url.com` with your actual backend URL

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build (3-5 minutes)

6. **Set Site Name:**
   - Go to Site settings > General
   - Change site name to: `aas`
   - Your site will be at: `https://aas.netlify.app`

### Step 2: Update Backend CORS

After frontend is deployed, update backend to allow Netlify:

1. **Go to your backend platform** (Railway/Render)

2. **Add Environment Variables:**
   - `FRONTEND_URL` = `https://aas.netlify.app`
   - `NETLIFY_URL` = `https://aas.netlify.app`

3. **Redeploy backend** (or it will auto-restart)

---

## ✅ Verification Checklist

- [ ] Backend health check works: `https://your-backend.com/api/health`
- [ ] Frontend loads: `https://aas.netlify.app`
- [ ] Browser console shows "Connected to server"
- [ ] No CORS errors in browser console
- [ ] Can upload audio files (test feature)
- [ ] Socket.IO connection established

---

## 🔧 Troubleshooting

### Backend Issues

**Build fails:**
- Check Docker build logs
- Ensure Dockerfile is correct
- Verify ImageBind setup in Dockerfile

**ImageBind not working:**
- Check Python version (should be 3.10+)
- Verify ImageBind path in logs
- Check environment variables

**Out of memory:**
- Upgrade to larger instance (Railway Pro, Render Standard)
- Reduce concurrent requests

### Frontend Issues

**CORS errors:**
- Verify backend has `FRONTEND_URL` environment variable
- Check backend CORS configuration
- Ensure backend URL in Netlify env vars is correct

**Socket.IO not connecting:**
- Check `REACT_APP_SOCKET_URL` environment variable
- Verify backend Socket.IO CORS allows Netlify domain
- Check browser console for connection errors

**Build fails:**
- Check Netlify build logs
- Verify Node version (should be 18)
- Ensure all dependencies are installed

---

## 📊 Monitoring

### Backend Monitoring
- **Railway:** Check "Metrics" tab for CPU/Memory usage
- **Render:** Check "Metrics" tab for resource usage
- **Logs:** View logs in both platforms for errors

### Frontend Monitoring
- **Netlify Analytics:** View site traffic and performance
- **Browser Console:** Check for JavaScript errors
- **Network Tab:** Monitor API requests

---

## 🔄 Updating Deployments

### Update Backend
- Push to GitHub → Railway/Render auto-deploys
- Or manually trigger redeploy

### Update Frontend
- Push to GitHub → Netlify auto-deploys
- Or trigger redeploy from Netlify dashboard

---

## 💰 Cost Estimates

### Free Tier Options:
- **Railway:** $5/month free credit (enough for testing)
- **Render:** Free tier available (slower, may sleep after inactivity)
- **Netlify:** Free tier (100GB bandwidth/month)

### Production Recommendations:
- **Backend:** Railway Starter ($5/month) or Render Standard ($7/month)
- **Frontend:** Netlify Pro ($19/month) for better performance

---

## 🎉 Success!

Once both are deployed:
- Frontend: `https://aas.netlify.app`
- Backend: `https://your-backend-url.com`
- Both communicate via environment variables
- ImageBind runs in backend container
- All features should work!

