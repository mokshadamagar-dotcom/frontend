/* ============================================================
   KrishiMitra AI – soil-analysis.js
   AI Soil Health Analysis & Document Parsing Logic
   Compatible with components.js Shared UI Loader & Toast System
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   MOCK SOIL HEALTH DATA MODEL
   ============================================================ */
const MOCK_SOIL_ANALYSIS = {
  document: {
    fileName: "soil_report_hingoli.pdf",
    fileType: "PDF Document",
    fileSize: "2.4 MB",
    status: "Analyzed",
    date: "25 July 2026"
  },
  health: {
    score: 72,
    status: "Moderate",
    description: "The soil profile indicates moderate overall fertility. Phosphorus levels need attention, while Nitrogen and pH require ongoing monitoring."
  },
  parameters: {
    nitrogen: { value: "Medium (285 kg/ha)", status: "Moderate", cssClass: "warning", desc: "Nitrogen levels are in the moderate range. Crop foliage requires active monitoring." },
    phosphorus: { value: "Low (12 kg/ha)", status: "Needs Attention", cssClass: "deficient", desc: "Phosphorus levels are deficient. Urgent amendment needed for healthy root systems." },
    potassium: { value: "High (340 kg/ha)", status: "Good", cssClass: "adequate", desc: "Potassium reserves are high and sufficient for plant structural water regulation." },
    ph: { value: "7.2 (Near Neutral)", status: "Suitable", cssClass: "adequate", desc: "Soil pH is near-neutral, which is highly suitable for uptake of most crop nutrients." },
    organicCarbon: { value: "Medium (0.52%)", status: "Moderate", cssClass: "warning", desc: "Organic Carbon is moderate. Incorporate organic mulch to build soil organic matter." }
  },
  confidence: 84,
  interpretation: "Based on the uploaded demo soil report, nitrogen appears to be at a medium level, phosphorus may need attention, potassium appears adequate, and soil pH is near neutral. Farmers should use recent laboratory results and local agricultural recommendations when making soil management decisions.",
  recommendations: [
    { title: "Targeted Phosphatic Amendment", desc: "Apply single superphosphate (SSP) or diammonium phosphate (DAP) during sowing to compensate for phosphorus deficiency." },
    { title: "Organic Carbon Upgrades", desc: "Incorporate well-decomposed farmyard manure (FYM) or green manure to boost soil organic matter." },
    { title: "Balanced Micro-nutrients", desc: "Maintain secondary soil testing for Zinc and Iron, which may show low availability under near-neutral pH." }
  ]
};

// ── Crop Specific Guidance Database ──
const CROP_SOIL_GUIDANCE = {
  cotton: "For Cotton in Black Soil (pH 7.2), ensure balanced NPK ratios. Focus on splitting Nitrogen applications during vegetative growth. Add gypsum if soil compaction is observed.",
  tomato: "For Tomato crops, pH 7.2 is optimal. Monitor Phosphorus closely as low levels restrict seedling bloom and flowering stages. Supplement with calcium to avoid blossom end rot.",
  wheat: "For Wheat, ensure sufficient basal Phosphorus during early root setting. Moderate Nitrogen levels will support initial vegetative tillering without causing early logging.",
  rice: "Rice benefits from heavy clay-loam water retention. Add organic manures to buffer Nitrogen reserves and ensure soil is puddled properly during transplanting.",
  onion: "Onions require sulfur for bulb pungency. Phosphorus deficiency will cause poor bulb size. Apply well-composted organic material before transplanting.",
  soybean: "As a legume, Soybean fixes its own Nitrogen. Focus on correcting the Phosphorus deficiency using SSP, which also supplies vital sulfur.",
  maize: "Maize is a heavy nutrient feeder. Ensure progressive top-dressing of Nitrogen. Low Phosphorus will lead to purple leaf edges and weak seedlings.",
  sugarcane: "Sugarcane has high water and nutrient demands. Incorporate green manure cover crops to build organic carbon reserves and apply split NPK amendments."
};

// ── Recent Reports Logs (Mock) ──
const MOCK_RECENT_REPORTS = [
  { date: "25 Jul 2026", fileName: "soil_report_hingoli.pdf", crop: "Cotton", health: "Moderate", status: "Analyzed" },
  { date: "24 Jul 2026", fileName: "soil_report_field_2.pdf", crop: "Soybean", health: "Good", status: "Analyzed" }
];

/* ════════════════════════════════════════════════════════════
   DOM INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAnalysisSubmit();
  initCropSelector();
  initActionHandlers();
  loadRecentReports();
});

/* ════════════════════════════════════════════════════════════
   SUBMIT TRIGGERS & STEP-BY-STEP PROGRESS LOADER
   ============================================================ */
