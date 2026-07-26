/* ============================================================
   KrishiMitra AI – fertilizer.js
   AI Fertilizer Recommendation Interactive Logic
   Compatible with components.js Shared UI Loader & Toast System
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   MOCK AI RECOMMENDATION RESULTS
   ============================================================ */
const MOCK_FERTILIZER_RESULT = {
  crop: "Cotton",
  soilType: "Black Soil",
  growthStage: "Vegetative",
  season: "Kharif",
  nutrientStatus: {
    nitrogen: "Needs Attention",
    phosphorus: "Adequate",
    potassium: "Adequate",
    ph: "Suitable"
  },
  nutrientHealthScore: 72,
  fertilizerGuidance: {
    category: "Nitrogen-focused fertilizer (e.g. Urea or Ammonium Sulphate)",
    method: "Split application: apply 50% as basal dose during sowing, and top-dress remaining 50% during peak vegetative stages.",
    timing: "Best applied when soil has moderate moisture, ideally during early morning or late evening hours. Avoid application during heavy rains."
  },
  organicAlternatives: [
    { name: "Vermicompost", benefit: "Enriches soil organic carbon, improves soil aeration, and releases nutrients slowly." },
    { name: "Farmyard Manure (FYM)", benefit: "Well-decomposed cattle manure supplies vital macronutrients and improves soil water retention." },
    { name: "Neem Cake", benefit: "Provides organic nitrogen and acts as a natural pest repellent and nitrifaction inhibitor." },
    { name: "Green Manuring", benefit: "Growing legumes and ploughing them back increases nitrogen fixation naturally." }
  ],
  bestPractices: [
    { title: "Test Soil First", desc: "Prioritize recent soil test results to customize nutrient applications accurately." },
    { title: "Right Growth Stage", desc: "Match fertilizer timings with crop growth stages when nutrient uptake is peak." },
    { title: "Avoid Nutrient Overuse", desc: "Excessive nitrogen causes high vegetative growth, attracting pests and reducing yield quality." },
    { title: "Deep Root Placement", desc: "Apply fertilizer closer to the crop root zone rather than broadcasting on dry surface soil." }
  ]
};

// ── Alternative: Healthy / Balanced NPK state (if user inputs perfect soil stats) ──
const MOCK_BALANCED_RESULT = {
  crop: "Cotton",
  soilType: "Black Soil",
  growthStage: "Vegetative",
  season: "Kharif",
  nutrientStatus: {
    nitrogen: "Adequate",
    phosphorus: "Adequate",
    potassium: "Adequate",
    ph: "Suitable"
  },
  nutrientHealthScore: 95,
  fertilizerGuidance: {
    category: "Balanced maintenance NPK fertilizer",
    method: "Apply minimal maintenance doses if crop shows low vigor. Otherwise, focus on compost applications.",
    timing: "Follow standard local growth stage timelines."
  },
  organicAlternatives: [
    { name: "Compost", benefit: "Maintains optimal soil structure and biology." },
    { name: "Vermicompost", benefit: "Boosts crop immunity and maintains micro-nutrient balances." }
  ],
  bestPractices: [
    { title: "Monitor regularly", desc: "Check leaf color parameters to identify micro-nutrient deficiencies early." },
    { title: "Mulching", desc: "Incorporate organic mulch to preserve soil moisture and nutrient profiles." }
  ]
};

// ── History logs mock data ──
const MOCK_HISTORY_LOGS = [
  { date: "24 Jul 2026", crop: "Cotton", stage: "Vegetative", nutrients: "Nitrogen Deficient", status: "Needs Attention", cls: "warning" },
  { date: "23 Jul 2026", crop: "Tomato", stage: "Flowering", nutrients: "Balanced NPK", status: "Good", cls: "healthy" },
  { date: "22 Jul 2026", crop: "Wheat", stage: "Vegetative", nutrients: "Phosphorus Deficient", status: "Needs Attention", cls: "warning" }
];

