const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const reports = [
    { _id: '1', title: 'Cases by Status', data: 'Open: 5, Closed: 3' },
    { _id: '2', title: 'Cases by Priority', data: 'High: 2, Medium: 4, Low: 2' },
    { _id: '3', title: 'Cases by Specialist', data: 'Dogs: 3, Cats: 2, Wildlife: 1' }
  ];
  res.json(reports);
});

router.get('/summary', (req, res) => {
  res.json({
    totalCases: 8,
    openCases: 5,
    closedCases: 3,
    averageResolutionTime: '2.5 days'
  });
});

module.exports = router;
