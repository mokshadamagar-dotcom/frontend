/* ============================================================
   KrishiMitra AI – pest-detection.js
   Pest Radar Dashboard Interactive Client Engine
   ============================================================ */

'use strict';

// ── STATE VARIABLES ──────────────────────────────────────────
let selectedFile = null;
let currentAnalysisResult = null;

// Mock weather profiles per Maharashtra city for demo simulation
const MOCK_CITY_WEATHER = {
  "Nagpur": { temp: "32°C", humidity: "78%", rain: "12mm", risk: "Moderate Risk (52%)" },
  "Pune": { temp: "28°C", humidity: "82%", rain: "8mm", risk: "Moderate Risk (45%)" },
  "Nashik": { temp: "26°C", humidity: "65%", rain: "4mm", risk: "Low Risk (28%)" },
  "Mumbai": { temp: "30°C", humidity: "90%", rain: "45mm", risk: "High Risk (75%)" },
  "Aurangabad": { temp: "33°C", humidity: "50%", rain: "0mm", risk: "Low Risk (18%)" }
};

// Default language selection hook
function getSelectedLanguage() {
  return localStorage.getItem('km_language') || 'en';
}

document.addEventListener('DOMContentLoaded', () => {
  initUploadSystem();
  initFormSystem();
  initExpandableCards();
  initControlTabs();
  initRadarMap();
  initIntegrationLinks();
  loadHistory();
  checkUrlParams();
});

// ── URL PARAMETERS CHECK (For AI alerts routing) ──────────────
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const triggerAlert = params.get('alert');
  if (triggerAlert) {
    const alertBox = document.getElementById('ai-outbreak-alert');
    if (alertBox) {
      alertBox.style.display = 'flex';
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// ── IMAGE UPLOAD & VALIDATION DRIVER ─────────────────────────
function initUploadSystem() {
  const uploadZone = document.getElementById('pest-upload-zone');
  const fileInput = document.getElementById('pest-file-input');
  const cameraInput = document.getElementById('pest-camera-input');
  const btnTriggerCamera = document.getElementById('btn-trigger-camera');
  
  const previewBox = document.getElementById('pest-preview-box');
  const placeholder = document.getElementById('pest-upload-placeholder');
  const previewImg = document.getElementById('pest-preview-img');
  const filenameEl = document.getElementById('pest-preview-filename');
  const filesizeEl = document.getElementById('pest-preview-filesize');
  
  const removeBtn = document.getElementById('pest-remove-btn');
  const changeBtn = document.getElementById('pest-change-btn');
  const submitBtn = document.getElementById('pest-submit-btn');

  if (!uploadZone || !fileInput) return;

  // Click to browse file
  uploadZone.addEventListener('click', (e) => {
    if (e.target !== changeBtn && !changeBtn.contains(e.target) && e.target !== removeBtn && !removeBtn.contains(e.target)) {
      fileInput.click();
    }
  });

  // Native camera trigger button
  btnTriggerCamera?.addEventListener('click', () => {
    cameraInput.click();
  });

  // Handle camera file selection
  cameraInput?.addEventListener('change', function() {
    if (this.files.length) {
      validateAndPreviewFile(this.files[0]);
    }
  });

  // Drag and drop event handlers
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      validateAndPreviewFile(files[0]);
    }
  });

  fileInput.addEventListener('change', function() {
    if (this.files.length) {
      validateAndPreviewFile(this.files[0]);
    }
  });

  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUploadZone();
  });

  changeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  function validateAndPreviewFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) return;

    if (!validTypes.includes(file.type)) {
      showToastMessage('Only JPG, JPEG, PNG and WEBP images are supported.', 'error');
      return;
    }

    if (file.size > maxSize) {
      showToastMessage('Image size must be less than 10 MB.', 'error');
      return;
    }

    selectedFile = file;
    filenameEl.textContent = file.name;
    filesizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      placeholder.style.display = 'none';
      previewBox.style.display = 'flex';
      submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  function resetUploadZone() {
    selectedFile = null;
    fileInput.value = '';
    if (cameraInput) cameraInput.value = '';
    previewImg.src = '';
    previewBox.style.display = 'none';
    placeholder.style.display = 'block';
    submitBtn.disabled = true;
  }
}

