const mongoose = require('mongoose');

// Connect to MongoDB and create blog content
async function createBlogContent() {
  try {
    await mongoose.connect('mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Check if blog content already exists
    const existing = await mongoose.connection.db.collection('blogcontents').findOne({});
    
    if (!existing) {
      // Create the blog content with isActive field
      const blogContent = {
        title: "Tech Blog & Articles",
        subtitle: "Insights, tutorials, and thoughts",
        description: "Welcome to my blog where I share insights about technology, development, and innovation.",
        seoTitle: "Blog - Technology Insights and Tutorials",
        seoDescription: "Explore my latest articles on DevOps, cloud technologies, AI, and software development best practices.",
        showRecentPosts: true,
        postsPerPage: 6,
        enableCategories: true,
        enableTags: true,
        enableSearch: true,
        enableComments: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await mongoose.connection.db.collection('blogcontents').insertOne(blogContent);
      console.log('✓ Blog content created successfully:', result.insertedId);
    } else {
      // Update existing to ensure it has isActive field
      const updateResult = await mongoose.connection.db.collection('blogcontents').updateOne(
        { _id: existing._id },
        { 
          $set: { 
            isActive: existing.isActive !== undefined ? existing.isActive : true,
            updatedAt: new Date() 
          } 
        }
      );
      console.log('✓ Blog content already exists and updated:', existing._id);
    }

    // Verify the result
    const blogContent = await mongoose.connection.db.collection('blogcontents').findOne({});
    console.log('Current blog content:', {
      title: blogContent.title,
      isActive: blogContent.isActive,
      id: blogContent._id
    });

  } catch (error) {
    console.error('Error creating blog content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createBlogContent();