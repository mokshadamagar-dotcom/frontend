/* ============================================================
   KrishiMitra AI – dashboard.js
   Farmer Dashboard Logic (Mock – FastAPI ready)
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONFIGURATION
════════════════════════════════════════════════════════════ */
const DASH_CONFIG = {
  TOKEN_KEY: 'km_auth_token',
  USER_KEY: 'km_user_data',
  API_BASE: 'http://localhost:8000/api/v1',   // FastAPI base URL
  MOCK_MODE: true,
  LOGIN_REDIRECT: 'login.html',
};

/* ════════════════════════════════════════════════════════════
   1. AUTHENTICATION CHECK
   TODO: Replace mock check with FastAPI JWT validation.
════════════════════════════════════════════════════════════ */
function checkAuthentication() {
  // TODO: Replace with real JWT token validation against FastAPI /auth/verify endpoint
  const token = localStorage.getItem(DASH_CONFIG.TOKEN_KEY)
    || sessionStorage.getItem(DASH_CONFIG.TOKEN_KEY);

  if (!token) {
    // No session — redirect to login
    window.location.href = DASH_CONFIG.LOGIN_REDIRECT;
    return null;
  }

  // Get stored user profile (non-sensitive data only)
  try {
    const raw = localStorage.getItem(DASH_CONFIG.USER_KEY)
      || sessionStorage.getItem(DASH_CONFIG.USER_KEY);
    const user = raw ? JSON.parse(raw) : null;

    if (!user) {
      window.location.href = DASH_CONFIG.LOGIN_REDIRECT;
      return null;
    }

    return user;
  } catch {
    window.location.href = DASH_CONFIG.LOGIN_REDIRECT;
    return null;
  }
}

/* ════════════════════════════════════════════════════════════
   2. USER PROFILE POPULATION
════════════════════════════════════════════════════════════ */
function populateUserProfile(user) {
  if (!user) return;

  // Capitalise name helper
  const cap = (s = '') => s.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const displayName = cap(user.name || (user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'Farmer'));
  const initials = displayName.split(' ')
    .map(n => n[0]).slice(0, 2).join('').toUpperCase();

  // Topbar name
  const nameEls = document.querySelectorAll('[data-user-name]');
  nameEls.forEach(el => { el.textContent = displayName; });

  // Avatar initials
  const avatarEls = document.querySelectorAll('[data-user-initials]');
  avatarEls.forEach(el => { el.textContent = initials; });

  // Email
  const emailEls = document.querySelectorAll('[data-user-email]');
  emailEls.forEach(el => { el.textContent = user.email || 'farmer@example.com'; });

  // Role badge
  const roleLabelMap = {
    farmer: '🌾 Farmer',
    agriculture_officer: '🏛️ Agri Officer',
    student: '🎓 Student',
    researcher: '🔬 Researcher',
    other: '👤 User',
  };
  const roleEls = document.querySelectorAll('[data-user-role]');
  roleEls.forEach(el => { el.textContent = roleLabelMap[user.role] || '🌾 Farmer'; });

  // Welcome greeting
  updateGreeting(displayName);
}

/* ════════════════════════════════════════════════════════════
   3. DYNAMIC GREETING
════════════════════════════════════════════════════════════ */
function updateGreeting(name = 'Farmer') {
  const now = new Date();
  const hour = now.getHours();

  let greeting, emoji;
  if (hour < 12) { greeting = 'Good Morning'; emoji = '🌱'; }
  else if (hour < 17) { greeting = 'Good Afternoon'; emoji = '☀️'; }
  else if (hour < 20) { greeting = 'Good Evening'; emoji = '🌤️'; }
  else { greeting = 'Good Night'; emoji = '🌙'; }

  const greetEl = document.getElementById('welcome-greeting');
  if (greetEl) {
    greetEl.textContent = `${greeting}, ${name}! ${emoji}`;
  }

  // Update date display
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}

