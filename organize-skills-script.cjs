const mongoose = require('mongoose');
const { SkillCategory, Skill } = require('./shared/schema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nraz7786s:cHJQ64qZbIIlnKqr@cluster0.e86xg.mongodb.net/portfolio?retryWrites=true&w=majority');

async function organizeSkills() {
  try {
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
        console.log(`✓ Created category: ${categoryName}`);
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
          console.log(`✓ Updated category: ${categoryName}`);
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
      
      console.log(`\nProcessing category: ${categoryName}`);
      
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
            console.log(`  ✓ Updated and deactivated: ${skillName}`);
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
          console.log(`  ✓ Created new skill (inactive): ${skillName}`);
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
    console.log(`\nProcessing ${uncategorizedSkills.length} uncategorized skills...`);
    for (const skill of uncategorizedSkills) {
      await Skill.updateOne(
        { _id: skill._id },
        { 
          isActive: false,
          updatedAt: new Date()
        }
      );
      uncategorizedSetInactive++;
      console.log(`  ✓ Set uncategorized skill to inactive: ${skill.name}`);
    }

    // Generate final statistics
    const categorySummary = {};
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

    console.log('\n=== SKILLS ORGANIZATION COMPLETED ===');
    console.log(`Categories Created: ${categoriesCreated}`);
    console.log(`Categories Updated: ${categoriesUpdated}`);
    console.log(`Skills Updated: ${updatedCount}`);
    console.log(`New Skills Created: ${newSkillsCount}`);
    console.log(`Skills Set to Inactive: ${setInactiveCount}`);
    console.log(`Uncategorized Skills Set Inactive: ${uncategorizedSetInactive}`);
    console.log(`Total Uncategorized Remaining: ${totalUncategorized}`);
    console.log(`Total Categories: ${Object.keys(skillCategorizations).length}`);
    
    console.log('\n=== CATEGORY SUMMARY ===');
    for (const [categoryName, stats] of Object.entries(categorySummary)) {
      console.log(`${categoryName}: ${stats.total} total (${stats.active} active, ${stats.inactive} inactive)`);
    }
    
    console.log('\n✓ All skills are now INACTIVE by default. You can activate them individually from the admin panel.');

  } catch (error) {
    console.error("Error organizing skills:", error);
  } finally {
    mongoose.disconnect();
  }
}

organizeSkills();