/* ============================================================
   KrishiMitra AI – language.js
   Complete EN / HI / MR Translation System
   Usage: add data-i18n="key" to any element.
          Changing the <select id="dash-lang-select"> triggers applyLanguage().
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   TRANSLATIONS DICTIONARY
   ============================================================ */
const LANG_STRINGS = {

  /* ─── GLOBAL / SHARED ─────────────────────────────────── */
  'nav.dashboard':        { en: 'Dashboard',          hi: 'डैशबोर्ड',         mr: 'डॅशबोर्ड'        },
  'nav.disease':          { en: 'Crop Disease Detection', hi: 'फसल रोग पहचान',  mr: 'पीक रोग ओळख'    },
  'nav.pest':             { en: 'Pest Radar',          hi: 'कीट रडार',          mr: 'कीड रडार'        },
  'nav.fertilizer':       { en: 'Fertilizer Recommendation', hi: 'उर्वरक सुझाव', mr: 'खत शिफारस'    },
  'nav.irrigation':       { en: 'Irrigation Advisory', hi: 'सिंचाई सलाह',       mr: 'सिंचन सल्ला'    },
  'nav.advisory':         { en: 'Crop Advisory',       hi: 'फसल सलाह',          mr: 'पीक सल्ला'      },
  'nav.soil':             { en: 'PDF & Soil Analysis', hi: 'PDF और मिट्टी विश्लेषण', mr: 'PDF व माती विश्लेषण' },
  'nav.chatbot':          { en: 'AI Chatbot',          hi: 'AI चैटबॉट',         mr: 'AI चॅटबॉट'      },
  'nav.voice':            { en: 'Voice Assistant',     hi: 'वॉइस असिस्टेंट',    mr: 'व्हॉइस सहाय्यक' },
  'nav.weather':          { en: 'Weather Advisory',    hi: 'मौसम सलाह',          mr: 'हवामान सल्ला'   },
  'nav.market':           { en: 'Market Prices',       hi: 'बाजार भाव',          mr: 'बाजारभाव'       },
  'nav.schemes':          { en: 'Government Schemes',  hi: 'सरकारी योजनाएं',    mr: 'सरकारी योजना'   },
  'nav.calendar':         { en: 'Crop Calendar',       hi: 'फसल कैलेंडर',        mr: 'पीक दिनदर्शिका' },
  'nav.history':          { en: 'History',             hi: 'इतिहास',             mr: 'इतिहास'          },
  'nav.notifications':    { en: 'Notifications',       hi: 'सूचनाएं',            mr: 'सूचना'           },
  'nav.settings':         { en: 'Settings',            hi: 'सेटिंग्स',           mr: 'सेटिंग्ज'        },
  'nav.help':             { en: 'Help & Support',      hi: 'सहायता',             mr: 'मदत'             },
  'nav.logout':           { en: 'Logout',              hi: 'लॉग आउट',           mr: 'लॉग आउट'         },

  /* ─── DASHBOARD ───────────────────────────────────────── */
  'dash.page_title':      { en: 'Farmer Dashboard',   hi: 'किसान डैशबोर्ड',     mr: 'शेतकरी डॅशबोर्ड'},
  'dash.breadcrumb_home': { en: 'Home',                hi: 'होम',                mr: 'मुख्यपृष्ठ'     },
  'dash.farm_overview':   { en: 'Farm Overview',       hi: 'खेत का अवलोकन',      mr: 'शेत आढावा'       },
  'dash.season_glance':   { en: 'Your current season at a glance', hi: 'इस सीज़न का संक्षिप्त विवरण', mr: 'या हंगामाचा थोडक्यात आढावा' },
  'dash.active_crops':    { en: 'Active Crops',        hi: 'सक्रिय फसलें',       mr: 'सक्रिय पिके'    },
  'dash.total_analyses':  { en: 'Total AI Analyses',  hi: 'कुल AI विश्लेषण',    mr: 'एकूण AI विश्लेषण'},
  'dash.saved_insights':  { en: 'Saved Insights',      hi: 'सहेजी गई जानकारी',   mr: 'जतन केलेली माहिती'},
  'dash.new_alerts':      { en: 'New Alerts',          hi: 'नई सूचनाएं',          mr: 'नवीन सूचना'     },
  'dash.ai_assistant':    { en: 'AI Agriculture Assistant', hi: 'AI कृषि सहायक', mr: 'AI कृषी सहाय्यक' },
  'dash.choose_service':  { en: 'Choose an AI-powered service to get instant farming guidance.', hi: 'तुरंत कृषि मार्गदर्शन के लिए AI सेवा चुनें।', mr: 'त्वरित शेती मार्गदर्शनासाठी AI सेवा निवडा.' },
  'dash.todays_advisory': { en: "Today's Smart Farming Advisory", hi: 'आज की स्मार्ट कृषि सलाह', mr: 'आजची स्मार्ट शेती सल्ला' },
  'dash.weather':         { en: 'Weather',             hi: 'मौसम',               mr: 'हवामान'          },
  'dash.details':         { en: 'Details',             hi: 'विवरण',              mr: 'तपशील'           },
  'dash.recent_analysis': { en: 'Recent AI Analysis',  hi: 'हालिया AI विश्लेषण', mr: 'अलीकडील AI विश्लेषण'},
  'dash.latest_analyses': { en: 'Your latest AI-powered farm analyses', hi: 'आपके नवीनतम AI कृषि विश्लेषण', mr: 'तुमचे नवीनतम AI शेत विश्लेषण'},
  'dash.view_all':        { en: 'View All',            hi: 'सभी देखें',          mr: 'सर्व पहा'        },
  'dash.crop_health':     { en: 'Crop Health Overview',hi: 'पीक स्वास्थ्य अवलोकन', mr: 'पीक आरोग्य आढावा'},
  'dash.active_crops_season': { en: 'Current season active crops', hi: 'इस सीज़न की सक्रिय फसलें', mr: 'या हंगामातील सक्रिय पिके'},
  'dash.smart_notif':     { en: 'Smart Notifications', hi: 'स्मार्ट सूचनाएं',    mr: 'स्मार्ट सूचना'  },
  'dash.recent_alerts':   { en: 'Recent Alerts',       hi: 'हालिया सतर्कताएं',   mr: 'अलीकडील सूचना'  },
  'dash.view_all_notif':  { en: 'View All Notifications', hi: 'सभी सूचनाएं देखें', mr: 'सर्व सूचना पहा'},
  'dash.manage':          { en: 'Manage',              hi: 'प्रबंधन करें',       mr: 'व्यवस्थापन'      },
  'dash.analyze_crop':    { en: 'Analyze Crop',        hi: 'फसल विश्लेषण करें',  mr: 'पीक विश्लेषण करा'},
  'dash.open_pest_radar': { en: 'Open Pest Radar',     hi: 'कीट रडार खोलें',    mr: 'कीड रडार उघडा'   },
  'dash.get_recommendation': { en: 'Get Recommendation', hi: 'सुझाव लें',       mr: 'शिफारस मिळवा'    },
  'dash.check_irrigation':{ en: 'Check Irrigation',   hi: 'सिंचाई जांचें',      mr: 'सिंचन तपासा'     },
  'dash.analyze_soil':    { en: 'Analyze Soil',        hi: 'मिट्टी विश्लेषण',    mr: 'माती विश्लेषण'   },
  'dash.ask_ai':          { en: 'Ask AI',              hi: 'AI से पूछें',        mr: 'AI ला विचारा'    },
  'dash.start_voice':     { en: 'Start Voice',         hi: 'वॉइस शुरू करें',     mr: 'व्हॉइस सुरू करा'},
  'dash.view_weather':    { en: 'View Weather',        hi: 'मौसम देखें',         mr: 'हवामान पहा'      },
  'dash.updated_today':   { en: 'Updated today',       hi: 'आज अपडेट किया',     mr: 'आज अपडेट'         },
  'dash.demo_data':       { en: 'DEMO DATA',           hi: 'डेमो डेटा',          mr: 'डेमो डेटा'       },
  'dash.view_detailed_weather': { en: 'View Detailed Weather', hi: 'विस्तृत मौसम देखें', mr: 'सविस्तर हवामान पहा'},
  'dash.view_full_history': { en: 'View Full History', hi: 'पूरा इतिहास देखें', mr: 'संपूर्ण इतिहास पहा'},
  'dash.ask_krishimitra': { en: 'Ask KrishiMitra AI', hi: 'KrishiMitra AI से पूछें', mr: 'KrishiMitra AI ला विचारा'},

  /* ─── COLUMN HEADERS ──────────────────────────────────── */
  'table.date':           { en: 'Date',     hi: 'तारीख',    mr: 'तारीख'    },
  'table.crop':           { en: 'Crop',     hi: 'फसल',      mr: 'पीक'      },
  'table.type':           { en: 'Analysis Type', hi: 'विश्लेषण प्रकार', mr: 'विश्लेषण प्रकार'},
  'table.result':         { en: 'Result',   hi: 'परिणाम',   mr: 'निकाल'    },
  'table.confidence':     { en: 'Confidence', hi: 'विश्वास', mr: 'विश्वास' },
  'table.status':         { en: 'Status',   hi: 'स्थिति',   mr: 'स्थिती'   },

  /* ─── WEATHER WIDGET ──────────────────────────────────── */
  'weather.humidity':     { en: 'Humidity', hi: 'आर्द्रता', mr: 'आर्द्रता' },
  'weather.rain':         { en: 'Rain',     hi: 'बारिश',    mr: 'पाऊस'     },
  'weather.wind':         { en: 'Wind',     hi: 'हवा',      mr: 'वारा'     },

  /* ─── ADVISORY ────────────────────────────────────────── */
  'advisory.weather_cat': { en: 'Weather',  hi: 'मौसम',     mr: 'हवामान'   },
  'advisory.crop_health': { en: 'Crop Health', hi: 'फसल स्वास्थ्य', mr: 'पीक आरोग्य'},
  'advisory.fertilizer':  { en: 'Fertilizer',hi: 'उर्वरक',  mr: 'खत'       },
  'priority.high':        { en: 'High',     hi: 'उच्च',     mr: 'उच्च'     },
  'priority.medium':      { en: 'Medium',   hi: 'मध्यम',   mr: 'मध्यम'    },
  'priority.low':         { en: 'Low',      hi: 'कम',       mr: 'कमी'      },

  /* ─── CHATBOT ─────────────────────────────────────────── */
  'chatbot.title':        { en: 'KrishiMitra AI Chat', hi: 'KrishiMitra AI चैट', mr: 'KrishiMitra AI चॅट'},
  'chatbot.placeholder':  { en: 'Ask me anything about farming…', hi: 'खेती के बारे में कुछ भी पूछें…', mr: 'शेतीबद्दल काहीही विचारा…'},
  'chatbot.send':         { en: 'Send',     hi: 'भेजें',    mr: 'पाठवा'    },
  'chatbot.new_chat':     { en: 'New Chat', hi: 'नई चैट',   mr: 'नवीन चॅट' },

  /* ─── VOICE ASSISTANT ─────────────────────────────────── */
  'voice.title':          { en: 'Voice Assistant', hi: 'वॉइस असिस्टेंट', mr: 'व्हॉइस सहाय्यक'},
  'voice.tap_to_speak':   { en: 'Tap to Speak',  hi: 'बोलने के लिए टैप करें', mr: 'बोलण्यासाठी टॅप करा'},
  'voice.listening':      { en: 'Listening…',    hi: 'सुन रहा हूँ…',      mr: 'ऐकत आहे…'        },
  'voice.processing':     { en: 'Processing…',   hi: 'प्रोसेस हो रहा है…', mr: 'प्रक्रिया होत आहे…'},

  /* ─── SETTINGS ────────────────────────────────────────── */
  'settings.title':       { en: 'Settings',      hi: 'सेटिंग्स',          mr: 'सेटिंग्ज'         },
  'settings.profile':     { en: 'Profile',       hi: 'प्रोफ़ाइल',          mr: 'प्रोफाइल'         },
  'settings.language':    { en: 'Language',      hi: 'भाषा',               mr: 'भाषा'             },
  'settings.notifications': { en: 'Notifications', hi: 'सूचनाएं',          mr: 'सूचना'            },
  'settings.farm_details':{ en: 'Farm Details',  hi: 'खेत की जानकारी',    mr: 'शेताचा तपशील'     },
  'settings.save':        { en: 'Save Changes',  hi: 'बदलाव सहेजें',       mr: 'बदल जतन करा'      },

  /* ─── COMMON ACTIONS ──────────────────────────────────── */
  'btn.download_pdf':     { en: 'Download PDF',  hi: 'PDF डाउनलोड करें',  mr: 'PDF डाउनलोड करा'  },
  'btn.analyze':          { en: 'Analyze',       hi: 'विश्लेषण करें',      mr: 'विश्लेषण करा'      },
  'btn.save':             { en: 'Save',          hi: 'सहेजें',             mr: 'जतन करा'           },
  'btn.close':            { en: 'Close',         hi: 'बंद करें',           mr: 'बंद करा'           },
  'btn.view_details':     { en: 'View Details',  hi: 'विवरण देखें',        mr: 'तपशील पहा'         },
  'btn.back':             { en: 'Back',          hi: 'वापस',               mr: 'मागे'              },
  'btn.apply_now':        { en: 'Apply Now',     hi: 'अभी आवेदन करें',     mr: 'आत्ता अर्ज करा'   },
  'btn.learn_more':       { en: 'Learn More',    hi: 'अधिक जानें',         mr: 'अधिक जाणून घ्या'  },
  'label.loading':        { en: 'Loading…',      hi: 'लोड हो रहा है…',     mr: 'लोड होत आहे…'     },
};

