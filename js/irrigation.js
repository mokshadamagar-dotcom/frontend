/* ============================================================
   KrishiMitra AI – irrigation.js
   Smart Irrigation Recommendation Logic
   Compatible with components.js Shared UI Loader & Toast System
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   MOCK AI IRRIGATION GUIDANCE RESULTS
   ============================================================ */
const MOCK_IRRIGATION_RESULT = {
  crop: "Cotton",
  soilType: "Black Soil",
  growthStage: "Vegetative",
  soilMoisture: {
    value: 55,
    status: "Moderate"
  },
  weather: {
    temperature: 29,
    humidity: 68,
    rainfall: 0,
    windSpeed: 12,
    condition: "Partly Cloudy"
  },
  rainForecast: {
    today: 20,
    tomorrow: 75,
    dayAfterTomorrow: 45
  },
  recommendation: {
    decision: "Delay Irrigation",
    status: "Water Not Required Immediately",
    message: "Rain is expected tomorrow (75% probability). High moisture reserves are present in soil. Consider delaying irrigation to prevent crop root waterlogging."
  },
  nextGuidance: {
    action: "Check soil moisture levels again after the expected rainfall has passed.",
    timing: "Tomorrow evening"
  },
  advisory: {
    type: "Rain Alert",
    message: "Heavy rain is expected tomorrow in your region. Avoid excessive field watering today."
  }
};

// ── Alternative scenario: Dry condition (Irrigation Recommended) ──
const MOCK_DRY_IRRIGATION_RESULT = {
  crop: "Cotton",
  soilType: "Black Soil",
  growthStage: "Vegetative",
  soilMoisture: {
    value: 22,
    status: "Dry"
  },
  weather: {
    temperature: 32,
    humidity: 45,
    rainfall: 0,
    windSpeed: 15,
    condition: "Sunny & Dry"
  },
  rainForecast: {
    today: 5,
    tomorrow: 10,
    dayAfterTomorrow: 15
  },
  recommendation: {
    decision: "Irrigate Today",
    status: "Watering Recommended Immediately",
    message: "Soil moisture levels are very low (22%). Sunny conditions indicate high evaporation. Crop is in moisture stress. Irrigate immediately."
  },
  nextGuidance: {
    action: "Apply full standard watering volume and check moisture levels in 24 hours.",
    timing: "Today evening"
  },
  advisory: {
    type: "Dry Weather Alert",
    message: "High temperature and dry conditions expected over the next 48 hours. Ensure crop hydration."
  }
};

// ── Alternative scenario: Wet / Excessive condition (No Irrigation Required) ──
const MOCK_WET_IRRIGATION_RESULT = {
  crop: "Cotton",
  soilType: "Black Soil",
  growthStage: "Vegetative",
  soilMoisture: {
    value: 85,
    status: "Wet"
  },
  weather: {
    temperature: 24,
    humidity: 85,
    rainfall: 12,
    windSpeed: 8,
    condition: "Cloudy with Rain"
  },
  rainForecast: {
    today: 80,
    tomorrow: 40,
    dayAfterTomorrow: 20
  },
  recommendation: {
    decision: "No Irrigation Required Now",
    status: "Soil is saturated",
    message: "Recent rainfall has saturated the soil profile (85% moisture). Irrigation is not required at this time."
  },
  nextGuidance: {
    action: "Continue monitoring soil moisture levels over the week as soil drains.",
    timing: "In 3 days"
  },
  advisory: {
    type: "No Immediate Weather Risk",
    message: "Moderate field moisture levels. No extreme temperature risks detected."
  }
};

// ── History logs mock data ──
const MOCK_HISTORY_LOGS = [
  { date: "24 Jul 2026", crop: "Cotton", moisture: "55%", weather: "Rain Expected", recommendation: "Delay Irrigation", status: "Monitor", cls: "info" },
  { date: "23 Jul 2026", crop: "Tomato", moisture: "35%", weather: "Sunny & Dry", recommendation: "Irrigate Soon", status: "Needs Attention", cls: "warning" },
  { date: "22 Jul 2026", crop: "Wheat", moisture: "72%", weather: "Cloudy", recommendation: "No Irrigation Required", status: "Good", cls: "healthy" }
];

