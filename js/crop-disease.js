/* ============================================================
   KrishiMitra AI – crop-disease.js
   AI Crop Disease Detection Logic
   Wired with shared component loader / toast system
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   MOCK DATA FOR HACKATHON DEMO
   Structure is ready to be directly mapped to FastAPI response
   ============================================================ */
const MOCK_DISEASE_RESULT = {
  crop: "Cotton",
  disease: "Leaf Spot",
  confidence: 92,
  severity: "Moderate",
  status: "Needs Attention",
  symptoms: [
    "Small circular spots on leaves with purple or brown margins.",
    "Brown or dark lesions spreading across the leaf surface.",
    "Yellowing (chlorosis) around the affected spot areas.",
    "Gradual leaf dry-out and premature shedding under severe infection."
  ],
  causes: [
    "Fungal pathogens (Alternaria macrospora / Cercospora).",
    "Extended periods of high humidity (>85%) and leaf wetness.",
    "Poor field air circulation due to excessive weed growth or dense planting.",
    "Warm temperatures ranging between 25°C to 32°C."
  ],
  treatment: [
    "Carefully prune and remove severely affected lower leaves, and destroy them away from the field.",
    "Maintain proper field sanitation by clearing crop residues and weed hosts.",
    "Improve air circulation around plants by ensuring optimal plant-to-row spacing.",
    "If infection spreads rapidly, apply an approved systemic fungicide (e.g., Mancozeb or Copper Oxychloride) as per local agricultural recommendations. Avoid spraying just before rainfall."
  ],
  prevention: [
    "Ensure clean field hygiene before sowing.",
    "Avoid excessive moisture and overhead sprinkler irrigation.",
    "Monitor crops regularly (at least twice a week) during high-humidity seasons.",
    "Use certified disease-resistant crop seeds.",
    "Ensure proper plant spacing for efficient solar penetration and ventilation."
  ]
};

/* ════════════════════════════════════════════════════════════
   RECENT HISTORICAL ANALYSES (Mock data)
   ============================================================ */
const MOCK_HISTORY = [
  { date: "24 Jul 2026", crop: "Cotton", disease: "Leaf Spot", confidence: 92, status: "Needs Attention", statusClass: "warning" },
  { date: "23 Jul 2026", crop: "Tomato", disease: "Healthy Crop", confidence: 95, status: "Healthy", statusClass: "healthy" },
  { date: "22 Jul 2026", crop: "Wheat", disease: "Leaf Rust", confidence: 88, status: "Needs Attention", statusClass: "warning" }
];

/* ════════════════════════════════════════════════════════════
   STATE MANAGEMENT
   ============================================================ */
let selectedFile = null;

/* ════════════════════════════════════════════════════════════
   INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initUploadHandlers();
  initFormHandlers();
  loadHistoryTable();
  initActionHandlers();
});

/* ════════════════════════════════════════════════════════════
   UPLOAD & PREVIEW HANDLERS
   ============================================================ */
function initUploadHandlers() {
  const dropZone     = document.getElementById('upload-zone');
  const fileInput    = document.getElementById('crop-file-input');
  const previewBox   = document.getElementById('preview-box');
  const placeholder  = document.getElementById('upload-placeholder');
  const previewImg   = document.getElementById('preview-img');
  const filenameEl   = document.getElementById('preview-filename');
  const filesizeEl   = document.getElementById('preview-filesize');
  const removeBtn    = document.getElementById('remove-preview-btn');
  const changeBtn    = document.getElementById('change-image-btn');
  const analyzeBtn   = document.getElementById('analyze-submit-btn');

  if (!dropZone || !fileInput) return;

  // Open file selector on click
  dropZone.addEventListener('click', () => fileInput.click());

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop zone
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
  });

  // Handle dropped files
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) handleFile(files[0]);
  });

  // Handle selected files
  fileInput.addEventListener('change', function() {
    if (this.files.length) handleFile(this.files[0]);
  });

  // Change image button trigger
  changeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  // Remove image preview
  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUploadState();
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Validate type
    if (!validTypes.includes(file.type)) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please upload a valid JPG, PNG, or WEBP crop image.', 'error');
      }
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      if (typeof window.showToast === 'function') {
        window.showToast('Image size exceeds the 10 MB limit.', 'error');
      }
      return;
    }

    selectedFile = file;

    // Update details
    filenameEl.textContent = file.name;
    filesizeEl.textContent = formatBytes(file.size);

    // Read and show preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
      previewImg.src = reader.result;
      placeholder.style.display = 'none';
      previewBox.style.display = 'flex';
      analyzeBtn.disabled = false;
    };
  }

  function resetUploadState() {
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '';
    previewBox.style.display = 'none';
    placeholder.style.display = 'flex';
    analyzeBtn.disabled = true;
  }

  // Helper to format file sizes
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

