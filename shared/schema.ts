import mongoose, { Document, Schema } from "mongoose";
import { z } from "zod";

// User Schema
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for role-based queries
userSchema.index({ role: 1, isActive: 1 });

export const User = mongoose.model<IUser>("User", userSchema);

export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'user']).default('admin'),
  isActive: z.boolean().default(true),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Contact Messages Schema
export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: Date;
  repliedAt?: Date;
  adminNotes?: string;
  tags: string[];
  phoneNumber?: string;
  company?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageMongooseSchema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  repliedAt: { type: Date },
  adminNotes: { type: String },
  tags: [{ type: String }],
  phoneNumber: { type: String },
  company: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient contact message queries
contactMessageMongooseSchema.index({ status: 1, createdAt: -1 });
contactMessageMongooseSchema.index({ priority: 1, isRead: 1 });
contactMessageMongooseSchema.index({ email: 1 });
contactMessageMongooseSchema.index({ createdAt: -1 });

export const ContactMessage = mongoose.model<IContactMessage>("ContactMessage", contactMessageMongooseSchema);

export const contactMessageValidationSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
});

// Export the validation schema as contactMessageSchema for consistency
export { contactMessageValidationSchema as contactMessageSchema };

export const insertContactMessageSchema = z.object({
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  status: z.enum(['unread', 'read', 'replied', 'archived']).default('unread'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  isRead: z.boolean().default(false),
  readAt: z.date().optional(),
  repliedAt: z.date().optional(),
  adminNotes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// About Content Schema
export interface IAboutContent extends Document {
  sectionType: 'main' | 'biography' | 'problem-solver' | 'continuous-learner' | 'devops-specialist' | 'aspirations';
  title: string;
  subtitle?: string;
  content: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const aboutContentSchema = new Schema<IAboutContent>({
  sectionType: { 
    type: String, 
    enum: ['main', 'biography', 'problem-solver', 'continuous-learner', 'devops-specialist', 'aspirations'],
    required: true
  },
  title: { type: String, required: true },
  subtitle: { type: String },
  content: { type: String, required: true },
  icon: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for content queries
aboutContentSchema.index({ sectionType: 1, displayOrder: 1 });
aboutContentSchema.index({ isActive: 1 });

export const AboutContent = mongoose.model<IAboutContent>("AboutContent", aboutContentSchema);

export const insertAboutContentSchema = z.object({
  sectionType: z.enum(['main', 'biography', 'problem-solver', 'continuous-learner', 'devops-specialist', 'aspirations']),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string(),
  icon: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export type InsertAboutContent = z.infer<typeof insertAboutContentSchema>;

// Skill Category Schema
export interface ISkillCategory extends Document {
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillCategorySchema = new Schema<ISkillCategory>({
  name: { type: String, required: true },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

skillCategorySchema.index({ displayOrder: 1 });
skillCategorySchema.index({ isActive: 1 });

export const SkillCategory = mongoose.model<ISkillCategory>("SkillCategory", skillCategorySchema);

export const insertSkillCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type InsertSkillCategory = z.infer<typeof insertSkillCategorySchema>;

// Skills Schema
export interface ISkill extends Document {
  categoryId: string;
  name: string;
  icon?: string;
  proficiency: number;
  years?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>({
  categoryId: { type: String, required: true, ref: 'SkillCategory' },
  name: { type: String, required: true },
  icon: { type: String },
  proficiency: { type: Number, default: 0 },
  years: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

skillSchema.index({ categoryId: 1, displayOrder: 1 });
skillSchema.index({ proficiency: -1 });

export const Skill = mongoose.model<ISkill>("Skill", skillSchema);

export const insertSkillSchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  proficiency: z.number().min(0).max(100).default(0),
  years: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type InsertSkill = z.infer<typeof insertSkillSchema>;

// Education Schema
export interface IEducationItem extends Document {
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  year: string; // Display year (e.g., "2021 - 2025" or "2018")
  result?: string; // CGPA, percentage, etc.
  location?: string;
  description?: string;
  educationType: 'university' | 'higher-secondary' | 'secondary' | 'certification' | 'other';
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const educationItemSchema = new Schema<IEducationItem>({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  year: { type: String, required: true },
  result: { type: String },
  location: { type: String },
  description: { type: String },
  educationType: { 
    type: String, 
    enum: ['university', 'higher-secondary', 'secondary', 'certification', 'other'],
    default: 'university'
  },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

educationItemSchema.index({ educationType: 1, displayOrder: 1 });
educationItemSchema.index({ isActive: 1 });

export const EducationItem = mongoose.model<IEducationItem>("EducationItem", educationItemSchema);

export const insertEducationItemSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  year: z.string(),
  result: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  educationType: z.enum(['university', 'higher-secondary', 'secondary', 'certification', 'other']).default('university'),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export type InsertEducationItem = z.infer<typeof insertEducationItemSchema>;

// Experience Schema
export interface IExperienceItem extends Document {
  position: string;
  company: string;
  duration: string;
  location?: string;
  description?: string;
  responsibilities?: string[];
  displayOrder: number;
  isActive: boolean;
}

const experienceItemSchema = new Schema<IExperienceItem>({
  position: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  responsibilities: [{ type: String }],
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

experienceItemSchema.index({ displayOrder: 1 });
experienceItemSchema.index({ company: 1 });

export const ExperienceItem = mongoose.model<IExperienceItem>("ExperienceItem", experienceItemSchema);

export const insertExperienceItemSchema = z.object({
  position: z.string(),
  company: z.string(),
  duration: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});

export type InsertExperienceItem = z.infer<typeof insertExperienceItemSchema>;

// Projects Schema
export interface IProject extends Document {
  title: string;
  description: string;
  image: string;
  technologies: Array<{
    name: string;
    bgColor: string;
    textColor: string;
  }>;
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  technologies: [{
    name: { type: String, required: true },
    bgColor: { type: String, required: true },
    textColor: { type: String, required: true }
  }],
  demoUrl: { type: String, default: "#" },
  githubUrl: { type: String, default: "#" },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

projectSchema.index({ featured: -1, displayOrder: 1 });
projectSchema.index({ displayOrder: 1 });
projectSchema.index({ isActive: 1 });

export const Project = mongoose.model<IProject>("Project", projectSchema);

export const insertProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image is required"),
  technologies: z.array(z.object({
    name: z.string(),
    bgColor: z.string(),
    textColor: z.string()
  })).min(1, "At least one technology is required"),
  demoUrl: z.string().default(""),
  githubUrl: z.string().default(""),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;

// Certifications & Awards Schema
export interface ICertification extends Document {
  title: string;
  description: string;
  type: 'certificate' | 'award' | 'course' | 'other';
  date: string;
  issuer: string;
  url?: string;
  credentialId?: string;
  expiryDate?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const certificationSchema = new Schema<ICertification>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['certificate', 'award', 'course', 'other'],
    default: 'certificate'
  },
  date: { type: String, required: true },
  issuer: { type: String, required: true },
  url: { type: String },
  credentialId: { type: String },
  expiryDate: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Certification = mongoose.model<ICertification>("Certification", certificationSchema);

export const insertCertificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(['certificate', 'award', 'course', 'other']).default('certificate'),
  date: z.string().min(1, "Date is required"),
  issuer: z.string().min(1, "Issuer is required"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  credentialId: z.string().optional(),
  expiryDate: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
});

export type InsertCertification = z.infer<typeof insertCertificationSchema>;

// Blog Posts Schema
export interface IBlogPost extends Document {
  userId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  readTime: number; // estimated reading time in minutes
  seoTitle?: string;
  seoDescription?: string;
  externalLink?: string; // Optional external link for the blog post
  isPublished: boolean;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>({
  userId: { type: String, required: true, ref: 'User' },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  featuredImage: { type: String, required: true },
  tags: [{ type: String }],
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  views: { type: Number, default: 0 },
  readTime: { type: Number, required: true },
  seoTitle: { type: String },
  seoDescription: { type: String },
  externalLink: { type: String },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient blog queries
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ isPublished: 1, isFeatured: -1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ userId: 1 });

export const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);

export const insertBlogPostSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  featuredImage: z.string().min(1, "Featured image is required"),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1, "Category is required"),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  views: z.number().default(0),
  readTime: z.number().min(1, "Read time is required"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  externalLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
  publishedAt: z.union([
    z.date(),
    z.string().transform((str) => new Date(str))
  ]).optional(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Blog Content Schema (for section management)
export interface IBlogContent extends Document {
  title: string;
  subtitle: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  showRecentPosts: boolean;
  postsPerPage: number;
  enableCategories: boolean;
  enableTags: boolean;
  enableSearch: boolean;
  enableComments: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogContentSchema = new Schema<IBlogContent>({
  title: { type: String, required: true, default: "Blog" },
  subtitle: { type: String, required: true, default: "Insights, tutorials, and thoughts" },
  description: { type: String, required: true, default: "Welcome to my blog where I share insights about technology, development, and innovation." },
  seoTitle: { type: String },
  seoDescription: { type: String },
  showRecentPosts: { type: Boolean, default: true },
  postsPerPage: { type: Number, default: 6 },
  enableCategories: { type: Boolean, default: true },
  enableTags: { type: Boolean, default: true },
  enableSearch: { type: Boolean, default: true },
  enableComments: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const BlogContent = mongoose.model<IBlogContent>("BlogContent", blogContentSchema);

export const insertBlogContentSchema = z.object({
  title: z.string().min(1, "Title is required").default("Blog"),
  subtitle: z.string().min(1, "Subtitle is required").default("Insights, tutorials, and thoughts"),
  description: z.string().min(10, "Description must be at least 10 characters").default("Welcome to my blog where I share insights about technology, development, and innovation."),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  showRecentPosts: z.boolean().default(true),
  postsPerPage: z.number().min(1).max(50).default(6),
  enableCategories: z.boolean().default(true),
  enableTags: z.boolean().default(true),
  enableSearch: z.boolean().default(true),
  enableComments: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type InsertBlogContent = z.infer<typeof insertBlogContentSchema>;

// Site Settings Schema
export interface ISiteSettings extends Document {
  siteName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  socialLinks?: Record<string, any>;
  resumeUrl?: string;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>({
  siteName: { type: String, required: true },
  tagline: { type: String },
  description: { type: String },
  logoUrl: { type: String },
  faviconUrl: { type: String },
  primaryColor: { type: String, maxlength: 7 },
  secondaryColor: { type: String, maxlength: 7 },
  socialLinks: { type: Schema.Types.Mixed },
  resumeUrl: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

export const SiteSettings = mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);

export const insertSiteSettingsSchema = z.object({
  siteName: z.string(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  primaryColor: z.string().max(7).optional(),
  secondaryColor: z.string().max(7).optional(),
  socialLinks: z.record(z.any()).optional(),
  resumeUrl: z.string().optional(),
});

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

// Hero Section Schema
export interface IHeroContent extends Document {
  firstName: string;
  lastName: string;
  title: string;
  tagline: string;
  heroImage?: string;
  navImage?: string;
  roles: string[];
  resumeUrl?: string;
  resumeLabel?: string;
  socialLinks?: {
    platform: string;
    url: string;
    icon?: string;
    isVisible?: boolean;
  }[];
  updatedAt: Date;
}

const heroContentSchema = new Schema<IHeroContent>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  heroImage: { type: String },
  navImage: { type: String },
  roles: [{ type: String }],
  resumeUrl: { type: String },
  resumeLabel: { type: String },
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String },
    isVisible: { type: Boolean, default: true }
  }],
  updatedAt: { type: Date, default: Date.now },
});

export const HeroContent = mongoose.model<IHeroContent>("HeroContent", heroContentSchema);

export const insertHeroContentSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  title: z.string(),
  tagline: z.string(),
  heroImage: z.string().optional(),
  navImage: z.string().optional(),
  roles: z.array(z.string()).optional(),
  resumeUrl: z.string().optional(),
  resumeLabel: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string().optional(),
    isVisible: z.boolean().optional()
  })).optional(),
});

export type InsertHeroContent = z.infer<typeof insertHeroContentSchema>;

// Social Links Schema
export interface ISocialLink extends Document {
  platform: string;
  url: string;
  icon?: string;
  displayOrder: number;
  isVisible: boolean;
}

const socialLinkSchema = new Schema<ISocialLink>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
});

export const SocialLink = mongoose.model<ISocialLink>("SocialLink", socialLinkSchema);

export const insertSocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  icon: z.string().optional(),
  displayOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;

// Testimonials Schema
export interface ITestimonial extends Document {
  name: string;
  position: string;
  company: string;
  testimonial: string;
  imageUrl?: string;
  rating?: number;
  displayOrder: number;
  isVisible: boolean;
}

const testimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true },
  position: { type: String, required: true },
  company: { type: String, required: true },
  testimonial: { type: String, required: true },
  imageUrl: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
});

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", testimonialSchema);

export const insertTestimonialSchema = z.object({
  name: z.string(),
  position: z.string(),
  company: z.string(),
  testimonial: z.string(),
  imageUrl: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  displayOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Services Schema
export interface IService extends Document {
  title: string;
  description: string;
  icon?: string;
  features: string[];
  pricing?: string;
  displayOrder: number;
  isVisible: boolean;
}

const serviceSchema = new Schema<IService>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  features: [{ type: String }],
  pricing: { type: String },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
});

export const Service = mongoose.model<IService>("Service", serviceSchema);

export const insertServiceSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  features: z.array(z.string()).optional(),
  pricing: z.string().optional(),
  displayOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
});

export type InsertService = z.infer<typeof insertServiceSchema>;

// Education Content Schema (for section text management)
export interface IEducationContent extends Document {
  sectionTitle: string;
  sectionSubtitle: string;
  sectionDescription: string;
  bottomDescription: string;
  certificationsLinkText: string;
  certificationsLinkUrl: string;
}

const educationContentSchema = new Schema<IEducationContent>({
  sectionTitle: { type: String, default: "Education" },
  sectionSubtitle: { type: String, default: "Academic Background" },
  sectionDescription: { type: String, default: "My academic journey and qualifications that have shaped my professional development." },
  bottomDescription: { type: String, default: "My education has provided me with a strong foundation in computer science, engineering principles, and problem-solving methodologies that I apply to my work every day." },
  certificationsLinkText: { type: String, default: "View My Professional Certifications" },
  certificationsLinkUrl: { type: String, default: "#certifications" },
});

export const EducationContent = mongoose.model<IEducationContent>("EducationContent", educationContentSchema);

export const insertEducationContentSchema = z.object({
  sectionTitle: z.string(),
  sectionSubtitle: z.string(),
  sectionDescription: z.string(),
  bottomDescription: z.string(),
  certificationsLinkText: z.string(),
  certificationsLinkUrl: z.string(),
});

export type InsertEducationContent = z.infer<typeof insertEducationContentSchema>;

// Experience Content Schema
export interface IExperienceContent extends Document {
  sectionTag: string;
  sectionTitle: string;
  sectionDescription: string;
  experienceBadgeText: string;
  projectsButtonText: string;
  projectsButtonUrl: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const experienceContentSchema = new Schema<IExperienceContent>({
  sectionTag: { type: String, required: true, default: "Career Path" },
  sectionTitle: { type: String, required: true, default: "Professional Experience" },
  sectionDescription: { type: String, required: true, default: "My professional journey in DevOps and software development, showcasing key roles and achievements." },
  experienceBadgeText: { type: String, required: true, default: "2+ Years Experience" },
  projectsButtonText: { type: String, required: true, default: "See My Projects" },
  projectsButtonUrl: { type: String, required: true, default: "#projects" },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ExperienceContent = mongoose.model<IExperienceContent>("ExperienceContent", experienceContentSchema);

export const insertExperienceContentSchema = z.object({
  sectionTag: z.string().min(1, "Section tag is required"),
  sectionTitle: z.string().min(1, "Section title is required"),
  sectionDescription: z.string().min(1, "Section description is required"),
  experienceBadgeText: z.string().min(1, "Experience badge text is required"),
  projectsButtonText: z.string().min(1, "Projects button text is required"),
  projectsButtonUrl: z.string().min(1, "Projects button URL is required"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0)
});

export type InsertExperienceContent = z.infer<typeof insertExperienceContentSchema>;

// Admin Session Schema for secure authentication
export interface IAdminSession extends Document {
  sessionId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

const adminSessionSchema = new Schema<IAdminSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, ref: 'User' },
  userAgent: { type: String },
  ipAddress: { type: String },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
});

export const AdminSession = mongoose.model<IAdminSession>("AdminSession", adminSessionSchema);

export const insertAdminSessionSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.date(),
});

export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;

// Enhanced User type for authentication
export type SelectUser = Pick<IUser, '_id' | 'username' | 'email' | 'role'> & {
  id: string;
};

// Footer Content Schema
export interface IFooterContent extends Document {
  // Main Profile Section
  profileName: string;
  profileInitials: string;
  profileDescription: string;
  
  // Newsletter Section
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  emailPlaceholder: string;
  
  // Get in Touch Section
  getInTouchTitle: string;
  getInTouchItems: Array<{
    type: 'email' | 'phone' | 'location' | 'custom';
    label: string;
    value: string;
    icon?: string;
    link?: string;
  }>;
  
  // Follow Me Section
  followMeTitle: string;
  followMeItems: Array<{
    platform: string;
    url: string;
    icon: string;
    label: string;
    isActive?: boolean;
  }>;
  
  // Quick Links Section
  quickLinksTitle: string;
  quickLinks: Array<{
    label: string;
    url: string;
    type: 'internal' | 'external';
  }>;
  
  // Footer Bottom
  copyrightText: string;
  backToTopText: string;
  updatedAt: Date;
}

const footerContentSchema = new Schema<IFooterContent>({
  // Main Profile Section
  profileName: { type: String, required: true, default: "Noorain Raza" },
  profileInitials: { type: String, required: true, default: "NR" },
  profileDescription: { type: String, required: true, default: "Passionate DevOps Engineer with expertise in cloud technologies, CI/CD pipelines, and software development. Building scalable solutions for tomorrow's challenges." },
  
  // Newsletter Section
  newsletterTitle: { type: String, required: true, default: "STAY UPDATED" },
  newsletterDescription: { type: String, required: true, default: "I'll send occasional updates on new projects and tech content." },
  newsletterButtonText: { type: String, required: true, default: "Subscribe" },
  emailPlaceholder: { type: String, required: true, default: "Your email address" },
  
  // Get in Touch Section
  getInTouchTitle: { type: String, required: true, default: "Get in Touch" },
  getInTouchItems: [{
    type: { type: String, enum: ['email', 'phone', 'location', 'custom'], required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
    icon: { type: String },
    link: { type: String }
  }],
  
  // Follow Me Section
  followMeTitle: { type: String, required: true, default: "FOLLOW ME" },
  followMeItems: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, required: true },
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }],
  
  // Quick Links Section
  quickLinksTitle: { type: String, required: true, default: "Quick Links" },
  quickLinks: [{
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['internal', 'external'], default: 'internal' }
  }],
  
  // Footer Bottom
  copyrightText: { type: String, required: true, default: "© 2024 Noorain Raza. All rights reserved." },
  backToTopText: { type: String, required: true, default: "Back to Top" },
  updatedAt: { type: Date, default: Date.now }
});

export const FooterContent = mongoose.model<IFooterContent>("FooterContent", footerContentSchema);

export const insertFooterContentSchema = z.object({
  // Main Profile Section
  profileName: z.string().default("Noorain Raza"),
  profileInitials: z.string().default("NR"),
  profileDescription: z.string().default("Passionate DevOps Engineer with expertise in cloud technologies, CI/CD pipelines, and software development. Building scalable solutions for tomorrow's challenges."),
  
  // Newsletter Section
  newsletterTitle: z.string().default("STAY UPDATED"),
  newsletterDescription: z.string().default("I'll send occasional updates on new projects and tech content."),
  newsletterButtonText: z.string().default("Subscribe"),
  emailPlaceholder: z.string().default("Your email address"),
  
  // Get in Touch Section
  getInTouchTitle: z.string().default("Get in Touch"),
  getInTouchItems: z.array(z.object({
    type: z.enum(['email', 'phone', 'location', 'custom']),
    label: z.string(),
    value: z.string(),
    icon: z.string().optional(),
    link: z.string().optional()
  })).optional(),
  
  // Follow Me Section
  followMeTitle: z.string().default("FOLLOW ME"),
  followMeItems: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string(),
    label: z.string(),
    isActive: z.boolean().default(true)
  })).optional(),
  
  // Quick Links Section
  quickLinksTitle: z.string().default("Quick Links"),
  quickLinks: z.array(z.object({
    label: z.string(),
    url: z.string(),
    type: z.enum(['internal', 'external']).default('internal')
  })).optional(),
  
  // Footer Bottom
  copyrightText: z.string().default("© 2024 Noorain Raza. All rights reserved."),
  backToTopText: z.string().default("Back to Top")
});

export type InsertFooterContent = z.infer<typeof insertFooterContentSchema>;

// Certifications Content Schema
export interface ICertificationsContent extends Document {
  badgeText: string;
  title: string;
  description: string;
  bottomText: string;
  linkedInText: string;
  linkedInUrl: string;
  isActive: boolean;
  updatedAt: Date;
}

const certificationsContentSchema = new Schema<ICertificationsContent>({
  badgeText: { type: String, required: true, default: "My Achievements" },
  title: { type: String, required: true, default: "Certifications & Awards" },
  description: { type: String, required: true, default: "Professional certifications and notable achievements that validate my expertise and skills in technology." },
  bottomText: { type: String, required: true, default: "Continuously improving my skills through relevant certifications and hands-on experience." },
  linkedInText: { type: String, required: true, default: "View all certifications on LinkedIn" },
  linkedInUrl: { type: String, required: true, default: "https://www.linkedin.com/in/noorainraza" },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

export const CertificationsContent = mongoose.model<ICertificationsContent>("CertificationsContent", certificationsContentSchema);

export const insertCertificationsContentSchema = z.object({
  badgeText: z.string().default("My Achievements"),
  title: z.string().default("Certifications & Awards"),
  description: z.string().default("Professional certifications and notable achievements that validate my expertise and skills in technology."),
  bottomText: z.string().default("Continuously improving my skills through relevant certifications and hands-on experience."),
  linkedInText: z.string().default("View all certifications on LinkedIn"),
  linkedInUrl: z.string().url().default("https://www.linkedin.com/in/noorainraza"),
  isActive: z.boolean().default(true)
});

export type InsertCertificationsContent = z.infer<typeof insertCertificationsContentSchema>;

// Contact Content Schema
export interface IContactContent extends Document {
  sectionType: 'header' | 'contact-info' | 'form-labels';
  title: string;
  subtitle?: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  socialLinks?: Array<{
    name: string;
    url: string;
    platform: string;
  }>;
  formLabels?: {
    formTitle: string;
    nameLabel: string;
    emailLabel: string;
    subjectLabel: string;
    messageLabel: string;
    buttonText: string;
    successMessage: string;
    errorMessage: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const contactContentSchema = new Schema<IContactContent>({
  sectionType: { 
    type: String, 
    enum: ['header', 'contact-info', 'form-labels'], 
    required: true 
  },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  email: { type: String },
  phone: { type: String },
  location: { type: String },
  socialLinks: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    platform: { type: String, required: true }
  }],
  formLabels: {
    formTitle: { type: String },
    nameLabel: { type: String },
    emailLabel: { type: String },
    subjectLabel: { type: String },
    messageLabel: { type: String },
    buttonText: { type: String },
    successMessage: { type: String },
    errorMessage: { type: String },
    namePlaceholder: { type: String },
    emailPlaceholder: { type: String },
    subjectPlaceholder: { type: String },
    messagePlaceholder: { type: String }
  },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ContactContent = mongoose.model<IContactContent>("ContactContent", contactContentSchema);

export const insertContactContentSchema = z.object({
  sectionType: z.enum(['header', 'contact-info', 'form-labels']),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    platform: z.string()
  })).optional(),
  formLabels: z.object({
    formTitle: z.string(),
    nameLabel: z.string(),
    emailLabel: z.string(),
    subjectLabel: z.string(),
    messageLabel: z.string(),
    buttonText: z.string(),
    successMessage: z.string(),
    errorMessage: z.string(),
    namePlaceholder: z.string(),
    emailPlaceholder: z.string(),
    subjectPlaceholder: z.string(),
    messagePlaceholder: z.string()
  }).optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0)
});

export type InsertContactContent = z.infer<typeof insertContactContentSchema>;

// Projects Content Schema
export interface IProjectsContent extends Document {
  sectionTag: string;
  sectionTitle: string;
  sectionDescription: string;
  githubButtonText: string;
  githubButtonUrl: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectsContentSchema = new Schema<IProjectsContent>({
  sectionTag: { type: String, required: true, default: "My Work" },
  sectionTitle: { type: String, required: true, default: "Featured Projects" },
  sectionDescription: { type: String, required: true, default: "Here are some of the key projects I've worked on, showcasing my technical skills and problem-solving abilities." },
  githubButtonText: { type: String, required: true, default: "View All Projects on GitHub" },
  githubButtonUrl: { type: String, required: true, default: "https://github.com/NoorainRaza23" },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ProjectsContent = mongoose.model<IProjectsContent>("ProjectsContent", projectsContentSchema);

export const insertProjectsContentSchema = z.object({
  sectionTag: z.string().min(1, "Section tag is required"),
  sectionTitle: z.string().min(1, "Section title is required"),
  sectionDescription: z.string().min(1, "Section description is required"),
  githubButtonText: z.string().min(1, "GitHub button text is required"),
  githubButtonUrl: z.string().url("Must be a valid URL"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0)
});

export type InsertProjectsContent = z.infer<typeof insertProjectsContentSchema>;