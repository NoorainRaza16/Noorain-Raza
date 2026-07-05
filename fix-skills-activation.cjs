const { MongoClient } = require('mongodb');

async function activateOriginalSkills() {
  const client = new MongoClient('mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('test'); // Your database name appears to be 'test'
    const skillsCollection = db.collection('skills');
    
    console.log('🔄 Activating original skills...');
    
    // Define the exact skills from your original migration data
    const originalActiveSkills = [
      // Programming Languages
      "Python", "Java", "C++", "JavaScript", "HTML", "TypeScript", "Kotlin", "Shell",
      
      // Frameworks & Libraries  
      "React", "Node.js", "Express.js", "Spring Boot", "Django", "Flask", "Bootstrap", "Tailwind CSS",
      
      // Databases
      "MySQL", "PostgreSQL", "MongoDB", "Redis",
      
      // DevOps & Cloud
      "Docker", "Kubernetes", "AWS", "Jenkins", "GitHub Actions", "Terraform", "Ansible", "Nginx",
      
      // Tools & Technologies
      "Git", "Linux", "VS Code", "Postman", "Jira", "Slack"
    ];
    
    // Activate these specific skills
    const result = await skillsCollection.updateMany(
      { 
        name: { $in: originalActiveSkills }
      },
      { 
        $set: {
          isActive: true,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Activated ${result.modifiedCount} skills`);
    
    // Show results by checking active skills count
    const activeCount = await skillsCollection.countDocuments({ isActive: true });
    const totalCount = await skillsCollection.countDocuments();
    
    console.log(`📊 Skills Status: ${activeCount}/${totalCount} active`);
    
    // List activated skills for verification
    const activatedSkills = await skillsCollection.find({ isActive: true }).toArray();
    console.log('\n✅ Activated Skills:');
    activatedSkills.forEach(skill => {
      console.log(`- ${skill.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

activateOriginalSkills();