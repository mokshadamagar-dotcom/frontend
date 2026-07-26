/* ============================================================
   KrishiMitra AI – chatbot.js
   AI Chatbot + RAG Knowledge Base Controller
   Uses localStorage for history log persistence
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   MOCK RESPONSES FOR DEMO
   ============================================================ */
const MOCK_BOT_RESPONSES = {
  disease: {
    mr: "<h4>🌱 पीक रोग नियंत्रण माहिती (AI-व्युत्पन्न)</h4>पिकावर पडणारे डाग किंवा पाने पिवळी पडणे हे बुरशीजन्य अथवा जिवाणूजन्य रोगांचे लक्षण असू शकते.<br/><br/><strong>शिफारस केलेले उपाय:</strong><ul><li>पाण्याचा निचरा नीट करा.</li><li>बुरशीचा प्रादुर्भाव असल्यास योग्य बुरशीनाशकाची फवारणी करा.</li><li>खतांचा समतोल डोस वापरा.</li></ul><br/>🔍 अधिक माहितीसाठी: <strong>Crop Disease Detection</strong> मध्ये पिकाचा स्पष्ट फोटो अपलोड करा.",
    hi: "<h4>🌱 फसल रोग नियंत्रण जानकारी (AI-जनरेटेड)</h4>फसल पर धब्बे या पत्तियों का पीला पड़ना कवक (फंगस) या जीवाणु संक्रमण के संकेत हो सकते हैं।<br/><br/><strong>सुझाए गए उपाय:</strong><ul><li>खेत में जल निकासी सुनिश्चित करें।</li><li>प्रभावित हिस्सों को हटा दें और नष्ट करें।</li><li>कवकनाशी का उचित मात्रा में छिड़काव करें।</li></ul><br/>🔍 अधिक जानकारी के लिए: <strong>Crop Disease Detection</strong> में पौधे की तस्वीर अपलोड करें।",
    en: "<h4>🌱 Crop Disease Control (AI-Generated)</h4>Leaf spots, yellowing, or structural wilting can indicate fungal or bacterial infection.<br/><br/><strong>Suggested Actions:</strong><ul><li>Ensure adequate drainage to prevent root moisture logging.</li><li>Prune and destroy heavily infected leaves.</li><li>Apply recommended fungicides based on diagnostic confirmation.</li></ul><br/>🔍 For a detailed assessment: upload a leaf photo using the <strong>Crop Disease Detection</strong> feature."
  },
  fertilizer: {
    mr: "<h4>🧪 खत व्यवस्थापन सल्ला (AI-व्युत्पन्न)</h4>पिकांच्या चांगल्या वाढीसाठी माती परीक्षणावर आधारित संतुलित खत मात्रा अत्यंत महत्त्वाची असते.<br/><br/><strong>पोषक तत्वे मार्गदर्शक:</strong><ul><li>नायट्रोजन (N): पानांची वाढ आणि हिरवेपणा वाढवते.</li><li>फॉस्फरस (P): मुळांची मजबुती आणि फुलोऱ्यासाठी आवश्यक.</li><li>पोटॅशियम (K): रोगप्रतिकारक शक्ती आणि पाण्याचे नियमन वाढवते.</li></ul><br/>🧪 तुमच्या मातीचे आरोग्य तपासा आणि Fertilizer Recommendation वरून सानुकूल खत वेळापत्रक मिळवा.",
    hi: "<h4>🧪 उर्वरक प्रबंधन सलाह (AI-जनरेटेड)</h4>फसल की अच्छी वृद्धि के लिए मिट्टी की जांच के आधार पर संतुलित उर्वरक खुराक महत्वपूर्ण है।<br/><br/><strong>पोषक तत्व भूमिका:</strong><ul><li>नाइट्रोजन (N): वानस्पतिक विकास और हरी पत्तियों के लिए।</li><li>फास्फोरस (P): जड़ विकास और फूल आने के समय के लिए।</li><li>पोटेशियम (K): रोग प्रतिरोधक क्षमता और पानी के विनियमन के लिए।</li></ul><br/>🧪 अपनी मिट्टी की रिपोर्ट Fertilizer Recommendation में भरें और खाद का शेड्यूल प्राप्त करें।",
    en: "<h4>🧪 Fertilizer & Nutrient Management (AI-Generated)</h4>Crop nutrition should be balanced based on crop growth stages and soil baseline quality.<br/><br/><strong>Essential Nutrients Overview:</strong><ul><li>Nitrogen (N): Essential for green foliage and vegetative growth.</li><li>Phosphorus (P): Necessary for root expansion, tillering, and flowering.</li><li>Potassium (K): Regulates cellular water absorption and builds resistance.</li></ul><br/>🧪 Input your NPK soil metrics in the <strong>Fertilizer Recommendation</strong> module to generate custom fertilization plans."
  },
  irrigation: {
    mr: "<h4>💧 पाणी व्यवस्थापन आणि सिंचन (AI-व्युत्पन्न)</h4>अतिसिंचन टाळा. मातीचा प्रकार आणि स्थानिक हवामानाचा अंदाज पाहूनच सिंचन निश्चित करा.<br/><br/><strong>महत्त्वाच्या सूचना:</strong><ul><li>काळी माती पाणी जास्त काळ टिकवून ठेवते, त्यामुळे सिंचन कमी लागते.</li><li>हलकी वालुकामय माती वारंवार पाणी मागते.</li><li>उद्या पाऊस पडण्याची शक्यता असल्यास पाणी देणे पुढे ढकला.</li></ul><br/>💧 अचूक सिंचन वेळापत्रकासाठी Smart Irrigation Recommendation तपासा.",
    hi: "<h4>💧 सिंचाई और जल प्रबंधन (AI-जनरेटेड)</h4>अत्यधिक सिंचाई से बचें। मिट्टी के प्रकार और स्थानीय मौसम के पूर्वानुमान के अनुसार ही पानी का नियमन करें।<br/><br/><strong>मुख्य बातें:</strong><ul><li>काली मिट्टी नमी को लंबे समय तक रखती है, इसलिए कम सिंचाई की जरूरत होती है।</li><li>बलुई मिट्टी में सिंचाई की आवृत्ति अधिक होती है।</li><li>कल वर्षा की संभावना होने पर सिंचाई टालें।</li></ul><br/>💧 सटीक जल योजना के लिए Smart Irrigation Recommendation देखें।",
    en: "<h4>💧 Water & Irrigation Schedule (AI-Generated)</h4>Avoid over-irrigation. Water applications should adjust according to soil water retention capacity and local rainfall estimates.<br/><br/><strong>Key Guidelines:</strong><ul><li>Clay-loam soils retain water longer; sand-loam requires more cycles.</li><li>Delay watering if heavy rainfall is forecast within 24 hours.</li><li>Apply water early in the morning to reduce evaporation losses.</li></ul><br/>💧 Check the <strong>Smart Irrigation Recommendation</strong> module to plan precise field water requirements."
  },
  pest: {
    mr: "<h4>🐛 एकात्मिक कीड व्यवस्थापन (AI-व्युत्पन्न)</h4>किडींचा प्रादुर्भाव सुरुवातीच्या टप्प्यातच ओळखून जैविक उपायांना प्राधान्य द्या.<br/><br/><strong>कीड नियंत्रण पद्धती:</strong><ul><li>मावा/तुडतुडे कमी करण्यासाठी पिवळे चिकट सापळे लावा.</li><li>सेंद्रिय नियंत्रणासाठी लिंबोळी अर्काची फवारणी करा.</li><li>रासायनिक फवारणी आर्थिक नुकसान पातळी ओलांडल्यावरच करा.</li></ul><br/>🐛 किडीची ओळख पटवण्यासाठी AI Pest Detection मॉड्यूल वापरा.",
    hi: "<h4>🐛 एकीकृत कीट प्रबंधन (AI-जनरेटेड)</h4>कीटों के प्रकोप को शुरुआती चरणों में पहचानें और जैविक नियंत्रण विधियों को प्राथमिकता दें।<br/><br/><strong>कीट नियंत्रण विधियां:</strong><ul><li>माहू और थ्रिप्स को आकर्षित करने के लिए पीले चिपचिपे जाल लगाएं।</li><li>प्राकृतिक छिड़काव के लिए नीम के तेल (Neem Oil) का उपयोग करें।</li><li>रासायनिक छिड़काव केवल अत्यधिक नुकसान की स्थिति में ही करें।</li></ul><br/>🐛 कीड़ों की पहचान के लिए AI Pest Detection का उपयोग करें।",
    en: "<h4>🐛 Integrated Pest Management (AI-Generated)</h4>Early pest detection is critical to minimizing losses. Prioritize cultural and biological controls.<br/><br/><strong>Control Methods:</strong><ul><li>Deploy yellow sticky traps to capture sucking pests like aphids.</li><li>Use Neem seed kernel extract (NSKE) as a biological deterrent.</li><li>Apply chemical sprays only when pest populations cross economic thresholds.</li></ul><br/>🐛 Identify insect pests using the <strong>AI Pest Detection</strong> module."
  },
  soil: {
    mr: "<h4>🌍 मातीचे आरोग्य आणि संवर्धन (AI-व्युत्पन्न)</h4>मातीचे आरोग्य टिकवून ठेवण्यासाठी सेंद्रिय कर्ब (Organic Carbon) वाढवणे आवश्यक आहे.<br/><br/><strong>सुधारणा उपाय:</strong><ul><li>दर दोन ते तीन वर्षांनी मातीचे रासायनिक परीक्षण करा.</li><li>शेणखत, गांडूळ खत किंवा हिरवळीच्या खतांचा वापर वाढवा.</li><li>पिकांची फेरपालट (Crop Rotation) करा, विशेषतः द्विदल पिके घ्या.</li></ul><br/>🌍 तुमच्या प्रयोगशाळेची रिपोर्ट PDF PDF Soil Health Analysis मध्ये अपलोड करा.",
    hi: "<h4>🌍 मिट्टी का स्वास्थ्य और सुधार (AI-जनरेटेड)</h4>मिट्टी की उर्वरा शक्ति बनाए रखने के लिए ऑर्गेनिक कार्बन (Organic Carbon) बढ़ाना जरूरी है।<br/><br/><strong>सुधार के उपाय:</strong><ul><li>हर 2-3 साल में मिट्टी की जांच जरूर करवाएं।</li><li>गोबर की खाद, केंचुआ खाद या हरी खाद का प्रयोग बढ़ाएं।</li><li>फसल चक्र (Crop Rotation) का पालन करें, विशेषकर दलहनी फसलें उगाएं।</li></ul><br/>🌍 अपनी लैब की रिपोर्ट PDF Soil Health Analysis पर अपलोड करके जांचें।",
    en: "<h4>🌍 Soil Health Improvement (AI-Generated)</h4>Increasing Soil Organic Carbon (SOC) is vital to maintaining soil structure and microbial activity.<br/><br/><strong>Action Plan:</strong><ul><li>Perform chemical soil testing every 2 to 3 years.</li><li>Incorporate decomposed farmyard manure or vermicompost amendments.</li><li>Practice crop rotation by growing nitrogen-fixing legume crops.</li></ul><br/>🌍 Upload your laboratory soil cards in the <strong>PDF Soil Health Analysis</strong> section to view diagnostics."
  },
  weather: {
    mr: "<h4>🌦️ हवामान आधारित शेती नियोजन (AI-व्युत्पन्न)</h4>हवामानातील बदल थेट पीक संरक्षण आणि सिंचन योजनांवर परिणाम करतात.<br/><br/><strong>कृषी-हवामान सल्ला:</strong><ul><li>पुढील २४ तासांत पावसाची शक्यता ७५% आहे, फवारणी करणे टाळा.</li><li>जास्त वाऱ्याच्या वेळी कीटकनाशकांची फवारणी करू नका.</li><li>उष्ण लाटेदरम्यान पिकांना रात्री किंवा पहाटे हलके पाणी द्या.</li></ul><br/>🌦️ तपशीलवार अंदाजासाठी Weather Advisory मॉड्यूल तपासा.",
    hi: "<h4>🌦️ मौसम आधारित कृषि योजना (AI-जनरेटेड)</h4>मौसम की स्थिति सीधे फसल संरक्षण और सिंचाई योजनाओं को प्रभावित करती है।<br/><br/><strong>कृषि-मौसम सलाह:</strong><ul><li>अगले 24 घंटों में बारिश की 75% संभावना है, रासायनिक छिड़काव न करें।</li><li>तेज हवाओं के समय छिड़काव करने से बचें।</li><li>गर्मी बढ़ने पर फसलों की सिंचाई शाम या सुबह के समय करें।</li></ul><br/>🌦️ विस्तृत मौसम पूर्वानुमान के लिए Weather Advisory देखें।",
    en: "<h4>🌦️ Weather-Based Agricultural Planning (AI-Generated)</h4>Weather forecasts directly affect spray schedules, fertilizer applications, and irrigation.<br/><br/><strong>Agro-Meteorological Advice:</strong><ul><li>With a 75% rain probability tomorrow, postpone pesticide chemical sprays.</li><li>Avoid spraying during high wind speeds to prevent drift.</li><li>Irrigate fields during low-evaporation periods (early morning/late evening).</li></ul><br/>🌦️ Visit the <strong>Weather Advisory</strong> section to check dynamic localized forecasts."
  },
  advisory: {
    mr: "<h4>🧑‍🌾 संपूर्ण पीक सल्ला (AI-व्युत्पन्न)</h4>पिकाच्या वाढीच्या अवस्थेनुसार खते, पाणी आणि कीड नियंत्रणाचे एकात्मिक नियोजन करा.<br/><br/><strong>वेळापत्रक:</strong><ul><li>शाकीय अवस्था: नायट्रोजनयुक्त खतांची पहिली मात्रा द्या.</li><li>फुलोरा अवस्था: पाणी साचू देऊ नका, कीड व्यवस्थापन करा.</li><li>फळे धारणा: पोटॅश खतांचा समतोल डोस वापरा.</li></ul><br/>🧑‍🌾 संपूर्ण मार्गदर्शकासाठी AI Crop Advisory पृष्ठ पहा.",
    hi: "<h4>🧑‍🌾 संपूर्ण फसल सलाह (AI-जनरेटेड)</h4>फसल की विकास अवस्था के अनुसार खाद, पानी और कीट नियंत्रण की एकीकृत योजना बनाएं।<br/><br/><strong>शेड्यूल:</strong><ul><li>वानस्पतिक अवस्था: नाइट्रोजन युक्त खादों का पहला छिड़काव करें।</li><li>फूल आने की अवस्था: जल निकासी का ध्यान रखें, कीटों की निगरानी करें।</li><li>फल बनने की अवस्था: पोटाश उर्वरकों का उचित संतुलन रखें।</li></ul><br/>🧑‍🌾 विस्तृत दिशा-निर्देशों के लिए AI Crop Advisory पेज देखें।",
    en: "<h4>🧑‍🌾 Integrated Crop Advisory (AI-Generated)</h4>Manage fertilization, watering, and pest checks interactively according to crop growth phases.<br/><br/><strong>Phase Action Guide:</strong><ul><li>Vegetative Phase: Focus on nitrogen amendments to support leaf canopy development.</li><li>Flowering Phase: Keep water balances stable and avoid chemical spray shocks.</li><li>Fruiting/Maturity Phase: Apply potassium to build grain size and shelf life.</li></ul><br/>🧑‍🌾 Go to the <strong>AI Crop Advisory</strong> panel to fetch complete weekly action schedules."
  },
  scheme: {
    mr: "<h4>🏛️ सरकारी योजना मार्गदर्शिका (AI-व्युत्पन्न)</h4>शेतकऱ्यांच्या आर्थिक सुरक्षेसाठी आणि अनुदानासाठी विविध शासकीय योजना उपलब्ध आहेत.<br/><br/><strong>महत्त्वाच्या योजना:</strong><ul><li>पीएम किसान सन्मान निधी: प्रति वर्ष ६००० रुपये थेट बँक खात्यात.</li><li>पीक विमा योजना (PMFBY): पिकांचे नैसर्गिक आपत्तींपासून विमा संरक्षण.</li><li>कृषी यांत्रिकीकरण उपअभियान: कृषी अवजारांवर अनुदान.</li></ul><br/>🏛️ तपशीलांसाठी Government Schemes विभाग तपासा.",
    hi: "<h4>🏛️ सरकारी योजना गाइड (AI-जनरेटेड)</h4>किसानों की वित्तीय सुरक्षा और अनुदान के लिए विभिन्न सरकारी योजनाएं उपलब्ध हैं।<br/><br/><strong>प्रमुख योजनाएं:</strong><ul><li>पीएम किसान सम्मान निधि: प्रति वर्ष 6000 रुपये सीधे बैंक खाते में।</li><li>फसल बीमा योजना (PMFBY): फसल नुकसान के विरुद्ध बीमा सुरक्षा।</li><li>कृषि यंत्रीकरण उपमिशन: ट्रैक्टर और कृषि उपकरणों पर सब्सिडी।</li></ul><br/>🏛️ पात्रता जांचने के लिए Government Schemes अनुभाग देखें।",
    en: "<h4>🏛️ Agricultural Government Schemes (AI-Generated)</h4>Various federal and state schemes offer subsidies and crop insurance covers to farmers.<br/><br/><strong>Highlighted Schemes:</strong><ul><li>PM-KISAN Samman Nidhi: Provides Rs. 6,000 annually directly to bank accounts.</li><li>Pradhan Mantri Fasal Bima Yojana (PMFBY): Protects crops against natural disasters.</li><li>Sub-Mission on Agricultural Mechanization: Offers subsidies on farm machinery.</li></ul><br/>🏛️ Read more details and eligibility checks in the <strong>Government Schemes</strong> module."
  },
  general: {
    mr: "<h4>🧑‍🌾 कृषी सल्लागार सहाय्यक (AI-व्युत्पन्न)</h4>नमस्कार! मी कृषि मित्र सहाय्यक आहे. मी तुम्हाला पिकांची निवड, खत नियोजन, हवामान सल्ला, रोग आणि कीड नियंत्रण याबद्दल माहिती देऊ शकतो.<br/><br/>कृपया पीक प्रकार किंवा विचारण्यासारख्या घटकाबद्दल स्पष्ट प्रश्न विचारा जेणेकरून मी योग्य सल्ला देऊ शकेन.",
    hi: "<h4>🧑‍🌾 कृषि मित्र सलाहकार (AI-जनरेटेड)</h4>नमस्कार! मैं आपका कृषि मित्र सहायक हूँ। मैं आपको फसल चयन, खाद, सिंचाई, कीट नियंत्रण और मौसम से संबंधित सलाह दे सकता हूँ।<br/><br/>कृपया अपना प्रश्न पूछें ताकि मैं आपको कृषि मार्गदर्शिका के अनुसार उत्तर प्रदान कर सकूं।",
    en: "<h4>🧑‍🌾 KrishiMitra AI Assistant (AI-Generated)</h4>Namaste! I am your intelligent agriculture advisor. I can assist you with soil quality reports, crop diagnostics, pest containment, fertilizer recommendations, and government schemes.<br/><br/>Type a clear question containing keywords like 'soil', 'pests', 'fertilizer', 'yellow leaves', or 'weather' to fetch contextual advisories."
  }
};

