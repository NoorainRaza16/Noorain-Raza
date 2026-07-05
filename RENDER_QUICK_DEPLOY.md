# Quick Deploy to Render - Portfolio Project

## Prerequisites Completed ✅
- MongoDB Atlas database configured
- Production-ready code with keep-alive service
- Health monitoring endpoint
- Security configurations optimized
- Build process tested

## Deploy in 5 Minutes

### Step 1: Render Web Service Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 2: Configuration
```
Service Name: portfolio-web-service
Environment: Node
Region: Oregon (or closest)
Branch: main
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
Health Check Path: /health
Auto-Deploy: Yes
```

### Step 3: Environment Variables
Add exactly these 3 variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority` |
| `SESSION_SECRET` | `generate-secure-32-char-random-string` |

### Step 4: Deploy
Click **"Create Web Service"** - Your app will be live in 3-5 minutes.

## What You'll Get

**Live URLs:**
- Main Site: `https://your-service-name.onrender.com`
- Admin Panel: `https://your-service-name.onrender.com/admin`
- Health Check: `https://your-service-name.onrender.com/health`

**Features:**
- Professional portfolio with admin dashboard
- Automatic keep-alive (no sleeping on free tier)
- SSL certificate (HTTPS)
- Global CDN
- Database integration
- Real-time updates

## MongoDB Atlas Setup (If Not Done)
1. Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create database user with `readWrite` permissions
3. Network Access: Add `0.0.0.0/0` (Allow access from anywhere)
4. Get connection string, replace `<username>` and `<password>`

## Troubleshooting
- **Build fails**: Check environment variables are set correctly
- **Database errors**: Verify MongoDB connection string format
- **Site not loading**: Check service logs in Render dashboard

Your portfolio will be production-ready with professional features and automatic uptime maintenance.