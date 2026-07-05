import {
  User, ContactMessage, AboutContent, SkillCategory, Skill, EducationItem,
  ExperienceItem, Project, Certification, BlogPost, BlogContent, SiteSettings, HeroContent,
  SocialLink, Testimonial, Service, AdminSession, FooterContent, ContactContent,
  EducationContent, CertificationsContent, ProjectsContent, ExperienceContent,
  type IUser, type IContactMessage, type IAboutContent, type ISkillCategory,
  type ISkill, type IEducationItem, type IExperienceItem, type IProject,
  type ICertification, type IBlogPost, type IBlogContent, type ISiteSettings, type IHeroContent,
  type ISocialLink, type ITestimonial, type IService, type IAdminSession,
  type IFooterContent, type IContactContent, type IEducationContent,
  type ICertificationsContent, type IProjectsContent, type IExperienceContent,
  type InsertUser, type InsertContactMessage, type InsertAboutContent,
  type InsertSkillCategory, type InsertSkill, type InsertEducationItem,
  type InsertExperienceItem, type InsertProject, type InsertCertification,
  type InsertBlogPost, type InsertBlogContent, type InsertSiteSettings, type InsertHeroContent,
  type InsertSocialLink, type InsertTestimonial, type InsertService,
  type InsertFooterContent, type InsertContactContent, type InsertEducationContent,
  type InsertCertificationsContent, type InsertProjectsContent, type InsertExperienceContent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(data: InsertUser): Promise<IUser>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<IUser[]>;

  // Contact Messages
  createContactMessage(data: InsertContactMessage): Promise<IContactMessage>;
  getContactMessages(): Promise<IContactMessage[]>;
  getContactMessage(id: string): Promise<IContactMessage | null>;
  updateContactMessage(id: string, data: Partial<IContactMessage>): Promise<IContactMessage | null>;
  deleteContactMessage(id: string): Promise<boolean>;
  markMessageAsRead(id: string): Promise<IContactMessage | null>;
  markMessageAsReplied(id: string): Promise<IContactMessage | null>;
  archiveMessage(id: string): Promise<IContactMessage | null>;
  getMessagesByStatus(status: string): Promise<IContactMessage[]>;
  getUnreadMessages(): Promise<IContactMessage[]>;
  getMessagesByPriority(priority: string): Promise<IContactMessage[]>;

  // About Content
  getAboutContent(): Promise<IAboutContent[]>;
  getAboutContentById(id: string): Promise<IAboutContent | null>;
  createAboutContent(data: any): Promise<IAboutContent>;
  updateAboutContent(id: string, data: any): Promise<IAboutContent | null>;
  deleteAboutContent(id: string): Promise<boolean>;
  clearAboutContent(): Promise<boolean>;

  // Skill Categories
  getSkillCategories(): Promise<ISkillCategory[]>;
  getActiveSkillCategories(): Promise<ISkillCategory[]>;
  getSkillCategory(id: string): Promise<ISkillCategory | null>;
  createSkillCategory(data: InsertSkillCategory): Promise<ISkillCategory>;
  updateSkillCategory(id: string, data: Partial<InsertSkillCategory>): Promise<ISkillCategory | null>;
  deleteSkillCategory(id: string): Promise<boolean>;

  // Skills
  getSkills(): Promise<ISkill[]>;
  getActiveSkills(): Promise<ISkill[]>;
  getSkillsByCategory(categoryId: string): Promise<ISkill[]>;
  getActiveSkillsByCategory(categoryId: string): Promise<ISkill[]>;
  getSkill(id: string): Promise<ISkill | null>;
  createSkill(data: InsertSkill): Promise<ISkill>;
  updateSkill(id: string, data: Partial<InsertSkill>): Promise<ISkill | null>;
  deleteSkill(id: string): Promise<boolean>;

  // Education
  getEducation(): Promise<IEducationItem[]>;
  getEducationItem(id: string): Promise<IEducationItem | null>;
  createEducationItem(data: InsertEducationItem): Promise<IEducationItem>;
  updateEducationItem(id: string, data: Partial<InsertEducationItem>): Promise<IEducationItem | null>;
  deleteEducationItem(id: string): Promise<boolean>;

  // Education Content (section text management)
  getEducationContent(): Promise<IEducationContent | null>;
  createEducationContent(data: InsertEducationContent): Promise<IEducationContent>;
  updateEducationContent(id: string, data: Partial<InsertEducationContent>): Promise<IEducationContent | null>;

  // Experience
  getExperience(): Promise<IExperienceItem[]>;
  getActiveExperience(): Promise<IExperienceItem[]>;
  getExperienceItem(id: string): Promise<IExperienceItem | null>;
  createExperienceItem(data: InsertExperienceItem): Promise<IExperienceItem>;
  updateExperienceItem(id: string, data: Partial<InsertExperienceItem>): Promise<IExperienceItem | null>;
  deleteExperienceItem(id: string): Promise<boolean>;
  clearExperienceData(): Promise<boolean>;

  // Projects
  getProjects(): Promise<IProject[]>;
  getActiveProjects(): Promise<IProject[]>;
  getProject(id: string): Promise<IProject | null>;
  createProject(data: InsertProject): Promise<IProject>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<IProject | null>;
  deleteProject(id: string): Promise<boolean>;

  // Certifications
  getCertifications(): Promise<ICertification[]>;
  getCertification(id: string): Promise<ICertification | null>;
  createCertification(data: InsertCertification): Promise<ICertification>;
  updateCertification(id: string, data: Partial<InsertCertification>): Promise<ICertification | null>;
  deleteCertification(id: string): Promise<boolean>;

  // Blog Posts
  getBlogPosts(): Promise<IBlogPost[]>;
  getActiveBlogPosts(): Promise<IBlogPost[]>;
  getPublishedBlogPosts(): Promise<IBlogPost[]>;
  getBlogPost(id: string): Promise<IBlogPost | null>;
  getBlogPostBySlug(slug: string): Promise<IBlogPost | null>;
  createBlogPost(data: InsertBlogPost): Promise<IBlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<IBlogPost | null>;
  deleteBlogPost(id: string): Promise<boolean>;

  // Blog Content (section management)
  getBlogContent(): Promise<IBlogContent | null>;
  createBlogContent(data: InsertBlogContent): Promise<IBlogContent>;
  updateBlogContent(id: string, data: Partial<InsertBlogContent>): Promise<IBlogContent | null>;
  updateBlogContentSettings(data: Partial<InsertBlogContent>): Promise<IBlogContent>;

  // Site Settings
  getSiteSettings(): Promise<ISiteSettings | null>;
  updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<ISiteSettings>;
  createSiteSettings(data: InsertSiteSettings): Promise<ISiteSettings>;

  // Hero Content
  getHeroContent(): Promise<IHeroContent[]>;
  getHeroContentById(id: string): Promise<IHeroContent | null>;
  createHeroContent(data: InsertHeroContent): Promise<IHeroContent>;
  updateHeroContent(id: string, data: Partial<InsertHeroContent>): Promise<IHeroContent | null>;
  deleteHeroContent(id: string): Promise<boolean>;

  // Social Links
  getSocialLinks(): Promise<ISocialLink[]>;
  getSocialLink(id: string): Promise<ISocialLink | null>;
  createSocialLink(data: InsertSocialLink): Promise<ISocialLink>;
  updateSocialLink(id: string, data: Partial<InsertSocialLink>): Promise<ISocialLink | null>;
  deleteSocialLink(id: string): Promise<boolean>;

  // Testimonials
  getTestimonials(): Promise<ITestimonial[]>;
  getTestimonial(id: string): Promise<ITestimonial | null>;
  createTestimonial(data: InsertTestimonial): Promise<ITestimonial>;
  updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<ITestimonial | null>;
  deleteTestimonial(id: string): Promise<boolean>;

  // Services
  getServices(): Promise<IService[]>;
  getService(id: string): Promise<IService | null>;
  createService(data: InsertService): Promise<IService>;
  updateService(id: string, data: Partial<InsertService>): Promise<IService | null>;
  deleteService(id: string): Promise<boolean>;

  // Admin Sessions
  createAdminSession(sessionData: any): Promise<IAdminSession>;
  getAdminSession(sessionId: string): Promise<IAdminSession | null>;
  updateAdminSession(sessionId: string, data: any): Promise<IAdminSession | null>;
  deleteAdminSession(sessionId: string): Promise<boolean>;
  cleanupExpiredSessions(): Promise<void>;

  // Footer Content
  getFooterContent(): Promise<IFooterContent | null>;
  createFooterContent(data: InsertFooterContent): Promise<IFooterContent>;
  updateFooterContent(data: Partial<InsertFooterContent>): Promise<IFooterContent | null>;

  // Contact Content
  getContactContent(): Promise<IContactContent[]>;
  getContactContentById(id: string): Promise<IContactContent | null>;
  createContactContent(data: InsertContactContent): Promise<IContactContent>;
  updateContactContent(id: string, data: Partial<InsertContactContent>): Promise<IContactContent | null>;
  deleteContactContent(id: string): Promise<boolean>;
  clearContactContent(): Promise<boolean>;

  // Certifications Content
  getCertificationsContent(): Promise<ICertificationsContent | null>;
  createCertificationsContent(data: InsertCertificationsContent): Promise<ICertificationsContent>;
  updateCertificationsContent(id: string, data: Partial<InsertCertificationsContent>): Promise<ICertificationsContent | null>;

  // Projects Content
  getProjectsContent(): Promise<IProjectsContent | null>;
  createProjectsContent(data: InsertProjectsContent): Promise<IProjectsContent>;
  updateProjectsContent(id: string, data: Partial<InsertProjectsContent>): Promise<IProjectsContent | null>;

  // Experience Content
  getExperienceContent(): Promise<IExperienceContent | null>;
  createExperienceContent(data: InsertExperienceContent): Promise<IExperienceContent>;
  updateExperienceContent(id: string, data: Partial<InsertExperienceContent>): Promise<IExperienceContent | null>;
}

