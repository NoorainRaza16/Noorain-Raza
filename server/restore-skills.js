import mongoose from 'mongoose';
import { SkillCategory, Skill } from '../shared/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Original skills data structure
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
      { name: "Flask", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg", proficiency: 75 },
      { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg", proficiency: 80 },
      { name: "Tailwind CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg", proficiency: 85 }
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
      { name: "GitHub Actions", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg", proficiency: 75 },
      { name: "Terraform", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg", proficiency: 65 },
      { name: "Ansible", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg", proficiency: 60 },
      { name: "Nginx", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg", proficiency: 70 }
    ]
  },
  {
    name: "Tools & Technologies",
    items: [
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg", proficiency: 90 },
      { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg", proficiency: 85 },
      { name: "VS Code", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg", proficiency: 90 },
      { name: "Postman", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg", proficiency: 85 },
      { name: "Jira", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg", proficiency: 75 },
      { name: "Slack", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg", proficiency: 80 }
    ]
  }
];

async function restoreSkillsData() {
  try {
    console.log('🔄 Starting skills data restoration...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || "mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing skills (but keep categories)
    await Skill.deleteMany({});
    console.log('🧹 Cleared existing skills data');

    let totalSkills = 0;

    for (const categoryData of skillsData) {
      // Find or create category
      let category = await SkillCategory.findOne({ name: categoryData.name });
      
      if (!category) {
        category = new SkillCategory({
          name: categoryData.name,
          displayOrder: skillsData.indexOf(categoryData) + 1,
          isActive: true
        });
        await category.save();
        console.log(`📁 Created category: ${categoryData.name}`);
      } else {
        console.log(`📁 Found existing category: ${categoryData.name}`);
      }
      
      // Create skills for this category
      let skillOrder = 0;
      for (const skillData of categoryData.items) {
        skillOrder++;
        
        const skill = new Skill({
          categoryId: category._id.toString(),
          name: skillData.name,
          icon: skillData.icon,
          proficiency: skillData.proficiency,
          years: skillData.years || undefined,
          displayOrder: skillOrder,
          isActive: true
        });
        
        await skill.save();
        totalSkills++;
      }
      
      console.log(`  ✅ Added ${categoryData.items.length} skills to ${categoryData.name}`);
    }

    console.log(`🎉 Skills restoration completed successfully!`);
    console.log(`📊 Summary: ${skillsData.length} categories, ${totalSkills} skills`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error restoring skills data:', error);
    throw error;
  }
}

// Run the restoration
restoreSkillsData().catch(console.error);