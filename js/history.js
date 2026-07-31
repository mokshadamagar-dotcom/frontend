/* ============================================================
   KrishiMitra AI – history.js
   Full Analysis History Page – All Features Combined
   Reads from localStorage (km_pest_history, km_history_log)
   and displays all records with filter, search, pagination.
   ============================================================ */

'use strict';

/* ─── Constants ────────────────────────────────────── */
const KM_HISTORY_KEY = 'km_history_log';   // unified history store
const KM_PEST_KEY    = 'km_pest_history';  // pest-detection.js writes here
const PAGE_SIZE      = 15;

let allRecords   = [];
let filteredRecs = [];
let currentPage  = 1;
let currentFilter = 'all';

/* ─── Feature Meta ──────────────────────────────────── */
const FEATURE_META = {
  disease:    { label: 'Crop Disease',     icon: 'fa-microscope',        cls: 'disease',    color: '#c2410c' },
  pest:       { label: 'Pest Detection',   icon: 'fa-bug',               cls: 'pest',       color: '#b45309' },
  fertilizer: { label: 'Fertilizer',       icon: 'fa-vial',              cls: 'fertilizer', color: '#047857' },
  irrigation: { label: 'Irrigation',       icon: 'fa-tint',              cls: 'irrigation', color: '#1d4ed8' },
  soil:       { label: 'Soil Report',      icon: 'fa-flask',             cls: 'soil',       color: '#7e22ce' },
  advisory:   { label: 'Crop Advisory',    icon: 'fa-leaf',              cls: 'advisory',   color: '#166534' },
  voice:      { label: 'Voice Assistant',  icon: 'fa-microphone',        cls: 'voice',      color: '#be123c' },
};

