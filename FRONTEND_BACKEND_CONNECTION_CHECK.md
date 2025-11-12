# Frontend-Backend Connection Troubleshooting

## Current Status
- ✅ Backend health endpoint works: `https://web-production-653fa.up.railway.app/api/health`
- ✅ Backend is running and responding
- ⚠️ Frontend may not be connecting properly

## What to Check

### 1. Frontend Environment Variables (Netlify)

**Critical:** Check if these are set in Netlify:

1. Go to Netlify dashboard → Your site → Site settings → Environment variables
2. Verify these exist:
   - `REACT_APP_API_URL` = `https://web-production-653fa.up.railway.app`
   - `REACT_APP_SOCKET_URL` = `https://web-production-653fa.up.railway.app`

**Important:** 
- Variables MUST start with `REACT_APP_` to be available in React
- Must include `https://` protocol
- NO trailing slash
- Redeploy frontend after adding/changing variables

### 2. Browser Console Check

When you visit your Netlify frontend URL:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - ✅ "Connected to server" message → Working!
   - ❌ CORS errors → Backend CORS issue
   - ❌ "Failed to fetch" → Wrong API URL
   - ❌ "Socket connection failed" → Socket.IO issue
   - ❌ Network errors → Check API URL

### 3. Network Tab Check

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for requests to:
   - `/api/field-data` → Should go to Railway backend
   - `/socket.io/` → Should connect to Railway backend
5. Check if requests are:
   - ✅ 200 OK → Working
   - ❌ 404 Not Found → Wrong URL
   - ❌ CORS error → CORS configuration issue
   - ❌ Failed → Network/URL issue

### 4. Verify API URL in Browser

The frontend code should use your Railway URL. Check by:

1. Open browser console
2. Type: `window.location.origin`
3. Check what API URL is being used (might be in console logs)

### 5. Common Issues

#### Issue: Frontend shows "Loading..." forever
- **Cause:** Can't connect to backend
- **Fix:** Check environment variables in Netlify, verify API URL

#### Issue: CORS errors in console
- **Cause:** Backend not allowing Netlify domain
- **Fix:** Backend should accept `*.netlify.app` (already configured)

#### Issue: Socket.IO not connecting
- **Cause:** Socket URL not set correctly
- **Fix:** Verify `REACT_APP_SOCKET_URL` in Netlify env vars

#### Issue: 404 errors
- **Cause:** Wrong API URL or route
- **Fix:** Verify Railway URL is correct

## Testing Steps

1. **Test Backend Directly:**
   ```
   https://web-production-653fa.up.railway.app/api/health
   ```
   Should return JSON with `{"status":"healthy",...}`

2. **Test Backend Field Data:**
   ```
   https://web-production-653fa.up.railway.app/api/field-data
   ```
   Should return field data JSON

3. **Check Frontend:**
   - Visit your Netlify URL
   - Open console (F12)
   - Check for errors
   - Check Network tab for API calls

## Quick Fix Checklist

- [ ] `REACT_APP_API_URL` set in Netlify = `https://web-production-653fa.up.railway.app`
- [ ] `REACT_APP_SOCKET_URL` set in Netlify = `https://web-production-653fa.up.railway.app`
- [ ] Frontend redeployed after setting environment variables
- [ ] Browser console checked for errors
- [ ] Network tab checked for API requests
- [ ] Backend health endpoint works
- [ ] Backend field-data endpoint works

## What to Share

If still having issues, share:
1. Browser console errors (if any)
2. Network tab errors (if any)
3. Whether environment variables are set in Netlify
4. What you see when visiting the frontend URL