/* ════════════════════════════════════════════════════════════
   4. LOAD DASHBOARD STATS
   TODO: Replace mock data with GET /api/v1/dashboard/stats
════════════════════════════════════════════════════════════ */
function loadDashboardStats() {
  // TODO: Connect to FastAPI endpoint: GET /api/v1/dashboard/stats
  // TODO: Replace mock data with MongoDB data through API
  const mockStats = {
    crops: 4,
    analyses: 12,
    savedInsights: 8,
    alerts: 3,
  };

  const el = (id, val) => {
    const node = document.getElementById(id);
    if (node) node.textContent = String(val).padStart(2, '0');
  };

  el('stat-crops', mockStats.crops);
  el('stat-analyses', mockStats.analyses);
  el('stat-saved', mockStats.savedInsights);
  el('stat-alerts', mockStats.alerts);
}

/* ════════════════════════════════════════════════════════════
   5. LOAD WEATHER DATA
   Fetches live weather from OpenWeatherMap
════════════════════════════════════════════════════════════ */
async function loadWeather() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  try {
    // Attempt to get user's location via geolocation
    const position = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject('Geolocation not supported');
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Free OpenWeatherMap API key (demo purpose)
    const apiKey = 'bd5e378503939ddaee76f12ad7a97608';
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    if (!res.ok) throw new Error('Weather fetch failed');

    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6); // m/s to km/h
    const loc = data.name + ', ' + data.sys.country;

    // Map condition to icon and advisory
    let icon = '🌤️';
    let advisory = 'Weather looks good for general farming activities.';
    if (condition.toLowerCase().includes('rain')) {
      icon = '🌧️';
      advisory = 'Rainfall expected. Avoid pesticide spraying and delay irrigation.';
    } else if (condition.toLowerCase().includes('cloud')) {
      icon = '☁️';
      advisory = 'Cloudy weather. Good for spraying activities if wind is low.';
    } else if (condition.toLowerCase().includes('clear')) {
      icon = '☀️';
      if (temp > 35) advisory = 'High temperatures. Ensure adequate soil moisture and irrigate in the evening.';
    }

    set('weather-temp', `${temp}°C`);
    set('weather-condition', condition);
    set('weather-humidity', `${humidity}%`);
    set('weather-rain', condition.toLowerCase().includes('rain') ? '80%' : '10%');
    set('weather-wind', `${wind} km/h`);
    set('weather-location', loc);
    set('weather-icon', icon);
    set('weather-advisory', advisory);

    const wb = document.getElementById('welcome-weather-icon');
    if (wb) wb.textContent = icon;
    set('welcome-temp', `${temp}°C`);
    set('welcome-humidity', `${humidity}% Humidity`);

    // Remove demo tag since it's real data
    document.querySelectorAll('.weather-card__demo-tag').forEach(el => el.style.display = 'none');

  } catch (err) {
    console.log('Falling back to mock weather data:', err);
    // Mock Fallback
    set('weather-temp', `28°C`);
    set('weather-condition', 'Partly Cloudy');
    set('weather-humidity', `65%`);
    set('weather-rain', `40%`);
    set('weather-wind', `12 km/h`);
    set('weather-location', 'Maharashtra, India');
    set('weather-icon', '🌤️');
    set('weather-advisory', 'Moderate rainfall expected tomorrow. Consider delaying irrigation.');

    const wb = document.getElementById('welcome-weather-icon');
    if (wb) wb.textContent = '🌤️';
    set('welcome-temp', `28°C`);
    set('welcome-humidity', `65% Humidity`);
  }
}

