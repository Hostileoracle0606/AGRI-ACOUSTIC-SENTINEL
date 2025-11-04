# 🚀 Quick Start: Deploy Both Services

## ⚡ 5-Minute Deployment Guide

### Step 1: Deploy Backend (Railway - Easiest)

1. **Go to [railway.app](https://railway.app)** → Sign up with GitHub

2. **New Project** → **Deploy from GitHub repo**
   - Select: `AGRI-ACOUSTIC-SENTINEL`
   - Click "Deploy Now"

3. **Wait 10-15 minutes** for build to complete

4. **Copy your backend URL** from Railway dashboard
   - Example: `https://your-app.up.railway.app`

---

### Step 2: Deploy Frontend (Netlify)

1. **Go to [app.netlify.com](https://app.netlify.com)** → Sign up with GitHub

2. **Add new site** → **Import from GitHub**
   - Select: `AGRI-ACOUSTIC-SENTINEL`

3. **Build settings:**
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `client/build`

4. **Environment variables** (Site settings → Environment variables):
   - `REACT_APP_API_URL` = `[Your Railway URL from Step 1]`
   - `REACT_APP_SOCKET_URL` = `[Your Railway URL from Step 1]`

5. **Change site name to:** `aas`
   - Your site: `https://aas.netlify.app`

6. **Deploy!** (Takes 3-5 minutes)

---

### Step 3: Connect Them

1. **Go back to Railway** (your backend)

2. **Add environment variables:**
   - `FRONTEND_URL` = `https://aas.netlify.app`
   - `NETLIFY_URL` = `https://aas.netlify.app`

3. **Backend will auto-restart** (or manually redeploy)

---

## ✅ Done!

- **Frontend:** https://aas.netlify.app
- **Backend:** https://your-app.up.railway.app

**Test it:**
- Visit https://aas.netlify.app
- Check browser console for "Connected to server"
- Try uploading an audio file

---

## 📚 Need More Help?

- **Detailed guide:** [DEPLOY_BOTH.md](./DEPLOY_BOTH.md)
- **Backend only:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Frontend only:** [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

## 🔧 Troubleshooting

**CORS errors?**
- Make sure backend has `FRONTEND_URL` environment variable set
- Check backend URL in Netlify env vars is correct

**Socket.IO not connecting?**
- Verify `REACT_APP_SOCKET_URL` is set in Netlify
- Check browser console for connection errors

**Build fails?**
- Check build logs in Railway/Netlify
- Verify Node version is 18
- Ensure all dependencies are in package.json

