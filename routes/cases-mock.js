const express = require('express');
const router = express.Router();

// ============ IN-MEMORY CASES STORE ============
const cases = new Map();
let caseCounter = 1005;

// Initialize with sample cases
function initSampleCases() {
  const sampleCases = [
    {
      _id: 'CASE-1000',
      caseId: 'CASE-1000',
      ownerName: 'John Smith',
      ownerPhone: '555-0101',
      ownerEmail: 'john.smith@example.com',
      ownerAddress: '123 Main St, Springfield',
      petName: 'Max',
      petSpecies: 'Dog',
      petBreed: 'Golden Retriever',
      petAge: 3,
      petColor: 'Golden',
      issueType: 'Injury',
      description: 'Dog has a limp in front left leg',
      source: 'web',
      location: 'Springfield',
      status: 'open',
      priority: 'high',
      createdBy: 'user1',
      createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
      comments: [],
      assignedTo: []
    },
    {
      _id: 'CASE-1001',
      caseId: 'CASE-1001',
      ownerName: 'Sarah Johnson',
      ownerPhone: '555-0102',
      ownerEmail: 'sarah.j@example.com',
      ownerAddress: '456 Oak Ave, Shelbyville',
      petName: 'Luna',
      petSpecies: 'Cat',
      petBreed: 'Persian',
      petAge: 5,
      petColor: 'White',
      issueType: 'Illness',
      description: 'Cat not eating, seems lethargic',
      source: 'phone',
      location: 'Shelbyville',
      status: 'closed',
      priority: 'high',
      createdBy: 'user1',
      createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      closedAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      closedBy: 'staff1',
      comments: [],
      assignedTo: []
    },
    {
      _id: 'CASE-1002',
      caseId: 'CASE-1002',
      ownerName: 'Michael Chen',
      ownerPhone: '555-0103',
      ownerEmail: 'mchen@example.com',
      ownerAddress: '789 Pine Road, Capital City',
      petName: 'Rocky',
      petSpecies: 'Dog',
      petBreed: 'German Shepherd',
      petAge: 4,
      petColor: 'Brown',
      issueType: 'Behavioral',
      description: 'Dog is aggressive towards other dogs',
      source: 'web',
      location: 'Capital City',
      status: 'open',
      priority: 'medium',
      createdBy: 'user1',
      createdAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
      comments: [],
      assignedTo: []
    },
    {
      _id: 'CASE-1003',
      caseId: 'CASE-1003',
      ownerName: 'Emily Davis',
      ownerPhone: '555-0104',
      ownerEmail: 'emily.d@example.com',
      ownerAddress: '321 Elm Street, Metropolis',
      petName: 'Whiskers',
      petSpecies: 'Cat',
      petBreed: 'Tabby',
      petAge: 2,
      petColor: 'Orange',
      issueType: 'Injury',
      description: 'Cat has a cut on hind leg',
      source: 'phone',
      location: 'Metropolis',
      status: 'closed',
      priority: 'medium',
      createdBy: 'user1',
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
      closedAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
      closedBy: 'staff1',
      comments: [],
      assignedTo: []
    },
    {
      _id: 'CASE-1004',
      caseId: 'CASE-1004',
      ownerName: 'David Wilson',
      ownerPhone: '555-0105',
      ownerEmail: 'dwilson@example.com',
      ownerAddress: '555 Birch Lane, Gotham',
      petName: 'Buddy',
      petSpecies: 'Dog',
      petBreed: 'Labrador',
      petAge: 6,
      petColor: 'Black',
      issueType: 'Illness',
      description: 'Dog has diarrhea and vomiting',
      source: 'web',
      location: 'Gotham',
      status: 'open',
      priority: 'high',
      createdAt: new Date(new Date().getTime() - 0.5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() - 0.5 * 24 * 60 * 60 * 1000),
      createdBy: 'user1',
      comments: [],
      assignedTo: []
    }
  ];

  sampleCases.forEach(c => cases.set(c.caseId, c));
  console.log('✓ Loaded 5 sample cases');
}

// Initialize sample cases on startup
initSampleCases();

// Mock auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // For now, just accept any token and extract user info
  req.user = { id: 'user1', role: 'staff', email: 'user@example.com' };
  next();
};

// Staff-only middleware
const staffOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Check if user role is staff or admin (in real app, decode JWT to get actual role)
  // For now, we'll accept staff as default
  req.user = { id: 'user1', role: 'staff', email: 'user@example.com' };
  
  // In production, check decoded JWT role
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only staff can perform this action' });
  }
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

// Close case (mark as completed) - STAFF ONLY
router.patch('/:id/close', staffOnly, async (req, res) => {
  try {
    const caseData = cases.get(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const closedCase = {
      ...caseData,
      status: 'closed',
      closedAt: new Date(),
      closedBy: req.user?.id,
      updatedAt: new Date()
    };

    cases.set(req.params.id, closedCase);

    res.json({
      message: 'Case closed successfully',
      case: closedCase
    });
  } catch (error) {
    console.error('Close case error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Reopen case (if needed) - STAFF ONLY
router.patch('/:id/reopen', staffOnly, async (req, res) => {
  try {
    const caseData = cases.get(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const reopenedCase = {
      ...caseData,
      status: 'open',
      closedAt: null,
      closedBy: null,
      updatedAt: new Date()
    };

    cases.set(req.params.id, reopenedCase);

    res.json({
      message: 'Case reopened successfully',
      case: reopenedCase
    });
  } catch (error) {
    console.error('Reopen case error:', error.message);
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
