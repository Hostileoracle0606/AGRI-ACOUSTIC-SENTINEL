# Railway Environment Variables Guide

## Required Environment Variables for Railway Backend

### Essential Variables (Auto-set by Railway)

1. **`PORT`** ✅
   - **Auto-set by Railway** - You don't need to set this
   - Railway automatically assigns a port and sets this variable
   - Your code uses: `process.env.PORT || 5000`
   - **Status:** Railway handles this automatically

### Optional but Recommended Variables

2. **`NODE_ENV`**
   - **Value:** `production`
   - **Purpose:** Sets Node.js environment to production mode
   - **Status:** Optional but recommended
   - **Note:** Already set in Dockerfile as `ENV NODE_ENV=production`

3. **`PYTHONUNBUFFERED`**
   - **Value:** `1`
   - **Purpose:** Ensures Python output is unbuffered (important for logging)
   - **Status:** Already set in Dockerfile
   - **Note:** Helps with ImageBind Python script logging

4. **`IMAGEBIND_PATH`**
   - **Value:** `/app/ImageBind`
   - **Purpose:** Path to ImageBind installation in Docker container
   - **Status:** Already set in Dockerfile
   - **Note:** Only needed if you want to override the default path

5. **`PYTHON_PATH`**
   - **Value:** `/usr/bin/python3`
   - **Purpose:** Path to Python executable in Docker container
   - **Status:** Already set in Dockerfile
   - **Note:** Only needed if you want to override the default path

### Optional Frontend URL Variables (For CORS)

6. **`FRONTEND_URL`** (Optional)
   - **Value:** `https://your-netlify-url.netlify.app`
   - **Purpose:** Allows specific frontend URL in CORS (if you want to restrict)
   - **Status:** **NOT REQUIRED** - Backend accepts any `*.netlify.app` automatically
   - **Note:** The backend is configured to accept any Netlify subdomain, so this is optional

7. **`NETLIFY_URL`** (Optional)
   - **Value:** `https://your-netlify-url.netlify.app`
   - **Purpose:** Same as FRONTEND_URL (for backward compatibility)
   - **Status:** **NOT REQUIRED** - Backend accepts any `*.netlify.app` automatically
   - **Note:** Optional, only needed if you want to explicitly allow a specific URL

### Optional API Keys (Not Required for Current Version)

8. **`REPLICATE_API_TOKEN`** (Optional - Not Used)
   - **Value:** Your Replicate API token
   - **Purpose:** Was used for Replicate API (now using local ImageBind)
   - **Status:** **NOT REQUIRED** - Current version uses local ImageBind
   - **Note:** This is not needed since we're using local ImageBind instead of Replicate API

## What You Need to Set in Railway

### Minimum Configuration (Recommended)

**You don't need to set any environment variables!**

The Dockerfile already sets:
- `NODE_ENV=production`
- `PYTHONUNBUFFERED=1`
- `IMAGEBIND_PATH=/app/ImageBind`
- `PYTHON_PATH=/usr/bin/python3`

Railway automatically sets:
- `PORT` (automatically assigned)

The backend automatically accepts:
- Any `*.netlify.app` domain (CORS configured)

### Optional: If You Want to Restrict CORS

If you want to explicitly allow a specific frontend URL:

1. Go to Railway dashboard → Your service → Variables tab
2. Add:
   - `FRONTEND_URL` = `https://your-netlify-url.netlify.app`
   - `NETLIFY_URL` = `https://your-netlify-url.netlify.app`

**But this is NOT required** - the backend accepts any Netlify subdomain automatically.

## Summary

### Required: Nothing!
Railway handles everything automatically.

### Optional: Only if you want to restrict CORS
- `FRONTEND_URL` = Your Netlify URL
- `NETLIFY_URL` = Your Netlify URL

## Current Configuration Status

✅ **PORT** - Auto-set by Railway  
✅ **NODE_ENV** - Set in Dockerfile  
✅ **PYTHONUNBUFFERED** - Set in Dockerfile  
✅ **IMAGEBIND_PATH** - Set in Dockerfile  
✅ **PYTHON_PATH** - Set in Dockerfile  
✅ **CORS** - Configured to accept any `*.netlify.app`  

## Verification

To check if Railway is setting variables correctly:

1. Go to Railway dashboard → Your service → Logs
2. Look for startup messages that show:
   - `Server running on port X` (should show Railway-assigned port)
   - `Environment: production` (if NODE_ENV is set)

## Troubleshooting

### If Backend Doesn't Start:

1. **Check Railway Logs:**
   - Look for error messages
   - Check if PORT is being used correctly

2. **Verify Dockerfile Environment Variables:**
   - They're set in the Dockerfile, so they should be available
   - No need to set them again in Railway

3. **Check Port Binding:**
   - Server should listen on `0.0.0.0` (already configured)
   - Railway automatically sets PORT

---

**Bottom Line:** You don't need to set any environment variables in Railway! Everything is configured in the Dockerfile and handled automatically.




