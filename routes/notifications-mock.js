const express = require('express');
const router = express.Router();

const notifications = new Map();

router.get('/', (req, res) => {
  res.json(Array.from(notifications.values()));
});

router.post('/', (req, res) => {
  const id = Date.now().toString();
  const newNotification = { _id: id, ...req.body, read: false, createdAt: new Date() };
  notifications.set(id, newNotification);
  res.status(201).json({ message: 'Notification created', notification: newNotification });
});

router.put('/:id/read', (req, res) => {
  const notification = notifications.get(req.params.id);
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  notifications.set(req.params.id, notification);
  res.json({ message: 'Notification marked as read' });
});

module.exports = router;