// ── AI ANALYSIS LOADER ENGINE ────────────────────────────────
function initFormSystem() {
  const form = document.getElementById('pest-radar-form');
  const loader = document.getElementById('pest-analysis-loader');
  const resultSec = document.getElementById('pest-result-section');
  const emptyState = document.getElementById('pest-empty-state');
  const submitBtn = document.getElementById('pest-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToastMessage('Please upload a valid crop image.', 'error');
      return;
    }

    emptyState.style.display = 'none';
    resultSec.style.display = 'none';
    loader.style.display = 'flex';
    submitBtn.disabled = true;

    loader.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Start loader visual step cycle
    await runLoaderAnimation();

    try {
      const cropType = document.getElementById('crop-type-select').value;
      const district = document.getElementById('pest-district-input').value;
      const state = document.getElementById('pest-state-input').value;
      const location = district && state ? `${district}, ${state}` : (district || state || 'Nagpur, MH');

      const formData = new FormData();
      formData.append('image', selectedFile);
      if (cropType) formData.append('crop_type', cropType);
      if (location) formData.append('location', location);
      formData.append('language', getSelectedLanguage());

      const response = await callPestDetectAPI(formData);
      currentAnalysisResult = response;
      
      renderPestResults(response);
      triggerOutbreakAlertCheck(response);
    } catch (err) {
      console.error("Pest detection error:", err);
      showToastMessage('Unable to analyze image. Running in offline fallback mode.', 'warning');
      
      // Local Mock fallback execution
      const fallbackData = getLocalMockResult();
      currentAnalysisResult = fallbackData;
      renderPestResults(fallbackData);
    } finally {
      loader.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}

// Async simulated animation milestones
async function runLoaderAnimation() {
  const steps = [
    { id: 'step-1', delay: 0 },
    { id: 'step-2', delay: 500 },
    { id: 'step-3', delay: 1000 },
    { id: 'step-4', delay: 1500 },
    { id: 'step-5', delay: 2000 }
  ];

  // Reset steps
  steps.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.className = 'analysis-step';
    }
  });

  for (const step of steps) {
    await new Promise(r => setTimeout(r, step.delay - (step.id === 'step-1' ? 0 : steps[steps.indexOf(step)-1].delay)));
    const el = document.getElementById(step.id);
    if (el) {
      el.classList.add('active');
      if (steps.indexOf(step) > 0) {
        const prevEl = document.getElementById(steps[steps.indexOf(step)-1].id);
        prevEl?.classList.remove('active');
        prevEl?.classList.add('completed');
      }
    }
  }
  // Complete the last step briefly
  await new Promise(r => setTimeout(r, 400));
  document.getElementById('step-5')?.classList.add('completed');
}

