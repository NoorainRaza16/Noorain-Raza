const mongoose = require('mongoose');
require('dotenv').config();

const heroContentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  heroImage: { type: String },
  roles: [{ type: String }],
  resumeUrl: { type: String },
  resumeLabel: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const HeroContent = mongoose.model('HeroContent', heroContentSchema);

async function migrateHeroContent() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing hero content
    await HeroContent.deleteMany({});
    console.log('Cleared existing hero content');

    // Create new hero content based on current static data
    const heroData = {
      firstName: "Noorain",
      lastName: "Raza",
      title: "Computer Science Engineering Student",
      tagline: "AI & Cloud enthusiast with expertise in Python, React, and software development. Building innovative solutions for tomorrow's challenges.",
      heroImage: "/assets/profile-photo.jpg",
      roles: [
        "Computer Science & Engineering Student",
        "Cloud Engineer",
        "DevOps Engineer", 
        "Software Developer"
      ],
      resumeUrl: "/resume.pdf",
      resumeLabel: "Download Resume"
    };

    const heroContent = new HeroContent(heroData);
    await heroContent.save();

    console.log('✅ Hero content migrated successfully!');
    console.log('Hero content:', heroContent);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateHeroContent();