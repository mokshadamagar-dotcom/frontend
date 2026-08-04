/* ============================================================
   KrishiMitra AI – pest-radar.js
   Pest Radar Early Warning System – Interactive Engine (Dynamic Version)
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
  initTreatmentTabs();
  initAnalysisForm();
  initGPSButton();
  initRadarMapHoverDelegation();
  
  // Trigger initial run with defaults
  runRadarAnalysis();
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

// ── RUN RADAR ANALYSIS (CORE API FLOW) ───────────────────────
async function runRadarAnalysis() {
  const form = document.getElementById('pr-analysis-form');
  const runBtn = document.getElementById('pr-run-btn');
  if (!form) return;

  const state = document.getElementById('pr-state')?.value || 'Maharashtra';
  const district = document.getElementById('pr-district')?.value || 'Nagpur';
  const taluka = document.getElementById('pr-taluka')?.value || '';
  const village = document.getElementById('pr-village')?.value || '';
  const crop = document.getElementById('pr-crop')?.value || 'cotton';
  const cropStage = document.getElementById('pr-crop-stage')?.value || 'vegetative';
  const season = document.getElementById('pr-season')?.value || 'kharif';

  PR_STATE.district = district;
  PR_STATE.crop = crop;
  PR_STATE.cropStage = cropStage;
  PR_STATE.season = season;

  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('analysisRunning')}`;
  }

  // Visual loading overlay (fade)
  const overlayElements = [
    document.getElementById('pr-overall-risk-card'),
    document.getElementById('pr-prediction-grid'),
    document.getElementById('pr-nearby-list'),
    document.getElementById('pr-map-visual'),
    document.getElementById('pr-action-checklist')
  ];
  overlayElements.forEach(el => {
    if (el) el.style.opacity = '0.5';
  });

  try {
    const query = new URLSearchParams({
      state, district, taluka, village, crop, crop_stage: cropStage, season
    });
    const res = await fetch(`http://localhost:8000/api/v1/pest/radar/analysis?${query.toString()}`);
    if (!res.ok) throw new Error('API server responded with error');
    const data = await res.json();

    // ── Update Location display ─────────────────────────────
    const locBox = document.getElementById('pr-selected-location-box');
    const locText = document.getElementById('pr-selected-location-text');
    if (locText) locText.textContent = data.location;
    if (locBox) locBox.style.display = 'block';

    // ── Update Weather panel ────────────────────────────────
    const w = data.weatherSnap;
    if (w) {
      document.getElementById('pr-w-temp').textContent = w.temp;
      document.getElementById('pr-w-humidity').textContent = w.humidity;
      document.getElementById('pr-w-rain').textContent = w.rain;
      document.getElementById('pr-w-wind').textContent = w.wind;
      document.getElementById('pr-weather-assessment').innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${w.assess}`;
    }

    // ── Animate Risk Score and meter ────────────────────────
    animateRiskScore(data.overallRisk);

    // ── Update Alert Banner ─────────────────────────────────
    const banner = document.getElementById('pr-outbreak-banner');
    const bannerTitle = document.getElementById('pr-banner-title');
    const bannerDesc = document.getElementById('pr-banner-desc');
    if (banner) {
      if (data.overallRisk >= 50) {
        banner.style.display = 'flex';
        banner.className = `pr-outbreak-banner pr-outbreak-banner--${data.riskLevel}`;
        if (bannerTitle) bannerTitle.textContent = `${data.pestName} Outbreak — ${district} District`;
        if (bannerDesc) bannerDesc.textContent = `AI models indicate a ${data.probability}% probability of ${data.pestName} surge in ${district} and surrounding districts. Environmental factors (Temp: ${w.temp}, Humidity: ${w.humidity}) suggest immediate preventative measures.`;
      } else {
        banner.style.display = 'none';
      }
    }

    // ── Update Stats ────────────────────────────────────────
    const activeAlertsNum = document.getElementById('pr-active-alerts-num');
    if (activeAlertsNum) activeAlertsNum.textContent = data.activeAlerts.length;
    const activeAlertsSpark = document.querySelector('#pr-active-alerts-num ~ .pr-stat-sparkbar .pr-sparkbar-fill');
    if (activeAlertsSpark) activeAlertsSpark.style.width = `${Math.min(100, data.activeAlerts.length * 20)}%`;

    const farmsAffectedNum = document.getElementById('pr-farms-affected-num');
    if (farmsAffectedNum) farmsAffectedNum.textContent = data.farmsAffected.toLocaleString();
    const farmsAffectedSpark = document.querySelector('#pr-farms-affected-num ~ .pr-stat-sparkbar .pr-sparkbar-fill');
    if (farmsAffectedSpark) farmsAffectedSpark.style.width = `${Math.min(100, (data.farmsAffected / 5000) * 100)}%`;

    const weatherRiskNum = document.getElementById('pr-weather-risk-num');
    if (weatherRiskNum) weatherRiskNum.textContent = `${data.weatherRisk}%`;
    const weatherRiskSpark = document.querySelector('#pr-weather-risk-num ~ .pr-stat-sparkbar .pr-sparkbar-fill');
    if (weatherRiskSpark) weatherRiskSpark.style.width = `${data.weatherRisk}%`;

    // ── Update Nearby outbreaks list ────────────────────────
    renderNearbyOutbreaks(data.nearbyOutbreaks);

    // ── Update Predictions grid ─────────────────────────────
    renderPredictionGrid(data.predictions);

    // ── Update High Risk Crop List ──────────────────────────
    renderCropRiskList(data.highRiskCrops);

    // ── Update Timeline ─────────────────────────────────────
    renderTimeline(data.activeAlerts);

    // ── Update Treatment guide ──────────────────────────────
    const treatmentKey = getTreatmentKey(data.pestName);
    loadTreatmentGuide(treatmentKey);

    // ── Update Action checklist ─────────────────────────────
    renderActionChecklist(data.preventiveActions);

    // ── Update Map markers ──────────────────────────────────
    renderMapMarkers(data.mapMarkers);

    // ── Update Charts ───────────────────────────────────────
    updateTrendCharts(data.overallRisk);
    updateDistrictChart(data.mapMarkers);

    // ── Update Last updated time ────────────────────────────
    const timeElements = document.querySelectorAll('.pr-stat-card__footer span:last-child, .pr-timeline-item__time');
    timeElements.forEach(el => {
      if (el.innerHTML.includes('Updated')) {
        el.innerHTML = `<i class="fas fa-clock"></i> Just updated`;
      }
    });

    if (runBtn) {
      showToastMessage(`${t('analysisComplete')} (${data.location})`, 'success');
    }
  } catch (error) {
    console.error('Error running pest radar analysis:', error);
    showToastMessage('Failed to fetch real-time analysis from the backend server.', 'error');
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = `<i class="fas fa-radar"></i> Run Pest Radar Analysis`;
    }
    overlayElements.forEach(el => {
      if (el) el.style.opacity = '1.0';
    });
  }
}

// ── GET TREATMENT KEY MAPPER ─────────────────────────────────
function getTreatmentKey(pestName) {
  const name = pestName.toLowerCase();
  if (name.includes('bollworm') || name.includes('borer') || name.includes('caterpillar') || name.includes('grub')) {
    if (name.includes('stem borer') || name.includes('shoot borer')) return 'stem-borer';
    return 'bollworm';
  }
  if (name.includes('whitefly')) return 'whitefly';
  if (name.includes('aphid')) return 'aphids';
  if (name.includes('thrip')) return 'thrips';
  if (name.includes('mealybug')) return 'mealybug';
  return 'bollworm';
}

// ── NEARBY OUTBREAKS LIST ────────────────────────────────────
function renderNearbyOutbreaks(outbreaks) {
  const container = document.getElementById('pr-nearby-list');
  const countBadge = document.getElementById('pr-nearby-count');
  if (!container) return;

  if (countBadge) countBadge.textContent = `${outbreaks.length} active`;

  const colorsMap = {
    critical: { dot: '#7f1d1d', text: '#7f1d1d' },
    high:     { dot: '#dc2626', text: '#dc2626' },
    medium:   { dot: '#f59e0b', text: '#d97706' },
    low:      { dot: '#16a34a', text: '#16a34a' },
  };

  container.innerHTML = outbreaks.map(item => {
    const c = colorsMap[item.level] || colorsMap.low;
    return `
      <div class="pr-nearby-item" role="listitem" style="opacity:0; animation: fadeInUp 0.3s forwards;">
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
function renderPredictionGrid(predictions) {
  const container = document.getElementById('pr-prediction-grid');
  if (!container) return;

  container.innerHTML = predictions.map(p => `
    <div class="pr-pred-card" style="opacity:0; animation: fadeInUp 0.3s forwards;">
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
function renderCropRiskList(highRiskCrops) {
  const container = document.getElementById('pr-crop-risk-list');
  if (!container) return;

  container.innerHTML = highRiskCrops.map(c => `
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
let ACTIVE_CHECKLIST = [];
function renderActionChecklist(actions) {
  const container = document.getElementById('pr-action-checklist');
  if (!container) return;

  ACTIVE_CHECKLIST = actions;

  const priorityMap = {
    urgent:  { bg: '#fee2e2', color: '#991b1b', label: 'Urgent'  },
    normal:  { bg: '#dcfce7', color: '#166534', label: 'Normal'  },
    caution: { bg: '#fef3c7', color: '#92400e', label: 'Caution' },
  };

  container.innerHTML = ACTIVE_CHECKLIST.map((item, i) => {
    const p = priorityMap[item.priority] || priorityMap.normal;
    return `
      <div class="pr-checklist-item ${item.done ? 'done' : ''}" role="listitem" onclick="toggleChecklist(${i})" id="pr-check-${i}">
        <div class="pr-checklist-item__check" id="pr-checkmark-${i}">
          ${item.done ? '<i class="fas fa-check" style="font-size:0.55rem;"></i>' : ''}
        </div>
        <div class="pr-checklist-item__content">
          <div class="pr-checklist-item__text" id="pr-check-text-${i}" style="${item.done ? 'text-decoration: line-through;' : ''}">${item.text}</div>
          <div class="pr-checklist-item__sub">${item.sub}</div>
        </div>
        <span class="pr-checklist-item__priority" style="background:${p.bg};color:${p.color};">${p.label}</span>
      </div>
    `;
  }).join('');

  updateChecklistProgress();
}

function toggleChecklist(index) {
  if (!ACTIVE_CHECKLIST[index]) return;
  ACTIVE_CHECKLIST[index].done = !ACTIVE_CHECKLIST[index].done;
  const item = document.getElementById(`pr-check-${index}`);
  const check = document.getElementById(`pr-checkmark-${index}`);
  const text = document.getElementById(`pr-check-text-${index}`);
  if (!item) return;

  if (ACTIVE_CHECKLIST[index].done) {
    item.classList.add('done');
    check.innerHTML = '<i class="fas fa-check" style="font-size:0.55rem;"></i>';
    text.style.textDecoration = 'line-through';
  } else {
    item.classList.remove('done');
    check.innerHTML = '';
    text.style.textDecoration = '';
  }

  updateChecklistProgress();
}

function updateChecklistProgress() {
  const doneCount = ACTIVE_CHECKLIST.filter(i => i.done).length;
  const el = document.getElementById('pr-actions-done-num');
  if (el) el.textContent = `${doneCount}/${ACTIVE_CHECKLIST.length}`;
  const sparkEl = document.querySelector('.pr-sparkbar-fill--green');
  if (sparkEl && ACTIVE_CHECKLIST.length > 0) {
    sparkEl.style.width = `${Math.round((doneCount / ACTIVE_CHECKLIST.length) * 100)}%`;
  }
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
function renderTimeline(items) {
  const container = document.getElementById('pr-timeline');
  if (!container) return;
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

// ── RENDER DYNAMIC MAP MARKERS ───────────────────────────────
function renderMapMarkers(markers) {
  const container = document.getElementById('pr-map-visual');
  if (!container) return;

  // Clear existing markers (keep only radar-sweep-wrap and tooltip and watermark)
  const sweep = container.querySelector('.pr-radar-sweep-wrap');
  const tooltip = document.getElementById('pr-map-tooltip');
  const watermark = container.querySelector('.pr-map-watermark');

  container.innerHTML = '';
  if (sweep) container.appendChild(sweep);
  if (tooltip) container.appendChild(tooltip);
  if (watermark) container.appendChild(watermark);

  markers.forEach(marker => {
    const markerEl = document.createElement('div');
    markerEl.className = `pr-hotspot pr-hotspot--${marker.riskLevel} ${marker.isCenter ? 'pr-hotspot--center' : ''}`;
    markerEl.style.left = `${marker.x}%`;
    markerEl.style.top = `${marker.y}%`;
    markerEl.setAttribute('tabindex', '0');
    markerEl.setAttribute('role', 'button');
    markerEl.setAttribute('aria-label', `${marker.district}: ${marker.pest} - ${marker.riskLevel} ${marker.risk}%`);

    if (marker.isCenter || marker.riskLevel === 'critical' || marker.riskLevel === 'high') {
      const pulse = document.createElement('span');
      pulse.className = 'pr-hotspot__pulse';
      markerEl.appendChild(pulse);
    }

    const label = document.createElement('span');
    label.className = 'pr-hotspot__label';
    label.textContent = marker.district;
    markerEl.appendChild(label);

    // Bind data attributes for tooltip delegation
    markerEl.dataset.district = marker.district;
    markerEl.dataset.pest = marker.pest;
    markerEl.dataset.risk = marker.risk;
    markerEl.dataset.riskLevel = capitalize(marker.riskLevel);
    markerEl.dataset.farms = marker.farms.toLocaleString();

    container.appendChild(markerEl);
  });
}

// ── RADAR MAP HOVER DELEGATION ───────────────────────────────
function initRadarMapHoverDelegation() {
  const container = document.getElementById('pr-map-visual');
  const tooltip = document.getElementById('pr-map-tooltip');
  if (!container || !tooltip) return;

  const showTooltip = (spot) => {
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

  const hideTooltip = () => {
    tooltip.style.display = 'none';
    tooltip.setAttribute('aria-hidden', 'true');
  };

  container.addEventListener('mouseover', (e) => {
    const spot = e.target.closest('.pr-hotspot');
    if (spot) showTooltip(spot);
  });

  container.addEventListener('mouseout', (e) => {
    const spot = e.target.closest('.pr-hotspot');
    if (spot) hideTooltip();
  });

  container.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('pr-hotspot')) showTooltip(e.target);
  });
  container.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('pr-hotspot')) hideTooltip();
  });
}

// ── ANALYSIS FORM & SELECT TRIGGERS ──────────────────────────
function initAnalysisForm() {
  const form = document.getElementById('pr-analysis-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runRadarAnalysis();
  });

  // Automatically submit and run analysis on ANY dropdown change (Requirement 2)
  const dropdownIds = [
    'pr-state', 'pr-district', 'pr-taluka', 'pr-village',
    'pr-crop', 'pr-crop-stage', 'pr-season'
  ];
  dropdownIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        runRadarAnalysis();
      });
    }
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
      async (pos) => {
        const gpsLat = pos.coords.latitude;
        const gpsLon = pos.coords.longitude;
        const locString = `${gpsLat.toFixed(4)}°N, ${gpsLon.toFixed(4)}°E`;
        showToastMessage(t('locationSuccess', locString), 'success');
        btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> Location Detected`;
        btn.disabled = false;

        // Auto mapping to nearest district from local database coordinates
        if (typeof MH_LOCATION_DATA !== 'undefined') {
          let minDistance = Infinity;
          let closestDistrict = 'Nagpur';

          for (const [name, coords] of Object.entries(MH_LOCATION_DATA)) {
            if (!coords.lat || !coords.lon) continue;
            // Simplified distance calculation for sorting
            const d = Math.pow(coords.lat - gpsLat, 2) + Math.pow(coords.lon - gpsLon, 2);
            if (d < minDistance) {
              minDistance = d;
              closestDistrict = name;
            }
          }

          // Automatically select State and closest District
          const stateSel = document.getElementById('pr-state');
          const districtSel = document.getElementById('pr-district');
          if (stateSel) stateSel.value = 'Maharashtra';
          if (districtSel) {
            districtSel.value = closestDistrict;
            // Dispatch change event to populate taluka & village selects
            districtSel.dispatchEvent(new Event('change'));
          }

          // Wait a tiny bit for the selects to populate and settle
          setTimeout(() => {
            const talukaSel = document.getElementById('pr-taluka');
            const villageSel = document.getElementById('pr-village');
            if (talukaSel && talukaSel.options.length > 1) {
              talukaSel.selectedIndex = 1;
              talukaSel.dispatchEvent(new Event('change'));
            }
            setTimeout(() => {
              if (villageSel && villageSel.options.length > 1) {
                villageSel.selectedIndex = 1;
                villageSel.dispatchEvent(new Event('change'));
              }
              // Run Pest Radar analysis
              runRadarAnalysis();
            }, 100);
          }, 100);
        }
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

// ── CHARTS (Chart.js) ─────────────────────────────────────────
function updateTrendCharts(targetRisk) {
  const ctx = document.getElementById('pr-trend-chart');
  if (!ctx) return;

  const days = 30;
  const labels = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
  }

  // Generate trend data leading up to the target risk score
  const data = [];
  let current = Math.max(10, targetRisk - 30);
  for (let i = 0; i < days; i++) {
    const progress = i / (days - 1);
    const val = current + progress * 30 + (Math.random() * 8 - 4);
    data.push(Math.min(100, Math.max(10, Math.round(val))));
  }

  if (trendChart) {
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = data;
    trendChart.update();
  } else {
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
}

function updateDistrictChart(mapMarkers) {
  const ctx = document.getElementById('pr-district-chart');
  if (!ctx) return;

  // Sort mapMarkers by risk score descending
  const sorted = [...mapMarkers].sort((a, b) => b.risk - a.risk);
  const labels = sorted.map(m => m.district);
  const data = sorted.map(m => m.risk);

  if (districtChart) {
    districtChart.data.labels = labels;
    districtChart.data.datasets[0].data = data;
    districtChart.update();
  } else {
    districtChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Pest Risk Score',
          data,
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
}

// ── HELPERS ──────────────────────────────────────────────────
function animateRiskScore(target) {
  const numEl = document.getElementById('pr-risk-score-num');
  const arc = document.getElementById('pr-gauge-arc');
  const chip = document.getElementById('pr-risk-level-chip');
  if (!numEl) return;

  let current = parseInt(numEl.textContent) || 0;
  if (current === target) return;
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

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showToastMessage(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
    return;
  }

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