/* ════════════════════════════════════════════════════════════
   STATE VARIABLES
   ============================================================ */
let currentConversationId = null;
let conversationsList = [];
let activeLang = "mr";
let selectedImageFile = null;

/* ════════════════════════════════════════════════════════════
   DOM INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadConversationsFromLocalStorage();
  initLanguageSelector();
  initChatForm();
  initSuggestions();
  initHistorySidebar();
  initChips();
  initImageAttachment();
  initChatHeaderActions();
  startNewChat();
});

/* ════════════════════════════════════════════════════════════
   LANGUAGE SELECTOR HANDLER
   ============================================================ */
function initLanguageSelector() {
  const selectors = document.querySelectorAll('.lang-radio-card');
  const label = document.getElementById('selected-lang-label');

  selectors.forEach(sel => {
    sel.addEventListener('click', function() {
      selectors.forEach(s => s.classList.remove('active'));
      this.classList.add('active');

      activeLang = this.dataset.lang;
      if (label) {
        const langNames = { mr: "Marathi", hi: "Hindi", en: "English" };
        label.textContent = `Selected Language: ${langNames[activeLang]}`;
      }

      // TODO: Send selected language to FastAPI in future requests.
    });
  });
}

/* ════════════════════════════════════════════════════════════
   IMAGE ATTACHMENT CONTROLLER
   ============================================================ */
