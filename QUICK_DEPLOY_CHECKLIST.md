# Quick Deployment Checklist

## Pre-Deployment Setup ✅

### Windows Machine Setup
- [ ] Download project ZIP from Replit
- [ ] Install Node.js (v18+)
- [ ] Install Git
- [ ] Install VS Code
- [ ] Extract project to folder
- [ ] Open folder in VS Code

### Local Testing
- [ ] Run `npm install` in terminal
- [ ] Create `.env` file with database URL
- [ ] Run `npm run dev`
- [ ] Verify site works at localhost:5000

## GitHub Setup ✅

### Repository Creation
- [ ] Create new repository on GitHub
- [ ] Don't initialize with README
- [ ] Copy repository URL

### Code Upload
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

## Database Setup ✅

### MongoDB Atlas
- [ ] Create free MongoDB Atlas account
- [ ] Create cluster
- [ ] Create database user
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Get connection string
- [ ] Update `.env` file

## Render Deployment ✅

### Service Configuration
- [ ] Sign up on Render with GitHub
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`

### Environment Variables
Add these in Render dashboard:
- `DATABASE_URL`: Your MongoDB connection string
- `SESSION_SECRET`: Random secure string (32+ chars)
- `NODE_ENV`: `production`

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build completion
- [ ] Test live URL
- [ ] Verify all features work

## Final Verification ✅

- [ ] Homepage loads correctly
- [ ] All sections display properly
- [ ] Admin login works
- [ ] Contact form functions
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain (optional)

## Essential Files Created ✅

Your project now has:
- `.gitignore` - Excludes sensitive files from Git
- `.env.example` - Template for environment variables
- `README.md` - Project documentation
- `server/config.ts` - Production configuration
- `DEPLOYMENT_STEPS.md` - Detailed deployment guide

## Commands Reference

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run check       # Check TypeScript
```

### Git Commands
```bash
git add .           # Stage all changes
git commit -m "msg" # Commit with message
git push           # Push to GitHub
```

### Troubleshooting
```bash
node --version     # Check Node.js version
npm list          # View installed packages
git status        # Check Git status
```

## Live URLs After Deployment

- **Your Website**: `https://your-service-name.onrender.com`
- **Admin Dashboard**: `https://your-service-name.onrender.com/admin`
- **GitHub Repository**: `https://github.com/yourusername/portfolio-website`

## Success Indicators

✅ **Local Development**: Site runs on localhost:5000
✅ **GitHub**: Code visible in repository
✅ **Database**: Connected to MongoDB Atlas
✅ **Render**: Build completed successfully
✅ **Live Site**: Accessible via Render URL
✅ **Full Functionality**: All features working

Your professional portfolio is now ready for deployment!