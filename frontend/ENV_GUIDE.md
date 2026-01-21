# Frontend Environment Variables Guide

## Environment Variables Used

Your frontend uses these environment variables to connect to the backend:

### 1. `VITE_API_URL`
- **Purpose**: Backend REST API endpoint
- **Used in**: `src/utils/api.js` - All HTTP requests (login, signup, messages, etc.)
- **Production**: `https://qalbi-backend.onrender.com/api`
- **Development**: `http://localhost:5000/api`

### 2. `VITE_SOCKET_URL`
- **Purpose**: Socket.IO server for real-time messaging
- **Used in**: `src/context/SocketContext.jsx` - Real-time chat, typing indicators, online status
- **Production**: `https://qalbi-backend.onrender.com`
- **Development**: `http://localhost:5000`

## Setup Instructions

### For Production (Firebase Hosting):

1. Create `.env` file in `frontend/` directory:
```bash
cd /home/salman/Documents/qulbi/frontend
nano .env
```

2. Add the following content:
```env
VITE_API_URL=https://qalbi-backend.onrender.com/api
VITE_SOCKET_URL=https://qalbi-backend.onrender.com
```

3. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

### For Development:

1. Use `.env.example` as template or create `.env`:
```bash
cd frontend
cp .env.example .env
```

2. Content for development:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

3. Start dev server:
```bash
npm run dev
```

## How to Use in Code

In your React components, access these variables using `import.meta.env`:

```javascript
// Example in any component
const apiUrl = import.meta.env.VITE_API_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;

console.log('Connecting to:', apiUrl);
```

**Important Notes:**
- All Vite environment variables **must** start with `VITE_` prefix
- Variables are embedded at **build time**, not runtime
- Always rebuild (`npm run build`) after changing `.env`
- `.env` is in `.gitignore` - never commit it to GitHub

## Cloudinary Configuration

**You don't need Cloudinary credentials in the frontend.** 

Here's why:
- Frontend uploads files to your backend API endpoint: `/api/message/upload`
- Backend handles Cloudinary upload securely with server-side credentials
- This keeps your Cloudinary API keys safe

The file upload flow:
1. User selects file → Frontend sends to backend
2. Backend uploads to Cloudinary → Returns media URL
3. Frontend displays the image/video from Cloudinary CDN

## Security Best Practices

✅ **Do:**
- Keep `.env` in `.gitignore` (already configured)
- Use different values for development and production
- Only expose `VITE_` prefixed variables (Vite requirement)

❌ **Don't:**
- Never commit `.env` to GitHub
- Never put sensitive API keys in frontend (Cloudinary, JWT secrets, etc.)
- Never expose backend-only credentials

## Troubleshooting

### CORS Errors
If you see CORS errors after changing `.env`:
1. Make sure backend `FRONTEND_URL` matches your Firebase URL
2. Rebuild frontend: `npm run build`
3. Redeploy: `firebase deploy --only hosting`

### Environment Variables Not Working
1. Ensure variable starts with `VITE_` prefix
2. Restart dev server (`npm run dev`)
3. For production, rebuild: `npm run build`
4. Clear browser cache

### Connection Issues
1. Verify backend is running: `https://qalbi-backend.onrender.com/api/health`
2. Check browser console for actual error messages
3. Verify Socket.IO connection in Network tab

## Current Deployment URLs

- **Frontend**: https://qalbi-family.web.app
- **Backend API**: https://qalbi-backend.onrender.com/api
- **Socket.IO**: wss://qalbi-backend.onrender.com

All connections are HTTPS/WSS for security.
