# 🔧 Fix Frontend Connection Issues

## Problem Identified

Your frontend is trying to connect to:
- ❌ `https://aasentinel.netlify.app` (Netlify URL - wrong!)
- ❌ `http://ww25.your-backend-url.com` (placeholder URL - wrong!)

It should connect to:
- ✅ `https://web-production-653fa.up.railway.app` (Railway backend)

## Root Cause

The environment variables `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` are **NOT SET** in Netlify, so the frontend defaults to using `window.location.origin` (your Netlify URL).

## ✅ Solution: Set Environment Variables in Netlify

### Step 1: Go to Netlify Dashboard

1. Visit [app.netlify.com](https://app.netlify.com)
2. Click on your site: `aasentinel` (or your site name)
3. Go to **Site settings** → **Environment variables**

### Step 2: Add Environment Variables

Click **"Add variable"** and add these **TWO** variables:

**Variable 1:**
- **Key:** `REACT_APP_API_URL`
- **Value:** `https://web-production-653fa.up.railway.app`
- **Scopes:** All scopes (or Production)

**Variable 2:**
- **Key:** `REACT_APP_SOCKET_URL`
- **Value:** `https://web-production-653fa.up.railway.app`
- **Scopes:** All scopes (or Production)

### Step 3: Redeploy Frontend

**IMPORTANT:** After adding environment variables, you **MUST** redeploy:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 3-5 minutes for rebuild

**OR** if you have GitHub connected:
- Just push any change to trigger auto-deploy
- Or manually trigger redeploy from Netlify

## Why This Fixes It

Before (without env vars):
- Frontend uses: `window.location.origin` = `https://aasentinel.netlify.app`
- Tries to connect to Netlify (wrong!)
- Gets "Failed to fetch" errors

After (with env vars):
- Frontend uses: `process.env.REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
- Connects to Railway backend (correct!)
- Everything works!

## Verification

After redeploying:

1. **Visit your Netlify site:** `https://aasentinel.netlify.app`
2. **Open browser console (F12):**
   - Should see: `"Connected to server"` ✅
   - Should NOT see: `"Failed to fetch"` ❌
   - Should NOT see: `"your-backend-url.com"` ❌

3. **Check Network tab:**
   - API requests should go to: `web-production-653fa.up.railway.app`
   - NOT to: `aasentinel.netlify.app`

## Common Mistakes

❌ **Wrong:** Setting variables but not redeploying
- Variables are only available at **build time** in React
- Must redeploy after adding/changing variables

❌ **Wrong:** Using wrong variable names
- Must be: `REACT_APP_API_URL` (with `REACT_APP_` prefix!)
- Must be: `REACT_APP_SOCKET_URL` (with `REACT_APP_` prefix!)

❌ **Wrong:** Using HTTP instead of HTTPS
- Must use: `https://web-production-653fa.up.railway.app`
- NOT: `http://web-production-653fa.up.railway.app`

❌ **Wrong:** Adding trailing slash
- Must be: `https://web-production-653fa.up.railway.app`
- NOT: `https://web-production-653fa.up.railway.app/`

## Quick Checklist

- [ ] Go to Netlify dashboard
- [ ] Site settings → Environment variables
- [ ] Add `REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
- [ ] Add `REACT_APP_SOCKET_URL` = `https://web-production-653fa.up.railway.app`
- [ ] Redeploy site (IMPORTANT!)
- [ ] Wait for build to complete
- [ ] Test site - should connect to backend!

---

**After setting these and redeploying, your frontend will connect to the Railway backend correctly!** 🎉