function initImageAttachment() {
  const attachBtn = document.getElementById('chat-attach-btn');
  const fileInput = document.getElementById('chat-image-input');
  const previewBox = document.getElementById('chat-upload-preview-box');
  const previewImg = document.getElementById('chat-upload-preview-img');
  const previewName = document.getElementById('chat-upload-preview-name');
  const removeBtn = document.getElementById('chat-upload-remove-btn');
  const analyzeBtn = document.getElementById('chat-upload-analyze-btn');

  if (!attachBtn || !fileInput) return;

  attachBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', function() {
    if (this.files.length) {
      const file = this.files[0];
      if (!file.type.startsWith('image/')) {
        if (typeof window.showToast === 'function') {
          window.showToast('Please select a valid crop leaf image file.', 'error');
        }
        return;
      }

      selectedImageFile = file;
      previewName.textContent = file.name;

      // Render image preview thumbnail
      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewImg) previewImg.src = e.target.result;
        if (previewBox) previewBox.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    }
  });

  removeBtn?.addEventListener('click', resetImageAttachment);

  analyzeBtn?.addEventListener('click', () => {
    // TODO: Connect attachment to disease detection API.
    window.location.href = 'crop-disease.html';
  });

  function resetImageAttachment() {
    selectedImageFile = null;
    fileInput.value = '';
    if (previewBox) previewBox.style.display = 'none';
  }
}

