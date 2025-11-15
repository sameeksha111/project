const Case = require('../models/Case');

const detectDuplicates = async ({ ownerPhone, petName, ownerAddress }) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check for same phone number within 30 days
    const phoneMatch = await Case.find({
      ownerPhone,
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false
    }).lean();

    // Check for same pet name (case-insensitive)
    const petMatch = await Case.find({
      petName: { $regex: new RegExp(petName, 'i') },
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false
    }).lean();

    // Combine and remove duplicates
    const duplicates = [...new Set([...phoneMatch, ...petMatch])];
    
    return duplicates;
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return [];
  }
};

module.exports = { detectDuplicates };
