# Deploy with Default URLs

This guide explains how to deploy using default auto-generated URLs from both platforms.

## 🌐 Default URLs

### Railway (Backend)
- **Default URL:** Railway auto-generates a URL like `web-production-653fa.up.railway.app`
- **Your current URL:** `https://web-production-653fa.up.railway.app`
- No custom domain needed - works out of the box!

### Netlify (Frontend)
- **Default URL:** Netlify auto-generates a URL like `random-name-123.netlify.app`
- **Example:** `https://agri-acoustic-sentinel-123.netlify.app`
- You can find it in Netlify dashboard after deployment

## ✅ Configuration

### Backend CORS (Already Updated!)

The backend has been configured to accept **any** Netlify subdomain (`*.netlify.app`), so you don't need to set specific environment variables for the frontend URL.

**What this means:**
- Any Netlify deployment will work automatically
- No need to update Railway variables when Netlify URL changes
- Works with auto-generated URLs and custom domains

### Frontend Environment Variables

Set these in **Netlify dashboard** → Site settings → Environment variables:

- `REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
- `REACT_APP_SOCKET_URL` = `https://web-production-653fa.up.railway.app`

**Important:** Use your actual Railway backend URL (the one you have).

## 🚀 Quick Deployment Steps

1. **Backend is already deployed** ✅
   - URL: `https://web-production-653fa.up.railway.app`

2. **Frontend is already deployed** ✅
   - Check Netlify dashboard for your auto-generated URL
   - Example: `https://random-name-123.netlify.app`

3. **Set Environment Variables in Netlify:**
   - Go to Netlify dashboard → Your site → Site settings → Environment variables
   - Add:
     - `REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
     - `REACT_APP_SOCKET_URL` = `https://web-production-653fa.up.railway.app`
   - **Redeploy** after adding variables

4. **Test Connection:**
   - Visit your Netlify URL
   - Open browser console (F12)
   - Should see "Connected to server"
   - No CORS errors!

## 🔍 Finding Your URLs

### Railway Backend URL:
1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" → "Networking"
4. Copy the "Public Domain" URL

### Netlify Frontend URL:
1. Go to Netlify dashboard
2. Click on your site
3. The URL is shown at the top: `https://your-site-name.netlify.app`

## ✨ Benefits of Default URLs

- **No configuration needed** - Backend accepts any Netlify URL automatically
- **Easy to deploy** - Just set the backend URL in Netlify env vars
- **Flexible** - Works with any Netlify subdomain
- **No custom domain required** - Free tier works perfectly

## 🧪 Testing

1. **Test Backend:**
   - Visit: `https://web-production-653fa.up.railway.app/api/health`
   - Should return: `{"status":"healthy",...}`

2. **Test Frontend:**
   - Visit your Netlify URL (check dashboard)
   - Should load the application

3. **Test Connection:**
   - Browser console should show "Connected to server"
   - No CORS errors
   - Can upload audio files

## 📝 Notes

- Backend CORS now accepts **any** `*.netlify.app` domain automatically
- No need to update Railway variables for different Netlify URLs
- If you want to use a custom domain later, just add it to Railway's `FRONTEND_URL` variable (optional)

---

**Your deployment is ready!** Just use the default URLs that both platforms provide. 🎉

