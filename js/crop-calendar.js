/* ============================================================
   KrishiMitra AI – crop-calendar.js
   Live District-Wise Crop Calendar Client Engine
   ============================================================ */

'use strict';

// ── CROP CALENDAR DATABASE ───────────────────────────────────
const CALENDAR_DB = {
  Nagpur: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Long duration commercial crop', sowing: 'June – July', harvesting: 'Nov – Dec', water: 'Medium to High (600-800 mm)', temp: '21°C - 35°C', tip: 'Sow at the onset of monsoon. Deep black cotton soil is ideal.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Short duration oilseed crop', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Medium (450-500 mm)', temp: '20°C - 30°C', tip: 'Use high-quality certified seeds. Treat seeds with rhizobium culture.' },
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Water intensive staple crop', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'High (1200-1500 mm)', temp: '22°C - 32°C', tip: 'Transplant seedlings 20-25 days old. Maintain water level in fields.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Staple winter cereal crop', sowing: 'Nov 1 – Nov 30', harvesting: 'March – April', water: 'Medium (350-400 mm)', temp: '15°C - 25°C', tip: 'Ideal temperature for sowing is 18°C-22°C. Irrigate at critical crown root stage.' },
      { name: 'Bengal Gram / Chickpea (हरभरा)', emoji: '🌱', sub: 'Winter pulse crop', sowing: 'Oct 15 – Nov 15', harvesting: 'Feb – March', water: 'Low (200-250 mm)', temp: '18°C - 25°C', tip: 'Avoid waterlogging. Nipping of young branch shoots increases pod count.' }
    ],
    zaid: [
      { name: 'Green Gram / Moong (मूग)', emoji: '🌱', sub: 'Short term summer pulse', sowing: 'March 1 – March 20', harvesting: 'May – June', water: 'Low (150-200 mm)', temp: '25°C - 38°C', tip: 'Highly heat tolerant. Sowing must be finished before summer peak.' }
    ]
  },
  Pune: {
    kharif: [
      { name: 'Rice / Paddy (भात)', emoji: '🌾', sub: 'Heavy rainfall hilly region crop', sowing: 'June – July', harvesting: 'Nov', water: 'High', temp: '20°C - 30°C', tip: 'Best suited for Maval and western zones.' },
      { name: 'Tomato (टोमॅटो)', emoji: '🍅', sub: 'Major vegetable cash crop', sowing: 'May – June', harvesting: 'Aug – Sept', water: 'Medium', temp: '18°C - 30°C', tip: 'Build raised beds for proper drainage during monsoons.' }
    ],
    rabi: [
      { name: 'Onion (कांदा)', emoji: '🧅', sub: 'Rabi onion crop', sowing: 'Nov – Dec', harvesting: 'March – April', water: 'Medium', temp: '15°C - 25°C', tip: 'Transplant seedlings in late evening. Keep field clean of weeds.' },
      { name: 'Rabi Jowar (ज्वारी)', emoji: '🌾', sub: 'Drought-tolerant grain', sowing: 'Sept 15 – Oct 15', harvesting: 'Jan – Feb', water: 'Low', temp: '20°C - 28°C', tip: 'Conserve moisture in soil before sowing.' }
    ],
    zaid: [
      { name: 'Cucumber (काकडी)', emoji: '🥒', sub: 'Hydrating summer vegetable', sowing: 'Feb – March', harvesting: 'April – May', water: 'Medium', temp: '25°C - 35°C', tip: 'Provide light irrigation daily. Use mulching paper.' }
    ]
  },
  Nashik: {
    kharif: [
      { name: 'Kharif Onion (लाल कांदा)', emoji: '🧅', sub: 'Red onion crop', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'Medium', temp: '20°C - 30°C', tip: 'Highly susceptible to leaf blight. Spray neem formulations early.' },
      { name: 'Maize / Corn (मका)', emoji: '🌽', sub: 'Short duration fodder/grain', sowing: 'June – July', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 32°C', tip: 'Proper spacing is essential. Apply nitrogen fertilizer in 3 split doses.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter cereal crop', sowing: 'Nov', harvesting: 'March – April', water: 'Medium', temp: '15°C - 24°C', tip: 'Keep soil moist during grain filling stage.' },
      { name: 'Rabi Onion (उन्हाळी कांदा)', emoji: '🧅', sub: 'Long shelf-life onion', sowing: 'Nov – Dec', harvesting: 'April – May', water: 'Medium', temp: '15°C - 28°C', tip: 'Crucial crop for storage. Avoid excess nitrogen fertilizer near harvest.' }
    ],
    zaid: [
      { name: 'Watermelon (कलिंगड)', emoji: '🍉', sub: 'Summer cash fruit', sowing: 'Jan – Feb', harvesting: 'April – May', water: 'Medium', temp: '25°C - 38°C', tip: 'Requires rich sandy soils. Apply drip irrigation for high sweetness.' }
    ]
  },
  Aurangabad: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Dry zone cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Use drip irrigation. Follow Integrated Pest Management for bollworm.' },
      { name: 'Pearl Millet / Bajra (बाजरी)', emoji: '🌾', sub: 'Dryland grain crop', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Low', temp: '25°C - 38°C', tip: 'Very low water requirement. Suitable for light soils.' }
    ],
    rabi: [
      { name: 'Jowar (ज्वारी)', emoji: '🌾', sub: 'Winter grain crop', sowing: 'Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 26°C', tip: 'Best harvested when grains become hard.' }
    ],
    zaid: [
      { name: 'Groundnut (भुईमूग)', emoji: '🥜', sub: 'Summer groundnut oilseed', sowing: 'Feb – March', harvesting: 'May – June', water: 'Medium', temp: '22°C - 35°C', tip: 'Requires loose soil for easy pegging and pod growth.' }
    ]
  },
  Latur: {
    kharif: [
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Primary oilseed crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 32°C', tip: 'Sow only after district receives minimum 75-100mm monsoon rainfall.' },
      { name: 'Pigeon Pea / Tur (तूर)', emoji: '🌱', sub: 'Intercrop pulse crop', sowing: 'June – July', harvesting: 'Dec – Jan', water: 'Low to Medium', temp: '20°C - 35°C', tip: 'Usually intercropped with soybean (4:2 or 3:1 ratio).' }
    ],
    rabi: [
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Winter chickpea', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 25°C', tip: 'Watch for wilt disease. Spray biological Trichoderma early.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Catch crop pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Harvest pods in 2-3 pickings as they ripen.' }
    ]
  },
  Jalgaon: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Major black soil cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 35°C', tip: 'Maintain 90x60 cm spacing for Bt cotton hybrids.' },
      { name: 'Banana (केळी)', emoji: '🍌', sub: 'Year-round commercial fruit', sowing: 'June – July', harvesting: 'April – June (Next Year)', water: 'High', temp: '20°C - 40°C', tip: 'Requires intensive organic fertilization and steady drip watering.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 24°C', tip: 'Maintain adequate potash levels in soil.' }
    ],
    zaid: [
      { name: 'Sesame / Til (तीळ)', emoji: '🌱', sub: 'Summer oilseed crop', sowing: 'Feb – March', harvesting: 'May', water: 'Low', temp: '25°C - 35°C', tip: 'Keep the field free of weeds during early growth.' }
    ]
  },
  Kolhapur: {
    kharif: [
      { name: 'Sugarcane (ऊस)', emoji: '🎋', sub: 'Year-long primary cash crop', sowing: 'June – July (Adsali)', harvesting: 'Oct – Dec (Next Year)', water: 'High (1800-2200 mm)', temp: '25°C - 42°C', tip: 'Highly profitable. Use tissue culture plantlets for pest resistance.' },
      { name: 'Rice / Paddy (भात)', emoji: '🌾', sub: 'High rainfall rice crop', sowing: 'June', harvesting: 'Oct – Nov', water: 'High', temp: '22°C - 32°C', tip: 'Use fertilizer rich in zinc and iron.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Staple cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Harvest when grains become dry and golden.' }
    ],
    zaid: [
      { name: 'Fodder Crops (चारा पिके)', emoji: '🌾', sub: 'Animal feed crop', sowing: 'Feb – March', harvesting: 'Ongoing', water: 'Medium', temp: '25°C - 38°C', tip: 'Grow Maize fodder or Napier grass with high nitrogen dosing.' }
    ]
  },
  Akola: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Shed-resistant cotton hybrid', sowing: 'June', harvesting: 'Nov', water: 'Medium', temp: '21°C - 35°C', tip: 'Use pheromone traps for pink bollworm monitoring.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Short season oilseed', sowing: 'June', harvesting: 'Sept', water: 'Medium', temp: '20°C - 30°C', tip: 'Harvest when 90% leaves turn yellow and drop.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Irrigate at 20-day intervals in absence of winter rains.' }
    ],
    zaid: [
      { name: 'Green Gram (मूग)', emoji: '🌱', sub: 'Summer catch crop', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Sow early to ensure harvesting before monsoon rains start.' }
    ]
  },
  Amravati: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Deep black soil cash crop', sowing: 'June', harvesting: 'Nov', water: 'Medium', temp: '22°C - 35°C', tip: 'Do not allow water logging near plant roots.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Premium oilseed crop', sowing: 'June', harvesting: 'Sept', water: 'Medium', temp: '20°C - 30°C', tip: 'Treat seeds with fungicide to prevent collar rot.' }
    ],
    rabi: [
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Winter chickpea pulse', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 24°C', tip: 'Nipping is key for better yields.' }
    ],
    zaid: [
      { name: 'Sesame (तीळ)', emoji: '🌱', sub: 'Summer oilseed crop', sowing: 'Feb – March', harvesting: 'May', water: 'Low', temp: '25°C - 35°C', tip: 'Requires very well-pulverized soil bed.' }
    ]
  },
  Solapur: {
    kharif: [
      { name: 'Pomegranate (डाळिंब)', emoji: '🍎', sub: 'Orchard cash crop', sowing: 'June – July (Mrig Bahar)', harvesting: 'Nov – Dec', water: 'Low to Medium', temp: '25°C - 38°C', tip: 'Prune trees regularly. Maintain proper drip schedules.' },
      { name: 'Jowar (ज्वारी)', emoji: '🌾', sub: 'Drought grain', sowing: 'June', harvesting: 'Sept', water: 'Low', temp: '25°C - 35°C', tip: 'Sow with certified drought-resistant seeds.' }
    ],
    rabi: [
      { name: 'Rabi Jowar (मळणी ज्वारी)', emoji: '🌾', sub: 'Main staple winter food', sowing: 'Sept – Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 28°C', tip: 'Major crop of Solapur. Conserve moisture in the field.' }
    ],
    zaid: [
      { name: 'Groundnut (भुईमूग)', emoji: '🥜', sub: 'Summer oilseed', sowing: 'Feb', harvesting: 'May', water: 'Medium', temp: '22°C - 35°C', tip: 'Apply gypsum at 45 days after sowing for pod filling.' }
    ]
  },
  Ahmednagar: {
    kharif: [
      { name: 'Sugarcane (ऊस)', emoji: '🎋', sub: 'Major cash crop', sowing: 'June – July', harvesting: 'Dec – Feb (Next Year)', water: 'High', temp: '25°C - 40°C', tip: 'Use drip irrigation for best yield and water saving.' },
      { name: 'Onion (खरीप कांदा)', emoji: '🧅', sub: 'Kharif onion crop', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'Medium', temp: '20°C - 30°C', tip: 'Harvest when tops fall. Cure in shade before storage.' }
    ],
    rabi: [
      { name: 'Rabi Onion (उन्हाळी कांदा)', emoji: '🧅', sub: 'Long storage onion', sowing: 'Nov – Dec', harvesting: 'April – May', water: 'Medium', temp: '15°C - 28°C', tip: 'Best stored in wire-mesh bins with good airflow.' },
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple cereal', sowing: 'Nov', harvesting: 'March – April', water: 'Medium', temp: '15°C - 25°C', tip: 'Apply nitrogen fertilizer in 3 splits for high yield.' }
    ],
    zaid: [
      { name: 'Groundnut (भुईमूग)', emoji: '🥜', sub: 'Summer oilseed', sowing: 'Feb', harvesting: 'May', water: 'Medium', temp: '22°C - 35°C', tip: 'Loosen soil before pod formation stage.' }
    ]
  },
  Beed: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Dryland cash crop', sowing: 'June – July', harvesting: 'Nov – Jan', water: 'Medium', temp: '22°C - 36°C', tip: 'Use pink bollworm resistant varieties.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Oilseed cash crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 32°C', tip: 'Avoid sowing in waterlogged areas.' }
    ],
    rabi: [
      { name: 'Jowar (ज्वारी)', emoji: '🌾', sub: 'Winter grain crop', sowing: 'Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 28°C', tip: 'Apply phosphorus basal fertilizer before sowing.' },
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Winter pulse crop', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 25°C', tip: 'Timely sowing is critical for high yield.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Short season summer pulse', sowing: 'March', harvesting: 'May – June', water: 'Low', temp: '25°C - 38°C', tip: 'Very short duration. Good rotation crop.' }
    ]
  },
  Bhandara: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Wetland rice cultivation', sowing: 'June – July', harvesting: 'Nov – Dec', water: 'High (1400+ mm)', temp: '22°C - 32°C', tip: 'Use SRI method for higher productivity with less water.' },
      { name: 'Arhar / Tur (तूर)', emoji: '🌱', sub: 'Pulse intercrop', sowing: 'June – July', harvesting: 'Jan – Feb', water: 'Medium', temp: '20°C - 35°C', tip: 'Intercrop with rice or soybean for added income.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple grain', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Irrigate at crown root initiation and jointing stages.' }
    ],
    zaid: [
      { name: 'Cucumber (काकडी)', emoji: '🥒', sub: 'Summer vegetable', sowing: 'Feb – March', harvesting: 'April – May', water: 'Medium', temp: '25°C - 35°C', tip: 'Provide stake support and mulch soil.' }
    ]
  },
  Buldhana: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Black soil cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Adopt wide spacing and pruning for Bt cotton.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Primary kharif oilseed', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Avoid very early or late sowing.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Apply zinc sulfate to correct zinc deficiency.' }
    ],
    zaid: [
      { name: 'Sesame (तीळ)', emoji: '🌱', sub: 'Summer oilseed', sowing: 'Feb – March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Well-drained loamy soil is ideal.' }
    ]
  },
  Chandrapur: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Wetland rice – high rainfall zone', sowing: 'June – July', harvesting: 'Nov – Dec', water: 'High', temp: '22°C - 35°C', tip: 'Use short-duration high-yielding varieties for Vidarbha.' },
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Cash crop on black soils', sowing: 'June', harvesting: 'Nov', water: 'Medium', temp: '22°C - 35°C', tip: 'Keep pest scouting regular from 30 DAS.' }
    ],
    rabi: [
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Winter chickpea', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 25°C', tip: 'Inoculate seeds with Rhizobium before sowing.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Catch crop pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Irrigate twice during pod filling stage.' }
    ]
  },
  Dhule: {
    kharif: [
      { name: 'Maize (मका)', emoji: '🌽', sub: 'Major food and fodder crop', sowing: 'June – July', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 35°C', tip: 'Ridge sowing helps in better drainage during rains.' },
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Dryland cotton', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Use certified hybrid seeds for better bollworm resistance.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Rabi staple grain', sowing: 'Nov', harvesting: 'March – April', water: 'Medium', temp: '15°C - 25°C', tip: 'Late sowing (after Nov 20) reduces yield significantly.' }
    ],
    zaid: [
      { name: 'Watermelon (कलिंगड)', emoji: '🍉', sub: 'Sandy soil summer fruit', sowing: 'Jan – Feb', harvesting: 'April – May', water: 'Medium', temp: '25°C - 38°C', tip: 'Apply farm yard manure generously before planting.' }
    ]
  },
  Gadchiroli: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Tribal area high-rainfall rice', sowing: 'June – July', harvesting: 'Nov – Dec', water: 'Very High (1600+ mm)', temp: '22°C - 34°C', tip: 'Local traditional varieties perform well in tribal belt.' },
      { name: 'Turmeric (हळद)', emoji: '🌿', sub: 'Spice cash crop', sowing: 'May – June', harvesting: 'Jan – Feb', water: 'High', temp: '20°C - 35°C', tip: 'Deep ploughing and raised beds improve rhizome growth.' }
    ],
    rabi: [
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Winter pulse', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 25°C', tip: 'No irrigation needed if adequate soil moisture available.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Summer short-season pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Can be grown on receding soil moisture.' }
    ]
  },
  Gondia: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Rice-bowl district crop', sowing: 'June – July', harvesting: 'Nov – Dec', water: 'High (1400 mm)', temp: '22°C - 32°C', tip: 'Gondia is famous for Jawaphool and other traditional varieties.' },
      { name: 'Arhar / Tur (तूर)', emoji: '🌱', sub: 'Dryland pulse', sowing: 'June – July', harvesting: 'Jan – Feb', water: 'Medium', temp: '20°C - 35°C', tip: 'Keep border rows of sorghum to protect from insects.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Apply farmyard manure 2 weeks before sowing.' }
    ],
    zaid: [
      { name: 'Watermelon (कलिंगड)', emoji: '🍉', sub: 'Sandy river-bed cash crop', sowing: 'Jan – Feb', harvesting: 'April – May', water: 'Medium', temp: '25°C - 38°C', tip: 'Grown in sandy riverbeds. Excellent summer cash crop.' }
    ]
  },
  Hingoli: {
    kharif: [
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Major kharif oilseed', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Use broad-bed furrow system to reduce waterlogging.' },
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Keep monitoring for sucking pests from early crop stage.' }
    ],
    rabi: [
      { name: 'Rabi Jowar (ज्वारी)', emoji: '🌾', sub: 'Winter dryland grain', sowing: 'Sept – Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 28°C', tip: 'Harvest when grains attain physiological maturity.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Short summer pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Performs well in light black soils.' }
    ]
  },
  Jalna: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Black soil cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Balance chemical and organic fertilizer inputs.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Short duration oilseed', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 32°C', tip: 'Treat seeds with fungicide + Rhizobium culture.' }
    ],
    rabi: [
      { name: 'Rabi Jowar (ज्वारी)', emoji: '🌾', sub: 'Drought tolerant grain', sowing: 'Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 26°C', tip: 'Maldandi variety is popular in Marathwada.' }
    ],
    zaid: [
      { name: 'Watermelon (कलिंगड)', emoji: '🍉', sub: 'Summer fruit crop', sowing: 'Jan – Feb', harvesting: 'April – May', water: 'Medium', temp: '25°C - 38°C', tip: 'Sandy and light soils give sweeter fruits.' }
    ]
  },
  'Mumbai City': {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Urban-fringe paddy', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'High', temp: '24°C - 34°C', tip: 'Limited farmland in city limits; grown in peri-urban farms.' }
    ],
    rabi: [
      { name: 'Leafy Vegetables (पालेभाज्या)', emoji: '🥬', sub: 'Quick-harvest urban crop', sowing: 'Nov – Dec', harvesting: 'Jan – Feb', water: 'Low to Medium', temp: '18°C - 28°C', tip: 'Ideal for terrace and urban kitchen gardens.' }
    ],
    zaid: [
      { name: 'Brinjal (वांगे)', emoji: '🍆', sub: 'All-season vegetable', sowing: 'Feb – March', harvesting: 'May – June', water: 'Medium', temp: '22°C - 35°C', tip: 'Good for container and urban farming.' }
    ]
  },
  'Mumbai Suburban': {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Peri-urban paddy', sowing: 'June – July', harvesting: 'Nov', water: 'High', temp: '24°C - 34°C', tip: 'Some paddy farming still practiced in Vikhroli, Borivali areas.' }
    ],
    rabi: [
      { name: 'Vegetables (भाजीपाला)', emoji: '🥦', sub: 'Market garden vegetables', sowing: 'Oct – Nov', harvesting: 'Jan – March', water: 'Medium', temp: '18°C - 28°C', tip: 'High demand from local markets. Grow tomato, cabbage, cauliflower.' }
    ],
    zaid: [
      { name: 'Cucumber (काकडी)', emoji: '🥒', sub: 'Summer vegetable', sowing: 'Feb – March', harvesting: 'April – May', water: 'Medium', temp: '25°C - 35°C', tip: 'Use mulching to conserve moisture in summer.' }
    ]
  },
  Nanded: {
    kharif: [
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Main kharif crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 32°C', tip: 'Raised bed planting reduces waterlogging damage.' },
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Monitor for mealybug from 45 DAS.' }
    ],
    rabi: [
      { name: 'Rabi Jowar (ज्वारी)', emoji: '🌾', sub: 'Winter staple grain', sowing: 'Sept – Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 28°C', tip: 'Marathwada Jowar (Maldandi) is famous variety.' },
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Pulse winter crop', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 25°C', tip: 'Apply one protective irrigation at pod filling stage.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Short-season pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Excellent soil health restoring catch crop.' }
    ]
  },
  Nandurbar: {
    kharif: [
      { name: 'Maize (मका)', emoji: '🌽', sub: 'Tribal dryland grain crop', sowing: 'June – July', harvesting: 'Sept – Oct', water: 'Medium', temp: '22°C - 36°C', tip: 'Widely grown in tribal belt. Intercrop with cowpea.' },
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Hill and tribal rice', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'High', temp: '22°C - 32°C', tip: 'Local varieties like Indrayani are preferred.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Apply boron micronutrient for grain development.' }
    ],
    zaid: [
      { name: 'Groundnut (भुईमूग)', emoji: '🥜', sub: 'Summer oilseed', sowing: 'Feb – March', harvesting: 'May – June', water: 'Medium', temp: '22°C - 35°C', tip: 'Sandy loam soils give best pod development.' }
    ]
  },
  Osmanabad: {
    kharif: [
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Major oilseed crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 32°C', tip: 'Crop rotation with Tur improves soil nitrogen.' },
      { name: 'Pigeon Pea / Tur (तूर)', emoji: '🌱', sub: 'Long duration pulse', sowing: 'June – July', harvesting: 'Dec – Jan', water: 'Low to Medium', temp: '20°C - 35°C', tip: 'Intercrop with soybean 3:1 ratio for income stability.' }
    ],
    rabi: [
      { name: 'Rabi Jowar (ज्वारी)', emoji: '🌾', sub: 'Drought-resistant winter grain', sowing: 'Sept – Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 28°C', tip: 'Grown on residual soil moisture. Very low input cost.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Summer pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Harvest in 2-3 pickings as pods ripen.' }
    ]
  },
  Palghar: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Coastal region paddy', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'High (1500+ mm)', temp: '24°C - 32°C', tip: 'Palghar has heavy monsoon. Use short-duration varieties.' },
      { name: 'Vari / Sawa (वरी)', emoji: '🌾', sub: 'Tribal millet crop', sowing: 'June – July', harvesting: 'Sept – Oct', water: 'Low', temp: '22°C - 34°C', tip: 'Traditional tribal crop. Minimal input requirement.' }
    ],
    rabi: [
      { name: 'Vegetables (भाजीपाला)', emoji: '🥦', sub: 'Rabi market vegetables', sowing: 'Oct – Nov', harvesting: 'Jan – March', water: 'Medium', temp: '18°C - 28°C', tip: 'Tomato, bottle gourd, and brinjal do well here.' }
    ],
    zaid: [
      { name: 'Mango (आंबा)', emoji: '🥭', sub: 'Seasonal orchard fruit', sowing: 'Perennial', harvesting: 'April – June', water: 'Medium', temp: '24°C - 40°C', tip: 'Alphonso and Kesar varieties thrive in coastal Palghar.' }
    ]
  },
  Parbhani: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Marathwada cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Use IPM approach – yellow sticky traps for whitefly.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Oilseed kharif crop', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Thin sowing stands to 10–12 cm spacing improves yield.' }
    ],
    rabi: [
      { name: 'Rabi Jowar (ज्वारी)', emoji: '🌾', sub: 'Winter food grain', sowing: 'Sept – Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 28°C', tip: 'Parbhani is known for Vasai and Maldandi jowar varieties.' }
    ],
    zaid: [
      { name: 'Sesame (तीळ)', emoji: '🌱', sub: 'Summer oilseed', sowing: 'Feb – March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Harvest when capsules turn yellow-brown.' }
    ]
  },
  Raigad: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Coastal Konkan rice', sowing: 'June', harvesting: 'Nov', water: 'Very High (2500+ mm)', temp: '24°C - 34°C', tip: 'Raigad receives very heavy rainfall. Ambe Mohor variety popular.' },
      { name: 'Nachani / Finger Millet (नाचणी)', emoji: '🌾', sub: 'Tribal nutritious millet', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'Medium', temp: '20°C - 32°C', tip: 'Very nutritious. Highly drought resilient in hilly terrain.' }
    ],
    rabi: [
      { name: 'Vegetables (भाजीपाला)', emoji: '🥦', sub: 'Winter vegetable crops', sowing: 'Oct – Nov', harvesting: 'Jan – March', water: 'Medium', temp: '18°C - 28°C', tip: 'Rich volcanic soil near coast is ideal for greens.' }
    ],
    zaid: [
      { name: 'Mango (आंबा)', emoji: '🥭', sub: 'Hapus – premium export mango', sowing: 'Perennial', harvesting: 'March – May', water: 'Medium', temp: '25°C - 40°C', tip: 'Alphonso from Raigad fetches premium export prices.' }
    ]
  },
  Ratnagiri: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Konkan traditional paddy', sowing: 'June', harvesting: 'Oct – Nov', water: 'Very High (3000+ mm)', temp: '24°C - 34°C', tip: 'Ambe Mohor and Karjat-3 are recommended varieties.' },
      { name: 'Cashew (काजू)', emoji: '🌰', sub: 'Perennial coastal cash crop', sowing: 'Perennial', harvesting: 'Feb – May', water: 'Medium', temp: '20°C - 38°C', tip: 'Prune after harvest to improve next-season production.' }
    ],
    rabi: [
      { name: 'Vegetables (भाजीपाला)', emoji: '🥦', sub: 'Post-monsoon vegetables', sowing: 'Nov – Dec', harvesting: 'Jan – March', water: 'Medium', temp: '18°C - 28°C', tip: 'Bitter gourd and bottle gourd are popular.' }
    ],
    zaid: [
      { name: 'Alphonso Mango (हापूस आंबा)', emoji: '🥭', sub: 'World-famous export mango', sowing: 'Perennial', harvesting: 'March – May', water: 'Medium', temp: '25°C - 40°C', tip: 'GI-tagged product. Avoid excessive nitrogen fertilizer.' }
    ]
  },
  Sangli: {
    kharif: [
      { name: 'Sugarcane (ऊस)', emoji: '🎋', sub: 'Major cash crop', sowing: 'June – July', harvesting: 'Nov – Jan (Next Year)', water: 'High', temp: '25°C - 40°C', tip: 'Drip irrigation recommended. Apply bio-fertilizer.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Kharif oilseed', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Sangli belt has good black soil for soybean.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Use certified HD-2781 or GW-496 varieties.' },
      { name: 'Grapes (द्राक्षे)', emoji: '🍇', sub: 'Major horticultural crop', sowing: 'Perennial', harvesting: 'Jan – March', water: 'Medium (drip)', temp: '15°C - 40°C', tip: 'Sangli is India\'s grape capital. Use trellis system.' }
    ],
    zaid: [
      { name: 'Turmeric (हळद)', emoji: '🌿', sub: 'Summer spice crop', sowing: 'April – May', harvesting: 'Jan – Feb', water: 'High', temp: '20°C - 35°C', tip: 'Sangli turmeric is GI-tagged. Deep black soil preferred.' }
    ]
  },
  Satara: {
    kharif: [
      { name: 'Sugarcane (ऊस)', emoji: '🎋', sub: 'Dominant cash crop', sowing: 'June – July', harvesting: 'Dec – Feb', water: 'High', temp: '25°C - 40°C', tip: 'Satara has many sugar mills. Adsali planting recommended.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Oilseed crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Intercrop with Tur for risk reduction.' }
    ],
    rabi: [
      { name: 'Rabi Onion (उन्हाळी कांदा)', emoji: '🧅', sub: 'Long-shelf onion', sowing: 'Nov – Dec', harvesting: 'April – May', water: 'Medium', temp: '15°C - 28°C', tip: 'Satara plateau is ideal for Rabi onion cultivation.' },
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Ensure adequate sulfur nutrition for good grain quality.' }
    ],
    zaid: [
      { name: 'Groundnut (भुईमूग)', emoji: '🥜', sub: 'Summer oilseed', sowing: 'Feb', harvesting: 'May', water: 'Medium', temp: '22°C - 35°C', tip: 'Short-duration Spanish bunch varieties preferred.' }
    ]
  },
  Sindhudurg: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Konkan coastal paddy', sowing: 'June', harvesting: 'Oct – Nov', water: 'Very High (3500+ mm)', temp: '24°C - 34°C', tip: 'Warna, Phuleswari varieties are well adapted here.' },
      { name: 'Cashew (काजू)', emoji: '🌰', sub: 'Major coastal cash crop', sowing: 'Perennial', harvesting: 'Feb – May', water: 'Medium', temp: '20°C - 38°C', tip: 'Sindhudurg is top cashew producer. Use clonal saplings.' }
    ],
    rabi: [
      { name: 'Vegetables (भाजीपाला)', emoji: '🥦', sub: 'Post-monsoon vegetables', sowing: 'Nov – Dec', harvesting: 'Jan – March', water: 'Medium', temp: '18°C - 28°C', tip: 'Pumpkin and colocasia are preferred locally.' }
    ],
    zaid: [
      { name: 'Kokum (कोकम)', emoji: '🌿', sub: 'Konkan perennial cash crop', sowing: 'Perennial', harvesting: 'March – May', water: 'Medium', temp: '22°C - 38°C', tip: 'Sindhudurg is GI-tagged kokum producer. Extract high value.' }
    ]
  },
  Thane: {
    kharif: [
      { name: 'Paddy / Rice (भात)', emoji: '🌾', sub: 'Heavy rainfall paddy belt', sowing: 'June – July', harvesting: 'Oct – Nov', water: 'High (2000+ mm)', temp: '24°C - 34°C', tip: 'Use SRI method in tribal pockets of Thane district.' },
      { name: 'Vari / Sawa (वरी)', emoji: '🌾', sub: 'Tribal nutri-millet', sowing: 'June – July', harvesting: 'Sept – Oct', water: 'Low', temp: '22°C - 34°C', tip: 'Traditional millet in tribal belts. Very low input cost.' }
    ],
    rabi: [
      { name: 'Vegetables (भाजीपाला)', emoji: '🥦', sub: 'Market garden crops', sowing: 'Oct – Nov', harvesting: 'Jan – March', water: 'Medium', temp: '18°C - 28°C', tip: 'Thane peri-urban areas supply Mumbai vegetable market.' }
    ],
    zaid: [
      { name: 'Banana (केळी)', emoji: '🍌', sub: 'Commercial tropical fruit', sowing: 'Feb – March', harvesting: '11-12 months later', water: 'High', temp: '22°C - 38°C', tip: 'Thane Konkan belt has good banana cultivation potential.' }
    ]
  },
  Wardha: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Wardha known for cotton', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 35°C', tip: 'Wardha is historically a major cotton district of Vidarbha.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Oilseed kharif crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Intercrop with Tur at 3:1 ratio.' }
    ],
    rabi: [
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter staple', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Use KRL-210 variety for Vidarbha zone.' },
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Winter pulse crop', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 24°C', tip: 'Desi varieties do well on residual moisture.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Short summer pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Can be grown after wheat harvest.' }
    ]
  },
  Washim: {
    kharif: [
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Primary kharif crop', sowing: 'June 15 – July 15', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Washim is major soybean growing district.' },
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Black soil cash crop', sowing: 'June', harvesting: 'Nov – Dec', water: 'Medium', temp: '22°C - 36°C', tip: 'Grow on deep black soils. Apply 5t FYM per acre.' }
    ],
    rabi: [
      { name: 'Jowar (ज्वारी)', emoji: '🌾', sub: 'Winter dryland grain', sowing: 'Oct', harvesting: 'Jan – Feb', water: 'Low', temp: '18°C - 26°C', tip: 'Grown mainly on residual soil moisture.' }
    ],
    zaid: [
      { name: 'Sesame (तीळ)', emoji: '🌱', sub: 'Summer oilseed', sowing: 'Feb – March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Apply 20 kg nitrogen per hectare as basal dose.' }
    ]
  },
  Yavatmal: {
    kharif: [
      { name: 'Cotton (कापूस)', emoji: '🌿', sub: 'Yavatmal – India\'s cotton heartland', sowing: 'June', harvesting: 'Nov – Jan', water: 'Medium', temp: '22°C - 36°C', tip: 'Yavatmal is the largest cotton producing district of Maharashtra. Use pheromone traps for bollworm.' },
      { name: 'Soybean (सोयाबीन)', emoji: '🫘', sub: 'Rotation oilseed crop', sowing: 'June', harvesting: 'Sept – Oct', water: 'Medium', temp: '20°C - 30°C', tip: 'Often rotated with cotton for soil health improvement.' }
    ],
    rabi: [
      { name: 'Bengal Gram (हरभरा)', emoji: '🌱', sub: 'Post-cotton pulse crop', sowing: 'Oct – Nov', harvesting: 'Feb – March', water: 'Low', temp: '15°C - 25°C', tip: 'Grown on residual cotton field moisture. Low cost crop.' },
      { name: 'Wheat (गहू)', emoji: '🌾', sub: 'Winter cereal', sowing: 'Nov', harvesting: 'March', water: 'Medium', temp: '15°C - 25°C', tip: 'Irrigate at boot leaf and milky grain stages.' }
    ],
    zaid: [
      { name: 'Moong (मूग)', emoji: '🌱', sub: 'Short duration summer pulse', sowing: 'March', harvesting: 'May', water: 'Low', temp: '25°C - 38°C', tip: 'Ideal short-duration post-rabi catch crop.' }
    ]
  }
};

