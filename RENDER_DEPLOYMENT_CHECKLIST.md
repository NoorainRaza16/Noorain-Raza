# Render Deployment Checklist

## Pre-Deployment Setup

### ✅ Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create a free cluster
- [ ] Create database user with read/write permissions
- [ ] Whitelist all IP addresses (0.0.0.0/0) for Render
- [ ] Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

### ✅ GitHub Repository
- [ ] Code pushed to GitHub repository
- [ ] Repository is public or Render has access
- [ ] Main branch contains latest code
- [ ] All deployment files are included

## Render Web Service Configuration

### ✅ Basic Settings
- [ ] **Service Name**: `portfolio-web-service` (or your choice)
- [ ] **Environment**: `Node`
- [ ] **Region**: Choose closest to your location
- [ ] **Branch**: `main`
- [ ] **Instance Type**: `Free`

### ✅ Build & Deploy Settings
- [ ] **Build Command**: `npm install && npm run build:client && npm run build:server`
- [ ] **Start Command**: `npm start`
- [ ] **Node Version**: Latest (auto-detected from package.json)

### ✅ Environment Variables
Add these in Render dashboard under "Environment":

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `MONGODB_URI` | `mongodb+srv://...` | Your full MongoDB connection string |
| `SESSION_SECRET` | `your-secure-random-string-32-chars-min` | Generate a secure random string |

**Optional Variables** (set by Render automatically):
- `PORT` - Don't set manually
- `RENDER_EXTERNAL_URL` - Auto-set by Render
- `RENDER_SERVICE_NAME` - Auto-set by Render

### ✅ Advanced Settings
- [ ] **Health Check Path**: `/health`
- [ ] **Auto-Deploy**: `Yes` (recommended)

## Post-Deployment Verification

### ✅ Initial Checks
- [ ] Service builds successfully (check build logs)
- [ ] Service starts without errors (check service logs)
- [ ] Health endpoint responds: `https://your-app.onrender.com/health`
- [ ] Main site loads: `https://your-app.onrender.com`

### ✅ Functionality Tests
- [ ] Home page displays correctly
- [ ] All sections load (About, Skills, Projects, etc.)
- [ ] Admin panel accessible: `https://your-app.onrender.com/admin`
- [ ] Admin login works (default credentials created automatically)
- [ ] Database connectivity working

### ✅ Performance Verification
- [ ] Page load times acceptable (< 5 seconds)
- [ ] No console errors in browser
- [ ] Keep-alive service functioning (check logs for ping messages)
- [ ] Service stays awake after 15+ minutes

## What to Fill in Render Web Service Form

### 1. Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select your portfolio repository

### 2. Configure Service
```
Name: portfolio-web-service
Environment: Node
Region: [Choose closest to you - Oregon, Frankfurt, Singapore]
Branch: main
Build Command: npm install && npm run build
Start Command: npm start
```

### 3. Advanced Settings
```
Instance Type: Free
Auto-Deploy: Yes
Health Check Path: /health
```

### 4. Environment Variables
Click "Add Environment Variable" for each:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
SESSION_SECRET = your-super-secure-random-string-min-32-characters-long
```

### 5. Deploy
Click "Create Web Service" - Render will:
1. Clone your repository
2. Install dependencies
3. Build the application
4. Start the service
5. Provide you with a URL like `https://portfolio-web-service.onrender.com`

## Troubleshooting Common Issues

### Build Failures
```bash
# Check these in build logs:
- npm install completed successfully
- build:client completed (creates client/dist)
- build:server completed (creates dist/index.js)
```

### Runtime Errors
```bash
# Check these in service logs:
- MongoDB connection successful
- Server started on correct port
- No authentication errors
- Keep-alive service started
```

### Database Issues
```bash
# Verify MongoDB Atlas settings:
- Connection string format correct
- Username/password encoded properly
- Network access allows all IPs (0.0.0.0/0)
- Database user has readWrite permissions
```

### Performance Issues
```bash
# Free tier limitations:
- Service sleeps after 15 minutes of inactivity
- 750 hours/month limit
- Shared CPU and memory
- Keep-alive service mitigates sleep issue
```

## Security Checklist

### ✅ Secrets Management
- [ ] SESSION_SECRET is random and secure (32+ characters)
- [ ] MongoDB credentials are not in code
- [ ] No sensitive data in git repository
- [ ] Environment variables properly set in Render

### ✅ Database Security
- [ ] MongoDB user has minimal required permissions
- [ ] Strong database password
- [ ] Network access properly configured
- [ ] Connection string uses SSL (srv://)

## Monitoring & Maintenance

### ✅ Regular Monitoring
- [ ] Check service logs weekly for errors
- [ ] Monitor database usage in MongoDB Atlas
- [ ] Verify keep-alive service working
- [ ] Check SSL certificate status

### ✅ Updates & Maintenance
- [ ] Set up GitHub auto-deploy for easy updates
- [ ] Monitor npm security advisories
- [ ] Keep dependencies updated
- [ ] Backup important database data

## Free Tier Considerations

### Resource Limits
- **CPU**: Shared, limited compute
- **Memory**: 512MB RAM
- **Storage**: 1GB disk space
- **Bandwidth**: 100GB/month
- **Uptime**: 750 hours/month
- **Sleep**: After 15 minutes inactivity

### Keep-Alive Service
- Pings your service every 14 minutes
- Prevents automatic sleep
- Minimal resource usage
- Logs ping status for monitoring

### Upgrade Recommendations
Consider upgrading to paid plan if you need:
- Always-on service (no sleep)
- Better performance
- More resources
- Custom domains with SSL
- Professional support

---

## Final Deployment Command Summary

1. **MongoDB Atlas**: Get connection string
2. **Render Dashboard**: Create new web service
3. **Repository**: Select your GitHub repo
4. **Configuration**:
   ```
   Build: npm install && npm run build:client && npm run build:server
   Start: npm start
   Health: /health
   ```
5. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   SESSION_SECRET=your-secure-string
   ```
6. **Deploy**: Click "Create Web Service"

Your portfolio will be live at: `https://your-service-name.onrender.com`