/* ════════════════════════════════════════════════════════════
   6. LOAD RECENT ANALYSES
   TODO: Connect to FastAPI endpoint: GET /api/v1/analyses/recent
   TODO: Replace with real AI analysis history from MongoDB
════════════════════════════════════════════════════════════ */
function loadRecentAnalyses() {
  // TODO: Connect to FastAPI endpoint: GET /api/v1/analyses/recent?limit=5
  // TODO: Real data from MongoDB analyses collection
  const mockAnalyses = [
    { date: '25 Jul 2026', crop: 'Cotton', icon: '🌿', type: 'Disease Detection', result: 'Leaf Spot', confidence: 92, status: 'completed' },
    { date: '24 Jul 2026', crop: 'Tomato', icon: '🍅', type: 'Pest Detection', result: 'Aphids', confidence: 89, status: 'completed' },
    { date: '23 Jul 2026', crop: 'Wheat', icon: '🌾', type: 'Disease Detection', result: 'Healthy Crop', confidence: 95, status: 'completed' },
    { date: '22 Jul 2026', crop: 'Onion', icon: '🧅', type: 'Soil Analysis', result: 'Low Nitrogen', confidence: 88, status: 'completed' },
    { date: '21 Jul 2026', crop: 'Soybean', icon: '🫘', type: 'Pest Detection', result: 'Whitefly', confidence: 91, status: 'completed' },
  ];

  const tbody = document.getElementById('analyses-tbody');
  if (!tbody) return;

  tbody.innerHTML = mockAnalyses.map(a => `
    <tr>
      <td>${a.date}</td>
      <td>
        <div class="analysis-table__crop">
          <div class="analysis-table__crop-icon" aria-hidden="true">${a.icon}</div>
          ${a.crop}
        </div>
      </td>
      <td>${a.type}</td>
      <td><strong>${a.result}</strong></td>
      <td>
        <div class="confidence-bar">
          <div class="confidence-track" aria-hidden="true">
            <div class="confidence-fill" style="width:${a.confidence}%"></div>
          </div>
          <span class="confidence-pct">${a.confidence}%</span>
        </div>
      </td>
      <td>
        <span class="status-chip status-chip--${a.status}">
          <i class="fas fa-check-circle" aria-hidden="true"></i> Completed
        </span>
      </td>
    </tr>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   7. LOAD NOTIFICATIONS
   TODO: Connect to FastAPI endpoint: GET /api/v1/notifications
   TODO: Real-time notifications from MongoDB + AI triggers
════════════════════════════════════════════════════════════ */
function loadNotifications() {
  // TODO: Connect to FastAPI: GET /api/v1/notifications?status=unread
  // TODO: Implement WebSocket for real-time notifications later
  const mockNotifications = [
    {
      id: 'n1',
      icon: 'fa-cloud-rain',
      iconBg: '#dbeafe',
      iconColor: '#1d4ed8',
      title: '🌧️ Rain Alert',
      text: 'Heavy rainfall is expected tomorrow in your region. Consider covering sensitive crops.',
      time: '2 hrs ago',
      unread: true,
    },
    {
      id: 'n2',
      icon: 'fa-bug',
      iconBg: '#fee2e2',
      iconColor: '#b91c1c',
      title: '🐛 Disease Risk',
      text: 'High disease risk detected for cotton crops in your district this week.',
      time: '5 hrs ago',
      unread: true,
    },
    {
      id: 'n3',
      icon: 'fa-tint',
      iconBg: '#ccfbf1',
      iconColor: '#0f766e',
      title: '💧 Irrigation Reminder',
      text: 'Soil moisture levels may be low. Consider checking irrigation for wheat.',
      time: '1 day ago',
      unread: false,
    },
    {
      id: 'n4',
      icon: 'fa-landmark',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      title: '📢 Scheme Update',
      text: 'New PM Kisan scheme information is available. Check eligibility now.',
      time: '2 days ago',
      unread: false,
    },
  ];

  const container = document.getElementById('notifications-list');
  if (!container) return;

  container.innerHTML = mockNotifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-notif-id="${n.id}" role="listitem">
      <div class="notif-item__icon" style="background:${n.iconBg};" aria-hidden="true">
        <i class="fas ${n.icon}" style="color:${n.iconColor};"></i>
      </div>
      <div class="notif-item__content">
        <div class="notif-item__title">
          ${n.title}
          ${n.unread ? '<span class="notif-item__unread-dot" aria-label="Unread"></span>' : ''}
        </div>
        <p class="notif-item__text">${n.text}</p>
      </div>
      <span class="notif-item__time">${n.time}</span>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   8. LOAD CROP HEALTH
   TODO: Connect to FastAPI: GET /api/v1/crops/health
   TODO: Real crop health data from MongoDB + AI analysis
════════════════════════════════════════════════════════════ */
function loadCropHealth() {
  // TODO: Connect to FastAPI endpoint: GET /api/v1/crops/health
  // TODO: AI model will compute health score from recent analyses
  const mockCrops = [
    { name: 'Cotton', emoji: '🌿', health: 88, status: 'healthy', statusLabel: 'Healthy' },
    { name: 'Tomato', emoji: '🍅', health: 52, status: 'warning', statusLabel: 'Needs Attention' },
    { name: 'Wheat', emoji: '🌾', health: 94, status: 'healthy', statusLabel: 'Healthy' },
    { name: 'Onion', emoji: '🧅', health: 70, status: 'monitor', statusLabel: 'Monitor' },
  ];

  const container = document.getElementById('crop-health-list');
  if (!container) return;

  container.innerHTML = mockCrops.map(c => `
    <div class="crop-health-item" role="listitem">
      <div class="crop-health-item__emoji" aria-hidden="true">${c.emoji}</div>
      <div class="crop-health-item__info">
        <div class="crop-health-item__name">${c.name}</div>
        <div class="crop-health-item__bar-wrap">
          <div class="crop-health-bar" role="progressbar" aria-valuenow="${c.health}" aria-valuemin="0" aria-valuemax="100" aria-label="${c.name} health ${c.health}%">
            <div class="crop-health-bar__fill crop-health-bar__fill--${c.status}" style="width:${c.health}%"></div>
          </div>
          <span class="crop-health-bar__pct" style="color:var(--${c.status === 'healthy' ? 'green-600' : c.status === 'warning' ? 'gold' : 'blue-600'})">${c.health}%</span>
        </div>
      </div>
      <span class="crop-status-pill crop-status-pill--${c.status}" aria-label="Status: ${c.statusLabel}">
        ${c.status === 'healthy' ? '✓' : c.status === 'warning' ? '⚠' : '●'} ${c.statusLabel}
      </span>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   9. SIDEBAR LOGIC
════════════════════════════════════════════════════════════ */
function initSidebar() {
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtns = document.querySelectorAll('[data-sidebar-toggle]');

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function toggleSidebar() {
    sidebar.classList.contains('mobile-open') ? closeSidebar() : openSidebar();
  }

  toggleBtns.forEach(btn => btn.addEventListener('click', toggleSidebar));

  overlay?.addEventListener('click', closeSidebar);

  // Close on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Mark active nav item based on current page filename
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar__nav-item[href]').forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   10. PROFILE DROPDOWN
════════════════════════════════════════════════════════════ */
function initProfileDropdown() {
  const profileBtn = document.getElementById('profile-dropdown-trigger');
  if (!profileBtn) return;

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileBtn.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target)) {
      profileBtn.classList.remove('open');
    }
  });

  // Keyboard accessibility
  profileBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      profileBtn.classList.toggle('open');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   11. LOGOUT