/* ════════════════════════════════════════════════════════════
   STATE VARIABLES
   ============================================================ */
let selectedMoistureLevel = "";

/* ════════════════════════════════════════════════════════════
   DOM CONTROLLERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFormValidation();
  initSensorToggle();
  initMoistureSelectors();
  initFormSubmit();
  initActionHandlers();
  loadHistoryTable();
});

/* ════════════════════════════════════════════════════════════
   MOISTURE SELECTOR BUTTONS
   ============================================================ */
function initMoistureSelectors() {
  const btns = document.querySelectorAll('.moisture-option-btn');
  const numericInput = document.getElementById('moisture-percentage');

  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Toggle active states
      btns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      selectedMoistureLevel = this.dataset.level;

      // Update mock percentage inputs automatically to support smooth UX
      const defaults = { dry: 20, mod_dry: 40, mod: 55, moist: 75, wet: 90 };
      if (numericInput && !numericInput.disabled) {
        numericInput.value = defaults[selectedMoistureLevel] || "";
      }

      // Check validation
      checkFormValidity();
    });
  });

  numericInput?.addEventListener('input', function() {
    let val = parseFloat(this.value);
    if (val < 0) {
      this.value = 0;
      val = 0;
    }
    if (val > 100) {
      this.value = 100;
      val = 100;
    }

    // Auto toggle button active based on slider values
    btns.forEach(b => b.classList.remove('active'));
    if (val <= 25) { selectedMoistureLevel = "dry"; document.querySelector('[data-level="dry"]')?.classList.add('active'); }
    else if (val <= 45) { selectedMoistureLevel = "mod_dry"; document.querySelector('[data-level="mod_dry"]')?.classList.add('active'); }
    else if (val <= 65) { selectedMoistureLevel = "mod"; document.querySelector('[data-level="mod"]')?.classList.add('active'); }
    else if (val <= 80) { selectedMoistureLevel = "moist"; document.querySelector('[data-level="moist"]')?.classList.add('active'); }
    else { selectedMoistureLevel = "wet"; document.querySelector('[data-level="wet"]')?.classList.add('active'); }
  });
}

/* ════════════════════════════════════════════════════════════
   FORM VALIDATION CONTROLLER
   ============================================================ */
function initFormValidation() {
  const formFields = ['crop-type-select', 'soil-type-select', 'growth-stage-select', 'irr-state', 'irr-district'];
  const submitBtn  = document.getElementById('irrigation-submit-btn');

  formFields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    el?.addEventListener('change', checkFormValidity);
    el?.addEventListener('input', checkFormValidity);
  });
}

function checkFormValidity() {
  const crop = document.getElementById('crop-type-select').value;
  const soil = document.getElementById('soil-type-select').value;
  const stage = document.getElementById('growth-stage-select').value;
  const state = document.getElementById('irr-state').value.trim();
  const district = document.getElementById('irr-district').value.trim();
  const checkboxChecked = document.getElementById('no-moisture-sensor')?.checked;

  const submitBtn = document.getElementById('irrigation-submit-btn');
  if (!submitBtn) return;

  // Validate crop form fields + moisture checks
  let isMoistureValid = checkboxChecked || selectedMoistureLevel !== "";
  let isDetailsValid = crop !== "" && soil !== "" && stage !== "" && state !== "" && district !== "";

  submitBtn.disabled = !(isDetailsValid && isMoistureValid);
}

/* ════════════════════════════════════════════════════════════
   NO MOISTURE SENSOR TOGGLE
   ============================================================ */
function initSensorToggle() {
  const checkbox    = document.getElementById('no-moisture-sensor');
  const moistureBox = document.getElementById('moisture-inputs-panel-box');
  const helperMsg   = document.getElementById('no-sensor-helper-msg');

  if (!checkbox || !moistureBox || !helperMsg) return;

  checkbox.addEventListener('change', function() {
    if (this.checked) {
      moistureBox.style.opacity = '0.5';
      moistureBox.style.pointerEvents = 'none';
      helperMsg.style.display = 'block';

      // Clear states
      moistureBox.querySelectorAll('.moisture-option-btn').forEach(b => b.classList.remove('active'));
      const numInput = document.getElementById('moisture-percentage');
      if (numInput) numInput.value = '';
      selectedMoistureLevel = "";
    } else {
      moistureBox.style.opacity = '1';
      moistureBox.style.pointerEvents = 'auto';
      helperMsg.style.display = 'none';
    }
    checkFormValidity();
  });
}

