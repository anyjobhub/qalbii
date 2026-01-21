# Qalbi - Family Chatting App

A modern, secure, family-focused realtime chat application built with the MERN stack, Socket.IO, and Tailwind CSS.

## 🚀 Features

- **Secure Authentication**: JWT-based auth with access & refresh tokens
- **Realtime Messaging**: Instant message delivery with Socket.IO
- **Message Status**: Sent, delivered, and read indicators
- **Media Sharing**: Upload and share images, videos, and audio via Cloudinary
- **Typing Indicators**: See when someone is typing
- **Online Presence**: Real-time online/offline status
- **Delete Messages**: Delete for yourself or for everyone
- **Forgot Password**: OTP-based password reset via email
- **Profile Management**: Update profile info and picture
- **Notifications**: Stay updated with system alerts
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 📦 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Socket.IO Client
- Axios
- date-fns
- React Icons

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- Cloudinary
- Brevo (email service)
- express-validator
- express-rate-limit

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Brevo account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
FRONTEND_URL=http://localhost:5173
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Start the dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🚢 Deployment

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

Build Command: `npm install`
Start Command: `npm start`

### Frontend (Firebase Hosting)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy --only hosting
```

Or you can set up GitHub Actions for automatic deployment on push to main branch.

## 📝 Environment Variables

### Backend
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for access tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `BREVO_API_KEY`: Brevo API key for emails
- `BREVO_SENDER_EMAIL`: Email sender address
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: Socket.IO server URL

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on auth endpoints
- Input validation and sanitization
- CORS configuration
- Secure HTTP headers with Helmet

## 📱 Pages

1. **Home**: Landing page with features
2. **Signup**: User registration with validation
3. **Login**: Login with username/email/mobile
4. **Forgot Password**: OTP-based password reset
5. **Chat**: Main chat interface with realtime messaging
6. **Profile**: User profile management
7. **Notifications**: System notifications

## 🎨 Design

- Modern gradient-based UI
- Purple and pink theme
- Smooth animations and transitions
- Mobile-responsive layout
- Custom scrollbars
- Typing indicators
- Message status icons

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🙏 Credits

Built with ❤️ for families who care about privacy.
