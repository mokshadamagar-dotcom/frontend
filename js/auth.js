/* ============================================================
   KrishiMitra AI – auth.js
   Authentication Logic (Mock – FastAPI ready)
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONFIGURATION
   Replace MOCK_AUTH = false and fill API_BASE when
   FastAPI backend is ready.
════════════════════════════════════════════════════════════ */
const AUTH_CONFIG = {
  MOCK_AUTH:     true,           // Set false when FastAPI is live
  API_BASE:      'http://localhost:8000/api/v1',  // FastAPI base URL
  TOKEN_KEY:     'km_auth_token',
  USER_KEY:      'km_user_data',
  SESSION_KEY:   'km_session',
  REDIRECT_DASHBOARD: '../pages/dashboard.html',
  REDIRECT_LOGIN:     '../pages/login.html',
};

/* ════════════════════════════════════════════════════════════
   UTILITIES
════════════════════════════════════════════════════════════ */

/** Show a form-level alert banner */
function showFormAlert(alertEl, message, type = 'error') {
  if (!alertEl) return;
  alertEl.className = `form-alert form-alert--${type} visible`;
  alertEl.innerHTML = `
    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}" aria-hidden="true"></i>
    <span>${message}</span>
  `;
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFormAlert(alertEl) {
  if (!alertEl) return;
  alertEl.classList.remove('visible');
}

/** Mark a field as invalid with an inline error message */
function setFieldError(inputEl, errorEl, message) {
  if (!inputEl) return;
  inputEl.classList.add('error');
  inputEl.classList.remove('valid');
  inputEl.setAttribute('aria-invalid', 'true');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

/** Mark a field as valid, hide error */
function setFieldValid(inputEl, errorEl) {
  if (!inputEl) return;
  inputEl.classList.remove('error');
  inputEl.classList.add('valid');
  inputEl.setAttribute('aria-invalid', 'false');
  if (errorEl) errorEl.classList.remove('visible');
}

/** Clear field state */
function clearFieldState(inputEl, errorEl) {
  if (!inputEl) return;
  inputEl.classList.remove('error', 'valid');
  inputEl.removeAttribute('aria-invalid');
  if (errorEl) errorEl.classList.remove('visible');
}

/** Set submit button loading state */
function setBtnLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.setAttribute('aria-busy', 'true');
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.setAttribute('aria-busy', 'false');
  }
}

/** Delay helper */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ════════════════════════════════════════════════════════════
   VALIDATION RULES
════════════════════════════════════════════════════════════ */
const VALIDATORS = {
  required: (val) =>
    val.trim().length > 0 || 'This field is required.',

  email: (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ||
    'Enter a valid email address.',

  phone: (val) =>
    /^[6-9]\d{9}$/.test(val.trim()) ||
    'Enter a valid 10-digit Indian mobile number.',

  minLength: (min) => (val) =>
    val.length >= min || `Must be at least ${min} characters.`,

  passwordStrength: (val) => {
    if (val.length < 8) return 'Password must be at least 8 characters.';
    return true;
  },

  confirmMatch: (passwordVal) => (val) =>
    val === passwordVal || 'Passwords do not match.',

  name: (val) =>
    val.trim().length >= 2 || 'Full name must be at least 2 characters.',
};

/** Run a validator chain on a value.
 *  Returns { valid: bool, message: string } */
function runValidators(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return { valid: false, message: result };
    }
  }
  return { valid: true, message: '' };
}

/* ════════════════════════════════════════════════════════════
   PASSWORD STRENGTH METER
════════════════════════════════════════════════════════════ */
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak',   label: 'Weak',          filled: 1 };
  if (score <= 2) return { level: 'fair',   label: 'Fair',          filled: 2 };
  if (score <= 3) return { level: 'good',   label: 'Good',          filled: 3 };
  return           { level: 'strong', label: 'Strong 🔒',     filled: 4 };
}

function updateStrengthMeter(password, wrapperEl) {
  if (!wrapperEl) return;
  const segments = wrapperEl.querySelectorAll('.strength-bar-segment');
  const labelEl  = wrapperEl.querySelector('.strength-label');

  if (!password) {
    segments.forEach(s => {
      s.className = 'strength-bar-segment';
    });
    if (labelEl) labelEl.textContent = '';
    return;
  }

  const { level, label, filled } = getPasswordStrength(password);

  segments.forEach((seg, i) => {
    if (i < filled) {
      seg.className = `strength-bar-segment filled-${level}`;
    } else {
      seg.className = 'strength-bar-segment';
    }
  });

  if (labelEl) {
    labelEl.textContent  = `Password strength: ${label}`;
    labelEl.className    = `strength-label ${level}`;
  }
}

