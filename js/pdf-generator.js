/* ============================================================
   KrishiMitra AI – pdf-generator.js
   Professional PDF Export using jsPDF
   Generates branded PDF reports for all analysis modules.
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   COLOR PALETTE (RGB)
   ============================================================ */
const PDF_COLORS = {
  primary:    [34, 197, 94],    // green-500
  dark:       [15, 23, 42],     // slate-900
  heading:    [30, 41, 59],     // slate-800
  muted:      [100, 116, 139],  // slate-500
  light:      [248, 250, 252],  // slate-50
  border:     [226, 232, 240],  // slate-200
  white:      [255, 255, 255],
  success:    [22, 163, 74],    // green-600
  warning:    [217, 119, 6],    // amber-600
  danger:     [220, 38, 38],    // red-600
  blue:       [37, 99, 235],    // blue-600
};

/* ════════════════════════════════════════════════════════════
   HELPER: ensure jsPDF is loaded
   ============================================================ */
function ensureJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) { resolve(window.jspdf.jsPDF); return; }
    if (window.jsPDF)         { resolve(window.jsPDF); return; }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      resolve(window.jspdf?.jsPDF || window.jsPDF);
    };
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });
}

/* ════════════════════════════════════════════════════════════
   CORE: Add branded header to every PDF page
   ============================================================ */
function addPDFHeader(doc, title, subtitle = '') {
  const pageW = doc.internal.pageSize.getWidth();

  // Green header bar
  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(0, 0, pageW, 32, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...PDF_COLORS.white);
  doc.text('🌾 KrishiMitra AI', 14, 13);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Empowering Farmers with Artificial Intelligence', 14, 20);

  // Report date (right aligned)
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(dateStr, pageW - 14, 13, { align: 'right' });
  doc.text('Generated Report', pageW - 14, 20, { align: 'right' });

  // Title section
  doc.setFillColor(...PDF_COLORS.light);
  doc.rect(0, 32, pageW, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...PDF_COLORS.heading);
  doc.text(title, 14, 44);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_COLORS.muted);
    doc.text(subtitle, 14, 51);
  }

  return 62; // Y position after header
}

/* ════════════════════════════════════════════════════════════
   CORE: Add footer to every PDF page
   ============================================================ */
function addPDFFooter(doc, pageNum, totalPages) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(14, pageH - 14, pageW - 14, pageH - 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text('KrishiMitra AI – Intelligent Agriculture Advisor | For informational purposes only', 14, pageH - 8);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageW - 14, pageH - 8, { align: 'right' });
}

/* ════════════════════════════════════════════════════════════
   CORE: Info row pair (label: value)
   ============================================================ */
function addInfoRow(doc, label, value, y, pageW, bgAlt = false) {
  if (bgAlt) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 5, pageW - 28, 10, 'F');
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.muted);
  doc.text(label + ':', 16, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.heading);
  doc.text(String(value || '—'), 80, y);

  return y + 12;
}

/* ════════════════════════════════════════════════════════════
   CORE: Section heading
   ============================================================ */
function addSectionHeading(doc, text, y) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(14, y, 3, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PDF_COLORS.heading);
  doc.text(text, 20, y + 6);

  doc.setDrawColor(...PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(14, y + 10, pageW - 14, y + 10);

  return y + 18;
}

/* ════════════════════════════════════════════════════════════
   CORE: Recommendation box
   ============================================================ */
function addRecommendationBox(doc, lines, y, type = 'success') {
  const pageW = doc.internal.pageSize.getWidth();
  const color = type === 'success' ? PDF_COLORS.success
              : type === 'warning' ? PDF_COLORS.warning
              : PDF_COLORS.blue;

  const boxH = 8 + lines.length * 7;
  doc.setFillColor(color[0], color[1], color[2], 0.08);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, pageW - 28, boxH, 2, 2, 'FD');

  // Left accent
  doc.setFillColor(...color);
  doc.rect(14, y, 3, boxH, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.heading);

  lines.forEach((line, i) => {
    doc.text('• ' + line, 20, y + 8 + i * 7);
  });

  return y + boxH + 8;
}