/* ─── Sample Seed Data (shown when no real history exists) ── */
const SEED_HISTORY = [
  {
    id: 'seed_1', type: 'disease',
    date: '2026-07-30T09:14:00Z', crop: 'Tomato',
    result: 'Late Blight detected (Phytophthora infestans)',
    confidence: 91, status: 'completed',
    detail: 'High confidence disease detection. Recommended: Mancozeb 75% WP spray immediately.'
  },
  {
    id: 'seed_2', type: 'pest',
    date: '2026-07-29T14:23:00Z', crop: 'Cotton',
    result: 'Pink Bollworm – High Severity',
    confidence: 87, status: 'completed',
    detail: 'Severe infestation level. Risk Score: 78. Immediate action: Apply chlorpyrifos spray.'
  },
  {
    id: 'seed_3', type: 'fertilizer',
    date: '2026-07-28T11:05:00Z', crop: 'Wheat',
    result: 'Urea 120 kg/ha + SSP 80 kg/ha recommended',
    confidence: 94, status: 'saved',
    detail: 'Based on soil NPK: N–Medium, P–Low, K–High. Split Urea in 2 doses.'
  },
  {
    id: 'seed_4', type: 'irrigation',
    date: '2026-07-27T08:30:00Z', crop: 'Sugarcane',
    result: 'Drip irrigation – 35 mm every 3 days',
    confidence: 89, status: 'saved',
    detail: 'ETo = 4.2 mm/day, Kc = 1.25. Soil moisture deficit: 28%. Schedule: Morning 6–8 AM.'
  },
  {
    id: 'seed_5', type: 'soil',
    date: '2026-07-26T16:45:00Z', crop: 'Soybean',
    result: 'Soil Health: Good – Score 78/100',
    confidence: 84, status: 'completed',
    detail: 'N–Medium, P–Low (Needs attention), K–High, pH 7.2. Apply SSP for Phosphorus.'
  },
  {
    id: 'seed_6', type: 'advisory',
    date: '2026-07-25T10:00:00Z', crop: 'Cotton',
    result: 'Full Kharif season advisory generated',
    confidence: 92, status: 'saved',
    detail: 'Irrigation, fertilizer, pest & disease schedule for 180-day cotton season.'
  },
  {
    id: 'seed_7', type: 'disease',
    date: '2026-07-24T13:20:00Z', crop: 'Soybean',
    result: 'Yellow Mosaic Virus – Moderate Risk',
    confidence: 78, status: 'completed',
    detail: 'Whitefly vector control recommended. Apply imidacloprid 70 WS seed treatment.'
  },
  {
    id: 'seed_8', type: 'pest',
    date: '2026-07-23T09:55:00Z', crop: 'Rice',
    result: 'Brown Plant Hopper – Medium Severity',
    confidence: 82, status: 'completed',
    detail: 'BPH population: ~15 hoppers/hill. Apply buprofezin 25 SC at 1 mL/L.'
  },
  {
    id: 'seed_9', type: 'fertilizer',
    date: '2026-07-22T15:10:00Z', crop: 'Onion',
    result: 'NPK 10:26:26 @ 200 kg/ha + Zinc 25 kg/ha',
    confidence: 88, status: 'saved',
    detail: 'Pre-transplant basal dose. Top-dress Urea at 30 & 60 DAT.'
  },
  {
    id: 'seed_10', type: 'irrigation',
    date: '2026-07-21T07:45:00Z', crop: 'Maize',
    result: 'Sprinkler – 25 mm every 4 days',
    confidence: 85, status: 'saved',
    detail: 'Critical stages: knee-high, tasseling, silking. Avoid water stress at these phases.'
  },
  {
    id: 'seed_11', type: 'soil',
    date: '2026-07-20T12:30:00Z', crop: 'Cotton',
    result: 'Soil Health: Moderate – Score 72/100',
    confidence: 84, status: 'completed',
    detail: 'N–Medium, P–Deficient, K–High, pH 7.2. Priority: Phosphorus amendment.'
  },
  {
    id: 'seed_12', type: 'advisory',
    date: '2026-07-19T09:00:00Z', crop: 'Wheat',
    result: 'Rabi season crop schedule prepared',
    confidence: 90, status: 'saved',
    detail: 'Sowing: Oct 15–Nov 5. First irrigation: 21 DAS. Second: 45 DAS. Harvest: Mar.'
  },
  {
    id: 'seed_13', type: 'voice',
    date: '2026-07-18T11:30:00Z', crop: 'General',
    result: 'Query: "कपाशी ला पाणी किती द्यावे?"',
    confidence: null, status: 'completed',
    detail: 'Voice query answered: Cotton requires 600–700 mm seasonal water. 6–8 irrigations.'
  },
  {
    id: 'seed_14', type: 'disease',
    date: '2026-07-17T14:00:00Z', crop: 'Chilli',
    result: 'Anthracnose (Colletotrichum) – Low Risk',
    confidence: 74, status: 'completed',
    detail: 'Early stage fungal infection. Preventive copper oxychloride spray advised.'
  },
  {
    id: 'seed_15', type: 'pest',
    date: '2026-07-16T08:20:00Z', crop: 'Groundnut',
    result: 'Thrips – Low Severity',
    confidence: 71, status: 'completed',
    detail: 'Minor thrips population. Monitor weekly. If worsens, apply spinosad 45 SC.'
  },
  {
    id: 'seed_16', type: 'fertilizer',
    date: '2026-07-15T10:30:00Z', crop: 'Sunflower',
    result: 'Boron 0.5 kg/ha + NPK 12:32:16 basal dose',
    confidence: 86, status: 'saved',
    detail: 'Boron critical for head development. Apply as foliar spray at bud stage.'
  },
  {
    id: 'seed_17', type: 'advisory',
    date: '2026-07-14T09:15:00Z', crop: 'Soybean',
    result: 'Full Kharif advisory – 100-day schedule',
    confidence: 91, status: 'saved',
    detail: 'Seed treatment, sowing date, weed management, and harvest recommendation.'
  },
  {
    id: 'seed_18', type: 'irrigation',
    date: '2026-07-13T07:00:00Z', crop: 'Wheat',
    result: 'Furrow irrigation – 50 mm at CRI + tillering',
    confidence: 93, status: 'saved',
    detail: 'CRI (21 DAS), Tillering (45 DAS), Jointing (65 DAS), Heading (85 DAS).'
  },
];

