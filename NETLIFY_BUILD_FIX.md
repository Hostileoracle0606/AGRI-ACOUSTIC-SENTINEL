# Netlify Build Fix Guide

## Common Build Issues and Solutions

### Issue 1: Build Command Not Found
**Error:** `npm: command not found` or build fails

**Solution:**
- Ensure Netlify is using Node 18
- In Netlify dashboard → Site settings → Build & deploy → Environment
- Set `NODE_VERSION = 18` (or add to netlify.toml)

### Issue 2: Missing Dependencies
**Error:** `Cannot find module` or dependency errors

**Solution:**
- Make sure all dependencies are in `package.json` (not just devDependencies)
- Check that `package-lock.json` is committed

### Issue 3: Build Timeout
**Error:** Build times out after X minutes

**Solution:**
- Increase build timeout in Netlify settings
- Or optimize build (remove unnecessary dependencies)

### Issue 4: Tailwind/PostCSS Errors
**Error:** `PostCSS`, `Tailwind`, or CSS processing errors

**Solution:**
- Ensure `tailwind.config.js` exists
- Ensure `postcss.config.js` exists
- Check that `index.css` imports Tailwind directives

### Issue 5: Environment Variables Not Set
**Error:** Build succeeds but app doesn't work (API calls fail)

**Solution:**
- Set environment variables in Netlify dashboard:
  - `REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
  - `REACT_APP_SOCKET_URL` = `https://web-production-653fa.up.railway.app`
- **Important:** Redeploy after adding environment variables

### Issue 6: Build Script Issues
**Error:** Build command fails

**Solution:**
- Verify build command: `npm install && npm run build`
- Check that `react-scripts build` works locally first

## Quick Fix Steps

1. **Check Netlify Build Logs:**
   - Go to Netlify dashboard → Deploys → Click on failed build
   - Read the error message carefully

2. **Verify Build Settings:**
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `client/build`
   - Node version: 18

3. **Test Build Locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```
   If this fails locally, fix local issues first

4. **Check Environment Variables:**
   - Site settings → Environment variables
   - Must include `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL`
   - Redeploy after adding variables

5. **Clear Build Cache:**
   - Netlify dashboard → Deploys → Clear cache and retry deploy

## Updated Netlify Configuration

If build still fails, try these settings in Netlify dashboard:

**Build settings:**
- Base directory: `client`
- Build command: `CI=false npm install && npm run build`
- Publish directory: `client/build`

**Environment variables:**
- `NODE_VERSION` = `18`
- `REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
- `REACT_APP_SOCKET_URL` = `https://web-production-653fa.up.railway.app`
- `CI` = `false` (to prevent build warnings from failing)

## Alternative: Manual Build Upload

If automated build keeps failing:

1. **Build locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Upload to Netlify:**
   - Go to Netlify Drop: https://app.netlify.com/drop
   - Drag and drop the `client/build` folder
   - Set environment variables in site settings

---

**Need help?** Share the exact error message from Netlify build logs!

