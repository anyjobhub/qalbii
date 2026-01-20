# UptimeRobot Setup Guide - Keep Render Backend Awake

## Problem
Render's free tier puts your backend to sleep after 15 minutes of inactivity. This causes:
- ❌ First request takes 30-60 seconds (cold start)
- ❌ Socket.IO disconnects
- ❌ Poor user experience

## Solution: UptimeRobot
UptimeRobot pings your backend every 5 minutes to keep it awake 24/7.

---

## Step-by-Step Setup

### 1. Create UptimeRobot Account
1. Go to: https://uptimerobot.com
2. Click **"Sign Up Free"**
3. Enter your email and create password
4. Verify your email

### 2. Add New Monitor
1. Login to UptimeRobot dashboard
2. Click **"+ Add New Monitor"** button

### 3. Configure Monitor Settings

**Monitor Type:** `HTTP(s)`

**Friendly Name:** `Qalbi Backend`

**URL (or IP):** `https://qalbi-backend.onrender.com`

**Monitoring Interval:** `5 minutes` (free tier)

**Monitor Timeout:** `30 seconds`

**HTTP Method:** `GET`

**Alert Contacts:** Select your email

**Advanced Settings (Optional):**
- Custom HTTP Headers: Leave empty
- Keyword Exists: Leave empty
- Ignore SSL Errors: No

### 4. Save Monitor
Click **"Create Monitor"**

---

## Verification

### Check Monitor Status
1. UptimeRobot dashboard shows:
   - ✅ Green = Backend is UP
   - ⏸️ Paused = Monitor disabled
   - ❌ Red = Backend is DOWN

### Backend Logs (Render)
You'll see GET requests every 5 minutes:
```
GET / 200 0.633 ms - 87
GET / 200 0.548 ms - 87
GET / 200 0.612 ms - 87
```

### Test Cold Start Removed
1. Wait 10 minutes without accessing your app
2. Try to login
3. **Expected:** Instant response (no 30s delay) ✅

---

## Add Health Check Endpoint (Optional)

For better monitoring, create a dedicated health endpoint:

### Backend: `server.js`
```javascript
// Health check endpoint for UptimeRobot
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
```

### Update UptimeRobot:
Change URL to: `https://qalbi-backend.onrender.com/health`

---

## Benefits

✅ **Zero Cold Starts** - Backend always warm  
✅ **Instant Response** - No 30-60s delays  
✅ **Socket.IO Stability** - Connections stay alive  
✅ **Email Alerts** - Get notified if backend goes down  
✅ **Free Forever** - UptimeRobot free tier is plenty  

---

## Monitoring & Alerts

### Email Notifications
UptimeRobot sends email alerts when:
- Backend goes DOWN
- Backend comes back UP
- Specific keywords not found (if configured)

### Dashboard Stats
- Uptime percentage (aim for 99%+)
- Response time graphs
- Down event history

---

## Alternative: Cron Job (Free)

If you don't want UptimeRobot, use **cron-job.org**:

1. Go to: https://cron-job.org
2. Sign up free
3. Create new cron job:
   - URL: `https://qalbi-backend.onrender.com`
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Enable

---

## Important Notes

> [!WARNING]
> Render free tier has 750 hours/month limit. Keeping backend awake 24/7 uses ~720 hours/month. You're within the limit!

> [!TIP]
> Set monitoring interval to 5 minutes (not less) to avoid rate limiting

> [!CAUTION]
> Don't add multiple monitors for the same backend - one is enough

---

## Troubleshooting

### Monitor Shows DOWN
1. Check Render dashboard - is service running?
2. Visit backend URL manually in browser
3. Check Render logs for errors
4. Verify CORS settings allow GET requests

### Still Getting Cold Starts
1. Verify monitor is **Active** (not paused)
2. Check monitor interval is 5 minutes
3. Wait 15 minutes for first ping cycle

### Too Many Requests Warning
1. Increase interval to 10 minutes
2. Use single monitor only

---

**Setup Time:** 5 minutes  
**Cost:** Free forever  
**Impact:** Massive improvement in user experience ✅

Once UptimeRobot is set up, your backend will NEVER sleep again!
