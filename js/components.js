/* ============================================================
   KrishiMitra AI – components.js
   Shared Component Loader, Auth Guard, Toast, Loading, Utilities
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONFIGURATION
════════════════════════════════════════════════════════════ */
const KM = {
  TOKEN_KEY:  'km_auth_token',
  USER_KEY:   'km_user_data',
  LANG_KEY:   'km_language',
  LOGIN_URL:  'login.html',

  // Page title & icon map (keyed by filename)
  PAGE_META: {
    'dashboard.html':         { title: 'Farmer Dashboard',          icon: 'fa-th-large',       section: 'main' },
    'crop-disease.html':      { title: 'Crop Disease Detection',     icon: 'fa-microscope',     section: 'ai-agri' },
    'pest-detection.html':    { title: 'Pest Radar',                 icon: 'fa-bug',            section: 'ai-agri' },
    'fertilizer.html':        { title: 'Fertilizer Recommendation',  icon: 'fa-vial',           section: 'ai-agri' },
    'irrigation.html':        { title: 'Irrigation Advisory',        icon: 'fa-tint',           section: 'ai-agri' },
    'crop-advisory.html':     { title: 'Crop Advisory',              icon: 'fa-leaf',           section: 'ai-agri' },
    'pdf-analysis.html':      { title: 'PDF Document Analysis',      icon: 'fa-file-pdf',       section: 'ai-tools' },
    'soil-analysis.html':     { title: 'Soil Health Analysis',       icon: 'fa-flask',          section: 'ai-tools' },
    'chatbot.html':           { title: 'AI Agriculture Chatbot',     icon: 'fa-comments',       section: 'ai-tools' },
    'voice-assistant.html':   { title: 'Voice Assistant',            icon: 'fa-microphone',     section: 'ai-tools' },
    'weather.html':           { title: 'Weather Advisory',           icon: 'fa-cloud-sun-rain', section: 'insights' },
    'market-price.html':      { title: 'Market Price Dashboard',     icon: 'fa-chart-line',     section: 'insights' },
    'government-schemes.html':{ title: 'Government Schemes',         icon: 'fa-landmark',       section: 'insights' },
    'crop-calendar.html':     { title: 'Crop Calendar',              icon: 'fa-calendar-alt',   section: 'insights' },
    'history.html':           { title: 'Analysis History',           icon: 'fa-history',        section: 'personal' },
    'notifications.html':     { title: 'Smart Notifications',        icon: 'fa-bell',           section: 'personal' },
    'profile.html':           { title: 'My Profile',                 icon: 'fa-user-circle',    section: 'personal' },
  },

  // Pages that require auth (redirect to login if not signed in)
  PROTECTED: [
    'dashboard.html','crop-disease.html','pest-detection.html','fertilizer.html',
    'irrigation.html','crop-advisory.html','pdf-analysis.html','soil-analysis.html',
    'chatbot.html','voice-assistant.html','weather.html','market-price.html',
    'government-schemes.html','crop-calendar.html','history.html',
    'notifications.html','profile.html',
  ],
};

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */

/** Current page filename (e.g. "dashboard.html") */
function currentPage() {
  return window.location.pathname.split('/').pop() || 'dashboard.html';
}

/** Get meta for the current page */
function pageMeta() {
  return KM.PAGE_META[currentPage()] || { title: 'KrishiMitra AI', icon: 'fa-seedling' };
}

