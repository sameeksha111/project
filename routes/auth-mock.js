const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ============ IN-MEMORY USER STORE (For testing without MongoDB) ============
const users = new Map();

// Pre-seed demo users
async function initDemoUsers() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  users.set('admin@phcs.com', {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@phcs.com',
    password: hashedPassword,
    role: 'admin',
    specialization: 'general',
    experience: 5
  });

  const staffPassword = await bcrypt.hash('staff123', salt);
  users.set('staff@phcs.com', {
    id: '2',
    fullName: 'Staff Member',
    email: 'staff@phcs.com',
    password: staffPassword,
    role: 'staff',
    specialization: 'dogs',
    experience: 2
  });
}

// Initialize demo users
initDemoUsers();

const JWT_SECRET = process.env.JWT_SECRET || 'pet-help-center-super-secret-key-2025';

// ============ MIDDLEWARE ============
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ ROUTES ============

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, specialization, experience } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      fullName,
      email,
      password: hashedPassword,
      role: role || 'staff',
      specialization: specialization || 'general',
      experience: experience || 0
    };

    users.set(email, newUser);

    // Create token
    const token = jwt.sign(
      { id: userId, email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        fullName,
        email,
        role: newUser.role,
        specialization: newUser.specialization,
        experience: newUser.experience
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        experience: user.experience
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = users.get(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        experience: user.experience
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