/* ════════════════════════════════════════════════════════════
   MODULE 1: FERTILIZER PDF
   ============================================================ */
async function generateFertilizerPDF(data = {}) {
  const jsPDF = await ensureJsPDF();
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  let y = addPDFHeader(doc, 'Fertilizer Recommendation Report',
    `Crop: ${data.crop || 'Not specified'} | Season: ${data.season || 'Kharif'}`);

  // Farm Details
  y = addSectionHeading(doc, 'Farm & Crop Details', y);
  y = addInfoRow(doc, 'Crop Type',     data.crop || 'Cotton',     y, pageW, false);
  y = addInfoRow(doc, 'Soil Type',     data.soil || 'Black Soil', y, pageW, true);
  y = addInfoRow(doc, 'Growth Stage',  data.stage || 'Vegetative', y, pageW, false);
  y = addInfoRow(doc, 'Season',        data.season || 'Kharif',   y, pageW, true);
  y = addInfoRow(doc, 'State',         data.state || 'Maharashtra', y, pageW, false);
  y += 4;

  // NPK Values
  y = addSectionHeading(doc, 'Soil Nutrient Analysis', y);
  y = addInfoRow(doc, 'Nitrogen (N)',   data.nitrogen   || '180 kg/ha', y, pageW, false);
  y = addInfoRow(doc, 'Phosphorus (P)', data.phosphorus || '60 kg/ha',  y, pageW, true);
  y = addInfoRow(doc, 'Potassium (K)',  data.potassium  || '90 kg/ha',  y, pageW, false);
  y = addInfoRow(doc, 'Soil pH',        data.ph         || '6.8',       y, pageW, true);
  y += 4;

  // Recommendations
  y = addSectionHeading(doc, 'AI Fertilizer Recommendations', y);
  const recs = data.recommendations || [
    'Apply Urea (46% N) at 130 kg/ha at sowing stage',
    'Apply DAP (18-46-0) at 100 kg/ha as basal dose',
    'Apply MOP (60% K₂O) at 50 kg/ha at 30 days after sowing',
    'Apply micronutrient mixture (Zinc Sulphate 25%) at 25 kg/ha',
    'Apply second split dose of Urea at 30 DAS and 60 DAS',
  ];
  y = addRecommendationBox(doc, recs, y, 'success');

  // Disclaimer
  y = addSectionHeading(doc, 'Important Note', y);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.muted);
  const disclaimer = 'This recommendation is generated by AI based on provided data. Please consult your local agricultural officer before applying. Soil testing is recommended every 2–3 years.';
  const lines = doc.splitTextToSize(disclaimer, pageW - 28);
  doc.text(lines, 14, y);

  addPDFFooter(doc, 1, 1);
  doc.save('KrishiMitra_Fertilizer_Report.pdf');
  return true;
}

/* ════════════════════════════════════════════════════════════
   MODULE 2: IRRIGATION PDF
   ============================================================ */