/* ════════════════════════════════════════════════════════════
   CHAT MESSAGES FORM SUBMIT & AI PROCESSING PIPELINE
   ============================================================ */
function initChatForm() {
  const form = document.getElementById('chat-input-form');
  const textarea = document.getElementById('chat-textarea-control');
  const submitBtn = document.getElementById('chat-send-btn');
  const messagesBox = document.getElementById('chat-main-messages-box');
  const welcomeScreen = document.getElementById('chat-welcome-screen');

  if (!form || !textarea) return;

  // Toggle button status on input
  textarea.addEventListener('input', () => {
    submitBtn.disabled = !textarea.value.trim();
  });

  // Shift + Enter newline mapping
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const queryText = textarea.value.trim();
    if (!queryText) return;

    // Clear textarea
    textarea.value = '';
    submitBtn.disabled = true;

    // Hide welcome overlay if first message
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    // 1. Render User Message
    appendMessageBubble('user', queryText);

    // 2. Render AI Thinking Loading steps
    const loaderId = appendThinkingIndicator();
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Save user message to memory
    addMessageToActiveConversation('user', queryText);

    try {
      // Simulate multi-step processing delays
      await runThinkingSteps(loaderId);

      // 3. Resolve Mock Response
      const responseText = matchMockResponse(queryText);

      // Remove loader & Render AI bubble
      removeThinkingIndicator(loaderId);
      appendMessageBubble('ai', responseText);

      // Save AI response to memory
      addMessageToActiveConversation('assistant', responseText);

      messagesBox.scrollTop = messagesBox.scrollHeight;

    } catch (err) {
      console.error(err);
      removeThinkingIndicator(loaderId);
      appendErrorBubble();
    }
  });
}

