const express = require('express');
const router = express.Router();

const assignments = new Map();

router.get('/', (req, res) => {
  res.json(Array.from(assignments.values()));
});

router.post('/', (req, res) => {
  const id = Date.now().toString();
  const newAssignment = { _id: id, ...req.body, createdAt: new Date() };
  assignments.set(id, newAssignment);
  res.status(201).json({ message: 'Assignment created', assignment: newAssignment });
});

module.exports = router;