/* ════════════════════════════════════════════════════════════
   CORE TRANSLATOR
   ============================================================ */

/**
 * Get current active language code (en | hi | mr)
 */
function getCurrentLang() {
  return localStorage.getItem('km_language') || 'en';
}

/**
 * Translate a single key for the current language.
 * Falls back to English, then the key itself.
 */
function t(key, lang = null) {
  const l = lang || getCurrentLang();
  const entry = LANG_STRINGS[key];
  if (!entry) return key;
  return entry[l] || entry['en'] || key;
}

/**
 * Apply language to all elements that have a data-i18n attribute.
 * Supports:
 *   data-i18n="key"             → sets textContent
 *   data-i18n-placeholder="key" → sets placeholder
 *   data-i18n-title="key"       → sets title
 *   data-i18n-aria="key"        → sets aria-label
 */
function applyLanguage(lang) {
  lang = lang || getCurrentLang();
  localStorage.setItem('km_language', lang);

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key, lang);
    if (translation !== key) el.textContent = translation;
  });

  // Placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = t(key, lang);
    if (translation !== key) el.placeholder = translation;
  });

  // Title attribute
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translation = t(key, lang);
    if (translation !== key) el.title = translation;
  });

  // Aria-label
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const translation = t(key, lang);
    if (translation !== key) el.setAttribute('aria-label', translation);
  });

  // Update <html lang> attribute
  document.documentElement.lang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en';

  // Dispatch event so other scripts can react
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Initialize language selectors across ALL pages.
 * Call this from DOMContentLoaded in any page.
 */
function initLanguageSystem() {
  const saved = getCurrentLang();

  // Set all language selects to saved value
  document.querySelectorAll('.km-lang-select, #dash-lang-select').forEach(sel => {
    sel.value = saved;
    sel.addEventListener('change', function () {
      applyLanguage(this.value);
    });
  });

  // Apply on page load
  applyLanguage(saved);
}

/* ════════════════════════════════════════════════════════════
   AUTO-INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', initLanguageSystem);

/* ════════════════════════════════════════════════════════════
   EXPORTS (for modules / direct calls)
   ============================================================ */
window.KM_Lang = { t, applyLanguage, getCurrentLang, initLanguageSystem, LANG_STRINGS };
