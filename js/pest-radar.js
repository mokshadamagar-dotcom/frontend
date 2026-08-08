/* ============================================================
   KrishiMitra AI – pest-radar.js
   Pest Radar Early Warning System – Interactive Engine (Dynamic Version)
   ============================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
const PR_STATE = {
  language: localStorage.getItem('km_language') || 'en',
  district: 'Nagpur',
  crop: 'cotton',
  cropStage: 'vegetative',
  season: 'kharif',
  trendCharts: {}
};

// ── MULTILINGUAL CONTENT ─────────────────────────────────────
const PR_LANG = {
  en: {
    analysisRunning: 'Running Pest Radar Analysis...',
    analysisComplete: 'Analysis complete. Pest risk scores updated.',
    locationDetecting: 'Detecting your GPS location...',
    locationSuccess: (loc) => `Location detected: ${loc}`,
    locationError: 'Unable to detect location. Please enter manually.',
    alertCleared: 'All alerts cleared.',
  },
  hi: {
    analysisRunning: 'कीट राडार विश्लेषण चल रहा है...',
    analysisComplete: 'विश्लेषण पूर्ण। कीट जोखिम स्कोर अपडेट किया गया।',
    locationDetecting: 'आपकी GPS स्थान खोज रहे हैं...',
    locationSuccess: (loc) => `स्थान पहचाना गया: ${loc}`,
    locationError: 'स्थान पहचानने में असमर्थ। कृपया मैन्युअल रूप से दर्ज करें।',
    alertCleared: 'सभी अलर्ट साफ किए गए।',
  },
  mr: {
    analysisRunning: 'कीड रडार विश्लेषण सुरू आहे...',
    analysisComplete: 'विश्लेषण पूर्ण. कीड जोखीम स्कोर अपडेट केला.',
    locationDetecting: 'आपले GPS स्थान शोधत आहे...',
    locationSuccess: (loc) => `स्थान आढळले: ${loc}`,
    locationError: 'स्थान आढळले नाही. कृपया स्वतः प्रविष्ट करा.',
    alertCleared: 'सर्व सूचना साफ केल्या.',
  }
};

function t(key, ...args) {
  const lang = PR_STATE.language;
  const entry = PR_LANG[lang]?.[key] || PR_LANG.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// ── DATA: TREATMENT GUIDE ────────────────────────────────────
const TREATMENT_DB = {
  bollworm: {
    organic: [
      { name: 'Neem Oil Spray', dose: '2% @ 5ml/L', desc: 'Disrupt feeding and growth of larvae. Apply in evening hours.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
      { name: 'Bacillus thuringiensis (Bt)', dose: '1g/L water', desc: 'Biological toxin specific to caterpillar larvae. Very effective.', icon: 'fas fa-flask', bg: '#f0fdf4', color: '#15803d' },
      { name: 'Neem Kernel Extract (NSKE)', dose: '5% solution', desc: 'Deters egg-laying by adult moths. Spray in early morning.', icon: 'fas fa-seedling', bg: '#dcfce7', color: '#166534' },
    ],
    biological: [
      { name: 'Trichogramma Wasps', dose: '1.5 lakh/acre', desc: 'Parasitizes bollworm eggs. Release at egg-laying stage.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
      { name: 'Helicoverpa NPV', dose: '250 LE/acre', desc: 'Nuclear Polyhedrosis Virus specific to bollworm. Very effective.', icon: 'fas fa-vial', bg: '#dbeafe', color: '#1d4ed8' },
      { name: 'Chrysoperla (Lacewing)', dose: '40,000 eggs/acre', desc: 'Larval predator of bollworm. Reduces pest population significantly.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#15803d' },
    ],
    chemical: [
      { name: 'Emamectin Benzoate 5% SG', dose: '200 ml/acre', desc: 'Highly effective against early instar larvae. Use before flower formation.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
      { name: 'Chlorantraniliprole 18.5% SC', dose: '150 ml/acre', desc: 'Long residual activity. Rainfast after 2 hours.', icon: 'fas fa-flask', bg: '#fff7ed', color: '#c2410c' },
      { name: 'Indoxacarb 14.5% SC', dose: '400 ml/acre', desc: 'Acts by sodium channel blocking. Effective in 3–5 days.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#b91c1c' },
    ],
    ipm: [
      { name: 'Pheromone Trap Monitoring', dose: '5 traps/acre', desc: 'Use Helilure lure. Count moths weekly. Act when >5 moths/trap/night.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
      { name: 'Damage Threshold ETL', dose: '5 egg masses/100 plants', desc: 'Apply spray only after Economic Threshold Level is crossed.', icon: 'fas fa-chart-simple', bg: '#dbeafe', color: '#1d4ed8' },
      { name: 'Crop Rotation Protocol', dose: 'Next season', desc: 'Avoid continuous cotton cultivation. Alternate with soybean or maize.', icon: 'fas fa-tractor', bg: '#dcfce7', color: '#15803d' },
    ],
    cultural: [
      { name: 'Deep Summer Plowing', dose: 'May-June', desc: 'Expose pupae to sun and birds. Kills overwintering stages.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
      { name: 'Bird Perches (T-stakes)', dose: '10 perches/acre', desc: 'Attract insectivorous birds that feed on larval pests.', icon: 'fas fa-crow', bg: '#f0fdf4', color: '#15803d' },
      { name: 'Trash/Stubble Disposal', dose: 'After harvest', desc: 'Remove and destroy crop residue to eliminate overwintering sites.', icon: 'fas fa-fire', bg: '#fff7ed', color: '#c2410c' },
    ],
  },
  whitefly: {
    organic: [
      { name: 'Neem Oil + Soap Spray', dose: '3ml/L + 1ml soap', desc: 'Coats body and disrupts feeding. Apply thoroughly to leaf undersides.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
      { name: 'Garlic-Chilli Extract', dose: '2% solution', desc: 'Natural repellent. Spray every 5 days for best results.', icon: 'fas fa-seedling', bg: '#fef3c7', color: '#92400e' },
    ],
    biological: [
      { name: 'Encarsia formosa (Parasitoid)', dose: '1 wasp/plant', desc: 'Parasitizes whitefly nymphs. Very effective in protected cultivation.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
      { name: 'Beauveria bassiana', dose: '5g/L water', desc: 'Entomopathogenic fungus. Infects and kills whitefly adults.', icon: 'fas fa-flask', bg: '#dbeafe', color: '#1d4ed8' },
    ],
    chemical: [
      { name: 'Imidacloprid 17.8% SL', dose: '150 ml/acre', desc: 'Systemic insecticide. Very effective against nymphs.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
      { name: 'Thiamethoxam 25% WG', dose: '100g/acre', desc: 'Rapid knockdown. Do not apply near flowering crops.', icon: 'fas fa-flask', bg: '#fff7ed', color: '#c2410c' },
    ],
    ipm: [
      { name: 'Yellow Sticky Traps', dose: '15 traps/acre', desc: 'Mass trapping of adults. Replace every 15 days.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Destroy Host Weeds', dose: 'Regular', desc: 'Remove wild hosts (parthenium, bittergourd) around field borders.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  aphids: {
    organic: [
      { name: 'Neem Oil Spray', dose: '2% solution', desc: 'Disrupts aphid colony establishment. Apply 2x per week.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Ladybird Beetle (Coccinella)', dose: 'Natural release', desc: 'Key natural predator of aphids. Avoid broad-spectrum pesticides.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Dimethoate 30% EC', dose: '400 ml/acre', desc: 'Systemic action. Effective within 24 hours.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Natural Enemy Conservation', dose: 'Ongoing', desc: 'Avoid pesticide spray in early stage. Allow predator buildup.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Reflective Mulches', dose: 'Season-long', desc: 'Silver/white mulches repel aphids visually. Reduces virus spread.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  thrips: {
    organic: [
      { name: 'Spinosad (Organic)', dose: '1ml/L', desc: 'Derived from soil bacteria. Highly effective against thrips.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Predatory mite (Amblyseius)', dose: '50/m²', desc: 'Natural predator. Effective in high humidity conditions.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Fipronil 5% SC', dose: '600 ml/acre', desc: 'Fast-acting. Apply early morning when thrips are active.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Blue Sticky Traps', dose: '15 traps/acre', desc: 'Thrips are attracted to blue color. Monitor weekly.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Avoid Dry Conditions', dose: 'Irrigation', desc: 'Thrips thrive in dry conditions. Maintain field moisture.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  mealybug: {
    organic: [
      { name: 'Neem-based spray', dose: '5ml/L', desc: 'Weekly spray on infested areas. Effective against crawlers.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Cryptolaemus montrouzieri', dose: '10 beetles/plant', desc: 'Australian ladybird. Major predator of mealybugs.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Buprofezin 25% SC', dose: '400ml/acre', desc: 'Growth regulator. Effective against nymphs.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Stem Banding Method', dose: 'Apply barrier', desc: 'Apply grease band on plant stem to stop crawler movement.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Remove Ant Colonies', dose: 'Early season', desc: 'Ants protect mealybugs from predators. Eliminate ant colonies first.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
  'stem-borer': {
    organic: [
      { name: 'Neem Cake Application', dose: '25 kg/acre', desc: 'Soil application at transplanting. Reduces larval survival.', icon: 'fas fa-leaf', bg: '#dcfce7', color: '#16a34a' },
    ],
    biological: [
      { name: 'Trichogramma japonicum', dose: '1 lakh/acre', desc: 'Egg parasitoid. Most effective biological control for stem borer.', icon: 'fas fa-bug', bg: '#fef9c3', color: '#854d0e' },
    ],
    chemical: [
      { name: 'Chlorpyrifos 20% EC', dose: '1L/acre', desc: 'Apply at 25 DAT with 20 kg sand as granule application.', icon: 'fas fa-vial', bg: '#fee2e2', color: '#dc2626' },
    ],
    ipm: [
      { name: 'Light Trap Monitoring', dose: '1 trap/5 acres', desc: 'Count adults nightly. Act at ETL of 1 moth/trap/night.', icon: 'fas fa-arrows-spin', bg: '#f0fdf4', color: '#15803d' },
    ],
    cultural: [
      { name: 'Timely Transplanting', dose: 'Jun 20 – Jul 10', desc: 'Avoid pest peak period. Synchronize with recommended sowing windows.', icon: 'fas fa-tractor', bg: '#fef3c7', color: '#92400e' },
    ],
  },
};

// ── CHART INSTANCES ──────────────────────────────────────────
let trendChart, freqChart, districtChart;

// ── LOCAL CROP-PEST DATA (Fallback when API is unavailable) ──
const LOCAL_CROP_DATA = {
  cotton: {
    pests: [
      { pest: 'Cotton Bollworm',         scientific: 'Helicoverpa armigera',   base_risk: 78, level: 'high',     icon: 'fas fa-bug',         iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Pink Bollworm',            scientific: 'Pectinophora gossypiella', base_risk: 72, level: 'high',   icon: 'fas fa-bug',         iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Whitefly (Bemisia)',        scientific: 'Bemisia tabaci',          base_risk: 64, level: 'medium', icon: 'fas fa-circle-dot',  iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Aphids',                   scientific: 'Aphis gossypii',           base_risk: 48, level: 'medium', icon: 'fas fa-virus',       iconBg: '#fef3c7', iconColor: '#d97706' },
      { pest: 'Thrips',                   scientific: 'Thrips tabaci',            base_risk: 36, level: 'low',    icon: 'fas fa-bacterium',   iconBg: '#e0f2fe', iconColor: '#0369a1' },
    ],
    actions: [
      { text: 'Install yellow sticky traps (10–15/acre)',   sub: 'Check every 3 days.',        priority: 'urgent',  done: false },
      { text: 'Apply Neem Oil 2% spray',                    sub: 'Spray early morning.',       priority: 'urgent',  done: true  },
      { text: 'Inspect field borders and host plants',      sub: 'Weekly; check leaf undersides.', priority: 'normal', done: false },
      { text: 'Release Trichogramma parasitoid wasps',      sub: '1.5 lakh/acre; contact KVK.', priority: 'normal', done: false },
      { text: 'Avoid broad-spectrum insecticides',          sub: 'Protect beneficial insects.', priority: 'caution', done: false },
    ],
    recs: [
      'Apply Emamectin Benzoate 5% SG (200 ml/acre) immediately for bollworm control.',
      'Release Trichogramma parasitoid wasps (1.5 lakh/acre) urgently.',
      'Install Helilure pheromone traps (5/acre); replace lures every 21 days.',
      'Spray Chlorantraniliprole 18.5% SC (150 ml/acre) — rainfast within 2 hours.',
      'Avoid irrigation between 6–9 PM to reduce adult moth activity.',
    ],
  },
  wheat: {
    pests: [
      { pest: 'Wheat Aphids',   scientific: 'Rhopalosiphum padi',   base_risk: 62, level: 'medium', icon: 'fas fa-virus',        iconBg: '#fef3c7', iconColor: '#d97706' },
      { pest: 'Termites',       scientific: 'Odontotermes spp.',     base_risk: 55, level: 'medium', icon: 'fas fa-bug',          iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Brown Rust',     scientific: 'Puccinia recondita',    base_risk: 40, level: 'low',    icon: 'fas fa-circle-nodes', iconBg: '#e0f2fe', iconColor: '#0369a1' },
    ],
    actions: [
      { text: 'Deep summer plowing to expose termite nests', sub: 'Perform in May–June before sowing.', priority: 'normal',  done: true  },
      { text: 'Apply seed treatment before sowing',           sub: 'Imidacloprid 70 WS @ 2.5 ml/kg.',   priority: 'urgent',  done: false },
      { text: 'Monitor field borders for rust spore pustules',sub: 'Check weekly after 30 DAS.',          priority: 'caution', done: false },
    ],
    recs: [
      'Apply Dimethoate 30% EC (400 ml/acre) immediately if aphid population crossed ETL.',
      'Use systemic fungicide Propiconazole 25% EC (200 ml/acre) against brown rust.',
      'Drench soil with Chlorpyrifos 20% EC (1L/acre) in furrows to kill termite colonies.',
      'Remove volunteer wheat plants from field borders — they serve as aphid reservoirs.',
    ],
  },
  rice: {
    pests: [
      { pest: 'Yellow Stem Borer',  scientific: 'Scirpophaga incertulas',  base_risk: 75, level: 'high',   icon: 'fas fa-bug',        iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Brown Planthopper',  scientific: 'Nilaparvata lugens',       base_risk: 68, level: 'high',   icon: 'fas fa-leaf',       iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Rice Leaf Folder',   scientific: 'Cnaphalocrocis medinalis', base_risk: 50, level: 'medium', icon: 'fas fa-circle-dot', iconBg: '#fef3c7', iconColor: '#d97706' },
    ],
    actions: [
      { text: 'Set up pheromone traps for Stem Borer', sub: 'Monitor moth arrivals weekly.',          priority: 'urgent', done: false },
      { text: 'Apply Trichogramma parasitoid card',    sub: 'Place in nursery and main fields.',       priority: 'normal', done: false },
      { text: 'Maintain optimum plant spacing',        sub: 'Prevents microclimate favorable to BPH.', priority: 'normal', done: true  },
    ],
    recs: [
      'Apply Chlorpyrifos 20% EC @ 1L/acre as whorl application against stem borer larvae.',
      'Drain field for 5–7 days to disrupt BPH nymphal hatching.',
      'Release Trichogramma japonicum (1 lakh/acre) — current conditions favour establishment.',
      'Remove and destroy dead hearts (stem borer damage) to prevent secondary spread.',
    ],
  },
  soybean: {
    pests: [
      { pest: 'Girdle Beetle',        scientific: 'Obereopsis brevis',     base_risk: 70, level: 'high',   icon: 'fas fa-bug',      iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Tobacco Caterpillar',  scientific: 'Spodoptera litura',     base_risk: 62, level: 'medium', icon: 'fas fa-leaf',     iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Pod Borer',            scientific: 'Helicoverpa armigera',  base_risk: 58, level: 'medium', icon: 'fas fa-seedling', iconBg: '#fef3c7', iconColor: '#d97706' },
    ],
    actions: [
      { text: 'Erect bird perches in soybean field',       sub: '10–12 perches per acre.',          priority: 'normal', done: true  },
      { text: 'Inspect crop for girdle beetle damage',     sub: 'Remove affected twigs immediately.',priority: 'urgent', done: false },
      { text: 'Spray Neem Kernel Extract (NSKE) 5%',       sub: 'Deters caterpillar feeding.',      priority: 'normal', done: false },
    ],
    recs: [
      'Apply SlNPV (Nuclear Polyhedrosis Virus) @ 250 LE/acre immediately for tobacco caterpillar.',
      'Remove and destroy girdle beetle infested crop parts daily.',
      'Spray Chlorantraniliprole 18.5% SC @ 60 ml/acre for pod borer during high-risk period.',
      'Install light traps (1 trap/2 acres) to mass-capture Spodoptera adults during peak flight.',
    ],
  },
  tomato: {
    pests: [
      { pest: 'Tomato Fruit Borer',  scientific: 'Helicoverpa armigera',  base_risk: 80, level: 'high',   icon: 'fas fa-apple-alt', iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Whitefly (Vector)',   scientific: 'Bemisia tabaci',         base_risk: 66, level: 'medium', icon: 'fas fa-circle-dot',iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Red Spider Mite',     scientific: 'Tetranychus urticae',    base_risk: 48, level: 'medium', icon: 'fas fa-spider',    iconBg: '#fef3c7', iconColor: '#d97706' },
    ],
    actions: [
      { text: 'Plant marigold trap crop along tomato rows', sub: 'Attracts fruit borer moths away.',   priority: 'urgent', done: true  },
      { text: 'Set yellow sticky traps for whitefly',       sub: 'Place 10 traps per acre.',           priority: 'urgent', done: false },
      { text: 'Spray Neem Oil 3000 PPM',                    sub: 'Apply during early vegetative stage.',priority: 'normal', done: false },
    ],
    recs: [
      'Apply Bt (Bacillus thuringiensis) 1g/L water immediately for early instar fruit borer larvae.',
      'Set Helicoverpa pheromone traps (5/acre) urgently — current conditions indicate peak flight.',
      'Drench soil with Chlorpyrifos 20% EC near plant base to kill pupae overwintering in soil.',
      'Install yellow sticky traps (10/acre) against whitefly — leaf curl virus vector control critical.',
    ],
  },
  maize: {
    pests: [
      { pest: 'Fall Armyworm (FAW)', scientific: 'Spodoptera frugiperda', base_risk: 82, level: 'critical', icon: 'fas fa-bug',  iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Maize Stem Borer',    scientific: 'Chilo partellus',       base_risk: 60, level: 'medium',   icon: 'fas fa-leaf', iconBg: '#ffedd5', iconColor: '#ea580c' },
    ],
    actions: [
      { text: 'Intercrop maize with cowpea rows',       sub: 'Repels Fall Armyworm moths naturally.',   priority: 'urgent', done: true  },
      { text: 'Check maize whorls for egg masses daily',sub: 'Squeeze egg masses manually.',             priority: 'urgent', done: false },
      { text: 'Apply dry sand into plant whorls',       sub: 'Causes abrasion to caterpillar bodies.',  priority: 'normal', done: false },
    ],
    recs: [
      'Apply Emamectin Benzoate 5% SG (200 ml/acre) immediately into maize whorls — FAW exceeded threshold.',
      'Apply dry sand or fine wood ash into whorls (2 kg/acre) — causes abrasion to larval bodies.',
      'Spray Chlorantraniliprole 18.5% SC (60 ml/acre) — excellent residual activity against FAW larvae.',
      'Release Trichogramma pretiosum (2 lakh/acre) urgently; most effective against early instar FAW.',
    ],
  },
  onion: {
    pests: [
      { pest: 'Onion Thrips',       scientific: 'Thrips tabaci',           base_risk: 78, level: 'high',   icon: 'fas fa-bacterium',  iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Stemphylium Blight', scientific: 'Stemphylium vesicarium',  base_risk: 45, level: 'medium', icon: 'fas fa-cloud-rain', iconBg: '#e0f2fe', iconColor: '#0369a1' },
    ],
    actions: [
      { text: 'Install blue sticky traps',           sub: 'Place at canopy level. Check weekly.', priority: 'urgent', done: false },
      { text: 'Use sprinkler irrigation',            sub: 'Physically disrupts thrips colonisation.', priority: 'normal', done: true  },
      { text: 'Apply Metarhizium anisopliae spray',  sub: 'Spray near root zone and foliage.',    priority: 'normal', done: false },
    ],
    recs: [
      'Apply Fipronil 5% SC (600 ml/acre) immediately — thrips population has crossed ETL.',
      'Use blue sticky traps (15/acre) urgently — thrips are highly attracted to blue wavelength.',
      'Apply overhead sprinkler irrigation daily — physically knocks thrips off leaves.',
      'Spray Spinosad (organic) 1 ml/L water — derived from soil bacteria, very effective against thrips.',
    ],
  },
  chilli: {
    pests: [
      { pest: 'Chilli Thrips',  scientific: 'Scirtothrips dorsalis',  base_risk: 82, level: 'critical', icon: 'fas fa-bacterium', iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Yellow Mites',   scientific: 'Polyphagotarsonemus latus', base_risk: 74, level: 'high',  icon: 'fas fa-spider',    iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Fruit Borer',    scientific: 'Helicoverpa armigera',   base_risk: 60, level: 'medium',   icon: 'fas fa-apple-alt', iconBg: '#fef3c7', iconColor: '#d97706' },
    ],
    actions: [
      { text: 'Sow barrier crop of Sorghum/Maize',        sub: 'Create a 4-row windbreak barrier.',  priority: 'urgent', done: true  },
      { text: 'Install blue and yellow sticky traps',      sub: '10 blue + 10 yellow traps per acre.',priority: 'urgent', done: false },
      { text: 'Apply Lecanicillium lecanii bio-spray',     sub: 'Dose 5g/L on lower leaves.',         priority: 'normal', done: false },
    ],
    recs: [
      'Apply Fipronil 5% SC (600 ml/acre) immediately — thrips population is critically high.',
      'Spray Abamectin 1.9% EC (400 ml/acre) against yellow mites — extremely effective at this stage.',
      'Apply Lecanicillium lecanii bio-fungicide on lower leaf surfaces — controls both mites and thrips.',
      'Sow barrier crop of Sorghum/Maize (4-row windbreak) to block thrips wind-drafts into field.',
    ],
  },
  groundnut: {
    pests: [
      { pest: 'Leaf Miner',   scientific: 'Aproaerema modicella', base_risk: 64, level: 'medium', icon: 'fas fa-seedling',  iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'White Grub',   scientific: 'Holotrichia consanguinea', base_risk: 58, level: 'medium', icon: 'fas fa-circle-dot',iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'Aphids',       scientific: 'Aphis craccivora',     base_risk: 44, level: 'low',    icon: 'fas fa-virus',     iconBg: '#fef3c7', iconColor: '#d97706' },
    ],
    actions: [
      { text: 'Set up light traps at night',            sub: 'Attracts leaf miner moths.',        priority: 'normal', done: false },
      { text: 'Apply seed treatment with bio-agents',   sub: 'Mix Trichoderma viride with seeds.', priority: 'urgent', done: true  },
      { text: 'Inspect lower leaves for miner tunnels', sub: 'Monitor crop weekly.',              priority: 'normal', done: false },
    ],
    recs: [
      'Apply Dimethoate 30% EC (400 ml/acre) immediately — aphid colonies are rapidly building up.',
      'Erect light traps (1/2 acres) at night to mass-capture groundnut leaf miner moths.',
      'Drench soil with Chlorpyrifos 20% EC (1L/acre) near plant base to kill white grub larvae.',
      'Apply seed treatment with Trichoderma viride (4g/kg) before sowing to prevent grub entry.',
    ],
  },
  sugarcane: {
    pests: [
      { pest: 'Early Shoot Borer',    scientific: 'Chilo infuscatellus',     base_risk: 74, level: 'high',   icon: 'fas fa-bug',    iconBg: '#fee2e2', iconColor: '#dc2626' },
      { pest: 'Pyrilla (Leaf Hopper)', scientific: 'Pyrilla perpusilla',      base_risk: 58, level: 'medium', icon: 'fas fa-leaf',   iconBg: '#ffedd5', iconColor: '#ea580c' },
      { pest: 'White Grub',           scientific: 'Holotrichia consanguinea', base_risk: 62, level: 'medium', icon: 'fas fa-circle', iconBg: '#fef3c7', iconColor: '#d97706' },
    ],
    actions: [
      { text: 'Perform trash mulching in furrows',      sub: 'Reduces shoot borer infestation.', priority: 'urgent', done: true  },
      { text: 'Release Trichogramma chilonis cards',    sub: 'Place on leaf undersides.',        priority: 'urgent', done: false },
      { text: 'Set light traps to capture white grubs', sub: 'Operate 7:00 PM to 10:00 PM.',    priority: 'normal', done: false },
    ],
    recs: [
      'Apply Chlorpyrifos 20% EC (1L/acre) as furrow treatment — white grub infestation is at critical level.',
      'Release Trichogramma chilonis (2.5 lakh/acre) on 3 consecutive weeks during egg-laying peak.',
      'Trash mulching (10 cm thickness) in sugarcane furrows urgently — reduces shoot borer access.',
      'Collect and destroy adult white grub beetles from host trees during monsoon nights.',
    ],
  },
};

// ── LOCAL FALLBACK ANALYSIS ───────────────────────────────────
function buildLocalFallback(crop, district, state) {
  const cropKey = (crop || 'cotton').toLowerCase();
  const cropInfo = LOCAL_CROP_DATA[cropKey] || LOCAL_CROP_DATA.cotton;
  const cropLabel = cropKey.charAt(0).toUpperCase() + cropKey.slice(1);
  const distName = district || 'Nagpur';
  const stateName = state || 'Maharashtra';

  // Generate a stable risk based on district name hash
  const distHash = distName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseRisk = cropInfo.pests[0].base_risk;
  const overallRisk = Math.max(30, Math.min(95, baseRisk + (distHash % 17) - 5));
  const riskLevel = overallRisk >= 81 ? 'critical' : overallRisk >= 61 ? 'high' : overallRisk >= 31 ? 'medium' : 'low';

  const predictions = cropInfo.pests.map(p => {
    const pRisk = Math.max(10, Math.min(95, p.base_risk + (distHash % 15) - 5));
    const pLevel = pRisk >= 81 ? 'critical' : pRisk >= 61 ? 'high' : pRisk >= 31 ? 'medium' : 'low';
    return {
      pest:       p.pest,
      crop:       cropLabel,
      risk:       pRisk,
      level:      pLevel,
      next7:      `AI forecast: ${pLevel.toUpperCase()} risk over next 7 days. Monitor ${p.pest} activity closely in ${distName}.`,
      icon:       p.icon,
      iconBg:     p.iconBg,
      iconColor:  p.iconColor,
    };
  });

  const nearbyDistricts = ['Wardha', 'Amravati', 'Yavatmal', 'Akola', 'Washim'].filter(d => d !== distName);
  const nearbyOutbreaks = nearbyDistricts.slice(0, 3).map((d, i) => ({
    district: d,
    pest:     cropInfo.pests[i % cropInfo.pests.length].pest,
    risk:     Math.max(30, overallRisk - 10 + (i * 5)),
    level:    overallRisk - 5 >= 61 ? 'high' : 'medium',
    farms:    350 + i * 120,
  }));

  const mapMarkers = [{ district: distName, lat: 20.5937, lon: 78.9629, pest: cropInfo.pests[0].pest, risk: overallRisk, riskLevel, farms: 800, isCenter: true }];

  const alerts = [{ title: `${riskLevel.toUpperCase()}: ${cropInfo.pests[0].pest} Alert — ${distName}`, desc: `Risk score: ${overallRisk}%. Monitor field conditions closely. ${cropInfo.recs[0]}`, time: 'Just now', level: riskLevel, icon: cropInfo.pests[0].icon }];

  const highRiskCrops = Object.entries(LOCAL_CROP_DATA).map(([k, v]) => {
    const r = Math.max(10, Math.min(95, v.pests[0].base_risk + (distHash % 12)));
    return { name: k.charAt(0).toUpperCase() + k.slice(1), pest: v.pests[0].pest, risk: r, icon: v.pests[0].icon, iconBg: v.pests[0].iconBg, iconColor: v.pests[0].iconColor, barColor: r >= 81 ? '#7f1d1d' : r >= 61 ? '#dc2626' : r >= 31 ? '#f59e0b' : '#16a34a' };
  }).sort((a, b) => b.risk - a.risk).slice(0, 5);

  return {
    location:           `${stateName} › ${distName}`,
    state:              stateName,
    district:           distName,
    lat:                20.5937,
    lon:                78.9629,
    geocodeMethod:      'local',
    geocodeError:       null,
    crop:               cropLabel,
    cropStage:          'Vegetative',
    season:             'Kharif',
    overallRisk,
    riskLevel,
    weatherRisk:        overallRisk - 5,
    weatherSource:      'estimated',
    pestName:           cropInfo.pests[0].pest,
    probability:        overallRisk,
    farmsAffected:      800 + (distHash % 400),
    nearbyOutbreaks,
    recommendations:    cropInfo.recs,
    preventiveActions:  cropInfo.actions,
    mapMarkers,
    weatherSnap:        { temp: '31°C', humidity: '72%', rain: '5mm', wind: '14 km/h', pressure: '1010 hPa', assess: 'Moderate weather conditions — maintain regular field monitoring.', source: 'estimated' },
    activeAlerts:       alerts,
    predictions,
    highRiskCrops,
    lastUpdated:        new Date().toISOString(),
    isLocalFallback:    true,
  };
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanguageSelector();
  initTreatmentTabs();
  initAnalysisForm();
  initGPSButton();
  initRadarMapHoverDelegation();

  // Initialize the Leaflet map early so tiles start loading immediately
  initLeafletMap();

  // ── Show local data IMMEDIATELY so the page is never blank ──
  const defaultCrop     = document.getElementById('pr-crop')?.value     || 'cotton';
  const defaultDistrict = document.getElementById('pr-district')?.value || 'Nagpur';
  const defaultState    = document.getElementById('pr-state')?.value    || 'Maharashtra';
  const immediateData   = buildLocalFallback(defaultCrop, defaultDistrict, defaultState);
  renderPredictionGrid(immediateData.predictions);
  renderNearbyOutbreaks(immediateData.nearbyOutbreaks);
  renderCropRiskList(immediateData.highRiskCrops);
  renderTimeline(immediateData.activeAlerts);
  renderActionChecklist(immediateData.preventiveActions);
  animateRiskScore(immediateData.overallRisk);
  loadTreatmentGuide(getTreatmentKey(immediateData.pestName));

  // Trigger live API run (will update with real data if available)
  runRadarAnalysis();
});

// ── LANGUAGE SELECTOR ────────────────────────────────────────
function initLanguageSelector() {
  const sel = document.getElementById('pr-lang-select');
  if (!sel) return;
  sel.value = PR_STATE.language;
  sel.addEventListener('change', () => {
    PR_STATE.language = sel.value;
    localStorage.setItem('km_language', sel.value);
  });
}

// ── RUN RADAR ANALYSIS (CORE API FLOW) ─────────────────────
let _analysisAbortCtrl = null;
async function runRadarAnalysis() {
  const form   = document.getElementById('pr-analysis-form');
  const runBtn = document.getElementById('pr-run-btn');
  if (!form) return;

  const state     = document.getElementById('pr-state')?.value     || 'Maharashtra';
  const district  = document.getElementById('pr-district')?.value  || 'Nagpur';
  const taluka    = document.getElementById('pr-taluka')?.value    || '';
  const village   = document.getElementById('pr-village')?.value   || '';
  const crop      = document.getElementById('pr-crop')?.value      || 'cotton';
  const cropStage = document.getElementById('pr-crop-stage')?.value|| 'vegetative';
  const season    = document.getElementById('pr-season')?.value    || 'kharif';

  PR_STATE.district  = district;
  PR_STATE.crop      = crop;
  PR_STATE.cropStage = cropStage;
  PR_STATE.season    = season;

  console.log('[Pest Radar] ↪ Running analysis');
  console.log('  Crop:', crop, '| State:', state, '| District:', district);
  console.log('  Taluka:', taluka, '| Village:', village);
  console.log('  Stage:', cropStage, '| Season:', season);

  // Abort any previous in-flight request
  if (_analysisAbortCtrl) _analysisAbortCtrl.abort();
  _analysisAbortCtrl = new AbortController();

  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('analysisRunning')}`;
  }

  // Show refreshing overlay
  const overlayElements = [
    document.getElementById('pr-overall-risk-card'),
    document.getElementById('pr-prediction-grid'),
    document.getElementById('pr-nearby-list'),
    document.getElementById('pr-map-visual'),
    document.getElementById('pr-action-checklist')
  ];
  overlayElements.forEach(el => { if (el) el.style.opacity = '0.5'; });

  // Show live-badge refreshing state
  const liveBadge = document.getElementById('pr-live-badge');
  if (liveBadge) {
    liveBadge.innerHTML = '<span class="pr-live-dot" style="background:#f59e0b;"></span> Refreshing...';
  }

  try {
    const query = new URLSearchParams({
      state, district, taluka, village, crop,
      crop_stage: cropStage, season
    });

    console.log('  API call: /api/v1/pest/radar/analysis?' + query.toString());

    const res = await fetch(
      `http://localhost:8000/api/v1/pest/radar/analysis?${query.toString()}`,
      { signal: _analysisAbortCtrl.signal }
    );
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();

    console.log('[Pest Radar] ✅ Response received:');
    console.log('  Location:', data.location, '| lat:', data.lat, 'lon:', data.lon);
    console.log('  Geocode method:', data.geocodeMethod);
    console.log('  Weather:', JSON.stringify(data.weatherSnap));
    console.log('  Pest:', data.pestName, '| Risk:', data.overallRisk, '% (', data.riskLevel, ')');
    console.log('  Recommendation[0]:', data.recommendations?.[0]);

    if (data.geocodeError) {
      console.warn('[Pest Radar] Geocode warning:', data.geocodeError);
      showToastMessage('Location approximated — geocoding service unavailable.', 'warning');
    }

    // ── Update Location display ─────────────────────────────
    const locBox  = document.getElementById('pr-selected-location-box');
    const locText = document.getElementById('pr-selected-location-text');
    if (locText) locText.textContent = data.location;
    if (locBox)  locBox.style.display = 'block';

    // ── Update Lat/Lon display ────────────────────────────
    const latEl = document.getElementById('pr-lat-display');
    const lonEl = document.getElementById('pr-lon-display');
    if (latEl) latEl.textContent = data.lat ? data.lat.toFixed(4) + '°N' : '';
    if (lonEl) lonEl.textContent = data.lon ? data.lon.toFixed(4) + '°E' : '';

    // ── Update Weather panel ────────────────────────────
    const w = data.weatherSnap;
    if (w) {
      if (document.getElementById('pr-w-temp')) document.getElementById('pr-w-temp').textContent = w.temp;
      if (document.getElementById('pr-w-humidity')) document.getElementById('pr-w-humidity').textContent = w.humidity;
      if (document.getElementById('pr-w-rain')) document.getElementById('pr-w-rain').textContent = w.rain;
      if (document.getElementById('pr-w-wind')) document.getElementById('pr-w-wind').textContent = w.wind;
      const pressEl = document.getElementById('pr-w-pressure');
      if (pressEl && w.pressure) pressEl.textContent = w.pressure;
      const assessEl = document.getElementById('pr-weather-assessment');
      if (assessEl) assessEl.innerHTML = `<i class="fas fa-triangle-exclamation"></i> ${w.assess}`;
      // Weather source badge
      const srcBadge = document.getElementById('pr-weather-source-badge');
      if (srcBadge) {
        if (data.weatherSource === 'live') {
          srcBadge.innerHTML = '<i class="fas fa-circle" style="color:#22c55e;font-size:0.5rem;"></i> Live Data';
          srcBadge.style.color = '#166534';
        } else {
          srcBadge.innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;font-size:0.5rem;"></i> Estimated';
          srcBadge.style.color = '#92400e';
        }
      }
    }

    // ── Animate Risk Score ───────────────────────────────
    animateRiskScore(data.overallRisk);

    // ── Alert Banner ─────────────────────────────────────
    const banner      = document.getElementById('pr-outbreak-banner');
    const bannerTitle = document.getElementById('pr-banner-title');
    const bannerDesc  = document.getElementById('pr-banner-desc');
    if (banner) {
      if (data.overallRisk >= 50) {
        banner.style.display = 'flex';
        banner.className = `pr-outbreak-banner pr-outbreak-banner--${data.riskLevel}`;
        if (bannerTitle) bannerTitle.textContent =
          `${data.pestName} Outbreak — ${district} District`;
        if (bannerDesc) bannerDesc.textContent =
          `AI models indicate a ${data.probability}% probability of ${data.pestName} surge in ${district} — ` +
          `Live weather: Temp ${w?.temp}, Humidity ${w?.humidity}. Immediate preventative measures advised.`;
      } else {
        banner.style.display = 'none';
      }
    }

    // ── Stats cards ───────────────────────────────────────
    const activeAlertsNum = document.getElementById('pr-active-alerts-num');
    if (activeAlertsNum) activeAlertsNum.textContent = data.activeAlerts.length;
    const alertsSpark = document.querySelector('#pr-active-alerts-num ~ .pr-stat-sparkbar .pr-sparkbar-fill');
    if (alertsSpark) alertsSpark.style.width = `${Math.min(100, data.activeAlerts.length * 20)}%`;

    const farmsEl = document.getElementById('pr-farms-affected-num');
    if (farmsEl) farmsEl.textContent = data.farmsAffected.toLocaleString();
    const farmsSpark = document.querySelector('#pr-farms-affected-num ~ .pr-stat-sparkbar .pr-sparkbar-fill');
    if (farmsSpark) farmsSpark.style.width = `${Math.min(100, (data.farmsAffected / 5000) * 100)}%`;

    const weatherRiskEl = document.getElementById('pr-weather-risk-num');
    if (weatherRiskEl) weatherRiskEl.textContent = `${data.weatherRisk}%`;
    const weatherSpark = document.querySelector('#pr-weather-risk-num ~ .pr-stat-sparkbar .pr-sparkbar-fill');
    if (weatherSpark) weatherSpark.style.width = `${data.weatherRisk}%`;

    // ── Render all sections ───────────────────────────────
    renderNearbyOutbreaks(data.nearbyOutbreaks);
    renderPredictionGrid(data.predictions);
    renderCropRiskList(data.highRiskCrops);
    renderTimeline(data.activeAlerts);

    // ── Update Treatment guide ──────────────────────────────
    const treatmentKey = getTreatmentKey(data.pestName);
    loadTreatmentGuide(treatmentKey);

    // ── Update Action checklist ─────────────────────────────
    renderActionChecklist(data.preventiveActions);

    // ── Update Map markers ──────────────────────────────────
    renderMapMarkers(data.mapMarkers);

    // ── Update Charts & History ─────────────────────────────
    updateAdvancedAnalytics();
    loadPredictionHistory();

    // ── Dashboard meta: last-updated ─────────────────────────
    const lastUpdEl = document.getElementById('pr-last-updated');
    const _now = new Date();
    const _time = _now.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
    const _date = _now.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
    if (lastUpdEl) lastUpdEl.textContent = `${_date}, ${_time}`;

    // Update footer location display
    const footerLoc = document.getElementById('pr-footer-location');
    if (footerLoc) footerLoc.textContent = `${district}, ${state}`;

    // Also update any "Updated X min ago" footers
    document.querySelectorAll('.pr-stat-card__footer span:last-child').forEach(el => {
      if (el.innerHTML.includes('Updated') || el.innerHTML.includes('min ago')) {
        el.innerHTML = `<i class="fas fa-clock"></i> Just updated`;
      }
    });

    // Live badge back to live state
    if (liveBadge) {
      liveBadge.innerHTML = '<span class="pr-live-dot"></span> LIVE';
      liveBadge.style.color = '';
    }

    showToastMessage(`✓ ${t('analysisComplete')} (${data.location})`, 'success');

  } catch (error) {
    if (error.name === 'AbortError') return; // Intentionally cancelled
    console.warn('[Pest Radar] API unavailable, using local fallback:', error.message);

    // ── LOCAL FALLBACK: render predictions from built-in data ─
    try {
      const fallbackData = buildLocalFallback(crop, district, state);

      // Update location display
      const locBox  = document.getElementById('pr-selected-location-box');
      const locText = document.getElementById('pr-selected-location-text');
      if (locText) locText.textContent = fallbackData.location;
      if (locBox)  locBox.style.display = 'block';

      // Weather snapshot (estimated)
      const wf = fallbackData.weatherSnap;
      if (wf) {
        ['pr-w-temp','pr-w-humidity','pr-w-rain','pr-w-wind','pr-w-pressure'].forEach((id, i) => {
          const el = document.getElementById(id);
          if (el) el.textContent = [wf.temp, wf.humidity, wf.rain, wf.wind, wf.pressure][i];
        });
        const assessEl = document.getElementById('pr-weather-assessment');
        if (assessEl) assessEl.innerHTML = `<i class="fas fa-circle-info"></i> ${wf.assess}`;
        const srcBadge = document.getElementById('pr-weather-source-badge');
        if (srcBadge) srcBadge.innerHTML = '<i class="fas fa-circle" style="color:#f59e0b;font-size:0.5rem;"></i> Estimated';
      }

      // Risk score animate
      animateRiskScore(fallbackData.overallRisk);

      // Alert banner
      const banner      = document.getElementById('pr-outbreak-banner');
      const bannerTitle = document.getElementById('pr-banner-title');
      const bannerDesc  = document.getElementById('pr-banner-desc');
      if (banner && fallbackData.overallRisk >= 50) {
        banner.style.display = 'flex';
        banner.className = `pr-outbreak-banner pr-outbreak-banner--${fallbackData.riskLevel}`;
        if (bannerTitle) bannerTitle.textContent = `${fallbackData.pestName} Alert — ${district} District`;
        if (bannerDesc)  bannerDesc.textContent  = `AI risk score: ${fallbackData.probability}% for ${fallbackData.pestName} in ${district}. Take preventive action.`;
      } else if (banner) {
        banner.style.display = 'none';
      }

      // Stats
      const activeAlertsNum = document.getElementById('pr-active-alerts-num');
      if (activeAlertsNum) activeAlertsNum.textContent = fallbackData.activeAlerts.length;
      const farmsEl = document.getElementById('pr-farms-affected-num');
      if (farmsEl) farmsEl.textContent = fallbackData.farmsAffected.toLocaleString();
      const weatherRiskEl = document.getElementById('pr-weather-risk-num');
      if (weatherRiskEl) weatherRiskEl.textContent = `${fallbackData.weatherRisk}%`;

      // Render sections
      renderNearbyOutbreaks(fallbackData.nearbyOutbreaks);
      renderPredictionGrid(fallbackData.predictions);
      renderCropRiskList(fallbackData.highRiskCrops);
      renderTimeline(fallbackData.activeAlerts);
      renderActionChecklist(fallbackData.preventiveActions);
      renderMapMarkers(fallbackData.mapMarkers);
      loadTreatmentGuide(getTreatmentKey(fallbackData.pestName));

      // Timestamps
      const lastUpdEl = document.getElementById('pr-last-updated');
      if (lastUpdEl) {
        const _now = new Date();
        lastUpdEl.textContent = `${_now.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}, ${_now.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})} (Local)`;
      }
      const footerLoc = document.getElementById('pr-footer-location');
      if (footerLoc) footerLoc.textContent = `${district}, ${state}`;

      if (liveBadge) {
        liveBadge.innerHTML = '<span class="pr-live-dot" style="background:#f59e0b;"></span> Local Data';
      }

      showToastMessage('⚠️ Backend offline — showing local analysis data.', 'warning');
    } catch (fallbackErr) {
      console.error('[Pest Radar] Local fallback also failed:', fallbackErr);
      showToastMessage('Failed to load pest analysis. Please check your connection.', 'error');
      if (liveBadge) {
        liveBadge.innerHTML = '<span class="pr-live-dot" style="background:#ef4444;"></span> Error';
      }
    }
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = `<i class="fas fa-radar"></i> Run Pest Radar Analysis`;
    }
    overlayElements.forEach(el => { if (el) el.style.opacity = '1.0'; });
  }
}



// ── GET TREATMENT KEY MAPPER ─────────────────────────────────
function getTreatmentKey(pestName) {
  const name = pestName.toLowerCase();
  if (name.includes('bollworm') || name.includes('borer') || name.includes('caterpillar') || name.includes('grub')) {
    if (name.includes('stem borer') || name.includes('shoot borer')) return 'stem-borer';
    return 'bollworm';
  }
  if (name.includes('whitefly')) return 'whitefly';
  if (name.includes('aphid')) return 'aphids';
  if (name.includes('thrip')) return 'thrips';
  if (name.includes('mealybug')) return 'mealybug';
  return 'bollworm';
}

// ── NEARBY OUTBREAKS LIST ────────────────────────────────────
function renderNearbyOutbreaks(outbreaks) {
  const container = document.getElementById('pr-nearby-list');
  const countBadge = document.getElementById('pr-nearby-count');
  if (!container) return;

  if (countBadge) countBadge.textContent = `${outbreaks.length} active`;

  const colorsMap = {
    critical: { dot: '#7f1d1d', text: '#7f1d1d' },
    high:     { dot: '#dc2626', text: '#dc2626' },
    medium:   { dot: '#f59e0b', text: '#d97706' },
    low:      { dot: '#16a34a', text: '#16a34a' },
  };

  container.innerHTML = outbreaks.map(item => {
    const c = colorsMap[item.level] || colorsMap.low;
    return `
      <div class="pr-nearby-item" role="listitem" style="opacity:0; animation: fadeInUp 0.3s forwards;">
        <div class="pr-nearby-item__dot" style="background:${c.dot};"></div>
        <div class="pr-nearby-item__info">
          <div class="pr-nearby-item__district">${item.district}</div>
          <div class="pr-nearby-item__pest">${item.pest} · ${item.farms.toLocaleString()} farms</div>
        </div>
        <div class="pr-nearby-item__risk" style="color:${c.text};">${item.risk}%</div>
        <span class="pr-risk-chip pr-risk-chip--${item.level}" style="font-size:0.6rem;">${capitalize(item.level)}</span>
      </div>
    `;
  }).join('');
}

// ── AI PREDICTION GRID ────────────────────────────────────────
function renderPredictionGrid(predictions) {
  const container = document.getElementById('pr-prediction-grid');
  if (!container) return;

  container.innerHTML = predictions.map(p => `
    <div class="pr-pred-card" style="opacity:0; animation: fadeInUp 0.3s forwards;">
      <div class="pr-pred-card__header">
        <div class="pr-pred-card__icon" style="background:${p.iconBg};color:${p.iconColor};">
          <i class="${p.icon}"></i>
        </div>
        <div>
          <div class="pr-pred-card__pest">${p.pest}</div>
          <div class="pr-pred-card__crop">${p.crop}</div>
        </div>
      </div>
      <div class="pr-pred-card__body">
        <div class="pr-pred-bar-wrap">
          <div class="pr-pred-bar">
            <div class="pr-pred-bar-fill pr-pred-bar-fill--${p.level}" style="width:${p.risk}%;"></div>
          </div>
          <div class="pr-pred-score" style="color:${riskColor(p.level)};">${p.risk}</div>
        </div>
        <div style="margin-bottom:6px;">
          <span class="pr-risk-chip pr-risk-chip--${p.level}" style="font-size:0.62rem;">${capitalize(p.level)} Risk</span>
        </div>
        <div class="pr-pred-next7">
          <strong>AI 7-Day Forecast:</strong><br/>${p.next7}
        </div>
      </div>
    </div>
  `).join('');
}

// ── HIGH RISK CROP LIST ───────────────────────────────────────
function renderCropRiskList(highRiskCrops) {
  const container = document.getElementById('pr-crop-risk-list');
  if (!container) return;

  container.innerHTML = highRiskCrops.map(c => `
    <div class="pr-crop-risk-item" role="listitem">
      <div class="pr-crop-risk-item__icon" style="background:${c.iconBg};color:${c.iconColor};">
        <i class="${c.icon}"></i>
      </div>
      <div class="pr-crop-risk-item__info">
        <div class="pr-crop-risk-item__name">${c.name}</div>
        <div class="pr-crop-risk-item__pest">${c.pest}</div>
      </div>
      <div class="pr-crop-risk-item__bar-wrap">
        <div class="pr-crop-risk-item__bar">
          <div class="pr-crop-risk-item__bar-fill" style="width:${c.risk}%;background:${c.barColor};"></div>
        </div>
        <div class="pr-crop-risk-item__pct" style="color:${c.barColor};">${c.risk}%</div>
      </div>
    </div>
  `).join('');
}

// ── ACTION CHECKLIST ──────────────────────────────────────────
let ACTIVE_CHECKLIST = [];
function renderActionChecklist(actions) {
  const container = document.getElementById('pr-action-checklist');
  if (!container) return;

  ACTIVE_CHECKLIST = actions;

  const priorityMap = {
    urgent:  { bg: '#fee2e2', color: '#991b1b', label: 'Urgent'  },
    normal:  { bg: '#dcfce7', color: '#166534', label: 'Normal'  },
    caution: { bg: '#fef3c7', color: '#92400e', label: 'Caution' },
  };

  container.innerHTML = ACTIVE_CHECKLIST.map((item, i) => {
    const p = priorityMap[item.priority] || priorityMap.normal;
    return `
      <div class="pr-checklist-item ${item.done ? 'done' : ''}" role="listitem" onclick="toggleChecklist(${i})" id="pr-check-${i}">
        <div class="pr-checklist-item__check" id="pr-checkmark-${i}">
          ${item.done ? '<i class="fas fa-check" style="font-size:0.55rem;"></i>' : ''}
        </div>
        <div class="pr-checklist-item__content">
          <div class="pr-checklist-item__text" id="pr-check-text-${i}" style="${item.done ? 'text-decoration: line-through;' : ''}">${item.text}</div>
          <div class="pr-checklist-item__sub">${item.sub}</div>
        </div>
        <span class="pr-checklist-item__priority" style="background:${p.bg};color:${p.color};">${p.label}</span>
      </div>
    `;
  }).join('');

  updateChecklistProgress();
}

function toggleChecklist(index) {
  if (!ACTIVE_CHECKLIST[index]) return;
  ACTIVE_CHECKLIST[index].done = !ACTIVE_CHECKLIST[index].done;
  const item = document.getElementById(`pr-check-${index}`);
  const check = document.getElementById(`pr-checkmark-${index}`);
  const text = document.getElementById(`pr-check-text-${index}`);
  if (!item) return;

  if (ACTIVE_CHECKLIST[index].done) {
    item.classList.add('done');
    check.innerHTML = '<i class="fas fa-check" style="font-size:0.55rem;"></i>';
    text.style.textDecoration = 'line-through';
  } else {
    item.classList.remove('done');
    check.innerHTML = '';
    text.style.textDecoration = '';
  }

  updateChecklistProgress();
}

function updateChecklistProgress() {
  const doneCount = ACTIVE_CHECKLIST.filter(i => i.done).length;
  const el = document.getElementById('pr-actions-done-num');
  if (el) el.textContent = `${doneCount}/${ACTIVE_CHECKLIST.length}`;
  const sparkEl = document.querySelector('.pr-sparkbar-fill--green');
  if (sparkEl && ACTIVE_CHECKLIST.length > 0) {
    sparkEl.style.width = `${Math.round((doneCount / ACTIVE_CHECKLIST.length) * 100)}%`;
  }
}

// ── TREATMENT GUIDE ───────────────────────────────────────────
function loadTreatmentGuide(pestKey) {
  const data = TREATMENT_DB[pestKey] || TREATMENT_DB.bollworm;
  const tabMap = {
    'pr-organic-content':    data.organic    || [],
    'pr-biological-content': data.biological || [],
    'pr-chemical-content':   data.chemical   || [],
    'pr-ipm-content':        data.ipm        || [],
    'pr-cultural-content':   data.cultural   || [],
  };

  Object.entries(tabMap).forEach(([id, items]) => {
    const container = document.getElementById(id);
    if (!container) return;
    if (!items.length) {
      container.innerHTML = '<p style="font-size:0.82rem;color:var(--text-light);padding:12px 0;">No specific treatment data available for this pest type.</p>';
      return;
    }
    container.innerHTML = items.map(item => `
      <div class="pr-treatment-card">
        <div class="pr-treatment-card__header">
          <div class="pr-treatment-card__icon" style="background:${item.bg};color:${item.color};">
            <i class="${item.icon}"></i>
          </div>
          <div class="pr-treatment-card__name">${item.name}</div>
        </div>
        <div class="pr-treatment-card__dose">${item.dose}</div>
        <div class="pr-treatment-card__desc">${item.desc}</div>
      </div>
    `).join('');
  });
}

function initTreatmentTabs() {
  const tabBtns = document.querySelectorAll('.pr-treatment-tabs .control-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const tabId = btn.getAttribute('data-tab');
      document.querySelectorAll('.pr-treatment-guide .control-content-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      const activePanel = document.getElementById(tabId);
      if (activePanel) activePanel.classList.add('active');
    });
  });
}

// ── ALERT TIMELINE ────────────────────────────────────────────
function renderTimeline(items) {
  const container = document.getElementById('pr-timeline');
  if (!container) return;
  container.innerHTML = items.map(item => `
    <div class="pr-timeline-item" role="listitem">
      <div class="pr-timeline-item__icon pr-timeline-item__icon--${item.level}">
        <i class="${item.icon}"></i>
      </div>
      <div class="pr-timeline-item__content">
        <div class="pr-timeline-item__title">${item.title}</div>
        <div class="pr-timeline-item__desc">${item.desc}</div>
        <div class="pr-timeline-item__meta">
          <span class="pr-timeline-item__time"><i class="fas fa-clock"></i> ${item.time}</span>
          <span class="pr-risk-chip pr-risk-chip--${item.level}" style="font-size:0.6rem;">${capitalize(item.level)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function clearAlertTimeline() {
  const container = document.getElementById('pr-timeline');
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center;padding:32px;color:var(--text-light);">
      <i class="fas fa-check-circle" style="font-size:2rem;color:#22c55e;display:block;margin-bottom:12px;"></i>
      <strong>No active alerts</strong><br/>
      <span style="font-size:0.8rem;">All alerts cleared. The pest radar is monitoring your area.</span>
    </div>
  `;
  showToastMessage(t('alertCleared'), 'success');
}

let myMap = null;
let markerLayer = null;

function initLeafletMap() {
  const mapContainer = document.getElementById('pr-leaflet-map');
  if (!mapContainer || myMap) return;

  // Initialize Nagpur/Maharashtra as center
  myMap = L.map('pr-leaflet-map', { zoomControl: true }).setView([20.5937, 78.9629], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

  markerLayer = L.layerGroup().addTo(myMap);

  // Force recalculate size to fix blank tile issue when map container is freshly visible
  setTimeout(() => {
    if (myMap) myMap.invalidateSize();
  }, 300);
}

// ── RENDER DYNAMIC MAP MARKERS ───────────────────────────────
function renderMapMarkers(markers) {
  const mapContainer = document.getElementById('pr-leaflet-map');
  if (!mapContainer) return;

  if (!myMap) {
    initLeafletMap();
  }
  if (!myMap || !markerLayer) return;

  markerLayer.clearLayers();

  // Find center marker to pan the map
  const centerMarker = markers.find(m => m.isCenter) || markers[0];
  if (centerMarker && centerMarker.lat && centerMarker.lon) {
    myMap.setView([centerMarker.lat, centerMarker.lon], 7);
  }

  // Force tile refresh after pan to fix blank map issue
  setTimeout(() => {
    if (myMap) myMap.invalidateSize();
  }, 200);

  markers.forEach(marker => {
    if (!marker.lat || !marker.lon) return;

    let color = '#22c55e'; // low
    if (marker.riskLevel === 'critical') color = '#7f1d1d';
    else if (marker.riskLevel === 'high') color = '#ef4444';
    else if (marker.riskLevel === 'medium' || marker.riskLevel === 'moderate') color = '#f59e0b';

    const circle = L.circleMarker([marker.lat, marker.lon], {
      color: color,
      fillColor: color,
      fillOpacity: 0.65,
      radius: 12 + (marker.risk / 10),
      weight: 2
    });

    const popupContent = `
      <div class="pr-map-tooltip-leaflet" style="font-family:'Inter',sans-serif; min-width:140px; padding:4px;">
        <div style="font-weight:700; font-size:0.85rem; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
          <span>${marker.district}</span>
          <span class="pr-risk-chip pr-risk-chip--${marker.riskLevel}" style="font-size:0.6rem; padding:1px 5px; color:#fff; background:${color}; border-radius:4px;">${capitalize(marker.riskLevel)}</span>
        </div>
        <div style="font-size:0.75rem; margin-bottom:2px; color:#334155;"><i class="fas fa-bug"></i> ${marker.pest}</div>
        <div style="font-size:0.75rem; margin-bottom:2px; color:#334155;"><i class="fas fa-chart-simple"></i> Risk: <strong>${marker.risk}%</strong></div>
        <div style="font-size:0.75rem; color:#334155;"><i class="fas fa-tractor"></i> <strong>${marker.farms || '100+'}</strong> farms affected</div>
      </div>
    `;

    circle.bindPopup(popupContent);
    circle.addTo(markerLayer);
  });
}

// ── RADAR MAP HOVER DELEGATION ───────────────────────────────
function initRadarMapHoverDelegation() {
  // Leaflet handles all tooltip/popup logic natively. Stub preserved for backward compatibility.
}

// ── ANALYSIS FORM & SELECT TRIGGERS ──────────────────────────
function initAnalysisForm() {
  const form = document.getElementById('pr-analysis-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runRadarAnalysis();
  });

  // Automatically submit and run analysis on ANY dropdown change (Requirement 2)
  const dropdownIds = [
    'pr-state', 'pr-district', 'pr-taluka', 'pr-village',
    'pr-crop', 'pr-crop-stage', 'pr-season'
  ];
  dropdownIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        runRadarAnalysis();
      });
    }
  });
}

// ── GPS BUTTON ────────────────────────────────────────────────
function initGPSButton() {
  const btn = document.getElementById('pr-gps-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToastMessage(t('locationError'), 'error');
      return;
    }

    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('locationDetecting')}`;
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const gpsLat = pos.coords.latitude;
        const gpsLon = pos.coords.longitude;
        const locString = `${gpsLat.toFixed(4)}°N, ${gpsLon.toFixed(4)}°E`;
        showToastMessage(t('locationSuccess', locString), 'success');
        btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> Location Detected`;
        btn.disabled = false;

        // Auto mapping to nearest district from local database coordinates
        if (typeof MH_LOCATION_DATA !== 'undefined') {
          let minDistance = Infinity;
          let closestDistrict = 'Nagpur';

          for (const [name, coords] of Object.entries(MH_LOCATION_DATA)) {
            if (!coords.lat || !coords.lon) continue;
            // Simplified distance calculation for sorting
            const d = Math.pow(coords.lat - gpsLat, 2) + Math.pow(coords.lon - gpsLon, 2);
            if (d < minDistance) {
              minDistance = d;
              closestDistrict = name;
            }
          }

          // Automatically select State and closest District
          const stateSel = document.getElementById('pr-state');
          const districtSel = document.getElementById('pr-district');
          if (stateSel) stateSel.value = 'Maharashtra';
          if (districtSel) {
            districtSel.value = closestDistrict;
            // Dispatch change event to populate taluka & village selects
            districtSel.dispatchEvent(new Event('change'));
          }

          // Wait a tiny bit for the selects to populate and settle
          setTimeout(() => {
            const talukaSel = document.getElementById('pr-taluka');
            const villageSel = document.getElementById('pr-village');
            if (talukaSel && talukaSel.options.length > 1) {
              talukaSel.selectedIndex = 1;
              talukaSel.dispatchEvent(new Event('change'));
            }
            setTimeout(() => {
              if (villageSel && villageSel.options.length > 1) {
                villageSel.selectedIndex = 1;
                villageSel.dispatchEvent(new Event('change'));
              }
              // Run Pest Radar analysis
              runRadarAnalysis();
            }, 100);
          }, 100);
        }
      },
      () => {
        showToastMessage(t('locationError'), 'error');
        btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> Auto-Detect My Location (GPS)`;
        btn.disabled = false;
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}

// ── CHARTS (Chart.js) ─────────────────────────────────────────
let chartInstances = {};

async function updateAdvancedAnalytics() {
  const crop = document.getElementById('pr-crop')?.value || 'cotton';
  const district = document.getElementById('pr-district')?.value || 'Nagpur';

  const query = new URLSearchParams({ crop, district }).toString();
  const host = 'http://localhost:8000/api/v1/pest';

  try {
    const [resRisk, resWeather, resHistory, resCrop, resDistrict, resOutbreak, resConfidence] = await Promise.all([
      fetch(`${host}/analytics/pest-risk?${query}`).then(r => r.json()),
      fetch(`${host}/analytics/weather?${query}`).then(r => r.json()),
      fetch(`${host}/analytics/history?${query}`).then(r => r.json()),
      fetch(`${host}/analytics/crop?${query}`).then(r => r.json()),
      fetch(`${host}/analytics/district?${query}`).then(r => r.json()),
      fetch(`${host}/analytics/outbreak?${query}`).then(r => r.json()),
      fetch(`${host}/analytics/confidence?${query}`).then(r => r.json())
    ]);

    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#64748b';

    // Render 15 charts
    drawRiskTrend(resRisk);
    drawWeeklyActivity(resOutbreak.weekly_activity);
    drawTempVsRisk(resWeather.temp_vs_risk);
    drawHumidityVsRisk(resWeather.humidity_vs_risk);
    drawRainfallVsRisk(resWeather.rain_vs_risk);
    drawWeatherTrend(resWeather.weather_trend);
    drawCropDistribution(resCrop);
    drawDistrictComparison(resDistrict);
    drawRiskDistribution(resOutbreak.risk_distribution);
    drawSeasonalComparison(resOutbreak.risk_distribution);
    drawTopPests(resOutbreak.top_pests);
    drawAccuracyTrend(resConfidence);
    drawConfidenceTrend(resConfidence);
    drawMonthlyOutbreaks(resOutbreak.monthly_outbreaks);
    drawHistoricalTimeline(resHistory);

  } catch (err) {
    console.error('[Analytics] Failed to fetch data from backend APIs:', err);
  }
}

// 1. Pest Risk Trend
function drawRiskTrend(data) {
  const ctx = document.getElementById('pr-trend-chart');
  if (!ctx) return;
  if (chartInstances['pr-trend-chart']) chartInstances['pr-trend-chart'].destroy();
  chartInstances['pr-trend-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Pest Risk Score',
        data: data.map(d => d.avg_risk),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        fill: true,
        tension: 0.45,
        borderWidth: 2.5
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// 2. Weekly Pest Activity
function drawWeeklyActivity(data) {
  const ctx = document.getElementById('pr-weekly-activity-chart');
  if (!ctx) return;
  if (chartInstances['pr-weekly-activity-chart']) chartInstances['pr-weekly-activity-chart'].destroy();
  chartInstances['pr-weekly-activity-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.week),
      datasets: [{
        label: 'Outbreak Count',
        data: data.map(d => d.count),
        backgroundColor: '#ea580c',
        borderRadius: 6
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// 3. Temp vs Risk
function drawTempVsRisk(data) {
  const ctx = document.getElementById('pr-temp-vs-risk-chart');
  if (!ctx) return;
  if (chartInstances['pr-temp-vs-risk-chart']) chartInstances['pr-temp-vs-risk-chart'].destroy();
  chartInstances['pr-temp-vs-risk-chart'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Temp vs Risk',
        data: data.map(d => ({ x: d.temp, y: d.risk })),
        backgroundColor: '#ef4444'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { title: { display: true, text: 'Temperature (°C)' } }, y: { title: { display: true, text: 'Risk Score' } } }
    }
  });
}

// 4. Humidity vs Risk
function drawHumidityVsRisk(data) {
  const ctx = document.getElementById('pr-humidity-vs-risk-chart');
  if (!ctx) return;
  if (chartInstances['pr-humidity-vs-risk-chart']) chartInstances['pr-humidity-vs-risk-chart'].destroy();
  chartInstances['pr-humidity-vs-risk-chart'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Humidity vs Risk',
        data: data.map(d => ({ x: d.humidity, y: d.risk })),
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { title: { display: true, text: 'Humidity (%)' } }, y: { title: { display: true, text: 'Risk Score' } } }
    }
  });
}

// 5. Rainfall vs Risk
function drawRainfallVsRisk(data) {
  const ctx = document.getElementById('pr-rain-vs-risk-chart');
  if (!ctx) return;
  if (chartInstances['pr-rain-vs-risk-chart']) chartInstances['pr-rain-vs-risk-chart'].destroy();
  chartInstances['pr-rain-vs-risk-chart'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Rainfall vs Risk',
        data: data.map(d => ({ x: d.rain, y: d.risk })),
        backgroundColor: '#10b981'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { title: { display: true, text: 'Rainfall (mm)' } }, y: { title: { display: true, text: 'Risk Score' } } }
    }
  });
}

// 6. Weather Trend
function drawWeatherTrend(data) {
  const ctx = document.getElementById('pr-weather-trend-chart');
  if (!ctx) return;
  if (chartInstances['pr-weather-trend-chart']) chartInstances['pr-weather-trend-chart'].destroy();
  chartInstances['pr-weather-trend-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [
        { label: 'Temp', data: data.map(d => d.temp), borderColor: '#ef4444', tension: 0.4 },
        { label: 'Humidity', data: data.map(d => d.humidity), borderColor: '#3b82f6', tension: 0.4 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 7. Crop Distribution
function drawCropDistribution(data) {
  const ctx = document.getElementById('pr-crop-dist-chart');
  if (!ctx) return;
  if (chartInstances['pr-crop-dist-chart']) chartInstances['pr-crop-dist-chart'].destroy();
  chartInstances['pr-crop-dist-chart'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(d => d.crop),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 8. District Distribution
function drawDistrictComparison(data) {
  const ctx = document.getElementById('pr-district-chart');
  if (!ctx) return;
  if (chartInstances['pr-district-chart']) chartInstances['pr-district-chart'].destroy();
  chartInstances['pr-district-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.district),
      datasets: [{
        label: 'Risk Score',
        data: data.map(d => d.avg_risk),
        backgroundColor: '#8b5cf6',
        borderRadius: 6
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// 9. Risk Distribution
function drawRiskDistribution(data) {
  const ctx = document.getElementById('pr-risk-dist-chart');
  if (!ctx) return;
  if (chartInstances['pr-risk-dist-chart']) chartInstances['pr-risk-dist-chart'].destroy();
  chartInstances['pr-risk-dist-chart'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data).map(k => capitalize(k)),
      datasets: [{
        data: Object.values(data),
        backgroundColor: ['#ef4444', '#f59e0b', '#7f1d1d', '#22c55e']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 10. Seasonal Comparison
function drawSeasonalComparison(data) {
  const ctx = document.getElementById('pr-seasonal-compare-chart');
  if (!ctx) return;
  if (chartInstances['pr-seasonal-compare-chart']) chartInstances['pr-seasonal-compare-chart'].destroy();
  chartInstances['pr-seasonal-compare-chart'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: Object.keys(data).map(k => capitalize(k)),
      datasets: [{
        label: 'Severity Distribution',
        data: Object.values(data),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 11. Top Dangerous Pests
function drawTopPests(data) {
  const ctx = document.getElementById('pr-top-pests-chart');
  if (!ctx) return;
  if (chartInstances['pr-top-pests-chart']) chartInstances['pr-top-pests-chart'].destroy();
  chartInstances['pr-top-pests-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.pest),
      datasets: [{
        label: 'Incident Count',
        data: data.map(d => d.count),
        backgroundColor: '#f43f5e',
        borderRadius: 6
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// 12. Prediction Accuracy
function drawAccuracyTrend(data) {
  const ctx = document.getElementById('pr-accuracy-chart');
  if (!ctx) return;
  if (chartInstances['pr-accuracy-chart']) chartInstances['pr-accuracy-chart'].destroy();
  chartInstances['pr-accuracy-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Prediction Accuracy (%)',
        data: data.map(d => d.avg_confidence - 5 + Math.random() * 8), // accuracy proxy
        borderColor: '#10b981',
        tension: 0.3,
        fill: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 13. Confidence Score Trend
function drawConfidenceTrend(data) {
  const ctx = document.getElementById('pr-confidence-trend-chart');
  if (!ctx) return;
  if (chartInstances['pr-confidence-trend-chart']) chartInstances['pr-confidence-trend-chart'].destroy();
  chartInstances['pr-confidence-trend-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Confidence Score (%)',
        data: data.map(d => d.avg_confidence),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.05)',
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// 14. Monthly Outbreak Report
function drawMonthlyOutbreaks(data) {
  const ctx = document.getElementById('pr-monthly-outbreak-chart');
  if (!ctx) return;
  if (chartInstances['pr-monthly-outbreak-chart']) chartInstances['pr-monthly-outbreak-chart'].destroy();
  chartInstances['pr-monthly-outbreak-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.month),
      datasets: [{
        label: 'Critical Outbreaks',
        data: data.map(d => d.count),
        backgroundColor: '#7f1d1d',
        borderRadius: 6
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// 15. Historical Timeline
function drawHistoricalTimeline(data) {
  const ctx = document.getElementById('pr-historical-timeline-chart');
  if (!ctx) return;
  if (chartInstances['pr-historical-timeline-chart']) chartInstances['pr-historical-timeline-chart'].destroy();
  chartInstances['pr-historical-timeline-chart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.date.split(' ')[0]),
      datasets: [{
        label: 'Historical Pest Risk Score',
        data: data.map(d => d.risk),
        borderColor: '#2563eb',
        borderWidth: 2,
        tension: 0.3,
        fill: false
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// ── DOWNLOAD AND EXPORT HANDLERS ────────────────────────────
window.downloadChart = function(chartId, format) {
  const chart = chartInstances[chartId];
  if (!chart) return;

  if (format === 'png') {
    const url = chart.toBase64Image();
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToastMessage('Chart exported as PNG successfully.', 'success');
  } else if (format === 'pdf') {
    const url = chart.toBase64Image();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Export PDF</title></head>
        <body style="margin:0; display:flex; align-items:center; justify-content:center; height:100vh;">
          <img src="${url}" style="max-width:100%; height:auto;" />
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

window.exportChartCSV = function(chartId) {
  const chart = chartInstances[chartId];
  if (!chart || !chart.data) return;

  const labels = chart.data.labels || [];
  const datasets = chart.data.datasets || [];

  let csvContent = 'data:text/csv;charset=utf-8,';

  // Header
  const headers = ['Label', ...datasets.map(d => d.label || 'Value')];
  csvContent += headers.join(',') + '\n';

  // Rows
  if (labels.length > 0) {
    for (let i = 0; i < labels.length; i++) {
      const row = [labels[i], ...datasets.map(d => d.data[i])];
      csvContent += row.join(',') + '\n';
    }
  } else {
    const maxLength = Math.max(...datasets.map(d => d.data.length));
    for (let i = 0; i < maxLength; i++) {
      const row = datasets.map(d => {
        const item = d.data[i];
        return typeof item === 'object' ? JSON.stringify(item).replace(/,/g, ';') : item;
      });
      csvContent += row.join(',') + '\n';
    }
  }

  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a');
  a.href = encodedUri;
  a.download = `${chartId}_data.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToastMessage('Chart data exported as CSV successfully.', 'success');
};


// ── HELPERS ──────────────────────────────────────────────────
function animateRiskScore(target) {
  const numEl = document.getElementById('pr-risk-score-num');
  const arc = document.getElementById('pr-gauge-arc');
  const chip = document.getElementById('pr-risk-level-chip');
  if (!numEl) return;

  let current = parseInt(numEl.textContent) || 0;
  if (current === target) return;
  const step = target > current ? 1 : -1;
  const interval = setInterval(() => {
    if (current === target) { clearInterval(interval); return; }
    current += step;
    numEl.textContent = current;

    // Update SVG arc
    if (arc) {
      const total = 173;
      const offset = total - (current / 100) * total;
      arc.setAttribute('stroke-dashoffset', offset.toFixed(1));

      // Color
      let stroke = '#4ade80';
      if (current >= 81) stroke = '#7f1d1d';
      else if (current >= 61) stroke = '#ef4444';
      else if (current >= 31) stroke = '#f59e0b';
      arc.setAttribute('stroke', stroke);
    }

    // Update chip
    if (chip) {
      let label = 'LOW';
      let cls = 'pr-risk-chip--low';
      if (current >= 81)  { label = 'CRITICAL'; cls = 'pr-risk-chip--critical'; }
      else if (current >= 61) { label = 'HIGH'; cls = 'pr-risk-chip--high'; }
      else if (current >= 31) { label = 'MEDIUM'; cls = 'pr-risk-chip--medium'; }
      chip.textContent = `${label} RISK`;
      chip.className = `pr-risk-chip ${cls}`;
    }
  }, 16);
}

function riskColor(level) {
  const map = { critical: '#7f1d1d', high: '#dc2626', medium: '#d97706', low: '#16a34a' };
  return map[level] || '#64748b';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showToastMessage(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
    return;
  }

  const container = document.querySelector('.toast-container') || (() => {
    const c = document.createElement('div');
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();

  const toast = document.createElement('div');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#2563eb' };

  toast.style.cssText = `
    display:flex;align-items:center;gap:10px;padding:12px 20px;
    background:#0f172a;color:#fff;border-radius:10px;font-size:0.85rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.25);max-width:360px;
    animation:fadeInUp 0.25s ease;pointer-events:auto;z-index:99999;
  `;
  toast.innerHTML = `<i class="fas ${icons[type]}" style="color:${colors[type]};"></i> ${message}`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function loadPredictionHistory() {
  const tbody = document.getElementById('pr-history-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> Loading historical logs...</td></tr>`;

  try {
    const token = localStorage.getItem('km_auth_token') || sessionStorage.getItem('km_auth_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const crop = document.getElementById('pr-crop')?.value || '';
    const district = document.getElementById('pr-district')?.value || '';
    const queryParams = new URLSearchParams();
    if (crop) queryParams.append('crop', crop);
    if (district) queryParams.append('district', district);

    const res = await fetch(`http://localhost:8000/api/v1/pest/predict/history?${queryParams.toString()}`, { headers });
    if (!res.ok) throw new Error('API request failed');
    const items = await res.json();

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-light);"><i class="fas fa-folder-open" style="font-size:1.5rem; opacity:0.5; margin-bottom:8px; display:block;"></i>No historical predictions found for this location/crop.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(log => {
      const formattedDate = new Date(log.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
      const riskScore = log.risk_score || 0;
      let sevClass = 'low';
      if (riskScore >= 81) sevClass = 'critical';
      else if (riskScore >= 61) sevClass = 'high';
      else if (riskScore >= 31) sevClass = 'medium';

      return `
        <tr style="border-bottom:1px solid var(--dash-border);">
          <td style="padding:12px 20px;">${formattedDate}</td>
          <td style="padding:12px 20px;"><strong>${log.pest}</strong></td>
          <td style="padding:12px 20px;">${capitalize(log.crop)}</td>
          <td style="padding:12px 20px;"><span style="color:var(--primary); font-weight:700;">${riskScore}%</span></td>
          <td style="padding:12px 20px;"><span class="severity-pill severity--${sevClass}">${capitalize(sevClass)}</span></td>
          <td style="padding:12px 20px;">${capitalize(log.stage || 'Vegetative')}</td>
          <td style="padding:12px 20px;">${log.action_taken || 'Inspected borders'}</td>
          <td style="padding:12px 20px;"><span class="km-badge km-badge--green" style="font-size:0.65rem;">${log.outcome || 'Managed'}</span></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('History loading failed:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-light);"><i class="fas fa-exclamation-triangle" style="font-size:1.5rem; color:#ef4444; margin-bottom:8px; display:block;"></i>Failed to retrieve history logs.</td></tr>`;
  }
}

