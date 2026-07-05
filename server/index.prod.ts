import dotenv from "dotenv";
import path from "path";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import { connectDB } from "./db";
import { setupSecurity } from "./security";
import { setupProductionConfig, validateEnvironment } from "./production";

// Load environment variables from root directory
const envPath = path.join(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
  console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
}

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.RENDER_EXTERNAL_URL,
      process.env.RENDER_SERVICE_NAME ? `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null,
      "https://*.onrender.com"
    ].filter(Boolean) as string[]
  : ["http://localhost:5173", "http://localhost:5000"];

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
  console.log(`Client connected: ${socket.id}`);
  
  // Handle public user connections
  socket.on('join-public', () => {
    socket.join('public');
    console.log(`Public user joined: ${socket.id}`);
    
    // Send welcome message to public users
    socket.emit('welcome', { 
      message: 'Welcome to the portfolio!',
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle admin connections with authentication
  socket.on('join-admin', (data) => {
    // In a real app, verify admin credentials here
    socket.join('admin');
    console.log(`Admin joined: ${socket.id}`);
    
    // Send admin-specific data
    socket.emit('admin-connected', {
      message: 'Admin dashboard connected',
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle page view analytics
  socket.on('page-view', (data) => {
    console.log('Page view:', data);
    
    // Broadcast to admin users for real-time analytics
    socket.to('admin').emit('analytics-update', {
      type: 'page-view',
      data: data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle section view analytics
  socket.on('section-view', (data) => {
    console.log(`Socket.IO: Analytics ${data.section}-viewed sent to admin`);
    
    // Broadcast to admin users
    socket.to('admin').emit('analytics-update', {
      type: 'section-view',
      data: data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle real-time notifications
  socket.on('send-notification', (data) => {
    // Broadcast to all connected clients
    io.emit('notification', {
      message: data.message,
      type: data.type || 'info',
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle contact form submissions in real-time
  socket.on('contact-form-submitted', (data) => {
    console.log('Contact form submitted:', data);
    
    // Notify admin users immediately
    socket.to('admin').emit('new-contact', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle blog interactions
  socket.on('blog-interaction', (data) => {
    console.log('Blog interaction:', data);
    
    // Update real-time engagement metrics
    socket.to('admin').emit('blog-analytics', {
      type: data.type, // 'view', 'like', 'comment', etc.
      postId: data.postId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle project showcases
  socket.on('project-showcase', (data) => {
    console.log('Project showcased:', data);
    
    // Broadcast project interest to admin
    socket.to('admin').emit('project-interest', {
      projectId: data.projectId,
      action: data.action, // 'view', 'demo', 'github'
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle skill assessments or interactions
  socket.on('skill-interaction', (data) => {
    console.log('Skill interaction:', data);
    
    // Track skill engagement
    socket.to('admin').emit('skill-analytics', {
      skill: data.skill,
      category: data.category,
      action: data.action,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  // Middleware setup
  setupSecurity(app);

  // Database connection
  await connectDB();

  // Production configuration
  setupProductionConfig(app);

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || '',
      touchAfter: 24 * 3600, // lazy session update
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));

  // Routes
  registerRoutes(app);

  // Serve static files in production
  serveStatic(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    log(`Error ${status}: ${message}`);
    
    res.status(status).json({ 
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  });

  // Start server
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
}

// Start the server
startServer().catch(console.error);