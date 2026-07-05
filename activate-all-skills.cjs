const { MongoClient } = require('mongodb');

async function activateAllSkills() {
  const client = new MongoClient('mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('test');
    const skillsCollection = db.collection('skills');
    const categoriesCollection = db.collection('skillcategories');
    
    console.log('🔄 Activating comprehensive skill set...');
    
    // Complete skill set from your organization files
    const comprehensiveSkills = [
      // Programming Languages (17 skills)
      "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "HTML", "CSS", "Scala", "R", "MATLAB",
      
      // Frameworks & Libraries (18 skills)
      "React", "Vue.js", "Angular", "Django", "Flask", "Laravel", "Ruby on Rails", "NestJS", "Svelte", "Expo", "Next.js", "Express.js", "Node.js", "Spring Boot", "FastAPI", "jQuery", "Bootstrap", "Material-UI",
      
      // DevOps & Cloud (16 skills)
      "Docker", "Kubernetes", "AWS", "Google Cloud", "AWS EC2", "AWS S3", "Terraform", "Jenkins", "GitHub Actions", "Nginx", "Azure", "CI/CD", "Ansible", "Puppet", "Chef", "Vagrant",
      
      // Databases (11 skills)
      "MySQL", "PostgreSQL", "SQLite", "Redis", "MongoDB", "DynamoDB", "Cassandra", "Elasticsearch", "Neo4j", "Oracle", "SQL Server",
      
      // Tools & Platforms (17 skills)
      "Git", "GitHub", "Vercel", "Netlify", "Heroku", "Streamlit", "Webpack", "Capacitor", "Prisma", "Drizzle ORM", "Vite", "Postman", "VS Code", "IntelliJ IDEA", "Slack", "Jira", "Trello",
      
      // Design & UI/UX (13 skills)
      "Adobe Photoshop", "Adobe Illustrator", "Sketch", "Design Systems", "Responsive Design", "SASS/SCSS", "Tailwind CSS", "Figma", "Adobe XD", "Canva", "UI/UX Design", "Wireframing", "Prototyping",
      
      // Data Science & ML (15 skills)
      "Pandas", "NumPy", "scikit-learn", "PyTorch", "Data Visualization", "OpenAI API", "TensorFlow", "Jupyter", "Matplotlib", "Seaborn", "Plotly", "Keras", "Apache Spark", "Tableau", "Power BI",
      
      // Web Technologies (11 skills)
      "REST API", "GraphQL", "WebSocket", "API Development", "Microservices", "Serverless", "OAuth", "JWT", "SOAP", "XML", "JSON",
      
      // Mobile Development (10 skills)
      "App Store Optimization", "React Native", "Flutter", "iOS Development", "Android Development", "Xamarin", "Ionic", "PhoneGap", "App Store Connect", "Google Play Console",
      
      // Operating Systems (12 skills)
      "Linux", "Windows", "macOS", "Ubuntu", "CentOS", "Red Hat", "Debian", "FreeBSD", "Unix", "Shell Scripting", "Bash", "PowerShell"
    ];
    
    console.log(`Total skills to activate: ${comprehensiveSkills.length}`);
    
    // Activate all these skills
    const result = await skillsCollection.updateMany(
      { 
        name: { $in: comprehensiveSkills }
      },
      { 
        $set: {
          isActive: true,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Activated ${result.modifiedCount} skills`);
    
    // Show results by category
    const categories = await categoriesCollection.find({}).toArray();
    console.log('\n📊 Skills by Category:');
    
    for (const category of categories) {
      const activeSkills = await skillsCollection.countDocuments({ 
        categoryId: category._id.toString(), 
        isActive: true 
      });
      const totalSkills = await skillsCollection.countDocuments({ 
        categoryId: category._id.toString() 
      });
      
      console.log(`${category.name}: ${activeSkills}/${totalSkills} active`);
    }
    
    // Final count
    const totalActive = await skillsCollection.countDocuments({ isActive: true });
    const totalSkills = await skillsCollection.countDocuments();
    console.log(`\n🎉 Total: ${totalActive}/${totalSkills} skills are now active`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

activateAllSkills();