/* ─── Helpers ───────────────────────────────────────── */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return iso;
  }
}

function formatDateShort(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

/* ─── Load Records ──────────────────────────────────── */
function loadAllRecords() {
  const records = [];

  // 1. Unified history log (written by Save buttons via saveToUnifiedHistory)
  try {
    const raw = localStorage.getItem(KM_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) records.push(...parsed);
    }
  } catch(e) { /* ignore */ }

  // 2. Pest-detection specific history (km_pest_history)
  try {
    const raw = localStorage.getItem(KM_PEST_KEY);
    if (raw) {
      const pestRecs = JSON.parse(raw);
      if (Array.isArray(pestRecs)) {
        pestRecs.forEach(p => {
          // Avoid duplicates already in unified log
          if (!records.find(r => r.id === p.id)) {
            records.push({
              id: p.id,
              type: 'pest',
              date: p.created_at,
              crop: p.affected_crop || 'Unknown Crop',
              result: `${p.pest_name || 'Pest Detected'} – ${p.severity || 'Unknown'} Severity`,
              confidence: p.confidence || null,
              status: 'completed',
              detail: `Risk Score: ${p.risk_score || 'N/A'}. Analysis Mode: ${p.analysis_mode || 'demo'}.`
            });
          }
        });
      }
    }
  } catch(e) { /* ignore */ }

  // 3. If nothing in localStorage, show seed data
  if (records.length === 0) {
    records.push(...SEED_HISTORY);
  }

  // Sort by date desc
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
  return records;
}

/* ─── Save to Unified History ───────────────────────── */
function saveToUnifiedHistory(entry) {
  try {
    const raw = localStorage.getItem(KM_HISTORY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(entry);
    // Keep last 200 records max
    if (existing.length > 200) existing.splice(200);
    localStorage.setItem(KM_HISTORY_KEY, JSON.stringify(existing));
  } catch(e) { /* ignore */ }
}
// Expose globally so other pages' save buttons can call this
window.KM_History = { save: saveToUnifiedHistory };

/* ─── Delete Record ─────────────────────────────────── */
function deleteRecord(id) {
  // Remove from unified log
  try {
    const raw = localStorage.getItem(KM_HISTORY_KEY);
    if (raw) {
      const recs = JSON.parse(raw).filter(r => r.id !== id);
      localStorage.setItem(KM_HISTORY_KEY, JSON.stringify(recs));
    }
  } catch(e) {}
  // Remove from pest log
  try {
    const raw = localStorage.getItem(KM_PEST_KEY);
    if (raw) {
      const recs = JSON.parse(raw).filter(r => r.id !== id);
      localStorage.setItem(KM_PEST_KEY, JSON.stringify(recs));
    }
  } catch(e) {}
  // Also remove from seed data if it was seed and now re-seeded next time; just re-render
  allRecords = allRecords.filter(r => r.id !== id);
  applyFilterAndRender();
  updateStats();
}

/* ─── Stats ─────────────────────────────────────────── */
function updateStats() {
  const counts = { disease: 0, pest: 0, fertilizer: 0, irrigation: 0, soil: 0, advisory: 0, voice: 0 };
  allRecords.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; });
  const total = allRecords.length;

  setEl('stat-total',      total);
  setEl('stat-disease',    counts.disease);
  setEl('stat-pest',       counts.pest);
  setEl('stat-fertilizer', counts.fertilizer);
  setEl('stat-irrigation', counts.irrigation);
  setEl('stat-advisory',   counts.advisory);
  setEl('stat-soil',       counts.soil);
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ─── Filter + Search + Render ─────────────────────── */
function applyFilterAndRender() {
  const query = (document.getElementById('hist-search')?.value || '').toLowerCase().trim();

  filteredRecs = allRecords.filter(r => {
    if (currentFilter !== 'all' && r.type !== currentFilter) return false;
    if (query) {
      const haystack = [r.crop, r.result, r.detail, formatDateShort(r.date), FEATURE_META[r.type]?.label]
        .join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
}

/* ─── Render Table ──────────────────────────────────── */
function renderTable() {
  const tbody = document.getElementById('hist-tbody');
  if (!tbody) return;

  if (filteredRecs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="hist-empty">
            <i class="fas fa-inbox" aria-hidden="true"></i>
            <h3>No history found</h3>
            <p>Try a different filter or start using KrishiMitra AI features.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const end   = Math.min(start + PAGE_SIZE, filteredRecs.length);
  const page  = filteredRecs.slice(start, end);

  tbody.innerHTML = page.map(r => buildRow(r)).join('');

  // Bind expand & delete buttons
  tbody.querySelectorAll('[data-expand]').forEach(btn => {
    btn.addEventListener('click', () => {
      const detailRow = document.getElementById('detail-' + btn.dataset.expand);
      const isOpen = detailRow?.classList.contains('open');
      if (detailRow) {
        detailRow.classList.toggle('open', !isOpen);
        btn.innerHTML = isOpen
          ? '<i class="fas fa-chevron-down"></i>'
          : '<i class="fas fa-chevron-up"></i>';
        btn.title = isOpen ? 'Expand details' : 'Collapse details';
      }
    });
  });

  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delete;
      if (confirm('Delete this history record?')) {
        deleteRecord(id);
      }
    });
  });
}

