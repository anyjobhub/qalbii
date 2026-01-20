# Qalbi - Deployment URLs

## ✅ Production URLs (LIVE)

### Frontend (Netlify)
**https://qalbi-chat.netlify.app**

### Backend (Render)  
**https://qalbi-backend.onrender.com**

### API Endpoint
**https://qalbi-backend.onrender.com/api**

---

## 🎉 Deployment Status

- ✅ Backend: **DEPLOYED** and running
- ✅ Frontend: **DEPLOYED** and accessible
- ✅ Database: MongoDB Atlas connected
- ✅ Realtime: Socket.IO enabled
- ✅ Media: Cloudinary configured
- ✅ Emails: Brevo integrated

---

## Quick Test

Visit: **https://qalbi-chat.netlify.app**

1. Click "Get Started" → Should see signup page
2. Create an account → Should redirect to chat
3. Test realtime messaging!

---

## Continuous Deployment

Both services auto-deploy when you push to `main` branch:

```bash
git add .
git commit -m "Your changes"
git push
```

- **Netlify**: Rebuilds frontend (3-5 min)
- **Render**: Rebuilds backend (5-10 min)

---

## Environment Variables

All environment variables are configured in:
- **Render Dashboard**: Backend settings
- **Netlify Dashboard**: Frontend settings

See `deployment_guide.md` for complete variable list.

---

## 🎊 Your app is LIVE and ready to use!