async function generateIrrigationPDF(data = {}) {
  const jsPDF = await ensureJsPDF();
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  let y = addPDFHeader(doc, 'Smart Irrigation Advisory Report',
    `Crop: ${data.crop || 'Not specified'} | Method: ${data.method || 'Drip'}`);

  y = addSectionHeading(doc, 'Irrigation Parameters', y);
  y = addInfoRow(doc, 'Crop',            data.crop      || 'Cotton',    y, pageW, false);
  y = addInfoRow(doc, 'Soil Type',       data.soil      || 'Black',     y, pageW, true);
  y = addInfoRow(doc, 'Growth Stage',    data.stage     || 'Flowering', y, pageW, false);
  y = addInfoRow(doc, 'Method',          data.method    || 'Drip',      y, pageW, true);
  y = addInfoRow(doc, 'Area (Hectares)', data.area      || '2',         y, pageW, false);
  y = addInfoRow(doc, 'Rainfall (mm)',   data.rainfall  || '450',       y, pageW, true);
  y += 4;

  y = addSectionHeading(doc, 'AI Irrigation Schedule', y);
  const schedule = data.schedule || [
    'Water Requirement: 6.5 mm/day during flowering stage',
    'Irrigation Frequency: Every 3 days under current conditions',
    'Total water needed: 52 mm over next 8 days',
    'Best time to irrigate: Early morning (5:00–7:00 AM)',
    'Skip irrigation if rainfall exceeds 10 mm in 24 hours',
  ];
  y = addRecommendationBox(doc, schedule, y, 'success');

  y = addSectionHeading(doc, 'Water Conservation Tips', y);
  const tips = data.tips || [
    'Use mulching to reduce soil evaporation by 30–40%',
    'Install moisture sensors for precision irrigation',
    'Check for leaks in irrigation lines weekly',
  ];
  y = addRecommendationBox(doc, tips, y, 'warning');

  addPDFFooter(doc, 1, 1);
  doc.save('KrishiMitra_Irrigation_Report.pdf');
  return true;
}

/* ════════════════════════════════════════════════════════════
   MODULE 3: PEST DETECTION PDF
   ============================================================ */
async function generatePestPDF(data = {}) {
  const jsPDF = await ensureJsPDF();
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  let y = addPDFHeader(doc, 'Pest Radar – Detection Report',
    `Pest: ${data.pest || 'Not identified'} | Severity: ${data.severity || 'Moderate'}`);

  y = addSectionHeading(doc, 'Detection Results', y);
  y = addInfoRow(doc, 'Detected Pest',   data.pest       || 'Aphids (Aphis gossypii)',   y, pageW, false);
  y = addInfoRow(doc, 'Affected Crop',   data.crop       || 'Cotton',                   y, pageW, true);
  y = addInfoRow(doc, 'Severity',        data.severity   || 'Moderate (42% affected)',  y, pageW, false);
  y = addInfoRow(doc, 'Confidence',      data.confidence || '87%',                       y, pageW, true);
  y = addInfoRow(doc, 'Analysis Date',   new Date().toLocaleDateString('en-IN'),          y, pageW, false);
  y += 4;

  y = addSectionHeading(doc, 'Pest Description', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PDF_COLORS.heading);
  const desc = data.description || 'Aphids are small sap-sucking insects that cluster on new growth, stems, and undersides of leaves. They excrete honeydew which promotes sooty mold growth.';
  const descLines = doc.splitTextToSize(desc, pageW - 28);
  doc.text(descLines, 14, y);
  y += descLines.length * 5 + 8;

  y = addSectionHeading(doc, 'Recommended Control Measures', y);
  const controls = data.controls || [
    'Apply Imidacloprid 17.8% SL @ 0.5 ml/L water (systemic insecticide)',
    'Spray Neem oil (5000 ppm) @ 3 ml/L water as organic alternative',
    'Deploy yellow sticky traps @ 10 traps/hectare',
    'Introduce natural predators: Ladybirds, Lacewings',
    'Remove heavily infested plant parts and destroy',
  ];
  y = addRecommendationBox(doc, controls, y, 'success');

  y = addSectionHeading(doc, 'Preventive Measures', y);
  const preventive = data.preventive || [
    'Inspect crops weekly for early pest detection',
    'Avoid excessive nitrogen fertilization (promotes succulent growth)',
    'Maintain field hygiene – remove crop debris after harvest',
  ];
  y = addRecommendationBox(doc, preventive, y, 'warning');

  addPDFFooter(doc, 1, 1);
  doc.save('KrishiMitra_PestRadar_Report.pdf');
  return true;
}

/* ════════════════════════════════════════════════════════════
   MODULE 4: CROP DISEASE PDF
   ============================================================ */