function buildRow(r) {
  const meta = FEATURE_META[r.type] || { label: r.type, icon: 'fa-circle-dot', cls: 'advisory', color: '#555' };
  const confText = r.confidence != null ? `${r.confidence}%` : '–';
  const statusHtml = r.status === 'saved'
    ? '<span class="status-dot status-dot--saved">Saved</span>'
    : '<span class="status-dot status-dot--completed">Completed</span>';

  return `
    <tr>
      <td style="white-space:nowrap; font-size:0.8rem; color:var(--text-muted);">
        <i class="fas fa-calendar-alt" aria-hidden="true" style="margin-right:4px;"></i>
        ${formatDate(r.date)}
      </td>
      <td>
        <span class="feat-badge feat-badge--${meta.cls}">
          <i class="fas ${meta.icon}" aria-hidden="true"></i>
          ${meta.label}
        </span>
      </td>
      <td style="font-weight:600;">${escHtml(r.crop)}</td>
      <td style="max-width:260px; font-size:0.83rem; color:var(--text-secondary);">${escHtml(r.result)}</td>
      <td>${statusHtml}</td>
      <td>
        <div style="display:flex;gap:4px;align-items:center;">
          ${r.detail
            ? `<button class="hist-expand-btn" data-expand="${r.id}" title="Expand details" aria-label="Expand details for ${escHtml(r.crop)}">
                <i class="fas fa-chevron-down"></i>
               </button>`
            : ''}
          <button class="hist-del-btn" data-delete="${r.id}" title="Delete record" aria-label="Delete this record">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
    ${r.detail ? `
    <tr class="hist-detail-row" id="detail-${r.id}">
      <td colspan="6">
        <div class="hist-detail-content">
          <p><strong>Details:</strong> ${escHtml(r.detail)}</p>
          ${r.confidence != null ? `<p><strong>AI Confidence:</strong> ${r.confidence}%</p>` : ''}
          <p style="margin:0;font-size:0.78rem;color:var(--text-muted);">
            <i class="fas fa-clock" aria-hidden="true"></i> Recorded: ${formatDate(r.date)}
          </p>
        </div>
      </td>
    </tr>` : ''}
  `;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Pagination ─────────────────────────────────────── */
function renderPagination() {
  const total  = filteredRecs.length;
  const pages  = Math.ceil(total / PAGE_SIZE);
  const start  = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end    = Math.min(currentPage * PAGE_SIZE, total);

  const showLabel = document.getElementById('hist-showing-label');
  if (showLabel) showLabel.textContent = `Showing ${start}–${end} of ${total} records`;

  const btnsWrap = document.getElementById('hist-pag-btns');
  if (!btnsWrap) return;

  if (pages <= 1) { btnsWrap.innerHTML = ''; return; }

  let html = `<button class="hist-pag-btn" id="pag-prev" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
    <i class="fas fa-chevron-left" aria-hidden="true"></i>
  </button>`;

  const range = buildPageRange(currentPage, pages);
  range.forEach(p => {
    if (p === '…') {
      html += `<button class="hist-pag-btn" disabled style="cursor:default;">…</button>`;
    } else {
      html += `<button class="hist-pag-btn${p === currentPage ? ' active' : ''}" data-page="${p}" aria-label="Page ${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`;
    }
  });

  html += `<button class="hist-pag-btn" id="pag-next" ${currentPage === pages ? 'disabled' : ''} aria-label="Next page">
    <i class="fas fa-chevron-right" aria-hidden="true"></i>
  </button>`;

  btnsWrap.innerHTML = html;

  btnsWrap.querySelector('#pag-prev')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); } });
  btnsWrap.querySelector('#pag-next')?.addEventListener('click', () => { if (currentPage < pages) { currentPage++; renderTable(); renderPagination(); } });
  btnsWrap.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); renderTable(); renderPagination(); });
  });
}

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('…', total);
  } else if (current >= total - 3) {
    pages.push(1, '…');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total);
  }
  return pages;
}