/** Capitalise first letter of each word */
function titleCase(str = '') {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/* ════════════════════════════════════════════════════════════
   SESSION HELPERS
════════════════════════════════════════════════════════════ */
function getToken() {
  return localStorage.getItem(KM.TOKEN_KEY) || sessionStorage.getItem(KM.TOKEN_KEY);
}

function getUser() {
  try {
    const raw = localStorage.getItem(KM.USER_KEY) || sessionStorage.getItem(KM.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearSession() {
  // TODO: Call FastAPI /auth/logout to invalidate JWT on server
  [localStorage, sessionStorage].forEach(s => {
    s.removeItem(KM.TOKEN_KEY);
    s.removeItem(KM.USER_KEY);
    s.removeItem('km_session');
  });
}

function isAuthenticated() {
  return !!getToken();
}

/* ════════════════════════════════════════════════════════════
   PART L — AUTHENTICATION GUARD
   TODO: Replace mock authentication with FastAPI JWT authentication.
════════════════════════════════════════════════════════════ */
function checkAuth() {
  const page = currentPage();
  if (KM.PROTECTED.includes(page) && !isAuthenticated()) {
    window.location.href = KM.LOGIN_URL;
    return false;
  }
  return true;
}

/* ════════════════════════════════════════════════════════════
   PART H/I — COMPONENT LOADER
════════════════════════════════════════════════════════════ */

/**
 * Load an HTML file and inject it into a container element.
 * Works with VS Code Live Server (uses fetch).
 */
async function loadComponent(containerId, componentPath) {
  const container = document.getElementById(containerId);
  if (!container) return; // Container not in this page – skip silently

  try {
    const resp = await fetch(componentPath);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${componentPath}`);
    const html = await resp.text();
    container.innerHTML = html;
  } catch (err) {
    // Developer-friendly error; does not break the page
    console.warn(`[KrishiMitra] Could not load component "${componentPath}":`, err.message);
    console.info('[KrishiMitra] Tip: Use VS Code Live Server to serve the project (not file://).');
  }
}

/* ════════════════════════════════════════════════════════════
   PART B/K — ACTIVE SIDEBAR STATE (auto-detect)
════════════════════════════════════════════════════════════ */
function activateSidebarItem() {
  const page = currentPage();
  document.querySelectorAll('.sidebar__nav-item').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPage = href.split('/').pop().split('?')[0];
    if (linkPage === page) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   PART E — DYNAMIC PAGE TITLE
════════════════════════════════════════════════════════════ */
function setNavbarTitle() {
  const meta   = pageMeta();
  const titleEl = document.getElementById('topbar-page-name');
  const iconEl  = document.getElementById('topbar-page-icon');
  const bcEl    = document.getElementById('topbar-breadcrumb-page');

  if (titleEl) titleEl.textContent = meta.title;
  if (iconEl)  iconEl.className   = `fas ${meta.icon}`;
  if (bcEl)    bcEl.textContent   = meta.title;

  // Also update the browser tab title
  if (meta.title && document.title.indexOf('KrishiMitra') > -1) {
    document.title = `${meta.title} – KrishiMitra AI`;
  }
}

/* ════════════════════════════════════════════════════════════
   PART C — MOBILE SIDEBAR
════════════════════════════════════════════════════════════ */
function initSidebarToggle() {
  const sidebar  = document.getElementById('main-sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const toggles  = document.querySelectorAll('[data-sidebar-toggle]');

  if (!sidebar) return;

  const open  = () => {
    sidebar.classList.add('mobile-open');
    if (overlay) { overlay.classList.add('visible'); overlay.setAttribute('aria-hidden','false'); }
    document.body.style.overflow = 'hidden';
    sidebar.querySelector('a, button')?.focus();
  };

  const close = () => {
    sidebar.classList.remove('mobile-open');
    if (overlay) { overlay.classList.remove('visible'); overlay.setAttribute('aria-hidden','true'); }
    document.body.style.overflow = '';
  };

  toggles.forEach(btn => btn.addEventListener('click', () =>
    sidebar.classList.contains('mobile-open') ? close() : open()
  ));

  overlay?.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) close();
  });
}

/* ════════════════════════════════════════════════════════════
   PROFILE DROPDOWN
════════════════════════════════════════════════════════════ */
function initProfileDropdown() {
  const trigger = document.getElementById('profile-dropdown-trigger');
  if (!trigger) return;

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    const open = trigger.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', () => {
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  });

  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   POPULATE USER DATA IN NAVBAR/SIDEBAR
════════════════════════════════════════════════════════════ */
function populateUserUI() {
  const user = getUser();
  if (!user) return;

  const cap = s => (s || '').split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const displayName = cap(user.name) || 'Demo Farmer';
  const initials    = displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const email       = user.email || 'farmer@example.com';
  const roleMap     = {
    farmer:'🌾 Farmer', agriculture_officer:'🏛️ Agri Officer',
    student:'🎓 Student', researcher:'🔬 Researcher', other:'👤 User',
  };
  const role = roleMap[user.role] || '🌾 Farmer';

  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = displayName);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = initials);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = email);
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = role);
}

/* ════════════════════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════════════════════ */
function initLogout() {
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      clearSession();
      showToast('Logged out successfully.', 'info');
      setTimeout(() => { window.location.href = KM.LOGIN_URL; }, 900);
    });
  });
}

/* ════════════════════════════════════════════════════════════
   NOTIFICATION BELL
════════════════════════════════════════════════════════════ */
function initNotifBell() {
  document.getElementById('notif-bell-btn')
    ?.addEventListener('click', () => { window.location.href = 'notifications.html'; });
}

/* ════════════════════════════════════════════════════════════
   LANGUAGE SELECTOR  (delegates to language.js KM_Lang)
════════════════════════════════════════════════════════════ */
function initLanguageSelector() {
  // If language.js is loaded, use its full system (preferred)
  if (window.KM_Lang && typeof window.KM_Lang.initLanguageSystem === 'function') {
    window.KM_Lang.initLanguageSystem();
    return;
  }
  // Fallback: minimal local handler
  const sel = document.getElementById('dash-lang-select');
  if (!sel) return;
  sel.value = localStorage.getItem(KM.LANG_KEY) || 'en';
  sel.addEventListener('change', function () {
    localStorage.setItem(KM.LANG_KEY, this.value);
    const names = { en:'English', hi:'हिंदी', mr:'मराठी' };
    showToast(`Language changed to ${names[this.value] || this.value}`, 'success');
  });
}

/* ════════════════════════════════════════════════════════════
   PART M — GLOBAL TOAST NOTIFICATION
════════════════════════════════════════════════════════════ */
function showToast(message, type = 'success', title = '', duration = 3800) {
  let container = document.getElementById('km-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id        = 'km-toast-container';
    container.className = 'km-toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(container);
  }

  const icons  = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
  const colors = { success:'#16a34a', error:'#dc2626', warning:'#d97706', info:'#2563eb' };
  const icon   = icons[type]  || icons.info;
  const color  = colors[type] || colors.info;

  const toast = document.createElement('div');
  toast.className = `km-toast km-toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="km-toast__icon-wrap" style="background:${color}22; border:1px solid ${color}33;">
      <i class="fas ${icon}" style="color:${color};" aria-hidden="true"></i>
    </div>
    <div class="km-toast__body">
      ${title ? `<div class="km-toast__title">${title}</div>` : ''}
      <div class="km-toast__msg">${message}</div>
    </div>
    <button class="km-toast__close" aria-label="Dismiss notification">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  `;

  // Close button
  toast.querySelector('.km-toast__close').addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);
  // Trigger CSS animation
  requestAnimationFrame(() => toast.classList.add('km-toast--visible'));

  // Auto-remove
  const timer = setTimeout(() => removeToast(toast), duration);
  toast._removeTimer = timer;
}

function removeToast(toast) {
  clearTimeout(toast._removeTimer);
  toast.classList.remove('km-toast--visible');
  toast.classList.add('km-toast--leaving');
  setTimeout(() => toast?.remove(), 320);
}

// Expose globally so page-specific JS can call it
window.showToast = showToast;

/* ════════════════════════════════════════════════════════════
   PART N — GLOBAL LOADING STATE
════════════════════════════════════════════════════════════ */
function showLoading(message = 'Processing…') {
  let overlay = document.getElementById('km-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id        = 'km-loading-overlay';
    overlay.className = 'km-loading-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML = `
      <div class="km-loading-box">
        <div class="km-spinner" aria-hidden="true">
          <div class="km-spinner__ring"></div>
          <div class="km-spinner__leaf"><i class="fas fa-seedling"></i></div>
        </div>
        <p class="km-loading-msg" id="km-loading-msg">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  document.getElementById('km-loading-msg').textContent = message;
  overlay.classList.add('km-loading-overlay--visible');
  document.body.style.overflow = 'hidden';
}

function hideLoading() {
  const overlay = document.getElementById('km-loading-overlay');
  if (!overlay) return;
  overlay.classList.remove('km-loading-overlay--visible');
  document.body.style.overflow = '';
}

// Expose globally
window.showLoading = showLoading;
window.hideLoading = hideLoading;

/* ════════════════════════════════════════════════════════════
   PART O — GLOBAL ERROR STATE
════════════════════════════════════════════════════════════ */
function createErrorState(containerId, {
  title   = 'Something went wrong',
  message = 'Please try again later.',
  onRetry = null,
  icon    = 'fa-exclamation-triangle',
} = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="km-error-state" role="alert">
      <div class="km-error-state__icon" aria-hidden="true">
        <i class="fas ${icon}"></i>
      </div>
      <h3 class="km-error-state__title">${title}</h3>
      <p class="km-error-state__msg">${message}</p>
      ${onRetry ? `<button class="km-btn km-btn--primary km-error-retry-btn"><i class="fas fa-redo" aria-hidden="true"></i> Retry</button>` : ''}
    </div>
  `;
  if (onRetry) {
    container.querySelector('.km-error-retry-btn')?.addEventListener('click', onRetry);
  }
}

window.createErrorState = createErrorState;

/* ════════════════════════════════════════════════════════════
   INJECT COMPONENT CSS INTO HEAD (once)
════════════════════════════════════════════════════════════ */
function injectComponentStyles() {
  if (document.getElementById('km-component-styles')) return;
  const style = document.createElement('style');
  style.id    = 'km-component-styles';
  style.textContent = `
    /* ── Toast Container ── */
    .km-toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
      width: calc(100vw - 40px);
      pointer-events: none;
    }
    @media (max-width: 480px) {
      .km-toast-container {
        top: auto;
        bottom: 20px;
        right: 12px;
        left: 12px;
        max-width: none;
        width: auto;
      }
    }

    /* ── Toast ── */
    .km-toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.07);
      pointer-events: auto;
      opacity: 0;
      transform: translateX(20px) scale(0.96);
      transition: opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1);
    }
    .km-toast--visible {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
    .km-toast--leaving {
      opacity: 0;
      transform: translateX(20px) scale(0.92);
      transition: opacity .3s ease, transform .3s ease;
    }
    @media (max-width: 480px) {
      .km-toast {
        transform: translateY(16px) scale(0.96);
      }
      .km-toast--visible { transform: translateY(0) scale(1); }
      .km-toast--leaving { transform: translateY(16px) scale(0.92); }
    }
    .km-toast__icon-wrap {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .9rem;
      flex-shrink: 0;
    }
    .km-toast__body { flex: 1; min-width: 0; }
    .km-toast__title {
      font-family: 'Poppins', sans-serif;
      font-size: .82rem;
      font-weight: 700;
      color: #0f2d1a;
      margin-bottom: 2px;
    }
    .km-toast__msg {
      font-family: 'Inter', sans-serif;
      font-size: .8rem;
      color: #6b7280;
      line-height: 1.45;
    }
    .km-toast__close {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: .78rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      flex-shrink: 0;
      transition: color .2s, background .2s;
      margin-top: -2px;
    }
    .km-toast__close:hover { background: #f3f4f6; color: #374151; }

    /* ── Loading Overlay ── */
    .km-loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(13,61,34,0.72);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 8500;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity .3s ease, visibility .3s ease;
    }
    .km-loading-overlay--visible { opacity: 1; visibility: visible; }
    .km-loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    .km-spinner {
      position: relative;
      width: 64px;
      height: 64px;
    }
    .km-spinner__ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.15);
      border-top-color: #4caf50;
      animation: km-spin 0.8s linear infinite;
    }
    @keyframes km-spin { to { transform: rotate(360deg); } }
    .km-spinner__leaf {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #86efac;
    }
    .km-loading-msg {
      font-family: 'Inter', sans-serif;
      font-size: .92rem;
      font-weight: 600;
      color: rgba(255,255,255,0.88);
      letter-spacing: .02em;
    }

    /* ── Error State ── */
    .km-error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      padding: 48px 24px;
    }
    .km-error-state__icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #dc2626;
    }
    .km-error-state__title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f2d1a;
    }
    .km-error-state__msg {
      font-size: .88rem;
      color: #6b7280;
      max-width: 320px;
      line-height: 1.6;
    }

    /* ── Shared Buttons ── */
    .km-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      border-radius: 999px;
      font-family: 'Inter', sans-serif;
      font-size: .88rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all .22s ease;
      text-decoration: none;
    }
    .km-btn--primary {
      background: linear-gradient(135deg,#1a6b3c,#2d9b5a,#4caf50);
      color: #fff;
      box-shadow: 0 4px 16px rgba(26,107,60,.3);
    }
    .km-btn--primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(26,107,60,.4);
    }
    .km-btn--outline {
      background: transparent;
      color: #1a6b3c;
      border: 1.5px solid #1a6b3c;
    }
    .km-btn--outline:hover { background: #f0fdf4; }
    .km-btn--ghost {
      background: rgba(255,255,255,.12);
      color: #fff;
      border: 1px solid rgba(255,255,255,.2);
    }
    .km-btn--ghost:hover { background: rgba(255,255,255,.2); }
    .km-btn--sm { padding: 7px 16px; font-size: .8rem; }
    .km-btn--lg { padding: 14px 30px; font-size: .98rem; }
    .km-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* ── Shared Card ── */
    .km-card {
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e8eeeb;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }
    .km-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e8eeeb;
    }
    .km-card__title {
      font-family: 'Poppins', sans-serif;
      font-size: .95rem;
      font-weight: 700;
      color: #0f2d1a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .km-card__title i { color: #1a6b3c; font-size: .9rem; }
    .km-card__body { padding: 20px; }
    .km-card__footer {
      padding: 12px 20px;
      border-top: 1px solid #e8eeeb;
      background: #f9fafb;
    }

    /* ── Badge ── */
    .km-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: .04em;
    }
    .km-badge--green  { background: #dcfce7; color: #15803d; }
    .km-badge--red    { background: #fee2e2; color: #b91c1c; }
    .km-badge--amber  { background: #fef3c7; color: #92400e; }
    .km-badge--blue   { background: #dbeafe; color: #1d4ed8; }
    .km-badge--purple { background: #f3e8ff; color: #6d28d9; }
    .km-badge--gray   { background: #f3f4f6; color: #4b5563; }

    /* ── Empty State ── */
    .km-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 48px 24px;
      color: #9ca3af;
    }
    .km-empty-state i { font-size: 2.8rem; color: #d1d5db; }
    .km-empty-state h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: #374151;
    }
    .km-empty-state p { font-size: .84rem; max-width: 260px; line-height: 1.6; }

    /* ── Status Indicator ── */
    .km-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: .8rem;
      font-weight: 600;
    }
    .km-status__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .km-status--online  .km-status__dot { background: #22c55e; box-shadow: 0 0 0 3px #dcfce7; }
    .km-status--offline .km-status__dot { background: #9ca3af; }
    .km-status--busy    .km-status__dot { background: #f59e0b; box-shadow: 0 0 0 3px #fef3c7; }
    .km-status--error   .km-status__dot { background: #ef4444; box-shadow: 0 0 0 3px #fee2e2; }

    /* ── Tooltip ── */
    [data-tooltip] {
      position: relative;
    }
    [data-tooltip]::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #111827;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: .72rem;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 8px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity .2s ease, transform .2s ease;
      transform: translateX(-50%) translateY(4px);
    }
    [data-tooltip]:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ── Skeleton loader ── */
    .km-skeleton {
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: km-skeleton-wave 1.4s infinite;
      border-radius: 8px;
    }
    @keyframes km-skeleton-wave {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── App Layout (shared for inner pages) ── */
    .km-app-body {
      background: #f4f7f5;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .km-app-wrapper {
      display: flex;
      min-height: 100vh;
    }
    .km-app-main {
      margin-left: 256px;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left .3s ease;
    }
    .km-page-content {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .km-app-main { margin-left: 0; }
    }
    @media (max-width: 480px) {
      .km-page-content { padding: 16px; gap: 16px; }
    }

    /* ── Feature Coming Soon Card ── */
    .km-coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;
      padding: 64px 32px;
      background: #fff;
      border-radius: 20px;
      border: 1px solid #e8eeeb;
      box-shadow: 0 2px 12px rgba(0,0,0,.06);
    }
    .km-coming-soon__icon {
      width: 88px;
      height: 88px;
      border-radius: 22px;
      background: linear-gradient(135deg,#dcfce7,#f0fdf4);
      border: 2px solid #bbf7d0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      color: #1a6b3c;
    }
    .km-coming-soon__badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      background: #fef3c7;
      border: 1px solid #fde68a;
      border-radius: 999px;
      font-size: .72rem;
      font-weight: 700;
      color: #92400e;
      letter-spacing: .05em;
      text-transform: uppercase;
    }
    .km-coming-soon__title {
      font-family: 'Poppins', sans-serif;
      font-size: 1.55rem;
      font-weight: 800;
      color: #0f2d1a;
      line-height: 1.2;
    }
    .km-coming-soon__desc {
      font-size: .93rem;
      color: #6b7280;
      max-width: 480px;
      line-height: 1.65;
    }
    .km-coming-soon__features {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-top: 8px;
    }
    .km-coming-soon__feature-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      border-radius: 999px;
      font-size: .78rem;
      font-weight: 600;
      color: #1a6b3c;
    }
    .km-coming-soon__feature-tag i { font-size: .75rem; }
    .km-coming-soon__actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 8px;
    }
  `;
  document.head.appendChild(style);
}

/* ════════════════════════════════════════════════════════════
   MAIN INITIALIZER
   Called automatically on DOMContentLoaded
════════════════════════════════════════════════════════════ */
async function initKrishiMitraComponents() {
  // 1. Inject shared CSS tokens
  injectComponentStyles();

  // 2. Auth guard
  if (!checkAuth()) return;

  // 3. Determine component base path
  //    Pages inside /pages/ use ../components/
  //    Root (index.html) uses components/
  const depth      = window.location.pathname.split('/').filter(Boolean);
  const isInPages  = depth.some(d => d === 'pages');
  const compBase   = isInPages ? '../components/' : 'components/';

  // 4. Load components (in parallel for speed)
  await Promise.all([
    loadComponent('sidebar-container',  compBase + 'sidebar.html'),
    loadComponent('navbar-container',   compBase + 'navbar.html'),
    loadComponent('chatbot-container',  compBase + 'chatbot-widget.html'),
    loadComponent('footer-container',   compBase + 'footer.html'),
  ]);

  // 5. After components are injected into DOM, initialize their JS
  activateSidebarItem();
  setNavbarTitle();
  populateUserUI();
  initSidebarToggle();
  initProfileDropdown();
  initLogout();
  initNotifBell();
  initLanguageSelector();

  // 6. Fire event so language.js (loaded before this script) can apply
  //    translations to the freshly injected sidebar, navbar, footer HTML.
  document.dispatchEvent(new CustomEvent('kmComponentsLoaded'));

  // 7. Belt-and-suspenders: also call KM_Lang directly if available
  if (window.KM_Lang && typeof window.KM_Lang.applyLanguage === 'function') {
    window.KM_Lang.applyLanguage(window.KM_Lang.getCurrentLang());
  }

  // 8. Start live notifications simulation
  startLiveNotificationEngine();
}

document.addEventListener('DOMContentLoaded', initKrishiMitraComponents);

/* ════════════════════════════════════════════════════════════
   EXPOSE UTILITIES TO PAGE-SPECIFIC SCRIPTS
════════════════════════════════════════════════════════════ */
window.KM        = KM;
window.getUser   = getUser;
window.getToken  = getToken;
window.showToast = showToast;
window.showLoading  = showLoading;
window.hideLoading  = hideLoading;
window.createErrorState = createErrorState;


/* ════════════════════════════════════════════════════════════
   LIVE NOTIFICATION ENGINE
   Simulates real-time agricultural alerts
════════════════════════════════════════════════════════════ */
const LIVE_NOTIF_TEMPLATES = [
  {
    cat: 'weather',
    title: '🌧️ Live Weather Update',
    text: 'Unseasonal light rain forecasted for your area in the next 3-4 hours. Keep harvested produce in a dry place.',
    tag: 'Weather Alert',
    tagClass: 'tag-weather',
    icon: 'fa-cloud-rain',
    iconColor: '#60a5fa',
    iconBg: 'rgba(59,130,246,0.15)'
  },
  {
    cat: 'pest',
    title: '🐛 Active Pest Threat Alert',
    text: 'Localized whitefly alerts reported near Nashik district. Inspect tomato and cotton leaf undersides immediately.',
    tag: 'Pest Threat',
    tagClass: 'tag-pest',
    icon: 'fa-bug',
    iconColor: '#f87171',
    iconBg: 'rgba(239,68,68,0.15)'
  },
  {
    cat: 'market',
    title: '📈 Live Mandi Price Surge',
    text: 'Wheat price at local APMC mandis has hit ₹2,650/quintal, up by 4% today. Ideal time to sell your stock.',
    tag: 'Market Live',
    tagClass: 'tag-market',
    icon: 'fa-chart-line',
    iconColor: '#c084fc',
    iconBg: 'rgba(168,85,247,0.15)'
  },
  {
    cat: 'irrigation',
    title: '💧 Smart Irrigation Advisor',
    text: 'High temperature forecasted for tomorrow. An early morning irrigation cycle is recommended for optimum root moisture.',
    tag: 'Irrigation',
    tagClass: 'tag-irrigation',
    icon: 'fa-tint',
    iconColor: '#2dd4bf',
    iconBg: 'rgba(20,184,166,0.15)'
  },
  {
    cat: 'disease',
    title: '🌿 Powdery Mildew Alert',
    text: 'High humidity is creating a high risk of Powdery Mildew in vine and vegetable crops. Inspect leaves for white spots.',
    tag: 'Disease Alert',
    tagClass: 'tag-disease',
    icon: 'fa-leaf',
    iconColor: '#fb923c',
    iconBg: 'rgba(249,115,22,0.15)'
  }
];

function updateNavbarNotifBadge() {
  const notifDot = document.querySelector('.topbar__notif-dot');
  const notifBtn = document.getElementById('notif-bell-btn');
  if (!notifBtn) return;

  const stored = localStorage.getItem('km_notifications_v2');
  let unreadCount = 0;
  if (stored) {
    try {
      const notifs = JSON.parse(stored);
      unreadCount = notifs.filter(n => n.unread).length;
    } catch (e) {
      unreadCount = 3;
    }
  } else {
    unreadCount = 3;
  }

  if (notifDot) {
    notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
  }
  notifBtn.setAttribute('aria-label', `View notifications (${unreadCount} unread)`);
}

function generateLiveNotification() {
  const stored = localStorage.getItem('km_notifications_v2');
  let list = [];
  if (stored) {
    try { list = JSON.parse(stored); } catch { list = []; }
  }

  const template = LIVE_NOTIF_TEMPLATES[Math.floor(Math.random() * LIVE_NOTIF_TEMPLATES.length)];
  const newNotif = {
    id: 'live_' + Date.now(),
    cat: template.cat,
    unread: true,
    time: 'Just now',
    icon: template.icon,
    iconBg: template.iconBg,
    iconColor: template.iconColor,
    title: template.title,
    text: template.text,
    tag: template.tag,
    tagClass: template.tagClass
  };

  list.unshift(newNotif);
  localStorage.setItem('km_notifications_v2', JSON.stringify(list));

  if (typeof window.showToast === 'function') {
    window.showToast(template.text, 'info', template.title, 6000);
  }

  updateNavbarNotifBadge();

  if (window.location.pathname.includes('notifications.html') && typeof loadNotifications === 'function' && typeof renderNotifications === 'function') {
    loadNotifications();
    renderNotifications();
  }
}

function startLiveNotificationEngine() {
  updateNavbarNotifBadge();
  setInterval(() => {
    generateLiveNotification();
  }, 30000);
}

window.updateNavbarNotifBadge = updateNavbarNotifBadge;