// Keyword Matcher Selector
function matchMockResponse(userQuery) {
  const queryLower = userQuery.toLowerCase();

  // Disease: yellow leaves, spots, पिवळी, पीले
  if (queryLower.includes('yellow') || queryLower.includes('spots') || queryLower.includes('पिवळी') || queryLower.includes('पीले') || queryLower.includes('पाने पिवळी') || queryLower.includes('रोग')) {
    return MOCK_BOT_RESPONSES.disease[activeLang];
  }
  // Fertilizer: fertilizer, npk, खत, उर्वरक, यूरिया
  if (queryLower.includes('fertilizer') || queryLower.includes('npk') || queryLower.includes('खत') || queryLower.includes('उर्वरक') || queryLower.includes('यूरिया')) {
    return MOCK_BOT_RESPONSES.fertilizer[activeLang];
  }
  // Irrigation: water, irrigate, पाणी, सिंचन, सिंचाई
  if (queryLower.includes('water') || queryLower.includes('irrigate') || queryLower.includes('पाणी') || queryLower.includes('सिंचन') || queryLower.includes('सिंचाई')) {
    return MOCK_BOT_RESPONSES.irrigation[activeLang];
  }
  // Pest: pest, aphids, worm, कीड, कीट, कीड़ा
  if (queryLower.includes('pest') || queryLower.includes('aphids') || queryLower.includes(' कीड') || queryLower.includes('कीट') || queryLower.includes('कीड़ा')) {
    return MOCK_BOT_RESPONSES.pest[activeLang];
  }
  // Soil: soil, ph, माती, मिट्टी
  if (queryLower.includes('soil') || queryLower.includes('ph') || queryLower.includes('माती') || queryLower.includes('मिट्टी')) {
    return MOCK_BOT_RESPONSES.soil[activeLang];
  }
  // Weather: weather, rain, हवामान, मौसम, पाऊस
  if (queryLower.includes('weather') || queryLower.includes('rain') || queryLower.includes('हवामान') || queryLower.includes('मौसम') || queryLower.includes('पाऊस')) {
    return MOCK_BOT_RESPONSES.weather[activeLang];
  }
  // Advisory: advisory, crop advisory, सल्ला
  if (queryLower.includes('advisory') || queryLower.includes('सल्ला')) {
    return MOCK_BOT_RESPONSES.advisory[activeLang];
  }
  // Scheme: scheme, pm kisan, योजना
  if (queryLower.includes('scheme') || queryLower.includes('किसान') || queryLower.includes('योजना')) {
    return MOCK_BOT_RESPONSES.scheme[activeLang];
  }

  // Fallback
  return MOCK_BOT_RESPONSES.general[activeLang];
}

// ── Multi-Step Thinking Pipeline Loader ──
async function runThinkingSteps(loaderId) {
  const steps = ['rag-understand', 'rag-context', 'rag-search', 'rag-generate'];
  // TODO: Replace demo delay with real FastAPI AI response.
  for (let i = 0; i < steps.length; i++) {
    const el = document.getElementById(`${loaderId}-${steps[i]}`);
    if (el) el.style.color = '#166534'; // Highlight active step
    await new Promise(resolve => setTimeout(resolve, 350));
  }
}

/* ════════════════════════════════════════════════════════════
   RENDER CHAT MESSAGES ELEMENTS
   ============================================================ */
function appendMessageBubble(sender, text) {
  const box = document.getElementById('chat-main-messages-box');
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const row = document.createElement('div');
  row.className = `chat-message-row chat-message-row--${sender}`;

  if (sender === 'user') {
    row.innerHTML = `
      <div class="chat-message-bubble">
        <div class="chat-message-bubble__payload">
          <p style="margin:0;">${text}</p>
        </div>
        <div class="chat-message-bubble__meta">
          <span>Farmer</span>
          <span>•</span>
          <span>${time}</span>
        </div>
      </div>
    `;
  } else {
    // Inject dynamic replay, copy, helpful action listeners
    const cleanText = text.replace(/"/g, '&quot;');
    row.innerHTML = `
      <div class="chat-message-bubble">
        <div class="chat-message-bubble__payload" aria-live="polite">
          ${text}
          <!-- RAG reference source info display -->
          <div style="margin-top:12px; font-size:0.75rem; border-top:1px dashed var(--dash-border); padding-top:6px; color:var(--text-light);">
            <i class="fas fa-book" aria-hidden="true" style="margin-right:3px;"></i> Knowledge Sources: Agricultural Guidelines, Govt Portals
          </div>
        </div>
        <div class="chat-message-bubble__meta">
          <span class="crop-status-pill crop-status-pill--healthy" style="font-size:0.6rem; padding:1px 6px;">AI Generated</span>
          <span>•</span>
          <span>${time}</span>
          <span>•</span>
          <div class="chat-bubble-actions">
            <button type="button" class="chat-bubble-action-btn btn-chat-copy" data-text="${cleanText}" aria-label="Copy text response"><i class="fas fa-copy"></i> Copy</button>
            <button type="button" class="chat-bubble-action-btn btn-chat-listen" data-text="${cleanText.replace(/<[^>]*>/g, '')}" aria-label="Listen to voice response"><i class="fas fa-volume-up"></i> Listen</button>
            <button type="button" class="chat-bubble-action-btn btn-chat-feedback" data-val="helpful" aria-label="Mark response helpful"><i class="fas fa-thumbs-up"></i></button>
            <button type="button" class="chat-bubble-action-btn btn-chat-feedback" data-val="unhelpful" aria-label="Mark response unhelpful"><i class="fas fa-thumbs-down"></i></button>
          </div>
        </div>
      </div>
    `;
  }

  box.appendChild(row);

  // Attach button triggers
  if (sender === 'ai') {
    row.querySelector('.btn-chat-copy').addEventListener('click', function() {
      navigator.clipboard.writeText(this.dataset.text.replace(/<[^>]*>/g, ''));
      if (typeof window.showToast === 'function') window.showToast('Response copied to clipboard.', 'success');
    });

    row.querySelector('.btn-chat-listen').addEventListener('click', function() {
      speakTextResponse(this.dataset.text);
    });

    row.querySelectorAll('.btn-chat-feedback').forEach(btn => {
      btn.addEventListener('click', function() {
        // TODO: Persist feedback values in MongoDB.
        row.querySelectorAll('.btn-chat-feedback').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (typeof window.showToast === 'function') {
          window.showToast('Thank you for your feedback!', 'success');
        }
      });
    });
  }
}

// Speaks output response using Web Speech Synthesis
function speakTextResponse(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = activeLang === 'mr' ? 'mr-IN' : activeLang === 'hi' ? 'hi-IN' : 'en-US';
  window.speechSynthesis.speak(utter);
}

// ── RAG Pipeline Thinking indicator dots bubble ──
function appendThinkingIndicator() {
  const box = document.getElementById('chat-main-messages-box');
  const loaderId = `loader-${Date.now()}`;

  const row = document.createElement('div');
  row.className = `chat-message-row chat-message-row--ai`;
  row.id = loaderId;

  row.innerHTML = `
    <div class="chat-message-bubble" style="width:70%;">
      <div class="chat-message-bubble__payload">
        <div class="typing-indicator" aria-hidden="true" style="display:flex; gap:4px; margin-bottom:8px;">
          <span class="typing-dot" style="width:6px; height:6px; background:var(--primary); border-radius:50%; animation: bounce-dot 0.8s infinite alternate;"></span>
          <span class="typing-dot" style="width:6px; height:6px; background:var(--primary); border-radius:50%; animation: bounce-dot 0.8s infinite alternate 0.2s;"></span>
          <span class="typing-dot" style="width:6px; height:6px; background:var(--primary); border-radius:50%; animation: bounce-dot 0.8s infinite alternate 0.4s;"></span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-muted);">KrishiMitra AI is searching knowledge base...</span>

        <!-- Expandable RAG workflow processing checkboxes -->
        <div class="rag-check-box" style="margin-top:10px;">
          <div class="rag-check-item" id="${loaderId}-rag-understand" style="color:var(--text-light);">
            <div class="rag-check-item__dot"></div> 1. Understanding question context
          </div>
          <div class="rag-check-item" id="${loaderId}-rag-context" style="color:var(--text-light);">
            <div class="rag-check-item__dot"></div> 2. Identifying farming context parameters
          </div>
          <div class="rag-check-item" id="${loaderId}-rag-search" style="color:var(--text-light);">
            <div class="rag-check-item__dot"></div> 3. Searching RAG knowledge database
          </div>
          <div class="rag-check-item" id="${loaderId}-rag-generate" style="color:var(--text-light);">
            <div class="rag-check-item__dot"></div> 4. Generating structured response
          </div>
        </div>
      </div>
    </div>
  `;

  box.appendChild(row);
  return loaderId;
}

function removeThinkingIndicator(loaderId) {
  const el = document.getElementById(loaderId);
  if (el) el.remove();
}

function appendErrorBubble() {
  const box = document.getElementById('chat-main-messages-box');
  const row = document.createElement('div');
  row.className = `chat-message-row chat-message-row--ai`;
  row.innerHTML = `
    <div class="chat-message-bubble">
      <div class="chat-message-bubble__payload" style="background:#fef2f2; border:1px solid #fee2e2; color:#dc2626;">
        <p style="margin:0;"><i class="fas fa-exclamation-circle"></i> Sorry, I couldn't process your question right now. Please check your connection and try again.</p>
      </div>
    </div>
  `;
  box.appendChild(row);
}

/* ════════════════════════════════════════════════════════════
   SUGGESTIONS CARDS & CHIPS CLICKERS
   ============================================================ */
function initSuggestions() {
  const cards = document.querySelectorAll('.chat-suggestion-card');
  const textarea = document.getElementById('chat-textarea-control');
  const submitBtn = document.getElementById('chat-send-btn');

  cards.forEach(card => {
    card.addEventListener('click', function() {
      if (textarea) {
        textarea.value = this.dataset.question;
        submitBtn.disabled = false;
        textarea.focus();
      }
    });
  });
}

function initChips() {
  const chips = document.querySelectorAll('.chat-chip');
  const textarea = document.getElementById('chat-textarea-control');
  const submitBtn = document.getElementById('chat-send-btn');

  chips.forEach(chip => {
    chip.addEventListener('click', function() {
      if (textarea) {
        textarea.value = this.dataset.question;
        submitBtn.disabled = false;
        textarea.focus();
      }
    });
  });
}

/* ════════════════════════════════════════════════════════════
   CONVERSATION HISTORY (localStorage & Sidebar Sync)
   ============================================================ */
function loadConversationsFromLocalStorage() {
  // TODO: Replace localStorage with MongoDB & FastAPI fetch calls.
  const data = localStorage.getItem('km_chat_conversations');
  if (data) {
    try {
      conversationsList = JSON.parse(data);
    } catch (e) {
      console.error(e);
      conversationsList = [];
    }
  } else {
    // Generate default template list
    conversationsList = [
      { id: "conv_1", title: "Why are my cotton leaves yellow?", messages: [], createdAt: "25 Jul 2026" },
      { id: "conv_2", title: "Best fertilizer for soybean", messages: [], createdAt: "24 Jul 2026" },
      { id: "conv_3", title: "When should I irrigate my crop?", messages: [], createdAt: "23 Jul 2026" }
    ];
    saveConversationsToLocalStorage();
  }
}

function saveConversationsToLocalStorage() {
  localStorage.setItem('km_chat_conversations', JSON.stringify(conversationsList));
}

function initHistorySidebar() {
  const listContainer = document.getElementById('sidebar-history-list');
  const searchInput = document.getElementById('search-history-input');
  const newChatBtn = document.getElementById('new-conversation-btn');

  if (!listContainer) return;

  renderHistoryItems(conversationsList);

  // Search input filter
  searchInput?.addEventListener('input', function() {
    const term = this.value.toLowerCase().trim();
    const filtered = conversationsList.filter(c => c.title.toLowerCase().includes(term));
    renderHistoryItems(filtered);
  });

  // "+ New Conversation" Button
  newChatBtn?.addEventListener('click', startNewChat);

  function renderHistoryItems(list) {
    if (!list.length) {
      listContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-light); text-align:center; display:block; padding:10px;">No matches found</span>`;
      return;
    }

    listContainer.innerHTML = list.map(c => `
      <div class="chat-history-item ${c.id === currentConversationId ? 'active' : ''}" data-id="${c.id}">
        <div class="chat-history-item__content">
          <i class="far fa-comment chat-history-item__icon" aria-hidden="true"></i>
          <span class="chat-history-item__text">${c.title}</span>
        </div>
        <button type="button" class="chat-history-item__delete" data-id="${c.id}" aria-label="Delete conversation">
          <i class="fas fa-trash-alt" aria-hidden="true"></i>
        </button>
      </div>
    `).join('');

    // Attach click switches
    listContainer.querySelectorAll('.chat-history-item').forEach(item => {
      item.addEventListener('click', function(e) {
        if (e.target.closest('.chat-history-item__delete')) return; // Avoid trigger when clicking trash can
        switchConversation(this.dataset.id);
      });
    });

    // Attach delete handlers
    listContainer.querySelectorAll('.chat-history-item__delete').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteConversationRecord(this.dataset.id);
      });
    });
  }
}

