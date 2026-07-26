/* ============================================================
   KrishiMitra AI – landing.js
   Landing Page Interactive Logic
   ============================================================ */

'use strict';

/* ─── Page Loader ─────────────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 900);
  }
});

/* ─── Navbar: Scroll State ────────────────────────────────── */
const navbar = document.getElementById('main-navbar');

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

/* ─── Navbar: Active Link on Scroll ──────────────────────── */
const navLinks = document.querySelectorAll('.nav__link[data-section]');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ─── Hamburger Menu ──────────────────────────────────────── */
const hamburger    = document.getElementById('nav-hamburger');
const mobileMenu   = document.getElementById('nav-mobile-menu');

function toggleMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  const isOpen = mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', !isOpen);
  hamburger.classList.toggle('active', !isOpen);
  hamburger.setAttribute('aria-expanded', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

function closeMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', toggleMobileMenu);
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  }
});

// Close menu when mobile link clicked
document.querySelectorAll('.nav__mobile-link').forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

/* ─── Smooth Scroll for All Hash Links ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ─── Scroll-to-top Button ────────────────────────────────── */
const scrollTopBtn = document.getElementById('scroll-top-btn');

window.addEventListener('scroll', () => {
  if (!scrollTopBtn) return;
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─── Intersection Observer: Reveal Animations ────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Counter Animation ───────────────────────────────────── */
function animateCounter(el, target, duration = 2000, suffix = '') {
  const start     = 0;
  const startTime = performance.now();

  const step = (timestamp) => {
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value    = Math.round(start + (target - start) * eased);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, suffix);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* ─── Benefits Chart Bars ─────────────────────────────────── */
const chartObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.benefits__chart-fill').forEach(bar => {
          const width = bar.dataset.width;
          bar.style.width = width;
        });
        chartObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

const chartSection = document.querySelector('.benefits__visual-card');
if (chartSection) chartObserver.observe(chartSection);

/* ─── Language Selector ───────────────────────────────────── */
const langSelect = document.getElementById('lang-select');
if (langSelect) {
  langSelect.addEventListener('change', function () {
    const selected = this.value;
    const messages = {
      en: 'Language changed to English',
      hi: 'भाषा हिंदी में बदली गई',
      mr: 'भाषा मराठीत बदलली'
    };
    showToast(messages[selected] || 'Language changed', 'info');
  });
}

/* ─── Toast System ────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ─── Announcement Bar Close ──────────────────────────────── */
const announcementClose = document.getElementById('announcement-close');
const announcementBar   = document.getElementById('announcement-bar');

if (announcementClose && announcementBar) {
  announcementClose.addEventListener('click', () => {
    announcementBar.style.height = announcementBar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      announcementBar.style.transition = 'height 0.3s ease, opacity 0.3s ease, padding 0.3s ease';
      announcementBar.style.height  = '0';
      announcementBar.style.opacity = '0';
      announcementBar.style.padding = '0';
      announcementBar.style.overflow = 'hidden';
    });
  });
}

/* ─── CTA Button Actions ──────────────────────────────────── */
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', function () {
    const action = this.dataset.action;
    if (action === 'register') {
      window.location.href = 'pages/register.html';
    } else if (action === 'login') {
      window.location.href = 'pages/login.html';
    } else if (action === 'chat') {
      showToast('AI Advisor coming soon! Register to get early access.', 'info');
    } else if (action === 'explore') {
      document.getElementById('features') &&
        document.getElementById('features').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── Feature Card Hover Interaction ─────────────────────── */
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mouseenter', function () {
    this.style.zIndex = '2';
  });
  card.addEventListener('mouseleave', function () {
    this.style.zIndex = '';
  });
});

/* ─── Image Fallback ──────────────────────────────────────── */
document.querySelectorAll('img[data-fallback]').forEach(img => {
  img.addEventListener('error', function () {
    this.style.display = 'none';
    const fallback = document.getElementById(this.dataset.fallback);
    if (fallback) fallback.style.display = 'flex';
  });
});

/* ─── Hero Farmer Image Loader ────────────────────────────── */
(function checkFarmerImage() {
  const farmerImg     = document.getElementById('farmer-img');
  const farmerFallback = document.getElementById('farmer-fallback');
  if (!farmerImg || !farmerFallback) return;

  if (farmerImg.complete && farmerImg.naturalWidth === 0) {
    farmerImg.style.display = 'none';
    farmerFallback.style.display = 'flex';
  } else {
    farmerImg.addEventListener('error', () => {
      farmerImg.style.display = 'none';
      farmerFallback.style.display = 'flex';
    });
  }
})();

/* ─── Stagger feature cards animation ────────────────────── */
(function staggerFeatureCards() {
  const cards = document.querySelectorAll('.feature-card.reveal');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 4) * 0.07}s`;
  });
})();
