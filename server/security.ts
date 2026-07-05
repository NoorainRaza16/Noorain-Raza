import { Express, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiting configurations
const createRateLimit = (windowMs: number, max: number, message: string, skipAdminAuth = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Skip rate limiting for authenticated admin users
      if (skipAdminAuth) {
        // Check session authentication
        if (req.session && req.session.user && req.session.isAuthenticated) {
          console.log(`Rate limit skipped for authenticated user: ${req.session.user.username}`);
          return true;
        }
        
        // Also check for admin session cookie as backup
        if (req.headers.cookie && req.headers.cookie.includes('admin.sid=')) {
          console.log('Rate limit skipped for admin session cookie');
          return true;
        }
        
        // Skip for admin panel routes to prevent lockout
        if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
          console.log(`Rate limit skipped for admin route: ${req.path}`);
          return true;
        }
      }
      return false;
    },
    handler: (req: Request, res: Response) => {
      console.log(`Rate limited request from ${req.ip} to ${req.path}`);
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General API rate limit - skip for authenticated admin users
export const generalApiLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  1000, // increased limit for general API (was 100)
  'Too many requests from this IP, please try again later.',
  true // Skip rate limiting for authenticated admin users
);

// Strict rate limit for authentication endpoints
export const authLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // increased limit for auth attempts (was 5)
  'Too many authentication attempts, please try again later.'
);

// Admin endpoints rate limit - skip for authenticated admin users
export const adminLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  500, // increased limit for admin endpoints (was 50)
  'Too many admin requests, please try again later.',
  true // Skip rate limiting for authenticated admin users
);

// Contact form rate limit - skip for authenticated admin users
export const contactLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  20, // increased limit for contact forms (was 3)
  'Too many contact form submissions, please try again later.',
  true // Skip rate limiting for authenticated admin users
);

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  
  // HSTS - Force HTTPS for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - Disable dangerous features
  res.setHeader('Permissions-Policy', [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'speaker=()',
    'ambient-light-sensor=()',
    'accelerometer=()',
    'autoplay=()'
  ].join(', '));
  
  // Content Security Policy
  const isDevelopment = process.env.NODE_ENV === 'development';
  const cspDirectives = [
    "default-src 'self'",
    isDevelopment 
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" 
      : "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' ws: wss: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  next();
};

// CSRF Protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and preflight OPTIONS
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Check for CSRF token in headers
  const token = req.headers['x-csrf-token'] || req.headers['x-requested-with'];
  
  // For AJAX requests, check for XMLHttpRequest header
  if (token === 'XMLHttpRequest' || req.headers['content-type']?.includes('application/json')) {
    return next();
  }
  
  // Allow login requests
  if (req.path === '/api/login' || req.path === '/api/logout') {
    return next();
  }
  
  // Allow public API endpoints
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api/admin/')) {
    return next();
  }
  
  // For admin requests, we'll let the requireAuth middleware handle authentication
  // and just skip CSRF for now to allow file uploads to work
  if (req.path.startsWith('/api/admin/')) {
    return next();
  }
  
  console.log('CSRF Protection: Rejecting request', {
    method: req.method,
    path: req.path,
    hasSession: !!req.session,
    hasUser: !!(req.session && req.session.user),
    isAuthenticated: !!(req.session && req.session.isAuthenticated),
    headers: {
      'x-csrf-token': req.headers['x-csrf-token'],
      'x-requested-with': req.headers['x-requested-with'],
      'content-type': req.headers['content-type']
    }
  });
  
  return res.status(403).json({ 
    error: 'CSRF protection: Request rejected',
    code: 'CSRF_INVALID'
  });
};

// Input validation and sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Remove null bytes and control characters
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
              .trim()
              .slice(0, 10000); // Limit string length
  };
  
  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize key names too
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Security monitoring middleware
export const securityMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\<script\>)/i,
    /(javascript:)/i,
    /(data:text\/html)/i,
    /(vbscript:)/i,
    /(\<iframe)/i,
    /(eval\()/i,
    /(expression\()/i,
    /(\bunion\b.*\bselect\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bdelete\b.*\bfrom\b)/i,
    /(\bupdate\b.*\bset\b)/i
  ];
  
  const checkSuspicious = (str: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  // Check URL and query parameters
  const fullUrl = req.originalUrl;
  if (checkSuspicious(fullUrl)) {
    console.warn(`Suspicious request detected: ${req.ip} - ${fullUrl}`);
    return res.status(400).json({ 
      error: 'Invalid request detected',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  // Check request body for suspicious content
  if (req.body && typeof req.body === 'object') {
    const bodyStr = JSON.stringify(req.body);
    if (checkSuspicious(bodyStr)) {
      console.warn(`Suspicious payload detected: ${req.ip} - ${req.path}`);
      return res.status(400).json({ 
        error: 'Invalid payload detected',
        code: 'SECURITY_VIOLATION'
      });
    }
  }
  
  next();
};

// Setup all security middleware
export function setupSecurity(app: Express) {
  // Apply security headers first
  app.use(securityHeaders);
  
  // Apply rate limiting
  app.use('/api/login', authLimit);
  app.use('/api/logout', authLimit);
  app.use('/api/contact', contactLimit);
  app.use('/api/admin', adminLimit);
  app.use('/api', generalApiLimit);
  
  // Apply input sanitization
  app.use(sanitizeInput);
  
  // Apply security monitoring
  app.use(securityMonitoring);
  
  // Apply CSRF protection
  app.use(csrfProtection);
  
  console.log('Security middleware configured successfully');
}