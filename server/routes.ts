import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import fs from "fs";
import express from "express";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, requireAuth, initializeAdminUser } from "./auth";
import { setupSecurity } from "./security";
import { handleFileUpload, handleUploadError, getFileUrl, deleteFile, optimizeImage } from "./uploads";
import { 
  contactMessageValidationSchema,
  insertHeroContentSchema,
  insertAboutContentSchema,
  insertEducationItemSchema,
  insertExperienceItemSchema,
  insertProjectSchema,
  insertCertificationSchema,
  insertBlogPostSchema,
  insertBlogContentSchema,
  insertSocialLinkSchema,
  insertTestimonialSchema,
  insertServiceSchema,
  insertSiteSettingsSchema,
  insertFooterContentSchema,
  insertContactContentSchema,
  insertCertificationsContentSchema,
  insertProjectsContentSchema,
  insertExperienceContentSchema,
  insertSkillCategorySchema,
  insertSkillSchema,
  Project,
  ExperienceItem,
  ProjectsContent
} from "@shared/schema";

// Initialize default projects content
async function initializeProjectsContent() {
  try {
    const existingContent = await storage.getProjectsContent();
    
    if (!existingContent) {
      console.log('Creating default projects content...');
      const defaultContent = {
        sectionTag: "My Work",
        sectionTitle: "Featured Projects",
        sectionDescription: "Here are some of the key projects I've worked on, showcasing my technical skills and problem-solving abilities.",
        githubButtonText: "View All Projects on GitHub",
        githubButtonUrl: "https://github.com/NoorainRaza23",
        isActive: true,
        displayOrder: 0
      };
      
      await storage.createProjectsContent(defaultContent);
      console.log('✓ Default projects content created successfully');
    } else {
      console.log('✓ Projects content already exists');
    }
  } catch (error) {
    console.error('Error initializing projects content:', error);
  }
}

// Initialize default experience content
async function initializeExperienceContent() {
  try {
    const existingContent = await storage.getExperienceContent();
    
    if (!existingContent) {
      console.log('Creating default experience content...');
      const defaultContent = {
        sectionTag: "Career Path",
        sectionTitle: "Professional Experience",
        sectionDescription: "My professional journey in DevOps and software development, showcasing key roles and achievements.",
        experienceBadgeText: "2+ Years Experience",
        projectsButtonText: "See My Projects",
        projectsButtonUrl: "#projects",
        isActive: true,
        displayOrder: 0
      };
      
      await storage.createExperienceContent(defaultContent);
      console.log('✓ Default experience content created successfully');
    } else {
      console.log('✓ Experience content already exists');
    }
  } catch (error) {
    console.error('Error initializing experience content:', error);
  }
}

// Initialize default blog content if needed
async function initializeBlogContent() {
  try {
    const existingContent = await storage.getBlogContent();
    
    if (!existingContent) {
      console.log('Creating default blog content...');
      const defaultContent = {
        title: "Blog",
        subtitle: "Insights, tutorials, and thoughts",
        description: "Welcome to my blog where I share insights about technology, development, and innovation.",
        seoTitle: "Blog - Technology Insights and Tutorials",
        seoDescription: "Explore my latest articles on DevOps, cloud technologies, AI, and software development best practices.",
        showRecentPosts: true,
        postsPerPage: 6,
        enableCategories: true,
        enableTags: true,
        enableSearch: true,
        enableComments: false,
        isActive: true
      };
      
      await storage.createBlogContent(defaultContent);
      console.log('✓ Default blog content created successfully');
    } else {
      console.log('✓ Blog content already exists');
    }
  } catch (error) {
    console.error('Error initializing blog content:', error);
  }
}

const handleError = (error: any, res: Response) => {
  console.error("Error:", error);
  return res.status(500).json({
    success: false,
    message: error.message || "An error occurred while processing your request"
  });
};

// Enhanced Socket.IO emission helpers
const emitUpdate = (app: Express, eventType: string, data: any, target: 'public' | 'admin' | 'all' = 'public') => {
  const io = app.get('io') as SocketIOServer;
  if (io) {
    if (target === 'all') {
      io.emit('content-updated', { type: eventType, data, timestamp: new Date() });
    } else {
      io.to(target).emit('content-updated', { type: eventType, data, timestamp: new Date() });
    }
    console.log(`Socket.IO: Emitted ${eventType} update to ${target} clients`);
  }
};

const emitSpecificUpdate = (app: Express, eventName: string, data: any, target: 'public' | 'admin' | 'all' = 'public') => {
  const io = app.get('io') as SocketIOServer;
  if (io) {
    if (target === 'all') {
      io.emit(eventName, { ...data, timestamp: new Date() });
    } else {
      io.to(target).emit(eventName, { ...data, timestamp: new Date() });
    }
    console.log(`Socket.IO: Emitted ${eventName} to ${target} clients`);
  }
};

const emitAnalytics = (app: Express, eventType: string, data: any) => {
  const io = app.get('io') as SocketIOServer;
  if (io) {
    io.to('admin').emit('analytics-update', { 
      type: eventType, 
      data, 
      timestamp: new Date() 
    });
    console.log(`Socket.IO: Analytics ${eventType} sent to admin`);
  }
};

