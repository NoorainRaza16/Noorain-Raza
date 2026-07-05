import { connectToMongoDB } from './db.js';
import { SkillCategory, Skill } from '../shared/schema.js';

async function fixSkillsCategorization() {
  try {
    console.log('🔧 Fixing skills categorization...');
    
    // Connect to database
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');
    
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

    // Create categories if they don't exist
    const categoryMap = new Map();
    let displayOrder = 1;

    for (const [categoryName, skillNames] of Object.entries(skillMappings)) {
      let category = await SkillCategory.findOne({ name: categoryName });
      
      if (!category) {
        category = new SkillCategory({
          name: categoryName,
          displayOrder: displayOrder,
          isActive: true
        });
        await category.save();
        console.log(`📁 Created category: ${categoryName}`);
      }
      
      categoryMap.set(categoryName, category._id.toString());
      displayOrder++;
    }

    // Update skills with proper categories
    let updatedCount = 0;
    let totalSkills = 0;

    for (const [categoryName, skillNames] of Object.entries(skillMappings)) {
      const categoryId = categoryMap.get(categoryName);
      let skillOrder = 1;
      
      for (const skillName of skillNames) {
        const skill = await Skill.findOne({ 
          name: { $regex: new RegExp(`^${skillName}$`, 'i') } 
        });
        
        if (skill) {
          await Skill.updateOne(
            { _id: skill._id },
            { 
              categoryId: categoryId,
              displayOrder: skillOrder
            }
          );
          updatedCount++;
          console.log(`✅ ${skillName} -> ${categoryName}`);
          skillOrder++;
        }
        totalSkills++;
      }
    }

    // Count skills by category
    console.log('\n📊 Category Summary:');
    for (const [categoryName] of Object.entries(skillMappings)) {
      const categoryId = categoryMap.get(categoryName);
      const count = await Skill.countDocuments({ categoryId });
      console.log(`  ${categoryName}: ${count} skills`);
    }

    // Check uncategorized skills
    const uncategorized = await Skill.countDocuments({
      $or: [
        { categoryId: { $exists: false } },
        { categoryId: null },
        { categoryId: '' }
      ]
    });

    console.log(`\n🎉 Categorization complete!`);
    console.log(`📈 Updated ${updatedCount} skills`);
    console.log(`⚠️  ${uncategorized} uncategorized skills remaining`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

export { fixSkillsCategorization };