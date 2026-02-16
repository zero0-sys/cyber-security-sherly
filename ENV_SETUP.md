# Environment Variables Configuration Guide

## ⚙️ VITE_API_URL Setup

### WHERE TO SET:
**NETLIFY ONLY** (Frontend environment variables)

### VALUE:
Your Railway backend URL

### Example:
```
VITE_API_URL = https://ai-sherly-backend-production.up.railway.app
```

## 🔧 Complete Setup

### 1. Netlify (Frontend)
Go to: **Site settings** → **Environment variables** → **Add a variable**

```bash
VITE_API_URL = https://your-backend.up.railway.app
VITE_GOOGLE_API_KEY = your_gemini_api_key_here
```

### 2. Railway (Backend)
Go to: **Variables** tab

```bash
NODE_ENV = production
PORT = 5001
GOOGLE_API_KEY = your_gemini_api_key_here
ALLOWED_ORIGINS = https://your-site.netlify.app
```

## 🎯 Why This Way?

- **VITE_API_URL** is a **frontend** variable (starts with `VITE_`)
- Vite only reads `VITE_*` variables at **build time**
- Must be set in **Netlify** so frontend knows where backend is
- Railway backend URL is the **value** you put in Netlify

## ✅ After Setting

1. Go to Netlify **Deploys**
2. Click **Trigger deploy** → **Clear cache and deploy**
3. Wait 2-3 minutes
4. Test - should see backend requests going to Railway!

## 🔍 How to Check if Working

Open browser console (F12), look for:
```
fetch("https://ai-sherly-backend-production.up.railway.app/api/...")
```

If you see `localhost` or errors, redeploy Netlify!
