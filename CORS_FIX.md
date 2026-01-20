# CORS Fix - Update Backend Environment Variable

## Problem
The backend's `FRONTEND_URL` is set to a placeholder value, causing CORS errors.

**Error:** `The 'Access-Control-Allow-Origin' header has a value 'https://your-frontend-url.netlify.app'`

## Solution - Update Render Environment Variable

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Click on your backend web service: `qalbi-backend`

### Step 2: Open Environment Settings
1. Click on **"Environment"** in the left sidebar
2. Find the `FRONTEND_URL` variable

### Step 3: Update the Value
1. Click **"Edit"** next to `FRONTEND_URL`
2. Change from: `https://your-frontend-url.netlify.app`
3. Change to: **`https://qalbi-chat.netlify.app`**
4. Click **"Save Changes"**

### Step 4: Wait for Auto-Deploy
1. Render will automatically redeploy (takes ~5-10 minutes)
2. Watch the "Events" tab for deploy status
3. Wait for status to show "Live"

### Step 5: Test Again
1. Go to https://qalbi-chat.netlify.app
2. Try signing up
3. Should work without CORS errors! ✅

---

## Quick Copy-Paste

**Variable Name:** `FRONTEND_URL`  
**New Value:** `https://qalbi-chat.netlify.app`

---

## Alternative: Manual Redeploy

If auto-deploy doesn't trigger:
1. Go to your service in Render
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

---

## Verification

Once deployed, test the API directly:
```bash
curl -I https://qalbi-backend.onrender.com/api/auth/signup
```

Look for this header in the response:
```
Access-Control-Allow-Origin: https://qalbi-chat.netlify.app
```

✅ **After this fix, your app will work perfectly!**