/* ════════════════════════════════════════════════════════════
   DOM CONTROLLER INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initFormValidation();
  initSoilReportToggle();
  initFormSubmit();
  initActionHandlers();
  loadHistoryTable();
});

/* ════════════════════════════════════════════════════════════
   FORM VALIDATION & LIVE CHECK
   ============================================================ */
function initFormValidation() {
  const formFields = ['crop-type-select', 'soil-type-select', 'growth-stage-select', 'season-select'];
  const submitBtn = document.getElementById('fertilizer-submit-btn');

  // Add event listeners to input elements
  formFields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    el?.addEventListener('change', checkFormValidity);
  });

  // Numeric inputs constraints
  const numInputs = ['nutrient-n', 'nutrient-p', 'nutrient-k', 'nutrient-ph', 'nutrient-carbon'];
  numInputs.forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', function() {
      // Prevent negative values
      if (parseFloat(this.value) < 0) {
        this.value = 0;
        if (typeof window.showToast === 'function') {
          window.showToast('Nutrient values cannot be negative.', 'warning');
        }
      }
      // pH range constraint
      if (id === 'nutrient-ph' && parseFloat(this.value) > 14) {
        this.value = 14;
        if (typeof window.showToast === 'function') {
          window.showToast('Soil pH scale ranges from 0 to 14.', 'warning');
        }
      }
    });
  });

  function checkFormValidity() {
    let isValid = true;
    formFields.forEach(fieldId => {
      const el = document.getElementById(fieldId);
      if (!el || !el.value) isValid = false;
    });

    if (submitBtn) submitBtn.disabled = !isValid;
  }
}

/* ════════════════════════════════════════════════════════════
   NO SOIL REPORT CHECKBOX TOGGLE
   ============================================================ */
function initSoilReportToggle() {
  const checkbox    = document.getElementById('no-soil-report');
  const nutrientBox = document.getElementById('soil-nutrient-inputs-box');
  const helperMsg   = document.getElementById('no-report-helper-msg');

  if (!checkbox || !nutrientBox || !helperMsg) return;

  checkbox.addEventListener('change', function() {
    if (this.checked) {
      // Disable inputs
      nutrientBox.style.opacity = '0.5';
      nutrientBox.style.pointerEvents = 'none';
      helperMsg.style.display = 'block';
      // Clear inputs
      nutrientBox.querySelectorAll('input').forEach(input => input.value = '');
    } else {
      // Enable inputs
      nutrientBox.style.opacity = '1';
      nutrientBox.style.pointerEvents = 'auto';
      helperMsg.style.display = 'none';
    }
  });
}

/* ════════════════════════════════════════════════════════════
   SUBMIT HANDLER & MOCK PROCESSING
   ============================================================ */
function initFormSubmit() {
  const form       = document.getElementById('fertilizer-recommendation-form');
  const loader     = document.getElementById('fertilizer-analysis-loader');
  const resultSec  = document.getElementById('fertilizer-result-section');
  const emptyState = document.getElementById('fertilizer-empty-state');
  const submitBtn  = document.getElementById('fertilizer-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Secondary validation check
    const crop = document.getElementById('crop-type-select').value;
    const soil = document.getElementById('soil-type-select').value;
    const stage = document.getElementById('growth-stage-select').value;
    const season = document.getElementById('season-select').value;

    if (!crop || !soil || !stage || !season) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please fill in all required crop and soil fields.', 'error');
      }
      return;
    }

    emptyState.style.display = 'none';
    resultSec.style.display = 'none';
    loader.classList.add('active');
    submitBtn.disabled = true;

    loader.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      const recommendation = await generateFertilizerRecommendation();
      renderFertilizerResult(recommendation);
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
   MOCK RECO ENGINE CALL (FastAPI Preparation)
   ============================================================ */
