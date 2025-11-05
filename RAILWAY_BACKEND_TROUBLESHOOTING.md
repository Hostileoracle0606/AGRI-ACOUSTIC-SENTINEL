# Railway Backend Troubleshooting Guide

## Issue: Backend Not Launching

If the backend URL doesn't respond, follow these steps:

## 🔍 Step 1: Check Railway Deployment Status

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Navigate to your project
   - Click on your service

2. **Check Deployment Status:**
   - Look at the "Deployments" tab
   - Is the latest deployment successful (green) or failed (red)?
   - If failed, check the build logs

3. **Check Service Status:**
   - Is the service "Running" or "Stopped"?
   - If stopped, click "Start" to restart it

## 🔍 Step 2: Check Railway Logs

1. **View Logs:**
   - Go to Railway dashboard → Your service
   - Click on "Logs" tab
   - Look for error messages

2. **Common Log Errors:**
   - `Error: Cannot find module` → Missing dependencies
   - `Port already in use` → Port conflict
   - `EADDRINUSE` → Port conflict
   - `Cannot connect to database` → Database connection issue
   - `ImageBind not found` → Python/ImageBind setup issue

## 🔍 Step 3: Verify Environment Variables

1. **Check PORT Variable:**
   - Railway automatically sets `PORT` environment variable
   - Your code should use: `process.env.PORT || 5000`
   - Verify this is set correctly

2. **Check Required Variables:**
   - `NODE_ENV` = `production` (optional but recommended)
   - `PYTHONUNBUFFERED` = `1` (for Python logging)
   - `IMAGEBIND_PATH` = `/app/ImageBind` (optional, defaults work)
   - `PYTHON_PATH` = `/usr/bin/python3` (optional, defaults work)

## 🔍 Step 4: Test Health Endpoint

1. **Test Backend Health:**
   - Visit: `https://web-production-653fa.up.railway.app/api/health`
   - Should return: `{"status":"healthy","timestamp":"...","uptime":...}`
   - If it doesn't work, the server isn't running

2. **Test Root Endpoint:**
   - Visit: `https://web-production-653fa.up.railway.app/`
   - Should return something (even if it's an error, it means server is running)

## 🔍 Step 5: Check Build Configuration

1. **Verify Dockerfile:**
   - Railway should use the Dockerfile
   - Check that Dockerfile exists in root directory
   - Verify CMD is correct: `CMD ["node", "index.js"]`

2. **Check railway.json:**
   - Should specify `DOCKERFILE` as builder
   - Should not have invalid startCommand

## 🔧 Common Fixes

### Fix 1: Restart the Service
1. Go to Railway dashboard
2. Click on your service
3. Click "Restart" or "Deploy" button
4. Wait for deployment to complete

### Fix 2: Check Port Configuration
Make sure your server code uses:
```javascript
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

The `'0.0.0.0'` ensures it listens on all interfaces (required for Railway).

### Fix 3: Check for Startup Errors
Look in Railway logs for:
- Syntax errors in JavaScript
- Missing dependencies
- Import/module errors
- Database connection errors

### Fix 4: Verify Dependencies
Railway should install dependencies automatically via Dockerfile, but check logs for:
- `npm install` failures
- Missing packages
- Version conflicts

### Fix 5: Check ImageBind Setup
If ImageBind is causing issues:
- Check if Python dependencies install correctly
- Verify ImageBind path is correct
- Check if model files download successfully

## 🚨 Emergency Fixes

### Force Redeploy
1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" → "Deployments"
4. Click "Redeploy" on latest deployment

### Clear Build Cache
1. Railway dashboard → Your service
2. Settings → Clear cache
3. Redeploy

### Check Resource Limits
1. Railway dashboard → Your service
2. Check if you're hitting memory/CPU limits
3. Upgrade plan if needed

## 📝 Debugging Steps

1. **Check if server starts locally:**
   ```bash
   cd server
   npm install
   node index.js
   ```
   If it works locally but not on Railway, it's a deployment issue.

2. **Check Railway build logs:**
   - Look for errors during Docker build
   - Check if all dependencies install
   - Verify ImageBind setup

3. **Test with minimal code:**
   - Create a simple test server to verify Railway works
   - Then gradually add complexity

## 🆘 Still Not Working?

1. **Share Railway Logs:**
   - Copy the error messages from Railway logs
   - Look for the first error (usually the root cause)

2. **Check Railway Status:**
   - Visit Railway status page
   - Check if there are platform issues

3. **Verify URLs:**
   - Make sure you're using the correct Railway URL
   - Check if the URL changed after redeployment

4. **Check Network:**
   - Try accessing from different network
   - Check if firewall is blocking

## ✅ Quick Health Check

Run these tests:

1. **Backend Health:**
   ```bash
   curl https://web-production-653fa.up.railway.app/api/health
   ```
   Should return JSON with status.

2. **Check if service is running:**
   - Railway dashboard shows service status
   - Logs show server starting message

3. **Verify port:**
   - Railway automatically assigns and exposes port
   - Your code should use `process.env.PORT`

---

**Need more help?** Share the exact error message from Railway logs!

