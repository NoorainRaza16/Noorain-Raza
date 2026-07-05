// Run this script to organize all skills by category and set them inactive
const { organizeAllSkills } = require('./organize-skills-now');

async function executeOrganization() {
  try {
    console.log('Executing skills organization...');
    const result = await organizeAllSkills();
    console.log('Organization completed successfully:', result);
    process.exit(0);
  } catch (error) {
    console.error('Organization failed:', error);
    process.exit(1);
  }
}

executeOrganization();