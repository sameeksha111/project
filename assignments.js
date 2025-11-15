const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get My Cases (Staff)
router.get('/staff/my-cases', auth, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    let filter = {
      assignedTo: req.user.id,
      isDeleted: false
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const cases = await Case.find(filter)
      .populate('assignedTo', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Case.countDocuments(filter);

    res.json({
      cases,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Staff by Specialization
router.get('/staff/by-specialization/:species', auth, async (req, res) => {
  try {
    const staff = await User.find({
      role: 'staff',
      specialization: req.params.species,
      isActive: true
    }).select('_id fullName email specialization experience');

    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;