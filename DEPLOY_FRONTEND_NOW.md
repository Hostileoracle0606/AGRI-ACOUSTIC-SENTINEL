# 🚀 Deploy Frontend to Netlify - Next Steps

Your backend is deployed! Now let's deploy the frontend.

## Step 1: Your Backend URL

✅ **Your Railway Backend URL:** `https://web-production-653fa.up.railway.app`

**Test it:** Visit `https://web-production-653fa.up.railway.app/api/health` - should return `{"status":"healthy",...}`

## Step 2: Deploy Frontend to Netlify

### Option A: Netlify Dashboard (Easiest)

1. **Go to [app.netlify.com](https://app.netlify.com)**
   - Sign up/Login with GitHub

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
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
   - Click "Add variable" for each:
     - **Key:** `REACT_APP_API_URL`
       **Value:** `https://web-production-653fa.up.railway.app`
     - **Key:** `REACT_APP_SOCKET_URL`  
       **Value:** `https://web-production-653fa.up.railway.app`

5. **Change Site Name:**
   - Go to "Site settings" → "General"
   - Change site name to: `aas`
   - Your site will be at: `https://aas.netlify.app`

6. **Deploy:**
   - Click "Deploy site"
   - Wait 3-5 minutes for build

### Option B: Netlify CLI

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login
netlify login

# Navigate to client directory
cd client

# Initialize (first time only)
netlify init
# When prompted:
# - Create & configure a new site: Yes
# - Site name: aas
# - Build command: npm run build
# - Directory to deploy: build

# Set environment variables (using your Railway URL)
netlify env:set REACT_APP_API_URL https://web-production-653fa.up.railway.app
netlify env:set REACT_APP_SOCKET_URL https://web-production-653fa.up.railway.app

# Deploy
netlify deploy --prod
```

## Step 3: Update Backend CORS

After frontend is deployed, update backend to allow Netlify:

1. **Go back to Railway dashboard**
   - Click on your service
   - Go to "Variables" tab

2. **Add Environment Variables:**
   - Click "New Variable"
   - Add:
     - **Name:** `FRONTEND_URL`
       **Value:** `https://aas.netlify.app`
   - Add:
     - **Name:** `NETLIFY_URL`
       **Value:** `https://aas.netlify.app`

3. **Backend will auto-restart** with new CORS settings

## Step 4: Test Everything

1. **Frontend:** Visit `https://aas.netlify.app`
2. **Backend Health:** Visit `https://web-production-653fa.up.railway.app/api/health`
3. **Check Browser Console:** Should see "Connected to server"
4. **Test Features:** Try uploading an audio file

## ✅ Verification Checklist

- [ ] Frontend loads at `https://aas.netlify.app`
- [ ] Browser console shows "Connected to server"
- [ ] No CORS errors in browser console
- [ ] Can see dashboard with demo data
- [ ] Can upload audio files (test feature)

## 🔧 Troubleshooting

### CORS Errors
- Verify backend has `FRONTEND_URL` environment variable set
- Check backend URL in Netlify env vars is correct
- Ensure backend URL starts with `https://`

### Socket.IO Not Connecting
- Check `REACT_APP_SOCKET_URL` is set correctly in Netlify
- Verify backend Socket.IO CORS allows Netlify domain
- Check browser console for connection errors

### Build Fails on Netlify
- Check Netlify build logs
- Verify Node version is 18
- Ensure all dependencies are in package.json

---

**You're almost done!** Once both are connected, your full-stack application will be live! 🎉

