// MongoDB direct organization script
const { MongoClient } = require('mongodb');

async function organizeSkills() {
  const client = new MongoClient('mongodb+srv://nraz7786s:cHJQ64qZbIIlnKqr@cluster0.e86xg.mongodb.net/portfolio?retryWrites=true&w=majority');
  
  try {
    await client.connect();
    const db = client.db('portfolio');
    const skillsCollection = db.collection('skills');
    const categoriesCollection = db.collection('skillcategories');

    console.log('Starting skills organization...');

    // Define skill categorizations
    const skillCategorizations = {
      "Programming Languages": {
        icon: "💻",
        displayOrder: 1,
        skills: ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "HTML", "CSS"]
      },
      "Frameworks & Libraries": {
        icon: "🔧",
        displayOrder: 2,
        skills: ["React", "Vue.js", "Angular", "Django", "Flask", "Laravel", "Ruby on Rails", "NestJS", "Svelte", "Expo", "Next.js", "Express.js", "Node.js", "Spring Boot"]
      },
      "DevOps & Cloud": {
        icon: "☁️",
        displayOrder: 3,
        skills: ["Docker", "Kubernetes", "AWS", "Google Cloud", "AWS EC2", "AWS S3", "Terraform", "Jenkins", "GitHub Actions", "Nginx", "Azure"]
      },
      "Databases": {
        icon: "🗄️",
        displayOrder: 4,
        skills: ["MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "DynamoDB", "Cassandra", "Elasticsearch", "Neo4j", "Oracle"]
      },
      "Tools & Platforms": {
        icon: "🛠️",
        displayOrder: 5,
        skills: ["Git", "GitHub", "Vercel", "Netlify", "Heroku", "Streamlit", "Webpack", "Capacitor", "Prisma", "Drizzle ORM", "Vite"]
      },
      "Design & UI/UX": {
        icon: "🎨",
        displayOrder: 6,
        skills: ["Adobe Photoshop", "Adobe Illustrator", "Sketch", "Design Systems", "Responsive Design", "SASS/SCSS", "Tailwind CSS", "Figma"]
      },
      "Data Science & ML": {
        icon: "📊",
        displayOrder: 7,
        skills: ["Pandas", "NumPy", "scikit-learn", "PyTorch", "Data Visualization", "OpenAI API", "TensorFlow", "Jupyter"]
      },
      "Web Technologies": {
        icon: "🌐",
        displayOrder: 8,
        skills: ["REST API", "GraphQL", "WebSocket", "API Development", "Microservices", "Serverless"]
      },
      "Mobile Development": {
        icon: "📱",
        displayOrder: 9,
        skills: ["App Store Optimization", "React Native", "Flutter", "iOS Development", "Android Development"]
      },
      "Operating Systems": {
        icon: "🖥️",
        displayOrder: 10,
        skills: ["Linux", "Windows", "macOS", "Ubuntu", "CentOS", "Red Hat", "Shell Scripting", "Bash"]
      }
    };

    // Create or update categories
    const categoryMap = new Map();
    let categoriesCreated = 0;
    let categoriesUpdated = 0;

    for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
      const existingCategory = await categoriesCollection.findOne({ name: categoryName });
      
      if (!existingCategory) {
        const result = await categoriesCollection.insertOne({
          name: categoryName,
          icon: categoryData.icon,
          displayOrder: categoryData.displayOrder,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        categoryMap.set(categoryName, result.insertedId.toString());
        categoriesCreated++;
        console.log(`✓ Created category: ${categoryName}`);
      } else {
        await categoriesCollection.updateOne(
          { _id: existingCategory._id },
          { 
            $set: { 
              icon: categoryData.icon,
              displayOrder: categoryData.displayOrder,
              updatedAt: new Date()
            }
          }
        );
        categoryMap.set(categoryName, existingCategory._id.toString());
        categoriesUpdated++;
        console.log(`✓ Updated category: ${categoryName}`);
      }
    }

    // Set ALL existing skills to inactive first
    const inactiveResult = await skillsCollection.updateMany({}, { 
      $set: { isActive: false, updatedAt: new Date() }
    });
    console.log(`✓ Set ${inactiveResult.modifiedCount} skills to INACTIVE`);

    // Organize skills by categories
    let skillsProcessed = 0;
    let skillsCreated = 0;

    for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
      const categoryId = categoryMap.get(categoryName);
      let displayOrder = 1;
      
      console.log(`Processing category: ${categoryName}`);
      
      for (const skillName of categoryData.skills) {
        const existingSkill = await skillsCollection.findOne({ 
          name: { $regex: new RegExp(`^${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        
        if (existingSkill) {
          // Update existing skill
          await skillsCollection.updateOne(
            { _id: existingSkill._id },
            { 
              $set: {
                categoryId: categoryId,
                displayOrder: displayOrder,
                isActive: false, // Keep inactive
                updatedAt: new Date()
              }
            }
          );
          skillsProcessed++;
          console.log(`  ✓ Organized: ${skillName} (inactive)`);
        } else {
          // Create new skill
          await skillsCollection.insertOne({
            name: skillName,
            categoryId: categoryId,
            displayOrder: displayOrder,
            isActive: false, // Default to inactive
            proficiency: 70,
            years: '',
            experience: '',
            description: '',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          skillsCreated++;
          console.log(`  ✓ Created: ${skillName} (inactive)`);
        }
        displayOrder++;
      }
    }

    // Final statistics
    const totalSkills = await skillsCollection.countDocuments();
    const activeSkills = await skillsCollection.countDocuments({ isActive: true });
    const inactiveSkills = totalSkills - activeSkills;
    const uncategorizedSkills = await skillsCollection.countDocuments({
      $or: [
        { categoryId: { $exists: false } },
        { categoryId: null },
        { categoryId: '' }
      ]
    });

    console.log('\n=== SKILLS ORGANIZATION COMPLETED ===');
    console.log(`Categories Created: ${categoriesCreated}`);
    console.log(`Categories Updated: ${categoriesUpdated}`);
    console.log(`Skills Processed: ${skillsProcessed}`);
    console.log(`Skills Created: ${skillsCreated}`);
    console.log(`Total Skills: ${totalSkills}`);
    console.log(`Active Skills: ${activeSkills}`);
    console.log(`Inactive Skills: ${inactiveSkills}`);
    console.log(`Uncategorized Skills: ${uncategorizedSkills}`);
    console.log('\n✓ ALL SKILLS ARE NOW INACTIVE BY DEFAULT');
    console.log('✓ You can activate individual skills from the admin panel');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

organizeSkills();