// ── DOM ELEMENTS ─────────────────────────────────────────────
const districtSelect = document.getElementById('cc-district-select');
const seasonBtns = document.querySelectorAll('.cc-season-btn');
const grid = document.getElementById('cc-crops-grid');
const resultsTitle = document.getElementById('calendar-results-title');

let activeSeason = 'kharif';

// ── INITIALISE ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Populate district dropdown from CALENDAR_DB keys
  const districts = Object.keys(CALENDAR_DB);
  if (districtSelect) {
    districtSelect.innerHTML = '';
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      districtSelect.appendChild(opt);
    });
    // Set default district to first in the list
    if (districts.length) districtSelect.value = districts[0];
  }

  renderCalendar();

  // District filter
  districtSelect?.addEventListener('change', renderCalendar);

  // Season selector buttons
  seasonBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      seasonBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSeason = btn.getAttribute('data-season') || 'kharif';
      renderCalendar();
    });
  });
});

// ── RENDER FUNCTION ──────────────────────────────────────────
function renderCalendar() {
  if (!grid) return;

  const district = districtSelect?.value || 'Nagpur';
  const districtData = CALENDAR_DB[district] || CALENDAR_DB.Nagpur;
  const crops = districtData[activeSeason] || [];

  const seasonLabel = activeSeason === 'kharif' ? 'Kharif (खरीप)' : activeSeason === 'rabi' ? 'Rabi (रब्बी)' : 'Zaid (उन्हाळी)';
  if (resultsTitle) {
    resultsTitle.textContent = `Recommended Crops for ${district} in ${seasonLabel} Season`;
  }

  if (crops.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-light);">
        <i class="fas fa-calendar-times" style="font-size:2rem; margin-bottom:12px; display:block; opacity:0.5;"></i>
        No crop calendar recommendations found for this season.
      </div>
    `;
    return;
  }

  grid.innerHTML = crops.map(c => `
    <div class="cc-crop-card">
      <div class="cc-crop-header cc-crop-header--${activeSeason}">
        <h4 class="cc-crop-name">${c.name}</h4>
        <span class="cc-crop-subtitle">${c.sub}</span>
        <span class="cc-crop-emoji" aria-hidden="true">${c.emoji}</span>
      </div>
      <div class="cc-crop-body">
        <div class="cc-timeline-box">
          <div class="cc-timeline-item">
            <span>Sowing (पेरणी)</span>
            <strong>${c.sowing}</strong>
          </div>
          <div class="cc-timeline-item" style="text-align:right;">
            <span>Harvest (काढणी)</span>
            <strong>${c.harvesting}</strong>
          </div>
        </div>

        <div class="cc-detail-row">
          <i class="fas fa-tint" aria-hidden="true"></i>
          <span><strong>Water:</strong> ${c.water}</span>
        </div>

        <div class="cc-detail-row">
          <i class="fas fa-temperature-high" aria-hidden="true"></i>
          <span><strong>Temp:</strong> ${c.temp}</span>
        </div>

        <div class="cc-tips-box">
          <strong><i class="fas fa-lightbulb" aria-hidden="true"></i> Sowing Tip:</strong> ${c.tip}
        </div>
      </div>
    </div>
  `).join('');
}