async function generateFertilizerRecommendation() {
  // TODO: Send crop and soil information to FastAPI
  // TODO: Endpoint example: POST /api/v1/fertilizer/recommend
  // TODO: Connect recommendation engine using crop guidelines & ML logic
  // TODO: Store recommendation in MongoDB
  // TODO: Save result to farmer history

  // Simulate network recommendation generation process (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Determine if N is input and adequate.
  const nVal = parseFloat(document.getElementById('nutrient-n')?.value);
  const checkboxChecked = document.getElementById('no-soil-report')?.checked;

  // Mock toggle: if N value is entered high (e.g. >100), output healthy balanced mock
  if (!checkboxChecked && nVal > 100) {
    return MOCK_BALANCED_RESULT;
  }

  // Otherwise, default Cotton Vegetative vegetative nitrogen needs attention scenario
  const cropSelect = document.getElementById('crop-type-select');
  const soilSelect = document.getElementById('soil-type-select');
  const stageSelect = document.getElementById('growth-stage-select');

  return {
    ...MOCK_FERTILIZER_RESULT,
    crop: cropSelect ? cropSelect.options[cropSelect.selectedIndex].text : MOCK_FERTILIZER_RESULT.crop,
    soilType: soilSelect ? soilSelect.options[soilSelect.selectedIndex].text : MOCK_FERTILIZER_RESULT.soilType,
    growthStage: stageSelect ? stageSelect.options[stageSelect.selectedIndex].text : MOCK_FERTILIZER_RESULT.growthStage
  };
}

/* ════════════════════════════════════════════════════════════
   RENDER ENGINE FOR FERTILIZER RESULTS
   ============================================================ */
