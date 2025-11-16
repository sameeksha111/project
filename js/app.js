// Pet Help Center - Main Application
const API_BASE = '/api';
let currentUser = null;

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐾 Initializing Pet Help Center...');
  const token = localStorage.getItem('token');
  if (token) {
    verifyToken();
  } else {
    showLoginPage();
  }
});

// ============ API HELPER ============
async function apiCall(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      showLoginPage();
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    showAlert(error.message, 'error');
    return null;
  }
}

// ============ AUTHENTICATION ============
async function login(email, password) {
  const response = await apiCall('/auth/login', 'POST', { email, password });
  if (response && response.token) {
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    showDashboard();
    showAlert('Logged in successfully!', 'success');
  } else {
    showAlert('Login failed. Check your credentials.', 'error');
  }
}

async function register(name, email, password) {
  const response = await apiCall('/auth/register', 'POST', { fullName: name, email, password });
  if (response && response.token) {
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    showDashboard();
    showAlert('Registered successfully!', 'success');
  } else {
    showAlert('Registration failed.', 'error');
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
  showAlert('Logged out successfully!', 'success');
}

// ============ UI - LOGIN PAGE ============
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

        <div id="alert-box" class="alert" style="display:none;"></div>

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
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ============ UI - DASHBOARD ============
function showDashboard() {
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
          <a href="#" onclick="showPage('reports')" class="nav-item">Reports</a>
          <a href="#" onclick="logout()" class="nav-item logout">Logout</a>
        </div>
      </nav>

      <div class="container">
        <div class="sidebar">
          <h3>Welcome, ${currentUser?.fullName || 'User'}!</h3>
          <p>Role: <strong>${(currentUser?.role || 'staff').toUpperCase()}</strong></p>
          <hr>
          <p style="font-size: 0.9rem; color: #666;">Quick Actions</p>
          <button class="btn btn-primary" style="width: 100%;" onclick="showPage('new-case')">📋 New Case</button>
        </div>

        <div class="main-content">
          <div id="page-content">
            <h2>Dashboard</h2>
            <div class="stats-grid" id="stats-container">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  showPage('dashboard');
}

function showPage(page) {
  const content = document.getElementById('page-content');
  if (!content) return;
  
  switch(page) {
    case 'dashboard':
      content.innerHTML = '<h2>Dashboard</h2><div class="stats-grid" id="stats-container"><p>Loading...</p></div>';
      loadDashboard();
      break;
    case 'cases':
      content.innerHTML = '<h2>Cases</h2><div id="cases-container"><p>Loading cases...</p></div>';
      loadCases();
      break;
    case 'users':
      content.innerHTML = '<h2>Users</h2><div id="users-container"><p>Loading users...</p></div>';
      loadUsers();
      break;
    case 'reports':
      content.innerHTML = '<h2>Reports</h2><div id="reports-container"><p>Loading reports...</p></div>';
      loadReports();
      break;
    case 'new-case':
      showNewCaseForm();
      break;
  }
}

// ============ PAGE LOADERS ============
async function loadDashboard() {
  const cases = await apiCall('/cases');
  let html = '<div class="stats-grid">';
  
  if (cases && cases.length > 0) {
    const open = cases.filter(c => c.status === 'open').length;
    const closed = cases.filter(c => c.status === 'closed').length;
    
    html += `
      <div class="stat-card">
        <h4>Total Cases</h4>
        <p class="stat-value">${cases.length}</p>
      </div>
      <div class="stat-card">
        <h4>Open Cases</h4>
        <p class="stat-value">${open}</p>
      </div>
      <div class="stat-card">
        <h4>Closed Cases</h4>
        <p class="stat-value">${closed}</p>
      </div>
    `;
  } else {
    html += '<p>No cases found. <a href="#" onclick="showPage(\'new-case\')">Create one</a></p>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = '<h2>Dashboard</h2>' + html;
}

async function loadCases() {
  const cases = await apiCall('/cases');
  let html = '<div style="margin: 1rem 0;"><button class="btn btn-primary" onclick="showPage(\'new-case\')">+ New Case</button></div>';
  html += '<div class="cases-container">';
  
  if (cases && cases.length > 0) {
    cases.forEach(c => {
      const statusClass = c.status === 'closed' ? 'status-closed' : 'status-open';
      const statusLabel = c.status === 'closed' ? '✓ Closed' : '🔴 Open';
      const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'admin';
      
      let actionButtons = `<button class="btn btn-small btn-info" onclick="viewCaseDetails('${c.caseId || c._id}')">View Details</button>`;
      
      if (c.status === 'open' && isStaff) {
        actionButtons = `<button class="btn btn-small btn-success" onclick="closeCase('${c.caseId || c._id}')">✓ Close</button>` + actionButtons;
      } else if (c.status === 'closed' && isStaff) {
        actionButtons = `<button class="btn btn-small btn-secondary" onclick="reopenCase('${c.caseId || c._id}')">↻ Reopen</button>` + actionButtons;
      }
      
      html += `
        <div class="case-card ${statusClass}">
          <div class="case-header">
            <h4>${c.caseId || c._id}</h4>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </div>
          <div class="case-body">
            <p><strong>Pet:</strong> ${c.petName}</p>
            <p><strong>Owner:</strong> ${c.ownerName}</p>
            <p><strong>Issue:</strong> ${c.issueType}</p>
            <p><strong>Description:</strong> ${c.description}</p>
            <p><strong>Priority:</strong> <span class="priority-badge">${c.priority}</span></p>
            <p><strong>Created:</strong> ${new Date(c.createdAt).toLocaleDateString()}</p>
            ${c.closedAt ? `<p><strong>Closed:</strong> ${new Date(c.closedAt).toLocaleDateString()}</p>` : ''}
          </div>
          <div class="case-actions">
            ${actionButtons}
          </div>
        </div>
      `;
    });
  } else {
    html += '<p>No cases found. <a href="#" onclick="showPage(\'new-case\')">Create one</a></p>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = '<h2>Cases</h2>' + html;
}

async function closeCase(caseId) {
  if (currentUser?.role !== 'staff' && currentUser?.role !== 'admin') {
    showAlert('Only staff can close cases', 'error');
    return;
  }
  
  if (!window.confirm('Are you sure you want to close this case?')) return;
  
  const result = await apiCall(`/cases/${caseId}/close`, 'PATCH', {});
  if (result) {
    showAlert('Case closed successfully!', 'success');
    loadCases();
  } else {
    showAlert('Failed to close case', 'error');
  }
}

async function reopenCase(caseId) {
  if (currentUser?.role !== 'staff' && currentUser?.role !== 'admin') {
    showAlert('Only staff can reopen cases', 'error');
    return;
  }
  
  if (!window.confirm('Are you sure you want to reopen this case?')) return;
  
  const result = await apiCall(`/cases/${caseId}/reopen`, 'PATCH', {});
  if (result) {
    showAlert('Case reopened successfully!', 'success');
    loadCases();
  } else {
    showAlert('Failed to reopen case', 'error');
  }
}

async function viewCaseDetails(caseId) {
  const caseData = await apiCall(`/cases/${caseId}`);
  if (!caseData) {
    showAlert('Failed to load case details', 'error');
    return;
  }
  
  const c = caseData.case || caseData;
  const statusLabel = c.status === 'closed' ? '✓ Closed' : '🔴 Open';
  const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'admin';
  
  let actionHtml = '';
  if (isStaff) {
    if (c.status === 'open') {
      actionHtml = `<button class="btn btn-success" onclick="closeCase('${c.caseId || c._id}')">✓ Close Case</button>`;
    } else {
      actionHtml = `<button class="btn btn-secondary" onclick="reopenCase('${c.caseId || c._id}')">🔄 Reopen Case</button>`;
    }
  } else {
    actionHtml = `<p style="color: #999; font-size: 12px;">Only staff can close cases</p>`;
  }
  
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <h2>Case Details: ${c.caseId || c._id}</h2>
    <button class="btn btn-secondary" onclick="showPage('cases')">← Back to Cases</button>
    
    <div style="max-width: 800px; margin: 2rem 0;">
      <div class="detail-card">
        <h3>Pet Information</h3>
        <p><strong>Name:</strong> ${c.petName}</p>
        <p><strong>Species:</strong> ${c.petSpecies || 'N/A'}</p>
        <p><strong>Breed:</strong> ${c.petBreed || 'N/A'}</p>
        <p><strong>Age:</strong> ${c.petAge || 'N/A'}</p>
        <p><strong>Color:</strong> ${c.petColor || 'N/A'}</p>
      </div>
      
      <div class="detail-card">
        <h3>Owner Information</h3>
        <p><strong>Name:</strong> ${c.ownerName}</p>
        <p><strong>Email:</strong> ${c.ownerEmail || 'N/A'}</p>
        <p><strong>Phone:</strong> ${c.ownerPhone || 'N/A'}</p>
        <p><strong>Address:</strong> ${c.ownerAddress || 'N/A'}</p>
      </div>
      
      <div class="detail-card">
        <h3>Case Information</h3>
        <p><strong>Status:</strong> <span class="badge">${statusLabel}</span></p>
        <p><strong>Priority:</strong> <span class="priority-badge">${c.priority}</span></p>
        <p><strong>Issue Type:</strong> ${c.issueType}</p>
        <p><strong>Description:</strong> ${c.description}</p>
        <p><strong>Location:</strong> ${c.location || 'N/A'}</p>
        <p><strong>Created:</strong> ${new Date(c.createdAt).toLocaleDateString()}</p>
        ${c.closedAt ? `<p><strong>Closed:</strong> ${new Date(c.closedAt).toLocaleDateString()}</p>` : ''}
      </div>
      
      <div class="case-actions">
        ${actionHtml}
        <button class="btn btn-danger" onclick="if(window.confirm('Delete this case?')) deleteCase('${c.caseId || c._id}')">Delete Case</button>
      </div>
    </div>
  `;
}

async function deleteCase(caseId) {
  const result = await apiCall(`/cases/${caseId}`, 'DELETE');
  if (result) {
    showAlert('Case deleted successfully!', 'success');
    showPage('cases');
  } else {
    showAlert('Failed to delete case', 'error');
  }
}

async function loadUsers() {
  const users = await apiCall('/users');
  let html = '<table class="table"><tr><th>Name</th><th>Email</th><th>Role</th></tr>';
  
  if (users && users.length > 0) {
    users.forEach(u => {
      html += `<tr><td>${u.fullName}</td><td>${u.email}</td><td>${u.role}</td></tr>`;
    });
  } else {
    html += '<tr><td colspan="3">No users found</td></tr>';
  }
  
  html += '</table>';
  document.getElementById('page-content').innerHTML = '<h2>Users</h2>' + html;
}

async function loadReports() {
  const reports = await apiCall('/reports');
  let html = '<div>';
  
  if (reports && reports.length > 0) {
    html += '<ul>';
    reports.forEach(r => {
      html += `<li><strong>${r.title || r.name}:</strong> ${r.data || r.value || r.description}</li>`;
    });
    html += '</ul>';
  } else {
    html += '<p>No reports available</p>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = '<h2>Reports</h2>' + html;
}

function showNewCaseForm() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <h2>Create New Case</h2>
    <form id="newCaseForm" style="max-width: 600px;">
      <div class="form-group">
        <label>Pet Name *</label>
        <input type="text" id="petName" required>
      </div>
      <div class="form-group">
        <label>Owner Name *</label>
        <input type="text" id="ownerName" required>
      </div>
      <div class="form-group">
        <label>Owner Email *</label>
        <input type="email" id="ownerEmail" required>
      </div>
      <div class="form-group">
        <label>Owner Phone *</label>
        <input type="tel" id="ownerPhone" required>
      </div>
      <div class="form-group">
        <label>Issue Type *</label>
        <input type="text" id="issueType" required>
      </div>
      <div class="form-group">
        <label>Description *</label>
        <textarea id="description" rows="4" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Create Case</button>
      <button type="button" class="btn btn-secondary" onclick="showPage('cases')">Cancel</button>
    </form>
  `;

  document.getElementById('newCaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const caseData = {
      petName: document.getElementById('petName').value,
      ownerName: document.getElementById('ownerName').value,
      ownerEmail: document.getElementById('ownerEmail').value,
      ownerPhone: document.getElementById('ownerPhone').value,
      issueType: document.getElementById('issueType').value,
      description: document.getElementById('description').value,
      petSpecies: 'unknown',
      petAge: 0
    };
    
    const result = await apiCall('/cases', 'POST', caseData);
    if (result) {
      showAlert('Case created successfully!', 'success');
      setTimeout(() => showPage('cases'), 1500);
    } else {
      showAlert('Failed to create case', 'error');
    }
  });
}

// ============ UTILITIES ============
function showAlert(message, type = 'info') {
  let alertBox = document.getElementById('alert-box');
  
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'alert-box';
    document.body.insertBefore(alertBox, document.body.firstChild);
  }
  
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
  
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 3000);
}

