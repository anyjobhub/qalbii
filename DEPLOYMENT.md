# Qalbi - Deployment URLs

## ✅ Production URLs (LIVE)

### Frontend (Firebase Hosting)
**https://qalbi-family.web.app**

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

Visit: **https://qalbi-family.web.app**

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

- **Firebase Hosting**: Rebuilds frontend (1-2 min)
- **Render**: Rebuilds backend (5-10 min)

### Firebase Deployment

To deploy frontend to Firebase:

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## Environment Variables

All environment variables are configured in:
- **Render Dashboard**: Backend settings
- **Firebase Console**: Frontend hosting settings (if needed)

See `deployment_guide.md` for complete variable list.

---

## 🎊 Your app is LIVE and ready to use!
