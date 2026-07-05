const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://nraz7786s:cHJQ64Y5Jjb0PFmk@cluster0.2rqpk.mongodb.net/portfolio?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define the new about content schema
const aboutContentSchema = new mongoose.Schema({
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

const AboutContent = mongoose.model('AboutContent', aboutContentSchema);

const migrateAboutContent = async () => {
  try {
    // Clear existing about content
    await AboutContent.deleteMany({});
    console.log('Cleared existing about content');

    // Create new about content with proper structure
    const newAboutContent = [
      {
        sectionType: 'main',
        title: 'Who I Am',
        subtitle: 'About Me',
        content: 'I am a passionate software developer with expertise in full-stack development, DevOps, and problem-solving.',
        icon: '👨‍💻',
        isActive: true,
        displayOrder: 1
      },
      {
        sectionType: 'biography',
        title: 'Biography',
        subtitle: 'My Journey',
        content: 'With years of experience in software development, I have worked on various projects ranging from web applications to system architecture.',
        icon: '📖',
        isActive: true,
        displayOrder: 2
      },
      {
        sectionType: 'problem-solver',
        title: 'Problem Solver',
        subtitle: 'Analytical Thinking',
        content: 'I excel at breaking down complex problems into manageable solutions, using analytical thinking and creative approaches.',
        icon: '🔧',
        isActive: true,
        displayOrder: 3
      },
      {
        sectionType: 'continuous-learner',
        title: 'Continuous Learner',
        subtitle: 'Always Growing',
        content: 'Technology evolves rapidly, and I stay current with the latest trends, frameworks, and best practices in software development.',
        icon: '📚',
        isActive: true,
        displayOrder: 4
      },
      {
        sectionType: 'devops-specialist',
        title: 'DevOps Specialist',
        subtitle: 'Infrastructure & Automation',
        content: 'I specialize in DevOps practices, including CI/CD pipelines, cloud infrastructure, and automation tools.',
        icon: '⚙️',
        isActive: true,
        displayOrder: 5
      },
      {
        sectionType: 'aspirations',
        title: 'Aspirations',
        subtitle: 'Future Goals',
        content: 'I aspire to contribute to innovative projects that make a positive impact while continuously expanding my technical expertise.',
        icon: '🚀',
        isActive: true,
        displayOrder: 6
      }
    ];

    // Insert all new content
    for (const content of newAboutContent) {
      const aboutItem = new AboutContent(content);
      await aboutItem.save();
      console.log(`Created: ${content.title} (${content.sectionType})`);
    }

    console.log(`Migration completed successfully! Created ${newAboutContent.length} about content items.`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
const run = async () => {
  await connectDB();
  await migrateAboutContent();
};

run();