/* ════════════════════════════════════════════════════════════
   SHOW / HIDE PASSWORD
════════════════════════════════════════════════════════════ */
function initPasswordToggle(toggleBtn, inputEl) {
  if (!toggleBtn || !inputEl) return;
  toggleBtn.addEventListener('click', () => {
    const isText = inputEl.type === 'text';
    inputEl.type = isText ? 'password' : 'text';
    const icon   = toggleBtn.querySelector('i');
    if (icon) {
      icon.className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    toggleBtn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
  });
}

/* ════════════════════════════════════════════════════════════
   MOCK AUTHENTICATION  (replace with real API calls later)
════════════════════════════════════════════════════════════ */

/** Mock login – simulates FastAPI /auth/login response */
async function mockLogin(email, password) {
  await delay(1400); // simulate network

  // Demo credentials: any valid email + password ≥ 8 chars
  if (email && password.length >= 8) {
    const mockToken = 'mock_jwt_' + Math.random().toString(36).substring(2);
    const mockUser  = {
      id:       'usr_' + Math.random().toString(36).substring(2, 9),
      email:    email,
      name:     email.split('@')[0].replace(/[._-]/g, ' '),
      role:     'farmer',
      language: 'en',
    };
    return { success: true, token: mockToken, user: mockUser };
  }

  return {
    success: false,
    error:   'Invalid email or password. (Demo: use any valid email + 8+ char password)',
  };
}

/** Mock register – simulates FastAPI /auth/register response */
async function mockRegister(formData) {
  await delay(1800);

  // Simulate email already taken edge case
  if (formData.email === 'test@krishimitra.ai') {
    return { success: false, error: 'This email is already registered.' };
  }

  return {
    success: true,
    message: 'Account created successfully! Redirecting to login…',
  };
}

/* ─── FastAPI API calls (wired in later) ─────────────────── */
// async function apiLogin(email, password) {
//   const res = await fetch(`${AUTH_CONFIG.API_BASE}/auth/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   });
//   return res.json();
// }
//
// async function apiRegister(payload) {
//   const res = await fetch(`${AUTH_CONFIG.API_BASE}/auth/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//   });
//   return res.json();
// }

/* ════════════════════════════════════════════════════════════
   SESSION MANAGEMENT
════════════════════════════════════════════════════════════ */

/** Save session (mock or real JWT) */
function saveSession(token, user, remember = false) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  // Store only non-sensitive user data — NEVER store passwords
  storage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify({
    id:       user.id,
    name:     user.name,
    email:    user.email,
    role:     user.role,
    language: user.language,
  }));
}

/** Clear session on logout */
function clearSession() {
  [localStorage, sessionStorage].forEach(s => {
    s.removeItem(AUTH_CONFIG.TOKEN_KEY);
    s.removeItem(AUTH_CONFIG.USER_KEY);
    s.removeItem(AUTH_CONFIG.SESSION_KEY);
  });
}

/** Check if user is currently authenticated */
function isAuthenticated() {
  return !!(
    localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) ||
    sessionStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
  );
}

