const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

console.log('📁 Serving static files from:', path.join(__dirname));

// Root route
app.get('/', (req, res) => {
  console.log('📄 GET / - Sending index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 Handler
app.use((req, res) => {
  console.log(`⚠️ 404 - ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

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
  if (err.code === 'EADDRINUSE') {
    console.log('⚠️  Port 5000 is already in use. Trying port 5001...');
    // Try next port
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});
