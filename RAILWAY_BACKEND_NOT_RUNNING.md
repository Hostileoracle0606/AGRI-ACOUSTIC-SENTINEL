# Backend Not Running - Troubleshooting Guide

## Immediate Steps to Diagnose

### Step 1: Check Railway Service Status

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Navigate to your project
   - Click on your service

2. **Check Service Status:**
   - Is the service status "Running" or "Stopped"?
   - If "Stopped", click the "Start" button
   - If "Running" but not working, check logs

### Step 2: Check Railway Logs

1. **View Logs:**
   - Railway dashboard → Your service → "Logs" tab
   - Look for:
     - ✅ `Agri-Acoustic Sentinel server running on port X` → Server started
     - ❌ Error messages → Server failed to start
     - ❌ `Cannot find module` → Missing dependency
     - ❌ `EADDRINUSE` → Port conflict
     - ❌ `SyntaxError` → Code error

2. **Share the logs:**
   - Copy the last 20-30 lines of logs
   - Look for the first error message (usually the root cause)

### Step 3: Check Deployment Status

1. **Go to Deployments Tab:**
   - Railway dashboard → Your service → "Deployments"
   - Check if latest deployment is:
     - ✅ Green (Success) → Deployment succeeded
     - ❌ Red (Failed) → Build failed
     - ⚠️ Yellow (Building) → Still building

2. **If Build Failed:**
   - Click on the failed deployment
   - Check build logs for errors
   - Common issues:
     - Docker build failed
     - Missing dependencies
     - ImageBind setup failed

### Step 4: Test Health Endpoint

Try accessing:
```
https://web-production-653fa.up.railway.app/api/health
```

- **If it works:** Backend IS running, but might have other issues
- **If it doesn't work:** Backend is not running or not accessible

## Common Issues and Fixes

### Issue 1: Service Stopped

**Symptoms:**
- Service status shows "Stopped"
- No logs appearing

**Fix:**
1. Railway dashboard → Your service
2. Click "Start" button
3. Wait for service to start (30-60 seconds)

### Issue 2: Build Failed

**Symptoms:**
- Latest deployment shows red (failed)
- Build logs show errors

**Fix:**
1. Check build logs for specific error
2. Common fixes:
   - **Docker build timeout:** Upgrade Railway plan or optimize Dockerfile
   - **ImageBind download failed:** Check network in build logs
   - **Dependencies failed:** Check package.json issues

### Issue 3: Server Crashes on Startup

**Symptoms:**
- Service starts then immediately stops
- Logs show error then service stops

**Fix:**
1. Check logs for the error message
2. Common causes:
   - Missing environment variable (unlikely, but check)
   - Port binding issue (already fixed, but verify)
   - Module import error
   - ImageBind initialization error

### Issue 4: Port Binding Issue

**Symptoms:**
- Logs show port errors
- Service can't bind to port

**Fix:**
- Already fixed in code (listening on 0.0.0.0)
- Verify Railway is setting PORT correctly
- Check if service is using Railway-assigned port

### Issue 5: ImageBind Initialization Error

**Symptoms:**
- Logs show Python/ImageBind errors
- Server might start but fail during ImageBind setup

**Fix:**
- ImageBind errors shouldn't prevent server from starting
- Check if error is in initialization vs. runtime
- Server should still start even if ImageBind has issues

## Quick Fixes to Try

### Fix 1: Restart Service
1. Railway dashboard → Your service
2. Click "Restart" or stop then start
3. Wait 1-2 minutes

### Fix 2: Force Redeploy
1. Railway dashboard → Your service
2. Go to "Settings" → "Deployments"
3. Click "Redeploy" on latest deployment
4. Wait for build to complete (10-15 minutes)

### Fix 3: Check Resource Limits
1. Railway dashboard → Your service
2. Check if hitting memory/CPU limits
3. Upgrade plan if needed

### Fix 4: Clear Build Cache
1. Railway dashboard → Your service
2. Settings → Clear cache
3. Redeploy

## Diagnostic Commands (For Railway CLI)

If you have Railway CLI installed:

```bash
railway logs
railway status
railway restart
```

## What Information to Share

If backend still won't start, share:

1. **Service Status:**
   - Running/Stopped?
   - Latest deployment status?

2. **Logs:**
   - Last 20-30 lines of Railway logs
   - First error message you see

3. **Deployment Status:**
   - Latest deployment successful or failed?
   - Build logs if failed

4. **Health Endpoint:**
   - Does `https://web-production-653fa.up.railway.app/api/health` work?
   - What error do you get?

## Emergency: Start Fresh Deployment

If nothing works:

1. **Check Railway Status:**
   - Visit Railway status page
   - Check for platform issues

2. **Verify Repository:**
   - Ensure latest code is pushed to GitHub
   - Check if Railway is connected to correct branch

3. **Redeploy from Scratch:**
   - Railway dashboard → Your service → Settings
   - Disconnect and reconnect GitHub (if needed)
   - Trigger new deployment

## Next Steps

1. **First:** Check Railway logs and share the error message
2. **Second:** Verify service status (Running/Stopped)
3. **Third:** Check deployment status (Success/Failed)
4. **Fourth:** Test health endpoint

Once we see the actual error from Railway logs, we can fix it specifically!