════════════════════════════════════════════════════════════ */
function initLogout() {
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      performLogout();
    });
  });
}

function performLogout() {
  // TODO: Call FastAPI /auth/logout endpoint to invalidate JWT
  // Clear mock session (never stored real passwords)
  [localStorage, sessionStorage].forEach(s => {
    s.removeItem(DASH_CONFIG.TOKEN_KEY);
    s.removeItem(DASH_CONFIG.USER_KEY);
    s.removeItem('km_session');
  });

  showDashToast('You have been logged out successfully.', 'info');

  setTimeout(() => {
    window.location.href = DASH_CONFIG.LOGIN_REDIRECT;
  }, 1000);
}

/* ════════════════════════════════════════════════════════════
   12. LANGUAGE SELECTOR
════════════════════════════════════════════════════════════ */
function initLanguageSelector() {
  const langSelect = document.getElementById('dash-lang-select');
  if (!langSelect) return;

  // Load saved language preference
  const saved = localStorage.getItem('km_language') || 'en';
  langSelect.value = saved;

  langSelect.addEventListener('change', function () {
    const lang = this.value;
    localStorage.setItem('km_language', lang);
    // TODO: Call FastAPI to update user language preference
    // TODO: Reload page content in selected language
    const names = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };
    showDashToast(`Language changed to ${names[lang] || lang}`, 'success');
  });
}

