const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const auth = require('../middleware/auth');

// Generate Summary Report
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const totalCases = await Case.countDocuments({ isDeleted: false, ...dateFilter });
    const openCases = await Case.countDocuments({ status: 'open', isDeleted: false, ...dateFilter });
    const resolvedCases = await Case.countDocuments({ status: 'resolved', isDeleted: false, ...dateFilter });
    const inProgressCases = await Case.countDocuments({ status: 'in-progress', isDeleted: false, ...dateFilter });

    const speciesBreakdown = await Case.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      { $group: { _id: '$petSpecies', count: { $sum: 1 } } }
    ]);

    const priorityBreakdown = await Case.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const issueTypeBreakdown = await Case.aggregate([
      { $match: { isDeleted: false, ...dateFilter } },
      { $group: { _id: '$issueType', count: { $sum: 1 } } }
    ]);

    const unresolvedCases = await Case.find({
      status: { $ne: 'resolved' },
      isDeleted: false,
      ...dateFilter
    }).select('caseId petName ownerName priority').limit(10);

    res.json({
      summary: {
        totalCases,
        openCases,
        resolvedCases,
        inProgressCases,
        resolutionRate: totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(2) : 0
      },
      speciesBreakdown,
      priorityBreakdown,
      issueTypeBreakdown,
      unresolvedCases
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monthly Trends
router.get('/trends', auth, async (req, res) => {
  try {
    const trends = await Case.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
