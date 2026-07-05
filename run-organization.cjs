const mongoose = require('mongoose');

// Connect using the same connection string from the server
mongoose.connect('mongodb+srv://nraz7786s:cHJQ64qZbIIlnKqr@cluster0.e86xg.mongodb.net/portfolio?retryWrites=true&w=majority');

// Define schemas matching the existing models
const skillCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const skillSchema = new mongoose.Schema({
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String },
  proficiency: { type: Number, default: 0 },
  years: { type: String },
  experience: { type: String },
  description: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SkillCategory = mongoose.model('SkillCategory', skillCategorySchema);
const Skill = mongoose.model('Skill', skillSchema);

async function organizeSkills() {
  try {
    console.log('Starting skills organization...');
    
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
        skills: ["MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "DynamoDB", "Cassandra", "Elasticsearch"]
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
        skills: ["Linux", "Windows", "macOS", "Ubuntu", "Shell Scripting", "Bash"]
      }
    };

    // Create/update categories
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
        console.log(`Created category: ${categoryName}`);
      }
      
      categoryMap.set(categoryName, category._id.toString());
    }

    // Set ALL skills to inactive first
    const allSkillsResult = await Skill.updateMany({}, { isActive: false });
    console.log(`Set ${allSkillsResult.modifiedCount} skills to inactive`);

    // Organize skills
    let skillsProcessed = 0;
    let skillsCreated = 0;

    for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
      const categoryId = categoryMap.get(categoryName);
      let order = 1;
      
      for (const skillName of categoryData.skills) {
        let skill = await Skill.findOne({ 
          name: { $regex: new RegExp(`^${skillName}$`, 'i') } 
        });
        
        if (skill) {
          await Skill.updateOne(
            { _id: skill._id },
            { 
              categoryId: categoryId,
              displayOrder: order,
              isActive: false
            }
          );
          skillsProcessed++;
        } else {
          skill = new Skill({
            name: skillName,
            categoryId: categoryId,
            displayOrder: order,
            isActive: false,
            proficiency: 70
          });
          await skill.save();
          skillsCreated++;
        }
        order++;
      }
    }

    console.log(`\nOrganization Complete:`);
    console.log(`- Categories created: ${categoriesCreated}`);
    console.log(`- Skills processed: ${skillsProcessed}`);
    console.log(`- Skills created: ${skillsCreated}`);
    console.log(`- All skills are now INACTIVE by default`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

organizeSkills();