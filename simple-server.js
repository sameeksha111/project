const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

console.log('📁 Serving static files from:', path.join(__dirname));
console.log('🔧 Initializing routes...');

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ============ ROUTES - WITH ERROR HANDLING ============
const loadRoute = (path, name) => {
  try {
    const route = require(path);
    console.log(`✓ ${name} loaded`);
    return route;
  } catch (err) {
    console.error(`✗ Error loading ${name}:`, err.message);
    return null;
  }
};

// Load and mount routes
const auth2Route = loadRoute('./routes/auth-mock', 'auth-mock route');
const casesRoute = loadRoute('./routes/cases-mock', 'cases-mock route');
const usersRoute = loadRoute('./routes/users-mock', 'users-mock route');
const commentsRoute = loadRoute('./routes/comments-mock', 'comments-mock route');
const assignmentsRoute = loadRoute('./routes/assignments-mock', 'assignments-mock route');
const reportsRoute = loadRoute('./routes/reports-mock', 'reports-mock route');
const notificationsRoute = loadRoute('./routes/notifications-mock', 'notifications-mock route');

// Mount routes if they loaded successfully
if (auth2Route) app.use('/api/auth', auth2Route);
if (casesRoute) app.use('/api/cases', casesRoute);
if (usersRoute) app.use('/api/users', usersRoute);
if (commentsRoute) app.use('/api/comments', commentsRoute);
if (assignmentsRoute) app.use('/api/assignments', assignmentsRoute);
if (reportsRoute) app.use('/api/reports', reportsRoute);
if (notificationsRoute) app.use('/api/notifications', notificationsRoute);

console.log('🔗 Routes mounted');

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ 404 HANDLER ============
app.use((req, res) => {
  console.log(`⚠️  404 - ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message, err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
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

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err.message);
});

