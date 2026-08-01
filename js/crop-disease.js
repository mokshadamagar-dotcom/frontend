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

const CROP_DISEASE_DATABASE = {
  cotton: {
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
      "If infection spreads rapidly, apply an approved systemic fungicide (e.g., Mancozeb or Copper Oxychloride) as per local agricultural recommendations."
    ],
    prevention: [
      "Ensure clean field hygiene before sowing.",
      "Avoid excessive moisture and overhead sprinkler irrigation.",
      "Monitor crops regularly (at least twice a week) during high-humidity seasons.",
      "Use certified disease-resistant crop seeds.",
      "Ensure proper plant spacing for efficient solar penetration and ventilation."
    ]
  },
  tomato: {
    crop: "Tomato",
    disease: "Tomato Early Blight",
    confidence: 89,
    severity: "High",
    status: "Needs Attention",
    symptoms: [
      "Dark, concentric rings (target-like spots) on older leaves.",
      "Yellowing of leaf tissue surrounding the spots, leading to leaf drop.",
      "Dark, sunken lesions on the stem near the soil line.",
      "Leathery black spots near the stem end of fruits."
    ],
    causes: [
      "Fungal pathogen (Alternaria solani).",
      "Warm temperatures (24°C to 29°C) combined with wet weather.",
      "Spore transmission via splashing rain or overhead watering.",
      "Overcrowding leading to poor ventilation."
    ],
    treatment: [
      "Prune and destroy infected lower leaves to reduce spore splash.",
      "Apply organic copper fungicides or chlorothalonil immediately.",
      "Apply mulch around the plant base to prevent soil splash.",
      "Avoid overhead watering; irrigate directly at the root zone."
    ],
    prevention: [
      "Practice 3-year crop rotation (avoid planting solanaceous crops like potatoes or peppers).",
      "Use disease-resistant tomato varieties.",
      "Provide proper plant staking and spacing for airflow."
    ]
  },
  wheat: {
    crop: "Wheat",
    disease: "Wheat Leaf Rust",
    confidence: 88,
    severity: "High",
    status: "Needs Attention",
    symptoms: [
      "Small, oval, orange-brown pustules on the upper leaf surface.",
      "Yellowing and premature drying of affected leaves.",
      "Powdery rust-colored dust rubs off on fingers.",
      "Stunted crop growth and reduced grain filling."
    ],
    causes: [
      "Fungal pathogen (Puccinia triticina).",
      "Mild, humid days (15°C to 22°C) with long dew periods.",
      "Wind-blown spores traveling from infected regions.",
      "Susceptible crop varieties and excessive nitrogen fertilization."
    ],
    treatment: [
      "Apply recommended triazole or strobilurin-based fungicides.",
      "Avoid late-season overhead irrigation.",
      "Remove self-sown wild wheat plants that host the rust spores."
    ],
    prevention: [
      "Sow rust-resistant wheat varieties (highly recommended).",
      "Adhere to the recommended early sowing window.",
      "Balanced nitrogen application to prevent lush, vulnerable foliage."
    ]
  },
  rice: {
    crop: "Rice",
    disease: "Rice Blast",
    confidence: 91,
    severity: "Severe",
    status: "Needs Attention",
    symptoms: [
      "Spindle-shaped (diamond-shaped) lesions on leaf blades with gray centers.",
      "Brown or black lesions on the panicle neck (neck rot).",
      "Panicles turn white and fail to produce grains.",
      "Lesions on nodes causing the stem to break easily."
    ],
    causes: [
      "Fungal pathogen (Magnaporthe oryzae).",
      "High relative humidity (>90%) and leaf wetness.",
      "Cool daytime temperatures with warm nights.",
      "Excessive nitrogen fertilizers and dense seedling planting."
    ],
    treatment: [
      "Spray systemic fungicides like Tricyclazole or Isoprothiolane.",
      "Avoid draining the field completely; maintain shallow water depth.",
      "Avoid further nitrogen top-dressings until infection is controlled."
    ],
    prevention: [
      "Grow blast-resistant cultivars.",
      "Ensure proper seed treatment before sowing.",
      "Maintain balanced NPK fertilizer ratios (avoid excess nitrogen)."
    ]
  },
  onion: {
    crop: "Onion",
    disease: "Onion Purple Blotch",
    confidence: 85,
    severity: "Moderate",
    status: "Needs Attention",
    symptoms: [
      "Small, water-soaked lesions on leaves that turn purple to brown.",
      "Zonated concentric rings within the lesions.",
      "Leaf tips dry up, turn yellow, and fall over.",
      "Infection spreading down to the bulb, causing rot."
    ],
    causes: [
      "Fungal pathogen (Alternaria porri).",
      "Warm, wet weather (25°C to 30°C) with frequent rains.",
      "Presence of thrips, which create feeding wounds for fungi.",
      "Poor soil drainage and stagnant water in fields."
    ],
    treatment: [
      "Apply fungicides such as Mancozeb or Tebuconazole.",
      "Control thrips infestation using systemic insecticides.",
      "Ensure quick drainage of excess water from the fields."
    ],
    prevention: [
      "Practice 2-3 year crop rotation with non-host crops.",
      "Ensure proper spacing and plant on raised beds.",
      "Use healthy, disease-free seedlings for transplanting."
    ]
  },
  soybean: {
    crop: "Soybean",
    disease: "Soybean Rust",
    confidence: 90,
    severity: "High",
    status: "Needs Attention",
    symptoms: [
      "Tiny, tan-colored spots or pustules on the undersides of leaves.",
      "Chlorosis (yellowing) starting from the lower canopy.",
      "Premature defoliation (leaf drop) of affected plants.",
      "Fewer pods and smaller, shriveled soybean seeds."
    ],
    causes: [
      "Fungal pathogen (Phakopsora pachyrhizi).",
      "Prolonged leaf wetness (6-12 hours) and high humidity.",
      "Temperatures ranging from 15°C to 28°C.",
      "Dense plant canopy blocking sunlight and wind."
    ],
    treatment: [
      "Apply preventive or curative triazole/strobilurin fungicides.",
      "Monitor the lower crop canopy regularly during flowering.",
      "Avoid field operations when leaves are wet to prevent spread."
    ],
    prevention: [
      "Plant early-maturing soybean varieties.",
      "Ensure wider row spacing to improve canopy ventilation.",
      "Keep fields clean of volunteer soybean plants and weeds."
    ]
  },
  sugarcane: {
    crop: "Sugarcane",
    disease: "Sugarcane Red Rot",
    confidence: 93,
    severity: "Severe",
    status: "Needs Attention",
    symptoms: [
      "Third or fourth leaf starts yellowing and drying from the margins.",
      "Stalks show internal reddening with white horizontal patches when split.",
      "Distinct alcoholic smell from damaged, rotting stalks.",
      "Stalks shrink, become hollow, and easily break."
    ],
    causes: [
      "Fungal pathogen (Colletotrichum falcatum).",
      "Use of infected sugarcane seed setts.",
      "Waterlogging and poorly drained heavy clay soils.",
      "High temperatures (28°C to 32°C) with water stagnation."
    ],
    treatment: [
      "Immediately uproot and burn infected clumps (rogueing).",
      "Avoid water flow from infected fields to healthy ones.",
      "Harvest the affected crop early to minimize sucrose loss."
    ],
    prevention: [
      "Use healthy, certified seed setts treated with hot water.",
      "Grow resistant sugarcane varieties (e.g., Co 86032).",
      "Ensure crop rotation with paddy or green manure crops."
    ]
  },
  other: {
    crop: "Other Crop",
    disease: "Fungal Leaf Spot",
    confidence: 87,
    severity: "Moderate",
    status: "Needs Attention",
    symptoms: [
      "Circular brown spots on leaves with yellow halos.",
      "Spots merging to form larger irregular dead areas.",
      "Slight wilting of the leaf margins."
    ],
    causes: [
      "General fungal pathogens (Cercospora / Alternaria spp.).",
      "Excessive watering or moisture on plant leaves.",
      "Lack of proper sunlight penetration."
    ],
    treatment: [
      "Remove and dispose of infected leaves.",
      "Avoid watering leaves directly; water the base of the plant.",
      "Apply a multi-purpose neem oil spray or general organic fungicide."
    ],
    prevention: [
      "Keep the plant surroundings free of weeds.",
      "Maintain adequate distance between plants.",
      "Provide appropriate balanced organic compost."
    ]
  }
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

  // Simulate network processing delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get selected crop type if user specified it
  const cropSelect = document.getElementById('crop-type-select');
  const selectedCrop = cropSelect ? cropSelect.value : '';

  const fileName = imageFile.name.toLowerCase();

  // Heuristic: Check if the filename contains non-crop terms
  const unrelatedKeywords = [
    'car', 'dog', 'cat', 'person', 'people', 'human', 'building', 'office', 'room', 
    'laptop', 'phone', 'bike', 'motorcycle', 'shirt', 'pants', 'shoe', 'face', 'food', 
    'drink', 'document', 'pdf', 'txt', 'receipt', 'selfie', 'screenshot', 'logo', 'icon', 
    'profile', 'avatar', 'selphy', 'user', 'girl', 'boy', 'man', 'woman'
  ];
  
  // Crop keywords to override general photo/picture checks
  const cropKeywords = [
    'crop', 'leaf', 'plant', 'cotton', 'tomato', 'wheat', 'rice', 'onion', 'soybean', 
    'sugarcane', 'chilli', 'maize', 'groundnut', 'diseased', 'spot', 'rust', 'pest', 
    'farm', 'field', 'green', 'pot', 'garden', 'nature', 'flower', 'tree', 'branch', 
    'stem', 'agriculture', 'vegetable', 'fruit'
  ];

  // If the filename matches unrelated terms (like face, selfie) and DOES NOT explicitly contain any crop keyword, reject it.
  const hasUnrelatedKeyword = unrelatedKeywords.some(kw => fileName.includes(kw));
  const hasCropKeyword = cropKeywords.some(kw => fileName.includes(kw));

  let isCrop = true;

  if (hasUnrelatedKeyword && !hasCropKeyword) {
    isCrop = false;
  } else if (!selectedCrop) {
    // If no crop type is explicitly selected, check if filename looks like a crop or a general camera photo/download
    const generalPrefixes = [
      'img', 'dsc', 'wp_', 'image', 'photo', 'camera', 'capture', 'upload', 
      'chatgpt', 'whatsapp', 'wa', 'fb', 'instagram', 'picture', 'download'
    ];
    const hasGeneralPrefix = generalPrefixes.some(pref => fileName.startsWith(pref) || fileName.includes(pref));
    
    if (!hasCropKeyword && !hasGeneralPrefix) {
      isCrop = false;
    }
  }

  if (!isCrop) {
    return {
      not_crop: true
    };
  }

  // Determine crop key
  let cropKey = selectedCrop;
  if (!cropKey) {
    // Try to infer crop from filename
    if (fileName.includes('cotton')) cropKey = 'cotton';
    else if (fileName.includes('tomato')) cropKey = 'tomato';
    else if (fileName.includes('wheat')) cropKey = 'wheat';
    else if (fileName.includes('rice')) cropKey = 'rice';
    else if (fileName.includes('onion')) cropKey = 'onion';
    else if (fileName.includes('soybean')) cropKey = 'soybean';
    else if (fileName.includes('sugarcane')) cropKey = 'sugarcane';
    else cropKey = 'cotton'; // Fallback crop default
  }

  const resultData = CROP_DISEASE_DATABASE[cropKey] || CROP_DISEASE_DATABASE['other'];

  // Return formatted response structure
  return {
    ...resultData,
    crop: selectedCrop ? cropSelect.options[cropSelect.selectedIndex].text : resultData.crop
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

  const diseaseCard = document.getElementById('disease-result-card');
  const noCropCard = document.getElementById('no-crop-detected-card');

  if (data.not_crop) {
    if (diseaseCard) diseaseCard.style.display = 'none';
    if (noCropCard) {
      noCropCard.style.display = 'flex';
      
      // Localized text setup
      const lang = localStorage.getItem('km_language') || 'en';
      const titleEl = document.getElementById('no-crop-title');
      const msgEl = document.getElementById('no-crop-message');
      const retryEl = document.getElementById('btn-no-crop-retry');
      
      if (lang === 'mr') {
        if (titleEl) titleEl.textContent = 'कोणतेही पीक आढळले नाही';
        if (msgEl) msgEl.textContent = 'अपलोड केलेला फोटो पीक किंवा झाडाचे पान असल्यासारखे दिसत नाही. कृपया पीक पानाचा स्पष्ट फोटो अपलोड करा.';
        if (retryEl) retryEl.innerHTML = '<i class="fas fa-redo-alt"></i> दुसरा फोटो निवडा';
      } else if (lang === 'hi') {
        if (titleEl) titleEl.textContent = 'कोई फसल नहीं मिली';
        if (msgEl) msgEl.textContent = 'अपलोड की गई तस्वीर फसल या पौधे की पत्ती जैसी नहीं दिखती है। कृपया फसल की पत्ती की एक स्पष्ट तस्वीर अपलोड करें।';
        if (retryEl) retryEl.innerHTML = '<i class="fas fa-redo-alt"></i> दूसरा फोटो चुनें';
      } else {
        if (titleEl) titleEl.textContent = 'No Crop Detected';
        if (msgEl) msgEl.textContent = 'The uploaded image does not appear to be a crop or plant leaf. Please upload a clear picture of a crop leaf.';
        if (retryEl) retryEl.innerHTML = '<i class="fas fa-redo-alt"></i> Try Another Image';
      }

      // Hook retry button
      const retryBtn = document.getElementById('btn-no-crop-retry');
      if (retryBtn) {
        retryBtn.onclick = () => {
          document.getElementById('btn-analyze-another')?.click();
        };
      }
    }
  } else {
    if (diseaseCard) diseaseCard.style.display = 'flex';
    if (noCropCard) noCropCard.style.display = 'none';

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