function initAnalysisSubmit() {
  const analyzeBtn = document.getElementById('pdf-start-analysis-btn');
  const emptyState = document.getElementById('soil-empty-state');
  const loaderSec  = document.getElementById('soil-analysis-loader');
  const resultSec  = document.getElementById('soil-result-section');

  if (!analyzeBtn) return;

  analyzeBtn.addEventListener('click', async () => {
    // Hide previous states
    emptyState.style.display = 'none';
    resultSec.style.display = 'none';
    loaderSec.style.display = 'flex';
    analyzeBtn.disabled = true;

    // Scroll to loader smoothly
    loaderSec.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      // Run the interactive multi-step analysis
      await runAnalysisPipelineSteps();
      renderSoilAnalysisResult(MOCK_SOIL_ANALYSIS);
    } catch (err) {
      console.error(err);
      loaderSec.style.display = 'none';
      analyzeBtn.disabled = false;
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to complete soil report analysis. Please try again.', 'error');
      }
    }
  });
}

/**
 * Simulates an interactive 7-step analysis progress.
 * WOWs judges by transitioning checkmarks step-by-step.
 */
async function runAnalysisPipelineSteps() {
  const steps = [
    'step-upload',
    'step-read',
    'step-text',
    'step-detect',
    'step-health',
    'step-recommend',
    'step-report'
  ];

  // TODO: Replace mock processing with FastAPI PDF analysis endpoint.
  // TODO: Endpoints example: POST /api/v1/soil/analyze
  // TODO: Run OCR, extract parameters, perform RAG, return results.

  for (let i = 0; i < steps.length; i++) {
    const stepId = steps[i];
    const el = document.getElementById(stepId);
    if (el) {
      el.classList.add('active');
    }
    // Simulate parsing delay per step
    await new Promise(resolve => setTimeout(resolve, 400));
    if (el) {
      el.classList.remove('active');
      el.classList.add('completed');
    }
  }
}

/* ════════════════════════════════════════════════════════════
   RENDER SOIL ANALYSIS RESULTS
   ============================================================ */
