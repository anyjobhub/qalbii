# Deployment Checklist

## Before You Start
- [ ] GitHub account created
- [ ] Code committed and pushed to GitHub
- [ ] MongoDB Atlas account with database created
- [ ] Cloudinary account with API keys
- [ ] Brevo account with verified sender email

---

## Backend Deployment (Render)

### Setup
- [ ] Render account created
- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`

### Configuration
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Node version: 18+

### Environment Variables (11 total)
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGODB_URI` (from MongoDB Atlas)
- [ ] `JWT_SECRET` (generate random string)
- [ ] `JWT_REFRESH_SECRET` (generate random string)
- [ ] `JWT_EXPIRE=7d`
- [ ] `JWT_REFRESH_EXPIRE=30d`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `BREVO_API_KEY`
- [ ] `BREVO_SENDER_EMAIL`
- [ ] `BREVO_SENDER_NAME=Qalbi`
- [ ] `FRONTEND_URL` (update after frontend deployed)

### Verification
- [ ] Build succeeded
- [ ] Service is running
- [ ] API endpoint responds: `https://your-app.onrender.com`
- [ ] Backend URL copied for frontend setup

---

## Frontend Deployment (Netlify)

### Setup
- [ ] `netlify.toml` file created (✅ Done)
- [ ] Changes committed to GitHub
- [ ] Netlify account created
- [ ] New site created from GitHub

### Configuration
- [ ] Base directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/dist`

### Environment Variables (2 total)
- [ ] `VITE_API_URL=https://your-backend.onrender.com/api`
- [ ] `VITE_SOCKET_URL=https://your-backend.onrender.com`

### Verification
- [ ] Build succeeded
- [ ] Site is live
- [ ] Home page loads
- [ ] Can navigate to signup/login

---

## Final Steps

### Update Backend CORS
- [ ] Go to Render dashboard
- [ ] Update `FRONTEND_URL` env var with Netlify URL
- [ ] Wait for auto-redeploy

### Test Everything
- [ ] Signup works
- [ ] Login works
- [ ] Realtime chat works
- [ ] Messages send/receive instantly
- [ ] Media uploads work
- [ ] Profile updates work
- [ ] OTP emails work

---

## 🎉 Ready to Deploy!

Follow the detailed step-by-step guide in `deployment_guide.md`