/* ─── Clear All ─────────────────────────────────────── */
function clearAllHistory() {
  if (!confirm('Delete ALL history records? This cannot be undone.')) return;
  localStorage.removeItem(KM_HISTORY_KEY);
  localStorage.removeItem(KM_PEST_KEY);
  allRecords   = [];
  filteredRecs = [];
  applyFilterAndRender();
  updateStats();
  showToastLocal('All history cleared.', 'info');
}

function showToastLocal(msg, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    // Fallback inline toast
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:9999;
      background:${type === 'info' ? '#1d4ed8' : '#dc2626'};
      color:#fff;padding:12px 20px;border-radius:10px;
      font-size:0.88rem;font-family:Inter,sans-serif;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);
    `;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

/* ─── Animate stats counter ─────────────────────────── */
function animateStat(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 20) || 1;
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(timer);
  }, 40);
}

/* ─── Init ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Load data
  allRecords = loadAllRecords();
  filteredRecs = [...allRecords];

  // Update stats with animation
  const counts = { disease: 0, pest: 0, fertilizer: 0, irrigation: 0, soil: 0, advisory: 0 };
  allRecords.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; });
  setTimeout(() => {
    animateStat('stat-total',      allRecords.length);
    animateStat('stat-disease',    counts.disease);
    animateStat('stat-pest',       counts.pest);
    animateStat('stat-fertilizer', counts.fertilizer);
    animateStat('stat-irrigation', counts.irrigation);
    animateStat('stat-advisory',   counts.advisory);
    animateStat('stat-soil',       counts.soil);
  }, 200);

  // Initial render
  renderTable();
  renderPagination();

  // Search input
  const searchEl = document.getElementById('hist-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => applyFilterAndRender());
  }

  // Filter buttons
  document.querySelectorAll('.hist-filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.hist-filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilterAndRender();
    });
  });

  // Clear all
  document.getElementById('hist-clear-all')?.addEventListener('click', () => clearAllHistory());

  // Sidebar toggle (shared logic like dashboard.js)
  const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
  const sidebar       = document.getElementById('main-sidebar');
  const overlay       = document.getElementById('sidebar-overlay');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar--open');
      if (overlay) overlay.classList.toggle('sidebar-overlay--visible');
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('sidebar--open');
      overlay.classList.remove('sidebar-overlay--visible');
    });
  }

  // Profile dropdown toggle
  const profileTrigger = document.getElementById('profile-dropdown-trigger');
  if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = profileTrigger.getAttribute('aria-expanded') === 'true';
      profileTrigger.setAttribute('aria-expanded', String(!expanded));
      profileTrigger.classList.toggle('open', !expanded);
    });
    document.addEventListener('click', () => {
      profileTrigger.setAttribute('aria-expanded', 'false');
      profileTrigger.classList.remove('open');
    });
  }
});