export class MongoStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(data: InsertUser): Promise<IUser> {
    const user = new User(data);
    return await user.save();
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  // Contact Messages
  async createContactMessage(data: InsertContactMessage): Promise<IContactMessage> {
    const message = new ContactMessage({
      ...data,
      status: data.status || 'unread',
      priority: data.priority || 'medium',
      isRead: false,
      tags: data.tags || []
    });
    return await message.save();
  }

  async getContactMessages(): Promise<IContactMessage[]> {
    return await ContactMessage.find().sort({ createdAt: -1 });
  }

  async getContactMessage(id: string): Promise<IContactMessage | null> {
    return await ContactMessage.findById(id);
  }

  async updateContactMessage(id: string, data: Partial<IContactMessage>): Promise<IContactMessage | null> {
    const updateData: any = { ...data, updatedAt: new Date() };
    
    // Auto-set readAt if marking as read
    if (data.isRead === true && !updateData.readAt) {
      updateData.readAt = new Date();
    }
    
    // Auto-set repliedAt if marking as replied
    if (data.status === 'replied' && !updateData.repliedAt) {
      updateData.repliedAt = new Date();
    }
    
    return await ContactMessage.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    const result = await ContactMessage.findByIdAndDelete(id);
    return !!result;
  }

  // Additional message management methods
  async markMessageAsRead(id: string): Promise<IContactMessage | null> {
    return await ContactMessage.findByIdAndUpdate(
      id, 
      { 
        isRead: true, 
        readAt: new Date(),
        status: 'read',
        updatedAt: new Date()
      }, 
      { new: true }
    );
  }