function renderFertilizerResult(data) {
  const loader = document.getElementById('fertilizer-analysis-loader');
  const resultSec = document.getElementById('fertilizer-result-section');
  const submitBtn = document.getElementById('fertilizer-submit-btn');

  loader.classList.remove('active');
  submitBtn.disabled = false;

  // Basic Info cards
  document.getElementById('res-crop').textContent = data.crop;
  document.getElementById('res-soil').textContent = data.soilType;
  document.getElementById('res-stage').textContent = data.growthStage;
  document.getElementById('res-season').textContent = data.season;

  // Nutrient status highlights
  const nStatus = data.nutrientStatus.nitrogen;
  const pStatus = data.nutrientStatus.phosphorus;
  const kStatus = data.nutrientStatus.potassium;
  const phStatus = data.nutrientStatus.ph;

  document.getElementById('res-n-status').textContent = nStatus;
  document.getElementById('res-n-status').className = `npk-card__status npk-card__status--${nStatus === 'Adequate' ? 'adequate' : 'deficient'}`;

  document.getElementById('res-p-status').textContent = pStatus;
  document.getElementById('res-p-status').className = `npk-card__status npk-card__status--${pStatus === 'Adequate' ? 'adequate' : 'deficient'}`;

  document.getElementById('res-k-status').textContent = kStatus;
  document.getElementById('res-k-status').className = `npk-card__status npk-card__status--${kStatus === 'Adequate' ? 'adequate' : 'deficient'}`;

  // NPK short description updates
  document.getElementById('res-n-desc').textContent = nStatus === 'Adequate'
    ? "Nitrogen levels are adequate to support vegetative foliage."
    : "Nitrogen is deficient. Important for leaf vegetative growth and chlorophyll.";

  document.getElementById('res-p-desc').textContent = pStatus === 'Adequate'
    ? "Phosphorus levels support healthy seedling root systems."
    : "Phosphorus is deficient. Crucial for early root growth and flower setting.";

  document.getElementById('res-k-desc').textContent = kStatus === 'Adequate'
    ? "Potassium levels are sufficient for crop water regulation."
    : "Potassium is deficient. Key for drought tolerance and disease resistance.";

  // Score value
  document.getElementById('res-health-score').textContent = data.nutrientHealthScore;
  const scoreBar = document.getElementById('res-health-score-bar');
  if (scoreBar) {
    scoreBar.style.width = `${data.nutrientHealthScore}%`;
  }
  document.getElementById('res-health-status-text').textContent = data.nutrientHealthScore >= 90
    ? "Your crop's nutrient profile is balanced and optimal."
    : "Your crop's nutrient profile requires attention. Target identified gaps.";

  // Fertilizer Guidance Details
  document.getElementById('res-guidance-cat').textContent = data.fertilizerGuidance.category;
  document.getElementById('res-guidance-method').textContent = data.fertilizerGuidance.method;
  document.getElementById('res-guidance-timing').textContent = data.fertilizerGuidance.timing;

  // Organic Alternatives Grid
  const organicGrid = document.getElementById('res-organic-alternatives-grid');
  if (organicGrid) {
    organicGrid.innerHTML = data.organicAlternatives.map(alt => `
      <div class="organic-card">
        <div class="organic-card__icon" aria-hidden="true">
          <i class="fas fa-leaf"></i>
        </div>
        <div class="organic-card__content">
          <h5 class="organic-card__name">${alt.name}</h5>
          <p class="organic-card__benefit">${alt.benefit}</p>
        </div>
      </div>
    `).join('');
  }

  // Best practices list
  const practiceList = document.getElementById('res-best-practices-list');
  if (practiceList) {
    practiceList.innerHTML = data.bestPractices.map(prac => `
      <div class="bullet-item">
        <i class="fas fa-check-circle" aria-hidden="true" style="color:var(--primary);"></i>
        <span><strong>${prac.title}:</strong> ${prac.desc}</span>
      </div>
    `).join('');
  }

  // Show result section and smooth scroll
  resultSec.style.display = 'block';
  resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════════════════════════════════════
   ACTION TRIGGER HANDLERS
   ============================================================ */
function initActionHandlers() {
  const resetBtn     = document.getElementById('btn-fer-another');
  const saveBtn      = document.getElementById('btn-fer-save');
  const downloadBtn  = document.getElementById('btn-fer-download');
  const askChatBtn   = document.getElementById('btn-fer-ask-chat');
  const expertBtn    = document.getElementById('btn-fer-expert');

  // Reset Recommendation Form
  resetBtn?.addEventListener('click', () => {
    document.getElementById('dashboard-main').scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      // Reset form controls
      const form = document.getElementById('fertilizer-recommendation-form');
      if (form) form.reset();

      // Undo checkbox locks
      const checkbox = document.getElementById('no-soil-report');
      if (checkbox) {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change'));
      }

      // Hide results and display empty placeholders
      document.getElementById('fertilizer-result-section').style.display = 'none';
      document.getElementById('fertilizer-empty-state').style.display = 'flex';
      document.getElementById('fertilizer-submit-btn').disabled = true;
    }, 400);
  });

  // Save Recommendation
  saveBtn?.addEventListener('click', () => {
    // TODO: Save fertilizer recommendation to MongoDB database through FastAPI.
    if (typeof window.showToast === 'function') {
      window.showToast('Fertilizer recommendation saved to history.', 'success');
    }
  });

  // Download PDF Report
  downloadBtn?.addEventListener('click', () => {
    // TODO: Generate downloadable fertilizer recommendation report from backend.
    if (typeof window.showToast === 'function') {
      window.showToast('Generating PDF Report... Download starting shortly.', 'info');
    }
  });

  // Ask AI Chatbot about fertilizer
  askChatBtn?.addEventListener('click', () => {
    window.location.href = 'chatbot.html?topic=Fertilizer';
  });

  // Connect Expert Specialist
  expertBtn?.addEventListener('click', () => {
    if (typeof window.showToast === 'function') {
      window.showToast('Expert agricultural advisor booking will be available soon.', 'info');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   RECENT LOGS PREVIEW LOADER
   ============================================================ */
function loadHistoryTable() {
  const tbody = document.getElementById('recent-fertilizers-tbody');
  if (!tbody) return;

  tbody.innerHTML = MOCK_HISTORY_LOGS.map(log => `
    <tr>
      <td>${log.date}</td>
      <td><strong>${log.crop}</strong></td>
      <td>${log.stage}</td>
      <td>
        <span style="font-weight:600; color:var(--text-secondary);">${log.nutrients}</span>
      </td>
      <td>
        <span class="crop-status-pill crop-status-pill--${log.cls === 'healthy' ? 'healthy' : 'warning'}">
          ${log.status}
        </span>
      </td>
    </tr>
  `).join('');
}
