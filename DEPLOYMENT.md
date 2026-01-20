# Qalbi - Deployment URLs

## Production URLs

### Frontend (Netlify)
https://qalbi-chat.netlify.app

### Backend (Render)  
https://qalbi-backend.onrender.com

### API Endpoint
https://qalbi-backend.onrender.com/api

---

## Quick Deploy Commands

### Push to GitHub
```bash
git add .
git commit -m "Deploy to production"
git push
```

Both Render and Netlify will auto-deploy from the `main` branch.

---

## Environment Variables

### Backend (Set in Render Dashboard)
- NODE_ENV
- PORT
- MONGODB_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- BREVO_API_KEY
- BREVO_SENDER_EMAIL
- FRONTEND_URL

### Frontend (Set in Netlify Dashboard)
- VITE_API_URL
- VITE_SOCKET_URL

See `deployment_guide.md` for complete setup instructions.
