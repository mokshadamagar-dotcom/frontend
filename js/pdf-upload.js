/* ============================================================
   KrishiMitra AI – pdf-upload.js
   PDF Document Drag-and-Drop & Processing State Controller
   ============================================================ */

'use strict';

// State management
let selectedPdfFile = null;

document.addEventListener('DOMContentLoaded', () => {
  initPdfUploadHandlers();
});

function initPdfUploadHandlers() {
  const dropZone    = document.getElementById('pdf-drop-zone');
  const fileInput   = document.getElementById('pdf-file-input');
  const placeholder = document.getElementById('pdf-upload-placeholder');
  const previewBox  = document.getElementById('pdf-preview-box');
  const filenameEl  = document.getElementById('pdf-filename');
  const filesizeEl  = document.getElementById('pdf-filesize');
  const removeBtn   = document.getElementById('pdf-remove-btn');
  const analyzeBtn  = document.getElementById('pdf-start-analysis-btn');

  if (!dropZone || !fileInput) return;

  // Open file browser on click
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
    if (files.length) handlePdfFile(files[0]);
  });

  // Handle selected files
  fileInput.addEventListener('change', function() {
    if (this.files.length) handlePdfFile(this.files[0]);
  });

  // Remove file preview
  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPdfState();
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handlePdfFile(file) {
    // Validate type (must be PDF or Image)
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    if (!isPdf && !isImage) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please upload a valid PDF or Image file.', 'error');
      }
      return;
    }

    // Validate size (must be under 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      if (typeof window.showToast === 'function') {
        window.showToast('File size must be less than 10 MB.', 'error');
      }
      return;
    }

    selectedPdfFile = file;

    // Display file meta details in UI
    if (filenameEl) filenameEl.textContent = file.name;
    if (filesizeEl) filesizeEl.textContent = formatBytes(file.size);

    // Swap layouts
    placeholder.style.display = 'none';
    previewBox.style.display = 'flex';

    // Update preview icon based on file type
    const previewIcon = document.getElementById('preview-file-icon');
    const previewWrap = previewIcon ? previewIcon.parentElement : null;
    if (previewIcon) {
      if (isImage) {
        previewIcon.className = 'fas fa-file-image';
        previewIcon.style.color = '#3b82f6';
        if (previewWrap) previewWrap.style.background = '#dbeafe';
      } else {
        previewIcon.className = 'fas fa-file-pdf';
        previewIcon.style.color = '#ef4444';
        if (previewWrap) previewWrap.style.background = '#fee2e2';
      }
    }

    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.focus();
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Soil report loaded. Click Analyze to start AI extraction.', 'success');
    }
  }

  function resetPdfState() {
    selectedPdfFile = null;
    fileInput.value = '';
    previewBox.style.display = 'none';
    placeholder.style.display = 'flex';
    if (analyzeBtn) analyzeBtn.disabled = true;

    // Reset results viewport if open
    const resultSec = document.getElementById('soil-result-section');
    if (resultSec) resultSec.style.display = 'none';
    const emptyState = document.getElementById('soil-empty-state');
    if (emptyState) emptyState.style.display = 'flex';
  }

  // Format file size helper
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
   FUTURE FASTAPI INTEGRATION & OCR PIPELINE (Preparation)
   ============================================================ */
async function uploadSoilReport(file) {
  if (!file) throw new Error('No PDF document loaded.');

  // TODO: Upload PDF to FastAPI endpoint.
  // TODO: Endpoint example: POST /api/v1/soil/upload
  // TODO: Extract PDF text (using PyPDF2, pdfplumber, or pdfminer)
  // TODO: Run OCR for scanned documents (using Tesseract or AWS Textract)
  // TODO: Detect soil parameters (Nitrogen, Phosphorus, Potassium, pH, Organic Carbon)
  // TODO: Store uploaded file metadata in MongoDB.

  // Simulate network file upload and parsing latency (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { status: "Uploaded", file_id: "report_12345" };
}