/* ════════════════════════════════════════════════════════════
   ANALYSIS SUBMIT HANDLER
   ============================================================ */
function initFormHandlers() {
  const form = document.getElementById('disease-detection-form');
  const loader = document.getElementById('analysis-loader');
  const resultSec = document.getElementById('analysis-result-section');
  const emptyState = document.getElementById('analysis-empty-state');
  const analyzeBtn = document.getElementById('analyze-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile) return;

    // Hide previous states
    emptyState.style.display = 'none';
    resultSec.style.display = 'none';
    loader.classList.add('active');
    analyzeBtn.disabled = true;

    // Scroll loader into view
    loader.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      // Execute the AI mock analysis process
      const result = await analyzeCropImage(selectedFile);
      displayAnalysisResult(result);
    } catch (err) {
      console.error(err);
      loader.classList.remove('active');
      analyzeBtn.disabled = false;
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to complete analysis. Please try again.', 'error');
      }
    }
  });
}

/* ════════════════════════════════════════════════════════════
   MOCK AI SERVICE CALL (FastAPI Preparation)
   ============================================================ */
async function analyzeCropImage(imageFile) {
  // Validate file exists
  if (!imageFile) throw new Error('No image file selected.');

  // TODO: Replace mock analysis with FastAPI AI disease detection API.
  // TODO: Send multipart/form-data image to FastAPI endpoint.
  // TODO: Example endpoint: POST /api/v1/disease/analyze
  // TODO: Payload: { file: File, crop_type?: string, growth_stage?: string, location?: string }
  // TODO: Receive crop disease prediction response from backend model.

  // Simulate network processing delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get selected crop type if user specified it
  const cropSelect = document.getElementById('crop-type-select');
  const selectedCrop = cropSelect ? cropSelect.value : '';

  // Return formatted response structure
  return {
    ...MOCK_DISEASE_RESULT,
    crop: selectedCrop ? cropSelect.options[cropSelect.selectedIndex].text : MOCK_DISEASE_RESULT.crop
  };
}

/* ════════════════════════════════════════════════════════════
   DISPLAY ANALYSIS RESULT
   ============================================================ */
function displayAnalysisResult(data) {
  const loader = document.getElementById('analysis-loader');
  const resultSec = document.getElementById('analysis-result-section');
  const analyzeBtn = document.getElementById('analyze-submit-btn');

  // De-activate loader
  loader.classList.remove('active');

  // Populate basic crop details
  document.getElementById('res-crop').textContent = data.crop;
  document.getElementById('res-disease').textContent = data.disease;
  document.getElementById('res-confidence').textContent = `${data.confidence}%`;
  document.getElementById('res-severity').textContent = data.severity;

  // Confidence progress bar
  const confBar = document.getElementById('res-confidence-bar');
  if (confBar) {
    confBar.style.width = `${data.confidence}%`;
    confBar.setAttribute('aria-valuenow', data.confidence);
  }

  // Severity Tag styling
  const severityTag = document.getElementById('res-severity');
  if (severityTag) {
    severityTag.className = `severity-tag severity-tag--${data.severity.toLowerCase()}`;
  }

  // Symptoms Bullet list
  const symptomsList = document.getElementById('res-symptoms-list');
  if (symptomsList) {
    symptomsList.innerHTML = data.symptoms.map(symptom => `
      <div class="bullet-item bullet-item--symptom">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <span>${symptom}</span>
      </div>
    `).join('');
  }

  // Causes Bullet list
  const causesList = document.getElementById('res-causes-list');
  if (causesList) {
    causesList.innerHTML = data.causes.map(cause => `
      <div class="bullet-item bullet-item--cause">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        <span>${cause}</span>
      </div>
    `).join('');
  }

  // Treatment Numbered list
  const treatmentList = document.getElementById('res-treatment-list');
  if (treatmentList) {
    treatmentList.innerHTML = data.treatment.map((step, index) => `
      <div class="treatment-item">
        <div class="treatment-item__num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
        <p class="treatment-item__text">${step}</p>
      </div>
    `).join('');
  }

  // Prevention Grid
  const preventionList = document.getElementById('res-prevention-list');
  if (preventionList) {
    preventionList.innerHTML = data.prevention.map(tip => `
      <div class="prevention-card">
        <i class="fas fa-shield-alt" aria-hidden="true"></i>
        <span>${tip}</span>
      </div>
    `).join('');
  }

  // Show result section and smooth scroll
  resultSec.style.display = 'block';
  resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Re-enable analyze button for resets
  analyzeBtn.disabled = false;
}

