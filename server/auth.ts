import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User, AdminSession, type IUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      email: string;
    };
    isAuthenticated?: boolean;
    lastActivity?: Date;
  }
}

// Secure random session ID generation
function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash password with strong encryption
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare passwords securely
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}

// Create secure admin session using Express sessions
async function createAdminSession(user: IUser, req: Request): Promise<void> {
  console.log('Creating session for user:', user.username);
  console.log('Session ID before save:', req.sessionID);
  
  // Set session data directly without regeneration to avoid issues
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  req.session.isAuthenticated = true;
  req.session.lastActivity = new Date();
  
  // Save session immediately
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        reject(err);
      } else {
        console.log('Session regenerated successfully');
        resolve();
      }
    });
  });
  
  console.log('Session data set:', {
    isAuthenticated: req.session.isAuthenticated,
    user: req.session.user,
    sessionId: req.sessionID
  });
  
  // Clean up old MongoDB sessions for this user (legacy cleanup)
  try {
    await AdminSession.deleteMany({ userId: (user._id as any).toString(), isActive: true });
  } catch (error) {
    console.warn('Legacy session cleanup warning:', error);
  }
}

// Validate admin session using Express sessions
async function validateAdminSession(req: Request): Promise<IUser | null> {
  try {
    // Check if session exists and is authenticated
    if (!req.session || !req.session.isAuthenticated || !req.session.user) {
      return null;
    }
    
    // Verify user still exists in database and is admin
    const user = await User.findById(req.session.user.id).select('-password');
    if (!user || user.role !== 'admin' || !user.isActive) {
      // User no longer exists, not admin, or inactive - destroy session
      console.log('User validation failed, destroying session');
      await new Promise<void>((resolve) => {
        req.session.destroy((err) => {
          if (err) console.error('Session destruction error:', err);
          resolve();
        });
      });
      return null;
    }
    
    // Update last activity
    req.session.lastActivity = new Date();
    
    // Save session to update last activity
    req.session.save((err) => {
      if (err) {
        console.error('Session save error during validation:', err);
      }
    });
    
    console.log('Session validated successfully for user:', user.username);
    return user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// Destroy admin session
async function destroyAdminSession(req: Request): Promise<void> {
  return new Promise((resolve) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      console.log('Session destroyed successfully');
      resolve();
    });
  });
}

// Cleanup expired sessions (automatic maintenance)
async function cleanupExpiredSessions(): Promise<void> {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await AdminSession.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { lastActivity: { $lt: oneWeekAgo } },
        { isActive: false }
      ]
    });
    console.log('Expired sessions cleaned up successfully');
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Middleware to require authentication
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check session directly
    if (!req.session || !req.session.isAuthenticated || !req.session.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required - please log in',
        code: 'AUTHENTICATION_FAILED'
      });
    }

    // Validate user exists in database
    const user = await User.findById(req.session.user.id).select('-password');
    if (!user || user.role !== 'admin' || !user.isActive) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required - please log in',
        code: 'AUTHENTICATION_FAILED'
      });
    }
    
    // Update last activity
    req.session.lastActivity = new Date();
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: "Authentication service error"
    });
  }
};

// Setup authentication routes and middleware
export function setupAuth(app: Express) {
  console.log("Security middleware configured successfully");
  
  // Initialize admin user if it doesn't exist
  (async () => {
    try {
      console.log("Checking for admin user...");
      const adminUser = await User.findOne({ username: "HPNServer" });
      if (!adminUser) {
        console.log("Creating admin user...");
        const hashedPassword = await hashPassword("HPNServer.com");
        const newAdmin = new User({
          username: "HPNServer",
          email: "noorain@hpnserver.com",
          password: hashedPassword,
          role: "admin",
          isActive: true
        });
        await newAdmin.save();
        console.log("✓ Secure admin user created successfully");
      } else {
        console.log("✓ Admin user found, ensuring proper configuration...");
        // Update existing user to ensure proper format
        if (!adminUser.isActive || adminUser.role !== 'admin') {
          adminUser.role = "admin";
          adminUser.isActive = true;
          await adminUser.save();
          console.log("✓ Admin user configuration updated");
        }
      }
    } catch (error) {
      console.error("Error initializing admin user:", error);
    }
  })();
  
  // Auto-cleanup expired sessions every hour
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
  
  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      
      // Require all three credentials
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password required"
        });
      }
      
      // Find user by username first
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Admin access denied"
        });
      }
      
      // Verify user is admin and active
      if (user.role !== 'admin' || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Admin access denied"
        });
      }
      
      // Verify all three credentials match exactly
      const isValidPassword = await comparePasswords(password, user.password);
      const isValidEmail = user.email === email;
      const isValidUsername = user.username === username;
      
      if (!isValidPassword || !isValidEmail || !isValidUsername) {
        return res.status(401).json({
          success: false,
          message: "Admin access denied"
        });
      }
      
      // Create secure session
      await createAdminSession(user, req);
      
      return res.json({
        success: true,
        user: {
          id: (user._id as any).toString(),
          username: user.username,
          email: user.email,
          role: user.role
        },
        message: "Authentication successful"
      });
      
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: "Authentication service temporarily unavailable"
      });
    }
  });

  // Logout endpoint
  app.post("/api/logout", async (req: Request, res: Response) => {
    try {
      await destroyAdminSession(req);
      return res.json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: "Logout error"
      });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      const user = await validateAdminSession(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired session"
        });
      }
      
      return res.json({
        success: true,
        user: {
          id: (user._id as any).toString(),
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('User fetch error:', error);
      return res.status(500).json({
        success: false,
        message: "User service error"
      });
    }
  });
}

// Initialize admin user if none exists
export async function initializeAdminUser() {
  try {
    console.log("Checking for admin user...");
    
    // Check for specific admin user first
    let adminUser = await User.findOne({ username: 'HPNServer' });
    
    if (!adminUser) {
      console.log("Creating HPNServer admin user...");
      
      const hashedPassword = await hashPassword("HPNServer.com");
      
      const newAdmin = new User({
        username: "HPNServer",
        email: "noorain@hpnserver.com",
        password: hashedPassword,
        role: "admin",
        isActive: true
      });
      
      await newAdmin.save();
      console.log("✓ HPNServer admin user created successfully");
      console.log("  Username: HPNServer");
      console.log("  Email: noorain@hpnserver.com");
      console.log("  Password: HPNServer.com");
    } else {
      // Update existing admin user with correct credentials
      console.log("✓ HPNServer admin user found, updating credentials...");
      
      // Always update password and email to ensure correct values
      adminUser.password = await hashPassword("HPNServer.com");
      adminUser.email = "noorain@hpnserver.com";
      adminUser.role = "admin";
      adminUser.isActive = true;
      
      await adminUser.save();
      console.log("✓ Admin user credentials updated with correct password hash");
    }
    
    // Clean up any old admin users
    await User.deleteMany({ 
      role: 'admin', 
      username: { $ne: 'HPNServer' }
    });
    
  } catch (error) {
    console.error("Admin user initialization error:", error);
  }
}

export { hashPassword, comparePasswords, createAdminSession, validateAdminSession, destroyAdminSession, cleanupExpiredSessions };