async function generateDiseasePDF(data = {}) {
  const jsPDF = await ensureJsPDF();
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  let y = addPDFHeader(doc, 'Crop Disease Detection Report',
    `Disease: ${data.disease || 'Not identified'} | Crop: ${data.crop || 'Unknown'}`);

  y = addSectionHeading(doc, 'Disease Detection Results', y);
  y = addInfoRow(doc, 'Detected Disease', data.disease    || 'Leaf Spot (Alternaria)',  y, pageW, false);
  y = addInfoRow(doc, 'Affected Crop',    data.crop       || 'Cotton',                  y, pageW, true);
  y = addInfoRow(doc, 'Severity Level',   data.severity   || 'Moderate',                y, pageW, false);
  y = addInfoRow(doc, 'Confidence',       data.confidence || '92%',                     y, pageW, true);
  y = addInfoRow(doc, 'Analysis Date',    new Date().toLocaleDateString('en-IN'),         y, pageW, false);
  y += 4;

  y = addSectionHeading(doc, 'Treatment Recommendations', y);
  const treatments = data.treatments || [
    'Apply Mancozeb 75% WP @ 2.5 g/L water as foliar spray',
    'Apply Copper Oxychloride @ 3 g/L water (contact fungicide)',
    'Remove and destroy infected leaves immediately',
    'Avoid overhead irrigation; use drip irrigation',
    'Maintain proper plant spacing for air circulation',
  ];
  y = addRecommendationBox(doc, treatments, y, 'success');

  addPDFFooter(doc, 1, 1);
  doc.save('KrishiMitra_Disease_Report.pdf');
  return true;
}

/* ════════════════════════════════════════════════════════════
   MODULE 5: CROP ADVISORY PDF
   ============================================================ */
async function generateAdvisoryPDF(data = {}) {
  const jsPDF = await ensureJsPDF();
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  let y = addPDFHeader(doc, 'AI Crop Advisory Report',
    `Crop: ${data.crop || 'Not specified'} | Stage: ${data.stage || 'Vegetative'}`);

  y = addSectionHeading(doc, 'Crop Details', y);
  y = addInfoRow(doc, 'Crop',         data.crop   || 'Cotton',     y, pageW, false);
  y = addInfoRow(doc, 'Stage',        data.stage  || 'Vegetative', y, pageW, true);
  y = addInfoRow(doc, 'Location',     data.location || 'Maharashtra', y, pageW, false);
  y = addInfoRow(doc, 'Season',       data.season || 'Kharif',     y, pageW, true);
  y += 4;

  y = addSectionHeading(doc, "Today's Priority Actions", y);
  const actions = data.actions || [
    'Apply first split dose of Nitrogen fertilizer',
    'Check for early signs of pest infestation on new growth',
    'Monitor soil moisture – maintain at 60–70% field capacity',
    'Apply pre-emergence herbicide if weed pressure is observed',
  ];
  y = addRecommendationBox(doc, actions, y, 'success');

  y = addSectionHeading(doc, '7-Day Action Plan', y);
  const plan = data.weekPlan || [
    'Day 1–2: Fertilizer application (Urea top dressing)',
    'Day 3: Pest scouting and sticky trap inspection',
    'Day 4: Irrigation check and scheduling',
    'Day 5–6: Foliar spray if disease/pest detected',
    'Day 7: Crop health assessment and photo documentation',
  ];
  y = addRecommendationBox(doc, plan, y, 'warning');

  addPDFFooter(doc, 1, 1);
  doc.save('KrishiMitra_CropAdvisory_Report.pdf');
  return true;
}

/* ════════════════════════════════════════════════════════════
   MODULE 6: SOIL ANALYSIS PDF
   ============================================================ */