/** Get stored user data */
function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_CONFIG.USER_KEY)
              || sessionStorage.getItem(AUTH_CONFIG.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ════════════════════════════════════════════════════════════
   LOGIN PAGE LOGIC
════════════════════════════════════════════════════════════ */
function initLoginPage() {
  const form          = document.getElementById('login-form');
  if (!form) return;

  const emailInput    = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const emailError    = document.getElementById('login-email-error');
  const passwordError = document.getElementById('login-password-error');
  const toggleBtn     = document.getElementById('toggle-login-password');
  const rememberChk   = document.getElementById('remember-me');
  const formAlert     = document.getElementById('login-alert');
  const submitBtn     = document.getElementById('login-submit-btn');
  const forgotLink    = document.getElementById('forgot-password-link');
  const googleBtn     = document.getElementById('google-login-btn');

  // If already logged in, redirect to dashboard
  if (isAuthenticated()) {
    window.location.href = AUTH_CONFIG.REDIRECT_DASHBOARD;
    return;
  }

  // Show/hide password
  initPasswordToggle(toggleBtn, passwordInput);

  // Live validation on blur
  emailInput?.addEventListener('blur', () => {
    const v = runValidators(emailInput.value, [
      VALIDATORS.required,
      VALIDATORS.email,
    ]);
    v.valid
      ? setFieldValid(emailInput, emailError)
      : setFieldError(emailInput, emailError, v.message);
  });

  passwordInput?.addEventListener('blur', () => {
    const v = runValidators(passwordInput.value, [VALIDATORS.required]);
    v.valid
      ? setFieldValid(passwordInput, passwordError)
      : setFieldError(passwordInput, passwordError, v.message);
  });

  // Clear errors on input
  emailInput?.addEventListener('input',    () => clearFieldState(emailInput, emailError));
  passwordInput?.addEventListener('input', () => clearFieldState(passwordInput, passwordError));

  // Forgot password modal
  forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openForgotModal();
  });

  // Google login placeholder
  googleBtn?.addEventListener('click', () => {
    showToastMessage('Google login will be available after backend integration.', 'info');
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormAlert(formAlert);

    const email    = emailInput?.value || '';
    const password = passwordInput?.value || '';
    let hasError   = false;

    // Validate email
    const emailResult = runValidators(email, [VALIDATORS.required, VALIDATORS.email]);
    if (!emailResult.valid) {
      setFieldError(emailInput, emailError, emailResult.message);
      hasError = true;
    } else {
      setFieldValid(emailInput, emailError);
    }

    // Validate password
    const pwResult = runValidators(password, [VALIDATORS.required]);
    if (!pwResult.valid) {
      setFieldError(passwordInput, passwordError, pwResult.message);
      hasError = true;
    } else {
      setFieldValid(passwordInput, passwordError);
    }

    if (hasError) return;

    setBtnLoading(submitBtn, true);

    try {
      // ── Swap mockLogin → apiLogin when FastAPI is ready ──
      const result = AUTH_CONFIG.MOCK_AUTH
        ? await mockLogin(email, password)
        : await apiLogin(email, password);      // uncomment & define apiLogin

      if (result.success) {
        const remember = rememberChk?.checked || false;
        saveSession(result.token, result.user, remember);
        showToastMessage(`Welcome back, ${result.user.name || 'Farmer'}! 🌾`, 'success');
        await delay(800);
        window.location.href = AUTH_CONFIG.REDIRECT_DASHBOARD;
      } else {
        showFormAlert(formAlert, result.error || 'Login failed. Please try again.');
        setBtnLoading(submitBtn, false);
        passwordInput?.focus();
      }
    } catch (err) {
      console.error('Login error:', err);
      showFormAlert(formAlert, 'Network error. Please check your connection and try again.');
      setBtnLoading(submitBtn, false);
    }
  });

  // Init forgot password modal
  initForgotPasswordModal();
}

/* ════════════════════════════════════════════════════════════
   FORGOT PASSWORD MODAL
════════════════════════════════════════════════════════════ */
function initForgotPasswordModal() {
  const overlay     = document.getElementById('forgot-modal-overlay');
  const closeBtn    = document.getElementById('forgot-modal-close');
  const fpForm      = document.getElementById('forgot-form');
  const fpEmail     = document.getElementById('forgot-email');
  const fpEmailErr  = document.getElementById('forgot-email-error');
  const fpAlert     = document.getElementById('forgot-alert');
  const fpSubmitBtn = document.getElementById('forgot-submit-btn');

  if (!overlay) return;

  closeBtn?.addEventListener('click', closeForgotModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeForgotModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeForgotModal();
  });

  fpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormAlert(fpAlert);

    const email = fpEmail?.value || '';
    const vRes  = runValidators(email, [VALIDATORS.required, VALIDATORS.email]);

    if (!vRes.valid) {
      setFieldError(fpEmail, fpEmailErr, vRes.message);
      return;
    }

    setFieldValid(fpEmail, fpEmailErr);
    setBtnLoading(fpSubmitBtn, true);

    await delay(1200); // mock delay

    showFormAlert(fpAlert, `If an account exists for ${email}, a reset link has been sent. (Demo mode)`, 'success');
    setBtnLoading(fpSubmitBtn, false);

    setTimeout(() => {
      closeForgotModal();
      if (fpForm) fpForm.reset();
      clearFieldState(fpEmail, fpEmailErr);
    }, 3000);
  });
}

function openForgotModal() {
  const overlay = document.getElementById('forgot-modal-overlay');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('forgot-email')?.focus();
}

