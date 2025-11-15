const express = require('express');
const router = express.Router();

const users = new Map([
  ['1', { _id: '1', fullName: 'Admin User', email: 'admin@phcs.com', role: 'admin', specialization: 'general' }],
  ['2', { _id: '2', fullName: 'Staff Member', email: 'staff@phcs.com', role: 'staff', specialization: 'dogs' }]
]);

router.get('/', (req, res) => {
  res.json(Array.from(users.values()));
});

router.get('/:id', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/', (req, res) => {
  const id = Date.now().toString();
  const newUser = { _id: id, ...req.body };
  users.set(id, newUser);
  res.status(201).json({ message: 'User created', user: newUser });
});

module.exports = router;
