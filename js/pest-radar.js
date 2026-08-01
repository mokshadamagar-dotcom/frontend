/* ============================================================
   KrishiMitra AI – pest-radar.js
   Pest Radar Early Warning System – Interactive Engine
   ============================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
const PR_STATE = {
  language: localStorage.getItem('km_language') || 'en',
  district: 'Nagpur',
  crop: 'cotton',
  cropStage: 'vegetative',
  season: 'kharif',
  trendCharts: {}
};

// ── MULTILINGUAL CONTENT ─────────────────────────────────────
const PR_LANG = {
  en: {
    analysisRunning: 'Running Pest Radar Analysis...',
    analysisComplete: 'Analysis complete. Pest risk scores updated.',
    locationDetecting: 'Detecting your GPS location...',
    locationSuccess: (loc) => `Location detected: ${loc}`,
    locationError: 'Unable to detect location. Please enter manually.',
    alertCleared: 'All alerts cleared.',
  },
  hi: {
    analysisRunning: 'कीट राडार विश्लेषण चल रहा है...',
    analysisComplete: 'विश्लेषण पूर्ण। कीट जोखिम स्कोर अपडेट किया गया।',
    locationDetecting: 'आपकी GPS स्थान खोज रहे हैं...',
    locationSuccess: (loc) => `स्थान पहचाना गया: ${loc}`,
    locationError: 'स्थान पहचानने में असमर्थ। कृपया मैन्युअल रूप से दर्ज करें।',
    alertCleared: 'सभी अलर्ट साफ किए गए।',
  },
  mr: {
    analysisRunning: 'कीड रडार विश्लेषण सुरू आहे...',
    analysisComplete: 'विश्लेषण पूर्ण. कीड जोखीम स्कोर अपडेट केला.',
    locationDetecting: 'आपले GPS स्थान शोधत आहे...',
    locationSuccess: (loc) => `स्थान आढळले: ${loc}`,
    locationError: 'स्थान आढळले नाही. कृपया स्वतः प्रविष्ट करा.',
    alertCleared: 'सर्व सूचना साफ केल्या.',
  }
};

function t(key, ...args) {
  const lang = PR_STATE.language;
  const entry = PR_LANG[lang]?.[key] || PR_LANG.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// ── DATA: NEARBY OUTBREAKS ───────────────────────────────────
const NEARBY_OUTBREAKS = [
  { district: 'Nagpur',     pest: 'Cotton Bollworm',  risk: 91, level: 'critical', farms: 1240 },
  { district: 'Wardha',     pest: 'Pink Bollworm',    risk: 74, level: 'high',     farms: 680  },
  { district: 'Yavatmal',   pest: 'Whitefly',          risk: 68, level: 'high',     farms: 920  },
  { district: 'Amravati',   pest: 'Thrips',            risk: 52, level: 'medium',   farms: 430  },
  { district: 'Akola',      pest: 'Aphids',            risk: 45, level: 'medium',   farms: 310  },
  { district: 'Latur',      pest: 'Stem Borer',        risk: 22, level: 'low',      farms: 95   },
];

// ── DATA: AI PREDICTIONS ─────────────────────────────────────
const AI_PREDICTIONS = [
  {
    pest: 'Cotton Bollworm',
    crop: 'Cotton',
    risk: 91,
    level: 'critical',
    next7: 'Probability increases by 12% over next 7 days with current weather pattern.',
    icon: 'fas fa-bug',
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    pest: 'Whitefly (Bemisia tabaci)',
    crop: 'Cotton / Tomato',
    risk: 74,
    level: 'high',
    next7: 'Sustained high risk through next week. Humidity favors nymphal development.',
    icon: 'fas fa-circle-dot',
    iconBg: '#ffedd5',
    iconColor: '#ea580c',
  },
  {
    pest: 'Aphids (Aphis gossypii)',
    crop: 'Cotton / Onion',
    risk: 52,
    level: 'medium',
    next7: 'Moderate risk. Natural predator (ladybug) population may reduce spread.',
    icon: 'fas fa-virus',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    pest: 'Thrips (Frankliniella)',
    crop: 'Onion / Groundnut',
    risk: 38,
    level: 'medium',
    next7: 'Risk declining. Expected rainfall may disrupt thrip colonies.',
    icon: 'fas fa-bacterium',
    iconBg: '#e0f2fe',
    iconColor: '#0369a1',
  },
];

// ── DATA: HIGH RISK CROPS ────────────────────────────────────
const HIGH_RISK_CROPS = [
  { name: 'Cotton',   pest: 'Bollworm + Whitefly', risk: 91, icon: 'fas fa-leaf-maple',  iconBg: '#fee2e2', iconColor: '#dc2626', barColor: '#dc2626' },
  { name: 'Tomato',   pest: 'Whitefly + Mites',     risk: 74, icon: 'fas fa-apple-alt',   iconBg: '#ffedd5', iconColor: '#ea580c', barColor: '#f97316' },
  { name: 'Soybean',  pest: 'Pod Borer + Aphids',   risk: 61, icon: 'fas fa-seedling',    iconBg: '#fef3c7', iconColor: '#d97706', barColor: '#f59e0b' },
  { name: 'Onion',    pest: 'Thrips',                risk: 45, icon: 'fas fa-circle',      iconBg: '#dcfce7', iconColor: '#16a34a', barColor: '#22c55e' },
  { name: 'Wheat',    pest: 'Aphids + Termites',    risk: 28, icon: 'fas fa-wheat-awn',   iconBg: '#e0f2fe', iconColor: '#0369a1', barColor: '#3b82f6' },
];

// ── DATA: ACTION CHECKLIST ───────────────────────────────────
const CHECKLIST_ITEMS = [
  { text: 'Install yellow sticky traps in cotton field',       sub: 'Place 10–15 traps per acre. Check every 3 days.',         priority: 'urgent',  done: false },
  { text: 'Apply Neem Oil spray (2% concentration)',            sub: 'Use EC grade neem oil early morning or evening.',          priority: 'urgent',  done: true  },
  { text: 'Inspect field borders and host plants weekly',       sub: 'Focus on underside of leaves for early signs.',            priority: 'normal',  done: false },
  { text: 'Release Trichogramma parasitoid wasps',              sub: '1.5 lakh/acre. Contact KVK for supply.',                   priority: 'normal',  done: false },
  { text: 'Avoid applying broad-spectrum insecticides',         sub: 'Protect beneficial insects. Use targeted pesticides.',     priority: 'caution', done: false },
  { text: 'Report outbreak to local Krishi Kendra',            sub: 'Timely reporting helps district-level surveillance.',      priority: 'normal',  done: true  },
  { text: 'Schedule chemical spray if risk crosses 80%',        sub: 'Use Emamectin Benzoate 5% SG @ 200ml/acre.',              priority: 'caution', done: false },
];

// ── DATA: ALERT TIMELINE ─────────────────────────────────────
const ALERT_TIMELINE = [
  {
    title: 'CRITICAL: Cotton Bollworm Alert — Nagpur',
    desc: 'Risk score crossed 90%. Immediate field inspection and preventive spray recommended.',
    time: '2 hours ago',
    level: 'critical',
    icon: 'fas fa-triangle-exclamation'
  },
  {
    title: 'HIGH: Whitefly Surge Detected — Wardha',
    desc: 'Farmer reports indicate active whitefly colonies on cotton. High humidity is fueling spread.',
    time: '6 hours ago',
    level: 'high',
    icon: 'fas fa-circle-exclamation'
  },
  {
    title: 'Weather Alert: High Humidity Condition',
    desc: 'Relative humidity above 80% for 3 consecutive days. Optimal conditions for aphid & thrips breeding.',
    time: '1 day ago',
    level: 'medium',
    icon: 'fas fa-cloud-rain'
  },
  {
    title: 'Outbreak Contained: Pink Bollworm — Amravati',
    desc: 'Coordinated spray program by district agriculture office successfully reduced risk to LOW.',
    time: '3 days ago',
    level: 'low',
    icon: 'fas fa-shield-check'
  },
  {
    title: 'Government Advisory: NCIPM Alert Issued',
    desc: 'National Centre for Integrated Pest Management issued advisory for Vidarbha region. Check recommendations.',
    time: '5 days ago',
    level: 'medium',
    icon: 'fas fa-landmark'
  },
];

// ── DATA: PEST HISTORY ───────────────────────────────────────
const PEST_HISTORY = [
  { date: 'Jul 24, 2026', pest: 'Cotton Bollworm', crop: 'Cotton', score: 91, level: 'critical', stage: 'Vegetative', action: 'Neem spray applied',        outcome: 'Monitoring' },
  { date: 'Jul 18, 2026', pest: 'Aphids',           crop: 'Cotton', score: 52, level: 'medium',   stage: 'Seedling',   action: 'Yellow sticky traps set',   outcome: 'Controlled' },
  { date: 'Jul 10, 2026', pest: 'Whitefly',          crop: 'Tomato', score: 68, level: 'high',     stage: 'Flowering',  action: 'Chemical spray (Imida.)',   outcome: 'Resolved'   },
  { date: 'Jun 28, 2026', pest: 'Thrips',            crop: 'Onion',  score: 38, level: 'medium',   stage: 'Vegetative', action: 'Trichogramma released',     outcome: 'Controlled' },
  { date: 'Jun 15, 2026', pest: 'Mealybug',          crop: 'Cotton', score: 22, level: 'low',      stage: 'Seedling',   action: 'No action needed',          outcome: 'Cleared'    },
];

// ── DATA: TREATMENT GUIDE ────────────────────────────────────
const TREATMENT_DB = {
  bollworm: {
    organic: [
      { name: 'Neem Oil Spray', dose: '2% @ 5ml/L', desc: 'Disrupt feeding and growth of larvae. Apply in evening hours.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
      { name: 'Bacillus thuringiensis (Bt)', dose: '1g/L water', desc: 'Biological toxin specific to caterpillar larvae. Very effective.', icon: 'fas fa-flask', bg: '#f0fdf4', color: '#15803d' },
      { name: 'Neem Kernel Extract (NSKE)', dose: '5% solution', desc: 'Deters egg-laying by adult moths. Spray in early morning.', icon: 'fas fa-seedling', bg: '#dcfce7', color: '#166534' },
    ],
    biological: [
      { name: 'Trichogramma Wasps', dose: '1.5 lakh/acre', desc: 'Parasitizes bollworm eggs. Release at egg-laying stage.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
      { name: 'Helicoverpa NPV', dose: '250 LE/acre', desc: 'Nuclear Polyhedrosis Virus specific to bollworm. Very effective.', icon: 'fas fa-vial', bg: '#dbeafe', color: '#1d4ed8' },
      { name: 'Chrysoperla (Lacewing)', dose: '40,000 eggs/acre', desc: 'Larval predator of bollworm. Reduces pest population significantly.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#15803d' },
    ],
    chemical: [
      { name: 'Emamectin Benzoate 5% SG', dose: '200 ml/acre', desc: 'Highly effective against early instar larvae. Use before flower formation.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
      { name: 'Chlorantraniliprole 18.5% SC', dose: '150 ml/acre', desc: 'Long residual activity. Rainfast after 2 hours.', icon: 'fas fa-flask', bg: '#fff7ed', color: '#c2410c' },
      { name: 'Indoxacarb 14.5% SC', dose: '400 ml/acre', desc: 'Acts by sodium channel blocking. Effective in 3–5 days.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#b91c1c' },
    ],
    ipm: [
      { name: 'Pheromone Trap Monitoring', dose: '5 traps/acre', desc: 'Use Helilure lure. Count moths weekly. Act when >5 moths/trap/night.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
      { name: 'Damage Threshold ETL', dose: '5 egg masses/100 plants', desc: 'Apply spray only after Economic Threshold Level is crossed.', icon: 'fas fa-chart-simple', bg: '#dbeafe', color: '#1d4ed8' },
      { name: 'Crop Rotation Protocol', dose: 'Next season', desc: 'Avoid continuous cotton cultivation. Alternate with soybean or maize.', icon: 'fas fa-tractor', bg: '#dcfce7', color: '#15803d' },
    ],
    cultural: [
      { name: 'Deep Summer Plowing', dose: 'May-June', desc: 'Expose pupae to sun and birds. Kills overwintering stages.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
      { name: 'Bird Perches (T-stakes)', dose: '10 perches/acre', desc: 'Attract insectivorous birds that feed on larval pests.', icon: 'fas fa-crow', bg: '#f0fdf4', color: '#15803d' },
      { name: 'Trash/Stubble Disposal', dose: 'After harvest', desc: 'Remove and destroy crop residue to eliminate overwintering sites.', icon: 'fas fa-fire', bg: '#fff7ed', color: '#c2410c' },
    ],
  },
  whitefly: {
    organic: [
      { name: 'Neem Oil + Soap Spray', dose: '3ml/L + 1ml soap', desc: 'Coats body and disrupts feeding. Apply thoroughly to leaf undersides.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
      { name: 'Garlic-Chilli Extract', dose: '2% solution', desc: 'Natural repellent. Spray every 5 days for best results.', icon: 'fas fa-seedling', bg: '#fef3c7', color: '#92400e' },
    ],
    biological: [
      { name: 'Encarsia formosa (Parasitoid)', dose: '1 wasp/plant', desc: 'Parasitizes whitefly nymphs. Very effective in protected cultivation.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
      { name: 'Beauveria bassiana', dose: '5g/L water', desc: 'Entomopathogenic fungus. Infects and kills whitefly adults.', icon: 'fas fa-flask', bg: '#dbeafe', color: '#1d4ed8' },
    ],
    chemical: [
      { name: 'Imidacloprid 17.8% SL', dose: '150 ml/acre', desc: 'Systemic insecticide. Very effective against nymphs.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
      { name: 'Thiamethoxam 25% WG', dose: '100g/acre', desc: 'Rapid knockdown. Do not apply near flowering crops.', icon: 'fas fa-flask', bg: '#fff7ed', color: '#c2410c' },
    ],
    ipm: [
      { name: 'Yellow Sticky Traps', dose: '15 traps/acre', desc: 'Mass trapping of adults. Replace every 15 days.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Destroy Host Weeds', dose: 'Regular', desc: 'Remove wild hosts (parthenium, bittergourd) around field borders.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  aphids: {
    organic: [
      { name: 'Neem Oil Spray', dose: '2% solution', desc: 'Disrupts aphid colony establishment. Apply 2x per week.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Ladybird Beetle (Coccinella)', dose: 'Natural release', desc: 'Key natural predator of aphids. Avoid broad-spectrum pesticides.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Dimethoate 30% EC', dose: '400 ml/acre', desc: 'Systemic action. Effective within 24 hours.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Natural Enemy Conservation', dose: 'Ongoing', desc: 'Avoid pesticide spray in early stage. Allow predator buildup.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Reflective Mulches', dose: 'Season-long', desc: 'Silver/white mulches repel aphids visually. Reduces virus spread.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  thrips: {
    organic: [
      { name: 'Spinosad (Organic)', dose: '1ml/L', desc: 'Derived from soil bacteria. Highly effective against thrips.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Predatory mite (Amblyseius)', dose: '50/m²', desc: 'Natural predator. Effective in high humidity conditions.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Fipronil 5% SC', dose: '600 ml/acre', desc: 'Fast-acting. Apply early morning when thrips are active.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Blue Sticky Traps', dose: '15 traps/acre', desc: 'Thrips are attracted to blue color. Monitor weekly.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Avoid Dry Conditions', dose: 'Irrigation', desc: 'Thrips thrive in dry conditions. Maintain field moisture.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  mealybug: {
    organic: [
      { name: 'Neem-based spray', dose: '5ml/L', desc: 'Weekly spray on infested areas. Effective against crawlers.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Cryptolaemus montrouzieri', dose: '10 beetles/plant', desc: 'Australian ladybird. Major predator of mealybugs.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Buprofezin 25% SC', dose: '400ml/acre', desc: 'Growth regulator. Effective against nymphs.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Stem Banding Method', dose: 'Apply barrier', desc: 'Apply grease band on plant stem to stop crawler movement.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Remove Ant Colonies', dose: 'Early season', desc: 'Ants protect mealybugs from predators. Eliminate ant colonies first.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  'stem-borer': {
    organic: [
      { name: 'Neem Cake Application', dose: '25 kg/acre', desc: 'Soil application at transplanting. Reduces larval survival.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Trichogramma japonicum', dose: '1 lakh/acre', desc: 'Egg parasitoid. Most effective biological control for stem borer.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Chlorpyrifos 20% EC', dose: '1L/acre', desc: 'Apply at 25 DAT with 20 kg sand as granule application.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Light Trap Monitoring', dose: '1 trap/5 acres', desc: 'Count adults nightly. Act at ETL of 1 moth/trap/night.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Timely Transplanting', dose: 'Jun 20 – Jul 10', desc: 'Avoid pest peak period. Synchronize with recommended sowing windows.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
};

// ── CHART INSTANCES ──────────────────────────────────────────
let trendChart, freqChart, districtChart;

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanguageSelector();
  initNearbyOutbreaks();
  initPredictionGrid();
  initCropRiskList();
  initActionChecklist();
  loadTreatmentGuide('bollworm');
  initTreatmentTabs();
  initTimeline();
  initHistoryTable();
  initCharts();
  initRadarMap();
  initAnalysisForm();
  initGPSButton();
});

// ── LANGUAGE SELECTOR ────────────────────────────────────────
function initLanguageSelector() {
  const sel = document.getElementById('pr-lang-select');
  if (!sel) return;
  sel.value = PR_STATE.language;
  sel.addEventListener('change', () => {
    PR_STATE.language = sel.value;
    localStorage.setItem('km_language', sel.value);
  });
}

// ── NEARBY OUTBREAKS LIST ────────────────────────────────────
function initNearbyOutbreaks() {
  const container = document.getElementById('pr-nearby-list');
  if (!container) return;

  const colorsMap = {
    critical: { dot: '#7f1d1d', text: '#7f1d1d' },
    high:     { dot: '#dc2626', text: '#dc2626' },
    medium:   { dot: '#f59e0b', text: '#d97706' },
    low:      { dot: '#16a34a', text: '#16a34a' },
  };

  container.innerHTML = NEARBY_OUTBREAKS.map(item => {
    const c = colorsMap[item.level] || colorsMap.low;
    return `
      <div class="pr-nearby-item" role="listitem">
        <div class="pr-nearby-item__dot" style="background:${c.dot};"></div>
        <div class="pr-nearby-item__info">
          <div class="pr-nearby-item__district">${item.district}</div>
          <div class="pr-nearby-item__pest">${item.pest} · ${item.farms.toLocaleString()} farms</div>
        </div>
        <div class="pr-nearby-item__risk" style="color:${c.text};">${item.risk}%</div>
        <span class="pr-risk-chip pr-risk-chip--${item.level}" style="font-size:0.6rem;">${capitalize(item.level)}</span>
      </div>
    `;
  }).join('');
}

// ── AI PREDICTION GRID ────────────────────────────────────────
function initPredictionGrid() {
  const container = document.getElementById('pr-prediction-grid');
  if (!container) return;

  container.innerHTML = AI_PREDICTIONS.map(p => `
    <div class="pr-pred-card">
      <div class="pr-pred-card__header">
        <div class="pr-pred-card__icon" style="background:${p.iconBg};color:${p.iconColor};">
          <i class="${p.icon}"></i>
        </div>
        <div>
          <div class="pr-pred-card__pest">${p.pest}</div>
          <div class="pr-pred-card__crop">${p.crop}</div>
        </div>
      </div>
      <div class="pr-pred-card__body">
        <div class="pr-pred-bar-wrap">
          <div class="pr-pred-bar">
            <div class="pr-pred-bar-fill pr-pred-bar-fill--${p.level}" style="width:${p.risk}%;"></div>
          </div>
          <div class="pr-pred-score" style="color:${riskColor(p.level)};">${p.risk}</div>
        </div>
        <div style="margin-bottom:6px;">
          <span class="pr-risk-chip pr-risk-chip--${p.level}" style="font-size:0.62rem;">${capitalize(p.level)} Risk</span>
        </div>
        <div class="pr-pred-next7">
          <strong>AI 7-Day Forecast:</strong><br/>${p.next7}
        </div>
      </div>
    </div>
  `).join('');
}

// ── HIGH RISK CROP LIST ───────────────────────────────────────
function initCropRiskList() {
  const container = document.getElementById('pr-crop-risk-list');
  if (!container) return;

  container.innerHTML = HIGH_RISK_CROPS.map(c => `
    <div class="pr-crop-risk-item" role="listitem">
      <div class="pr-crop-risk-item__icon" style="background:${c.iconBg};color:${c.iconColor};">
        <i class="${c.icon}"></i>
      </div>
      <div class="pr-crop-risk-item__info">
        <div class="pr-crop-risk-item__name">${c.name}</div>
        <div class="pr-crop-risk-item__pest">${c.pest}</div>
      </div>
      <div class="pr-crop-risk-item__bar-wrap">
        <div class="pr-crop-risk-item__bar">
          <div class="pr-crop-risk-item__bar-fill" style="width:${c.risk}%;background:${c.barColor};"></div>
        </div>
        <div class="pr-crop-risk-item__pct" style="color:${c.barColor};">${c.risk}%</div>
      </div>
    </div>
  `).join('');
}

// ── ACTION CHECKLIST ──────────────────────────────────────────
function initActionChecklist() {
  const container = document.getElementById('pr-action-checklist');
  if (!container) return;

  const priorityMap = {
    urgent:  { bg: '#fee2e2', color: '#991b1b', label: 'Urgent'  },
    normal:  { bg: '#dcfce7', color: '#166534', label: 'Normal'  },
    caution: { bg: '#fef3c7', color: '#92400e', label: 'Caution' },
  };

  container.innerHTML = CHECKLIST_ITEMS.map((item, i) => {
    const p = priorityMap[item.priority] || priorityMap.normal;
    return `
      <div class="pr-checklist-item ${item.done ? 'done' : ''}" role="listitem" onclick="toggleChecklist(${i})" id="pr-check-${i}">
        <div class="pr-checklist-item__check" id="pr-checkmark-${i}">
          ${item.done ? '<i class="fas fa-check" style="font-size:0.55rem;"></i>' : ''}
        </div>
        <div class="pr-checklist-item__content">
          <div class="pr-checklist-item__text" id="pr-check-text-${i}">${item.text}</div>
          <div class="pr-checklist-item__sub">${item.sub}</div>
        </div>
        <span class="pr-checklist-item__priority" style="background:${p.bg};color:${p.color};">${p.label}</span>
      </div>
    `;
  }).join('');
}

function toggleChecklist(index) {
  CHECKLIST_ITEMS[index].done = !CHECKLIST_ITEMS[index].done;
  const item = document.getElementById(`pr-check-${index}`);
  const check = document.getElementById(`pr-checkmark-${index}`);
  const text = document.getElementById(`pr-check-text-${index}`);
  if (!item) return;

  if (CHECKLIST_ITEMS[index].done) {
    item.classList.add('done');
    check.innerHTML = '<i class="fas fa-check" style="font-size:0.55rem;"></i>';
    text.style.textDecoration = 'line-through';
  } else {
    item.classList.remove('done');
    check.innerHTML = '';
    text.style.textDecoration = '';
  }

  // Update actions done counter
  const doneCount = CHECKLIST_ITEMS.filter(i => i.done).length;
  const el = document.getElementById('pr-actions-done-num');
  if (el) el.textContent = `${doneCount}/${CHECKLIST_ITEMS.length}`;
  const sparkEl = document.querySelector('.pr-sparkbar-fill--green');
  if (sparkEl) sparkEl.style.width = `${Math.round((doneCount / CHECKLIST_ITEMS.length) * 100)}%`;
}

// ── TREATMENT GUIDE ───────────────────────────────────────────
function loadTreatmentGuide(pestKey) {
  const data = TREATMENT_DB[pestKey] || TREATMENT_DB.bollworm;
  const tabMap = {
    'pr-organic-content':    data.organic    || [],
    'pr-biological-content': data.biological || [],
    'pr-chemical-content':   data.chemical   || [],
    'pr-ipm-content':        data.ipm        || [],
    'pr-cultural-content':   data.cultural   || [],
  };

  Object.entries(tabMap).forEach(([id, items]) => {
    const container = document.getElementById(id);
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<p style="font-size:0.82rem;color:var(--text-light);padding:12px 0;">No specific treatment data available for this pest type.</p>';
      return;
    }
    container.innerHTML = items.map(item => `
      <div class="pr-treatment-card">
        <div class="pr-treatment-card__header">
          <div class="pr-treatment-card__icon" style="background:${item.bg};color:${item.color};">
            <i class="${item.icon}"></i>
          </div>
          <div class="pr-treatment-card__name">${item.name}</div>
        </div>
        <div class="pr-treatment-card__dose">${item.dose}</div>
        <div class="pr-treatment-card__desc">${item.desc}</div>
      </div>
    `).join('');
  });
}

function initTreatmentTabs() {
  const tabBtns = document.querySelectorAll('.pr-treatment-tabs .control-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const tabId = btn.getAttribute('data-tab');
      document.querySelectorAll('.pr-treatment-guide .control-content-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      const activePanel = document.getElementById(tabId);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}

// ── ALERT TIMELINE ────────────────────────────────────────────
function initTimeline() {
  const container = document.getElementById('pr-timeline');
  if (!container) return;
  renderTimeline(container, ALERT_TIMELINE);
}

function renderTimeline(container, items) {
  container.innerHTML = items.map(item => `
    <div class="pr-timeline-item" role="listitem">
      <div class="pr-timeline-item__icon pr-timeline-item__icon--${item.level}">
        <i class="${item.icon}"></i>
      </div>
      <div class="pr-timeline-item__content">
        <div class="pr-timeline-item__title">${item.title}</div>
        <div class="pr-timeline-item__desc">${item.desc}</div>
        <div class="pr-timeline-item__meta">
          <span class="pr-timeline-item__time"><i class="fas fa-clock"></i> ${item.time}</span>
          <span class="pr-risk-chip pr-risk-chip--${item.level}" style="font-size:0.6rem;">${capitalize(item.level)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function clearAlertTimeline() {
  const container = document.getElementById('pr-timeline');
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center;padding:32px;color:var(--text-light);">
      <i class="fas fa-check-circle" style="font-size:2rem;color:#22c55e;display:block;margin-bottom:12px;"></i>
      <strong>No active alerts</strong><br/>
      <span style="font-size:0.8rem;">All alerts cleared. The pest radar is monitoring your area.</span>
    </div>
  `;
  showToastMessage(t('alertCleared'), 'success');
}

// ── PEST HISTORY TABLE ────────────────────────────────────────
function initHistoryTable() {
  const tbody = document.getElementById('pr-history-tbody');
  if (!tbody) return;

  const levelColors = {
    critical: { chip: 'pr-risk-chip--critical', bar: '#7f1d1d' },
    high:     { chip: 'pr-risk-chip--high',     bar: '#dc2626' },
    medium:   { chip: 'pr-risk-chip--medium',   bar: '#f59e0b' },
    low:      { chip: 'pr-risk-chip--low',       bar: '#16a34a' },
  };

  tbody.innerHTML = PEST_HISTORY.map(row => {
    const c = levelColors[row.level] || levelColors.low;
    return `
      <tr style="border-bottom:1px solid var(--dash-border);">
        <td style="padding:12px 16px;color:var(--text-secondary);font-size:0.82rem;">${row.date}</td>
        <td style="padding:12px 16px;font-weight:700;color:#1e293b;font-size:0.84rem;">${row.pest}</td>
        <td style="padding:12px 16px;color:var(--text-secondary);font-size:0.82rem;">${row.crop}</td>
        <td style="padding:12px 16px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:50px;height:6px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
              <div style="width:${row.score}%;height:100%;background:${c.bar};border-radius:999px;"></div>
            </div>
            <span style="font-size:0.82rem;font-weight:700;color:${c.bar};">${row.score}</span>
          </div>
        </td>
        <td style="padding:12px 16px;font-size:0.8rem;color:var(--text-secondary);">${row.stage}</td>
        <td style="padding:12px 16px;font-size:0.8rem;color:var(--text-secondary);">${row.action}</td>
        <td style="padding:12px 16px;">
          <span class="pr-risk-chip" style="font-size:0.65rem;${row.outcome === 'Resolved' || row.outcome === 'Controlled' || row.outcome === 'Cleared' ? 'background:#dcfce7;color:#166534;' : row.outcome === 'Monitoring' ? 'background:#fef3c7;color:#92400e;' : 'background:#f1f5f9;color:#475569;'}">${row.outcome}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// ── CHARTS (Chart.js) ─────────────────────────────────────────
function initCharts() {
  initTrendChart(30);
  initFreqChart();
  initDistrictChart();
}

function initTrendChart(days) {
  const ctx = document.getElementById('pr-trend-chart');
  if (!ctx) return;

  const labels = generateDateLabels(days);
  const data = generateTrendData(days);

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Pest Risk Score',
        data,
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220,38,38,0.08)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#dc2626',
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          callbacks: {
            label: ctx => ` Risk Score: ${ctx.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          min: 0, max: 100,
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 11 }, color: '#64748b' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#64748b', maxTicksLimit: 8 }
        }
      }
    }
  });
}

function initFreqChart() {
  const ctx = document.getElementById('pr-pest-freq-chart');
  if (!ctx) return;

  if (freqChart) freqChart.destroy();

  freqChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Bollworm', 'Whitefly', 'Aphids', 'Thrips', 'Mealybug', 'Stem Borer'],
      datasets: [{
        label: 'Outbreaks This Season',
        data: [24, 18, 14, 10, 6, 8],
        backgroundColor: ['#dc2626','#ea580c','#f59e0b','#eab308','#16a34a','#2563eb'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
        }
      },
      scales: {
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 11 }, color: '#64748b' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#64748b' }
        }
      }
    }
  });
}

function initDistrictChart() {
  const ctx = document.getElementById('pr-district-chart');
  if (!ctx) return;

  if (districtChart) districtChart.destroy();

  districtChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Nagpur', 'Wardha', 'Yavatmal', 'Amravati', 'Akola', 'Washim', 'Latur', 'Osmanabad', 'Buldhana', 'Chandrapur'],
      datasets: [{
        label: 'Pest Risk Score',
        data: [91, 74, 68, 52, 45, 40, 22, 35, 48, 18],
        backgroundColor: (ctx) => {
          const v = ctx.raw;
          if (v >= 81) return '#7f1d1d';
          if (v >= 61) return '#dc2626';
          if (v >= 31) return '#f59e0b';
          return '#16a34a';
        },
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          callbacks: {
            label: ctx => ` Risk Score: ${ctx.parsed.x}`
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 100,
          grid: { color: '#f1f5f9' },
          ticks: { font: { size: 10 }, color: '#64748b' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#64748b' }
        }
      }
    }
  });
}

function updateTrendCharts(days) {
  initTrendChart(parseInt(days));
}

function generateDateLabels(days) {
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
  }
  return labels;
}

function generateTrendData(days) {
  const base = [20, 25, 30, 28, 35, 40, 38, 45, 50, 55, 58, 62, 65, 70, 68, 74, 76, 80, 82, 78, 85, 88, 91, 90, 87, 85, 89, 92, 91, 93];
  return base.slice(0, days).map((v, i) => Math.min(100, Math.max(0, v + Math.random() * 6 - 3)));
}

// ── RADAR MAP INTERACTIONS ────────────────────────────────────
function initRadarMap() {
  const hotspots = document.querySelectorAll('.pr-hotspot');
  const tooltip = document.getElementById('pr-map-tooltip');

  hotspots.forEach(spot => {
    const show = () => {
      if (!tooltip) return;
      const d = spot.dataset;
      document.getElementById('pr-tt-district').textContent = d.district || '';
      document.getElementById('pr-tt-pest').textContent = d.pest || '';
      document.getElementById('pr-tt-risk').textContent = `${d.risk}%`;
      document.getElementById('pr-tt-farms').textContent = d.farms || '';

      const levelEl = document.getElementById('pr-tt-level');
      if (levelEl) {
        levelEl.textContent = d.riskLevel || 'Unknown';
        levelEl.className = `pr-risk-chip pr-risk-chip--${(d.riskLevel || '').toLowerCase()}`;
      }

      tooltip.style.display = 'block';
      tooltip.removeAttribute('aria-hidden');
    };

    const hide = () => {
      if (tooltip) {
        tooltip.style.display = 'none';
        tooltip.setAttribute('aria-hidden', 'true');
      }
    };

    spot.addEventListener('mouseenter', show);
    spot.addEventListener('focus', show);
    spot.addEventListener('mouseleave', hide);
    spot.addEventListener('blur', hide);
    spot.addEventListener('click', show);
    spot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') show();
      if (e.key === 'Escape') hide();
    });
  });
}

// ── ANALYSIS FORM ─────────────────────────────────────────────
function initAnalysisForm() {
  const form = document.getElementById('pr-analysis-form');
  const runBtn = document.getElementById('pr-run-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!runBtn) return;

    runBtn.disabled = true;
    runBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('analysisRunning')}`;

    // Simulate analysis delay
    await sleep(1800);

    const district = document.getElementById('pr-district')?.value || 'Nagpur';
    const taluka   = document.getElementById('pr-taluka')?.value  || '';
    const village  = document.getElementById('pr-village')?.value || '';

    PR_STATE.district = district;

    // Build full location string from what the user actually selected
    const locationParts = ['Maharashtra'];
    if (district) locationParts.push(district);
    if (taluka)   locationParts.push(taluka);
    if (village)  locationParts.push(village);
    const fullLocation = locationParts.join(' › ');

    // Update location display box to reflect real selection
    const locBox  = document.getElementById('pr-selected-location-box');
    const locText = document.getElementById('pr-selected-location-text');
    if (locText) locText.textContent = fullLocation;
    if (locBox)  locBox.style.display = district ? 'block' : 'none';

    // Update weather panel based on selected district
    updateWeatherForDistrict(district);

    // Update risk score (simulate)
    animateRiskScore(Math.floor(Math.random() * 30) + 60);

    runBtn.disabled = false;
    runBtn.innerHTML = `<i class="fas fa-radar"></i> Run Pest Radar Analysis`;

    showToastMessage(`${t('analysisComplete')} (${fullLocation})`, 'success');

    // Scroll to results
    document.getElementById('pr-prediction-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ── GPS BUTTON ────────────────────────────────────────────────
function initGPSButton() {
  const btn = document.getElementById('pr-gps-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToastMessage(t('locationError'), 'error');
      return;
    }

    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('locationDetecting')}`;
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Use coordinates to display (simplified)
        const loc = `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`;
        showToastMessage(t('locationSuccess', loc), 'success');
        btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> Location Detected`;
        btn.disabled = false;
      },
      () => {
        showToastMessage(t('locationError'), 'error');
        btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> Auto-Detect My Location (GPS)`;
        btn.disabled = false;
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}

// ── HELPERS ──────────────────────────────────────────────────
function updateWeatherForDistrict(district) {
  const weatherData = {
    'Nagpur':     { temp: '36°C', humidity: '82%', rain: '18mm', wind: '12 km/h', assess: 'High humidity + warm temperature = Optimal pest breeding conditions' },
    'Pune':       { temp: '28°C', humidity: '75%', rain: '8mm',  wind: '8 km/h',  assess: 'Moderate humidity. Monitor cotton and tomato crops closely.' },
    'Nashik':     { temp: '26°C', humidity: '65%', rain: '4mm',  wind: '10 km/h', assess: 'Low risk weather. Continue standard monitoring.' },
    'Wardha':     { temp: '35°C', humidity: '80%', rain: '14mm', wind: '9 km/h',  assess: 'High temperature + high humidity = Elevated bollworm risk' },
    'Amravati':   { temp: '34°C', humidity: '72%', rain: '10mm', wind: '7 km/h',  assess: 'Moderate pest risk. Watch for thrips on onion crops.' },
    'Yavatmal':   { temp: '33°C', humidity: '78%', rain: '16mm', wind: '11 km/h', assess: 'Whitefly-favorable conditions persist. Increase monitoring frequency.' },
    'Aurangabad': { temp: '32°C', humidity: '55%', rain: '2mm',  wind: '14 km/h', assess: 'Dry conditions. Low pest risk currently.' },
    'Latur':      { temp: '31°C', humidity: '50%', rain: '0mm',  wind: '12 km/h', assess: 'Dry and warm. Minimal pest risk. Standard checks sufficient.' },
  };

  const w = weatherData[district] || weatherData['Nagpur'];

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('pr-w-temp', w.temp);
  set('pr-w-humidity', w.humidity);
  set('pr-w-rain', w.rain);
  set('pr-w-wind', w.wind);
  set('pr-weather-assessment', w.assess);
}

function animateRiskScore(target) {
  const numEl = document.getElementById('pr-risk-score-num');
  const arc = document.getElementById('pr-gauge-arc');
  const chip = document.getElementById('pr-risk-level-chip');
  if (!numEl) return;

  let current = parseInt(numEl.textContent) || 0;
  const step = target > current ? 1 : -1;
  const interval = setInterval(() => {
    if (current === target) { clearInterval(interval); return; }
    current += step;
    numEl.textContent = current;

    // Update SVG arc
    if (arc) {
      const total = 173;
      const offset = total - (current / 100) * total;
      arc.setAttribute('stroke-dashoffset', offset.toFixed(1));

      // Color
      let stroke = '#4ade80';
      if (current >= 81) stroke = '#7f1d1d';
      else if (current >= 61) stroke = '#ef4444';
      else if (current >= 31) stroke = '#f59e0b';
      arc.setAttribute('stroke', stroke);
    }

    // Update chip
    if (chip) {
      let label = 'LOW';
      let cls = 'pr-risk-chip--low';
      if (current >= 81)  { label = 'CRITICAL'; cls = 'pr-risk-chip--critical'; }
      else if (current >= 61) { label = 'HIGH'; cls = 'pr-risk-chip--high'; }
      else if (current >= 31) { label = 'MEDIUM'; cls = 'pr-risk-chip--medium'; }
      chip.textContent = `${label} RISK`;
      chip.className = `pr-risk-chip ${cls}`;
    }
  }, 16);
}

function riskColor(level) {
  const map = { critical: '#7f1d1d', high: '#dc2626', medium: '#d97706', low: '#16a34a' };
  return map[level] || '#64748b';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── SCROLL TO SECTION ─────────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── TOAST (use global or local fallback) ──────────────────────
function showToastMessage(message, type = 'info') {
  // Try to use global showToast from components.js
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
    return;
  }

  // Local fallback
  const container = document.querySelector('.toast-container') || (() => {
    const c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();

  const toast = document.createElement('div');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#2563eb' };

  toast.style.cssText = `
    display:flex;align-items:center;gap:10px;padding:12px 20px;
    background:#0f172a;color:#fff;border-radius:10px;font-size:0.85rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.25);max-width:360px;
    animation:fadeInUp 0.25s ease;pointer-events:auto;
  `;
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]};"></i> ${message}`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