console.log('✅ Pet Help Center app.js loaded successfully');

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐾 Pet Help Center - Initializing...');
  const token = localStorage.getItem('token');
  if (token) {
    verifyToken();
  } else {
    showLoginPage();
  }
});

// ============ API HELPER ============
async function apiCall(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      showLoginPage();
      return null;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    return null;
  }
}

// ============ AUTHENTICATION ============
async function login(email, password) {
  const response = await apiCall('/auth/login', 'POST', { email, password });
  if (response && response.token) {
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    showDashboard();
  } else {
    showAlert('Login failed. Check credentials.', 'error');
  }
}

async function register(name, email, password) {
  const response = await apiCall('/auth/register', 'POST', { fullName: name, email, password });
  if (response && response.token) {
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    showDashboard();
  } else {
    showAlert('Registration failed.', 'error');
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

// ============ UI - LOGIN PAGE ============
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

        <div id="alert-box" class="alert" style="display:none;"></div>

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
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ============ UI - DASHBOARD ============
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
          <a href="#" onclick="showPage('reports')" class="nav-item">Reports</a>
          <a href="#" onclick="logout()" class="nav-item logout">Logout</a>
        </div>
      </nav>

      <div class="container">
        <div class="sidebar">
          <h3>Welcome, ${currentUser?.fullName || 'User'}!</h3>
          <p>Role: ${currentUser?.role || 'staff'}</p>
          <hr>
          <p style="font-size: 0.9rem; color: #666;">Quick Navigation</p>
          <button class="btn btn-small" onclick="showPage('new-case')">📋 New Case</button>
        </div>

        <div class="main-content">
          <div id="page-content">
            <h2>Dashboard</h2>
            <div class="stats-grid" id="stats-container">
              <div class="stat-card">
                <h4>Loading...</h4>
                <p class="stat-value">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  loadDashboard();
}

function showPage(page) {
  const content = document.getElementById('page-content');
  
  switch(page) {
    case 'dashboard':
      content.innerHTML = '<h2>Dashboard</h2><div class="stats-grid" id="stats-container"><p>Loading...</p></div>';
      loadDashboard();
      break;
    case 'cases':
      content.innerHTML = '<h2>Cases</h2><div id="cases-container"><p>Loading cases...</p></div>';
      loadCases();
      break;
    case 'users':
      content.innerHTML = '<h2>Users</h2><div id="users-container"><p>Loading users...</p></div>';
      loadUsers();
      break;
    case 'reports':
      content.innerHTML = '<h2>Reports</h2><div id="reports-container"><p>Loading reports...</p></div>';
      loadReports();
      break;
    case 'new-case':
      showNewCaseForm();
      break;
  }
}

// ============ PAGE LOADERS ============
async function loadDashboard() {
  const cases = await apiCall('/cases');
  let html = '<div class="stats-grid">';
  
  if (cases && cases.length > 0) {
    const open = cases.filter(c => c.status === 'open').length;
    const closed = cases.filter(c => c.status === 'closed').length;
    
    html += `
      <div class="stat-card">
        <h4>Total Cases</h4>
        <p class="stat-value">${cases.length}</p>
      </div>
      <div class="stat-card">
        <h4>Open Cases</h4>
        <p class="stat-value">${open}</p>
      </div>
      <div class="stat-card">
        <h4>Closed Cases</h4>
        <p class="stat-value">${closed}</p>
      </div>
    `;
  } else {
    html += '<p>No cases found. <a href="#" onclick="showPage(\'new-case\')">Create one</a></p>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = '<h2>Dashboard</h2>' + html;
}

async function loadCases() {
  const cases = await apiCall('/cases');
  let html = '<div style="margin: 1rem 0;"><button class="btn btn-primary" onclick="showPage(\'new-case\')">+ New Case</button></div>';
  html += '<div class="cases-container">';
  
  if (cases && cases.length > 0) {
    cases.forEach(c => {
      const statusClass = c.status === 'closed' ? 'status-closed' : 'status-open';
      const statusLabel = c.status === 'closed' ? '✓ Closed' : '🔴 Open';
      const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'admin';
      
      // Close button only for staff
      let closeButtonHtml = '';
      if (c.status === 'open' && isStaff) {
        closeButtonHtml = `<button class="btn btn-small btn-success" onclick="closeCase('${c.caseId || c._id}')">✓ Close</button>`;
      } else if (c.status === 'closed' && isStaff) {
        closeButtonHtml = `<button class="btn btn-small btn-secondary" onclick="reopenCase('${c.caseId || c._id}')">↻ Reopen</button>`;
      }
      
      html += `
        <div class="case-card ${statusClass}">
          <div class="case-header">
            <h4>${c.caseId || c._id}</h4>
            <span class="status-badge ${statusClass}">${statusLabel}</span>
          </div>
          <div class="case-body">
            <p><strong>Pet:</strong> ${c.petName}</p>
            <p><strong>Owner:</strong> ${c.ownerName}</p>
            <p><strong>Issue:</strong> ${c.issueType}</p>
            <p><strong>Description:</strong> ${c.description}</p>
            <p><strong>Priority:</strong> <span class="priority-badge">${c.priority}</span></p>
            <p><strong>Created:</strong> ${new Date(c.createdAt).toLocaleDateString()}</p>
            ${c.closedAt ? `<p><strong>Closed:</strong> ${new Date(c.closedAt).toLocaleDateString()}</p>` : ''}
          </div>
          <div class="case-actions">
            ${closeButtonHtml}
            <button class="btn btn-small btn-info" onclick="viewCaseDetails('${c.caseId || c._id}')">View Details</button>
          </div>
        </div>
      `;
    });
  } else {
    html += '<p>No cases found. <a href="#" onclick="showPage(\'new-case\')">Create one</a></p>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = '<h2>Cases</h2>' + html;
}

async function closeCase(caseId) {
  // Check if user is staff
  if (currentUser?.role !== 'staff' && currentUser?.role !== 'admin') {
    showAlert('Only staff can close cases', 'error');
    return;
  }
  
  const confirm = window.confirm('Are you sure you want to close this case?');
  if (!confirm) return;
  
  const result = await apiCall(`/cases/${caseId}/close`, 'PATCH', {});
  if (result) {
    showAlert('Case closed successfully!', 'success');
    loadCases();
  } else {
    showAlert('Failed to close case', 'error');
  }
}

async function reopenCase(caseId) {
  // Check if user is staff
  if (currentUser?.role !== 'staff' && currentUser?.role !== 'admin') {
    showAlert('Only staff can reopen cases', 'error');
    return;
  }
  
  const confirm = window.confirm('Are you sure you want to reopen this case?');
  if (!confirm) return;
  
  const result = await apiCall(`/cases/${caseId}/reopen`, 'PATCH', {});
  if (result) {
    showAlert('Case reopened successfully!', 'success');
    loadCases();
  } else {
    showAlert('Failed to reopen case', 'error');
  }
}

async function viewCaseDetails(caseId) {
  const caseData = await apiCall(`/cases/${caseId}`);
  if (!caseData) {
    showAlert('Failed to load case details', 'error');
    return;
  }
  
  const c = caseData.case || caseData;
  const statusLabel = c.status === 'closed' ? '✓ Closed' : '🔴 Open';
  
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <h2>Case Details: ${c.caseId || c._id}</h2>
    <button class="btn btn-secondary" onclick="showPage('cases')">← Back to Cases</button>
    
    <div style="max-width: 800px; margin: 2rem 0;">
      <div class="detail-card">
        <h3>Pet Information</h3>
        <p><strong>Name:</strong> ${c.petName}</p>
        <p><strong>Species:</strong> ${c.petSpecies}</p>
        <p><strong>Breed:</strong> ${c.petBreed}</p>
        <p><strong>Age:</strong> ${c.petAge || 'N/A'}</p>
        <p><strong>Color:</strong> ${c.petColor || 'N/A'}</p>
      </div>
      
      <div class="detail-card">
        <h3>Owner Information</h3>
        <p><strong>Name:</strong> ${c.ownerName}</p>
        <p><strong>Email:</strong> ${c.ownerEmail}</p>
        <p><strong>Phone:</strong> ${c.ownerPhone}</p>
        <p><strong>Address:</strong> ${c.ownerAddress || 'N/A'}</p>
      </div>
      
      <div class="detail-card">
        <h3>Case Information</h3>
        <p><strong>Status:</strong> <span class="badge">${statusLabel}</span></p>
        <p><strong>Priority:</strong> <span class="priority-badge">${c.priority}</span></p>
        <p><strong>Issue Type:</strong> ${c.issueType}</p>
        <p><strong>Description:</strong> ${c.description}</p>
        <p><strong>Location:</strong> ${c.location || 'N/A'}</p>
        <p><strong>Created:</strong> ${new Date(c.createdAt).toLocaleDateString()}</p>
        ${c.closedAt ? `<p><strong>Closed:</strong> ${new Date(c.closedAt).toLocaleDateString()}</p>` : ''}
      </div>
      
      <div class="case-actions">
        ${(currentUser?.role === 'staff' || currentUser?.role === 'admin') ? (
          c.status === 'open' ? 
            `<button class="btn btn-success" onclick="closeCase('${c.caseId || c._id}')">✓ Close Case</button>` :
            `<button class="btn btn-secondary" onclick="reopenCase('${c.caseId || c._id}')">🔄 Reopen Case</button>`
        ) : '<p style="color: #999; font-size: 12px;">Only staff can close cases</p>'}
        <button class="btn btn-danger" onclick="if(confirm('Delete this case?')) deleteCase('${c.caseId || c._id}')">Delete Case</button>
      </div>
    </div>
  `;
}

async function deleteCase(caseId) {
  const result = await apiCall(`/cases/${caseId}`, 'DELETE');
  if (result) {
    showAlert('Case deleted successfully!', 'success');
    showPage('cases');
  } else {
    showAlert('Failed to delete case', 'error');
  }
}

async function loadUsers() {
  const users = await apiCall('/users');
  let html = '<table class="table"><tr><th>Name</th><th>Email</th><th>Role</th></tr>';
  
  if (users && users.length > 0) {
    users.forEach(u => {
      html += `<tr><td>${u.fullName}</td><td>${u.email}</td><td>${u.role}</td></tr>`;
    });
  } else {
    html += '<tr><td colspan="3">No users found</td></tr>';
  }
  
  html += '</table>';
  document.getElementById('page-content').innerHTML = '<h2>Users</h2>' + html;
}

async function loadReports() {
  const reports = await apiCall('/reports');
  let html = '<div>';
  
  if (reports && reports.length > 0) {
    html += '<ul>';
    reports.forEach(r => {
      html += `<li>${r.title}: ${r.data}</li>`;
    });
    html += '</ul>';
  } else {
    html += '<p>No reports available</p>';
  }
  
  html += '</div>';
  document.getElementById('page-content').innerHTML = '<h2>Reports</h2>' + html;
}

function showNewCaseForm() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <h2>Create New Case</h2>
    <form id="newCaseForm" style="max-width: 600px;">
      <div class="form-group">
        <label>Pet Name</label>
        <input type="text" id="petName" required>
      </div>
      <div class="form-group">
        <label>Owner Name</label>
        <input type="text" id="ownerName" required>
      </div>
      <div class="form-group">
        <label>Owner Email</label>
        <input type="email" id="ownerEmail" required>
      </div>
      <div class="form-group">
        <label>Owner Phone</label>
        <input type="tel" id="ownerPhone" required>
      </div>
      <div class="form-group">
        <label>Issue Type</label>
        <input type="text" id="issueType" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="description" rows="4" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Create Case</button>
    </form>
  `;

  document.getElementById('newCaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const caseData = {
      petName: document.getElementById('petName').value,
      ownerName: document.getElementById('ownerName').value,
      ownerEmail: document.getElementById('ownerEmail').value,
      ownerPhone: document.getElementById('ownerPhone').value,
      issueType: document.getElementById('issueType').value,
      description: document.getElementById('description').value,
      petSpecies: 'unknown',
      petAge: 0
    };
    
    const result = await apiCall('/cases', 'POST', caseData);
    if (result) {
      showAlert('Case created successfully!', 'success');
      setTimeout(() => showPage('cases'), 1500);
    } else {
      showAlert('Failed to create case', 'error');
    }
  });
}

// ============ UTILITIES ============
function showAlert(message, type = 'info') {
  const alertBox = document.getElementById('alert-box');
  if (alertBox) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 3000);
  }
}

console.log('✅ App.js loaded successfully');
