# Render Deployment Guide

## Prerequisites
- GitHub account with your portfolio code
- Render account (free tier available)
- MongoDB Atlas account (free tier available)

## Step 1: Prepare MongoDB Database
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (0.0.0.0/0 for Render)
5. Get your connection string in format:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Render

### Option A: Web Service Deployment (Recommended)

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Web Service**
   - **Name**: `portfolio-web-service` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your location
   - **Branch**: `main` (or your deployment branch)
   - **Build Command**: `npm install && npm run build:client && npm run build:server`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for free tier)

3. **Environment Variables**
   Add these environment variables in Render dashboard:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `NODE_ENV` | `production` | Set environment to production |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
   | `SESSION_SECRET` | `your-super-secret-key-here` | Random secure string (32+ chars) |
   | `PORT` | (auto-set by Render) | Don't set manually |

4. **Advanced Settings**
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: `Yes` (deploys on git push)

### Option B: Using render.yaml (Infrastructure as Code)

1. **Push render.yaml to your repository**
   - The `render.yaml` file is already created in your project
   - Commit and push to your main branch

2. **Create Blueprint in Render**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Select the `render.yaml` file

## Step 3: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your web service in Render
   - Click "Settings" → "Custom Domains"
   - Add your domain

2. **Configure DNS**
   - Add CNAME record pointing to your Render URL
   - Example: `CNAME www your-app.onrender.com`

## Step 4: Post-Deployment Setup

1. **Verify Deployment**
   - Check logs for any errors
   - Visit your deployed URL
   - Test health endpoint: `https://your-app.onrender.com/health`

2. **Admin Access**
   - Default admin will be created automatically
   - Access admin panel: `https://your-app.onrender.com/admin`

3. **Keep-Alive Service**
   - The built-in keep-alive service will prevent your free tier app from sleeping
   - Pings the service every 14 minutes automatically

## Environment Variables Reference

### Required Variables
- `NODE_ENV=production`
- `MONGODB_URI` - Your MongoDB connection string
- `SESSION_SECRET` - Secure random string for sessions

### Optional Variables (Auto-set by Render)
- `PORT` - Application port (set by Render)
- `RENDER_EXTERNAL_URL` - Your app's external URL
- `RENDER_SERVICE_NAME` - Your service name

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify build commands are correct

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Application Not Starting**
   - Check start command: `npm start`
   - Verify environment variables are set
   - Check application logs

4. **Free Tier Limitations**
   - Service sleeps after 15 minutes of inactivity
   - Keep-alive service included to mitigate this
   - 750 hours/month limit on free tier

### Performance Optimization

1. **Enable Caching**
   - Static assets are cached automatically
   - Database queries use connection pooling

2. **Monitor Performance**
   - Use Render's metrics dashboard
   - Monitor response times and error rates

3. **Scaling Options**
   - Upgrade to paid plan for better performance
   - Consider database indexing for large datasets

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to git
   - Use Render's environment variable interface
   - Rotate secrets regularly

2. **Database Security**
   - Use strong database passwords
   - Regularly update dependencies
   - Monitor for security vulnerabilities

3. **HTTPS**
   - Render provides free SSL certificates
   - All traffic is encrypted by default

## Monitoring and Maintenance

1. **Health Checks**
   - Endpoint: `/health`
   - Returns service status and metrics

2. **Logs**
   - Access logs via Render dashboard
   - Monitor for errors and performance issues

3. **Backups**
   - Set up MongoDB Atlas backups
   - Export important data regularly

## Cost Optimization

1. **Free Tier Usage**
   - 750 hours per month included
   - Service sleeps after 15 minutes of inactivity
   - Keep-alive service included

2. **Monitoring Usage**
   - Check usage in Render dashboard
   - Monitor bandwidth and compute hours

3. **Upgrade Path**
   - Consider paid plans for production apps
   - Better performance and no sleep timeout

## Support Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/deployment/)

---

Your portfolio is now ready for deployment on Render's free tier with automatic keep-alive functionality!