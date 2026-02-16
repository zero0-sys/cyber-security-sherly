# 🚀 AI Sherly Lab - Deployment Guide

## Netlify + Railway Setup

### 📋 Quick Deploy

**1. Push to GitHub**
```bash
git add -A
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/ai-sherly-lab.git
git push -u origin main
```

**2. Deploy Frontend to Netlify**
- Go to [netlify.com](https://netlify.com)
- Import GitHub repo
- Build settings auto-detected from `netlify.toml`
- Add env var: `VITE_GOOGLE_API_KEY` = your Gemini key
- Deploy!

**3. Deploy Backend to Railway**
- Go to [railway.app](https://railway.app)
- New Project → Import from GitHub
- Select your repo
- Config auto-detected from `railway.json`
- Add environment variables:
  - `NODE_ENV` = production
  - `PORT` = 5001
  - `JWT_SECRET` = random_32_char_string
  - `GOOGLE_API_KEY` = your Gemini key
  - `ALLOWED_ORIGINS` = your Netlify URL
- Deploy!

**4. Update Netlify**
- Add `VITE_API_URL` = your Railway backend URL
- Redeploy

**Done! 🎉**

---

## Environment Variables

### Netlify (Frontend)
```
VITE_GOOGLE_API_KEY = your_google_gemini_api_key
VITE_API_URL = https://your-backend.up.railway.app
```

### Railway (Backend)
```
NODE_ENV = production
PORT = 5001
JWT_SECRET = min_32_characters_random_secret
GOOGLE_API_KEY = your_google_gemini_api_key
ALLOWED_ORIGINS = https://your-site.netlify.app
```

---

## Login Credentials
- Username: `zero kyber`
- Password: `153762`

---

## Cost
- **Netlify**: Free (300 build min/month)
- **Railway**: $5 credit/month (enough for small apps)
- **Total**: ~$0-5/month

---

**Support**: Check `DEPLOYMENT.md` for detailed troubleshooting