/* ════════════════════════════════════════════════════════════
   ACTION HANDLERS (Save, PDF, Chat, Reset)
   ============================================================ */
function initActionHandlers() {
  const resetBtn     = document.getElementById('btn-analyze-another');
  const saveBtn      = document.getElementById('btn-save-history');
  const downloadBtn  = document.getElementById('btn-download-report');
  const askChatBtn   = document.getElementById('btn-ask-chat');
  const expertBtn    = document.getElementById('btn-get-expert');

  // Analyze Another Image (reset page)
  resetBtn?.addEventListener('click', () => {
    // Scroll to top of layout smoothly
    document.getElementById('dashboard-main').scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      // Trigger file remove event to reset upload zone
      document.getElementById('remove-preview-btn')?.click();

      // Reset fields
      const form = document.getElementById('disease-detection-form');
      if (form) form.reset();

      // Show empty state and hide results
      document.getElementById('analysis-result-section').style.display = 'none';
      document.getElementById('analysis-empty-state').style.display = 'flex';
    }, 400);
  });

  // Save to History Action
  saveBtn?.addEventListener('click', () => {
    // TODO: Save analysis result to MongoDB database through FastAPI.
    // TODO: Endpoint POST /api/v1/analyses/save
    if (typeof window.showToast === 'function') {
      window.showToast('Analysis saved to your farm history successfully!', 'success');
    }
  });

  // Download PDF Report Action
  downloadBtn?.addEventListener('click', () => {
    // TODO: Generate downloadable PDF report from backend.
    // TODO: Endpoint GET /api/v1/analyses/{id}/report
    if (typeof window.showToast === 'function') {
      window.showToast('Generating PDF Report... Download will start shortly.', 'info');
    }
  });

  // Ask AI about this Disease (chatbot page redirect)
  askChatBtn?.addEventListener('click', () => {
    const diseaseName = document.getElementById('res-disease').textContent || 'Leaf Spot';
    window.location.href = `chatbot.html?topic=${encodeURIComponent(diseaseName)}`;
  });

  // Expert Guidance Callback
  expertBtn?.addEventListener('click', () => {
    if (typeof window.showToast === 'function') {
      window.showToast('Expert consultation booking will be available in a future update.', 'info');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   HISTORY PREVIEW TABLE LOADER
   ============================================================ */
function loadHistoryTable() {
  const tbody = document.getElementById('recent-analyses-tbody');
  if (!tbody) return;

  tbody.innerHTML = MOCK_HISTORY.map(item => `
    <tr>
      <td>${item.date}</td>
      <td><strong>${item.crop}</strong></td>
      <td>${item.disease}</td>
      <td>
        <span style="font-weight:700;color:var(--primary);">${item.confidence}%</span>
      </td>
      <td>
        <span class="crop-status-pill crop-status-pill--${item.statusClass}">
          ${item.status}
        </span>
      </td>
    </tr>
  `).join('');
}