  async markMessageAsReplied(id: string): Promise<IContactMessage | null> {
    return await ContactMessage.findByIdAndUpdate(
      id, 
      { 
        status: 'replied', 
        repliedAt: new Date(),
        isRead: true,
        updatedAt: new Date()
      }, 
      { new: true }
    );
  }

  async archiveMessage(id: string): Promise<IContactMessage | null> {
    return await ContactMessage.findByIdAndUpdate(
      id, 
      { 
        status: 'archived',
        updatedAt: new Date()
      }, 
      { new: true }
    );
  }

  async getMessagesByStatus(status: string): Promise<IContactMessage[]> {
    return await ContactMessage.find({ status }).sort({ createdAt: -1 });
  }

  async getUnreadMessages(): Promise<IContactMessage[]> {
    return await ContactMessage.find({ isRead: false }).sort({ createdAt: -1 });
  }

  async getMessagesByPriority(priority: string): Promise<IContactMessage[]> {
    return await ContactMessage.find({ priority }).sort({ createdAt: -1 });
  }

  // About Content
  async getAboutContent(): Promise<IAboutContent[]> {
    return await AboutContent.find().sort({ createdAt: -1 });
  }

  async getAboutContentById(id: string): Promise<IAboutContent | null> {
    return await AboutContent.findById(id);
  }

