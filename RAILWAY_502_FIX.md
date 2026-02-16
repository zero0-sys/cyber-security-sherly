# 🚨 Railway Backend 502 Error - TROUBLESHOOTING GUIDE

## Problem
Railway backend returning **HTTP 502** on all API endpoints:
- `/api/execute/code` → 502
- `/api/geoip/threats` → 502  
- All other endpoints → 502

## Root Cause Analysis

### ✅ NOT THE PROBLEM:
1. **Environment Variables** - CORRECTLY set in Railway:
   - `ALLOWED_ORIGINS` = Netlify URL ✓
   - `GOOGLE_API_KEY` = Set ✓
   - `NODE_ENV` = production ✓
   - `PORT` = 5001 ✓

2. **Routes** - All routes EXIST in code:
   - `app.use('/api/execute', executeRoutes)` ✓
   - `app.use('/api/geoip', geoipRoutes)` ✓

3. **Netlify Config** - CORRECTLY set:
   - `VITE_API_URL` = Railway backend URL ✓

### ❌ ACTUAL PROBLEMS:

**1. Missing Runtime Dependencies**

Railway might not have compilers installed for code execution:
- `python3`, `node`, `gcc`, `g++`, `javac`, `go`, `rustc`, `ruby`, `php`

**Solution**: Update `nixpacks.toml` to install all compilers

**2. Backend Startup Crash**

Check Railway deployment logs for:
```
Error: Cannot find module 'xxx'
ModuleNotFoundError: No module named 'xxx'  
```

**3. File System Permissions**

Temporary directories might fail to create:
```
Error: EACCES: permission denied, mkdir '/temp-exec'
```

## 🔧 FIXES TO APPLY

### Fix 1: Update nixpacks.toml with ALL compilers

```toml
[phases.setup]
aptPkgs = [
  "python3",
  "python3-pip", 
  "gcc",
  "g++",
  "openjdk-17-jdk",
  "golang-go",
  "rustc",
  "ruby",
  "php-cli"
]

[phases.install]
cmds = [
  "cd backend",
  "npm install --legacy-peer-deps"
]

[start]
cmd = "cd backend && node server.js"
```

### Fix 2: Add Try-Catch to Route Mounting

Update `server.js` to catch route loading errors:

```javascript
// Wrap route imports in try-catch
try {
    app.use('/api/execute', executeRoutes);
    console.log('✓ Execute routes loaded');
} catch (error) {
    console.error('✗ Execute routes failed:', error);
}
```

### Fix 3: Fallback for Missing Compilers

Update `execute.js` to gracefully handle missing compilers:

```javascript
// Check if compiler exists before execution
const { exec } = require('child_process');

const checkCompiler = async (cmd) => {
    try {
        await execAsync(`which ${cmd}`);
        return true;
    } catch {
        return false;
    }
};
```

## 🔍 How to Debug

### Step 1: Check Railway Deployment Logs

1. Go to Railway project
2. Click on **ai-sherly-backend**
3. Go to **Deployments** tab
4. Click latest deployment
5. Check **Build Logs** and **Deploy Logs**

**Look for**:
- `npm WARN` or `npm ERR!` 
- `Error:` messages
- `ModuleNotFoundError`
- `EACCES` or `ENOENT` errors

### Step 2: Check Runtime Logs

Click **View Logs** and look for:
```
Server starting on port 5001...
✓ Execute routes loaded
✓ GeoIP routes loaded
```

If you see errors, that's the culprit!

### Step 3: Test Health Endpoint

Visit: `https://ai-sherly-backend-production.up.railway.app/`

**Should return**:
```json
{
  "status": "online",
  "service": "AI Sherly Backend API",
  "version": "2.0.0"
}
```

If it returns 502, **backend is NOT starting!**

## 🚀 Quick Fix Commands

If backend won't start, try:

### 1. Trigger Redeploy
Railway Dashboard → **Deployments** → Click **••• menu** → **Redeploy**

### 2. Check Node Version
Make sure Railway uses Node 18+:

Add to `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

### 3. Simplify Temporarily

Comment out optional routes in `server.js`:
```javascript
// app.use('/api/execute', executeRoutes); // TEMP: Disabled for debugging
// app.use('/api/rag', ragRoutes); // TEMP: Disabled
```

Redeploy. If it works, the problem is in those routes!

## ✅ Next Steps

1. Apply **Fix 1** (nixpacks.toml with compilers)
2. Commit and push
3. Railway auto-redeploys
4. Check logs for errors
5. Test health endpoint
6. If still 502, apply **Fix 2 & 3**

## 📝 Notes

- 502 = Backend not responding (crash or not started)
- 404 = Backend running but route not found
- 500 = Backend running but code error

Current issue is **502** = Backend crash on startup!
