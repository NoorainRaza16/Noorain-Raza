// Production-specific configurations for Render deployment
import { Express } from 'express';

export function setupProductionConfig(app: Express) {
  // Enable trust proxy for proper client IP detection behind Render's proxy
  app.set('trust proxy', 1);
  
  // Production security headers
  app.use((req, res, next) => {
    // Security headers for production
    if (process.env.NODE_ENV === 'production') {
      // Strict Transport Security
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' wss: ws:; " +
        "frame-ancestors 'none';"
      );
      
      // X-Frame-Options
      res.setHeader('X-Frame-Options', 'DENY');
      
      // X-Content-Type-Options
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // X-XSS-Protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
    
    next();
  });
  
  // Health check endpoint for Render
  app.get('/health', (req, res) => {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      node_version: process.version,
      platform: process.platform,
      arch: process.arch
    };
    
    res.status(200).json(healthData);
  });
  
  // Robots.txt for production
  app.get('/robots.txt', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.type('text/plain');
      res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://noorain.me/sitemap.xml`);
    } else {
      res.type('text/plain');
      res.send(`User-agent: *
Disallow: /`);
    }
  });
  
  // Sitemap.xml for SEO - Force custom domain
  app.get('/sitemap.xml', (req, res) => {
    // Force custom domain regardless of environment variables
    const baseUrl = 'https://noorain.me';
    
    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#skills</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#projects</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#experience</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`);
  });
  
  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    // Close server gracefully
    process.exit(0);
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

export function validateEnvironment() {
  const requiredEnvVars = [
    'NODE_ENV',
    'MONGODB_URI'
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (mongoUri && !mongoUri.startsWith('mongodb')) {
    console.error('Invalid MongoDB URI format');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
  
  console.log('Environment validation completed successfully');
}