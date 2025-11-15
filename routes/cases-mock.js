const express = require('express');
const router = express.Router();

// ============ IN-MEMORY CASES STORE ============
const cases = new Map();
let caseCounter = 1000;

// Mock auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // For now, just accept any token
  req.user = { id: 'user1', role: 'staff' };
  next();
};

// ============ ROUTES ============

// Get all cases
router.get('/', (req, res) => {
  try {
    const allCases = Array.from(cases.values());
    res.json(allCases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single case
router.get('/:id', (req, res) => {
  try {
    const caseData = cases.get(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create case
router.post('/', auth, async (req, res) => {
  try {
    const {
      ownerName, ownerPhone, ownerEmail, ownerAddress,
      petName, petSpecies, petBreed, petAge, petColor,
      issueType, description, source, location
    } = req.body;

    // Validation
    if (!ownerName || !ownerPhone || !petName || !issueType || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create case
    const caseId = `CASE-${caseCounter++}`;
    const newCase = {
      _id: caseId,
      caseId,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      petName,
      petSpecies: petSpecies || 'unknown',
      petBreed: petBreed || 'unknown',
      petAge: petAge || 0,
      petColor,
      issueType,
      description,
      source: source || 'web',
      location,
      status: 'open',
      priority: 'medium',
      createdBy: req.user?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      assignedTo: []
    };

    cases.set(caseId, newCase);

    res.status(201).json({
      message: 'Case created successfully',
      case: newCase
    });
  } catch (error) {
    console.error('Create case error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update case
router.put('/:id', auth, async (req, res) => {
  try {
    const caseData = cases.get(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const updated = { ...caseData, ...req.body, updatedAt: new Date() };
    cases.set(req.params.id, updated);

    res.json({ message: 'Case updated', case: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete case
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!cases.has(req.params.id)) {
      return res.status(404).json({ error: 'Case not found' });
    }

    cases.delete(req.params.id);
    res.json({ message: 'Case deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
