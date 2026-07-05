const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function organizeAllSkills() {
  try {
    console.log('🔧 Starting comprehensive skills organization...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI?.replace(/"/g, '');
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define the schemas directly here to avoid import issues
    const skillCategorySchema = new mongoose.Schema({
      name: { type: String, required: true },
      icon: { type: String },
      displayOrder: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    const skillSchema = new mongoose.Schema({
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

    const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);
    const Skill = mongoose.model('Skill', skillSchema);

    // Define comprehensive skill categorizations with icons
    const skillCategorizations = {
      "Programming Languages": {
        icon: "💻",
        displayOrder: 1,
        skills: [
          "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", 
          "Swift", "Kotlin", "HTML", "CSS", "Scala", "R", "MATLAB", "C", "Dart", "Solidity"
        ]
      },
      "Frameworks & Libraries": {
        icon: "🔧",
        displayOrder: 2,
        skills: [
          "React", "Vue.js", "Angular", "Django", "Flask", "Laravel", "Ruby on Rails", "NestJS", 
          "Svelte", "Expo", "Next.js", "Express.js", "Node.js", "Spring Boot", "FastAPI", 
          "jQuery", "Bootstrap", "Material-UI", "Tailwind CSS", "Framer Motion", "Three.js", "Socket.io"
        ]
      },
      "DevOps & Cloud": {
        icon: "☁️",
        displayOrder: 3,
        skills: [
          "Docker", "Kubernetes", "AWS", "Google Cloud", "AWS EC2", "AWS S3", "Terraform", 
          "Jenkins", "GitHub Actions", "Nginx", "Azure", "CI/CD", "Ansible", "Puppet", 
          "Chef", "Vagrant", "Vercel", "Netlify", "Heroku"
        ]
      },
      "Databases": {
        icon: "🗄️",
        displayOrder: 4,
        skills: [
          "MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "DynamoDB", "Cassandra", 
          "Elasticsearch", "Neo4j", "Oracle", "SQL Server", "Firebase Firestore"
        ]
      },
      "Tools & Platforms": {
        icon: "🛠️",
        displayOrder: 5,
        skills: [
          "Git", "GitHub", "Streamlit", "Webpack", "Capacitor", "Prisma", "Drizzle ORM", 
          "Vite", "Postman", "VS Code", "IntelliJ IDEA", "Slack", "Jira", "Trello", "Notion", "Linear"
        ]
      },
      "Design & UI/UX": {
        icon: "🎨",
        displayOrder: 6,
        skills: [
          "Adobe Photoshop", "Adobe Illustrator", "Sketch", "Design Systems", "Responsive Design", 
          "SASS/SCSS", "Figma", "Adobe XD", "Canva", "UI/UX Design", "Wireframing", 
          "Prototyping", "Technostyle Design"
        ]
      },
      "Data Science & ML": {
        icon: "📊",
        displayOrder: 7,
        skills: [
          "Pandas", "NumPy", "scikit-learn", "PyTorch", "Data Visualization", "OpenAI API", 
          "TensorFlow", "Jupyter", "Matplotlib", "Seaborn", "Plotly", "Keras", "Apache Spark", 
          "Tableau", "Power BI", "Machine Learning", "Deep Learning"
        ]
      },
      "Web Technologies": {
        icon: "🌐",
        displayOrder: 8,
        skills: [
          "REST API", "GraphQL", "WebSocket", "API Development", "Microservices", "Serverless", 
          "OAuth", "JWT", "SOAP", "XML", "JSON", "WebRTC", "PWA"
        ]
      },
      "Mobile Development": {
        icon: "📱",
        displayOrder: 9,
        skills: [
          "App Store Optimization", "React Native", "Flutter", "iOS Development", 
          "Android Development", "Xamarin", "Ionic", "PhoneGap", "App Store Connect", 
          "Google Play Console"
        ]
      },
      "Operating Systems": {
        icon: "🖥️",
        displayOrder: 10,
        skills: [
          "Linux", "Windows", "macOS", "Ubuntu", "CentOS", "Red Hat", "Debian", 
          "FreeBSD", "Unix", "Shell Scripting", "Bash", "PowerShell"
        ]
      }
    };

    // Create or update all categories
    const categoryMap = new Map();
    let categoriesCreated = 0;
    let categoriesUpdated = 0;

    console.log('📂 Creating/updating skill categories...');
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
      
      categoryMap.set(categoryName, category._id.toString());
    }

    // Set all skills to inactive first
    await Skill.updateMany({}, { isActive: false });
    console.log('💤 Set all existing skills to inactive');

    // Organize existing skills by category and create new ones if needed
    let updatedCount = 0;
    let newSkillsCount = 0;
    const categorySummary = {};

    console.log('🎯 Organizing skills into categories...');
    for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
      const categoryId = categoryMap.get(categoryName);
      let skillsInCategory = 0;
      let displayOrder = 1;
      
      for (const skillName of categoryData.skills) {
        // Use proper regex escaping for special characters like C++
        const escapedSkillName = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let skill = await Skill.findOne({ 
          name: { $regex: new RegExp(`^${escapedSkillName}$`, 'i') } 
        });
        
        if (skill) {
          // Update existing skill
          await Skill.updateOne(
            { _id: skill._id },
            { 
              categoryId: categoryId,
              displayOrder: displayOrder,
              isActive: false,
              proficiency: skill.proficiency || 70
            }
          );
          updatedCount++;
          skillsInCategory++;
        } else {
          // Create new skill
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

    console.log('\n🎉 Skills organization complete!');
    console.log('═'.repeat(50));
    console.log(`📈 Results Summary:`);
    console.log(`  • Categories created: ${categoriesCreated}`);
    console.log(`  • Categories updated: ${categoriesUpdated}`);
    console.log(`  • Skills updated: ${updatedCount}`);
    console.log(`  • New skills created: ${newSkillsCount}`);
    console.log(`  • Uncategorized skills: ${totalUncategorized}`);
    console.log(`  • Total categories: ${Object.keys(skillCategorizations).length}`);
    console.log('═'.repeat(50));
    console.log('💡 All skills are set to INACTIVE by default. You can activate them individually from the admin panel.');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    return {
      success: true,
      categoriesCreated,
      categoriesUpdated,
      updatedCount,
      newSkillsCount,
      totalUncategorized,
      categorySummary,
      totalCategories: Object.keys(skillCategorizations).length
    };
    
  } catch (error) {
    console.error('❌ Error organizing skills:', error);
    throw error;
  }
}

// Run the organization
organizeAllSkills()
  .then((result) => {
    console.log('✅ Skills organization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Skills organization failed:', error);
    process.exit(1);
  });