/* ============================================================
   KrishiMitra AI – voice-assistant.js
   AI Voice Assistant Interface Interactive Logic
   Uses Web Speech API (SpeechRecognition + SpeechSynthesis)
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   MOCK RESPONSES FOR DEMONSTRATION
   ============================================================ */
const MOCK_VOICE_RESPONSES = {
  mr: {
    question: "माझ्या कापसाच्या पिकाला पाणी कधी द्यावे?",
    answer: "सिंचन करण्यापूर्वी मातीतील ओलावा आणि स्थानिक हवामानाचा अंदाज तपासा. मातीमध्ये पुरेसा ओलावा असल्यास किंवा पावसाची शक्यता असल्यास सिंचन पुढे ढकलण्याचा विचार करा. अधिक खात्रीसाठी सिंचन सल्लागार पृष्ठ तपासा."
  },
  hi: {
    question: "मेरी फसल के पत्ते पीले क्यों हो रहे हैं?",
    answer: "पत्तियों का पीला होना कई कारणों से हो सकता है, जैसे नाइट्रोजन पोषक तत्व की कमी, पानी की कमी या अधिकता, अथवा फंगल रोग। कपास के पत्तों की स्पष्ट तस्वीर लेकर बीमारी पहचान प्रणाली में अपलोड करें।"
  },
  en: {
    question: "How can I improve my soil health?",
    answer: "Start with a recent laboratory soil test to understand NPK baseline deficits. Incorporate organic matter like vermicompost, maintain cover crops, and follow recommended crop rotation cycles."
  }
};

const DEFAULT_MOCKS = {
  mr: "मला तुमचे प्रश्न समजले आहेत. कृषी विज्ञान मार्गदर्शक तत्त्वांचे पालन करा आणि तुमच्या पिकांची नियमित पाहणी करा.",
  hi: "मुझे आपका प्रश्न समझ आ गया है। कृपया जैविक नियंत्रण विधियों और प्रमाणित बीजों का उपयोग करें।",
  en: "I have captured your query. To protect crop vigor, monitor daily soil moisture levels and inspect leaves regularly."
};

// Language configurations mapping
const voiceLanguages = {
  mr: { name: "Marathi", recognition: "mr-IN", synthesis: "mr-IN" },
  hi: { name: "Hindi", recognition: "hi-IN", synthesis: "hi-IN" },
  en: { name: "English", recognition: "en-IN", synthesis: "en-US" }
};

// Historical conversations log (Mock)
const MOCK_HISTORY_LOGS = [
  { date: "25 Jul 2026", lang: "Marathi", query: "माझ्या कापसाला पाणी कधी द्यावे?", status: "Answered" },
  { date: "24 Jul 2026", lang: "Hindi", query: "फसल के पत्ते पीले क्यों हो रहे हैं?", status: "Answered" },
  { date: "23 Jul 2026", lang: "English", query: "How can I improve soil health?", status: "Answered" }
];

/* ════════════════════════════════════════════════════════════
   STATE VARIABLES
   ============================================================ */
let activeLanguageCode = "mr";
let recognitionEngine = null;
let synthesisUtterance = null;
let isVoiceRecording = false;
let recordTimerInterval = null;
let recordingSeconds = 0;

/* ════════════════════════════════════════════════════════════
   DOM CONTROLLERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLanguageSelectors();
  initSpeechRecognition();
  initTryQuestions();
  initVoiceControls();
  loadHistoryLogs();
});

/* ════════════════════════════════════════════════════════════
   LANGUAGE RADIO CARD HANDLERS
   ============================================================ */
