import { Request, Response, NextFunction } from 'express';

// Advanced CORS middleware for custom domain adaptation
export const advancedCORS = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  // Enhanced origin validation for custom domains
  const isValidOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true; // Allow requests without origin
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
    
    // Allow noorain.me and its subdomains
    if (origin.includes('noorain.me')) {
      return true;
    }
    
    // Allow common development domains
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // Allow Render URLs
    if (origin.includes('onrender.com')) {
      return true;
    }
    
    // Allow custom domains with common TLDs
    const customDomainPatterns = [
      /^https:\/\/[a-zA-Z0-9.-]+\.(com|net|org|tech|dev|app|io|me)$/,
      /^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/,
      /^https:\/\/[a-zA-Z0-9.-]+\.netlify\.app$/
    ];
    
    return customDomainPatterns.some(pattern => pattern.test(origin));
  };
  
  // Set CORS headers
  if (isValidOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token',
    'X-Domain-Override'
  ].join(', '));
  
  res.header('Access-Control-Expose-Headers', 'X-CSRF-Token,X-Domain-Info');
  
  // Add domain info header for debugging
  res.header('X-Domain-Info', JSON.stringify({
    origin: origin || 'none',
    host: host || 'unknown',
    allowed: isValidOrigin(origin)
  }));
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(200).end();
  }
  
  next();
};

// Domain validation middleware
export const validateDomain = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Log domain access for monitoring
  if (origin || referer) {
    console.log(`🌐 Domain access: ${origin || referer} -> ${req.method} ${req.path}`);
  }
  
  next();
};