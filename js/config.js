/**
 * KrishiMitra AI – Frontend Configuration
 * 
 * API Base URL:
 *   - Development: http://localhost:8000
 *   - Production:  https://krishimitra-backend.onrender.com
 */

const CONFIG = {
  // ── API Settings ─────────────────────────────────────────────
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://krishimitra-backend.onrender.com',

  API_VERSION: '/api/v1',

  // ── App Settings ─────────────────────────────────────────────
  APP_NAME: 'KrishiMitra AI',
  APP_VERSION: '1.0.0',

  // ── Feature Flags ─────────────────────────────────────────────
  ENABLE_CHATBOT: true,
  ENABLE_PEST_DETECTION: true,
  ENABLE_WEATHER: true,
  ENABLE_MARKET_PRICE: true,

  // ── Timeout Settings ─────────────────────────────────────────
  API_TIMEOUT_MS: 30000,

  // ── Upload Settings ───────────────────────────────────────────
  MAX_UPLOAD_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// Helper: Get full API endpoint URL
function getApiUrl(endpoint) {
  return `${CONFIG.API_BASE_URL}${CONFIG.API_VERSION}${endpoint}`;
}

// Export for use across all JS files
window.CONFIG = CONFIG;
window.getApiUrl = getApiUrl;