/* ════════════════════════════════════════════════════════════
   13. TOAST NOTIFICATION (Dashboard)
════════════════════════════════════════════════════════════ */
function showDashToast(message, type = 'success', title = '', duration = 3500) {
  let container = document.getElementById('dash-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dash-toast-container';
    container.className = 'dash-toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: { icon: 'fa-check-circle', cls: 'dash-toast__icon--success' },
    error: { icon: 'fa-times-circle', cls: 'dash-toast__icon--error' },
    warning: { icon: 'fa-exclamation-triangle', cls: 'dash-toast__icon--warning' },
    info: { icon: 'fa-info-circle', cls: 'dash-toast__icon--info' },
  };

  const { icon, cls } = icons[type] || icons.info;

  const toast = document.createElement('div');
  toast.className = `dash-toast dash-toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <i class="fas ${icon} dash-toast__icon ${cls}" aria-hidden="true"></i>
    <div class="dash-toast__body">
      ${title ? `<div class="dash-toast__title">${title}</div>` : ''}
      <div class="dash-toast__msg">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

/* ════════════════════════════════════════════════════════════
   14. NOTIFICATION BELL – Slide-in Panel
════════════════════════════════════════════════════════════ */
function initNotificationBell() {
  const bell = document.getElementById('notif-bell-btn');
  bell?.addEventListener('click', () => {
    openNotifPanel();
  });
}

function openNotifPanel() {
  // Check if panel already exists
  let panel = document.getElementById('dash-notif-panel');
  if (panel) {
    panel.classList.toggle('open');
    const overlay = document.getElementById('dash-notif-overlay');
    if (overlay) overlay.classList.toggle('open');
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'dash-notif-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:298;transition:opacity .3s;';
  overlay.addEventListener('click', closeNotifPanel);
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);

  // Create panel
  panel = document.createElement('div');
  panel.id = 'dash-notif-panel';
  panel.style.cssText = [
    'position:fixed;top:0;right:0;width:380px;height:100vh;',
    'background:#0f172a;border-left:1px solid #1e293b;',
    'z-index:299;display:flex;flex-direction:column;',
    'transform:translateX(100%);transition:transform .3s ease;',
    'font-family:Inter,sans-serif;overflow:hidden;',
  ].join('');

  const NOTIFICATIONS_KEY = 'km_notifications_v2';
  const DEFAULT_NOTIFS = [
    {
      id: 'n001', icon: 'fa-cloud-rain', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa',
      title: '🌧️ Heavy Rainfall Alert',
      text: 'Heavy rainfall expected in your region tomorrow. Avoid pesticide spraying and cover sensitive crops.',
      time: '2 hrs ago', unread: true, cat: 'weather'
    },
    {
      id: 'n002', icon: 'fa-bug', iconBg: 'rgba(239,68,68,0.15)', iconColor: '#f87171',
      title: '🐛 Pest Risk – Cotton',
      text: 'High pink bollworm activity detected in cotton crops across your district this week.',
      time: '4 hrs ago', unread: true, cat: 'pest'
    },
    {
      id: 'n003', icon: 'fa-tint', iconBg: 'rgba(20,184,166,0.15)', iconColor: '#2dd4bf',
      title: '💧 Irrigation Reminder',
      text: 'Soil moisture critically low for wheat crop. Irrigation recommended within 24 hours.',
      time: '6 hrs ago', unread: true, cat: 'irrigation'
    },
    {
      id: 'n004', icon: 'fa-landmark', iconBg: 'rgba(251,191,36,0.15)', iconColor: '#fbbf24',
      title: '📢 PM-KISAN Installment',
      text: '16th installment of PM-KISAN has been released. Check your bank account.',
      time: '1 day ago', unread: false, cat: 'scheme'
    },
  ];

  let notifs;
  try { notifs = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || 'null') || DEFAULT_NOTIFS; }
  catch { notifs = DEFAULT_NOTIFS; }

  const unreadCount = notifs.filter(n => n.unread).length;

  panel.innerHTML = `
    <div style="padding:18px 20px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-weight:700;font-size:1rem;color:#f1f5f9;display:flex;align-items:center;gap:8px;">
          <i class="fas fa-bell" style="color:#22c55e;"></i> Notifications
          ${unreadCount > 0 ? `<span style="background:rgba(239,68,68,0.15);color:#f87171;font-size:0.72rem;padding:2px 8px;border-radius:50px;border:1px solid rgba(239,68,68,0.3);">${unreadCount} New</span>` : ''}
        </div>
        <div style="font-size:0.78rem;color:#64748b;margin-top:2px;">AI-powered farm alerts</div>
      </div>
      <button onclick="closeNotifPanel()" style="background:rgba(30,41,59,0.8);border:1px solid #334155;color:#94a3b8;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:14px;">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:12px;">
      ${notifs.map(n => `
        <div style="background:rgba(30,41,59,0.7);border:1px solid ${n.unread ? 'rgba(34,197,94,0.25)' : '#1e293b'};border-left:${n.unread ? '3px solid #22c55e' : '1px solid #1e293b'};border-radius:12px;padding:14px;margin-bottom:10px;display:flex;gap:12px;">
          <div style="width:42px;height:42px;border-radius:10px;background:${n.iconBg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fas ${n.icon}" style="color:${n.iconColor};"></i>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:0.88rem;color:#f1f5f9;margin-bottom:4px;">${n.title}</div>
            <div style="font-size:0.8rem;color:#94a3b8;line-height:1.5;">${n.text}</div>
            <div style="font-size:0.72rem;color:#64748b;margin-top:6px;"><i class="fas fa-clock"></i> ${n.time}</div>
          </div>
        </div>`).join('')}
    </div>
    <div style="padding:14px 20px;border-top:1px solid #1e293b;">
      <a href="notifications.html" style="display:block;text-align:center;padding:10px;border-radius:9px;background:rgba(34,197,94,0.12);color:#22c55e;border:1px solid rgba(34,197,94,0.25);text-decoration:none;font-weight:600;font-size:0.85rem;">
        View All Notifications <i class="fas fa-arrow-right"></i>
      </a>
    </div>`;

  document.body.appendChild(panel);
  setTimeout(() => {
    panel.style.transform = 'translateX(0)';
    overlay.style.opacity = '1';
  }, 10);
}

function closeNotifPanel() {
  const panel = document.getElementById('dash-notif-panel');
  const overlay = document.getElementById('dash-notif-overlay');
  if (panel) {
    panel.style.transform = 'translateX(100%)';
    setTimeout(() => panel.remove(), 320);
  }
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 320);
  }
}

/* ════════════════════════════════════════════════════════════
   15. QUICK ACTIONS (buttons that redirect)
════════════════════════════════════════════════════════════ */
function initQuickActions() {
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', function (e) {
      const target = this.dataset.goto;
      if (target) window.location.href = target;
    });
  });
}

/* ════════════════════════════════════════════════════════════
   16. DATE UPDATE
════════════════════════════════════════════════════════════ */
function updateCurrentDate() {
  const dateEl = document.getElementById('current-date');
  if (!dateEl) return;
  dateEl.textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

/* ════════════════════════════════════════════════════════════
   17. CROP HEALTH BAR ANIMATION (Intersection Observer)
════════════════════════════════════════════════════════════ */
function initHealthBars() {
  const bars = document.querySelectorAll('.crop-health-bar__fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const target = fill.dataset.width;
        if (target) fill.style.width = target;
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => {
    // Store target width, set to 0 for animation
    const currentWidth = bar.style.width;
    bar.dataset.width = currentWidth;
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

/* ════════════════════════════════════════════════════════════
   MAIN INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Step 1: Authentication ── */
  const user = checkAuthentication();
  if (!user) return; // Redirected to login

  /* ── Step 2: Populate User Data ── */
  populateUserProfile(user);

  /* ── Step 3: Load Dashboard Data ── */
  loadDashboardStats();
  loadWeather();
  loadRecentAnalyses();
  loadNotifications();
  loadCropHealth();

  /* ── Step 4: UI Interactions ── */
  initSidebar();
  initProfileDropdown();
  initLogout();
  initLanguageSelector();
  initNotificationBell();
  initQuickActions();
  updateCurrentDate();

  /* ── Step 5: Animate health bars after small delay ── */
  setTimeout(initHealthBars, 200);

  /* ── Step 6: Stat Card Modals ── */
  initStatCardModals();

  /* ── Step 7: Welcome toast ── */
  const hasShownWelcome = sessionStorage.getItem('km_welcome_shown');
  if (!hasShownWelcome) {
    setTimeout(() => {
      showDashToast(
        `Welcome back, ${(user.name || 'Farmer').split(' ')[0]}! Your AI advisor is ready.`,
        'success',
        '🌾 KrishiMitra AI'
      );
      sessionStorage.setItem('km_welcome_shown', '1');
    }, 1000);
  }
});

/* ════════════════════════════════════════════════════════════
   18. STAT CARD MODALS
════════════════════════════════════════════════════════════ */
function initStatCardModals() {
  const cards = document.querySelectorAll('.stat-card');
  cards.forEach((card, idx) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const titles = ['Active Crops', 'Total AI Analyses', 'Saved Insights', 'New Alerts'];
      const details = [
        '<div style="padding:10px 0;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:8px;"><span>Cotton</span> <span style="color:#22c55e;">Healthy</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:8px;"><span>Tomato</span> <span style="color:#f59e0b;">Needs Attention</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid #334155;padding-bottom:8px;"><span>Wheat</span> <span style="color:#22c55e;">Healthy</span></div><div style="display:flex;justify-content:space-between;"><span>Onion</span> <span style="color:#3b82f6;">Monitor</span></div></div>',
        '<div style="padding:10px 0;">You have performed 12 AI analyses this season.<br><br>• Disease Detection: 5<br>• Pest Radar: 3<br>• Fertilizer: 2<br>• Soil Analysis: 2</div>',
        '<div style="padding:10px 0;">You have 8 saved insights.<br><br>• 3 Saved Government Schemes<br>• 2 Saved Fertilizer Reports<br>• 3 Saved Disease Reports<br><br><a href="history.html" style="color:#22c55e;text-decoration:none;">View all in History →</a></div>',
      ];

      let modal = document.createElement('div');
      modal.id = 'stat-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';

      modal.innerHTML = `
        <div style="background:#1e293b;border:1px solid #334155;border-radius:16px;width:100%;max-width:400px;padding:24px;color:#f1f5f9;font-family:Inter,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="font-size:1.2rem;font-weight:700;margin:0;">${titles[idx]}</h3>
            <button onclick="this.closest('#stat-modal').remove()" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">&times;</button>
          </div>
          <div style="font-size:0.95rem;color:#cbd5e1;line-height:1.6;">
            ${details[idx]}
          </div>
        </div>
      `;

      modal.addEventListener('click', e => {
        if (e.target === modal) modal.remove();
      });

      document.body.appendChild(modal);
    });
  });
}
