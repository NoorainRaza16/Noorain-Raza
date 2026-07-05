const mongoose = require('mongoose');

// Connect to MongoDB
async function updateBlogContentActive() {
  try {
    await mongoose.connect('mongodb+srv://nraz7786s:cHJQ64MFtNAIntGr@cluster0.awhsjn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Update existing blog content documents to include isActive field
    const result = await mongoose.connection.db.collection('blogcontents').updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    console.log(`✓ Updated ${result.modifiedCount} blog content documents with isActive field`);

    // Verify the update
    const blogContent = await mongoose.connection.db.collection('blogcontents').findOne({});
    if (blogContent) {
      console.log('Blog content status:', { 
        title: blogContent.title, 
        isActive: blogContent.isActive 
      });
    }

  } catch (error) {
    console.error('Error updating blog content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateBlogContentActive();