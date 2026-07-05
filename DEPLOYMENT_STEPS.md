# Step-by-Step Deployment Guide: Windows VS Code → GitHub → Render

## Phase 1: Download and Setup on Windows

### 1. Download Project Files from Replit
1. In Replit, go to the file explorer
2. Click the three dots menu → "Download as ZIP"
3. Save to your computer (e.g., `C:\Users\YourName\Downloads`)
4. Extract the ZIP file to a folder like `C:\Users\YourName\portfolio-website`

### 2. Install Required Software
Download and install these in order:
- **Node.js**: https://nodejs.org (Download LTS version)
- **Git**: https://git-scm.com/download/win
- **VS Code**: https://code.visualstudio.com

### 3. Open Project in VS Code
1. Open VS Code
2. File → Open Folder
3. Select your extracted `portfolio-website` folder
4. VS Code will open your project

### 4. Install Dependencies
1. Open Terminal in VS Code: `Terminal → New Terminal`
2. Run: `npm install`
3. Wait for installation to complete

### 5. Set Up Environment Variables
1. Create a new file called `.env` in the root folder
2. Copy this content:
```
DATABASE_URL=your_mongodb_connection_string_here
SESSION_SECRET=your_super_secure_session_secret_here
NODE_ENV=development
PORT=5000
```

### 6. Test Locally
1. Run: `npm run dev`
2. Open browser to `http://localhost:5000`
3. Verify your portfolio loads correctly

## Phase 2: Set Up MongoDB Database

### Option A: MongoDB Atlas (Recommended)
1. Go to https://mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (free tier)
4. Create database user with username/password
5. Get connection string
6. Update your `.env` file with the connection string

### Option B: Export from Replit Database
If you want to keep your existing data:
1. In Replit terminal, run database export commands
2. Download the exported data
3. Import to MongoDB Atlas using their tools

## Phase 3: Push to GitHub

### 1. Create GitHub Repository
1. Go to https://github.com
2. Click "New" repository
3. Name: `portfolio-website` (or your preferred name)
4. Set to Public or Private
5. Don't initialize with README
6. Click "Create Repository"

### 2. Initialize Git in VS Code
Open Terminal in VS Code and run these commands one by one:

```bash
git init
git add .
git commit -m "Initial commit: Professional portfolio website"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/portfolio-website.git
git push -u origin main
```

Replace `YOURUSERNAME` with your actual GitHub username.

### 3. Verify Upload
1. Refresh your GitHub repository page
2. All your files should now be visible on GitHub

## Phase 4: Deploy to Render

### 1. Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up using your GitHub account
4. This automatically connects Render to your GitHub

### 2. Create New Web Service
1. Click "New +" in Render dashboard
2. Select "Web Service"
3. Click "Connect" next to your portfolio repository
4. Click "Connect" to confirm

### 3. Configure Deployment Settings
Fill in these settings exactly:

- **Name**: `portfolio-website` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. Add Environment Variables
1. Scroll down to "Environment Variables"
2. Click "Add Environment Variable"
3. Add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your MongoDB connection string |
| `SESSION_SECRET` | A secure random string (at least 32 characters) |
| `NODE_ENV` | `production` |

### 5. Deploy
1. Click "Create Web Service"
2. Render will start building your app
3. Wait 5-10 minutes for deployment to complete
4. Your app will be live at: `https://your-service-name.onrender.com`

## Phase 5: Final Configuration

### 1. Update CORS Settings (if needed)
Your app is configured to work with Render automatically.

### 2. Custom Domain (Optional)
1. In Render dashboard → Settings → Custom Domains
2. Add your domain name
3. Update your domain's DNS records as shown

### 3. SSL Certificate
Render provides automatic SSL certificates - no action needed.

## Phase 6: Verify Deployment

### Test Your Live Website
1. Visit your Render URL
2. Check all pages load correctly
3. Test contact form
4. Verify admin login works
5. Check mobile responsiveness

### Monitor Performance
1. Render dashboard shows logs and metrics
2. Monitor for any errors in the logs
3. Check response times

## Common Issues and Solutions

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs in Render dashboard

### Database Connection Issues
- Verify MongoDB connection string format
- Check database user permissions
- Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas

### Environment Variables Not Working
- Double-check variable names (case-sensitive)
- Ensure no extra spaces in values
- Redeploy after adding variables

### Site Not Loading
- Check Render service status
- Review deployment logs
- Verify start command is correct

## Success Checklist

- [ ] Node.js, Git, and VS Code installed
- [ ] Project files downloaded and opened in VS Code
- [ ] Dependencies installed with `npm install`
- [ ] Local development working with `npm run dev`
- [ ] MongoDB database set up and connected
- [ ] Code pushed to GitHub successfully
- [ ] Render web service created and configured
- [ ] Environment variables added to Render
- [ ] Website deployed and accessible
- [ ] All features working in production
- [ ] Admin dashboard accessible

## Next Steps After Deployment

1. **Custom Domain**: Set up your own domain name
2. **Analytics**: Add Google Analytics tracking
3. **SEO**: Submit sitemap to search engines
4. **Monitoring**: Set up uptime monitoring
5. **Backups**: Schedule regular database backups

Your professional portfolio is now live and ready for the world to see!

## Support Commands

If you need help during any step:

**Check Node.js version**: `node --version`
**Check Git version**: `git --version`
**View project dependencies**: `npm list`
**Check for errors**: `npm run check`

Contact support if you encounter issues during deployment.