function startNewChat() {
  currentConversationId = null;
  const messagesBox = document.getElementById('chat-main-messages-box');
  const welcomeScreen = document.getElementById('chat-welcome-screen');

  if (messagesBox) messagesBox.innerHTML = '';
  if (welcomeScreen) welcomeScreen.style.display = 'flex';

  // Highlight active sidebar item
  document.querySelectorAll('.chat-history-item').forEach(c => c.classList.remove('active'));
}

function switchConversation(id) {
  currentConversationId = id;
  const messagesBox = document.getElementById('chat-main-messages-box');
  const welcomeScreen = document.getElementById('chat-welcome-screen');

  if (!messagesBox) return;
  messagesBox.innerHTML = '';

  const activeConv = conversationsList.find(c => c.id === id);
  if (!activeConv) return;

  // Render elements in screen
  if (activeConv.messages.length) {
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    activeConv.messages.forEach(msg => {
      appendMessageBubble(msg.role === 'user' ? 'user' : 'ai', msg.content);
    });
  } else {
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
  }

  // Reload active states
  initHistorySidebar();
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function addMessageToActiveConversation(role, content) {
  // If first user message, create a new conversation ID
  if (!currentConversationId) {
    const id = `conv_${Date.now()}`;
    const newConv = {
      id: id,
      title: content.substring(0, 32) + (content.length > 32 ? '...' : ''),
      messages: [],
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    conversationsList.unshift(newConv);
    currentConversationId = id;
  }

  const activeConv = conversationsList.find(c => c.id === currentConversationId);
  if (activeConv) {
    activeConv.messages.push({ role, content, timestamp: new Date().toISOString() });
    saveConversationsToLocalStorage();
    initHistorySidebar();
  }
}

function deleteConversationRecord(id) {
  conversationsList = conversationsList.filter(c => c.id !== id);
  saveConversationsToLocalStorage();
  if (currentConversationId === id) {
    startNewChat();
  } else {
    initHistorySidebar();
  }
  if (typeof window.showToast === 'function') {
    window.showToast('Conversation deleted.', 'info');
  }
}

/* ════════════════════════════════════════════════════════════
   TOP CHAT HEADER CONTROL ACTIONS (Export, Clear)
   ============================================================ */
function initChatHeaderActions() {
  const clearBtn = document.getElementById('btn-chat-header-clear');
  const exportBtn = document.getElementById('btn-chat-header-export');
  const newChatBtn = document.getElementById('btn-chat-header-new');

  // Clear current active screen
  clearBtn?.addEventListener('click', () => {
    if (currentConversationId) {
      const activeConv = conversationsList.find(c => c.id === currentConversationId);
      if (activeConv) activeConv.messages = [];
      saveConversationsToLocalStorage();
      switchConversation(currentConversationId);
    } else {
      startNewChat();
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Conversation cleared.', 'info');
    }
  });

  // New Chat
  newChatBtn?.addEventListener('click', startNewChat);

  // Export Chat history as text file (.txt download buffer)
  exportBtn?.addEventListener('click', () => {
    let transcript = "=== KRISHIMITRA AI CHAT TRANSCRIPT ===\n";
    const activeConv = conversationsList.find(c => c.id === currentConversationId);

    if (!activeConv || !activeConv.messages.length) {
      if (typeof window.showToast === 'function') {
        window.showToast('No active conversation to export.', 'error');
      }
      return;
    }

    activeConv.messages.forEach(msg => {
      const role = msg.role === 'user' ? 'FARMER' : 'KRISHIMITRA AI';
      const textClean = msg.content.replace(/<[^>]*>/g, ''); // Strip html tags
      transcript += `\n[${role}]:\n${textClean}\n`;
    });

    // Trigger local text download buffer
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `krishimitra_chat_${activeConv.id}.txt`;
    link.click();

    if (typeof window.showToast === 'function') {
      window.showToast('Chat transcript exported successfully.', 'success');
    }
  });
}

/* ════════════════════════════════════════════════════════════
   FUTURE FASTAPI INTEGRATION & CONTRACT MODEL
   ============================================================ */
async function sendChatMessage(messageText, langCode, convId) {
  // TODO: Replace mock response with FastAPI API.
  // TODO: Endpoint: POST /api/v1/chat/message
  // TODO: Request Contract payload:
  // {
  //    "message": messageText,
  //    "language": langCode,
  //    "conversation_id": convId
  // }
  //
  // TODO: Response Contract output:
  // {
  //    "response": "AI response string",
  //    "conversation_id": "string",
  //    "sources": ["ICAR Guidelines", "Farming Manuals"],
  //    "language": "mr"
  // }

  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    response: "Mocked FastAPI Response text.",
    conversation_id: convId,
    sources: ["Agricultural Guidelines"]
  };
}