// ── FASTAPI DISPATCH SERVICE ──────────────────────────────────
async function callPestDetectAPI(formData) {
  const token = localStorage.getItem('km_auth_token') || sessionStorage.getItem('km_auth_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch('http://localhost:8000/api/v1/pest/detect', {
      method: 'POST',
      body: formData,
      headers: headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (res.status === 413) {
      throw new Error('Image is too large.');
    }
    if (res.status === 401) {
      throw new Error('Unauthorized. Please log in.');
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Service error.');
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Get mock client results based on input values
function getLocalMockResult() {
  const cropSelect = document.getElementById('crop-type-select');
  const crop = cropSelect ? cropSelect.value : '';
  const lang = getSelectedLanguage();

  const labels = {
    en: { detected: "Pest Detected", aphids: "Aphids", whiteflies: "Whiteflies", stemBorer: "Stem Borer", spiderMite: "Spider Mite", healthy: "No Pest Detected" },
    mr: { detected: "कीड आढळली", aphids: "मावा", whiteflies: "पांढरी माशी", stemBorer: "खोडकिडा", spiderMite: "लाल कोळी", healthy: "कोणतीही कीड आढळली नाही" },
    hi: { detected: "कीट पाया गया", aphids: "लाही (एफिड)", whiteflies: "सफेद मक्खी", stemBorer: "तना छेदक", spiderMite: "लाल मकड़ी", healthy: "कोई कीट नहीं पाया गया" }
  };

  const currentLabels = labels[lang] || labels['en'];

  if (crop === 'tomato') {
    return {
      pest_detected: true,
      pest_name: currentLabels.whiteflies,
      confidence: 88,
      severity: "High",
      risk_score: 78,
      affected_crop: "Tomato",
      overview: lang === 'mr' ? "पांढऱ्या माश्या पानांच्या खालच्या बाजूला राहून रस शोषतात." : lang === 'hi' ? "सफेद मक्खियाँ पत्तियों के निचले हिस्से से रस चूसती हैं।" : "Tiny sap-sucking insects commonly found on tomato plant leaf undersides.",
      symptoms: [
        lang === 'mr' ? "झाडाची पाने पिवळी पडणे व सुकणे." : "Leaf yellowing, curling, or dry wilting.",
        "Sticky honeydew excretions leading to dark mold.",
        "Clouds of tiny white flies emerge when plant is shaken."
      ],
      causes: ["Hot, dry weather patterns", "Overcrowded plant canopy spacing"],
      affected_parts: ["Leaves", "Stems"],
      life_cycle: "Egg to adult cycle takes 18-28 days depending on heat.",
      recommendations: {
        immediate_action: ["Install yellow sticky traps immediately.", "Prune heavily infested leaves."],
        biological_control: ["Encourage lacewings and ladybugs."],
        cultural_control: ["Maintain field sanitation and clean weed alternate hosts."],
        organic_options: ["Spray neem oil formulation (5ml per liter)."],
        chemical_control: ["Apply buprofezin or spiromesifen strictly following label safety details."]
      },
      prevention_tips: ["Use insect-proof nursery screens.", "Inspect crops twice weekly."],
      analysis_mode: "demo",
      disclaimer: "AI-assisted estimate based on mockup datasets. Consult agronomist."
    };
  } else if (crop === 'wheat') {
    return {
      pest_detected: false,
      pest_name: currentLabels.healthy,
      confidence: 95,
      severity: "Low",
      risk_score: 12,
      affected_crop: "Wheat",
      overview: "Visual diagnostic pattern analysis shows no active harmful insects or leaf infestation.",
      symptoms: [],
      causes: [],
      affected_parts: [],
      life_cycle: "N/A",
      recommendations: {
        immediate_action: ["Continue standard visual field scouting cycles."],
        biological_control: [],
        cultural_control: ["Maintain balanced soil nutrients and standard irrigation."],
        organic_options: [],
        chemical_control: []
      },
      prevention_tips: ["Scout field margins regularly.", "Rotate crops between crop seasons."],
      analysis_mode: "demo",
      disclaimer: "AI-assisted estimate based on mockup datasets."
    };
  } else {
    // Default Cotton / Aphids
    return {
      pest_detected: true,
      pest_name: currentLabels.aphids,
      confidence: 91,
      severity: "Moderate",
      risk_score: 62,
      affected_crop: crop ? crop.charAt(0).toUpperCase() + crop.slice(1) : "Cotton",
      overview: "Small soft-bodied insects clustering on young stems and under leaves to suck nutrient sap.",
      symptoms: [
        "Downward curling and distorted leaves.",
        "Yellowing patches on leaf surfaces.",
        "Active ant trails trailing along stems."
      ],
      causes: ["Mild temperatures with high nitrogen fertilizer application", "Lack of local biological insect predators"],
      affected_parts: ["Young leaves", "Stems", "Shoots"],
      life_cycle: "Very fast reproduction. New generations emerge every 7-10 days.",
      recommendations: {
        immediate_action: ["Wash leaves with a sharp water jet.", "Scout field hotspots manually."],
        biological_control: ["Encourage ladybird beetles and hoverfly larvae."],
        cultural_control: ["Limit excessive nitrogen application."],
        organic_options: ["Spray mild insecticidal soaps or neem extracts."],
        chemical_control: ["Spray imidacloprid only if infestation crosses threshold parameters. Follow instructions."]
      },
      prevention_tips: ["Clean alternate weed hosts from field margins.", "Practice crop companion planting."],
      analysis_mode: "demo",
      disclaimer: "AI-assisted estimate based on mockup datasets."
    };
  }
}

// ── RESULT CARD RENDER ENGINE ───────────────────────────────
function renderPestResults(data) {
  const resultSec = document.getElementById('pest-result-section');
  if (!resultSec) return;

  // Language mapping
  const lang = getSelectedLanguage();
  const headings = {
    en: { detected: "Pest Detected", healthy: "Crop Healthy" },
    mr: { detected: "कीड आढळली", healthy: "पीक निरोगी" },
    hi: { detected: "कीट पाया गया", healthy: "फसल स्वस्थ" }
  };
  const activeHeadings = headings[lang] || headings['en'];

  // Fill overview card fields
  const statusBadge = document.getElementById('res-status-badge');
  const cropVal = document.getElementById('res-crop-val');
  const severityVal = document.getElementById('res-severity-val');
  const mainTitle = document.getElementById('res-pest-main-title');
  const mainSubtitle = document.getElementById('res-pest-main-subtitle');
  const modeBadge = document.getElementById('res-mode-badge');

  if (statusBadge) {
    statusBadge.textContent = data.pest_detected ? activeHeadings.detected : activeHeadings.healthy;
    statusBadge.className = `severity-pill severity--${data.severity.toLowerCase()}`;
  }

  if (cropVal) cropVal.textContent = data.affected_crop;
  if (severityVal) {
    severityVal.textContent = data.severity;
    severityVal.className = `result-stat-badge__value severity-label--${data.severity.toLowerCase()}`;
  }

  if (mainTitle) {
    mainTitle.textContent = data.pest_name;
  }
  if (mainSubtitle) {
    mainSubtitle.textContent = data.pest_detected 
      ? `AI identified active ${data.pest_name} patterns in the crop image.`
      : `AI found no active pest activity. Specimen is healthy.`;
  }

  if (modeBadge) {
    modeBadge.textContent = data.analysis_mode === 'ai' ? 'AI Model' : 'Demo Mode';
    modeBadge.className = data.analysis_mode === 'ai' ? 'km-badge km-badge--green' : 'km-badge km-badge--blue';
  }

  // Draw circular gauge
  const scoreVal = document.getElementById('risk-score-val');
  const badgeLabel = document.getElementById('risk-badge-label');
  const gaugeCircle = document.getElementById('risk-gauge-circle');

  if (scoreVal) scoreVal.textContent = data.risk_score;
  if (badgeLabel) {
    badgeLabel.textContent = `${data.severity} Risk`;
    badgeLabel.className = `severity-pill severity--${data.severity.toLowerCase()} risk-gauge-label`;
  }

  if (gaugeCircle) {
    // Dasharray is 2 * PI * R where R=58 => 364.4
    const r = 58;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (data.risk_score / 100) * circumference;
    gaugeCircle.style.strokeDashoffset = offset;
    
    // Choose color for gauge line
    let strokeColor = "#16a34a"; // low green
    if (data.severity === "Moderate") strokeColor = "#eab308";
    if (data.severity === "High") strokeColor = "#ea580c";
    if (data.severity === "Critical") strokeColor = "#dc2626";
    gaugeCircle.style.stroke = strokeColor;
  }

  // Pest Overview Text
  const overviewText = document.getElementById('res-pest-overview');
  const partsText = document.getElementById('res-pest-parts');
  if (overviewText) overviewText.textContent = data.overview;
  if (partsText) partsText.textContent = data.affected_parts.length ? data.affected_parts.join(', ') : 'N/A';

  // Life cycle
  const lifecycleText = document.getElementById('res-pest-lifecycle');
  if (lifecycleText) lifecycleText.textContent = data.life_cycle;

  // Symptoms
  const symptomsList = document.getElementById('res-pest-symptoms');
  if (symptomsList) {
    if (data.symptoms.length) {
      symptomsList.innerHTML = data.symptoms.map(s => `<li>${s}</li>`).join('');
      document.getElementById('card-symptoms').style.display = 'block';
    } else {
      document.getElementById('card-symptoms').style.display = 'none';
    }
  }

  // Causes
  const causesList = document.getElementById('res-pest-causes');
  if (causesList) {
    if (data.causes.length) {
      causesList.innerHTML = data.causes.map(c => `<li>${c}</li>`).join('');
      document.getElementById('card-causes').style.display = 'block';
    } else {
      document.getElementById('card-causes').style.display = 'none';
    }
  }

  // Controls lists tabs population
  const recs = data.recommendations;
  populateAdvisoryList('res-ctrl-immediate', recs.immediate_action);
  populateAdvisoryList('res-ctrl-biological', recs.biological_control);
  populateAdvisoryList('res-ctrl-cultural', recs.cultural_control);
  populateAdvisoryList('res-ctrl-organic', recs.organic_options);
  populateAdvisoryList('res-ctrl-chemical', recs.chemical_control);

  // Prevention tips
  const preventionList = document.getElementById('res-pest-prevention');
  if (preventionList) {
    preventionList.innerHTML = data.prevention_tips.map(t => `<li>${t}</li>`).join('');
  }

  // Local Risk card sync
  const userCrop = document.getElementById('risk-user-crop');
  if (userCrop) userCrop.textContent = data.affected_crop;

  // Reset controls tabs to first
  document.querySelector('.control-tab-btn[data-tab="immediate"]')?.click();

  // Show result wrapper
  resultSec.style.display = 'block';
  resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Update actions button parameters & event listeners
  setupResultActionButtons(data);
}

function populateAdvisoryList(elementId, items) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (items && items.length) {
    el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
  } else {
    el.innerHTML = `<li>No specific recommendations for this category.</li>`;
  }
}

// Setup Result secondary action buttons
function setupResultActionButtons(data) {
  const anotherBtn = document.getElementById('btn-pest-another');
  const saveBtn = document.getElementById('btn-pest-save');
  const downloadBtn = document.getElementById('btn-pest-download');

  anotherBtn.onclick = () => {
    document.getElementById('pest-remove-btn')?.click();
    document.getElementById('pest-result-section').style.display = 'none';
    document.getElementById('pest-empty-state').style.display = 'flex';
    document.getElementById('dashboard-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  saveBtn.onclick = async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const saveRequest = {
      pest_name: data.pest_name,
      crop_type: data.affected_crop,
      confidence: data.confidence,
      severity: data.severity,
      risk_score: data.risk_score,
      analysis_mode: data.analysis_mode
    };

    try {
      const saved = await saveDetectionResultAPI(data.detection_id || saveRequest);
      if (saved) {
        showToastMessage('Detection result saved successfully.', 'success');
      } else {
        // Local fallback storage
        saveToLocalStorageHistory(saveRequest);
        showToastMessage('Saved successfully (Local Archive).', 'success');
      }
      loadHistory();
    } catch (err) {
      saveToLocalStorageHistory(saveRequest);
      showToastMessage('Saved successfully (Local Archive).', 'success');
      loadHistory();
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Detection Result';
    }
  };

  downloadBtn.onclick = () => {
    showToastMessage('Compiling advisory PDF report... starting download.', 'info');
    // Generate simple dynamic file download for client side
    const reportText = `
    KRISHIMITRA AI - PEST RADAR REPORT
    ----------------------------------
    Date: ${new Date().toLocaleDateString()}
    Crop Type: ${data.affected_crop}
    Detected Pest: ${data.pest_name}
    Confidence Score: ${data.confidence}%
    Severity: ${data.severity}
    Risk Score: ${data.risk_score}/100
    Overview: ${data.overview}
    
    Disclaimer: AI-assisted diagnosis. Verify with local agricultural expert.
    `;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Pest_Report_${data.pest_name.replace(/\s+/g, '_')}.txt`;
    link.click();
  };
}

// API endpoint calls
async function saveDetectionResultAPI(payload) {
  const token = localStorage.getItem('km_auth_token') || sessionStorage.getItem('km_auth_token');
  if (!token) return false; // Fail silently to allow local storage trigger

  try {
    const res = await fetch('http://localhost:8000/api/v1/pest/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// ── LOCAL STORAGE ENGINE ──────────────────────────────────────
const HISTORY_KEY = 'km_pest_history';

function saveToLocalStorageHistory(item) {
  const history = getLocalStorageHistory();
  const newRecord = {
    id: 'local_' + Date.now(),
    pest_name: item.pest_name,
    affected_crop: item.crop_type || item.affected_crop,
    confidence: item.confidence,
    severity: item.severity,
    risk_score: item.risk_score,
    analysis_mode: 'demo',
    created_at: new Date().toISOString()
  };
  history.unshift(newRecord);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getLocalStorageHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function deleteLocalStorageHistory(id) {
  let history = getLocalStorageHistory();
  history = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// ── SMART ALERT ADVISORY SYSTEM ──────────────────────────────
function triggerOutbreakAlertCheck(result) {
  const alertBox = document.getElementById('ai-outbreak-alert');
  const alertTitle = document.getElementById('alert-title');
  const alertDesc = document.getElementById('alert-desc');
  const alertActionBtn = document.getElementById('alert-action-btn');

  if (!alertBox) return;

  if (result.pest_detected && (result.severity === 'High' || result.severity === 'Critical')) {
    alertTitle.textContent = `Smart Pest Alert: Severe ${result.pest_name} Threat Detected`;
    alertDesc.textContent = `Smart Pest Alert: Potential risk detected for ${result.affected_crop}. Rapid breeding conditions verified. Immediate control action is highly recommended.`;
    alertBox.className = 'ai-smart-alert visible';
    alertBox.style.display = 'flex';
    
    alertActionBtn.onclick = () => {
      document.getElementById('pest-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  } else {
    alertBox.style.display = 'none';
  }
}

// ── EXPANDABLE RESULTS INTERACTIVE CARDS ─────────────────────
function initExpandableCards() {
  const cards = document.querySelectorAll('.pest-expandable-card');
  cards.forEach(card => {
    const header = card.querySelector('.pest-expandable-header');
    header?.addEventListener('click', () => {
      card.classList.toggle('open');
    });
  });
}

// ── CONTROL ADVISORY TABS SWITCHING ──────────────────────────
function initControlTabs() {
  const tabs = document.querySelectorAll('.control-tab-btn');
  const panels = document.querySelectorAll('.control-content-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });
}

// ── RADAR MAP INTERACTIVE DOTS ───────────────────────────────
function initRadarMap() {
  const hotspots = document.querySelectorAll('.pest-outbreak-hotspot');
  const tooltip = document.getElementById('map-tooltip');
  const tZone = document.getElementById('tooltip-zone');
  const tPest = document.getElementById('tooltip-pest');
  const tRisk = document.getElementById('tooltip-risk');

  const locInput = document.getElementById('pest-district-input');
  const stateInput = document.getElementById('pest-state-input');
  const mapContainer = document.querySelector('.pest-map-visual');

  hotspots.forEach(spot => {
    spot.addEventListener('mouseenter', (e) => {
      const zone = spot.getAttribute('data-zone');
      const pest = spot.getAttribute('data-pest');
      const risk = spot.getAttribute('data-risk');

      if (tZone) tZone.textContent = zone;
      if (tPest) tPest.textContent = pest;
      if (tRisk) tRisk.textContent = risk;

      // Position tooltip near hotspot dot relative to map visual container
      const rect = spot.getBoundingClientRect();
      const parentRect = mapContainer.getBoundingClientRect();
      
      if (tooltip) {
        tooltip.style.left = (rect.left - parentRect.left + 20) + 'px';
        tooltip.style.top = (rect.top - parentRect.top - 10) + 'px';
        tooltip.style.display = 'block';
      }
    });

    spot.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
    });

    // Map click selection
    spot.addEventListener('click', () => {
      const zone = spot.getAttribute('data-zone');
      if (locInput) locInput.value = zone;
      if (stateInput) stateInput.value = 'Maharashtra';
      
      // Update local risk details
      const userLoc = document.getElementById('risk-user-loc');
      if (userLoc) userLoc.textContent = `${zone}, MH`;

      // Trigger weather details changes per city
      const weatherData = MOCK_CITY_WEATHER[zone];
      if (weatherData) {
        updateWeatherPanelMetrics(weatherData);
      }

      showToastMessage(`Radar location updated to ${zone}`, 'info');
    });
  });
}

function updateWeatherPanelMetrics(w) {
  const localRiskGrid = document.querySelector('.local-risk-grid');
  if (!localRiskGrid) return;

  const labels = localRiskGrid.querySelectorAll('.local-risk-box');
  if (labels.length > 0) {
    const locRows = labels[0].querySelectorAll('.local-risk-stat-row');
    if (locRows.length > 2) {
      locRows[2].querySelector('strong').textContent = w.risk;
    }
  }
  
  if (labels.length > 1) {
    const wMetrics = labels[1].querySelectorAll('strong');
    if (wMetrics.length > 2) {
      wMetrics[0].textContent = w.temp;
      wMetrics[1].textContent = w.humidity;
      wMetrics[2].textContent = w.rain;
    }
  }
}

// ── SYSTEM NAVIGATION INTEGRATION GATEWAYS ───────────────────
function initIntegrationLinks() {
  const linkAdvisory = document.getElementById('link-crop-advisory');
  const linkChatbot = document.getElementById('link-ai-chatbot');
  const linkVoice = document.getElementById('link-voice-assistant');

  linkAdvisory?.addEventListener('click', (e) => {
    e.preventDefault();
    // Pass context parameters to crop advisory
    // TODO: Pass pest detection context to Crop Advisory.
    const pestName = currentAnalysisResult ? currentAnalysisResult.pest_name : '';
    const cropName = currentAnalysisResult ? currentAnalysisResult.affected_crop : '';
    const severity = currentAnalysisResult ? currentAnalysisResult.severity : '';
    window.location.href = `crop-advisory.html?pest=${encodeURIComponent(pestName)}&crop=${encodeURIComponent(cropName)}&severity=${encodeURIComponent(severity)}`;
  });

  linkChatbot?.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Pass pest detection context to AI chatbot.
    const pestName = currentAnalysisResult ? currentAnalysisResult.pest_name : '';
    const cropName = currentAnalysisResult ? currentAnalysisResult.affected_crop : '';
    window.location.href = `chatbot.html?topic=pest_control&pest=${encodeURIComponent(pestName)}&crop=${encodeURIComponent(cropName)}`;
  });

  linkVoice?.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Integrate Pest Radar context with Voice Assistant.
    const pestName = currentAnalysisResult ? currentAnalysisResult.pest_name : '';
    window.location.href = `voice-assistant.html?query=${encodeURIComponent(pestName)}`;
  });
}

// ── HISTORY COMPONENT LOGS ───────────────────────────────────
async function loadHistory() {
  const tbody = document.getElementById('recent-pests-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Loading historical logs...</td></tr>`;

  try {
    const apiHistory = await fetchHistoryAPI();
    let historyItems = [];
    
    if (apiHistory && apiHistory.success && apiHistory.items) {
      historyItems = apiHistory.items;
    } else {
      historyItems = getLocalStorageHistory();
    }

    renderHistoryTable(historyItems);
  } catch (err) {
    // Offline local storage history fallback
    const localItems = getLocalStorageHistory();
    renderHistoryTable(localItems);
  }
}

async function fetchHistoryAPI() {
  const token = localStorage.getItem('km_auth_token') || sessionStorage.getItem('km_auth_token');
  if (!token) return null;

  try {
    const res = await fetch('http://localhost:8000/api/v1/pest/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    return null;
  }
}

function renderHistoryTable(items) {
  const tbody = document.getElementById('recent-pests-tbody');
  if (!tbody) return;

  if (!items || items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-light);"><i class="fas fa-folder-open" style="font-size:1.5rem; opacity:0.5; margin-bottom:8px; display:block;"></i>No historical scans found.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(log => {
    const formattedDate = new Date(log.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const sevClass = log.severity.toLowerCase();
    
    return `
      <tr style="border-bottom:1px solid var(--dash-border);">
        <td style="padding:12px 20px;">${formattedDate}</td>
        <td style="padding:12px 20px;"><strong>${log.affected_crop || log.crop_type}</strong></td>
        <td style="padding:12px 20px;">${log.pest_name}</td>
        <td style="padding:12px 20px;"><span style="color:var(--primary); font-weight:700;">${log.confidence}%</span></td>
        <td style="padding:12px 20px;"><span class="severity-pill severity--${sevClass}">${log.severity}</span></td>
        <td style="padding:12px 20px;"><span class="km-badge km-badge--${log.analysis_mode === 'ai' ? 'green' : 'blue'}" style="font-size:0.65rem;">${log.analysis_mode === 'ai' ? 'AI Model' : 'Demo'}</span></td>
        <td style="padding:12px 20px; display:flex; gap:8px;">
          <button class="km-btn km-btn--outline km-btn--sm btn-view-history" data-id="${log.id || log._id}" style="padding:4px 8px;" aria-label="View this analysis"><i class="fas fa-eye"></i></button>
          <button class="preview-btn--remove btn-delete-history" data-id="${log.id || log._id}" style="width:24px; height:24px; font-size:0.75rem;" aria-label="Delete this record"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach action triggers to newly added nodes
  attachHistoryActionListeners();
}

function attachHistoryActionListeners() {
  document.querySelectorAll('.btn-view-history').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      showLoading('Retrieving analysis details...');
      try {
        let details = null;
        if (id.startsWith('local_')) {
          const list = getLocalStorageHistory();
          details = list.find(item => item.id === id);
          // Format local structure slightly to match result rendering expectations
          if (details) {
            details.pest_detected = details.risk_score > 20;
            // Merge defaults for details rendering
            const localDetails = getLocalMockResult();
            details = { ...localDetails, ...details };
          }
        } else {
          details = await getSingleHistoryAPI(id);
        }

        hideLoading();
        if (details) {
          renderPestResults(details);
          document.getElementById('pest-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          showToastMessage('Unable to load record details.', 'error');
        }
      } catch (err) {
        hideLoading();
        showToastMessage('Failed to view record.', 'error');
      }
    };
  });

  document.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this scan record?')) {
        showLoading('Deleting record...');
        try {
          let success = false;
          if (id.startsWith('local_')) {
            deleteLocalStorageHistory(id);
            success = true;
          } else {
            success = await deleteHistoryAPI(id);
          }

          hideLoading();
          if (success) {
            showToastMessage('Record deleted successfully.', 'success');
            loadHistory();
          } else {
            showToastMessage('Failed to delete history record.', 'error');
          }
        } catch (err) {
          hideLoading();
          showToastMessage('Delete operation failed.', 'error');
        }
      }
    };
  });
}

async function getSingleHistoryAPI(id) {
  const token = localStorage.getItem('km_auth_token') || sessionStorage.getItem('km_auth_token');
  if (!token) return null;
  try {
    const res = await fetch(`http://localhost:8000/api/v1/pest/history/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    return null;
  }
}

async function deleteHistoryAPI(id) {
  const token = localStorage.getItem('km_auth_token') || sessionStorage.getItem('km_auth_token');
  if (!token) return false;
  try {
    const res = await fetch(`http://localhost:8000/api/v1/pest/history/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// ── UTILITIES ────────────────────────────────────────────────
function showToastMessage(msg, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(msg, type);
  } else {
    alert(`${type.toUpperCase()}: ${msg}`);
  }
}
