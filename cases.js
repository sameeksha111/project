const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { detectDuplicates } = require('../utils/duplicateDetection');
const { tagPriority } = require('../utils/priorityTagger');

// Create Case
router.post('/', auth, async (req, res) => {
  try {
    const {
      ownerName, ownerPhone, ownerEmail, ownerAddress,
      petName, petSpecies, petBreed, petAge, petColor,
      issueType, description, voicemailUrl, voicemailTranscript,
      source, location
    } = req.body;

    // Validation
    if (!ownerName || !ownerPhone || !petName || !issueType || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicates
    const duplicates = await detectDuplicates({
      ownerPhone,
      petName,
      ownerAddress
    });

    if (duplicates.length > 0) {
      return res.status(400).json({
        error: 'Potential duplicate case detected',
        duplicates: duplicates.map(d => ({ _id: d._id, caseId: d.caseId, petName: d.petName }))
      });
    }

    // Auto-tag priority
    const priority = tagPriority({
      issueType,
      description,
      petAge
    });

    // Create new case
    const newCase = new Case({
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      petName,
      petSpecies,
      petBreed,
      petAge,
      petColor,
      issueType,
      description,
      voicemailUrl,
      voicemailTranscript,
      priority,
      source: source || 'manual',
      createdBy: req.user.id,
      location
    });

    await newCase.save();
    await newCase.populate('createdBy', 'fullName email');

    // Log activity
    await ActivityLog.create({
      caseId: newCase._id,
      userId: req.user.id,
      action: 'created',
      details: `Case created for ${petName}`
    });

    res.status(201).json({
      message: 'Case created successfully',
      case: newCase
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Cases
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, species, search, page = 1, limit = 10, assignedTo } = req.query;

    let filter = { isDeleted: false };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (species) filter.petSpecies = species;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (search) {
      filter.$or = [
        { petName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { ownerPhone: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const cases = await Case.find(filter)
      .populate('assignedTo', 'fullName email specialization')
      .populate('createdBy', 'fullName')
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

// Get Single Case
router.get('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('assignedTo', 'fullName email phone specialization experience')
      .populate('createdBy', 'fullName email')
      .populate('assignedBy', 'fullName email');

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(caseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Case
router.put('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const oldValues = {};
    const updatedFields = req.body;

    // Track changes
    Object.keys(updatedFields).forEach(key => {
      if (caseData[key] !== updatedFields[key]) {
        oldValues[key] = caseData[key];
      }
    });

    Object.assign(caseData, updatedFields);
    caseData.updatedAt = new Date();

    if (req.body.status === 'resolved') {
      caseData.resolvedAt = new Date();
    }

    await caseData.save();
    await caseData.populate('assignedTo', 'fullName email');

    // Log activity
    for (const field in oldValues) {
      await ActivityLog.create({
        caseId: caseData._id,
        userId: req.user.id,
        action: 'updated',
        fieldChanged: field,
        oldValue: oldValues[field],
        newValue: updatedFields[field]
      });
    }

    res.json({
      message: 'Case updated successfully',
      case: caseData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign Case
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const previousAssignee = caseData.assignedTo;
    caseData.assignedTo = assignedTo;
    caseData.assignedBy = req.user.id;
    await caseData.save();

    // Create notification
    await Notification.create({
      userId: assignedTo,
      caseId: caseData._id,
      type: 'assignment',
      title: 'New Case Assignment',
      message: `You have been assigned case ${caseData.caseId} - ${caseData.petName}`
    });

    // Log activity
    await ActivityLog.create({
      caseId: caseData._id,
      userId: req.user.id,
      action: 'assigned',
      oldValue: previousAssignee,
      newValue: assignedTo
    });

    res.json({
      message: 'Case assigned successfully',
      case: caseData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Soft Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    caseData.isDeleted = true;
    caseData.deletedAt = new Date();
    await caseData.save();

    await ActivityLog.create({
      caseId: caseData._id,
      userId: req.user.id,
      action: 'deleted'
    });

    res.json({ message: 'Case moved to trash' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore from Trash
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    caseData.isDeleted = false;
    caseData.deletedAt = null;
    await caseData.save();

    await ActivityLog.create({
      caseId: caseData._id,
      userId: req.user.id,
      action: 'restored'
    });

    res.json({ message: 'Case restored successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Assign
router.post('/bulk/assign', auth, async (req, res) => {
  try {
    const { caseIds, assignedTo } = req.body;

    const result = await Case.updateMany(
      { _id: { $in: caseIds } },
      {
        assignedTo,
        assignedBy: req.user.id,
        updatedAt: new Date()
      }
    );

    res.json({
      message: 'Cases assigned successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;