# Keep Your Render App Awake

## Free Solutions

### Option 1: UptimeRobot (Recommended)
1. Go to https://uptimerobot.com
2. Sign up for free account
3. Create new monitor:
   - Type: HTTP(s)
   - URL: Your Render app URL
   - Interval: 5 minutes
4. This pings your app every 5 minutes, keeping it awake

### Option 2: Cron-job.org
1. Go to https://cron-job.org
2. Sign up for free
3. Create job to ping your URL every 10 minutes

### Option 3: Self-Ping (Add to your app)
Add this to your server code:

```javascript
// In server/index.ts, add this function
function keepAlive() {
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      fetch(process.env.RENDER_EXTERNAL_URL || 'https://your-app.onrender.com')
        .catch(err => console.log('Keep-alive ping failed:', err));
    }, 14 * 60 * 1000); // Ping every 14 minutes
  }
}

// Call it after server starts
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  keepAlive(); // Add this line
});
```

## Paid Solutions

### Render Paid Plan ($7/month)
- No sleep limitations
- Always online
- Better performance
- Custom domains included

### Alternative Free Hosting
- **Railway**: 500 hours/month free
- **Vercel**: Good for frontend, limited backend
- **Netlify**: Frontend hosting with serverless functions

## Quick Fix Implementation

1. **Immediate**: Use UptimeRobot to ping your site
2. **Medium-term**: Add self-ping to your code
3. **Long-term**: Consider paid hosting for professional use

Your portfolio will stay awake and accessible 24/7 with these solutions.