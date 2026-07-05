export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.DATABASE_URL || process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Enhanced CORS settings for custom domain support
  corsOrigin: process.env.NODE_ENV === 'production' 
    ? [
        'https://noorain-raza-portfolio.onrender.com',
        'https://www.noorain-raza-portfolio.onrender.com',
        process.env.RENDER_EXTERNAL_URL,
        `https://${process.env.RENDER_SERVICE_NAME}.onrender.com`,
        'https://*.onrender.com',
        // Allow any custom domain for future flexibility
        /^https:\/\/.*\.tech$/,
        /^https:\/\/.*\.com$/,
        /^https:\/\/.*\.dev$/,
        /^https:\/\/.*\.app$/,
        /^https:\/\/.*\.me$/
      ].filter(Boolean)
    : [
        'http://localhost:3000', 
        'http://localhost:5000',
        'http://localhost:5173',
        'https://noorain-raza-portfolio.onrender.com',
        'https://www.noorain-raza-portfolio.onrender.com'
      ],
    
  // Session settings
  sessionSettings: {
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Render-specific configurations
  render: {
    externalUrl: process.env.RENDER_EXTERNAL_URL,
    serviceName: process.env.RENDER_SERVICE_NAME,
    region: process.env.RENDER_REGION || 'oregon',
    instanceType: process.env.RENDER_INSTANCE_TYPE || 'free'
  }
};