const { MongoClient } = require('mongodb');

async function createComprehensiveSkills() {
  const client = new MongoClient('mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('test');
    const skillsCollection = db.collection('skills');
    const categoriesCollection = db.collection('skillcategories');
    
    console.log('🔄 Creating comprehensive skill set...');
    
    // Complete skill categorizations with proficiency levels
    const skillCategorizations = {
      "Programming Languages": {
        icon: "💻",
        displayOrder: 1,
        skills: [
          { name: "Python", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
          { name: "JavaScript", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
          { name: "TypeScript", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
          { name: "Java", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
          { name: "C++", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
          { name: "C#", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" },
          { name: "PHP", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
          { name: "Ruby", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg" },
          { name: "Go", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" },
          { name: "Rust", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg" },
          { name: "Swift", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" },
          { name: "Kotlin", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
          { name: "HTML", proficiency: 95, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
          { name: "CSS", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
          { name: "Scala", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg" },
          { name: "R", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg" },
          { name: "MATLAB", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matlab/matlab-original.svg" }
        ]
      },
      "Frameworks & Libraries": {
        icon: "🔧",
        displayOrder: 2,
        skills: [
          { name: "React", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
          { name: "Vue.js", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
          { name: "Angular", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
          { name: "Django", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
          { name: "Flask", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
          { name: "Laravel", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg" },
          { name: "Ruby on Rails", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-original-wordmark.svg" },
          { name: "NestJS", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg" },
          { name: "Svelte", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg" },
          { name: "Expo", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" },
          { name: "Next.js", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
          { name: "Express.js", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
          { name: "Node.js", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
          { name: "Spring Boot", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
          { name: "FastAPI", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
          { name: "jQuery", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg" },
          { name: "Bootstrap", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
          { name: "Material-UI", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg" }
        ]
      },
      "DevOps & Cloud": {
        icon: "☁️",
        displayOrder: 3,
        skills: [
          { name: "Docker", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
          { name: "Kubernetes", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
          { name: "AWS", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
          { name: "Google Cloud", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" },
          { name: "AWS EC2", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
          { name: "AWS S3", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
          { name: "Terraform", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg" },
          { name: "Jenkins", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg" },
          { name: "GitHub Actions", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
          { name: "Nginx", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" },
          { name: "Azure", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg" },
          { name: "CI/CD", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
          { name: "Ansible", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg" },
          { name: "Puppet", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/puppet/puppet-original.svg" },
          { name: "Chef", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chef/chef-original.svg" },
          { name: "Vagrant", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vagrant/vagrant-original.svg" }
        ]
      },
      "Databases": {
        icon: "🗄️",
        displayOrder: 4,
        skills: [
          { name: "MySQL", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
          { name: "PostgreSQL", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
          { name: "SQLite", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg" },
          { name: "Redis", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
          { name: "MongoDB", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
          { name: "DynamoDB", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
          { name: "Cassandra", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cassandra/cassandra-original.svg" },
          { name: "Elasticsearch", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg" },
          { name: "Neo4j", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/neo4j/neo4j-original.svg" },
          { name: "Oracle", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg" },
          { name: "SQL Server", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg" }
        ]
      },
      "Tools & Platforms": {
        icon: "🛠️",
        displayOrder: 5,
        skills: [
          { name: "Git", proficiency: 95, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
          { name: "GitHub", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
          { name: "Vercel", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" },
          { name: "Netlify", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg" },
          { name: "Heroku", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/heroku/heroku-original.svg" },
          { name: "Streamlit", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/streamlit/streamlit-original.svg" },
          { name: "Webpack", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg" },
          { name: "Capacitor", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg" },
          { name: "Prisma", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg" },
          { name: "Drizzle ORM", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
          { name: "Vite", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" },
          { name: "Postman", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
          { name: "VS Code", proficiency: 95, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
          { name: "IntelliJ IDEA", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg" },
          { name: "Slack", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg" },
          { name: "Jira", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg" },
          { name: "Trello", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg" }
        ]
      },
      "Design & UI/UX": {
        icon: "🎨",
        displayOrder: 6,
        skills: [
          { name: "Adobe Photoshop", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-line.svg" },
          { name: "Adobe Illustrator", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-line.svg" },
          { name: "Sketch", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg" },
          { name: "Design Systems", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
          { name: "Responsive Design", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
          { name: "SASS/SCSS", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
          { name: "Tailwind CSS", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" },
          { name: "Figma", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
          { name: "Adobe XD", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xd/xd-line.svg" },
          { name: "Canva", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg" },
          { name: "UI/UX Design", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
          { name: "Wireframing", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
          { name: "Prototyping", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" }
        ]
      },
      "Data Science & ML": {
        icon: "📊",
        displayOrder: 7,
        skills: [
          { name: "Pandas", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
          { name: "NumPy", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" },
          { name: "scikit-learn", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg" },
          { name: "PyTorch", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
          { name: "Data Visualization", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
          { name: "OpenAI API", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg" },
          { name: "TensorFlow", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
          { name: "Jupyter", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg" },
          { name: "Matplotlib", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matplotlib/matplotlib-original.svg" },
          { name: "Seaborn", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
          { name: "Plotly", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/plotly/plotly-original.svg" },
          { name: "Keras", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/keras/keras-original.svg" },
          { name: "Apache Spark", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachespark/apachespark-original.svg" },
          { name: "Tableau", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tableau/tableau-original.svg" },
          { name: "Power BI", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftpowerbi/microsoftpowerbi-original.svg" }
        ]
      },
      "Web Technologies": {
        icon: "🌐",
        displayOrder: 8,
        skills: [
          { name: "REST API", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
          { name: "GraphQL", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg" },
          { name: "WebSocket", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" },
          { name: "API Development", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg" },
          { name: "Microservices", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
          { name: "Serverless", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" },
          { name: "OAuth", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oauth/oauth-original.svg" },
          { name: "JWT", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
          { name: "SOAP", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xml/xml-original.svg" },
          { name: "XML", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xml/xml-original.svg" },
          { name: "JSON", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/json/json-original.svg" }
        ]
      },
      "Mobile Development": {
        icon: "📱",
        displayOrder: 9,
        skills: [
          { name: "App Store Optimization", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" },
          { name: "React Native", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
          { name: "Flutter", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
          { name: "iOS Development", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" },
          { name: "Android Development", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" },
          { name: "Xamarin", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xamarin/xamarin-original.svg" },
          { name: "Ionic", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg" },
          { name: "PhoneGap", proficiency: 60, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/phonegap/phonegap-original.svg" },
          { name: "App Store Connect", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" },
          { name: "Google Play Console", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" }
        ]
      },
      "Operating Systems": {
        icon: "🖥️",
        displayOrder: 10,
        skills: [
          { name: "Linux", proficiency: 90, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
          { name: "Windows", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" },
          { name: "macOS", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" },
          { name: "Ubuntu", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg" },
          { name: "CentOS", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/centos/centos-original.svg" },
          { name: "Red Hat", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redhat/redhat-original.svg" },
          { name: "Debian", proficiency: 80, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/debian/debian-original.svg" },
          { name: "FreeBSD", proficiency: 65, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/freebsd/freebsd-original.svg" },
          { name: "Unix", proficiency: 75, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unix/unix-original.svg" },
          { name: "Shell Scripting", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg" },
          { name: "Bash", proficiency: 85, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg" },
          { name: "PowerShell", proficiency: 70, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/powershell/powershell-original.svg" }
        ]
      }
    };

    // Get category mappings
    const categories = await categoriesCollection.find({}).toArray();
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.name, cat._id.toString()));

    let skillsCreated = 0;
    let skillsUpdated = 0;

    for (const [categoryName, categoryData] of Object.entries(skillCategorizations)) {
      const categoryId = categoryMap.get(categoryName);
      if (!categoryId) {
        console.log(`⚠️ Category not found: ${categoryName}`);
        continue;
      }

      console.log(`\nProcessing ${categoryName}...`);
      let displayOrder = 1;

      for (const skillData of categoryData.skills) {
        const existingSkill = await skillsCollection.findOne({ 
          name: { $regex: new RegExp(`^${skillData.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existingSkill) {
          // Update existing skill
          await skillsCollection.updateOne(
            { _id: existingSkill._id },
            { 
              $set: {
                categoryId: categoryId,
                proficiency: skillData.proficiency,
                icon: skillData.icon,
                displayOrder: displayOrder,
                isActive: true,
                updatedAt: new Date()
              }
            }
          );
          skillsUpdated++;
          console.log(`  ✓ Updated: ${skillData.name}`);
        } else {
          // Create new skill
          await skillsCollection.insertOne({
            name: skillData.name,
            categoryId: categoryId,
            proficiency: skillData.proficiency,
            icon: skillData.icon,
            years: '',
            experience: '',
            description: '',
            displayOrder: displayOrder,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          skillsCreated++;
          console.log(`  ✓ Created: ${skillData.name}`);
        }
        displayOrder++;
      }
    }

    // Final stats
    const totalActive = await skillsCollection.countDocuments({ isActive: true });
    const totalSkills = await skillsCollection.countDocuments();

    console.log('\n🎉 COMPREHENSIVE SKILLS CREATION COMPLETED');
    console.log(`Skills Created: ${skillsCreated}`);
    console.log(`Skills Updated: ${skillsUpdated}`);
    console.log(`Total Active Skills: ${totalActive}/${totalSkills}`);

    // Show breakdown by category
    console.log('\n📊 Skills by Category:');
    for (const [categoryName] of Object.entries(skillCategorizations)) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId) {
        const activeSkills = await skillsCollection.countDocuments({ 
          categoryId: categoryId, 
          isActive: true 
        });
        console.log(`${categoryName}: ${activeSkills} active skills`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createComprehensiveSkills();