function closeForgotModal() {
  const overlay = document.getElementById('forgot-modal-overlay');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════════════════
   REGISTER PAGE LOGIC
════════════════════════════════════════════════════════════ */
function initRegisterPage() {
  const form = document.getElementById('register-form');
  if (!form) return;

  // Fields
  const nameInput     = document.getElementById('reg-name');
  const emailInput    = document.getElementById('reg-email');
  const phoneInput    = document.getElementById('reg-phone');
  const passwordInput = document.getElementById('reg-password');
  const confirmInput  = document.getElementById('reg-confirm-password');
  const stateSelect   = document.getElementById('reg-state');
  const districtInput = document.getElementById('reg-district');
  const langSelect    = document.getElementById('reg-language');
  const userTypeSelect = document.getElementById('reg-user-type');
  const termsChk      = document.getElementById('reg-terms');

  // Error elements
  const nameError      = document.getElementById('reg-name-error');
  const emailError     = document.getElementById('reg-email-error');
  const phoneError     = document.getElementById('reg-phone-error');
  const passwordError  = document.getElementById('reg-password-error');
  const confirmError   = document.getElementById('reg-confirm-error');
  const stateError     = document.getElementById('reg-state-error');
  const termsError     = document.getElementById('reg-terms-error');

  // UI elements
  const togglePwBtn    = document.getElementById('toggle-reg-password');
  const toggleCfmBtn   = document.getElementById('toggle-reg-confirm');
  const strengthWrap   = document.getElementById('password-strength-wrap');
  const matchIndicator = document.getElementById('password-match');
  const formAlert      = document.getElementById('register-alert');
  const submitBtn      = document.getElementById('register-submit-btn');
  const successBox     = document.getElementById('register-success');
  const formBox        = document.getElementById('register-form-content');

  // If already logged in, redirect
  if (isAuthenticated()) {
    window.location.href = AUTH_CONFIG.REDIRECT_DASHBOARD;
    return;
  }

  // Show/hide passwords
  initPasswordToggle(togglePwBtn, passwordInput);
  initPasswordToggle(toggleCfmBtn, confirmInput);

  // Password strength meter
  passwordInput?.addEventListener('input', () => {
    const val = passwordInput.value;
    if (val.length > 0) {
      strengthWrap?.classList.add('visible');
    } else {
      strengthWrap?.classList.remove('visible');
    }
    updateStrengthMeter(val, strengthWrap);
    clearFieldState(passwordInput, passwordError);

    // Re-validate confirm if already typed
    if (confirmInput?.value) validateConfirmPassword();
  });

  // Confirm password live check
  confirmInput?.addEventListener('input', () => {
    clearFieldState(confirmInput, confirmError);
    if (confirmInput.value) validateConfirmPassword();
  });

  function validateConfirmPassword() {
    if (!confirmInput || !passwordInput) return true;
    const match = confirmInput.value === passwordInput.value;

    if (matchIndicator) {
      matchIndicator.classList.add('visible');
      matchIndicator.classList.toggle('match',    match);
      matchIndicator.classList.toggle('no-match', !match);
      matchIndicator.innerHTML = match
        ? '<i class="fas fa-check-circle" aria-hidden="true"></i> Passwords match'
        : '<i class="fas fa-times-circle" aria-hidden="true"></i> Passwords do not match';
    }
    return match;
  }

  // Blur validators
  const blurValidations = [
    { el: nameInput,    err: nameError,    rules: [VALIDATORS.required, VALIDATORS.name] },
    { el: emailInput,   err: emailError,   rules: [VALIDATORS.required, VALIDATORS.email] },
    { el: phoneInput,   err: phoneError,   rules: [VALIDATORS.required, VALIDATORS.phone] },
    { el: stateSelect,  err: stateError,   rules: [VALIDATORS.required] },
    {
      el: passwordInput,
      err: passwordError,
      rules: [VALIDATORS.required, VALIDATORS.passwordStrength],
    },
    {
      el: confirmInput,
      err: confirmError,
      rules: [VALIDATORS.required],
    },
  ];

  blurValidations.forEach(({ el, err, rules }) => {
    el?.addEventListener('blur', () => {
      const v = runValidators(el.value, rules);
      v.valid ? setFieldValid(el, err) : setFieldError(el, err, v.message);
    });
    el?.addEventListener('input', () => clearFieldState(el, err));
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormAlert(formAlert);

    let hasError = false;

    // Validate all fields
    const fieldValidations = [
      { el: nameInput,    err: nameError,    rules: [VALIDATORS.required, VALIDATORS.name] },
      { el: emailInput,   err: emailError,   rules: [VALIDATORS.required, VALIDATORS.email] },
      { el: phoneInput,   err: phoneError,   rules: [VALIDATORS.required, VALIDATORS.phone] },
      { el: stateSelect,  err: stateError,   rules: [VALIDATORS.required] },
      { el: passwordInput, err: passwordError, rules: [VALIDATORS.required, VALIDATORS.passwordStrength] },
    ];

    fieldValidations.forEach(({ el, err, rules }) => {
      if (!el) return;
      const v = runValidators(el.value, rules);
      if (!v.valid) {
        setFieldError(el, err, v.message);
        hasError = true;
      } else {
        setFieldValid(el, err);
      }
    });

    // Confirm password
    if (!confirmInput?.value) {
      setFieldError(confirmInput, confirmError, 'Please confirm your password.');
      hasError = true;
    } else if (!validateConfirmPassword()) {
      setFieldError(confirmInput, confirmError, 'Passwords do not match.');
      hasError = true;
    }

    // Terms
    if (!termsChk?.checked) {
      if (termsError) {
        termsError.classList.add('visible');
        termsError.textContent = 'You must accept the Terms & Conditions to continue.';
      }
      document.querySelector('.terms-check')?.classList.add('error-border');
      hasError = true;
    } else {
      if (termsError) termsError.classList.remove('visible');
      document.querySelector('.terms-check')?.classList.remove('error-border');
    }

    if (hasError) {
      // Scroll to first error
      const firstError = form.querySelector('.form-input.error, .form-select.error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setBtnLoading(submitBtn, true);

    const formData = {
      name:      nameInput?.value.trim(),
      email:     emailInput?.value.trim(),
      phone:     phoneInput?.value.trim(),
      state:     stateSelect?.value,
      district:  districtInput?.value.trim(),
      language:  langSelect?.value,
      userType:  userTypeSelect?.value,
      // NOTE: password is sent to API but never stored locally
    };

    try {
      // ── Swap mockRegister → apiRegister when FastAPI is ready ──
      const result = AUTH_CONFIG.MOCK_AUTH
        ? await mockRegister({ ...formData, email: emailInput.value.trim() })
        : await apiRegister({ ...formData, password: passwordInput.value });

      if (result.success) {
        // Show success state
        if (formBox)    formBox.style.display    = 'none';
        if (successBox) successBox.classList.add('visible');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = AUTH_CONFIG.REDIRECT_LOGIN;
        }, 3000);
      } else {
        showFormAlert(formAlert, result.error || 'Registration failed. Please try again.');
        setBtnLoading(submitBtn, false);
      }
    } catch (err) {
      console.error('Register error:', err);
      showFormAlert(formAlert, 'Network error. Please check your connection and try again.');
      setBtnLoading(submitBtn, false);
    }
  });

  // Terms checkbox toggle error clear
  termsChk?.addEventListener('change', () => {
    if (termsChk.checked) {
      if (termsError) termsError.classList.remove('visible');
      document.querySelector('.terms-check')?.classList.remove('error-border');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════════════════════ */
function showToastMessage(message, type = 'success', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '9998',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
      pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-check-circle',
    error:   'fa-times-circle',
    info:    'fa-info-circle',
  };

  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    display:flex; align-items:center; gap:12px;
    padding:14px 22px; background:#111827; color:#fff;
    border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.15);
    font-size:0.9rem; font-weight:500; font-family:'Inter',sans-serif;
    border:1px solid rgba(255,255,255,0.08); pointer-events:auto;
    animation: toast-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    max-width:380px;
  `;

  const iconColor = type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#60a5fa';
  toast.innerHTML = `
    <i class="fas ${icons[type]}" style="color:${iconColor};font-size:1rem;flex-shrink:0;" aria-hidden="true"></i>
    <span>${message}</span>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toast-slide-in {
      from { opacity:0; transform:translateY(16px) scale(0.9); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes toast-slide-out {
      from { opacity:1; transform:translateY(0) scale(1); }
      to   { opacity:0; transform:translateY(-8px) scale(0.95); }
    }
  `;
  if (!document.getElementById('toast-styles')) {
    style.id = 'toast-styles';
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-slide-out 0.25s ease forwards';
    setTimeout(() => toast.remove(), 280);
  }, duration);
}

/* ════════════════════════════════════════════════════════════
   INITIALISE CORRECT PAGE
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'login')    initLoginPage();
  if (page === 'register') initRegisterPage();
});

/* ════════════════════════════════════════════════════════════
   EXPORT (for future module usage)
════════════════════════════════════════════════════════════ */
// export { isAuthenticated, getStoredUser, clearSession, AUTH_CONFIG };