  async createAboutContent(data: any): Promise<IAboutContent> {
    const content = new AboutContent(data);
    return await content.save();
  }

  async updateAboutContent(id: string, data: any): Promise<IAboutContent | null> {
    return await AboutContent.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async deleteAboutContent(id: string): Promise<boolean> {
    const result = await AboutContent.findByIdAndDelete(id);
    return !!result;
  }

  async clearAboutContent(): Promise<boolean> {
    const result = await AboutContent.deleteMany({});
    return !!result;
  }

  // Skill Categories
  async getSkillCategories(): Promise<ISkillCategory[]> {
    return await SkillCategory.find().sort({ displayOrder: 1 });
  }

  async getActiveSkillCategories(): Promise<ISkillCategory[]> {
    return await SkillCategory.find({ isActive: true }).sort({ displayOrder: 1 });
  }

  async getSkillCategory(id: string): Promise<ISkillCategory | null> {
    return await SkillCategory.findById(id);
  }

  async createSkillCategory(data: InsertSkillCategory): Promise<ISkillCategory> {
    const category = new SkillCategory(data);
    return await category.save();
  }

  async updateSkillCategory(id: string, data: Partial<InsertSkillCategory>): Promise<ISkillCategory | null> {
    return await SkillCategory.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async deleteSkillCategory(id: string): Promise<boolean> {
    const result = await SkillCategory.findByIdAndDelete(id);
    return !!result;
  }

  // Skills
  async getSkills(): Promise<ISkill[]> {
    return await Skill.find().sort({ displayOrder: 1 });
  }

  async getActiveSkills(): Promise<ISkill[]> {
    return await Skill.find({ isActive: true }).sort({ displayOrder: 1 });
  }

  async getSkillsByCategory(categoryId: string): Promise<ISkill[]> {
    return await Skill.find({ categoryId }).sort({ displayOrder: 1 });
  }

  async getActiveSkillsByCategory(categoryId: string): Promise<ISkill[]> {
    return await Skill.find({ categoryId, isActive: true }).sort({ displayOrder: 1 });
  }

  async getSkill(id: string): Promise<ISkill | null> {
    return await Skill.findById(id);
  }

  async createSkill(data: InsertSkill): Promise<ISkill> {
    const skill = new Skill(data);
    return await skill.save();
  }

  async updateSkill(id: string, data: Partial<InsertSkill>): Promise<ISkill | null> {
    return await Skill.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async deleteSkill(id: string): Promise<boolean> {
    const result = await Skill.findByIdAndDelete(id);
    return !!result;
  }

  // Education
  async getEducation(): Promise<IEducationItem[]> {
    return await EducationItem.find().sort({ displayOrder: 1 });
  }

  async getEducationItem(id: string): Promise<IEducationItem | null> {
    return await EducationItem.findById(id);
  }

  async createEducationItem(data: InsertEducationItem): Promise<IEducationItem> {
    const item = new EducationItem(data);
    return await item.save();
  }

  async updateEducationItem(id: string, data: Partial<InsertEducationItem>): Promise<IEducationItem | null> {
    return await EducationItem.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteEducationItem(id: string): Promise<boolean> {
    const result = await EducationItem.findByIdAndDelete(id);
    return !!result;
  }

  // Education Content (section text management)
  async getEducationContent(): Promise<IEducationContent | null> {
    let content = await EducationContent.findOne();
    if (!content) {
      // Create default content if none exists
      content = new EducationContent({
        sectionTitle: "Education",
        sectionSubtitle: "Academic Background",
        sectionDescription: "My academic journey and qualifications that have shaped my professional development.",
        bottomDescription: "My education has provided me with a strong foundation in computer science, engineering principles, and problem-solving methodologies that I apply to my work every day.",
        certificationsLinkText: "View My Professional Certifications",
        certificationsLinkUrl: "#certifications"
      });
      await content.save();
    }
    return content;
  }

  async createEducationContent(data: InsertEducationContent): Promise<IEducationContent> {
    const content = new EducationContent(data);
    return await content.save();
  }

  async updateEducationContent(id: string, data: Partial<InsertEducationContent>): Promise<IEducationContent | null> {
    return await EducationContent.findByIdAndUpdate(id, data, { new: true });
  }

  // Experience
  async getExperience(): Promise<IExperienceItem[]> {
    return await ExperienceItem.find().sort({ displayOrder: 1 });
  }

  async getActiveExperience(): Promise<IExperienceItem[]> {
    return await ExperienceItem.find({ isActive: true }).sort({ displayOrder: 1 });
  }

  async getExperienceItem(id: string): Promise<IExperienceItem | null> {
    return await ExperienceItem.findById(id);
  }

  async createExperienceItem(data: InsertExperienceItem): Promise<IExperienceItem> {
    const item = new ExperienceItem(data);
    return await item.save();
  }

  async updateExperienceItem(id: string, data: Partial<InsertExperienceItem>): Promise<IExperienceItem | null> {
    return await ExperienceItem.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteExperienceItem(id: string): Promise<boolean> {
    const result = await ExperienceItem.findByIdAndDelete(id);
    return !!result;
  }

  async clearExperienceData(): Promise<boolean> {
    try {
      await ExperienceItem.deleteMany({});
      return true;
    } catch (error) {
      console.error('Error clearing experience data:', error);
      return false;
    }
  }

  // Projects
  async getProjects(): Promise<IProject[]> {
    const projects = await Project.find().sort({ displayOrder: 1 });
    
    // Transform corrupted technology data to proper string arrays and ensure isActive field
    return projects.map(project => {
      const projectObj = project.toObject();
      
      // Ensure isActive field exists with default value
      if (projectObj.isActive === undefined || projectObj.isActive === null) {
        projectObj.isActive = true;
        // Update the database record asynchronously
        Project.findByIdAndUpdate(projectObj._id, { isActive: true }).catch(console.error);
      }
      
      if (projectObj.technologies && Array.isArray(projectObj.technologies)) {
        projectObj.technologies = projectObj.technologies.map((tech: any) => {
          // Check if it's a corrupted object with indexed character properties
          if (typeof tech === 'object' && tech !== null && !tech.name) {
            // Reconstruct the string from indexed characters
            const keys = Object.keys(tech).filter(key => !isNaN(parseInt(key))).sort((a, b) => parseInt(a) - parseInt(b));
            if (keys.length > 0) {
              return keys.map(key => tech[key]).join('');
            }
          }
          // Return as-is if it's already a proper string or object
          return typeof tech === 'string' ? tech : (tech.name || tech);
        });
      }
      
      return projectObj;
    });
  }

  // Get only active projects for public display
  async getActiveProjects(): Promise<IProject[]> {
    try {
      // Only return projects that are explicitly active
      const projects = await Project.find({
        isActive: true
      }).sort({ displayOrder: 1 });
      
      console.log(`Found ${projects.length} active projects for public display`);
      
      // Transform corrupted technology data to proper string arrays
      return projects.map(project => {
          const projectObj = project.toObject();
          
          // Ensure isActive field is set
          if (projectObj.isActive === undefined || projectObj.isActive === null) {
            projectObj.isActive = true;
          }
          
          if (projectObj.technologies && Array.isArray(projectObj.technologies)) {
            projectObj.technologies = projectObj.technologies.map((tech: any) => {
              // Check if it's a corrupted object with indexed character properties
              if (typeof tech === 'object' && tech !== null && !tech.name) {
                // Reconstruct the string from indexed characters
                const keys = Object.keys(tech).filter(key => !isNaN(parseInt(key))).sort((a, b) => parseInt(a) - parseInt(b));
                if (keys.length > 0) {
                  return keys.map(key => tech[key]).join('');
                }
              }
              // Return as-is if it's already a proper string or object
              return typeof tech === 'string' ? tech : (tech.name || tech);
            });
          }
          
          return projectObj;
        });
    } catch (error) {
      console.error('Error in getActiveProjects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<IProject | null> {
    return await Project.findById(id);
  }

  async createProject(data: InsertProject): Promise<IProject> {
    const project = new Project(data);
    return await project.save();
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await Project.findByIdAndDelete(id);
    return !!result;
  }

  // Certifications
  async getCertifications(): Promise<ICertification[]> {
    return await Certification.find().sort({ displayOrder: 1 });
  }

  async getCertification(id: string): Promise<ICertification | null> {
    return await Certification.findById(id);
  }

  async createCertification(data: InsertCertification): Promise<ICertification> {
    const cert = new Certification(data);
    return await cert.save();
  }

  async updateCertification(id: string, data: Partial<InsertCertification>): Promise<ICertification | null> {
    return await Certification.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCertification(id: string): Promise<boolean> {
    try {
      console.log(`Storage: Attempting to delete certification with ID: ${id}`);
      
      // First check if the certification exists
      const existingCert = await Certification.findById(id);
      if (!existingCert) {
        console.log(`Storage: Certification not found with ID: ${id}`);
        return false;
      }
      
      console.log(`Storage: Found certification: ${existingCert.title}`);
      
      // Attempt deletion
      const result = await Certification.findByIdAndDelete(id);
      const success = !!result;
      
      console.log(`Storage: Deletion ${success ? 'successful' : 'failed'} for ID: ${id}`);
      return success;
    } catch (error) {
      console.error(`Storage: Error deleting certification with ID ${id}:`, error);
      throw error;
    }
  }

  // Blog Posts
  async getBlogPosts(): Promise<IBlogPost[]> {
    return await BlogPost.find().sort({ createdAt: -1 });
  }

  async getPublishedBlogPosts(): Promise<IBlogPost[]> {
    return await BlogPost.find({ 
      isPublished: true, 
      isActive: true,
      status: 'published'
    }).sort({ publishedAt: -1, displayOrder: 1 });
  }

  async getActiveBlogPosts(): Promise<IBlogPost[]> {
    return await BlogPost.find({ isActive: true }).sort({ createdAt: -1 });
  }

  async getBlogPost(id: string): Promise<IBlogPost | null> {
    return await BlogPost.findById(id);
  }

  async getBlogPostBySlug(slug: string): Promise<IBlogPost | null> {
    return await BlogPost.findOne({ slug, isPublished: true });
  }

  async createBlogPost(data: InsertBlogPost): Promise<IBlogPost> {
    const post = new BlogPost(data);
    return await post.save();
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<IBlogPost | null> {
    return await BlogPost.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await BlogPost.findByIdAndDelete(id);
    return !!result;
  }

  // Blog Content (section management)
  async getBlogContent(): Promise<IBlogContent | null> {
    return await BlogContent.findOne();
  }

  async createBlogContent(data: InsertBlogContent): Promise<IBlogContent> {
    const content = new BlogContent(data);
    return await content.save();
  }

  async updateBlogContent(id: string, data: Partial<InsertBlogContent>): Promise<IBlogContent | null> {
    return await BlogContent.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async updateBlogContentSettings(data: Partial<InsertBlogContent>): Promise<IBlogContent> {
    const existing = await BlogContent.findOne();
    if (existing) {
      return await BlogContent.findByIdAndUpdate(existing._id, { ...data, updatedAt: new Date() }, { new: true }) as IBlogContent;
    } else {
      const content = new BlogContent(data);
      return await content.save();
    }
  }

  // Site Settings
  async getSiteSettings(): Promise<ISiteSettings | null> {
    return await SiteSettings.findOne();
  }

  async updateSiteSettings(data: Partial<InsertSiteSettings>): Promise<ISiteSettings> {
    const existing = await SiteSettings.findOne();
    if (existing) {
      return await SiteSettings.findByIdAndUpdate(existing._id, { ...data, updatedAt: new Date() }, { new: true }) as ISiteSettings;
    } else {
      const settings = new SiteSettings(data);
      return await settings.save();
    }
  }

  async createSiteSettings(data: InsertSiteSettings): Promise<ISiteSettings> {
    const settings = new SiteSettings(data);
    return await settings.save();
  }

  // Hero Content
  async getHeroContent(): Promise<IHeroContent[]> {
    return await HeroContent.find().sort({ updatedAt: -1 });
  }

  async getHeroContentById(id: string): Promise<IHeroContent | null> {
    return await HeroContent.findById(id);
  }

  async createHeroContent(data: InsertHeroContent): Promise<IHeroContent> {
    const content = new HeroContent(data);
    return await content.save();
  }

  async updateHeroContent(id: string, data: Partial<InsertHeroContent>): Promise<IHeroContent | null> {
    return await HeroContent.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async deleteHeroContent(id: string): Promise<boolean> {
    const result = await HeroContent.findByIdAndDelete(id);
    return !!result;
  }

  // Social Links
  async getSocialLinks(): Promise<ISocialLink[]> {
    return await SocialLink.find().sort({ displayOrder: 1 });
  }

  async getSocialLink(id: string): Promise<ISocialLink | null> {
    return await SocialLink.findById(id);
  }

  async createSocialLink(data: InsertSocialLink): Promise<ISocialLink> {
    const link = new SocialLink(data);
    return await link.save();
  }

  async updateSocialLink(id: string, data: Partial<InsertSocialLink>): Promise<ISocialLink | null> {
    return await SocialLink.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    const result = await SocialLink.findByIdAndDelete(id);
    return !!result;
  }

  // Testimonials
  async getTestimonials(): Promise<ITestimonial[]> {
    return await Testimonial.find().sort({ displayOrder: 1 });
  }

  async getTestimonial(id: string): Promise<ITestimonial | null> {
    return await Testimonial.findById(id);
  }

  async createTestimonial(data: InsertTestimonial): Promise<ITestimonial> {
    const testimonial = new Testimonial(data);
    return await testimonial.save();
  }

  async updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<ITestimonial | null> {
    return await Testimonial.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const result = await Testimonial.findByIdAndDelete(id);
    return !!result;
  }

  // Services
  async getServices(): Promise<IService[]> {
    return await Service.find().sort({ displayOrder: 1 });
  }

  async getService(id: string): Promise<IService | null> {
    return await Service.findById(id);
  }

  async createService(data: InsertService): Promise<IService> {
    const service = new Service(data);
    return await service.save();
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<IService | null> {
    return await Service.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await Service.findByIdAndDelete(id);
    return !!result;
  }

  // Admin Sessions
  async createAdminSession(sessionData: any): Promise<IAdminSession> {
    const session = new AdminSession(sessionData);
    return await session.save();
  }

  async getAdminSession(sessionId: string): Promise<IAdminSession | null> {
    return await AdminSession.findOne({ sessionId, isActive: true });
  }

  async updateAdminSession(sessionId: string, data: any): Promise<IAdminSession | null> {
    return await AdminSession.findOneAndUpdate(
      { sessionId },
      { ...data, lastActivity: new Date() },
      { new: true }
    );
  }

  async deleteAdminSession(sessionId: string): Promise<boolean> {
    const result = await AdminSession.findOneAndUpdate(
      { sessionId },
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async cleanupExpiredSessions(): Promise<void> {
    await AdminSession.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });
  }

  // Footer Content
  async getFooterContent(): Promise<IFooterContent | null> {
    return await FooterContent.findOne();
  }

  async createFooterContent(data: InsertFooterContent): Promise<IFooterContent> {
    // Ensure only one footer content exists
    await FooterContent.deleteMany({});
    const footer = new FooterContent(data);
    return await footer.save();
  }

  async updateFooterContent(data: Partial<InsertFooterContent>): Promise<IFooterContent | null> {
    const existing = await FooterContent.findOne();
    if (existing) {
      Object.assign(existing, { ...data, updatedAt: new Date() });
      return await existing.save();
    } else {
      // Create new if none exists
      return await this.createFooterContent(data as InsertFooterContent);
    }
  }

  // Contact Content
  async getContactContent(): Promise<IContactContent[]> {
    return await ContactContent.find().sort({ displayOrder: 1, createdAt: 1 });
  }

  async getContactContentById(id: string): Promise<IContactContent | null> {
    return await ContactContent.findById(id);
  }

  async createContactContent(data: InsertContactContent): Promise<IContactContent> {
    const content = new ContactContent(data);
    return await content.save();
  }

  async updateContactContent(id: string, data: Partial<InsertContactContent>): Promise<IContactContent | null> {
    return await ContactContent.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteContactContent(id: string): Promise<boolean> {
    const result = await ContactContent.findByIdAndDelete(id);
    return !!result;
  }

  async clearContactContent(): Promise<boolean> {
    await ContactContent.deleteMany({});
    return true;
  }

  // Certifications Content methods
  async getCertificationsContent(): Promise<ICertificationsContent | null> {
    return await CertificationsContent.findOne();
  }

  async createCertificationsContent(data: InsertCertificationsContent): Promise<ICertificationsContent> {
    const content = new CertificationsContent(data);
    return await content.save();
  }

  async updateCertificationsContent(id: string, data: Partial<InsertCertificationsContent>): Promise<ICertificationsContent | null> {
    return await CertificationsContent.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  // Projects Content operations
  async getProjectsContent(): Promise<IProjectsContent | null> {
    return await ProjectsContent.findOne().sort({ createdAt: -1 });
  }

  async createProjectsContent(data: InsertProjectsContent): Promise<IProjectsContent> {
    const projectsContent = new ProjectsContent(data);
    return await projectsContent.save();
  }

  async updateProjectsContent(id: string, data: Partial<InsertProjectsContent>): Promise<IProjectsContent | null> {
    return await ProjectsContent.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  // Experience Content operations
  async getExperienceContent(): Promise<IExperienceContent | null> {
    return await ExperienceContent.findOne().sort({ createdAt: -1 });
  }

  async createExperienceContent(data: InsertExperienceContent): Promise<IExperienceContent> {
    const experienceContent = new ExperienceContent(data);
    return await experienceContent.save();
  }

  async updateExperienceContent(id: string, data: Partial<InsertExperienceContent>): Promise<IExperienceContent | null> {
    return await ExperienceContent.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }
}

export const storage = new MongoStorage();