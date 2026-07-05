# Portfolio Deployment Guide

This guide provides step-by-step instructions on how to push your portfolio project to GitHub and deploy it on various platforms like Vercel, Netlify, or GitHub Pages.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Pushing to GitHub](#pushing-to-github)
- [Deploying on Vercel](#deploying-on-vercel)
- [Deploying on Netlify](#deploying-on-netlify)
- [Deploying on GitHub Pages](#deploying-on-github-pages)
- [Setting Up Custom Domain](#setting-up-custom-domain)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following:

1. [Git](https://git-scm.com/downloads) installed on your computer
2. A [GitHub](https://github.com/) account
3. Your portfolio project ready for deployment
4. Node.js and npm installed (for building the project)

## Pushing to GitHub

### Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to your project directory
cd path/to/your/portfolio

# Initialize a new Git repository
git init
```

### Step 2: Create .gitignore File

Create a `.gitignore` file to exclude unnecessary files:

```
# Dependencies
/node_modules
/.pnp
.pnp.js

# Build outputs
/dist
/build
/.next

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea
.vscode
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
```

### Step 3: Add and Commit Files

```bash
# Add all files to staging area
git add .

# Make your first commit
git commit -m "Initial commit: Portfolio project"
```

### Step 4: Create a GitHub Repository

1. Go to [GitHub](https://github.com/)
2. Click the "+" icon in the top right and select "New repository"
3. Enter a repository name (e.g., "portfolio")
4. Choose visibility (public or private)
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 5: Link Local Repository to GitHub

```bash
# Add the remote repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push your code to GitHub
git push -u origin main
# Note: If your default branch is 'master' use:
# git push -u origin master
```

## Deploying on Vercel

Vercel is the recommended platform for deploying React/Next.js applications due to its simplicity and optimization.

### Step 1: Create a Vercel Account

1. Go to [Vercel](https://vercel.com/)
2. Sign up or log in (you can use your GitHub account to sign in)

### Step 2: Import Your GitHub Repository

1. Click "Add New..." > "Project"
2. Select your GitHub account and find your portfolio repository
3. Click "Import"

### Step 3: Configure Project

1. Configure build settings:
   - Framework Preset: Select "Other" (or "Next.js" if applicable)
   - Build Command: `npm run build`
   - Output Directory: `dist` (or appropriate output directory for your project)
   - Root Directory: `./` (or appropriate root if your project is in a subdirectory)

2. Set environment variables if needed (like API keys)

3. Click "Deploy"

### Step 4: Wait for Deployment

Vercel will now build and deploy your site. This usually takes a few minutes.

### Step 5: Access Your Deployed Site

Once deployment is complete, Vercel will provide you with a URL (e.g., `https://your-portfolio.vercel.app`).

## Deploying on Netlify

Netlify is another excellent platform for static site hosting.

### Step 1: Create a Netlify Account

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up or log in (you can use your GitHub account)

### Step 2: Import Your GitHub Repository

1. Click "New site from Git"
2. Select "GitHub" as your Git provider
3. Authenticate with GitHub and select your portfolio repository

### Step 3: Configure Build Settings

1. Set build configuration:
   - Build command: `npm run build`
   - Publish directory: `dist` (or appropriate output directory for your project)

2. Add environment variables if needed

3. Click "Deploy site"

### Step 4: Wait for Deployment

Netlify will build and deploy your site. This usually takes a few minutes.

### Step 5: Access Your Deployed Site

Once deployment is complete, Netlify will assign a random subdomain (e.g., `https://random-name-123456.netlify.app`).

## Deploying on GitHub Pages

GitHub Pages is a free hosting service provided directly by GitHub.

### Step 1: Install GitHub Pages Package

```bash
npm install gh-pages --save-dev
```

### Step 2: Update package.json

Add these scripts to your `package.json`:

```json
"scripts": {
  // ... other scripts
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"  // Replace 'dist' with your build output folder
}
```

Also, add a homepage field at the top level:

```json
"homepage": "https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME",
```

### Step 3: Deploy to GitHub Pages

```bash
npm run deploy
```

### Step 4: Configure GitHub Repository

1. Go to your GitHub repository
2. Click "Settings" > "Pages"
3. Under "Source", select "gh-pages" branch
4. Click "Save"

### Step 5: Access Your Deployed Site

Your site will be available at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME`.

## Setting Up Custom Domain

### For Vercel:

1. Go to your project dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update your domain's DNS settings as instructed

### For Netlify:

1. Go to your site dashboard
2. Click "Domain settings" > "Add custom domain"
3. Enter your domain name and click "Verify"
4. Update your domain's DNS settings as instructed

### For GitHub Pages:

1. Go to your repository
2. Click "Settings" > "Pages"
3. Under "Custom domain", enter your domain
4. Update your domain's DNS settings as instructed

## Troubleshooting

### Build Failures

- Check your build logs for errors
- Ensure all dependencies are correctly installed
- Verify that your build command is correct

### 404 Errors After Deployment

- Make sure your routing is configured correctly
- For SPAs, you may need to configure redirects for client-side routing

### Custom Domain Not Working

- Double-check DNS settings
- DNS changes can take up to 48 hours to propagate
- Verify SSL/TLS certificate setup

### Continuous Deployment Not Working

- Check webhook settings
- Ensure build hooks are properly configured
- Verify branch deployment settings

---

Remember to regularly update your portfolio and push changes to GitHub. The continuous deployment setup on these platforms will automatically rebuild and update your live site!