async function generateSoilPDF(data = {}) {
  const jsPDF = await ensureJsPDF();
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  let y = addPDFHeader(doc, 'Soil Health Analysis Report',
    `Soil Type: ${data.soilType || 'Black Cotton Soil'} | pH: ${data.ph || '6.8'}`);

  y = addSectionHeading(doc, 'Soil Test Results', y);
  y = addInfoRow(doc, 'Soil Type',       data.soilType || 'Black Cotton Soil', y, pageW, false);
  y = addInfoRow(doc, 'pH Level',        data.ph || '6.8',        y, pageW, true);
  y = addInfoRow(doc, 'Nitrogen (N)',    data.n  || '240 kg/ha',  y, pageW, false);
  y = addInfoRow(doc, 'Phosphorus (P)',  data.p  || '18 kg/ha',   y, pageW, true);
  y = addInfoRow(doc, 'Potassium (K)',   data.k  || '145 kg/ha',  y, pageW, false);
  y = addInfoRow(doc, 'Organic Carbon',  data.oc || '0.68%',      y, pageW, true);
  y = addInfoRow(doc, 'EC (dS/m)',       data.ec || '0.42',       y, pageW, false);
  y += 4;

  y = addSectionHeading(doc, 'Soil Health Assessment', y);
  const assessment = data.assessment || [
    'Nitrogen Status: MEDIUM – Apply 50 kg/ha additional N',
    'Phosphorus Status: LOW – Apply 40 kg/ha DAP',
    'Potassium Status: HIGH – No additional K needed',
    'Organic Carbon: LOW – Add 5 tons/ha FYM or vermicompost',
    'pH is optimal (6.5–7.0) for most crops',
  ];
  y = addRecommendationBox(doc, assessment, y, 'success');

  y = addSectionHeading(doc, 'Improvement Recommendations', y);
  const improvements = data.improvements || [
    'Apply well-decomposed farmyard manure (5 t/ha) before sowing',
    'Grow green manure crops (Dhaincha/Sesbania) in fallow period',
    'Reduce tillage to preserve soil structure and organic matter',
    'Practice crop rotation with legumes (soybean/chickpea)',
    'Re-test soil after 2 years for accurate monitoring',
  ];
  y = addRecommendationBox(doc, improvements, y, 'warning');

  addPDFFooter(doc, 1, 1);
  doc.save('KrishiMitra_SoilAnalysis_Report.pdf');
  return true;
}

/* ════════════════════════════════════════════════════════════
   UNIVERSAL TRIGGER: call from any page
   ============================================================ */
async function downloadKrishiMitraPDF(module, data = {}) {
  // Show loading state on the button that triggered this
  const btn = document.activeElement;
  const originalText = btn?.innerHTML;
  if (btn && btn.tagName === 'BUTTON') {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF…';
  }

  try {
    const generators = {
      fertilizer: generateFertilizerPDF,
      irrigation:  generateIrrigationPDF,
      pest:        generatePestPDF,
      disease:     generateDiseasePDF,
      advisory:    generateAdvisoryPDF,
      soil:        generateSoilPDF,
    };

    const fn = generators[module];
    if (!fn) throw new Error(`Unknown module: ${module}`);

    await fn(data);

    // Toast success
    if (window.KM_Lang) {
      showPDFToast('PDF downloaded successfully! Check your Downloads folder.', 'success');
    }
  } catch (err) {
    console.error('PDF generation error:', err);
    showPDFToast('PDF generation failed. Please try again.', 'error');
  } finally {
    if (btn && originalText) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}

function showPDFToast(msg, type = 'success') {
  let container = document.getElementById('pdf-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pdf-toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#22c55e' : '#ef4444';
  toast.style.cssText = `background:${bg};color:white;padding:12px 18px;border-radius:10px;font-size:14px;font-family:Inter,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;gap:10px;max-width:320px;`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* Export globally */
window.KM_PDF = {
  downloadKrishiMitraPDF,
  generateFertilizerPDF,
  generateIrrigationPDF,
  generatePestPDF,
  generateDiseasePDF,
  generateAdvisoryPDF,
  generateSoilPDF,
};
