# Deployment Guide - Step by Step

## Prerequisites

- GitHub account
- Netlify account (free tier available)
- Render account (free tier available) or Railway
- Google Gemini API key

## 1. Prepare Local Repository

```bash
cd /home/new/Documents/cyber-security-sherly

# Add all files
git add -A

# Commit
git commit -m "Initial commit: AI Sherly Lab v2.0"

# Rename branch to main
git branch -M main
```

## 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ai-sherly-lab`
3. Description: "Advanced Cyber Security Operations Center"
4. **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## 3. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/ai-sherly-lab.git

# Push
git push -u origin main
```

## 4. Deploy Frontend to Netlify

### Via Netlify Dashboard:

1. **Login** to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. **Connect to GitHub:**
   - Authorize Netlify
   - Select your repository: `ai-sherly-lab`
4. **Configure build settings** (auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Branch: `main`
5. **Environment variables** - Click "Show advanced" → "New variable":
   - Key: `VITE_GOOGLE_API_KEY`
   - Value: [Your Google Gemini API Key]
   - Key: `VITE_API_URL`
   - Value: `https://YOUR-BACKEND.onrender.com` (tambahkan nanti)
6. Click **"Deploy site"**

### After Deployment:

- Your site URL: `https://YOUR-SITE-NAME.netlify.app`
- Can set custom domain di Site settings

## 5. Deploy Backend to Render

### Via Render Dashboard:

1. **Login** to https://render.com
2. Click **"New"** → **"Web Service"**
3. **Connect GitHub:**
   - Authorize Render
   - Select repository: `ai-sherly-lab`
4. **Configure service:**
   - Name: `ai-sherly-backend`
   - Region: Oregon (US West) - free tier
   - Branch: `main`
   - Root Directory: (leave empty)
   - Runtime: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Plan: **Free**
5. **Environment Variables** - Add:
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=generate_random_32_char_string_here
   GOOGLE_API_KEY=your_google_gemini_api_key
   ALLOWED_ORIGINS=https://YOUR-SITE-NAME.netlify.app
   ```
6. Click **"Create Web Service"**

### Get Backend URL:

- After deploy, copy URL: `https://ai-sherly-backend.onrender.com`

## 6. Update Netlify Environment

Go back to Netlify → Site settings → Environment variables:

- Update `VITE_API_URL` to your Render backend URL
- Trigger redeploy: Deploys → Trigger deploy → Clear cache and deploy

## 7. Update Backend CORS

If needed, update backend `server.js` CORS origin to match Netlify URL.

## 8. Verify Deployment

### Frontend Checks:
- [ ] Site loads at Netlify URL
- [ ] Login works (username: `zero kyber`, password: `153762`)
- [ ] All pages accessible

### Backend Checks:
- [ ] Health check: `https://YOUR-BACKEND.onrender.com/`
- [ ] Should return: `{"status":"online",...}`

### Integration Checks:
- [ ] Digital Soul AI chat works
- [ ] Global Threat Map loads GeoIP data
- [ ] Nmap scanner can run
- [ ] Code execution works
- [ ] Terminal connects via WebSocket

## 9. Security Hardening (Production)

1. **Change default credentials** in backend
2. **Enable 2FA** for admin accounts
3. **Restrict API key** di Google Cloud Console
4. **Monitor usage** on Netlify & Render dashboards
5. **Set up monitoring** (optional - UptimeRobot, etc.)

## Troubleshooting

### Build Fails on Netlify:
- Check build logs
- Verify all dependencies in package.json
- Ensure VITE_ prefix on environment variables

### Backend Not Starting on Render:
- Check logs in Render dashboard
- Verify build command and start command
- Check environment variables set correctly

### API Calls Failing:
- Check CORS settings in backend
- Verify VITE_API_URL points to correct backend
- Check Network tab in browser DevTools

### WebSocket Not Connecting:
- Render free tier supports WebSocket
- Check WS URL in frontend code
- Verify backend WebSocket handler

## Free Tier Limits

**Netlify:**
- 300 build minutes/month
- 100 GB bandwidth/month
- Unlimited sites

**Render:**
- 750 hours/month (enough for 1 service 24/7)
- Auto-sleep after 15 min inactivity (free tier)
- Wakes on request

## Cost Optimization

- Use CDN for static assets (Netlify has built-in)
- Minimize API calls where possible
- Cache responses when appropriate
- Consider upgrading if you exceed free tier

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure DNS
- [ ] Set up SSL/TLS (auto on Netlify & Render)
- [ ] Monitor application logs
- [ ] Set up error tracking (Sentry, etc.)

**🎉 Deployment Complete!**

Your AI Sherly Lab is now live and accessible worldwide!