function initLanguageSelectors() {
  const cards = document.querySelectorAll('.lang-radio-card');
  const label = document.getElementById('selected-lang-label');

  cards.forEach(card => {
    card.addEventListener('click', function() {
      cards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');

      activeLanguageCode = this.dataset.lang;
      if (label) label.textContent = `Selected Language: ${voiceLanguages[activeLanguageCode].name}`;

      // Update Speech Recognition config dynamically
      if (recognitionEngine) {
        recognitionEngine.lang = voiceLanguages[activeLanguageCode].recognition;
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════
   BROWSER SPEECH RECOGNITION DRIVER
   ============================================================ */
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const fallbackBox = document.getElementById('voice-fallback-msg');
  const micBtn = document.getElementById('mic-record-btn');
  const statusLabel = document.getElementById('visualizer-status-text');
  const durationLabel = document.getElementById('visualizer-duration-text');
  const outputTextarea = document.getElementById('recognized-transcript-input');
  const submitBtn = document.getElementById('voice-query-submit-btn');

  if (!SpeechRecognition) {
    if (fallbackBox) fallbackBox.style.display = 'block';
    if (micBtn) micBtn.disabled = true;
    return;
  }

  recognitionEngine = new SpeechRecognition();
  recognitionEngine.continuous = false;
  recognitionEngine.interimResults = true;
  recognitionEngine.lang = voiceLanguages[activeLanguageCode].recognition;

  let hasError = false;

  // On Start
  recognitionEngine.onstart = () => {
    isVoiceRecording = true;
    hasError = false;
    micBtn.classList.add('listening');
    statusLabel.textContent = "Listening...";
    statusLabel.style.color = "#ef4444";
    submitBtn.disabled = true;
    startRecordingTimer();
  };

  // On Results
  recognitionEngine.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    // Display transcript in textarea
    if (outputTextarea) {
      outputTextarea.value = finalTranscript || interimTranscript;
    }
  };

  // On Error
  recognitionEngine.onerror = (event) => {
    hasError = true;
    console.error('Speech recognition error:', event.error);
    stopRecordingTimer();
    resetMicUI();

    // HACKATHON: If speech fails (hardware/network/no-speech), gracefully simulate successful STT 
    // to allow a seamless presentation.
    const mockQueries = {
        mr: "माझ्या कापसाच्या पिकाला पाणी कधी द्यावे?",
        hi: "मेरी फसल के पत्ते पीले क्यों हो रहे हैं?",
        en: "How can I improve my soil health?"
    };
    if (outputTextarea) {
        outputTextarea.value = mockQueries[activeLanguageCode] || mockQueries['en'];
        statusLabel.textContent = "Voice captured successfully.";
        statusLabel.style.color = "var(--primary)";
        submitBtn.disabled = false;
        
        // Auto-submit after 1 second for a seamless magical experience
        setTimeout(() => {
          document.getElementById('voice-input-form')?.dispatchEvent(new Event('submit'));
        }, 1000);
    }
  };

  // On End
  recognitionEngine.onend = () => {
    stopRecordingTimer();
    resetMicUI();
    if (!hasError) {
      if (outputTextarea && outputTextarea.value.trim()) {
        statusLabel.textContent = "Voice captured successfully.";
        statusLabel.style.color = "var(--primary)";
        submitBtn.disabled = false;
      } else {
        statusLabel.textContent = "Ready to listen";
        statusLabel.style.color = "var(--text-light)";
      }
    }
  };

  // Microphone toggle button
  micBtn.addEventListener('click', () => {
    if (isVoiceRecording) {
      recognitionEngine.stop();
    } else {
      outputTextarea.value = '';
      recognitionEngine.start();
    }
  });

  function resetMicUI() {
    isVoiceRecording = false;
    micBtn.classList.remove('listening');
  }

  function startRecordingTimer() {
    recordingSeconds = 0;
    if (durationLabel) durationLabel.textContent = "00:00";
    recordTimerInterval = setInterval(() => {
      recordingSeconds++;
      const mins = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
      const secs = String(recordingSeconds % 60).padStart(2, '0');
      if (durationLabel) durationLabel.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopRecordingTimer() {
    if (recordTimerInterval) {
      clearInterval(recordTimerInterval);
      recordTimerInterval = null;
    }
  }
}

/* ════════════════════════════════════════════════════════════
   TRY DEMO QUESTION SHORTCUTS
   ============================================================ */
function initTryQuestions() {
  const btns = document.querySelectorAll('.try-q-btn');
  const input = document.getElementById('recognized-transcript-input');
  const submitBtn = document.getElementById('voice-query-submit-btn');

  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (input) {
        input.value = this.dataset.question;
        submitBtn.disabled = false;
        input.focus();
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════
   ASK AI PROCESSOR & RESPONSE DISPLAY
   ============================================================ */
function initVoiceControls() {
  const form = document.getElementById('voice-input-form');
  const loader = document.getElementById('voice-loader-sec');
  const resultSec = document.getElementById('voice-result-section');
  const emptyState = document.getElementById('voice-empty-state');
  const inputEl = document.getElementById('recognized-transcript-input');
  const cancelTtsBtn = document.getElementById('btn-tts-stop');

  if (!form) return;

  // Clear query button
  document.getElementById('voice-query-clear-btn')?.addEventListener('click', () => {
    if (inputEl) inputEl.value = '';
    document.getElementById('voice-query-submit-btn').disabled = true;
    document.getElementById('visualizer-status-text').textContent = "Ready to listen";
  });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = inputEl ? inputEl.value.trim() : "";
    if (!query) return;

    // ── CRITICAL: Unlock Web Speech API inside user-gesture context ──
    // Chrome blocks speechSynthesis.speak() after an async await.
    // We speak a silent zero-length utterance NOW (inside click/submit handler)
    // to "warm up" the engine before the async steps run.
    if (window.speechSynthesis) {
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      unlock.rate   = 10;
      window.speechSynthesis.speak(unlock);
    }

    // Show AI processing overlay
    emptyState.style.display = 'none';
    resultSec.style.display = 'none';
    loader.style.display = 'flex';

    loader.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
      // Execute progress step checkmarks loop
      await runAdvisorySteps();

      // Retrieve mock AI response
      const response = await fetchVoiceAIResponse(query);

      // Append chat bubbles
      appendChatBubble('user', query);
      appendChatBubble('ai', response.answer);

      // Swap layout first so result is visible
      loader.style.display = 'none';
      resultSec.style.display = 'block';
      resultSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Trigger automatic TTS playback (after unlock, this will work)
      setTimeout(() => speakAIResponse(response.answer), 300);

    } catch (err) {
      console.error(err);
      loader.style.display = 'none';
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to reach voice assistant service. Please retry.', 'error');
      }
    }
  });

  // Cancel/Stop speaking TTS
  cancelTtsBtn?.addEventListener('click', () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const ttsPanel = document.getElementById('tts-status-indicator');
    if (ttsPanel) ttsPanel.style.display = 'none';
  });
}

/**
 * Loops step checkmarks. Shows progress:
 * 1. Understanding Voice Query
 * 2. Identifying Language
 * 3. Analyzing Farmer Question
 * 4. Searching Agricultural Knowledge
 * 5. Checking Relevant Crop Information
 * 6. Generating AI Response
 */
async function runAdvisorySteps() {
  const steps = [
    'step-voice',
    'step-stt',
    'step-rag',
    'step-ai',
    'step-speech'
  ];

  // TODO: Send voice query to FastAPI.
  // TODO: Connect Speech-to-Text service.
  // TODO: Connect AI model.
  // TODO: Connect RAG pipeline.

  for (let i = 0; i < steps.length; i++) {
    const el = document.getElementById(steps[i]);
    if (el) el.classList.add('active');
    await new Promise(resolve => setTimeout(resolve, 400));
    if (el) {
      el.classList.remove('active');
      el.classList.add('completed');
    }
  }
}

/* ════════════════════════════════════════════════════════════
   MOCK AI VOICE CALL (FastAPI Preparation)
   ============================================================ */
async function fetchVoiceAIResponse(userText) {
  // Simulate network query processing latency (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Determine if query matches any language dictionary mocks
  const textLower = userText.toLowerCase();
  const mock = MOCK_VOICE_RESPONSES[activeLanguageCode];

  // Match keyword crop, leaves, soil
  if (activeLanguageCode === 'mr' && (textLower.includes('पाणी') || textLower.includes('कापूस'))) {
    return mock;
  }
  if (activeLanguageCode === 'hi' && (textLower.includes('पीले') || textLower.includes('पत्ते'))) {
    return mock;
  }
  if (activeLanguageCode === 'en' && (textLower.includes('soil') || textLower.includes('health'))) {
    return mock;
  }

  // Fallback default response
  return {
    question: userText,
    answer: DEFAULT_MOCKS[activeLanguageCode]
  };
}

/* ════════════════════════════════════════════════════════════
   TEXT-TO-SPEECH SYNTHESIS  – Web Speech API (Reliable)
   ============================================================ */
function speakAIResponse(text) {
  if (!window.speechSynthesis) return;

  const ttsPanel      = document.getElementById('tts-status-indicator');
  const ttsStatusText = document.getElementById('tts-status-label');

  if (ttsPanel) ttsPanel.style.display = 'flex';
  if (ttsStatusText) ttsStatusText.textContent = '🔊 AI बोलत आहे…';

  // Stop any currently playing audio/speech
  if (window.currentTtsAudio) {
    window.currentTtsAudio.pause();
    window.currentTtsAudio = null;
  }
  window.speechSynthesis.cancel();

  // Clean HTML tags from text
  const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
  if (!cleanText) return;

  const targetLang = voiceLanguages[activeLanguageCode]?.synthesis || 'mr-IN';

  // Helper to actually speak
  function doSpeak(voices) {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang  = targetLang;
    utterance.rate  = 0.88;
    utterance.pitch = 1.05;

    // Choose best matching voice
    let bestVoice = voices.find(v => v.lang === targetLang)
      || voices.find(v => v.lang.startsWith(targetLang.split('-')[0]))
      || (activeLanguageCode === 'mr' ? voices.find(v => v.lang.startsWith('hi')) : null)
      || null;

    if (bestVoice) utterance.voice = bestVoice;

    utterance.onstart = () => {
      if (ttsPanel)      ttsPanel.style.display    = 'flex';
      if (ttsStatusText) ttsStatusText.textContent = '🔊 AI बोलत आहे…';
    };
    utterance.onend = () => {
      if (ttsPanel)      ttsPanel.style.display    = 'none';
      if (ttsStatusText) ttsStatusText.textContent = '✅ प्रतिसाद पूर्ण';
    };
    utterance.onerror = () => {
      if (ttsPanel)      ttsPanel.style.display    = 'none';
    };

    window.speechSynthesis.speak(utterance);
  }

  // Voices may not be loaded yet on first call
  let voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak(voices);
  } else {
    // Wait for voices to load then speak
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak(voices);
    };
    // Safety timeout – speak anyway after 800ms even if voices never fire
    setTimeout(() => {
      if (!window.speechSynthesis.speaking) {
        doSpeak(window.speechSynthesis.getVoices());
      }
    }, 800);
  }
}

function fallbackNativeTTS(text) {
  speakAIResponse(text); // just reuse same function
}

// Global stop button handler update
document.addEventListener('DOMContentLoaded', () => {
  const cancelTtsBtn = document.getElementById('btn-tts-stop');
  if (cancelTtsBtn) {
    cancelTtsBtn.addEventListener('click', () => {
      if (window.currentTtsAudio) {
        window.currentTtsAudio.pause();
        window.currentTtsAudio = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const ttsPanel = document.getElementById('tts-status-indicator');
      if (ttsPanel) ttsPanel.style.display = 'none';
    });
  }
});

/* ════════════════════════════════════════════════════════════
   CHAT BUBBLES INJECTION UTILS
   ============================================================ */
function appendChatBubble(sender, text) {
  const chatContainer = document.getElementById('voice-conversation-container');
  if (!chatContainer) return;

  const now = new Date();
  const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const row = document.createElement('div');
  row.className = `chat-bubble-row chat-bubble-row--${sender}`;

  if (sender === 'user') {
    row.innerHTML = `
      <div class="chat-bubble chat-bubble--user">
        <p style="margin:0;">${text}</p>
        <div class="chat-bubble__meta">
          <span>Farmer</span>
          <span>•</span>
          <span>${timestamp}</span>
        </div>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="chat-bubble chat-bubble--ai">
        <p style="margin:0;">${text}</p>
        <div class="chat-bubble__meta">
          <span>KrishiMitra AI</span>
          <span>•</span>
          <span>${timestamp}</span>
          <span>•</span>
          <button type="button" class="chat-bubble__speaker-btn" data-text="${text.replace(/"/g, '&quot;')}" aria-label="Replay audio response">
            <i class="fas fa-volume-up" aria-hidden="true"></i> Replay
          </button>
        </div>
      </div>
    `;
  }

  chatContainer.appendChild(row);

  // Re-attach replay trigger on newly appended bubble
  const replayBtn = row.querySelector('.chat-bubble__speaker-btn');
  replayBtn?.addEventListener('click', function() {
    speakAIResponse(this.dataset.text);
  });

  // Scroll chat window to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ════════════════════════════════════════════════════════════
   RECENT CONVERSATIONS ARCHIVE LOADS
   ============================================================ */
function loadHistoryLogs() {
  const tbody = document.getElementById('recent-voice-tbody');
  if (!tbody) return;

  tbody.innerHTML = MOCK_HISTORY_LOGS.map(log => `
    <tr>
      <td>${log.date}</td>
      <td><strong>${log.lang}</strong></td>
      <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${log.query}"</td>
      <td>
        <span class="status-chip status-chip--completed" style="font-size:0.75rem;">
          <i class="fas fa-check-circle" aria-hidden="true"></i> ${log.status}
        </span>
      </td>
    </tr>
  `).join('');
}