function renderSoilAnalysisResult(data) {
  const loaderSec  = document.getElementById('soil-analysis-loader');
  const resultSec  = document.getElementById('soil-result-section');
  const analyzeBtn = document.getElementById('pdf-start-analysis-btn');

  // De-activate loader
  loaderSec.style.display = 'none';
  analyzeBtn.disabled = false;

  // Document meta details
  document.getElementById('res-doc-name').textContent = data.document.fileName;
  document.getElementById('res-doc-size').textContent = data.document.fileSize;
  document.getElementById('res-doc-date').textContent = data.document.date;

  // Extract panel indicators
  document.getElementById('val-n').textContent = data.parameters.nitrogen.value.split(' ')[0];
  document.getElementById('val-p').textContent = data.parameters.phosphorus.value.split(' ')[0];
  document.getElementById('val-k').textContent = data.parameters.potassium.value.split(' ')[0];
  document.getElementById('val-ph').textContent = data.parameters.ph.value.split(' ')[0];
  document.getElementById('val-carbon').textContent = data.parameters.organicCarbon.value.split(' ')[0];

  // Overall Health Score Circle
  document.getElementById('res-health-score').textContent = data.health.score;
  const scoreBar = document.getElementById('res-health-score-bar');
  if (scoreBar) {
    scoreBar.style.width = `${data.health.score}%`;
  }
  document.getElementById('res-health-status-text').textContent = `Soil Health: ${data.health.status}`;

  // Soil parameters table rows
  const p = data.parameters;
  const tableRows = `
    <tr>
      <td><strong>Nitrogen (N)</strong></td>
      <td>${p.nitrogen.value}</td>
      <td><span class="npk-card__status npk-card__status--deficient" style="background:#fffbeb; color:#d97706;">${p.nitrogen.status}</span></td>
      <td>${p.nitrogen.desc}</td>
    </tr>
    <tr>
      <td><strong>Phosphorus (P)</strong></td>
      <td>${p.phosphorus.value}</td>
      <td><span class="npk-card__status npk-card__status--deficient">${p.phosphorus.status}</span></td>
      <td>${p.phosphorus.desc}</td>
    </tr>
    <tr>
      <td><strong>Potassium (K)</strong></td>
      <td>${p.potassium.value}</td>
      <td><span class="npk-card__status npk-card__status--adequate">${p.potassium.status}</span></td>
      <td>${p.potassium.desc}</td>
    </tr>
    <tr>
      <td><strong>Soil pH Scale</strong></td>
      <td>${p.ph.value}</td>
      <td><span class="npk-card__status npk-card__status--adequate" style="background:#eff6ff; color:#2563eb;">${p.ph.status}</span></td>
      <td>${p.ph.desc}</td>
    </tr>
    <tr>
      <td><strong>Organic Carbon</strong></td>
      <td>${p.organicCarbon.value}</td>
      <td><span class="npk-card__status npk-card__status--deficient" style="background:#fffbeb; color:#d97706;">${p.organicCarbon.status}</span></td>
      <td>${p.organicCarbon.desc}</td>
    </tr>
  `;
  const tbody = document.getElementById('soil-table-tbody');
  if (tbody) tbody.innerHTML = tableRows;

  // Simple CSS progress visualizers
  const setBar = (id, pct) => {
    const el = document.getElementById(id);
    if (el) el.style.width = `${pct}%`;
  };
  setBar('bar-n', 55);
  setBar('bar-p', 25);
  setBar('bar-k', 88);
  setBar('bar-carbon', 50);
  setBar('bar-ph', 72); // pH 7.2 out of 10 or visual

  // AI Interpretation Text
  document.getElementById('ai-soil-interpretation-text').textContent = data.interpretation;

  // Soil Improvement recommendations
  const recsList = document.getElementById('soil-recs-list');
  if (recsList) {
    recsList.innerHTML = data.recommendations.map(rec => `
      <div class="bullet-item">
        <i class="fas fa-check-circle" aria-hidden="true" style="color:var(--primary);"></i>
        <span><strong>${rec.title}:</strong> ${rec.desc}</span>
      </div>
    `).join('');
  }

  // AI Confidence progress bar
  document.getElementById('res-confidence-pct').textContent = `${data.confidence}%`;
  const confBar = document.getElementById('res-confidence-bar');
  if (confBar) {
    confBar.style.width = `${data.confidence}%`;
  }

  // Reset dropdown select to default
  const cropSel = document.getElementById('soil-crop-guide-select');
  if (cropSel) cropSel.value = "";
  const guideText = document.getElementById('crop-soil-guidance-text');
  if (guideText) guideText.style.display = 'none';

  // Toggle sections display and scroll into view
  resultSec.style.display = 'block';
  resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════════════════════════════════════
   CROP GUIDANCE SELECTOR (soil-analysis-advisory integration)
   ============================================================ */
function initCropSelector() {
  const selector = document.getElementById('soil-crop-guide-select');
  const guideBox = document.getElementById('crop-soil-guidance-text');
  const valEl    = document.getElementById('crop-soil-guidance-val');

  if (!selector || !guideBox || !valEl) return;

  selector.addEventListener('change', function() {
    const crop = this.value;
    // TODO: Connect crop-specific soil recommendation engine through FastAPI.
    if (crop && CROP_SOIL_GUIDANCE[crop]) {
      valEl.textContent = CROP_SOIL_GUIDANCE[crop];
      guideBox.style.display = 'block';
      guideBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      guideBox.style.display = 'none';
    }
  });
}

/* ════════════════════════════════════════════════════════════
   ACTION CONTROLLERS (Save, PDF, Crop Advisory, Reset)
   ============================================================ */
function initActionHandlers() {
  const anotherBtn  = document.getElementById('btn-soil-another');
  const saveBtn     = document.getElementById('btn-soil-save');
  const downloadBtn = document.getElementById('btn-soil-download');
  const advisoryBtn = document.getElementById('btn-soil-advisory');
  const fertilizeBtn = document.getElementById('btn-soil-fertilizer');

  // Save report logs toast
  saveBtn?.addEventListener('click', () => {
    // TODO: Save soil analysis to MongoDB through FastAPI.
    if (typeof window.showToast === 'function') {
      window.showToast('Soil diagnostic report saved to profile.', 'success');
    }
  });

  // Download PDF Report
  downloadBtn?.addEventListener('click', () => {
    // TODO: Generate downloadable PDF report through FastAPI.
    if (typeof window.showToast === 'function') {
      window.showToast('Generating PDF Report... Download starting.', 'info');
    }
  });

  // Redirect to Crop Advisory page
  advisoryBtn?.addEventListener('click', () => {
    // TODO: Pass soil analysis result to Crop Advisory module.
    window.location.href = 'crop-advisory.html';
  });

  // Redirect to Fertilizer page
  fertilizeBtn?.addEventListener('click', () => {
    // TODO: Pass soil analysis data to fertilizer recommendation module.
    window.location.href = 'fertilizer.html';
  });

  // Analyze Another Report (Reset page to initial state)
  anotherBtn?.addEventListener('click', () => {
    document.getElementById('dashboard-main').scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      // Clear file upload UI state
      document.getElementById('pdf-remove-btn')?.click();

      // Reset loading checkpoints classes
      const steps = [
        'step-upload', 'step-read', 'step-text', 'step-detect',
        'step-health', 'step-recommend', 'step-report'
      ];
      steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = 'advisory-loading-step';
      });

      // Show empty state
      document.getElementById('soil-result-section').style.display = 'none';
      document.getElementById('soil-empty-state').style.display = 'flex';
    }, 400);
  });
}

/* ════════════════════════════════════════════════════════════
   RECENT REPORTS LOGGER TABLE
   ============================================================ */
function loadRecentReports() {
  const tbody = document.getElementById('recent-reports-tbody');
  if (!tbody) return;

  tbody.innerHTML = MOCK_RECENT_REPORTS.map(log => `
    <tr>
      <td>${log.date}</td>
      <td><i class="fas fa-file-pdf" style="color:#ef4444; margin-right:6px;" aria-hidden="true"></i><strong>${log.fileName}</strong></td>
      <td>${log.crop}</td>
      <td>
        <span class="crop-status-pill crop-status-pill--warning">
          ${log.health}
        </span>
      </td>
      <td>
        <span class="status-chip status-chip--completed" style="font-size:0.75rem;">
          <i class="fas fa-check-circle" aria-hidden="true"></i> ${log.status}
        </span>
      </td>
    </tr>
  `).join('');
}
