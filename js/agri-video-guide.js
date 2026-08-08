/* ============================================================
   KrishiMitra AI – agri-video-guide.js
   Agri Video Guide – Frontend logic for YouTube agricultural video search.

   Features:
     - Calls KrishiMitra backend /api/v1/youtube/search
     - Falls back to direct YouTube search links if backend unavailable
     - Auto-detects Marathi/Hindi/English from input text
     - Renders video cards with relevance scores
     - Debounced search, skeleton loading, toast notifications
   ============================================================ */

'use strict';

(function AgriVideoGuideModule() {

  /* ─── Configuration ─────────────────────────────────────── */
  const API_BASE   = 'http://127.0.0.1:8000/api/v1';
  const DEBOUNCE_MS = 500;

  /* ─── State ─────────────────────────────────────────────── */
  let _currentQuery    = '';
  let _searchController = null;  // AbortController for in-flight requests
  let _debounceTimer   = null;
  let _apiAvailable    = null;   // null = unknown, true/false = checked

  /* ─── DOM refs (resolved after DOMContentLoaded) ─────────── */
  let $input, $searchBtn, $clearBtn, $langSel, $cropSel, $topicSel;
  let $content, $statusBar, $countNum, $apiStatus, $apiStatusText;

  /* ─────────────────────────────────────────────────────────
     LANGUAGE DETECTION
     Detects if text is Marathi/Hindi/English via Unicode range
  ──────────────────────────────────────────────────────────── */
  function detectLanguage(text) {
    if (!text) return 'en';
    // Devanagari range: U+0900–U+097F
    const devanagariChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    if (devanagariChars / text.length > 0.3) {
      // Distinguish Marathi from Hindi by common Marathi function words
      const marathiWords = /आहे|आणि|कसे|माझ्या|पानावर|शेतात|कापूस|सोयाबीन/;
      return marathiWords.test(text) ? 'mr' : 'hi';
    }
    return 'en';
  }

  /* ─────────────────────────────────────────────────────────
     FALLBACK LINK GENERATOR
     Used when backend is offline or API key not configured
  ──────────────────────────────────────────────────────────── */
  function buildFallbackUrl(query, crop, problem) {
    const parts = [];
    if (crop) parts.push(crop);
    parts.push(query);
    if (problem) parts.push(problem);
    parts.push('agriculture India farming');
    const q = encodeURIComponent(parts.join(' ').replace(/\s+/g, ' ').trim());
    return `https://www.youtube.com/results?search_query=${q}`;
  }

  /* ─────────────────────────────────────────────────────────
     DATE FORMATTING
     "3 days ago" from ISO date string
  ──────────────────────────────────────────────────────────── */
  function timeAgo(isoDate) {
    if (!isoDate) return '';
    const diff = (Date.now() - new Date(isoDate)) / 1000;
    if (diff < 86400)     return 'Today';
    if (diff < 172800)    return 'Yesterday';
    const days = Math.floor(diff / 86400);
    if (days < 30)        return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months < 12)      return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }

  /* ─────────────────────────────────────────────────────────
     VIEW COUNT FORMATTING
     1234567 → "1.2M views"
  ──────────────────────────────────────────────────────────── */
  function formatViews(n) {
    if (!n || n <= 0) return '';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
    if (n >= 1_000)     return `${Math.round(n / 1_000)}K views`;
    return `${n} views`;
  }

  /* ─────────────────────────────────────────────────────────
     RELEVANCE BADGE
  ──────────────────────────────────────────────────────────── */
  function relevanceBadge(score) {
    if (score >= 70) return `<span class="avd-card__relevance avd-relevance--high"><i class="fas fa-star"></i> ${score}% Relevant</span>`;
    if (score >= 45) return `<span class="avd-card__relevance avd-relevance--med"><i class="fas fa-star-half-alt"></i> ${score}% Relevant</span>`;
    return `<span class="avd-card__relevance avd-relevance--low"><i class="far fa-star"></i> ${score}% Match</span>`;
  }

  /* ─────────────────────────────────────────────────────────
     THUMBNAIL FALLBACK BUILDER
     Constructs the best available thumbnail URL
  ──────────────────────────────────────────────────────────── */
  function thumbSrc(video) {
    if (video.thumbnail) return video.thumbnail;
    return `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
  }

  /* ─────────────────────────────────────────────────────────
     RENDER SKELETON LOADERS
  ──────────────────────────────────────────────────────────── */
  function renderSkeletons(count = 6) {
    let html = '<div class="avd-grid" aria-busy="true" aria-label="Loading videos">';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="avd-skeleton" aria-hidden="true">
          <div class="avd-skeleton__thumb"></div>
          <div class="avd-skeleton__body">
            <div class="avd-skeleton__line" style="height:12px;width:60%;"></div>
            <div class="avd-skeleton__line" style="height:16px;width:90%;"></div>
            <div class="avd-skeleton__line" style="height:16px;width:75%;"></div>
            <div class="avd-skeleton__line" style="height:11px;width:50%;margin-top:4px;"></div>
          </div>
        </div>`;
    }
    html += '</div>';
    $content.innerHTML = html;
  }

  /* ─────────────────────────────────────────────────────────
     RENDER VIDEO GRID
  ──────────────────────────────────────────────────────────── */
  function renderVideoGrid(videos) {
    if (!videos || videos.length === 0) {
      renderEmptyState();
      return;
    }

    const cards = videos.map(v => `
      <article class="avd-card" aria-label="${escapeHtml(v.title)}">
        <div class="avd-card__thumb-wrap">
          <img
            class="avd-card__thumb"
            src="${escapeHtml(thumbSrc(v))}"
            alt="${escapeHtml(v.title)}"
            loading="lazy"
            onerror="this.src='https://img.youtube.com/vi/${escapeHtml(v.video_id)}/default.jpg'"
          />
          <div class="avd-card__play-overlay" aria-hidden="true">
            <div class="avd-card__play-btn"><i class="fas fa-play"></i></div>
          </div>
          ${v.duration ? `<span class="avd-card__duration">${escapeHtml(v.duration)}</span>` : ''}
        </div>
        <div class="avd-card__body">
          ${relevanceBadge(v.relevance_score)}
          <h3 class="avd-card__title">${escapeHtml(v.title)}</h3>
          <div class="avd-card__channel">
            <i class="fas fa-circle" aria-hidden="true"></i>
            ${escapeHtml(v.channel)}
          </div>
          ${v.description ? `<p class="avd-card__desc">${escapeHtml(v.description)}</p>` : ''}
          <div class="avd-card__meta">
            ${v.view_count > 0 ? `<span><i class="fas fa-eye" aria-hidden="true"></i> ${formatViews(v.view_count)}</span>` : ''}
            ${v.published_at ? `<span><i class="far fa-calendar" aria-hidden="true"></i> ${timeAgo(v.published_at)}</span>` : ''}
          </div>
        </div>
        <div class="avd-card__footer">
          <a
            href="${escapeHtml(v.youtube_url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="avd-card__watch-btn"
            id="avd-watch-${escapeHtml(v.video_id)}"
            aria-label="Watch ${escapeHtml(v.title)} on YouTube"
          >
            <i class="fab fa-youtube" aria-hidden="true"></i>
            Watch on YouTube
          </a>
        </div>
      </article>
    `).join('');

    $content.innerHTML = `<div class="avd-grid" aria-label="Video results">${cards}</div>`;
  }

  /* ─────────────────────────────────────────────────────────
     RENDER STATES
  ──────────────────────────────────────────────────────────── */
  function renderEmptyState() {
    const fallback = buildFallbackUrl($currentQuery, $cropSel.value, $topicSel.value);
    $content.innerHTML = `
      <div class="avd-state" role="status">
        <div class="avd-state__icon">🔍</div>
        <h2 class="avd-state__title">No videos found</h2>
        <p class="avd-state__msg">
          We couldn't find videos matching "<strong>${escapeHtml($currentQuery)}</strong>".
          Try different keywords, or search directly on YouTube.
        </p>
        <a href="${escapeHtml(fallback)}" target="_blank" rel="noopener noreferrer"
           class="avd-state__fallback-btn" id="avd-empty-yt-btn">
          <i class="fab fa-youtube" aria-hidden="true"></i>
          Search on YouTube
        </a>
      </div>`;
  }

  function renderFallbackState(fallbackUrl, message) {
    $content.innerHTML = `
      <div class="avd-state" role="status">
        <div class="avd-state__icon">📺</div>
        <h2 class="avd-state__title">Search on YouTube</h2>
        <p class="avd-state__msg">${escapeHtml(message || 'Click below to search for agricultural videos on YouTube directly.')}</p>
        <a href="${escapeHtml(fallbackUrl)}" target="_blank" rel="noopener noreferrer"
           class="avd-state__fallback-btn" id="avd-fallback-yt-btn">
          <i class="fab fa-youtube" aria-hidden="true"></i>
          Open YouTube Search
        </a>
      </div>`;
  }

  function renderErrorState(message) {
    const fallback = buildFallbackUrl($currentQuery, $cropSel.value, $topicSel.value);
    $content.innerHTML = `
      <div class="avd-state" role="alert">
        <div class="avd-state__icon">⚠️</div>
        <h2 class="avd-state__title">Search Error</h2>
        <p class="avd-state__msg">${escapeHtml(message)}</p>
        <a href="${escapeHtml(fallback)}" target="_blank" rel="noopener noreferrer"
           class="avd-state__fallback-btn" id="avd-error-yt-btn">
          <i class="fab fa-youtube" aria-hidden="true"></i>
          Search on YouTube
        </a>
      </div>`;
  }

  /* ─────────────────────────────────────────────────────────
     STATUS BAR UPDATES
  ──────────────────────────────────────────────────────────── */
  function showStatusBar(count, apiAvailable) {
    $statusBar.style.display = 'flex';
    $countNum.textContent = count;

    if (apiAvailable) {
      $apiStatus.className = 'avd-api-status avd-api-status--live';
      $apiStatusText.textContent = 'Live YouTube Search';
    } else {
      $apiStatus.className = 'avd-api-status avd-api-status--fallback';
      $apiStatusText.textContent = 'Fallback Mode';
    }
  }

  function hideStatusBar() {
    $statusBar.style.display = 'none';
  }

  /* ─────────────────────────────────────────────────────────
     SECURITY: XSS PREVENTION
  ──────────────────────────────────────────────────────────── */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ─────────────────────────────────────────────────────────
     CORE SEARCH FUNCTION
  ──────────────────────────────────────────────────────────── */
  async function performSearch(rawQuery) {
    rawQuery = (rawQuery || '').trim();
    if (!rawQuery) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please enter a search query.', 'warning');
      }
      return;
    }

    _currentQuery = rawQuery;

    // Cancel any in-flight request
    if (_searchController) _searchController.abort();
    _searchController = new AbortController();

    // Auto-detect language if user hasn't explicitly changed it
    const detectedLang = detectLanguage(rawQuery);
    // Only auto-set if the user hasn't manually selected non-English
    if ($langSel.value === 'en' && detectedLang !== 'en') {
      $langSel.value = detectedLang;
    }

    const lang    = $langSel.value;
    const crop    = $cropSel.value;
    const problem = $topicSel.value;

    // UI: loading state
    $searchBtn.disabled = true;
    $searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching…';
    hideStatusBar();
    renderSkeletons(6);

    const params = new URLSearchParams({
      query:    rawQuery,
      language: lang,
      ...(crop    && { crop }),
      ...(problem && { problem }),
    });

    const endpointUrl = `${API_BASE}/youtube/search?${params.toString()}`;

    try {
      const resp = await fetch(endpointUrl, {
        signal: _searchController.signal,
      });

      if (!resp.ok) {
        throw new Error(`Server error ${resp.status}`);
      }

      const data = await resp.json();
      _apiAvailable = data.api_available;

      if (data.api_available && data.videos && data.videos.length > 0) {
        // ✅ Full results from YouTube API
        renderVideoGrid(data.videos);
        showStatusBar(data.total, true);
        if (typeof window.showToast === 'function') {
          window.showToast(`Found ${data.total} relevant videos`, 'success');
        }
      } else if (!data.api_available && data.fallback_url) {
        // ⚠️ API unavailable — show fallback link
        renderFallbackState(data.fallback_url, data.message);
        showStatusBar(0, false);
        if (typeof window.showToast === 'function') {
          window.showToast(data.message || 'Using YouTube search fallback.', 'info');
        }
      } else if (data.videos && data.videos.length === 0) {
        // 🔍 No results but API worked
        renderEmptyState();
        showStatusBar(0, data.api_available);
      } else {
        renderFallbackState(data.fallback_url || buildFallbackUrl(rawQuery, crop, problem), data.message);
        showStatusBar(0, false);
      }

    } catch (err) {
      if (err.name === 'AbortError') return; // Search was cancelled — do nothing

      console.warn('[AgriVideoGuide] Backend unavailable:', err.message);

      // Full client-side fallback
      const fallback = buildFallbackUrl(rawQuery, crop, problem);
      renderFallbackState(fallback,
        'KrishiMitra backend is offline. Click below to search for agricultural videos on YouTube directly.'
      );
      showStatusBar(0, false);

    } finally {
      // Restore button state
      $searchBtn.disabled = false;
      $searchBtn.innerHTML = '<i class="fas fa-play-circle"></i> Find Videos';
    }
  }

  /* ─────────────────────────────────────────────────────────
     DEBOUNCE HELPER
  ──────────────────────────────────────────────────────────── */
  function debounceSearch(query) {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => performSearch(query), DEBOUNCE_MS);
  }

  /* ─────────────────────────────────────────────────────────
     INITIALIZATION
  ──────────────────────────────────────────────────────────── */
  function init() {
    // Resolve DOM references
    $input          = document.getElementById('avd-search-input');
    $searchBtn      = document.getElementById('avd-search-btn');
    $clearBtn       = document.getElementById('avd-clear-btn');
    $langSel        = document.getElementById('avd-lang-select');
    $cropSel        = document.getElementById('avd-crop-select');
    $topicSel       = document.getElementById('avd-topic-select');
    $content        = document.getElementById('avd-content');
    $statusBar      = document.getElementById('avd-status-bar');
    $countNum       = document.getElementById('avd-count-num');
    $apiStatus      = document.getElementById('avd-api-status');
    $apiStatusText  = document.getElementById('avd-api-status-text');

    if (!$input || !$content) return; // Not on this page

    // ── Search button click ──
    $searchBtn.addEventListener('click', () => {
      performSearch($input.value);
    });

    // ── Enter key in search box ──
    $input.addEventListener('keydown', e => {
      if (e.key === 'Enter') performSearch($input.value);
    });

    // ── Show/hide clear button ──
    $input.addEventListener('input', () => {
      const hasValue = $input.value.length > 0;
      $clearBtn.classList.toggle('visible', hasValue);

      // Auto-detect language
      if (hasValue) {
        const lang = detectLanguage($input.value);
        // Only auto-switch if user hasn't picked manually (allow override)
        if (lang !== 'en') $langSel.value = lang;
      }
    });

    // ── Clear button ──
    $clearBtn.addEventListener('click', () => {
      $input.value = '';
      $clearBtn.classList.remove('visible');
      $input.focus();
      hideStatusBar();
      // Restore welcome state
      $content.innerHTML = document.getElementById('avd-welcome-state')?.outerHTML || '';
      // Re-attach welcome chip listeners
      initExampleChips();
    });

    // ── Quick topic pills ──
    document.querySelectorAll('.avd-topic-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.dataset.query;
        if (!query) return;

        // Update active state
        document.querySelectorAll('.avd-topic-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        $input.value = query;
        $clearBtn.classList.add('visible');
        performSearch(query);
      });
    });

    // ── Filter changes trigger re-search if there's a query ──
    [$langSel, $cropSel, $topicSel].forEach(sel => {
      sel.addEventListener('change', () => {
        if ($input.value.trim()) performSearch($input.value);
      });
    });

    // ── Example chips in welcome state ──
    initExampleChips();
  }

  function initExampleChips() {
    document.querySelectorAll('.avd-example-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (!query) return;
        $input.value = query;
        $clearBtn.classList.add('visible');
        performSearch(query);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     ENTRY POINT
     Wait for DOMContentLoaded and then for KrishiMitra
     components to be injected (sidebar, navbar etc.)
  ──────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also expose globally for debugging
  window.AgriVideoGuide = { search: performSearch };

})();