/* ════════════════════════════════════════════════════════════
   SUBMIT TRIGGERS
   ============================================================ */
function initFormSubmit() {
  const form       = document.getElementById('irrigation-recommendation-form');
  const loader     = document.getElementById('irrigation-analysis-loader');
  const resultSec  = document.getElementById('irrigation-result-section');
  const emptyState = document.getElementById('irrigation-empty-state');
  const submitBtn  = document.getElementById('irrigation-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    emptyState.style.display = 'none';
    resultSec.style.display = 'none';
    loader.classList.add('active');
    submitBtn.disabled = true;

    loader.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      const recommendation = await generateIrrigationRecommendation();
      renderIrrigationResult(recommendation);
    } catch (err) {
      console.error(err);
      loader.classList.remove('active');
      submitBtn.disabled = false;
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to compile recommendations. Please try again.', 'error');
      }
    }
  });
}

/* ════════════════════════════════════════════════════════════
   FASTAPI & SENSOR API CONNECTIVITY (Preparation)
   ============================================================ */
async function generateIrrigationRecommendation() {
  // TODO: Send crop information to FastAPI
  // TODO: Send soil moisture data
  // TODO: Fetch real weather data
  // TODO: Send weather forecast to recommendation engine
  // TODO: Generate AI irrigation recommendation
  // TODO: Store recommendation in MongoDB
  // TODO: Save result to farmer history

  // TODO: Connect weather API through FastAPI backend
  // TODO: Do not expose API keys in frontend JavaScript

  // TODO: Connect IoT soil moisture sensor data
  // TODO: Receive real-time field moisture data through backend

  // Simulate network recommendation generation process (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Determine output based on selected moisture levels to showcase all states
  const checkboxChecked = document.getElementById('no-moisture-sensor')?.checked;

  if (!checkboxChecked) {
    if (selectedMoistureLevel === 'dry' || selectedMoistureLevel === 'mod_dry') {
      return MOCK_DRY_IRRIGATION_RESULT; // Irrigate Today state
    } else if (selectedMoistureLevel === 'moist' || selectedMoistureLevel === 'wet') {
      return MOCK_WET_IRRIGATION_RESULT; // Saturated No Irrigation state
    }
  }

  // Default Partly Cloudy Delay Irrigation state
  const cropSelect = document.getElementById('crop-type-select');
  const soilSelect = document.getElementById('soil-type-select');
  const stageSelect = document.getElementById('growth-stage-select');

  return {
    ...MOCK_IRRIGATION_RESULT,
    crop: cropSelect ? cropSelect.options[cropSelect.selectedIndex].text : MOCK_IRRIGATION_RESULT.crop,
    soilType: soilSelect ? soilSelect.options[soilSelect.selectedIndex].text : MOCK_IRRIGATION_RESULT.soilType,
    growthStage: stageSelect ? stageSelect.options[stageSelect.selectedIndex].text : MOCK_IRRIGATION_RESULT.growthStage
  };
}

/* ════════════════════════════════════════════════════════════
   RENDER ENGINE FOR RESULTS IN RESULT CARD VIEW
   ============================================================ */
