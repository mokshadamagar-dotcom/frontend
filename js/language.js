/* ============================================================
   KrishiMitra AI – language.js  (v2 – Full Multilingual System)
   Complete EN / HI / MR Translation System
   Usage: add data-i18n="key" to any element.
          Changing any <select class="km-lang-select"> or
          #dash-lang-select triggers applyLanguage() globally.
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   COMPREHENSIVE TRANSLATIONS DICTIONARY
   ============================================================ */
const LANG_STRINGS = {

  /* ─── GLOBAL / SHARED ──────────────────────────────────── */
  'nav.dashboard':        { en: 'Dashboard',                  hi: 'डैशबोर्ड',              mr: 'डॅशबोर्ड'            },
  'nav.disease':          { en: 'Crop Disease Detection',     hi: 'फसल रोग पहचान',         mr: 'पीक रोग ओळख'         },
  'nav.pest':             { en: 'Pest Radar',                 hi: 'कीट रडार',               mr: 'कीड रडार'             },
  'nav.fertilizer':       { en: 'Fertilizer Recommendation',  hi: 'उर्वरक सुझाव',           mr: 'खत शिफारस'            },
  'nav.irrigation':       { en: 'Irrigation Advisory',        hi: 'सिंचाई सलाह',             mr: 'सिंचन सल्ला'          },
  'nav.advisory':         { en: 'Crop Advisory',              hi: 'फसल सलाह',               mr: 'पीक सल्ला'            },
  'nav.soil':             { en: 'PDF & Soil Analysis',        hi: 'PDF और मिट्टी विश्लेषण', mr: 'PDF व माती विश्लेषण' },
  'nav.chatbot':          { en: 'AI Chatbot',                 hi: 'AI चैटबॉट',              mr: 'AI चॅटबॉट'            },
  'nav.voice':            { en: 'Voice Assistant',            hi: 'वॉइस असिस्टेंट',          mr: 'व्हॉइस सहाय्यक'        },
  'nav.weather':          { en: 'Weather Advisory',           hi: 'मौसम सलाह',               mr: 'हवामान सल्ला'          },
  'nav.market':           { en: 'Market Prices',              hi: 'बाजार भाव',               mr: 'बाजारभाव'             },
  'nav.schemes':          { en: 'Government Schemes',         hi: 'सरकारी योजनाएं',          mr: 'सरकारी योजना'          },
  'nav.calendar':         { en: 'Crop Calendar',              hi: 'फसल कैलेंडर',             mr: 'पीक दिनदर्शिका'         },
  'nav.history':          { en: 'History',                    hi: 'इतिहास',                  mr: 'इतिहास'               },
  'nav.notifications':    { en: 'Notifications',              hi: 'सूचनाएं',                 mr: 'सूचना'                },
  'nav.settings':         { en: 'Settings',                   hi: 'सेटिंग्स',                mr: 'सेटिंग्ज'             },
  'nav.help':             { en: 'Help & Support',             hi: 'सहायता',                  mr: 'मदत'                  },
  'nav.logout':           { en: 'Logout',                     hi: 'लॉग आउट',                 mr: 'लॉग आउट'              },
  'nav.profile':          { en: 'My Profile',                 hi: 'मेरी प्रोफ़ाइल',           mr: 'माझे प्रोफाइल'         },
  'nav.main':             { en: 'Main',                       hi: 'मुख्य',                   mr: 'मुख्य'                },
  'nav.ai_agriculture':   { en: 'AI Agriculture',             hi: 'AI कृषि',                 mr: 'AI शेती'              },
  'nav.ai_tools':         { en: 'AI Tools',                   hi: 'AI टूल्स',                mr: 'AI साधने'             },
  'nav.insights':         { en: 'Insights',                   hi: 'जानकारी',                 mr: 'माहिती'               },
  'nav.personal':         { en: 'Personal',                   hi: 'व्यक्तिगत',               mr: 'वैयक्तिक'             },
  'nav.tagline':          { en: 'AI Agriculture Advisor',     hi: 'AI कृषि सलाहकार',         mr: 'AI कृषी सल्लागार'     },

  /* ─── SIDEBAR BOTTOM ACTIONS ──────────────────────────── */
  'sidebar.pdf_soil':     { en: 'PDF & Soil Analysis',        hi: 'PDF और मिट्टी विश्लेषण', mr: 'PDF व माती विश्लेषण' },

  /* ─── NAVBAR / TOPBAR ──────────────────────────────────── */
  'topbar.my_profile':    { en: 'My Profile',                 hi: 'मेरी प्रोफ़ाइल',           mr: 'माझे प्रोफाइल'         },
  'topbar.settings':      { en: 'Settings',                   hi: 'सेटिंग्स',                mr: 'सेटिंग्ज'             },
  'topbar.help_support':  { en: 'Help & Support',             hi: 'सहायता',                  mr: 'मदत'                  },
  'topbar.logout':        { en: 'Logout',                     hi: 'लॉग आउट',                 mr: 'लॉग आउट'              },
  'topbar.notifications': { en: 'Notifications',              hi: 'सूचनाएं',                 mr: 'सूचना'                },

  /* ─── AUTH – LOGIN ──────────────────────────────────────── */
  'login.welcome_back':   { en: 'Welcome Back!',              hi: 'वापस आपका स्वागत है!',    mr: 'परत आपले स्वागत आहे!' },
  'login.subtitle':       { en: 'Sign in to your KrishiMitra AI account', hi: 'अपने KrishiMitra AI अकाउंट में साइन इन करें', mr: 'तुमच्या KrishiMitra AI खात्यात साइन इन करा' },
  'login.email_label':    { en: 'Email Address',              hi: 'ईमेल पता',                mr: 'ईमेल पत्ता'            },
  'login.email_ph':       { en: 'Enter your email',           hi: 'ईमेल दर्ज करें',           mr: 'ईमेल प्रविष्ट करा'     },
  'login.password_label': { en: 'Password',                   hi: 'पासवर्ड',                 mr: 'पासवर्ड'              },
  'login.password_ph':    { en: 'Enter your password',        hi: 'पासवर्ड दर्ज करें',        mr: 'पासवर्ड प्रविष्ट करा'  },
  'login.remember_me':    { en: 'Remember me',                hi: 'मुझे याद रखें',            mr: 'मला लक्षात ठेवा'       },
  'login.forgot_pass':    { en: 'Forgot Password?',           hi: 'पासवर्ड भूल गए?',          mr: 'पासवर्ड विसरलात?'       },
  'login.btn_login':      { en: 'Sign In',                    hi: 'साइन इन करें',             mr: 'साइन इन करा'           },
  'login.no_account':     { en: "Don't have an account?",     hi: 'अकाउंट नहीं है?',          mr: 'खाते नाही?'            },
  'login.register':       { en: 'Create Account',             hi: 'अकाउंट बनाएं',             mr: 'खाते तयार करा'          },
  'login.or_demo':        { en: 'Or continue with Demo',      hi: 'या डेमो के साथ जारी रखें',  mr: 'किंवा डेमोसह सुरू ठेवा'},
  'login.demo_btn':       { en: 'Demo Farmer Login',          hi: 'डेमो किसान लॉगिन',         mr: 'डेमो शेतकरी लॉगिन'     },
  'login.empowering':     { en: 'Empowering Farmers with Artificial Intelligence.', hi: 'कृत्रिम बुद्धिमत्ता से किसानों को सशक्त बनाना।', mr: 'कृत्रिम बुद्धिमत्तेने शेतकऱ्यांना सक्षम करणे.' },

  /* ─── AUTH – REGISTER ───────────────────────────────────── */
  'reg.title':            { en: 'Create Your Account',        hi: 'अपना अकाउंट बनाएं',        mr: 'तुमचे खाते तयार करा'   },
  'reg.subtitle':         { en: 'Join thousands of Indian farmers using AI', hi: 'हजारों किसानों से जुड़ें जो AI का उपयोग कर रहे हैं', mr: 'AI वापरणाऱ्या हजारो शेतकऱ्यांत सामील व्हा' },
  'reg.full_name':        { en: 'Full Name',                  hi: 'पूरा नाम',                 mr: 'पूर्ण नाव'             },
  'reg.name_ph':          { en: 'Enter your full name',       hi: 'अपना पूरा नाम दर्ज करें',  mr: 'तुमचे पूर्ण नाव प्रविष्ट करा' },
  'reg.email_label':      { en: 'Email Address',              hi: 'ईमेल पता',                mr: 'ईमेल पत्ता'            },
  'reg.email_ph':         { en: 'Enter your email',           hi: 'ईमेल दर्ज करें',           mr: 'ईमेल प्रविष्ट करा'     },
  'reg.phone_label':      { en: 'Mobile Number',              hi: 'मोबाइल नंबर',              mr: 'मोबाइल नंबर'           },
  'reg.phone_ph':         { en: 'Enter 10-digit mobile number', hi: '10 अंकों का नंबर दर्ज करें', mr: '10 अंकी मोबाइल नंबर प्रविष्ट करा' },
  'reg.password_label':   { en: 'Password',                   hi: 'पासवर्ड',                 mr: 'पासवर्ड'              },
  'reg.password_ph':      { en: 'Create a strong password',   hi: 'मजबूत पासवर्ड बनाएं',      mr: 'मजबूत पासवर्ड तयार करा'},
  'reg.state_label':      { en: 'State',                      hi: 'राज्य',                   mr: 'राज्य'                },
  'reg.state_ph':         { en: 'Select your state',          hi: 'अपना राज्य चुनें',          mr: 'तुमचे राज्य निवडा'     },
  'reg.role_label':       { en: 'I am a',                     hi: 'मैं हूं',                  mr: 'मी आहे'                },
  'reg.btn_register':     { en: 'Create Account',             hi: 'अकाउंट बनाएं',             mr: 'खाते तयार करा'          },
  'reg.have_account':     { en: 'Already have an account?',   hi: 'पहले से अकाउंट है?',       mr: 'आधीच खाते आहे?'         },
  'reg.sign_in':          { en: 'Sign In',                    hi: 'साइन इन करें',             mr: 'साइन इन करा'           },
  'reg.agree_terms':      { en: 'I agree to the Terms & Conditions', hi: 'मैं नियम और शर्तों से सहमत हूं', mr: 'मी नियम व अटींशी सहमत आहे' },

  /* ─── DASHBOARD ─────────────────────────────────────────── */
  'dash.page_title':          { en: 'Farmer Dashboard',            hi: 'किसान डैशबोर्ड',          mr: 'शेतकरी डॅशबोर्ड'      },
  'dash.breadcrumb_home':     { en: 'Home',                         hi: 'होम',                     mr: 'मुख्यपृष्ठ'            },
  'dash.farm_overview':       { en: 'Farm Overview',                hi: 'खेत का अवलोकन',            mr: 'शेत आढावा'             },
  'dash.season_glance':       { en: 'Your current season at a glance', hi: 'इस सीज़न का संक्षिप्त विवरण', mr: 'या हंगामाचा थोडक्यात आढावा' },
  'dash.active_crops':        { en: 'Active Crops',                 hi: 'सक्रिय फसलें',             mr: 'सक्रिय पिके'           },
  'dash.total_analyses':      { en: 'Total AI Analyses',            hi: 'कुल AI विश्लेषण',          mr: 'एकूण AI विश्लेषण'      },
  'dash.saved_insights':      { en: 'Saved Insights',               hi: 'सहेजी गई जानकारी',         mr: 'जतन केलेली माहिती'     },
  'dash.new_alerts':          { en: 'New Alerts',                   hi: 'नई सूचनाएं',               mr: 'नवीन सूचना'            },
  'dash.ai_assistant':        { en: 'AI Agriculture Assistant',     hi: 'AI कृषि सहायक',            mr: 'AI कृषी सहाय्यक'       },
  'dash.choose_service':      { en: 'Choose an AI-powered service to get instant farming guidance.', hi: 'तुरंत कृषि मार्गदर्शन के लिए AI सेवा चुनें।', mr: 'त्वरित शेती मार्गदर्शनासाठी AI सेवा निवडा.' },
  'dash.todays_advisory':     { en: "Today's Smart Farming Advisory", hi: 'आज की स्मार्ट कृषि सलाह', mr: 'आजची स्मार्ट शेती सल्ला' },
  'dash.weather':             { en: 'Weather',                      hi: 'मौसम',                    mr: 'हवामान'                },
  'dash.details':             { en: 'Details',                      hi: 'विवरण',                   mr: 'तपशील'                 },
  'dash.recent_analysis':     { en: 'Recent AI Analysis',           hi: 'हालिया AI विश्लेषण',       mr: 'अलीकडील AI विश्लेषण'   },
  'dash.latest_analyses':     { en: 'Your latest AI-powered farm analyses', hi: 'आपके नवीनतम AI कृषि विश्लेषण', mr: 'तुमचे नवीनतम AI शेत विश्लेषण' },
  'dash.view_all':            { en: 'View All',                     hi: 'सभी देखें',                mr: 'सर्व पहा'              },
  'dash.crop_health':         { en: 'Crop Health Overview',         hi: 'पीक स्वास्थ्य अवलोकन',     mr: 'पीक आरोग्य आढावा'      },
  'dash.active_crops_season': { en: 'Current season active crops',  hi: 'इस सीज़न की सक्रिय फसलें', mr: 'या हंगामातील सक्रिय पिके' },
  'dash.smart_notif':         { en: 'Smart Notifications',          hi: 'स्मार्ट सूचनाएं',           mr: 'स्मार्ट सूचना'          },
  'dash.recent_alerts':       { en: 'Recent Alerts',                hi: 'हालिया सतर्कताएं',          mr: 'अलीकडील सूचना'         },
  'dash.view_all_notif':      { en: 'View All Notifications',       hi: 'सभी सूचनाएं देखें',         mr: 'सर्व सूचना पहा'         },
  'dash.manage':              { en: 'Manage',                       hi: 'प्रबंधन करें',              mr: 'व्यवस्थापन'             },
  'dash.analyze_crop':        { en: 'Analyze Crop',                 hi: 'फसल विश्लेषण करें',         mr: 'पीक विश्लेषण करा'       },
  'dash.open_pest_radar':     { en: 'Open Pest Radar',              hi: 'कीट रडार खोलें',            mr: 'कीड रडार उघडा'          },
  'dash.get_recommendation':  { en: 'Get Recommendation',           hi: 'सुझाव लें',                mr: 'शिफारस मिळवा'           },
  'dash.check_irrigation':    { en: 'Check Irrigation',             hi: 'सिंचाई जांचें',             mr: 'सिंचन तपासा'            },
  'dash.analyze_soil':        { en: 'Analyze Soil',                 hi: 'मिट्टी विश्लेषण',           mr: 'माती विश्लेषण'          },
  'dash.ask_ai':              { en: 'Ask AI',                       hi: 'AI से पूछें',               mr: 'AI ला विचारा'           },
  'dash.start_voice':         { en: 'Start Voice',                  hi: 'वॉइस शुरू करें',            mr: 'व्हॉइस सुरू करा'         },
  'dash.view_weather':        { en: 'View Weather',                 hi: 'मौसम देखें',                mr: 'हवामान पहा'             },
  'dash.updated_today':       { en: 'Updated today',                hi: 'आज अपडेट किया',             mr: 'आज अपडेट'              },
  'dash.demo_data':           { en: 'DEMO DATA',                    hi: 'डेमो डेटा',                 mr: 'डेमो डेटा'             },
  'dash.view_detailed_weather': { en: 'View Detailed Weather',      hi: 'विस्तृत मौसम देखें',        mr: 'सविस्तर हवामान पहा'     },
  'dash.view_full_history':   { en: 'View Full History',            hi: 'पूरा इतिहास देखें',          mr: 'संपूर्ण इतिहास पहा'     },
  'dash.ask_krishimitra':     { en: 'Ask KrishiMitra AI',           hi: 'KrishiMitra AI से पूछें',   mr: 'KrishiMitra AI ला विचारा' },
  'dash.powered_by_ai':       { en: 'Powered by AI',                hi: 'AI द्वारा संचालित',          mr: 'AI द्वारे चालित'        },
  'dash.crop_disease_card':   { en: 'Crop Disease Detection',       hi: 'फसल रोग पहचान',             mr: 'पीक रोग ओळख'           },
  'dash.crop_disease_desc':   { en: 'Upload a leaf photo for instant AI disease analysis', hi: 'AI रोग विश्लेषण के लिए पत्ती की तस्वीर अपलोड करें', mr: 'AI रोग विश्लेषणासाठी पानाचा फोटो अपलोड करा' },
  'dash.pest_radar_card':     { en: 'Pest Radar',                   hi: 'कीट रडार',                  mr: 'कीड रडार'              },
  'dash.pest_radar_desc':     { en: 'Identify and manage crop pests with AI precision', hi: 'AI सटीकता से फसल कीटों की पहचान करें', mr: 'AI अचूकतेने पीक कीडींची ओळख करा' },
  'dash.fertilizer_card':     { en: 'Fertilizer Recommendation',    hi: 'उर्वरक सिफारिश',            mr: 'खत शिफारस'             },
  'dash.fertilizer_desc':     { en: 'Get NPK-based customized fertilizer plan', hi: 'NPK आधारित अनुकूलित उर्वरक योजना प्राप्त करें', mr: 'NPK आधारित सानुकूल खत योजना मिळवा' },
  'dash.irrigation_card':     { en: 'Irrigation Advisory',          hi: 'सिंचाई सलाह',               mr: 'सिंचन सल्ला'            },
  'dash.irrigation_desc':     { en: 'Smart water scheduling based on weather & soil', hi: 'मौसम और मिट्टी के आधार पर स्मार्ट पानी शेड्यूल', mr: 'हवामान आणि मातीनुसार स्मार्ट पाणी वेळापत्रक' },
  'dash.soil_card':           { en: 'PDF & Soil Analysis',          hi: 'PDF और मिट्टी विश्लेषण',   mr: 'PDF व माती विश्लेषण'   },
  'dash.soil_desc':           { en: 'Upload soil reports for AI-powered diagnostics', hi: 'AI निदान के लिए मिट्टी रिपोर्ट अपलोड करें', mr: 'AI निदानासाठी माती रिपोर्ट अपलोड करा' },
  'dash.chatbot_card':        { en: 'AI Chatbot',                   hi: 'AI चैटबॉट',                mr: 'AI चॅटबॉट'             },
  'dash.chatbot_desc':        { en: 'Ask farming questions in your language', hi: 'अपनी भाषा में कृषि प्रश्न पूछें', mr: 'तुमच्या भाषेत शेती प्रश्न विचारा' },
  'dash.voice_card':          { en: 'Voice Assistant',              hi: 'वॉइस असिस्टेंट',            mr: 'व्हॉइस सहाय्यक'         },
  'dash.voice_desc':          { en: 'Speak your farming query aloud', hi: 'अपनी कृषि समस्या बोलें',  mr: 'तुमची शेती समस्या बोला'  },
  'dash.weather_card':        { en: 'Weather Advisory',             hi: 'मौसम सलाह',                 mr: 'हवामान सल्ला'           },
  'dash.weather_desc':        { en: 'Hyperlocal 7-day weather forecast', hi: '7 दिनों का स्थानीय मौसम पूर्वानुमान', mr: '7 दिवसांचा स्थानिक हवामान अंदाज' },

  /* ─── COLUMN HEADERS ────────────────────────────────────── */
  'table.date':           { en: 'Date',           hi: 'तारीख',           mr: 'तारीख'           },
  'table.crop':           { en: 'Crop',           hi: 'फसल',             mr: 'पीक'             },
  'table.type':           { en: 'Analysis Type',  hi: 'विश्लेषण प्रकार', mr: 'विश्लेषण प्रकार' },
  'table.result':         { en: 'Result',         hi: 'परिणाम',          mr: 'निकाल'           },
  'table.confidence':     { en: 'Confidence',     hi: 'विश्वास',         mr: 'विश्वास'          },
  'table.status':         { en: 'Status',         hi: 'स्थिति',          mr: 'स्थिती'           },
  'table.actions':        { en: 'Actions',        hi: 'क्रियाएं',         mr: 'क्रिया'           },

  /* ─── WEATHER WIDGET ────────────────────────────────────── */
  'weather.humidity':     { en: 'Humidity',       hi: 'आर्द्रता',        mr: 'आर्द्रता'         },
  'weather.rain':         { en: 'Rain',           hi: 'बारिश',           mr: 'पाऊस'            },
  'weather.wind':         { en: 'Wind',           hi: 'हवा',             mr: 'वारा'            },
  'weather.feels_like':   { en: 'Feels Like',     hi: 'महसूस होता है',    mr: 'जाणवते'          },
  'weather.sunny':        { en: 'Partly Sunny',   hi: 'आंशिक धूप',       mr: 'अंशतः उन्हाळा'   },
  'weather.tomorrow':     { en: 'Tomorrow',       hi: 'कल',              mr: 'उद्या'           },
  'weather.forecast':     { en: '7-Day Forecast', hi: '7 दिनों का पूर्वानुमान', mr: '7 दिवसांचा अंदाज' },

  /* ─── ADVISORY ──────────────────────────────────────────── */
  'advisory.weather_cat': { en: 'Weather',        hi: 'मौसम',            mr: 'हवामान'          },
  'advisory.crop_health': { en: 'Crop Health',    hi: 'फसल स्वास्थ्य',   mr: 'पीक आरोग्य'      },
  'advisory.fertilizer':  { en: 'Fertilizer',     hi: 'उर्वरक',          mr: 'खत'              },
  'priority.high':        { en: 'High',           hi: 'उच्च',            mr: 'उच्च'            },
  'priority.medium':      { en: 'Medium',         hi: 'मध्यम',           mr: 'मध्यम'           },
  'priority.low':         { en: 'Low',            hi: 'कम',              mr: 'कमी'             },

  /* ─── CHATBOT ───────────────────────────────────────────── */
  'chatbot.title':        { en: 'KrishiMitra AI Chat', hi: 'KrishiMitra AI चैट', mr: 'KrishiMitra AI चॅट' },
  'chatbot.subtitle':     { en: 'AI-Powered Agriculture Assistant', hi: 'AI कृषि सहायक', mr: 'AI कृषी सहाय्यक' },
  'chatbot.placeholder':  { en: 'Ask me anything about farming…', hi: 'खेती के बारे में कुछ भी पूछें…', mr: 'शेतीबद्दल काहीही विचारा…' },
  'chatbot.send':         { en: 'Send',           hi: 'भेजें',           mr: 'पाठवा'           },
  'chatbot.new_chat':     { en: 'New Chat',       hi: 'नई चैट',          mr: 'नवीन चॅट'        },
  'chatbot.clear':        { en: 'Clear',          hi: 'साफ करें',        mr: 'साफ करा'         },
  'chatbot.history':      { en: 'Chat History',   hi: 'चैट इतिहास',      mr: 'चॅट इतिहास'      },
  'chatbot.select_lang':  { en: 'Select Language', hi: 'भाषा चुनें',     mr: 'भाषा निवडा'       },
  'chatbot.typing':       { en: 'KrishiMitra AI is typing…', hi: 'KrishiMitra AI टाइप कर रहा है…', mr: 'KrishiMitra AI टाइप करत आहे…' },
  'chatbot.today':        { en: 'Today',          hi: 'आज',              mr: 'आज'              },
  'chatbot.no_chats':     { en: 'No conversations yet',    hi: 'अभी कोई बातचीत नहीं',  mr: 'अद्याप कोणतीही संभाषणे नाहीत' },
  'chatbot.ai_badge':     { en: 'AI',             hi: 'AI',              mr: 'AI'              },
  'chatbot.attach_img':   { en: 'Attach crop photo', hi: 'फसल फोटो संलग्न करें', mr: 'पीक फोटो जोडा' },
  'chatbot.suggestions':  { en: 'Suggestions',   hi: 'सुझाव',           mr: 'सूचना'           },

  /* ─── VOICE ASSISTANT ───────────────────────────────────── */
  'voice.title':          { en: 'Voice Assistant',        hi: 'वॉइस असिस्टेंट',          mr: 'व्हॉइस सहाय्यक'         },
  'voice.subtitle':       { en: 'Speak in your language – get instant farming advice', hi: 'अपनी भाषा में बोलें – तुरंत कृषि सलाह पाएं', mr: 'तुमच्या भाषेत बोला – त्वरित शेती सल्ला मिळवा' },
  'voice.tap_to_speak':   { en: 'Tap to Speak',           hi: 'बोलने के लिए टैप करें',    mr: 'बोलण्यासाठी टॅप करा'    },
  'voice.listening':      { en: 'Listening…',             hi: 'सुन रहा हूँ…',             mr: 'ऐकत आहे…'              },
  'voice.processing':     { en: 'Processing…',            hi: 'प्रोसेस हो रहा है…',        mr: 'प्रक्रिया होत आहे…'      },
  'voice.speaking':       { en: 'Speaking response…',     hi: 'जवाब बोल रहा हूँ…',        mr: 'उत्तर बोलत आहे…'         },
  'voice.select_lang':    { en: 'Select Voice Language',  hi: 'वॉइस भाषा चुनें',          mr: 'व्हॉइस भाषा निवडा'       },
  'voice.history':        { en: 'Voice History',          hi: 'वॉइस इतिहास',              mr: 'व्हॉइस इतिहास'           },
  'voice.tips':           { en: 'Tips for better results', hi: 'बेहतर परिणाम के लिए सुझाव', mr: 'चांगल्या परिणामांसाठी टिप्स' },
  'voice.try_asking':     { en: 'Try asking',             hi: 'यह पूछकर देखें',           mr: 'हे विचारून पाहा'          },

  /* ─── CROP DISEASE ──────────────────────────────────────── */
  'disease.title':        { en: 'AI Crop Disease Detection',  hi: 'AI फसल रोग पहचान',      mr: 'AI पीक रोग ओळख'          },
  'disease.upload_title': { en: 'Upload Your Crop Image',     hi: 'अपनी फसल की तस्वीर अपलोड करें', mr: 'तुमच्या पिकाचा फोटो अपलोड करा' },
  'disease.crop_type':    { en: 'Crop Type (Optional)',        hi: 'फसल प्रकार (वैकल्पिक)', mr: 'पीक प्रकार (पर्यायी)'    },
  'disease.select_crop':  { en: 'Select crop type',           hi: 'फसल प्रकार चुनें',       mr: 'पीक प्रकार निवडा'         },
  'disease.growth_stage': { en: 'Plant Growth Stage (Optional)', hi: 'पौधे की वृद्धि अवस्था (वैकल्पिक)', mr: 'वनस्पती वाढीची अवस्था (पर्यायी)' },
  'disease.select_stage': { en: 'Select growth stage',        hi: 'वृद्धि अवस्था चुनें',    mr: 'वाढ अवस्था निवडा'         },
  'disease.state_label':  { en: 'State',                      hi: 'राज्य',                  mr: 'राज्य'                   },
  'disease.state_ph':     { en: 'e.g. Maharashtra',           hi: 'जैसे महाराष्ट्र',         mr: 'उदा. महाराष्ट्र'          },
  'disease.district_ph':  { en: 'e.g. Nashik',                hi: 'जैसे नाशिक',             mr: 'उदा. नाशिक'               },
  'disease.btn_analyze':  { en: 'Analyze for Disease',        hi: 'रोग की जांच करें',        mr: 'रोग तपासा'                },
  'disease.detected':     { en: 'Detected Symptoms',          hi: 'पहचाने गए लक्षण',        mr: 'आढळलेली लक्षणे'           },
  'disease.causes':       { en: 'Possible Causes',            hi: 'संभावित कारण',            mr: 'संभाव्य कारणे'            },
  'disease.treatment':    { en: 'Treatment Plan',             hi: 'उपचार योजना',             mr: 'उपचार योजना'              },
  'disease.prevention':   { en: 'Prevention Tips',            hi: 'रोकथाम के उपाय',          mr: 'प्रतिबंधक उपाय'           },
  'disease.confidence':   { en: 'Confidence',                 hi: 'विश्वास',                 mr: 'विश्वास'                  },
  'disease.severity':     { en: 'Severity Level',             hi: 'गंभीरता स्तर',            mr: 'तीव्रता पातळी'             },
  'disease.save_history': { en: 'Save to History',            hi: 'इतिहास में सहेजें',        mr: 'इतिहासात जतन करा'         },
  'disease.download_pdf': { en: 'Download PDF',               hi: 'PDF डाउनलोड करें',        mr: 'PDF डाउनलोड करा'          },
  'disease.ask_chat':     { en: 'Ask AI About This',          hi: 'AI से इस बारे में पूछें',  mr: 'AI ला याबद्दल विचारा'      },
  'disease.analyze_another': { en: 'Analyze Another Image',  hi: 'दूसरी तस्वीर विश्लेषण करें', mr: 'दुसरी प्रतिमा विश्लेषण करा' },
  'disease.crop_category':{ en: 'Crop Category',              hi: 'फसल श्रेणी',              mr: 'पीक श्रेणी'               },
  'disease.diagnosis':    { en: 'Diagnosis',                  hi: 'निदान',                   mr: 'निदान'                   },
  'disease.ai_status':    { en: 'AI Status',                  hi: 'AI स्थिति',               mr: 'AI स्थिती'                },
  'disease.no_crop':      { en: 'No Crop Detected',           hi: 'कोई फसल नहीं मिली',       mr: 'कोणतेही पीक आढळले नाही'   },
  'disease.no_crop_msg':  { en: 'The uploaded image does not appear to be a crop or plant leaf. Please upload a clear picture of a crop leaf.', hi: 'अपलोड की गई तस्वीर फसल की पत्ती नहीं दिखती। कृपया फसल की पत्ती की स्पष्ट तस्वीर अपलोड करें।', mr: 'अपलोड केलेला फोटो पीक पान नाही असे दिसते. कृपया पीक पानाचा स्पष्ट फोटो अपलोड करा.' },
  'disease.try_img':      { en: 'Try Another Image',          hi: 'दूसरी तस्वीर आज़माएं',    mr: 'दुसरा फोटो वापरा'          },
  'disease.drag_drop':    { en: 'Drag & Drop crop image here', hi: 'फसल की तस्वीर यहाँ खींचें', mr: 'पीक फोटो येथे ड्रॅग करा'  },
  'disease.browse':       { en: 'Browse Device',              hi: 'डिवाइस में ढूंढें',        mr: 'डिव्हाइस शोधा'             },
  'disease.supports':     { en: 'Supports: JPG, JPEG, PNG, WEBP',  hi: 'समर्थित: JPG, JPEG, PNG, WEBP', mr: 'समर्थित: JPG, JPEG, PNG, WEBP' },
  'disease.recent_history':{ en: 'Recent Analysis History',   hi: 'हालिया विश्लेषण इतिहास',  mr: 'अलीकडील विश्लेषण इतिहास'  },

  /* ─── NOTIFICATIONS ─────────────────────────────────────── */
  'notif.title':          { en: 'Notifications',              hi: 'सूचनाएं',                 mr: 'सूचना'                   },
  'notif.subtitle':       { en: 'Stay updated with AI-powered farm alerts', hi: 'AI कृषि सतर्कताओं से अपडेट रहें', mr: 'AI कृषी सूचनांसह अपडेट राहा' },
  'notif.mark_all_read':  { en: 'Mark All Read',              hi: 'सभी पढ़ें',               mr: 'सर्व वाचले'               },
  'notif.clear_all':      { en: 'Clear All',                  hi: 'सब साफ करें',             mr: 'सर्व साफ करा'             },
  'notif.unread':         { en: 'Unread',                     hi: 'अपठित',                   mr: 'न वाचलेले'               },
  'notif.all':            { en: 'All',                        hi: 'सभी',                     mr: 'सर्व'                    },
  'notif.empty':          { en: 'No notifications in this category.',  hi: 'इस श्रेणी में कोई सूचना नहीं।', mr: 'या श्रेणीत कोणतीही सूचना नाही.' },
  'notif.check_later':    { en: 'Check back later for farm alerts.',   hi: 'बाद में कृषि सतर्कताओं के लिए देखें।', mr: 'नंतर शेत सूचनांसाठी पुन्हा तपासा.' },
  'notif.just_now':       { en: 'Just now',                   hi: 'अभी',                     mr: 'आत्ता'                   },
  'notif.mark_read':      { en: 'Mark as read',               hi: 'पढ़ा हुआ चिह्नित करें',    mr: 'वाचले म्हणून चिन्हांकित करा' },
  'notif.dismiss':        { en: 'Dismiss',                    hi: 'खारिज करें',              mr: 'डिसमिस करा'              },

  /* ─── PROFILE ───────────────────────────────────────────── */
  'profile.title':        { en: 'My Profile',                 hi: 'मेरी प्रोफ़ाइल',           mr: 'माझे प्रोफाइल'           },
  'profile.edit':         { en: 'Edit Profile',               hi: 'प्रोफ़ाइल संपादित करें',    mr: 'प्रोफाइल संपादित करा'    },
  'profile.save':         { en: 'Save Changes',               hi: 'बदलाव सहेजें',             mr: 'बदल जतन करा'             },
  'profile.name_label':   { en: 'Full Name',                  hi: 'पूरा नाम',                 mr: 'पूर्ण नाव'               },
  'profile.email_label':  { en: 'Email Address',              hi: 'ईमेल पता',                mr: 'ईमेल पत्ता'              },
  'profile.phone_label':  { en: 'Mobile Number',              hi: 'मोबाइल नंबर',              mr: 'मोबाइल नंबर'             },
  'profile.state_label':  { en: 'State',                      hi: 'राज्य',                   mr: 'राज्य'                   },
  'profile.farm_size':    { en: 'Farm Size (acres)',           hi: 'खेत का आकार (एकड़)',        mr: 'शेताचा आकार (एकर)'       },
  'profile.lang_pref':    { en: 'Preferred Language',         hi: 'पसंदीदा भाषा',             mr: 'पसंतीची भाषा'            },

  /* ─── SETTINGS ──────────────────────────────────────────── */
  'settings.title':       { en: 'Settings',                   hi: 'सेटिंग्स',                mr: 'सेटिंग्ज'                },
  'settings.profile':     { en: 'Profile',                    hi: 'प्रोफ़ाइल',               mr: 'प्रोफाइल'                },
  'settings.language':    { en: 'Language',                   hi: 'भाषा',                    mr: 'भाषा'                    },
  'settings.notifications': { en: 'Notifications',            hi: 'सूचनाएं',                 mr: 'सूचना'                   },
  'settings.farm_details':{ en: 'Farm Details',               hi: 'खेत की जानकारी',           mr: 'शेताचा तपशील'             },
  'settings.save':        { en: 'Save Changes',               hi: 'बदलाव सहेजें',             mr: 'बदल जतन करा'             },

  /* ─── COMMON ACTIONS / BUTTONS ──────────────────────────── */
  'btn.download_pdf':     { en: 'Download PDF',               hi: 'PDF डाउनलोड करें',        mr: 'PDF डाउनलोड करा'         },
  'btn.analyze':          { en: 'Analyze',                    hi: 'विश्लेषण करें',            mr: 'विश्लेषण करा'            },
  'btn.save':             { en: 'Save',                       hi: 'सहेजें',                  mr: 'जतन करा'                 },
  'btn.close':            { en: 'Close',                      hi: 'बंद करें',                mr: 'बंद करा'                 },
  'btn.view_details':     { en: 'View Details',               hi: 'विवरण देखें',             mr: 'तपशील पहा'               },
  'btn.back':             { en: 'Back',                       hi: 'वापस',                    mr: 'मागे'                    },
  'btn.apply_now':        { en: 'Apply Now',                  hi: 'अभी आवेदन करें',           mr: 'आत्ता अर्ज करा'          },
  'btn.learn_more':       { en: 'Learn More',                 hi: 'अधिक जानें',              mr: 'अधिक जाणून घ्या'          },
  'btn.get_started':      { en: 'Get Started',                hi: 'शुरू करें',                mr: 'सुरुवात करा'              },
  'btn.submit':           { en: 'Submit',                     hi: 'जमा करें',                mr: 'सबमिट करा'               },
  'btn.cancel':           { en: 'Cancel',                     hi: 'रद्द करें',                mr: 'रद्द करा'                },
  'btn.retry':            { en: 'Retry',                      hi: 'पुनः प्रयास करें',          mr: 'पुन्हा प्रयत्न करा'       },
  'btn.refresh':          { en: 'Refresh',                    hi: 'ताज़ा करें',               mr: 'रिफ्रेश करा'              },
  'btn.view_all':         { en: 'View All',                   hi: 'सभी देखें',                mr: 'सर्व पहा'                },
  'btn.change_img':       { en: 'Change',                     hi: 'बदलें',                   mr: 'बदला'                    },
  'btn.browse_device':    { en: 'Browse Device',              hi: 'डिवाइस में ढूंढें',        mr: 'डिव्हाइस शोधा'            },

  /* ─── LABELS ────────────────────────────────────────────── */
  'label.loading':        { en: 'Loading…',                   hi: 'लोड हो रहा है…',           mr: 'लोड होत आहे…'            },
  'label.optional':       { en: 'Optional',                   hi: 'वैकल्पिक',                 mr: 'पर्यायी'                 },
  'label.required':       { en: 'Required',                   hi: 'आवश्यक',                  mr: 'आवश्यक'                  },
  'label.powered_by_ai':  { en: 'Powered by AI',              hi: 'AI द्वारा संचालित',         mr: 'AI द्वारे चालित'         },
  'label.new':            { en: 'NEW',                        hi: 'नया',                     mr: 'नवीन'                    },
  'label.beta':           { en: 'BETA',                       hi: 'बीटा',                    mr: 'बीटा'                    },
  'label.language':       { en: 'Language',                   hi: 'भाषा',                    mr: 'भाषा'                    },

  /* ─── MESSAGES / TOAST ──────────────────────────────────── */
  'msg.lang_changed':     { en: 'Language changed',           hi: 'भाषा बदली गई',             mr: 'भाषा बदलली'               },
  'msg.saved':            { en: 'Saved successfully!',        hi: 'सफलतापूर्वक सहेजा गया!',   mr: 'यशस्वीरित्या जतन केले!'   },
  'msg.error_generic':    { en: 'Something went wrong. Please try again.', hi: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।', mr: 'काहीतरी चुकीचे झाले. कृपया पुन्हा प्रयत्न करा.' },
  'msg.image_invalid':    { en: 'Please upload a valid JPG, PNG, or WEBP crop image.', hi: 'कृपया एक वैध JPG, PNG, या WEBP फसल तस्वीर अपलोड करें।', mr: 'कृपया वैध JPG, PNG किंवा WEBP पीक फोटो अपलोड करा.' },
  'msg.image_too_large':  { en: 'Image size exceeds the 10 MB limit.', hi: 'तस्वीर का आकार 10 MB सीमा से अधिक है।', mr: 'प्रतिमेचा आकार 10 MB मर्यादा ओलांडतो.' },
  'msg.analysis_saving':  { en: 'Analysis saved to your farm history!', hi: 'विश्लेषण आपके खेत इतिहास में सहेजा गया!', mr: 'विश्लेषण तुमच्या शेत इतिहासात जतन केले!' },
  'msg.generating_pdf':   { en: 'Generating PDF Report…',    hi: 'PDF रिपोर्ट बन रही है…',   mr: 'PDF रिपोर्ट तयार होत आहे…'},
  'msg.no_crop_selected': { en: 'Please upload a crop image first.', hi: 'कृपया पहले फसल की तस्वीर अपलोड करें।', mr: 'कृपया आधी पीक फोटो अपलोड करा.' },
  'msg.login_success':    { en: 'Login successful! Welcome back.', hi: 'लॉगिन सफल! वापस आपका स्वागत है।', mr: 'लॉगिन यशस्वी! परत आपले स्वागत आहे.' },
  'msg.logout_success':   { en: 'Logged out successfully.',   hi: 'सफलतापूर्वक लॉग आउट हुए।', mr: 'यशस्वीरित्या लॉग आउट झाले.' },
  'msg.register_success': { en: 'Account created successfully!', hi: 'अकाउंट सफलतापूर्वक बनाया गया!', mr: 'खाते यशस्वीरित्या तयार झाले!' },
  'msg.analysis_complete':{ en: 'Analysis complete!',         hi: 'विश्लेषण पूरा हुआ!',       mr: 'विश्लेषण पूर्ण झाले!'     },
  'msg.all_notif_read':   { en: 'All notifications marked as read', hi: 'सभी सूचनाएं पढ़ी हुई चिह्नित हुईं', mr: 'सर्व सूचना वाचल्या म्हणून चिन्हांकित केल्या' },
  'msg.notif_cleared':    { en: 'All notifications cleared',  hi: 'सभी सूचनाएं साफ हुईं',     mr: 'सर्व सूचना साफ केल्या'    },

  /* ─── FOOTER ────────────────────────────────────────────── */
  'footer.tagline':       { en: 'Intelligent Agriculture Advisor', hi: 'बुद्धिमान कृषि सलाहकार', mr: 'बुद्धिमान कृषी सल्लागार' },
  'footer.desc':          { en: 'Empowering farmers with artificial intelligence for smarter, more sustainable farming decisions.', hi: 'स्मार्ट कृषि निर्णयों के लिए किसानों को AI से सशक्त बनाना।', mr: 'स्मार्ट शेती निर्णयांसाठी शेतकऱ्यांना AI ने सक्षम करणे.' },
  'footer.quick_links':   { en: 'Quick Links',                hi: 'त्वरित लिंक',              mr: 'जलद दुवे'                },
  'footer.ai_services':   { en: 'AI Services',                hi: 'AI सेवाएं',                mr: 'AI सेवा'                 },
  'footer.support':       { en: 'Support',                    hi: 'समर्थन',                  mr: 'सहाय्य'                  },
  'footer.languages':     { en: 'Languages',                  hi: 'भाषाएं',                  mr: 'भाषा'                    },
  'footer.home':          { en: 'Home',                       hi: 'होम',                     mr: 'मुख्यपृष्ठ'               },
  'footer.dashboard':     { en: 'Dashboard',                  hi: 'डैशबोर्ड',                mr: 'डॅशबोर्ड'                },
  'footer.about':         { en: 'About',                      hi: 'हमारे बारे में',           mr: 'आमच्याबद्दल'              },
  'footer.contact':       { en: 'Contact',                    hi: 'संपर्क',                  mr: 'संपर्क'                   },
  'footer.help_center':   { en: 'Help Center',                hi: 'सहायता केंद्र',            mr: 'मदत केंद्र'               },
  'footer.privacy':       { en: 'Privacy Policy',             hi: 'गोपनीयता नीति',            mr: 'गोपनीयता धोरण'            },
  'footer.terms':         { en: 'Terms & Conditions',         hi: 'नियम और शर्तें',           mr: 'नियम व अटी'               },
  'footer.copyright':     { en: '© 2026 KrishiMitra AI. All rights reserved.',  hi: '© 2026 KrishiMitra AI. सर्वाधिकार सुरक्षित।', mr: '© 2026 KrishiMitra AI. सर्व हक्क राखीव.' },
  'footer.built_for':     { en: 'Built with AI for Smarter Agriculture.', hi: 'स्मार्ट कृषि के लिए AI के साथ बनाया गया।', mr: 'स्मार्ट शेतीसाठी AI सह बनविले.' },

  /* ─── VALIDATION ────────────────────────────────────────── */
  'valid.name_required':  { en: 'Name is required.',          hi: 'नाम आवश्यक है।',           mr: 'नाव आवश्यक आहे.'          },
  'valid.email_required': { en: 'Email is required.',         hi: 'ईमेल आवश्यक है।',          mr: 'ईमेल आवश्यक आहे.'         },
  'valid.email_invalid':  { en: 'Please enter a valid email.', hi: 'कृपया वैध ईमेल दर्ज करें।', mr: 'कृपया वैध ईमेल प्रविष्ट करा.' },
  'valid.password_required': { en: 'Password is required.',   hi: 'पासवर्ड आवश्यक है।',       mr: 'पासवर्ड आवश्यक आहे.'      },
  'valid.password_min':   { en: 'Password must be at least 8 characters.', hi: 'पासवर्ड कम से कम 8 वर्णों का होना चाहिए।', mr: 'पासवर्ड किमान 8 अक्षरांचा असावा.' },
};

/* ════════════════════════════════════════════════════════════
   CORE TRANSLATOR
   ============================================================ */

/** Get current active language code (en | hi | mr) */
function getCurrentLang() {
  return localStorage.getItem('km_language') || 'en';
}

/**
 * Translate a single key for the current language.
 * Falls back to English, then the key itself.
 */
function t(key, lang) {
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
 *   data-i18n-html="key"        → sets innerHTML (use sparingly)
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

  // HTML content (use sparingly)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const translation = t(key, lang);
    if (translation !== key) el.innerHTML = translation;
  });

  // Update <html lang> attribute
  document.documentElement.lang = lang === 'mr' ? 'mr' : lang === 'hi' ? 'hi' : 'en';

  // Sync all language selectors on the page to current value
  document.querySelectorAll('.km-lang-select, #dash-lang-select').forEach(sel => {
    sel.value = lang;
  });

  // Dispatch event so other scripts can react (chatbot, voice, etc.)
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Initialize language selectors across ALL pages.
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

  // Handle footer language buttons (landing page)
  document.querySelectorAll('[data-lang]').forEach(btn => {
    if (btn.classList.contains('km-footer__lang-btn')) {
      btn.addEventListener('click', function () {
        applyLanguage(this.dataset.lang);
      });
    }
  });

  // Apply on page load
  applyLanguage(saved);
}

/* ════════════════════════════════════════════════════════════
   AUTO-INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', initLanguageSystem);

// Also run after components are dynamically loaded into DOM
document.addEventListener('kmComponentsLoaded', () => {
  initLanguageSystem();
});

/* ════════════════════════════════════════════════════════════
   EXPORTS
   ============================================================ */
window.KM_Lang = { t, applyLanguage, getCurrentLang, initLanguageSystem, LANG_STRINGS };
