const express = require('express');
const router = express.Router();

const comments = new Map();

router.get('/', (req, res) => {
  res.json(Array.from(comments.values()));
});

router.get('/case/:caseId', (req, res) => {
  const caseComments = Array.from(comments.values()).filter(c => c.caseId === req.params.caseId);
  res.json(caseComments);
});

router.post('/', (req, res) => {
  const id = Date.now().toString();
  const newComment = { _id: id, ...req.body, createdAt: new Date() };
  comments.set(id, newComment);
  res.status(201).json({ message: 'Comment created', comment: newComment });
});

module.exports = router;
