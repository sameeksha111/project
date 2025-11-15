const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

// Add Comment
router.post('/:caseId', auth, async (req, res) => {
  try {
    const { content, mentions } = req.body;
    const { caseId } = req.params;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = new Comment({
      caseId,
      authorId: req.user.id,
      content,
      mentions: mentions || []
    });

    await comment.save();
    await comment.populate('authorId', 'fullName email avatar');

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      for (const userId of mentions) {
        await Notification.create({
          userId,
          caseId,
          type: 'comment',
          title: 'You were mentioned in a comment',
          message: content.substring(0, 50) + '...'
        });
      }
    }

    // Log activity
    await ActivityLog.create({
      caseId,
      userId: req.user.id,
      action: 'commented',
      details: content.substring(0, 50)
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Comments
router.get('/:caseId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ caseId: req.params.caseId })
      .populate('authorId', 'fullName email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