function renderIrrigationResult(data) {
  const loader = document.getElementById('pest-analysis-loader');
  const resultSec = document.getElementById('irrigation-result-section');
  const submitBtn = document.getElementById('irrigation-submit-btn');

  // Stop loader
  document.getElementById('irrigation-analysis-loader').classList.remove('active');
  submitBtn.disabled = false;

  // Basic info cards
  document.getElementById('res-crop').textContent = data.crop;
  document.getElementById('res-soil').textContent = data.soilType;
  document.getElementById('res-stage').textContent = data.growthStage;
  document.getElementById('res-weather').textContent = data.weather.condition;

  // Soil moisture percentage bar
  const moistureVal = data.soilMoisture.value || 55;
  document.getElementById('res-moisture-val').textContent = `${moistureVal}%`;
  document.getElementById('res-moisture-status').textContent = data.soilMoisture.status;

  const barFill = document.getElementById('res-moisture-bar');
  if (barFill) {
    barFill.style.width = `${moistureVal}%`;
    // change bar color based on wetness
    if (moistureVal <= 30) { barFill.style.background = '#dc2626'; }
    else if (moistureVal <= 70) { barFill.style.background = 'var(--gradient-primary)'; }
    else { barFill.style.background = '#2563eb'; }
  }

  // Recommendation Status
  document.getElementById('res-decision-badge').textContent = data.recommendation.decision;
  document.getElementById('res-decision-status').textContent = data.recommendation.status;
  document.getElementById('res-decision-msg').textContent = data.recommendation.message;

  // Set visual icons on Decision card
  const dIcon = document.getElementById('res-decision-icon');
  if (dIcon) {
    if (data.recommendation.decision === 'Irrigate Today') {
      dIcon.className = 'fas fa-tint'; dIcon.style.color = '#2563eb';
    } else if (data.recommendation.decision === 'Delay Irrigation') {
      dIcon.className = 'fas fa-cloud-rain'; dIcon.style.color = '#3b82f6';
    } else {
      dIcon.className = 'fas fa-cloud-sun'; dIcon.style.color = '#f59e0b';
    }
  }

  // Weather overview card stats
  document.getElementById('res-weather-temp').textContent = `${data.weather.temperature}°C`;
  document.getElementById('res-weather-humidity').textContent = `${data.weather.humidity}%`;
  document.getElementById('res-weather-rain').textContent = `${data.weather.rainfall} mm`;
  document.getElementById('res-weather-wind').textContent = `${data.weather.windSpeed} km/h`;

  // 3-Day weather forecast probabilities
  document.getElementById('res-fore-today').textContent = `${data.rainForecast.today}%`;
  document.getElementById('res-fore-tomorrow').textContent = `${data.rainForecast.tomorrow}%`;
  document.getElementById('res-fore-dayafter').textContent = `${data.rainForecast.dayAfterTomorrow}%`;

  // Next Guidance block
  document.getElementById('res-guide-action').textContent = data.nextGuidance.action;
  document.getElementById('res-guide-timing').textContent = data.nextGuidance.timing;

  // Weather Advisory alert banner
  const advisoryBox = document.getElementById('res-advisory-box');
  if (advisoryBox) {
    advisoryBox.className = `advisory-alert-box advisory-alert-box--${data.advisory.type === 'Rain Alert' ? 'rain' : data.advisory.type === 'Dry Weather Alert' ? 'dry' : 'none'}`;
    document.getElementById('res-advisory-title').textContent = data.advisory.type;
    document.getElementById('res-advisory-desc').textContent = data.advisory.message;
  }

  // Populate Weather Impact list
  const impactsGrid = document.getElementById('res-weather-impacts-grid');
  if (impactsGrid) {
    impactsGrid.innerHTML = `
      <div class="weather-impact-card">
        <div class="weather-impact-card__icon weather-impact-card__icon--blue" aria-hidden="true">
          <i class="fas fa-cloud-showers-heavy"></i>
        </div>
        <div class="weather-impact-card__content">
          <h5 class="weather-impact-card__title">Rain Forecast</h5>
          <p class="weather-impact-card__desc">${data.rainForecast.tomorrow}% rain tomorrow. May reduce immediate irrigation requirements.</p>
        </div>
      </div>
      <div class="weather-impact-card">
        <div class="weather-impact-card__icon weather-impact-card__icon--orange" aria-hidden="true">
          <i class="fas fa-thermometer-half"></i>
        </div>
        <div class="weather-impact-card__content">
          <h5 class="weather-impact-card__title">Temperature Impact</h5>
          <p class="weather-impact-card__desc">${data.weather.temperature}°C temperature leads to moderate soil evaporation rates.</p>
        </div>
      </div>
      <div class="weather-impact-card">
        <div class="weather-impact-card__icon weather-impact-card__icon--purple" aria-hidden="true">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="weather-impact-card__content">
          <h5 class="weather-impact-card__title">Humidity Influence</h5>
          <p class="weather-impact-card__desc">${data.weather.humidity}% atmospheric humidity slows water loss from plant canopy leaves.</p>
        </div>
      </div>
      <div class="weather-impact-card">
        <div class="weather-impact-card__icon weather-impact-card__icon--teal" aria-hidden="true">
          <i class="fas fa-wind"></i>
        </div>
        <div class="weather-impact-card__content">
          <h5 class="weather-impact-card__title">Wind Influence</h5>
          <p class="weather-impact-card__desc">${data.weather.windSpeed} km/h wind velocity has minor impact on evapotranspiration thresholds.</p>
        </div>
      </div>
    `;
  }

  // Populate Recommendation block banner
  document.getElementById('ai-irrigation-recommendation-text').textContent = `Based on current weather and soil moisture levels, the recommended action is to ${data.recommendation.decision.toLowerCase()}. Ensure checking actual field soil constraints before irrigation.`;

  // Display result section and scroll
  resultSec.style.display = 'block';
  resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════════════════════════════════════
   ACTION CONTROLLERS (Save, PDF, Chatbot links)
   ============================================================ */
function initActionHandlers() {
  const anotherBtn  = document.getElementById('btn-irr-another');
  const saveBtn     = document.getElementById('btn-irr-save');
  const downloadBtn = document.getElementById('btn-irr-download');
  const askChatBtn  = document.getElementById('btn-irr-ask-chat');
  const expertBtn   = document.getElementById('btn-irr-expert');

  // Reset form
  anotherBtn?.addEventListener('click', () => {
    document.getElementById('dashboard-main').scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      const form = document.getElementById('irrigation-recommendation-form');
      if (form) form.reset();

      // Undo sensor checkboxes locks
      const checkbox = document.getElementById('no-moisture-sensor');
      if (checkbox) {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change'));
      }

      // Hide results panels and show empty placeholders
      document.getElementById('irrigation-result-section').style.display = 'none';
      document.getElementById('irrigation-empty-state').style.display = 'flex';
      document.getElementById('irrigation-submit-btn').disabled = true;
    }, 400);
  });

  // Save recommendation toast
  saveBtn?.addEventListener('click', () => {
    // TODO: Save irrigation recommendation to MongoDB through FastAPI.
    if (typeof window.showToast === 'function') {
      window.showToast('Irrigation schedule saved to farm log successfully.', 'success');
    }
  });

  // Download PDF Report toast
  downloadBtn?.addEventListener('click', () => {
    // TODO: Generate irrigation recommendation PDF report from backend.
    if (typeof window.showToast === 'function') {
      window.showToast('Generating PDF Report... Download starting.', 'info');
    }
  });

  // Redirect chatbot query
  askChatBtn?.addEventListener('click', () => {
    window.location.href = 'chatbot.html?topic=Irrigation';
  });

  // Expert advisor coordination toast
  expertBtn?.addEventListener('click', () => {
    if (typeof window.showToast === 'function') {
      window.showToast('Expert agricultural advisor booking will be available in a future update.', 'info');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   RECENT RECOMMENDATIONS ARCHIVE LOGS TABLE
   ============================================================ */
function loadHistoryTable() {
  const tbody = document.getElementById('recent-irrigation-tbody');
  if (!tbody) return;

  tbody.innerHTML = MOCK_HISTORY_LOGS.map(log => `
    <tr>
      <td>${log.date}</td>
      <td><strong>${log.crop}</strong></td>
      <td>${log.moisture}</td>
      <td>${log.weather}</td>
      <td>${log.recommendation}</td>
      <td>
        <span class="crop-status-pill crop-status-pill--${log.cls === 'healthy' ? 'healthy' : log.cls === 'warning' ? 'warning' : 'monitor'}">
          ${log.status}
        </span>
      </td>
    </tr>
  `).join('');
}
