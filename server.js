const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (serve files from project root)
app.use(express.static(path.join(__dirname)));

// ============ DATABASE CONNECTION ============
try {
  const connectDB = require('./db');
  connectDB();
} catch (err) {
  console.error('❌ Database module error:', err.message);
}

// ============ ROUTES ============
try {
  app.use('/api/auth', require('./routes/auth2'));
  app.use('/api/cases', require('./routes/cases'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/comments', require('./routes/comments'));
  app.use('/api/assignments', require('./routes/assignments'));
  app.use('/api/reports', require('./routes/reports'));
  app.use('/api/notifications', require('./routes/notifications'));
} catch (err) {
  console.error('❌ Route loading error:', err.message);
}

// ============ SERVE FRONTEND PAGES ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 ========================================
     Pet Help Center - PHCS
     🌐 Server running on port ${PORT}
     📱 Frontend: http://localhost:${PORT}
     🔧 API: http://localhost:${PORT}/api
  ========================================
  `);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});