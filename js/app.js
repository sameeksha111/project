// Pet Help Center - Main Application
const API_BASE = '/api';

// Application State
let currentUser = null;
let currentPage = 'dashboard';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐾 Pet Help Center - Initializing...');
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (token) {
    verifyToken();
  } else {
    showLoginPage();
  }
});

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (response.status === 401) {
      localStorage.removeItem('token');
      showLoginPage();
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

// Authentication
async function login(email, password) {
  const response = await apiCall('/auth/login', 'POST', { email, password });
  if (response && response.token) {
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    showDashboard();
  } else {
    alert('Login failed');
  }
}

async function register(name, email, password) {
  const response = await apiCall('/auth/register', 'POST', { name, email, password });
  if (response && response.token) {
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    showDashboard();
  } else {
    alert('Registration failed');
  }
}

async function verifyToken() {
  const response = await apiCall('/auth/me');
  if (response && response.user) {
    currentUser = response.user;
    showDashboard();
  } else {
    localStorage.removeItem('token');
    showLoginPage();
  }
}

function logout() {
  localStorage.removeItem('token');
  currentUser = null;
  showLoginPage();
}

// UI Functions
function showLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h1><i class="fas fa-paw"></i> Pet Help Center</h1>
          <p>Case Management System</p>
        </div>

        <div class="tabs">
          <button class="tab-btn active" onclick="switchTab('login')">Login</button>
          <button class="tab-btn" onclick="switchTab('register')">Register</button>
        </div>

        <form id="loginForm" class="login-form" style="display: block;">
          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input type="email" id="loginEmail" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input type="password" id="loginPassword" placeholder="Enter your password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Login</button>
        </form>

        <form id="registerForm" class="register-form" style="display: none;">
          <div class="form-group">
            <label for="regName">Full Name</label>
            <input type="text" id="regName" placeholder="Enter your name" required>
          </div>
          <div class="form-group">
            <label for="regEmail">Email</label>
            <input type="email" id="regEmail" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label for="regPassword">Password</label>
            <input type="password" id="regPassword" placeholder="Enter your password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Register</button>
        </form>

        <div class="demo-credentials">
          <h3>Demo Credentials</h3>
          <p><strong>Admin:</strong> admin@phcs.com / admin123</p>
          <p><strong>Staff:</strong> staff@phcs.com / staff123</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
  });

  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    register(name, email, password);
  });
}

function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

async function showDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <div class="nav-brand">
          <i class="fas fa-paw"></i> Pet Help Center
        </div>
        <div class="nav-menu">
          <a href="#" onclick="showPage('dashboard')" class="nav-item active">Dashboard</a>
          <a href="#" onclick="showPage('cases')" class="nav-item">Cases</a>
          <a href="#" onclick="showPage('users')" class="nav-item">Users</a>
          <a href="#" onclick="logout()" class="nav-item logout">Logout</a>
        </div>
      </nav>

      <div class="container">
        <div class="sidebar">
          <h3>Welcome, ${currentUser?.name || 'User'}!</h3>
          <p>Role: ${currentUser?.role || 'staff'}</p>
        </div>

        <div class="main-content">
          <div id="page-content">
            <h2>Dashboard</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <h4>Total Cases</h4>
                <p class="stat-value">0</p>
              </div>
              <div class="stat-card">
                <h4>Open Cases</h4>
                <p class="stat-value">0</p>
              </div>
              <div class="stat-card">
                <h4>Closed Cases</h4>
                <p class="stat-value">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Load initial stats
  loadStats();
}

function showPage(page) {
  const content = document.getElementById('page-content');
  
  switch(page) {
    case 'dashboard':
      content.innerHTML = '<h2>Dashboard</h2><div class="stats-grid"><div class="stat-card"><h4>Total Cases</h4><p class="stat-value">0</p></div></div>';
      loadStats();
      break;
    case 'cases':
      content.innerHTML = '<h2>Cases</h2><p>Loading cases...</p>';
      loadCases();
      break;
    case 'users':
      content.innerHTML = '<h2>Users</h2><p>Loading users...</p>';
      loadUsers();
      break;
  }
}

async function loadStats() {
  // Load dashboard statistics
  const casesRes = await apiCall('/cases');
  // Update UI with stats
}

async function loadCases() {
  const cases = await apiCall('/cases');
  let html = '<table class="table"><tr><th>ID</th><th>Title</th><th>Status</th><th>Priority</th></tr>';
  if (cases && cases.length > 0) {
    cases.forEach(c => {
      html += `<tr><td>${c._id}</td><td>${c.title}</td><td>${c.status}</td><td>${c.priority}</td></tr>`;
    });
  }
  html += '</table>';
  document.getElementById('page-content').innerHTML = '<h2>Cases</h2>' + html;
}

async function loadUsers() {
  const users = await apiCall('/users');
  let html = '<table class="table"><tr><th>Name</th><th>Email</th><th>Role</th></tr>';
  if (users && users.length > 0) {
    users.forEach(u => {
      html += `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`;
    });
  }
  html += '</table>';
  document.getElementById('page-content').innerHTML = '<h2>Users</h2>' + html;
}

console.log('✅ App.js loaded');
