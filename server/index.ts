import dotenv from "dotenv";
import path from "path";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite-runtime";
import { connectDB } from "./db";
import { setupSecurity } from "./security";
import { setupProductionConfig, validateEnvironment } from "./production";
import cors from 'cors';
import { advancedCORS, validateDomain } from './middleware/cors-advanced';

// Load environment variables from root directory
const envPath = path.join(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  if (process.env.NODE_ENV === 'production') {
    console.log('No .env file found in production - using environment variables');
  } else {
    console.error('Error loading .env file:', result.error);
  }
} else {
  console.log('Environment variables loaded successfully');
}
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

const app = express();
const httpServer = createServer(app);

// Configure CORS for custom domain support
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin || allowedOrigin === '*';
      }
      // Handle regex patterns for custom domains
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    // For development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Log for debugging
    if (!isAllowed) {
      console.warn(`CORS: Origin ${origin} not allowed`);
    }
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token'],
  optionsSuccessStatus: 200
};

// Use both standard CORS and advanced CORS middleware
app.use(cors(corsOptions));
app.use(advancedCORS);
app.use(validateDomain);

// Enhanced CORS configuration for custom domains
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://noorain-raza-portfolio.onrender.com',
      'https://www.noorain-raza-portfolio.onrender.com',
      process.env.RENDER_EXTERNAL_URL,
      process.env.RENDER_SERVICE_NAME ? `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null,
      "https://*.onrender.com"
    ].filter(Boolean) as string[]
  : [
      "http://localhost:5173", 
      "http://localhost:5000",
      "https://noorain-raza-portfolio.onrender.com",
      "https://www.noorain-raza-portfolio.onrender.com"
    ];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

// Store Socket.IO instance globally for use in routes
app.set('io', io);

// Socket.IO connection handling with comprehensive real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join admin room for authenticated admin users
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log('Admin joined:', socket.id);
    // Send admin-specific data
    socket.emit('admin-connected', { id: socket.id, timestamp: new Date() });
  });
  
  // Join public room for public users
  socket.on('join-public', () => {
    socket.join('public');
    console.log('Public user joined:', socket.id);
    // Send welcome message to public users
    socket.emit('public-connected', { id: socket.id, timestamp: new Date() });
  });
  
  // Handle real-time content updates from admin
  socket.on('content-update', (data) => {
    console.log('Content update received:', data);
    // Broadcast to all public clients immediately
    io.to('public').emit('content-updated', data);
    // Also notify other admin clients
    socket.to('admin').emit('admin-sync', data);
  });
  
  // Handle skill updates
  socket.on('skills-update', (data) => {
    console.log('Skills update received:', data);
    io.to('public').emit('skills-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'skills', data });
  });
  
  // Handle project updates
  socket.on('projects-update', (data) => {
    console.log('Projects update received:', data);
    io.to('public').emit('projects-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'projects', data });
  });
  
  // Handle education updates
  socket.on('education-update', (data) => {
    console.log('Education update received:', data);
    io.to('public').emit('education-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'education', data });
  });
  
  // Handle experience updates
  socket.on('experience-update', (data) => {
    console.log('Experience update received:', data);
    io.to('public').emit('experience-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'experience', data });
  });
  
  // Handle certifications updates
  socket.on('certifications-update', (data) => {
    console.log('Certifications update received:', data);
    io.to('public').emit('certifications-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'certifications', data });
  });
  
  // Handle blog updates
  socket.on('blog-update', (data) => {
    console.log('Blog update received:', data);
    io.to('public').emit('blog-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'blog', data });
  });
  
  // Handle contact updates
  socket.on('contact-update', (data) => {
    console.log('Contact update received:', data);
    io.to('public').emit('contact-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'contact', data });
  });
  
  // Handle about content updates
  socket.on('about-update', (data) => {
    console.log('About update received:', data);
    io.to('public').emit('about-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'about', data });
  });
  
  // Handle hero section updates
  socket.on('hero-update', (data) => {
    console.log('Hero update received:', data);
    io.to('public').emit('hero-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'hero', data });
  });
  
  // Handle footer updates
  socket.on('footer-update', (data) => {
    console.log('Footer update received:', data);
    io.to('public').emit('footer-updated', data);
    socket.to('admin').emit('admin-sync', { type: 'footer', data });
  });
  
  // Handle new contact form submissions
  socket.on('new-contact-submission', (data) => {
    console.log('New contact submission received:', data);
    // Notify all admin clients of new contact
    io.to('admin').emit('new-contact', data);
  });
  
  // Handle real-time notifications
  socket.on('send-notification', (data) => {
    console.log('Notification sent:', data);
    if (data.target === 'admin') {
      io.to('admin').emit('notification', data);
    } else if (data.target === 'public') {
      io.to('public').emit('notification', data);
    } else {
      // Broadcast to all
      io.emit('notification', data);
    }
  });
  
  // Handle typing indicators for contact forms
  socket.on('typing-start', (data) => {
    socket.to('admin').emit('user-typing', { ...data, socketId: socket.id });
  });
  
  socket.on('typing-stop', (data) => {
    socket.to('admin').emit('user-stopped-typing', { ...data, socketId: socket.id });
  });
  
  // Handle page view analytics
  socket.on('page-view', (data) => {
    console.log('Page view:', data);
    socket.to('admin').emit('analytics-update', {
      type: 'page-view',
      data: { ...data, timestamp: new Date(), socketId: socket.id }
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
    // Notify admin of user disconnection for analytics
    socket.to('admin').emit('user-disconnected', { 
      socketId: socket.id, 
      reason, 
      timestamp: new Date() 
    });
  });
});

// Trust proxy for rate limiting and security headers
app.set('trust proxy', 1);

// Setup comprehensive security middleware
setupSecurity(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configure secure session management with MongoDB store
const mongoStore = MongoStore.create({
  mongoUrl: 'mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  ttl: 30 * 24 * 60 * 60, // 30 days
  touchAfter: 3600, // Update session every hour of activity
  autoRemove: 'native',
  collectionName: 'admin_sessions',
  stringify: false,
  serialize: (session) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Serializing session:', session.id);
    }
    return session;
  },
  unserialize: (session) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Unserializing session:', session.id);
    }
    return session;
  }
});

// Log session store events
mongoStore.on('error', (error) => {
  console.error('Session store error:', error);
});

mongoStore.on('create', (sessionId) => {
  console.log('Session created:', sessionId);
});

mongoStore.on('update', (sessionId) => {
  console.log('Session updated:', sessionId);
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'hpnserver-ultra-secure-session-key-2024',
  resave: true, // Force session save to ensure persistence
  saveUninitialized: false, // Don't create session until something stored
  rolling: true, // Reset expiration on activity to keep session alive
  store: mongoStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: false, // Allow client-side access for persistence
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  },
  name: 'admin.sid'
}));

// Session health monitoring
app.use((req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    req.session.lastActivity = new Date();
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server...");
    
    // Validate environment variables
    validateEnvironment();
    
    // Setup production configurations
    setupProductionConfig(app);
    
    // Connect to MongoDB first
    console.log("Connecting to MongoDB...");
    await connectDB();
    
    console.log("Registering routes...");
    const server = await registerRoutes(app, httpServer);
    
    // Auto-organize skills on startup
    try {
      const { SkillCategory, Skill } = await import("../shared/schema.js");
      console.log('Organizing skills by category...');
      
      // Define skill categorizations
      const skillCategorizations = {
        "Programming Languages": { icon: "💻", displayOrder: 1, skills: ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "HTML", "CSS"] },
        "Frameworks & Libraries": { icon: "🔧", displayOrder: 2, skills: ["React", "Vue.js", "Angular", "Django", "Flask", "Next.js", "Express.js", "Node.js"] },
        "DevOps & Cloud": { icon: "☁️", displayOrder: 3, skills: ["Docker", "Kubernetes", "AWS", "Google Cloud", "Terraform", "Jenkins", "GitHub Actions", "Nginx"] },
        "Databases": { icon: "🗄️", displayOrder: 4, skills: ["MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB"] },
        "Tools & Platforms": { icon: "🛠️", displayOrder: 5, skills: ["Git", "GitHub", "Vercel", "Netlify", "Heroku", "Vite"] },
        "Design & UI/UX": { icon: "🎨", displayOrder: 6, skills: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Tailwind CSS"] },
        "Data Science & ML": { icon: "📊", displayOrder: 7, skills: ["Pandas", "NumPy", "scikit-learn", "PyTorch", "TensorFlow"] },
        "Web Technologies": { icon: "🌐", displayOrder: 8, skills: ["REST API", "GraphQL", "WebSocket"] },
        "Mobile Development": { icon: "📱", displayOrder: 9, skills: ["React Native", "Flutter"] },
        "Operating Systems": { icon: "🖥️", displayOrder: 10, skills: ["Linux", "Windows", "macOS", "Ubuntu"] }
      };

      // Create categories and organize skills
      const categoryMap = new Map();
      let categoriesCreated = 0;
      
      for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
        let category = await SkillCategory.findOne({ name: categoryName });
        if (!category) {
          category = new SkillCategory({
            name: categoryName,
            icon: categoryData.icon,
            displayOrder: categoryData.displayOrder,
            isActive: true
          });
          await category.save();
          categoriesCreated++;
        }
        categoryMap.set(categoryName, (category._id as any)?.toString() || '');
      }

      // Organize skills by category (preserve existing isActive state)
      let skillsProcessed = 0;
      for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
        const categoryId = categoryMap.get(categoryName);
        let order = 1;
        
        for (const skillName of categoryData.skills) {
          const skill = await Skill.findOne({ name: { $regex: new RegExp(`^${skillName}$`, 'i') } });
          if (skill) {
            // Only update category and order, preserve isActive state
            await Skill.updateOne({ _id: skill._id }, { 
              categoryId: categoryId,
              displayOrder: order
            });
            skillsProcessed++;
          }
          order++;
        }
      }
      
      console.log(`✓ Skills organized: ${categoriesCreated} categories, ${skillsProcessed} skills categorized, preserving active status`);
    } catch (error) {
      console.log('Skills organization skipped:', (error as Error).message);
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Health check is now handled in production.ts

    // Keep-alive function to prevent Render from sleeping
    const keepAlive = () => {
      if (process.env.NODE_ENV === 'production') {
        const renderUrl = process.env.RENDER_EXTERNAL_URL || `https://${process.env.RENDER_SERVICE_NAME}.onrender.com`;
        
        // Self-ping to keep service alive
        const keepAliveInterval = setInterval(async () => {
          try {
            const response = await fetch(`${renderUrl}/api/footer`, {
              method: 'GET',
              headers: {
                'User-Agent': 'KeepAlive-Service/1.0'
              }
            });
            console.log(`Keep-alive ping: ${response.status} at ${new Date().toISOString()}`);
          } catch (error) {
            console.log('Keep-alive ping failed:', (error as Error).message);
          }
        }, 14 * 60 * 1000); // Ping every 14 minutes
        
        console.log('Keep-alive service started for production');
        console.log(`Service will ping: ${renderUrl}/api/footer every 14 minutes`);
        
        // Cleanup on process termination
        process.on('SIGTERM', () => {
          console.log('SIGTERM received, cleaning up...');
          clearInterval(keepAliveInterval);
          process.exit(0);
        });
        
        process.on('SIGINT', () => {
          console.log('SIGINT received, cleaning up...');
          clearInterval(keepAliveInterval);
          process.exit(0);
        });
      }
    };

    // Use PORT from environment (Render sets this automatically) or default to 5000
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      keepAlive(); // Start keep-alive service
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