export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {
  // Setup authentication system
  console.log("Setting up authentication routes...");
  setupAuth(app);
  
  // Setup SEO routes for enhanced search visibility
  console.log("Setting up SEO optimization routes...");
  const { setupSEORoutes } = await import('./seo-routes');
  setupSEORoutes(app);
  
  // Initialize admin user if needed
  console.log("Initializing admin user...");
  await initializeAdminUser();
  
  // Initialize default projects content if needed
  await initializeProjectsContent();
  
  // Initialize default experience content if needed
  await initializeExperienceContent();
  
  // Initialize default blog content if needed
  await initializeBlogContent();
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  /////////////////////////////////////////////
  // PUBLIC API ROUTES
  /////////////////////////////////////////////
  
  // Contact form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Emit analytics for contact form submission
      emitAnalytics(app, 'contact-form-submitted', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer'),
        timestamp: new Date().toISOString()
      });
      
      const validatedData = contactMessageValidationSchema.parse(req.body);
      
      // Create enhanced message data with defaults for new fields
      const enhancedData: any = {
        ...validatedData,
        status: 'unread',
        priority: 'medium',
        isRead: false,
        tags: [],
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      };

      const savedMessage = await storage.createContactMessage(enhancedData);
      
      // Emit real-time notification to admin
      const io = app.get('io') as SocketIOServer;
      if (io) {
        io.to('admin').emit('new-contact', savedMessage);
        console.log('Socket.IO: New contact message sent to admin');
      }
      
      return res.status(201).json({ 
        success: true, 
        message: "Message received successfully",
        data: savedMessage
      });
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Resume download
  app.get("/api/resume", async (_req: Request, res: Response) => {
    try {
      const heroContent = await storage.getHeroContent();
      const hero = heroContent[0];
      
      if (!hero || !hero.resumeUrl) {
        return res.status(404).json({
          success: false,
          message: "Resume not found"
        });
      }
      
      // If it's an uploaded file (starts with /uploads), serve it
      if (hero.resumeUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), hero.resumeUrl.substring(1));
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({
            success: false,
            message: "Resume file not found"
          });
        }
        
        // Set appropriate headers for file download
        const fileName = path.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');
        
        // Stream the file
        return res.sendFile(filePath);
      }
      
      // If it's an external URL, redirect to it
      return res.redirect(hero.resumeUrl);
    } catch (error) {
      console.error('Resume download error:', error);
      return res.status(500).json({
        success: false,
        message: "Resume service error"
      });
    }
  });

  // Hero content
  app.get("/api/hero", async (req: Request, res: Response) => {
    try {
      const heroContent = await storage.getHeroContent();
      
      // Emit analytics for hero section views
      emitAnalytics(app, 'hero-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      return res.status(200).json({ 
        success: true, 
        data: heroContent[0] || null 
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // About content - card-based structure
  app.get("/api/about", async (req: Request, res: Response) => {
    try {
      const aboutContent = await storage.getAboutContent();
      
      // Emit analytics for about section views
      emitAnalytics(app, 'about-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      // Check if we have proper card-based content
      const cardBasedContent = aboutContent.filter(item => 
        ['main', 'biography', 'problem-solver', 'continuous-learner', 'devops-specialist', 'aspirations'].includes(item.sectionType)
      );
      
      if (cardBasedContent.length >= 5) {
        return res.status(200).json({ 
          success: true, 
          data: cardBasedContent.filter(item => item.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
        });
      }
      
      // Clear existing incompatible data and create new card structure
      await storage.clearAboutContent();
      
      const defaultCards = [
        {
          sectionType: 'main',
          title: 'About Noorain Raza',
          subtitle: 'DevOps Engineer & Cloud Specialist',
          content: 'A DevOps engineer with passion for automation, cloud technologies, and continuous learning.',
          icon: '👨‍💻',
          isActive: true,
          displayOrder: 1
        },
        {
          sectionType: 'biography',
          title: 'Biography',
          subtitle: '',
          content: 'I am a Computer Science Engineering student at Asansol Engineering College, currently maintaining a CGPA of 7.58/10. My journey in technology has equipped me with strong foundations in programming languages such as Python, Java, and JavaScript. During my internship at Edunet Foundation in Emerging Technologies (AI & Cloud), I leveraged cutting-edge AI and Cloud technologies to design and implement scalable and efficient solutions, utilizing industry-standard tools and platforms. I\'m passionate about developing innovative solutions, particularly in AI and healthcare predictions. I\'ve worked on projects like the AI Mock Interview App and T20 World Cup Winner Prediction model that showcase my ability to apply theoretical knowledge to practical applications.',
          icon: '📖',
          isActive: true,
          displayOrder: 2
        },
        {
          sectionType: 'problem-solver',
          title: 'Problem Solver',
          subtitle: '',
          content: 'I thrive on finding elegant solutions to complex technical challenges, with a focus on automation and efficiency.',
          icon: '🔧',
          isActive: true,
          displayOrder: 3
        },
        {
          sectionType: 'continuous-learner',
          title: 'Continuous Learner',
          subtitle: '',
          content: 'I\'m passionate about expanding my knowledge and skills through continuous learning and staying up-to-date with emerging technologies.',
          icon: '📚',
          isActive: true,
          displayOrder: 4
        },
        {
          sectionType: 'devops-specialist',
          title: 'DevOps Specialist',
          subtitle: '',
          content: 'I specialize in streamlining development workflows and implementing robust cloud infrastructure with a focus on automation and performance.',
          icon: '⚙️',
          isActive: true,
          displayOrder: 5
        },
        {
          sectionType: 'aspirations',
          title: 'Aspirations',
          subtitle: '',
          content: 'My goal is to advance in the field of AI and Cloud technologies, creating impactful applications that solve real-world problems. I aim to continue developing my skills in machine learning, cloud architecture, and software development while contributing to innovative projects.',
          icon: '🚀',
          isActive: true,
          displayOrder: 6
        }
      ];

      // Create the cards in the database
      for (const card of defaultCards) {
        await storage.createAboutContent(card);
      }

      const newAboutContent = await storage.getAboutContent();
      return res.status(200).json({ 
        success: true, 
        data: newAboutContent.filter(item => item.isActive).sort((a, b) => a.displayOrder - b.displayOrder)
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Education
  app.get("/api/education", async (req: Request, res: Response) => {
    try {
      // Emit analytics for education section views
      emitAnalytics(app, 'education-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      const education = await storage.getEducation();
      return res.status(200).json({ success: true, data: education });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Education content management (section text)
  app.get("/api/education-content", async (_req: Request, res: Response) => {
    try {
      const content = await storage.getEducationContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Experience
  app.get("/api/experience", async (req: Request, res: Response) => {
    try {
      // Emit analytics for experience section views
      emitAnalytics(app, 'experience-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      const experience = await storage.getActiveExperience();
      return res.status(200).json({ success: true, data: experience });
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Certifications
  app.get("/api/certifications", async (req: Request, res: Response) => {
    try {
      // Emit analytics for certifications section views
      emitAnalytics(app, 'certifications-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      const certifications = await storage.getCertifications();
      return res.status(200).json({ success: true, data: certifications });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Certifications Content
  app.get("/api/certifications-content", async (_req: Request, res: Response) => {
    try {
      let content = await storage.getCertificationsContent();
      
      // Create default content if none exists
      if (!content) {
        const defaultContent = {
          badgeText: "My Achievements",
          title: "Certifications & Awards",
          description: "Professional certifications and notable achievements that validate my expertise and skills in technology.",
          bottomText: "Continuously improving my skills through relevant certifications and hands-on experience.",
          linkedInText: "View all certifications on LinkedIn",
          linkedInUrl: "https://www.linkedin.com/in/noorainraza",
          isActive: true
        };
        content = await storage.createCertificationsContent(defaultContent);
      }
      
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Blog posts (published only)
  app.get("/api/blog", async (req: Request, res: Response) => {
    try {
      // Check if blog is active
      const blogContent = await storage.getBlogContent();
      if (!blogContent || !blogContent.isActive) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog section is not available" 
        });
      }
      
      // Emit analytics for blog section views
      emitAnalytics(app, 'blog-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      const posts = await storage.getPublishedBlogPosts();
      return res.status(200).json({ success: true, data: posts });
    } catch (error) {
      return handleError(error, res);
    }
  });
  
  // Single blog post
  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      // Check if blog is active
      const blogContent = await storage.getBlogContent();
      if (!blogContent || !blogContent.isActive) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog section is not available" 
        });
      }
      
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ 
          success: false, 
          message: "Blog post not found" 
        });
      }
      return res.status(200).json({ success: true, data: post });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Blog content section
  app.get("/api/blog-content", async (_req: Request, res: Response) => {
    try {
      const content = await storage.getBlogContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Social links
  app.get("/api/social-links", async (_req: Request, res: Response) => {
    try {
      const links = await storage.getSocialLinks();
      return res.status(200).json({ success: true, data: links });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (_req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      return res.status(200).json({ success: true, data: testimonials });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Services
  app.get("/api/services", async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      return res.status(200).json({ success: true, data: services });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Site settings
  app.get("/api/settings", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return handleError(error, res);
    }
  });

  /////////////////////////////////////////////
  // ADMIN API ROUTES (Protected)
  /////////////////////////////////////////////

  // Admin contact messages
  app.get("/api/admin/contact", requireAuth, async (_req: Request, res: Response) => {
    try {
      const messages = await storage.getContactMessages();
      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.get("/api/admin/contact/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const message = await storage.getContactMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/contact/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const updatedMessage = await storage.updateContactMessage(req.params.id, req.body);
      if (!updatedMessage) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, data: updatedMessage });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/contact/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteContactMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Message quick actions
  app.patch("/api/admin/contact/:id/mark-read", requireAuth, async (req: Request, res: Response) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.patch("/api/admin/contact/:id/mark-replied", requireAuth, async (req: Request, res: Response) => {
    try {
      const message = await storage.markMessageAsReplied(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.patch("/api/admin/contact/:id/archive", requireAuth, async (req: Request, res: Response) => {
    try {
      const message = await storage.archiveMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Filter endpoints
  app.get("/api/admin/contact/status/:status", requireAuth, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessagesByStatus(req.params.status);
      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.get("/api/admin/contact/priority/:priority", requireAuth, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessagesByPriority(req.params.priority);
      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.get("/api/admin/contact/unread", requireAuth, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getUnreadMessages();
      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin hero content
  app.get("/api/admin/hero-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getHeroContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/hero-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertHeroContentSchema.parse(req.body);
      const content = await storage.createHeroContent(validatedData);
      emitUpdate(app, 'hero-updated', content);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/hero-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertHeroContentSchema.partial().parse(req.body);
      const content = await storage.updateHeroContent(req.params.id, validatedData);
      if (!content) {
        return res.status(404).json({ success: false, message: "Content not found" });
      }
      emitUpdate(app, 'hero-updated', content);
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/hero-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteHeroContent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Content not found" });
      }
      emitUpdate(app, 'hero-updated', { deleted: req.params.id });
      return res.status(200).json({ success: true, message: "Content deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin about content
  app.get("/api/admin/about", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getAboutContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/about", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertAboutContentSchema.parse(req.body);
      const content = await storage.createAboutContent(validatedData);
      emitUpdate(app, 'about-updated', content);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/about/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log(`🔄 About content update request - ID: ${req.params.id}`, {
        body: req.body,
        timestamp: new Date().toISOString()
      });

      const validatedData = insertAboutContentSchema.partial().parse(req.body);
      console.log('✅ Data validation passed:', validatedData);

      const content = await storage.updateAboutContent(req.params.id, validatedData);
      
      if (!content) {
        console.log(`❌ Content not found for ID: ${req.params.id}`);
        return res.status(404).json({ success: false, message: "Content not found" });
      }

      console.log('✅ Content updated successfully:', {
        id: content._id,
        title: content.title,
        isActive: content.isActive,
        updatedAt: content.updatedAt
      });

      emitUpdate(app, 'about-updated', content);
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      console.error('❌ About content update error:', error);
      return handleError(error, res);
    }
  });



  // Admin education (similar pattern for all other entities)
  app.get("/api/admin/education", requireAuth, async (_req: Request, res: Response) => {
    try {
      const education = await storage.getEducation();
      return res.status(200).json({ success: true, data: education });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/education", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertEducationItemSchema.parse(req.body);
      const item = await storage.createEducationItem(validatedData);
      emitUpdate(app, 'education-updated', item);
      return res.status(201).json({ success: true, data: item });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/education/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertEducationItemSchema.partial().parse(req.body);
      const item = await storage.updateEducationItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ success: false, message: "Education item not found" });
      }
      emitUpdate(app, 'education-updated', item);
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/education/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteEducationItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Education item not found" });
      }
      return res.status(200).json({ success: true, message: "Education item deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin education content (section text management)
  app.get("/api/admin/education-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getEducationContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/education-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const content = await storage.createEducationContent(req.body);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/education-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const content = await storage.updateEducationContent(req.params.id, req.body);
      if (!content) {
        return res.status(404).json({ success: false, message: "Education content not found" });
      }
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin experience
  app.get("/api/admin/experience", requireAuth, async (_req: Request, res: Response) => {
    try {
      const experience = await storage.getExperience();
      return res.status(200).json({ success: true, data: experience });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/experience", requireAuth, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      
      // Convert responsibilities from textarea string to array
      if (body.responsibilities && typeof body.responsibilities === 'string') {
        body.responsibilities = body.responsibilities
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .map((line: string) => line.replace(/^[•\-\*]\s*/, '')); // Remove bullet points
      }
      
      const validatedData = insertExperienceItemSchema.parse(body);
      const item = await storage.createExperienceItem(validatedData);
      
      // Emit real-time update for experience changes
      emitUpdate(app, 'experience-created', item);
      
      return res.status(201).json({ success: true, data: item });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/experience/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const body = { ...req.body };
      
      // Convert responsibilities from textarea string to array
      if (body.responsibilities && typeof body.responsibilities === 'string') {
        body.responsibilities = body.responsibilities
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .map((line: string) => line.replace(/^[•\-\*]\s*/, '')); // Remove bullet points
      }
      
      const validatedData = insertExperienceItemSchema.partial().parse(body);
      const item = await storage.updateExperienceItem(req.params.id, validatedData);
      
      // Emit real-time update for experience updates
      if (item) {
        emitUpdate(app, 'experience-updated', item);
      }
      
      if (!item) {
        return res.status(404).json({ success: false, message: "Experience item not found" });
      }
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/experience/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteExperienceItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Experience item not found" });
      }
      return res.status(200).json({ success: true, message: "Experience item deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });



  // Blog image upload endpoint with optimization
  app.post("/api/admin/upload/blog-image", requireAuth, handleFileUpload(['file']), handleUploadError, async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      console.log('Blog image upload request received');
      
      if (!files.file || !files.file[0]) {
        console.log('No file uploaded in request');
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const file = files.file[0];
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed"
        });
      }
      
      // Handle blog image optimization using the same system as regular images
      try {
        const blogImageDir = path.join(process.cwd(), "uploads", "blog-images");
        console.log(`Starting blog image optimization for: ${file.originalname}`);
        
        const optimizationResult = await optimizeImage(file.path, blogImageDir, file.originalname, 'blog-image');
        
        // Use the first optimized image (WebP format preferred)
        const primaryImage = optimizationResult.optimized[0]; // WebP version
        const fallbackImage = optimizationResult.optimized[1]; // JPEG version
        
        const primaryUrl = getFileUrl(primaryImage, 'blog-image');
        const fallbackUrl = fallbackImage ? getFileUrl(fallbackImage, 'blog-image') : primaryUrl;
        
        console.log(`Blog image optimization completed successfully:`);
        console.log(`- Primary (WebP): ${primaryUrl}`);
        console.log(`- Fallback (JPEG): ${fallbackUrl}`);
        console.log(`- Thumbnails: ${optimizationResult.thumbnails.length} generated`);

        return res.status(200).json({
          success: true,
          data: {
            url: primaryUrl, // Primary optimized image
            fallbackUrl, // Fallback JPEG
            filename: primaryImage,
            originalName: file.originalname,
            size: file.size,
            type: 'blog-image',
            optimized: true,
            thumbnails: optimizationResult.thumbnails
          },
          message: "Blog image uploaded and optimized successfully"
        });
      } catch (optimizationError) {
        console.error('Blog image optimization failed:', optimizationError);
        
        // Fall back to original file if optimization fails
        const blogImageDir = path.join(process.cwd(), "uploads", "blog-images");
        
        // Ensure directory exists
        if (!fs.existsSync(blogImageDir)) {
          fs.mkdirSync(blogImageDir, { recursive: true });
        }
        
        // Move file to blog-images directory
        const filename = `${Date.now()}-${file.originalname}`;
        const newPath = path.join(blogImageDir, filename);
        
        // Move the file
        fs.renameSync(file.path, newPath);
        
        const fileUrl = `/uploads/blog-images/${filename}`;
        
        return res.status(200).json({
          success: true,
          data: {
            url: fileUrl,
            filename: filename,
            originalName: file.originalname,
            size: file.size,
            type: 'blog-image',
            optimized: false
          },
          message: "Blog image uploaded successfully (optimization skipped due to error)"
        });
      }
    } catch (error) {
      console.error('Blog image upload error:', error);
      return handleError(error, res);
    }
  });

  // Optimized image upload endpoint
  app.post("/api/admin/upload/:type", requireAuth, handleFileUpload(['file']), handleUploadError, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      console.log(`Upload request for type: ${type}`);
      
      if (!files.file || !files.file[0]) {
        console.log('No file uploaded in request');
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const file = files.file[0];
      
      // Handle image optimization for image uploads
      if (type === 'image' && file.mimetype.startsWith('image/')) {
        try {
          const imageDir = path.join(process.cwd(), "uploads", "images");
          console.log(`Starting image optimization for: ${file.originalname}`);
          
          const optimizationResult = await optimizeImage(file.path, imageDir, file.originalname);
          
          // Use the first optimized image (WebP format preferred)
          const primaryImage = optimizationResult.optimized[0]; // WebP version
          const fallbackImage = optimizationResult.optimized[1]; // JPEG version
          
          const primaryUrl = getFileUrl(primaryImage, 'image');
          const fallbackUrl = fallbackImage ? getFileUrl(fallbackImage, 'image') : primaryUrl;
          
          console.log(`Image optimization completed successfully:`);
          console.log(`- Primary (WebP): ${primaryUrl}`);
          console.log(`- Fallback (JPEG): ${fallbackUrl}`);
          console.log(`- Thumbnails: ${optimizationResult.thumbnails.length} generated`);

          return res.status(200).json({
            success: true,
            data: {
              url: primaryUrl, // Primary optimized image
              fallbackUrl, // Fallback JPEG
              filename: primaryImage,
              originalName: file.originalname,
              size: file.size,
              type: 'image',
              optimized: true,
              thumbnails: optimizationResult.thumbnails
            },
            message: "Image uploaded and optimized successfully"
          });
        } catch (optimizationError) {
          console.error('Image optimization failed:', optimizationError);
          
          // Fall back to original file if optimization fails
          const fileUrl = getFileUrl(file.filename, 'image');
          return res.status(200).json({
            success: true,
            data: {
              url: fileUrl,
              filename: file.filename,
              originalName: file.originalname,
              size: file.size,
              type: 'image',
              optimized: false
            },
            message: "Image uploaded successfully (optimization skipped due to error)"
          });
        }
      } else {
        // Handle non-image files (resumes, etc.)
        const fileType = type === 'image' ? 'image' : 'resume';
        const fileUrl = getFileUrl(file.filename, fileType);

        return res.status(200).json({
          success: true,
          data: {
            url: fileUrl,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            type: fileType
          },
          message: "File uploaded successfully"
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      return handleError(error, res);
    }
  });

  // Public skills endpoints (no auth required)
  app.get("/api/skills", async (req: Request, res: Response) => {
    try {
      console.log('🔍 Public skills endpoint called');
      
      // Emit analytics for skills section views
      emitAnalytics(app, 'skills-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      // Add cache-busting headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Get active skill categories and their active skills
      const categories = await storage.getActiveSkillCategories();
      console.log(`✅ Found ${categories.length} active skill categories`);
      
      const skillsData = [];

      for (const category of categories) {
        const categoryId = category._id ? category._id.toString() : '';
        const skills = await storage.getActiveSkillsByCategory(categoryId);
        console.log(`- ${category.name}: ${skills.length} active skills`);
        
        if (skills.length > 0) {
          skillsData.push({
            name: category.name,
            items: skills.map(skill => ({
              name: skill.name,
              icon: skill.icon || "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
              proficiency: skill.proficiency,
              years: skill.years
            }))
          });
        }
      }

      console.log(`✅ Returning ${skillsData.length} skill categories with data`);
      return res.status(200).json({ success: true, data: skillsData });
    } catch (error) {
      console.error('❌ Error in public skills endpoint:', error);
      return handleError(error, res);
    }
  });

  // Public projects endpoint (no auth required)
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      console.log('🔍 Public projects endpoint called');
      
      // Emit analytics for projects section views
      emitAnalytics(app, 'projects-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      // Add cache-busting headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const activeProjects = await storage.getActiveProjects();
      
      console.log(`✅ Found ${activeProjects.length} active projects for public display`);
      activeProjects.forEach(project => {
        console.log(`- ${project.title}: isActive = ${project.isActive}`);
      });
      
      return res.status(200).json({ success: true, data: activeProjects });
    } catch (error) {
      console.error('❌ Error in public projects endpoint:', error);
      return handleError(error, res);
    }
  });

  // Admin projects
  app.get("/api/admin/projects", requireAuth, async (_req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      return res.status(200).json({ success: true, data: projects });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      
      // Emit real-time update for project changes
      emitUpdate(app, 'project-created', project);
      
      return res.status(201).json({ success: true, data: project });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      // Create a partial schema that makes all fields optional for updates
      const updateProjectSchema = insertProjectSchema.partial();
      const validatedData = updateProjectSchema.parse(req.body);
      
      // Remove undefined values to avoid overwriting with undefined
      const cleanData = Object.fromEntries(
        Object.entries(validatedData).filter(([_, value]) => value !== undefined)
      );
      
      const project = await storage.updateProject(req.params.id, cleanData);
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      
      // Emit real-time update for project changes
      emitUpdate(app, 'project-updated', project);
      
      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
      
      // Emit real-time update for project deletion
      emitUpdate(app, 'project-deleted', { id: req.params.id });
      
      return res.status(200).json({ success: true, message: "Project deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Fix projects isActive field migration
  app.post("/api/admin/fix-projects-isactive", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Update projects that don't have isActive field
      const result = await Project.updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } }
      );

      // Also update any projects where isActive is null
      const result2 = await Project.updateMany(
        { isActive: null },
        { $set: { isActive: true } }
      );

      return res.status(200).json({ 
        success: true, 
        message: "Projects isActive field fixed successfully",
        data: { 
          modifiedWithoutField: result.modifiedCount,
          modifiedFromNull: result2.modifiedCount,
          totalModified: result.modifiedCount + result2.modifiedCount
        }
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin certifications
  app.get("/api/admin/certifications", requireAuth, async (_req: Request, res: Response) => {
    try {
      const certifications = await storage.getCertifications();
      return res.status(200).json({ success: true, data: certifications });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/certifications", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCertificationSchema.parse(req.body);
      const certification = await storage.createCertification(validatedData);
      emitUpdate(app, 'certifications-updated', certification);
      return res.status(201).json({ success: true, data: certification });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/certifications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCertificationSchema.partial().parse(req.body);
      const certification = await storage.updateCertification(req.params.id, validatedData);
      if (!certification) {
        return res.status(404).json({ success: false, message: "Certification not found" });
      }
      emitUpdate(app, 'certifications-updated', certification);
      return res.status(200).json({ success: true, data: certification });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/certifications/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log(`Attempting to delete certification with ID: ${req.params.id}`);
      
      // Validate ObjectId format
      if (!req.params.id || req.params.id.length !== 24) {
        console.log(`Invalid ObjectId format: ${req.params.id}`);
        return res.status(400).json({ success: false, message: "Invalid certification ID format" });
      }
      
      const deleted = await storage.deleteCertification(req.params.id);
      console.log(`Deletion result: ${deleted}`);
      
      if (!deleted) {
        console.log(`Certification not found with ID: ${req.params.id}`);
        return res.status(404).json({ success: false, message: "Certification not found" });
      }
      
      console.log(`Successfully deleted certification with ID: ${req.params.id}`);
      return res.status(200).json({ success: true, message: "Certification deleted" });
    } catch (error) {
      console.error(`Error deleting certification:`, error);
      return handleError(error, res);
    }
  });

  // Admin blog posts
  app.get("/api/admin/blog", requireAuth, async (_req: Request, res: Response) => {
    try {
      const posts = await storage.getBlogPosts();
      return res.status(200).json({ success: true, data: posts });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/blog", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      emitUpdate(app, 'blog-updated', post);
      return res.status(201).json({ success: true, data: post });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/blog/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }
      emitUpdate(app, 'blog-updated', post);
      return res.status(200).json({ success: true, data: post });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/blog/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }
      return res.status(200).json({ success: true, message: "Blog post deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin blog content management
  app.get("/api/admin/blog-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getBlogContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/blog-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogContentSchema.parse(req.body);
      const content = await storage.createBlogContent(validatedData);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/blog-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogContentSchema.partial().parse(req.body);
      const content = await storage.updateBlogContent(req.params.id, validatedData);
      if (!content) {
        return res.status(404).json({ success: false, message: "Blog content not found" });
      }
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // PATCH endpoint for blog content updates (used by BlogManager)
  app.patch("/api/admin/blog-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogContentSchema.partial().parse(req.body);
      const content = await storage.updateBlogContentSettings(validatedData);
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // PATCH endpoint for individual blog posts (used by BlogManager)
  app.patch("/api/admin/blog/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, validatedData);
      if (!post) {
        return res.status(404).json({ success: false, message: "Blog post not found" });
      }
      return res.status(200).json({ success: true, data: post });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin messages (contact form submissions)
  app.get("/api/admin/messages", requireAuth, async (_req: Request, res: Response) => {
    try {
      const messages = await storage.getContactMessages();
      return res.status(200).json({ success: true, data: messages });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/messages/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const message = await storage.updateContactMessage(req.params.id, req.body);
      if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, data: message });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/messages/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteContactMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      return res.status(200).json({ success: true, message: "Message deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin settings
  app.get("/api/admin/settings", requireAuth, async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getSiteSettings();
      return res.status(200).json({ success: true, data: settings ? [settings] : [] });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/settings", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.createSiteSettings(validatedData);
      return res.status(201).json({ success: true, data: settings });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/settings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSiteSettings(validatedData);
      return res.status(200).json({ success: true, data: settings });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin social links
  app.get("/api/admin/social-links", requireAuth, async (_req: Request, res: Response) => {
    try {
      const links = await storage.getSocialLinks();
      return res.status(200).json({ success: true, data: links });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/social-links", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSocialLinkSchema.parse(req.body);
      const link = await storage.createSocialLink(validatedData);
      return res.status(201).json({ success: true, data: link });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/social-links/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSocialLinkSchema.partial().parse(req.body);
      const link = await storage.updateSocialLink(req.params.id, validatedData);
      if (!link) {
        return res.status(404).json({ success: false, message: "Social link not found" });
      }
      return res.status(200).json({ success: true, data: link });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/social-links/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteSocialLink(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Social link not found" });
      }
      return res.status(200).json({ success: true, message: "Social link deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin testimonials
  app.get("/api/admin/testimonials", requireAuth, async (_req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      return res.status(200).json({ success: true, data: testimonials });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/testimonials", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      return res.status(201).json({ success: true, data: testimonial });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/testimonials/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await storage.updateTestimonial(req.params.id, validatedData);
      if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
      }
      return res.status(200).json({ success: true, data: testimonial });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTestimonial(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
      }
      return res.status(200).json({ success: true, message: "Testimonial deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin services
  app.get("/api/admin/services", requireAuth, async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      return res.status(200).json({ success: true, data: services });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/services", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      return res.status(201).json({ success: true, data: service });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/services/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, validatedData);
      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      return res.status(200).json({ success: true, data: service });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/services/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }
      return res.status(200).json({ success: true, message: "Service deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin users
  app.get("/api/admin/users", requireAuth, async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Footer content management
  app.get("/api/footer", async (req: Request, res: Response) => {
    try {
      // Emit analytics for footer section views
      emitAnalytics(app, 'footer-viewed', {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer')
      });
      
      const content = await storage.getFooterContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.get("/api/admin/footer", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getFooterContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/footer", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertFooterContentSchema.parse(req.body);
      const content = await storage.createFooterContent(validatedData);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/footer", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertFooterContentSchema.partial().parse(req.body);
      const content = await storage.updateFooterContent(validatedData);
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin Skills Categories
  app.get("/api/admin/skill-categories", requireAuth, async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getSkillCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/skill-categories", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSkillCategorySchema.parse(req.body);
      const category = await storage.createSkillCategory(validatedData);
      emitUpdate(app, 'skills-updated', category);
      return res.status(201).json({ success: true, data: category });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/skill-categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSkillCategorySchema.partial().parse(req.body);
      const category = await storage.updateSkillCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ success: false, message: "Skill category not found" });
      }
      emitUpdate(app, 'skills-updated', category);
      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/skill-categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteSkillCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Skill category not found" });
      }
      return res.status(200).json({ success: true, message: "Skill category deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin Skills
  app.get("/api/admin/skills", requireAuth, async (_req: Request, res: Response) => {
    try {
      const skills = await storage.getSkills();
      return res.status(200).json({ success: true, data: skills });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/skills", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(validatedData);
      
      // Emit real-time update for skill changes
      emitUpdate(app, 'skill-updated', skill);
      
      return res.status(201).json({ success: true, data: skill });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/skills/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertSkillSchema.partial().parse(req.body);
      const skill = await storage.updateSkill(req.params.id, validatedData);
      if (!skill) {
        return res.status(404).json({ success: false, message: "Skill not found" });
      }
      
      // Emit real-time update for skill changes
      emitUpdate(app, 'skill-updated', skill);
      
      return res.status(200).json({ success: true, data: skill });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/skills/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteSkill(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Skill not found" });
      }
      emitUpdate(app, 'skills-updated', { id: req.params.id });
      return res.status(200).json({ success: true, message: "Skill deleted" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Fix skills categorization endpoint
  app.post("/api/admin/fix-skills-categorization", requireAuth, async (_req: Request, res: Response) => {
    try {
      const { SkillCategory, Skill } = require("@shared/schema");
      
      // Define skill categorization mapping
      const skillMappings = {
        "Programming Languages": [
          "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift"
        ],
        "Frameworks & Libraries": [
          "React", "Vue.js", "Angular", "Django", "Flask", "Laravel", "Ruby on Rails", "NestJS", "Svelte", "Expo"
        ],
        "DevOps & Cloud": [
          "Docker", "Kubernetes", "AWS", "Google Cloud", "AWS EC2", "AWS S3", "Terraform", "Jenkins", "GitHub Actions", "Nginx"
        ],
        "Tools & Platforms": [
          "Git", "GitHub", "Vercel", "Netlify", "Heroku", "Streamlit", "Webpack", "Capacitor", "Prisma", "Drizzle ORM"
        ],
        "Operating Systems": [
          "Linux", "Windows"
        ],
        "Databases": [
          "MySQL", "SQLite", "Redis"
        ],
        "Design & UI/UX": [
          "Adobe Photoshop", "Adobe Illustrator", "Sketch", "Design Systems", "Responsive Design", "SASS/SCSS"
        ],
        "Data Science & ML": [
          "Pandas", "NumPy", "scikit-learn", "PyTorch", "Data Visualization", "OpenAI API"
        ],
        "Web Technologies": [
          "HTML", "CSS"
        ],
        "Mobile Development": [
          "App Store Optimization"
        ]
      };

      // Create categories if they don't exist and get mapping
      const categoryMap = new Map();
      let displayOrder = 1;

      for (const [categoryName] of Object.entries(skillMappings)) {
        let category = await SkillCategory.findOne({ name: categoryName });
        
        if (!category) {
          category = new SkillCategory({
            name: categoryName,
            displayOrder: displayOrder,
            isActive: true
          });
          await category.save();
        }
        
        categoryMap.set(categoryName, category._id.toString());
        displayOrder++;
      }

      // Update skills with proper categories
      let updatedCount = 0;
      let foundCount = 0;

      for (const [categoryName, skillNames] of Object.entries(skillMappings)) {
        const categoryId = categoryMap.get(categoryName);
        let skillOrder = 1;
        
        for (const skillName of skillNames) {
          const skill = await Skill.findOne({ 
            name: { $regex: new RegExp(`^${skillName}$`, 'i') } 
          });
          
          if (skill) {
            foundCount++;
            const updateResult = await Skill.updateOne(
              { _id: skill._id },
              { 
                categoryId: categoryId,
                displayOrder: skillOrder
              }
            );
            
            if (updateResult.modifiedCount > 0) {
              updatedCount++;
            }
            skillOrder++;
          }
        }
      }

      // Get final statistics
      const categorySummary = {};
      for (const [categoryName] of Object.entries(skillMappings)) {
        const categoryId = categoryMap.get(categoryName);
        const count = await Skill.countDocuments({ categoryId });
        categorySummary[categoryName] = count;
      }

      const uncategorizedCount = await Skill.countDocuments({
        $or: [
          { categoryId: { $exists: false } },
          { categoryId: null },
          { categoryId: '' }
        ]
      });

      return res.status(200).json({
        success: true,
        message: "Skills categorization completed successfully",
        data: {
          updatedCount,
          foundCount,
          uncategorizedCount,
          categorySummary,
          totalCategories: Object.keys(skillMappings).length
        }
      });

    } catch (error) {
      console.error("Error fixing skills categorization:", error);
      return handleError(error, res);
    }
  });

  // Comprehensive skills organization endpoint
  app.post("/api/admin/organize-skills", requireAuth, async (_req: Request, res: Response) => {
    try {
      const schemaModule = await import("../shared/schema.js");
      const { SkillCategory, Skill } = schemaModule;
      
      // Define comprehensive skill categorizations
      const skillCategorizations = {
        "Programming Languages": {
          icon: "💻",
          displayOrder: 1,
          skills: [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "HTML", "CSS", "Scala", "R", "MATLAB", "C", "Dart", "Solidity"
          ]
        },
        "Frameworks & Libraries": {
          icon: "🔧",
          displayOrder: 2,
          skills: [
            "React", "Vue.js", "Angular", "Django", "Flask", "Laravel", "Ruby on Rails", "NestJS", "Svelte", "Expo", "Next.js", "Express.js", "Node.js", "Spring Boot", "FastAPI", "jQuery", "Bootstrap", "Material-UI", "Tailwind CSS", "Framer Motion", "Three.js", "Socket.io"
          ]
        },
        "DevOps & Cloud": {
          icon: "☁️",
          displayOrder: 3,
          skills: [
            "Docker", "Kubernetes", "AWS", "Google Cloud", "AWS EC2", "AWS S3", "Terraform", "Jenkins", "GitHub Actions", "Nginx", "Azure", "CI/CD", "Ansible", "Puppet", "Chef", "Vagrant", "Vercel", "Netlify", "Heroku"
          ]
        },
        "Databases": {
          icon: "🗄️",
          displayOrder: 4,
          skills: [
            "MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "DynamoDB", "Cassandra", "Elasticsearch", "Neo4j", "Oracle", "SQL Server", "Firebase Firestore"
          ]
        },
        "Tools & Platforms": {
          icon: "🛠️",
          displayOrder: 5,
          skills: [
            "Git", "GitHub", "Streamlit", "Webpack", "Capacitor", "Prisma", "Drizzle ORM", "Vite", "Postman", "VS Code", "IntelliJ IDEA", "Slack", "Jira", "Trello", "Notion", "Linear"
          ]
        },
        "Design & UI/UX": {
          icon: "🎨",
          displayOrder: 6,
          skills: [
            "Adobe Photoshop", "Adobe Illustrator", "Sketch", "Design Systems", "Responsive Design", "SASS/SCSS", "Figma", "Adobe XD", "Canva", "UI/UX Design", "Wireframing", "Prototyping", "Technostyle Design"
          ]
        },
        "Data Science & ML": {
          icon: "📊",
          displayOrder: 7,
          skills: [
            "Pandas", "NumPy", "scikit-learn", "PyTorch", "Data Visualization", "OpenAI API", "TensorFlow", "Jupyter", "Matplotlib", "Seaborn", "Plotly", "Keras", "Apache Spark", "Tableau", "Power BI", "Machine Learning", "Deep Learning"
          ]
        },
        "Web Technologies": {
          icon: "🌐",
          displayOrder: 8,
          skills: [
            "REST API", "GraphQL", "WebSocket", "API Development", "Microservices", "Serverless", "OAuth", "JWT", "SOAP", "XML", "JSON", "WebRTC", "PWA"
          ]
        },
        "Mobile Development": {
          icon: "📱",
          displayOrder: 9,
          skills: [
            "App Store Optimization", "React Native", "Flutter", "iOS Development", "Android Development", "Xamarin", "Ionic", "PhoneGap", "App Store Connect", "Google Play Console", "Swift", "Kotlin"
          ]
        },
        "Operating Systems": {
          icon: "🖥️",
          displayOrder: 10,
          skills: [
            "Linux", "Windows", "macOS", "Ubuntu", "CentOS", "Red Hat", "Debian", "FreeBSD", "Unix", "Shell Scripting", "Bash", "PowerShell"
          ]
        }
      };

      // Create or update all categories
      const categoryMap = new Map();
      let categoriesCreated = 0;
      let categoriesUpdated = 0;

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
          console.log(`✓ Created category: ${categoryName}`);
        } else {
          await SkillCategory.updateOne(
            { _id: category._id },
            { 
              icon: categoryData.icon,
              displayOrder: categoryData.displayOrder,
              isActive: true
            }
          );
          categoriesUpdated++;
          console.log(`✓ Updated category: ${categoryName}`);
        }
        
        categoryMap.set(categoryName, String((category as any)._id));
      }

      // Keep existing skills' active status (don't automatically deactivate)
      console.log('✓ Preserving existing skills active status');

      // Organize existing skills by category and create new ones if needed
      let updatedCount = 0;
      let newSkillsCount = 0;
      const categorySummary: Record<string, number> = {};

      for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
        const categoryId = categoryMap.get(categoryName);
        let skillsInCategory = 0;
        let displayOrder = 1;
        
        for (const skillName of categoryData.skills) {
          let skill = await Skill.findOne({ 
            name: { $regex: new RegExp(`^${skillName}$`, 'i') } 
          });
          
          if (skill) {
            // Update existing skill
            await Skill.updateOne(
              { _id: skill._id },
              { 
                categoryId: categoryId,
                displayOrder: displayOrder,
                proficiency: skill.proficiency || 70
                // Preserve existing isActive status
              }
            );
            updatedCount++;
            skillsInCategory++;
          } else {
            // Create new skill (default to inactive until admin activates)
            skill = new Skill({
              name: skillName,
              categoryId: categoryId,
              displayOrder: displayOrder,
              proficiency: 70,
              isActive: false
            });
            await skill.save();
            newSkillsCount++;
            skillsInCategory++;
          }
          displayOrder++;
        }
        
        categorySummary[categoryName] = skillsInCategory;
        console.log(`✓ ${categoryName}: ${skillsInCategory} skills organized`);
      }

      // Count uncategorized skills
      const totalUncategorized = await Skill.countDocuments({
        $or: [
          { categoryId: null },
          { categoryId: '' }
        ]
      });

      console.log(`✓ Skills organization complete: ${categoriesCreated} categories created, ${updatedCount} skills updated, ${newSkillsCount} new skills created`);

      return res.status(200).json({
        success: true,
        message: "Skills organization completed successfully. All skills set to INACTIVE by default.",
        data: {
          categoriesCreated,
          categoriesUpdated,
          updatedCount,
          newSkillsCount,
          totalUncategorized,
          categorySummary,
          totalCategories: Object.keys(skillCategorizations).length,
          note: "All skills are now INACTIVE by default. You can activate them individually from the admin panel."
        }
      });

    } catch (error) {
      console.error("Error organizing skills:", error);
      return handleError(error, res);
    }
  });

  // Legacy organization endpoint (backup)
  app.post("/api/admin/organize-skills-legacy", requireAuth, async (_req: Request, res: Response) => {
    try {
      const { SkillCategory, Skill } = require("@shared/schema");
      
      // Define comprehensive skill categorization mapping with icons
      const skillCategorizations = {
        "Programming Languages": {
          icon: "💻",
          displayOrder: 1,
          skills: [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "HTML", "CSS", "Scala", "R", "MATLAB"
          ]
        },
        "Frameworks & Libraries": {
          icon: "🔧",
          displayOrder: 2,
          skills: [
            "React", "Vue.js", "Angular", "Django", "Flask", "Laravel", "Ruby on Rails", "NestJS", "Svelte", "Expo", "Next.js", "Express.js", "Node.js", "Spring Boot", "FastAPI", "jQuery", "Bootstrap", "Material-UI"
          ]
        },
        "DevOps & Cloud": {
          icon: "☁️",
          displayOrder: 3,
          skills: [
            "Docker", "Kubernetes", "AWS", "Google Cloud", "AWS EC2", "AWS S3", "Terraform", "Jenkins", "GitHub Actions", "Nginx", "Azure", "CI/CD", "Ansible", "Puppet", "Chef", "Vagrant"
          ]
        },
        "Databases": {
          icon: "🗄️",
          displayOrder: 4,
          skills: [
            "MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "DynamoDB", "Cassandra", "Elasticsearch", "Neo4j", "Oracle", "SQL Server"
          ]
        },
        "Tools & Platforms": {
          icon: "🛠️",
          displayOrder: 5,
          skills: [
            "Git", "GitHub", "Vercel", "Netlify", "Heroku", "Streamlit", "Webpack", "Capacitor", "Prisma", "Drizzle ORM", "Vite", "Postman", "VS Code", "IntelliJ IDEA", "Slack", "Jira", "Trello"
          ]
        },
        "Design & UI/UX": {
          icon: "🎨",
          displayOrder: 6,
          skills: [
            "Adobe Photoshop", "Adobe Illustrator", "Sketch", "Design Systems", "Responsive Design", "SASS/SCSS", "Tailwind CSS", "Figma", "Adobe XD", "Canva", "UI/UX Design", "Wireframing", "Prototyping"
          ]
        },
        "Data Science & ML": {
          icon: "📊",
          displayOrder: 7,
          skills: [
            "Pandas", "NumPy", "scikit-learn", "PyTorch", "Data Visualization", "OpenAI API", "TensorFlow", "Jupyter", "Matplotlib", "Seaborn", "Plotly", "Keras", "Apache Spark", "Tableau", "Power BI"
          ]
        },
        "Web Technologies": {
          icon: "🌐",
          displayOrder: 8,
          skills: [
            "REST API", "GraphQL", "WebSocket", "API Development", "Microservices", "Serverless", "OAuth", "JWT", "SOAP", "XML", "JSON"
          ]
        },
        "Mobile Development": {
          icon: "📱",
          displayOrder: 9,
          skills: [
            "App Store Optimization", "React Native", "Flutter", "iOS Development", "Android Development", "Xamarin", "Ionic", "PhoneGap", "App Store Connect", "Google Play Console"
          ]
        },
        "Operating Systems": {
          icon: "🖥️",
          displayOrder: 10,
          skills: [
            "Linux", "Windows", "macOS", "Ubuntu", "CentOS", "Red Hat", "Debian", "FreeBSD", "Unix", "Shell Scripting", "Bash", "PowerShell"
          ]
        }
      };

      // Create or update all categories
      const categoryMap = new Map();
      let categoriesCreated = 0;
      let categoriesUpdated = 0;

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
        } else {
          // Update existing category with new properties
          const updated = await SkillCategory.updateOne(
            { _id: category._id },
            { 
              icon: categoryData.icon,
              displayOrder: categoryData.displayOrder,
              updatedAt: new Date()
            }
          );
          if (updated.modifiedCount > 0) {
            categoriesUpdated++;
          }
        }
        
        categoryMap.set(categoryName, category._id.toString());
      }

      // Organize skills by categories and set them to inactive by default
      let updatedCount = 0;
      let newSkillsCount = 0;
      let setInactiveCount = 0;

      for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
        const categoryId = categoryMap.get(categoryName);
        let skillOrderInCategory = 1;
        
        for (const skillName of categoryData.skills) {
          let skill = await Skill.findOne({ 
            name: { $regex: new RegExp(`^${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
          });
          
          if (skill) {
            // Update existing skill - set to inactive and organize
            const updateResult = await Skill.updateOne(
              { _id: skill._id },
              { 
                categoryId: categoryId,
                displayOrder: skillOrderInCategory,
                isActive: false, // Set to inactive by default
                updatedAt: new Date()
              }
            );
            
            if (updateResult.modifiedCount > 0) {
              updatedCount++;
              setInactiveCount++;
            }
          } else {
            // Create new skill if it doesn't exist (inactive by default)
            skill = new Skill({
              name: skillName,
              categoryId: categoryId,
              displayOrder: skillOrderInCategory,
              isActive: false, // Default to inactive
              proficiency: 70,
              experience: '',
              description: ''
            });
            await skill.save();
            newSkillsCount++;
            setInactiveCount++;
          }
          skillOrderInCategory++;
        }
      }

      // Set any remaining uncategorized skills to inactive
      const uncategorizedSkills = await Skill.find({
        $or: [
          { categoryId: { $exists: false } },
          { categoryId: null },
          { categoryId: '' }
        ]
      });

      let uncategorizedSetInactive = 0;
      for (const skill of uncategorizedSkills) {
        await Skill.updateOne(
          { _id: skill._id },
          { 
            isActive: false,
            updatedAt: new Date()
          }
        );
        uncategorizedSetInactive++;
      }

      // Generate final statistics
      const categorySummary: Record<string, any> = {};
      for (const [categoryName] of Object.entries(skillCategorizations)) {
        const categoryId = categoryMap.get(categoryName);
        const totalCount = await Skill.countDocuments({ categoryId });
        const activeCount = await Skill.countDocuments({ categoryId, isActive: true });
        categorySummary[categoryName] = {
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount
        };
      }

      const totalUncategorized = await Skill.countDocuments({
        $or: [
          { categoryId: { $exists: false } },
          { categoryId: null },
          { categoryId: '' }
        ]
      });

      return res.status(200).json({
        success: true,
        message: "Skills organization completed successfully. All skills set to INACTIVE by default.",
        data: {
          categoriesCreated,
          categoriesUpdated,
          updatedCount,
          newSkillsCount,
          setInactiveCount,
          uncategorizedSetInactive,
          totalUncategorized,
          categorySummary,
          totalCategories: Object.keys(skillCategorizations).length,
          note: "All skills are now INACTIVE by default. You can activate them individually from the admin panel."
        }
      });

    } catch (error) {
      console.error("Error organizing skills:", error);
      return handleError(error, res);
    }
  });

  // Initialize skills data endpoint
  app.post("/api/admin/initialize-skills", requireAuth, async (_req: Request, res: Response) => {
    try {
      const { SkillCategory, Skill } = require("@shared/schema");
      
      // Check if skills already exist
      const existingSkills = await Skill.countDocuments();
      if (existingSkills > 0) {
        return res.status(200).json({ 
          success: true, 
          message: `Skills data already exists (${existingSkills} skills found)` 
        });
      }

      // Clear existing data
      await SkillCategory.deleteMany({});
      await Skill.deleteMany({});

      const skillsData = [
        {
          name: "Programming Languages",
          items: [
            { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", proficiency: 90 },
            { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", proficiency: 85 },
            { name: "C++", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg", proficiency: 80 },
            { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", proficiency: 75 },
            { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg", proficiency: 90 },
            { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", proficiency: 70 },
            { name: "Kotlin", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg", proficiency: 65 },
            { name: "Shell", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg", proficiency: 70 }
          ]
        },
        {
          name: "Frameworks & Libraries",
          items: [
            { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", proficiency: 85 },
            { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", proficiency: 80 },
            { name: "Express.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg", proficiency: 85 },
            { name: "Spring Boot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg", proficiency: 75 },
            { name: "Django", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg", proficiency: 70 },
            { name: "Flask", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg", proficiency: 75 }
          ]
        },
        {
          name: "Databases",
          items: [
            { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", proficiency: 80 },
            { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg", proficiency: 75 },
            { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg", proficiency: 70 },
            { name: "Redis", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg", proficiency: 65 }
          ]
        },
        {
          name: "DevOps & Cloud",
          items: [
            { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", proficiency: 85 },
            { name: "Kubernetes", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg", proficiency: 75 },
            { name: "AWS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg", proficiency: 80 },
            { name: "Jenkins", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg", proficiency: 70 },
            { name: "Terraform", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg", proficiency: 65 }
          ]
        },
        {
          name: "Operating Systems",
          items: [
            { name: "Ubuntu", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg", proficiency: 85 },
            { name: "Windows", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg", proficiency: 80 },
            { name: "macOS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg", proficiency: 75 }
          ]
        },
        {
          name: "Tools & Technologies",
          items: [
            { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg", proficiency: 90 },
            { name: "VS Code", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg", proficiency: 90 },
            { name: "Postman", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg", proficiency: 85 },
            { name: "Jira", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg", proficiency: 75 },
            { name: "Slack", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg", proficiency: 80 }
          ]
        }
      ];

      let totalSkills = 0;
      let categoryOrder = 0;

      for (const categoryData of skillsData) {
        categoryOrder++;
        
        const category = new SkillCategory({
          name: categoryData.name,
          displayOrder: categoryOrder,
          isActive: true
        });
        
        await category.save();
        
        let skillOrder = 0;
        for (const skillData of categoryData.items) {
          skillOrder++;
          
          const skill = new Skill({
            categoryId: category._id.toString(),
            name: skillData.name,
            icon: skillData.icon,
            proficiency: skillData.proficiency,
            displayOrder: skillOrder,
            isActive: true
          });
          
          await skill.save();
          totalSkills++;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Skills initialized successfully! Created ${skillsData.length} categories with ${totalSkills} skills.`
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Migration endpoint for about content structure
  app.post("/api/admin/migrate-about-data", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Clear existing about content
      await storage.clearAboutContent();
      
      // Create new about content with proper structure matching the main page
      const newAboutContent = [
        {
          sectionType: 'main',
          title: 'About Noorain Raza',
          subtitle: 'Who I Am',
          content: 'A DevOps engineer with passion for automation, cloud technologies, and continuous learning.',
          icon: '👨‍💻',
          isActive: true,
          displayOrder: 1
        },
        {
          sectionType: 'biography',
          title: 'Biography',
          subtitle: '',
          content: `I am a Computer Science Engineering student at Asansol Engineering College, currently maintaining a CGPA of 7.58/10. My journey in technology has equipped me with strong foundations in programming languages such as Python, Java, and JavaScript.

During my internship at Edunet Foundation in Emerging Technologies (AI & Cloud), I leveraged cutting-edge AI and Cloud technologies to design and implement scalable and efficient solutions, utilizing industry-standard tools and platforms.

I'm passionate about developing innovative solutions, particularly in AI and healthcare predictions. I've worked on projects like the AI Mock Interview App and T20 World Cup Winner Prediction model that showcase my ability to apply theoretical knowledge to practical applications.`,
          icon: '📖',
          isActive: true,
          displayOrder: 2
        },
        {
          sectionType: 'problem-solver',
          title: 'Problem Solver',
          subtitle: '',
          content: 'I thrive on finding elegant solutions to complex technical challenges, with a focus on automation and efficiency.',
          icon: '🔧',
          isActive: true,
          displayOrder: 3
        },
        {
          sectionType: 'continuous-learner',
          title: 'Continuous Learner',
          subtitle: '',
          content: `I'm passionate about expanding my knowledge and skills through continuous learning and staying up-to-date with emerging technologies.`,
          icon: '📚',
          isActive: true,
          displayOrder: 4
        },
        {
          sectionType: 'devops-specialist',
          title: 'DevOps Specialist',
          subtitle: '',
          content: 'I specialize in streamlining development workflows and implementing robust cloud infrastructure with a focus on automation and performance.',
          icon: '⚙️',
          isActive: true,
          displayOrder: 5
        },
        {
          sectionType: 'aspirations',
          title: 'Aspirations',
          subtitle: '',
          content: 'My goal is to advance in the field of AI and Cloud technologies, creating impactful applications that solve real-world problems. I aim to continue developing my skills in machine learning, cloud architecture, and software development while contributing to innovative projects.',
          icon: '🚀',
          isActive: true,
          displayOrder: 6
        }
      ];

      // Create each content item
      for (const content of newAboutContent) {
        await storage.createAboutContent(content);
      }

      return res.status(200).json({
        success: true,
        message: "About content structure migrated successfully",
        data: { migrated: true, itemsCreated: newAboutContent.length }
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Admin Certifications Content Management Routes
  app.get("/api/admin/certifications-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      let content = await storage.getCertificationsContent();
      
      // Create default content if none exists
      if (!content) {
        const defaultContent = {
          badgeText: "My Achievements",
          title: "Certifications & Awards",
          description: "Professional certifications and notable achievements that validate my expertise and skills in technology.",
          bottomText: "Continuously improving my skills through relevant certifications and hands-on experience.",
          linkedInText: "View all certifications on LinkedIn",
          linkedInUrl: "https://www.linkedin.com/in/noorainraza",
          isActive: true
        };
        content = await storage.createCertificationsContent(defaultContent);
      }
      
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/certifications-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCertificationsContentSchema.parse(req.body);
      const content = await storage.createCertificationsContent(validatedData);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/certifications-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertCertificationsContentSchema.partial().parse(req.body);
      const content = await storage.updateCertificationsContent(id, validatedData);
      
      if (!content) {
        return res.status(404).json({ success: false, message: "Certifications content not found" });
      }
      
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Projects Content Management
  app.get("/api/projects-content", async (_req: Request, res: Response) => {
    try {
      const content = await storage.getProjectsContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.get("/api/admin/projects-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getProjectsContent();
      return res.status(200).json({ success: true, data: content ? [content] : [] });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/projects-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectsContentSchema.parse(req.body);
      const content = await storage.createProjectsContent(validatedData);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/projects-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectsContentSchema.partial().parse(req.body);
      const content = await storage.updateProjectsContent(req.params.id, validatedData);
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Experience Content Management
  app.get("/api/experience-content", async (_req: Request, res: Response) => {
    try {
      const content = await storage.getExperienceContent();
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.get("/api/admin/experience-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      const content = await storage.getExperienceContent();
      return res.status(200).json({ success: true, data: content ? [content] : [] });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/experience-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertExperienceContentSchema.parse(req.body);
      const content = await storage.createExperienceContent(validatedData);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/experience-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertExperienceContentSchema.partial().parse(req.body);
      const content = await storage.updateExperienceContent(req.params.id, validatedData);
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Contact Content Management Routes
  app.get("/api/admin/contact-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      const contactContent = await storage.getContactContent();
      return res.status(200).json({ success: true, data: contactContent });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/contact-content", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactContentSchema.parse(req.body);
      const content = await storage.createContactContent(validatedData);
      return res.status(201).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.put("/api/admin/contact-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if the contact content exists first
      const existingContent = await storage.getContactContentById(id);
      if (!existingContent) {
        return res.status(404).json({ success: false, message: "Contact content not found" });
      }
      
      const validatedData = insertContactContentSchema.partial().parse(req.body);
      const content = await storage.updateContactContent(id, validatedData);
      
      if (!content) {
        return res.status(404).json({ success: false, message: "Contact content update failed" });
      }
      
      return res.status(200).json({ success: true, data: content });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.delete("/api/admin/contact-content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContactContent(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: "Contact content not found" });
      }
      
      return res.status(200).json({ success: true, message: "Contact content deleted successfully" });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Public Contact Content API
  app.get("/api/contact-content", async (_req: Request, res: Response) => {
    try {
      const contactContent = await storage.getContactContent();
      
      // Filter active content and sort by display order
      const activeContent = contactContent
        .filter(item => item.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      
      // Check if we have proper content structure
      if (activeContent.length >= 3) {
        return res.status(200).json({ 
          success: true, 
          data: activeContent
        });
      }
      
      // Create default contact content if none exists
      await storage.clearContactContent();
      
      const defaultContactContent = [
        {
          sectionType: 'header',
          title: 'Get In Touch',
          subtitle: "Let's Talk",
          description: 'Feel free to reach out for collaborations, opportunities, or just to say hello! I\'ll get back to you as soon as possible.',
          isActive: true,
          displayOrder: 1
        },
        {
          sectionType: 'contact-info',
          title: 'Contact Information',
          email: 'devops.portfolio@example.com',
          phone: '+1 555-123-4567',
          location: 'San Francisco, CA, USA',
          socialLinks: [
            { name: 'github', url: 'https://github.com/NoorainRaza23', platform: 'GitHub' },
            { name: 'linkedin', url: 'https://linkedin.com/in/noorainraza', platform: 'LinkedIn' },
            { name: 'twitter', url: 'https://x.com/NoorainRaza23', platform: 'Twitter' }
          ],
          isActive: true,
          displayOrder: 2
        },
        {
          sectionType: 'form-labels',
          title: 'Send Me a Message',
          formLabels: {
            formTitle: 'Send Me a Message',
            nameLabel: 'Name',
            emailLabel: 'Email',
            subjectLabel: 'Subject',
            messageLabel: 'Message',
            buttonText: 'Send Message',
            successMessage: 'Thank you for your message. I\'ll get back to you soon.',
            errorMessage: 'Please try again later.',
            namePlaceholder: 'Your Name',
            emailPlaceholder: 'Your Email',
            subjectPlaceholder: 'Subject',
            messagePlaceholder: 'Your Message'
          },
          isActive: true,
          displayOrder: 3
        }
      ];

      // Create each content item
      for (const content of defaultContactContent) {
        await storage.createContactContent(content as any);
      }

      const newContactContent = await storage.getContactContent();
      return res.status(200).json({ 
        success: true, 
        data: newContactContent.filter(item => item.isActive)
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Migration endpoint for contact content structure
  app.post("/api/admin/migrate-contact-content", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Clear existing contact content
      await storage.clearContactContent();

      // Create structured contact content based on current design
      const contactContentData = [
        {
          sectionType: 'header' as const,
          title: 'Get In Touch',
          subtitle: "Let's Talk",
          description: 'Feel free to reach out for collaborations, opportunities, or just to say hello! I\'ll get back to you as soon as possible.',
          isActive: true,
          displayOrder: 1
        },
        {
          sectionType: 'contact-info' as const,
          title: 'Contact Information',
          email: 'devops.portfolio@example.com',
          phone: '+1 555-123-4567',
          location: 'San Francisco, CA, USA',
          socialLinks: [
            { name: 'github', url: 'https://github.com/username', platform: 'GitHub' },
            { name: 'linkedin', url: 'https://linkedin.com/in/username', platform: 'LinkedIn' },
            { name: 'twitter', url: 'https://twitter.com/username', platform: 'Twitter' },
            { name: 'instagram', url: 'https://instagram.com/username', platform: 'Instagram' }
          ],
          isActive: true,
          displayOrder: 2
        },
        {
          sectionType: 'form-labels' as const,
          title: 'Form Configuration',
          formLabels: {
            formTitle: 'Send Me a Message',
            nameLabel: 'Name',
            emailLabel: 'Email',
            subjectLabel: 'Subject',
            messageLabel: 'Message',
            buttonText: 'Send Message',
            successMessage: 'Thank you for your message. I\'ll get back to you as soon as possible.',
            errorMessage: 'Please try again later.',
            namePlaceholder: 'Your Name',
            emailPlaceholder: 'Your Email',
            subjectPlaceholder: 'Subject',
            messagePlaceholder: 'Your Message'
          },
          isActive: true,
          displayOrder: 3
        }
      ];

      // Create each content item
      for (const content of contactContentData) {
        await storage.createContactContent(content);
      }

      return res.status(200).json({
        success: true,
        message: "Contact content structure migrated successfully",
        data: { migrated: true, itemsCreated: contactContentData.length }
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Migration endpoint for footer content initialization
  app.post("/api/admin/migrate-footer-data", requireAuth, async (_req: Request, res: Response) => {
    try {
      console.log("Starting footer data migration...");
      
      // Create default footer content matching the portfolio image
      const defaultFooterData = {
        // Main Profile Section
        profileName: "Noorain Raza",
        profileInitials: "NR",
        profileDescription: "Passionate DevOps Engineer with expertise in cloud technologies, CI/CD pipelines, and software development. Building scalable solutions for tomorrow's challenges.",
        
        // Newsletter Section
        newsletterTitle: "STAY UPDATED",
        newsletterDescription: "I'll send occasional updates on new projects and tech content.",
        newsletterButtonText: "Subscribe",
        emailPlaceholder: "Your email address",
        
        // Get in Touch Section
        getInTouchTitle: "Get in Touch",
        getInTouchItems: [
          {
            type: 'email' as const,
            label: 'Email',
            value: 'noorainraza16@gmail.com',
            link: 'mailto:noorainraza16@gmail.com'
          },
          {
            type: 'phone' as const,
            label: 'Phone',
            value: '+91 98765 43210',
            link: 'tel:+919876543210'
          },
          {
            type: 'location' as const,
            label: 'Location',
            value: 'Asansol, West Bengal, India',
            link: ''
          }
        ],
        
        // Follow Me Section
        followMeTitle: "FOLLOW ME",
        followMeItems: [
          {
            platform: 'github',
            url: 'https://github.com/NoorainRaza23',
            icon: 'github',
            label: 'GitHub'
          },
          {
            platform: 'linkedin',
            url: 'https://linkedin.com/in/noorainraza',
            icon: 'linkedin',
            label: 'LinkedIn'
          },
          {
            platform: 'twitter',
            url: 'https://x.com/NoorainRaza23',
            icon: 'twitter',
            label: 'Twitter'
          }
        ],
        
        // Quick Links Section
        quickLinksTitle: "Quick Links",
        quickLinks: [
          { label: "Home", url: "#home", type: 'internal' as const },
          { label: "About", url: "#about", type: 'internal' as const },
          { label: "Skills", url: "#skills", type: 'internal' as const },
          { label: "Projects", url: "#projects", type: 'internal' as const },
          { label: "Contact", url: "#contact", type: 'internal' as const }
        ],
        
        // Footer Bottom
        copyrightText: "© 2024 Noorain Raza. All rights reserved.",
        backToTopText: "Back to Top"
      };

      // Check if footer content already exists
      let footerContent = await storage.getFooterContent();
      
      if (!footerContent) {
        // Create new footer content
        footerContent = await storage.createFooterContent(defaultFooterData);
        console.log("Footer content created successfully");
      } else {
        // Update existing content with new fields
        footerContent = await storage.updateFooterContent(defaultFooterData);
        console.log("Footer content updated successfully");
      }
      
      return res.status(200).json({
        success: true,
        message: "Footer data migration completed successfully",
        data: { migrated: true, footerContent }
      });
    } catch (error) {
      console.error("Footer migration error:", error);
      return handleError(error, res);
    }
  });

  // File Upload API Routes
  app.post("/api/admin/upload", requireAuth, handleFileUpload(['profileImage', 'resume']), handleUploadError, async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedFiles: { [key: string]: string } = {};

      if (files.profileImage && files.profileImage[0]) {
        const file = files.profileImage[0];
        uploadedFiles.profileImage = getFileUrl(file.filename, 'image');
      }

      if (files.resume && files.resume[0]) {
        const file = files.resume[0];
        uploadedFiles.resume = getFileUrl(file.filename, 'resume');
      }

      return res.status(200).json({
        success: true,
        data: uploadedFiles,
        message: "Files uploaded successfully"
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Single file upload endpoint
  app.post("/api/admin/upload/:type", requireAuth, handleFileUpload(['file']), handleUploadError, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      console.log(`Upload request for type: ${type}`);
      console.log(`Files received:`, files);
      
      if (!files.file || !files.file[0]) {
        console.log('No file uploaded in request');
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const file = files.file[0];
      const fileType = type === 'blog-image' ? 'blog-image' : (type === 'resume' ? 'resume' : 'image');
      const fileUrl = getFileUrl(file.filename, fileType);

      console.log(`File uploaded successfully:`, {
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
        destination: file.destination,
        fileUrl: fileUrl,
        fileType: fileType
      });

      return res.status(200).json({
        success: true,
        data: {
          url: fileUrl,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          type: fileType
        },
        message: "File uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      return handleError(error, res);
    }
  });

  // Delete uploaded file endpoint
  app.delete("/api/admin/upload", requireAuth, async (req: Request, res: Response) => {
    try {
      const { filepath } = req.body;
      
      if (!filepath) {
        return res.status(400).json({
          success: false,
          message: "File path is required"
        });
      }

      const deleted = deleteFile(filepath);
      
      if (deleted) {
        return res.status(200).json({
          success: true,
          message: "File deleted successfully"
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "File not found"
        });
      }
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Migration endpoint (disabled - MongoDB already configured)
  app.post("/api/admin/migrate-experience-data", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Static experience data from the original data file
      const staticExperienceData = [
        {
          position: "Intern",
          company: "Edunet Foundation",
          duration: "Dec 2023 - Jan 2024",
          location: "Remote",
          description: "Leveraged cutting-edge AI and Cloud technologies to design and implement scalable and efficient solutions",
          responsibilities: [
            "Leveraged cutting-edge AI and Cloud technologies to design and implement scalable and efficient solutions",
            "Utilized industry-standard tools and platforms for developing AI applications",
            "Spearheaded the analysis of healthcare data to develop predictive models for diabetic patient outcomes",
            "Applied Machine Learning algorithms in Python for building accurate, data-driven insights to enhance patient care"
          ],
          displayOrder: 1,
          isActive: true
        },
        {
          position: "DevOps Intern",
          company: "Calsoft",
          duration: "2023",
          location: "Kolkata",
          description: "Implemented CI/CD pipelines using Jenkins, improving deployment efficiency by 30%",
          responsibilities: [
            "Implemented CI/CD pipelines using Jenkins, improving deployment efficiency by 30%",
            "Worked on containerization using Docker and Kubernetes for microservices architecture",
            "Automated infrastructure provisioning with Terraform and configuration management with Ansible",
            "Configured monitoring solutions using Prometheus and Grafana"
          ],
          displayOrder: 2,
          isActive: true
        }
      ];

      // Clear existing experience data and insert new data
      await storage.clearExperienceData();
      
      for (const experienceData of staticExperienceData) {
        await storage.createExperienceItem(experienceData);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Experience data migrated successfully",
        count: staticExperienceData.length
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  app.post("/api/admin/migrate-static-data", requireAuth, async (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: "Migration not needed - MongoDB already configured",
      data: { migrated: false }
    });
  });

  app.post("/api/admin/migrate-experience-active", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Update all existing experience items to be active
      const result = await ExperienceItem.updateMany(
        { isActive: { $exists: false } }, // Update items that don't have isActive field
        { $set: { isActive: true } }
      );

      // Also update any that might be false
      const result2 = await ExperienceItem.updateMany(
        { isActive: false },
        { $set: { isActive: true } }
      );

      return res.status(200).json({ 
        success: true, 
        message: "Experience items updated to active status",
        data: { 
          modifiedWithoutField: result.modifiedCount,
          modifiedFromFalse: result2.modifiedCount,
          totalModified: result.modifiedCount + result2.modifiedCount
        }
      });
    } catch (error) {
      return handleError(error, res);
    }
  });

  // Migrate Projects from Static Data
  app.post("/api/admin/migrate-projects", requireAuth, async (_req: Request, res: Response) => {
    try {
      // Clear existing projects
      await Project.deleteMany({});
      console.log("Existing projects cleared");

      // Static project data to migrate - matching original website structure exactly
      const projectsData = [
        {
          title: "AI Mock Interview App",
          description: "Developed an AI-driven job interview simulator with real-time feedback, integrating social/email authentication (via Clerk) and Google Gemini API for dynamic forms/questions. Deployed the application on Vercel for seamless performance.",
          image: "/images/ai-interview-app.jpg",
          technologies: [
            { name: "Next.js", bgColor: "bg-black dark:bg-gray-900", textColor: "text-white dark:text-gray-100" },
            { name: "React", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "MongoDB", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" },
            { name: "Google Gemini API", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" },
            { name: "Vercel", bgColor: "bg-black dark:bg-gray-900", textColor: "text-white dark:text-gray-100" }
          ],
          demoUrl: "#",
          githubUrl: "#",
          featured: true,
          displayOrder: 1
        },
        {
          title: "T20 World Cup Winner Prediction using ML",
          description: "Developed an AI-powered Streamlit model to predict T20 World Cup winners by analyzing team performance, match trends, and tournament simulations. The model features real-time analytics, player comparisons, and live win probability updates, delivering actionable insights.",
          image: "/images/t20-prediction.jpg",
          technologies: [
            { name: "Python", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "Streamlit", bgColor: "bg-red-100 dark:bg-red-900", textColor: "text-red-800 dark:text-red-200" },
            { name: "Pandas", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "Scikit-learn", bgColor: "bg-orange-100 dark:bg-orange-900", textColor: "text-orange-800 dark:text-orange-200" },
            { name: "API Integration", bgColor: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-800 dark:text-purple-200" }
          ],
          demoUrl: "#",
          githubUrl: "#",
          featured: true,
          displayOrder: 2
        },
        {
          title: "Healthcare Prediction for Diabetic Patients",
          description: "Spearheaded the analysis of healthcare data to develop predictive models for diabetic patient outcomes, utilizing Machine Learning algorithms in Python. Focused on building accurate, data-driven insights that can potentially enhance patient care and treatment strategies.",
          image: "/images/healthcare-prediction.jpg",
          technologies: [
            { name: "Python", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "Machine Learning", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" },
            { name: "Data Analysis", bgColor: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-800 dark:text-purple-200" },
            { name: "Healthcare", bgColor: "bg-red-100 dark:bg-red-900", textColor: "text-red-800 dark:text-red-200" }
          ],
          demoUrl: "#",
          githubUrl: "#",
          featured: true,
          displayOrder: 3
        },
        {
          title: "Multipurpose Distance Maintaining Device",
          description: "Developed a multipurpose device designed for various applications, including maintaining safe distances, measuring distances, assisting in car parking, and enhancing security at entry gates. This project won 2nd position in the 'Innovative Hardware Model Making Competition' at AEC Hardware Club.",
          image: "/images/distance-device.jpg",
          technologies: [
            { name: "Hardware", bgColor: "bg-gray-100 dark:bg-gray-700", textColor: "text-gray-800 dark:text-gray-300" },
            { name: "IoT", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "Electronics", bgColor: "bg-yellow-100 dark:bg-yellow-900", textColor: "text-yellow-800 dark:text-yellow-200" }
          ],
          demoUrl: "#",
          githubUrl: "#",
          featured: false,
          displayOrder: 4
        },
        {
          title: "Final Year Project (SDM-EONs)",
          description: "An advanced network simulation project focused on space division multiplexing in elastic optical networks, optimizing resource allocation and routing.",
          image: "/images/sdm-eons.jpg",
          technologies: [
            { name: "Python", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "Shell Scripting", bgColor: "bg-gray-100 dark:bg-gray-700", textColor: "text-gray-800 dark:text-gray-300" },
            { name: "Networking", bgColor: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-800 dark:text-purple-200" }
          ],
          demoUrl: "#",
          githubUrl: "https://github.com/NoorainRaza23/sdm-eons",
          featured: false,
          displayOrder: 5
        },
        {
          title: "Bank Management System",
          description: "A comprehensive banking application with user authentication, account management, transaction history, and admin controls.",
          image: "/images/bank-management.jpg",
          technologies: [
            { name: "Java", bgColor: "bg-orange-100 dark:bg-orange-900", textColor: "text-orange-800 dark:text-orange-200" },
            { name: "Swing", bgColor: "bg-gray-100 dark:bg-gray-700", textColor: "text-gray-800 dark:text-gray-300" },
            { name: "MySQL", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
            { name: "JDBC", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" }
          ],
          demoUrl: "#",
          githubUrl: "https://github.com/NoorainRaza23/bank-management",
          featured: false,
          displayOrder: 6
        }
      ];

      // Insert projects into database
      const insertedProjects = await Project.insertMany(projectsData);
      console.log(`Inserted ${insertedProjects.length} projects`);

      return res.status(200).json({ 
        success: true, 
        message: `Successfully migrated ${insertedProjects.length} projects to database`,
        data: insertedProjects 
      });
    } catch (error) {
      console.error("Projects migration error:", error);
      return handleError(error, res);
    }
  });

  // Return the HTTP server that was passed in
  return httpServer;
}