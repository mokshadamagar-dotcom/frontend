/* ============================================================
   KrishiMitra AI – weather.js
   Part 13: Weather Advisory + Weather Intelligence Dashboard
   All data is MOCK / DEMO DATA for demonstration purposes.
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   MOCK DATA STORE
   All values are demo / hardcoded for the hackathon demo.
   TODO: Replace with OpenWeatherMap / IMD API integration.
────────────────────────────────────────────────────────── */

const WEATHER_LOCATIONS = [
  'Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Latur',
  'Amravati', 'Kolhapur', 'Solapur', 'Jalgaon', 'Akola',
  'Wardha', 'Yavatmal', 'Satara', 'Sangli', 'Nanded'
];

const WEATHER_CONDITIONS = {
  sunny:    { label: 'Sunny',        icon: 'fas fa-sun',        emoji: '☀️',  gradient: 'var(--weather-sky-hot)',    textCol: '#fff' },
  partCloud:{ label: 'Partly Cloudy',icon: 'fas fa-cloud-sun',  emoji: '⛅',  gradient: 'var(--weather-sky-clear)',  textCol: '#fff' },
  cloudy:   { label: 'Cloudy',       icon: 'fas fa-cloud',      emoji: '☁️',  gradient: 'var(--weather-sky-cloudy)', textCol: '#fff' },
  lightRain:{ label: 'Light Rain',   icon: 'fas fa-cloud-rain', emoji: '🌧️', gradient: 'var(--weather-sky-rain)',   textCol: '#fff' },
  thunder:  { label: 'Thunderstorm', icon: 'fas fa-bolt',       emoji: '⛈️', gradient: 'var(--weather-sky-thunder)',textCol: '#fff' },
  haze:     { label: 'Hazy',         icon: 'fas fa-smog',       emoji: '🌫️', gradient: 'var(--weather-sky-haze)',   textCol: '#fff' },
};

/** Mock weather data keyed by city name */
const CITY_WEATHER_DATA = {
  'Nagpur': {
    temp: 34, feelsLike: 38, high: 36, low: 26,
    condition: 'sunny',
    humidity: 68, wind: 18, windDir: 'NW Direction',
    uvIndex: 8, uvLabel: 'Very High',
    visibility: 10, dewPoint: 24, pressure: 1012,
    rainfall: 0, sunrise: '06:12', sunset: '19:28',
    alerts: [
      { type: 'warning', icon: '⚠️', title: 'Heat Wave Advisory', text: 'Temperatures above 35°C expected for next 3 days. Avoid field work between 11 AM – 4 PM. Ensure adequate water intake for livestock.' },
      { type: 'info',    icon: 'ℹ️', title: 'Monsoon Status', text: 'Monsoon is 62% of normal. IMD forecasts light rainfall in the next 3–4 days. Prepare fields for water harvesting.' }
    ]
  },
  'Pune': {
    temp: 28, feelsLike: 30, high: 30, low: 20,
    condition: 'partCloud',
    humidity: 74, wind: 12, windDir: 'SW Direction',
    uvIndex: 5, uvLabel: 'Moderate',
    visibility: 12, dewPoint: 22, pressure: 1018,
    rainfall: 3, sunrise: '06:08', sunset: '19:22',
    alerts: [
      { type: 'info', icon: 'ℹ️', title: 'Mild Conditions', text: 'Pleasant weather is expected. Good conditions for field activities like weeding and transplanting.' }
    ]
  },
  'Nashik': {
    temp: 26, feelsLike: 27, high: 28, low: 18,
    condition: 'lightRain',
    humidity: 85, wind: 14, windDir: 'S Direction',
    uvIndex: 3, uvLabel: 'Low',
    visibility: 6, dewPoint: 23, pressure: 1014,
    rainfall: 12, sunrise: '06:10', sunset: '19:20',
    alerts: [
      { type: 'danger',  icon: '🚨', title: 'Heavy Rainfall Warning', text: 'Heavy to very heavy rain expected in next 24 hours. Avoid irrigating. Drain excess water from fields.' },
      { type: 'warning', icon: '⚠️', title: 'Spray Window Closed', text: 'Do not apply pesticides or fertilizers today due to rain. Wind speeds may increase to 30 km/h tonight.' }
    ]
  }
};

// Default for cities not in data:
const FALLBACK_WEATHER = {
  temp: 31, feelsLike: 34, high: 33, low: 23,
  condition: 'partCloud',
  humidity: 72, wind: 15, windDir: 'NE Direction',
  uvIndex: 6, uvLabel: 'High',
  visibility: 8, dewPoint: 23, pressure: 1015,
  rainfall: 2, sunrise: '06:15', sunset: '19:25',
  alerts: [
    { type: 'info', icon: 'ℹ️', title: 'Demo Weather Data', text: 'This is demo/mock weather data for hackathon presentation purposes. In production, real-time data would be fetched from IMD/OpenWeatherMap.' }
  ]
};

/** Mock 7-day forecast for each city */
function getMockForecast(city) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const dates = ['Jul 28','Jul 29','Jul 30','Jul 31','Aug 1','Aug 2','Aug 3'];
  const templates = [
    { icon: '☀️', cond: 'Sunny',        hi: 35, lo: 26, rain: 5  },
    { icon: '⛅', cond: 'Partly Cloudy', hi: 33, lo: 24, rain: 20 },
    { icon: '🌧️',cond: 'Light Rain',    hi: 29, lo: 22, rain: 75 },
    { icon: '⛈️',cond: 'Thunderstorm',  hi: 27, lo: 21, rain: 90 },
    { icon: '☁️', cond: 'Cloudy',        hi: 30, lo: 23, rain: 40 },
    { icon: '⛅', cond: 'Partly Cloudy', hi: 32, lo: 24, rain: 15 },
    { icon: '☀️', cond: 'Sunny',        hi: 34, lo: 25, rain: 8  },
  ];
  return days.map((day, i) => ({
    day, date: dates[i], ...templates[i]
  }));
}

/** Mock 24-hour forecast */
function getMockHourly() {
  const hours = ['Now','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM',
                 '8 PM','9 PM','10 PM','11 PM','12 AM','1 AM','2 AM','3 AM',
                 '4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM'];
  const temps = [34,35,35,34,33,31,30,28,27,26,25,25,24,24,24,23,24,25,27,30,32,33,34,35];
  const icons = ['☀️','☀️','☀️','☀️','⛅','⛅','⛅','🌤️','🌙','🌙','🌙','🌙',
                 '🌙','🌙','🌙','🌙','🌙','🌤️','🌤️','🌤️','☀️','☀️','☀️','☀️'];
  const rain  = [5,5,5,8,12,18,10,5,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5];
  return hours.map((h, i) => ({ hour: h, temp: temps[i], icon: icons[i], rain: rain[i] }));
}

/** Weekly rainfall mock data (mm) */
const WEEKLY_RAINFALL = [
  { day: 'Mon', mm: 0 },
  { day: 'Tue', mm: 0 },
  { day: 'Wed', mm: 5 },
  { day: 'Thu', mm: 12 },
  { day: 'Fri', mm: 0 },
  { day: 'Sat', mm: 18 },
  { day: 'Sun', mm: 7 },
];

/** Farm activity suitability data */
const FARM_ACTIVITIES = [
  {
    name: 'Sowing',
    icon: '🌱',
    status: 'caution',
    statusLabel: 'Caution',
    reason: 'Soil moisture adequate but heat wave may stress seedlings. Consider early morning sowing.'
  },
  {
    name: 'Irrigation',
    icon: '💧',
    status: 'ideal',
    statusLabel: 'Ideal (Early AM)',
    reason: 'Best window is 5–7 AM before temperatures rise. Drip irrigation preferred during heat wave.'
  },
  {
    name: 'Pesticide Spray',
    icon: '🧪',
    status: 'avoid',
    statusLabel: 'Avoid Today',
    reason: 'Wind speeds (18 km/h NW) and high UV index may reduce efficacy and increase drift risk.'
  },
  {
    name: 'Harvesting',
    icon: '🌾',
    status: 'ideal',
    statusLabel: 'Ideal',
    reason: 'Dry conditions with low humidity are excellent for grain and pulse harvesting operations.'
  },
  {
    name: 'Fertilizer Application',
    icon: '🏭',
    status: 'moderate',
    statusLabel: 'Moderate',
    reason: 'Apply in evening to reduce ammonia volatilization. Irrigation after application is advised.'
  },
  {
    name: 'Ploughing / Tillage',
    icon: '🚜',
    status: 'caution',
    statusLabel: 'Caution',
    reason: 'High temperature may dry soil rapidly. Avoid deep tillage during peak afternoon heat.'
  },
  {
    name: 'Transplanting',
    icon: '🌿',
    status: 'avoid',
    statusLabel: 'Avoid 11–4 PM',
    reason: 'Transplant shock risk is high during heat wave. Best done in early morning or evening.'
  },
  {
    name: 'Weed Management',
    icon: '✂️',
    status: 'moderate',
    statusLabel: 'Moderate',
    reason: 'Manual weeding feasible in early morning. Herbicide application not recommended due to heat.'
  },
];

/** AI weather advisory content */
const AI_ADVISORIES = [
  {
    type: 'critical',
    icon: '🌡️',
    title: 'Heat Stress Management',
    text: 'With temperatures at 34°C and a feels-like of 38°C, cotton and soybean crops are at risk of heat stress. Mulching around plants will help retain soil moisture and reduce root zone temperature.'
  },
  {
    type: 'warning',
    icon: '💧',
    title: 'Irrigation Efficiency',
    text: 'Evapotranspiration is very high today. Increase irrigation frequency by 20–30%. Drip irrigation is strongly recommended over flood irrigation to prevent water loss.'
  },
  {
    type: 'info',
    icon: '🌧️',
    title: 'Monsoon Outlook',
    text: 'IMD forecasts indicate a weak monsoon trough over Vidarbha. Expect intermittent light rain in 3–5 days. This may alleviate heat stress and help germination of late-planted crops.'
  },
  {
    type: 'success',
    icon: '🌾',
    title: 'Harvest Opportunity',
    text: 'Current dry spell is excellent for harvesting mature soybean and tur (pigeon pea). Proceed with mechanized harvesting before the forecasted rain arrives in 3–5 days.'
  },
];

/** Irrigation timing recommendations */
const IRRIGATION_SLOTS = [
  { time: '5:00 AM – 7:00 AM', desc: 'Best window. Low evaporation, cool temperatures.', status: 'ideal', icon: 'fas fa-check-circle' },
  { time: '7:00 AM – 10:00 AM', desc: 'Acceptable. Rising temperatures, moderate evaporation.', status: 'caution', icon: 'fas fa-exclamation-triangle' },
  { time: '10:00 AM – 4:00 PM', desc: 'Avoid. Peak heat causes 40% more evaporation.', status: 'avoid', icon: 'fas fa-times-circle' },
  { time: '4:00 PM – 7:00 PM', desc: 'Good window. Temperatures dropping, less evaporation.', status: 'ideal', icon: 'fas fa-check-circle' },
];

/** Spray window data */
const SPRAY_SLOTS = [
  { time: '6:00 AM – 8:00 AM', desc: 'Ideal: Low wind (5–8 km/h), cool, no rain.', status: 'ideal', icon: 'fas fa-check-circle' },
  { time: '8:00 AM – 11:00 AM', desc: 'Acceptable window. Check wind speed before spraying.', status: 'caution', icon: 'fas fa-exclamation-triangle' },
  { time: '11:00 AM – 5:00 PM', desc: 'Not recommended: Wind (18 km/h) causes drift & UV degrades chemicals.', status: 'avoid', icon: 'fas fa-times-circle' },
  { time: '5:00 PM – 7:30 PM', desc: 'Acceptable. Wind easing. Good visibility.', status: 'caution', icon: 'fas fa-exclamation-triangle' },
];

/** Historical comparison data */
const HISTORICAL_DATA = [
  { label: 'Avg Temp July', val: '34°C', compare: '+2°C above normal', dir: 'above' },
  { label: 'Rainfall July', val: '42 mm', compare: '-16 mm below normal', dir: 'below' },
  { label: 'Humidity',      val: '68%',  compare: 'Normal range',         dir: 'normal' },
  { label: 'Max UV',        val: '8',    compare: '+1 above July avg',     dir: 'above' },
];

/* ──────────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────────── */
let currentCity = 'Nagpur';
let currentWeather = null;

/* ──────────────────────────────────────────────────────────
   DOM HELPERS
────────────────────────────────────────────────────────── */
function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ──────────────────────────────────────────────────────────
   RENDER: Main Current Conditions
────────────────────────────────────────────────────────── */
function renderCurrentConditions(weather, city) {
  const cond = WEATHER_CONDITIONS[weather.condition] || WEATHER_CONDITIONS.sunny;

  // Hero card gradient
  const heroCard = document.getElementById('weather-main-card');
  if (heroCard) {
    heroCard.style.background = cond.gradient;
  }

  // Text fields
  setText('wmc-location', city + ', Maharashtra');
  setText('wmc-updated', 'Last updated: Just now · Demo Data');
  setText('wmc-condition-text', cond.label);
  setText('wmc-temp', weather.temp);
  setText('wmc-feels-like', weather.feelsLike + '°C');
  setText('wmc-high', weather.high + '°C');
  setText('wmc-low', weather.low + '°C');

  // Condition badge icon
  const icon = document.getElementById('wmc-icon');
  if (icon) {
    icon.className = cond.icon;
  }

  // Big emoji icon
  setText('wmc-big-icon', cond.emoji);

  // Stats
  setText('stat-humidity', weather.humidity + '%');
  const humBar = document.getElementById('stat-humidity-bar');
  if (humBar) humBar.style.width = weather.humidity + '%';

  setText('stat-wind', weather.wind + ' km/h');
  setText('stat-wind-dir', weather.windDir);
  setText('stat-uv', weather.uvIndex);
  setText('stat-uv-label', weather.uvLabel);

  // UV color badge
  const uvBadge = document.getElementById('stat-uv-label');
  if (uvBadge) {
    const uvColors = {
      'Low'      : { bg: '#dcfce7', col: '#166534' },
      'Moderate' : { bg: '#fef3c7', col: '#92400e' },
      'High'     : { bg: '#ffedd5', col: '#9a3412' },
      'Very High': { bg: '#fee2e2', col: '#991b1b' },
      'Extreme'  : { bg: '#4c0519', col: '#fecdd3' },
    };
    const uvc = uvColors[weather.uvLabel] || uvColors['Moderate'];
    uvBadge.style.background = uvc.bg;
    uvBadge.style.color = uvc.col;
  }

  setText('stat-visibility', weather.visibility + ' km');
  setText('stat-dew', weather.dewPoint + '°C');
  setText('stat-pressure', weather.pressure + ' hPa');
  setText('stat-rainfall', weather.rainfall + ' mm');
  setText('stat-sun-times', weather.sunrise + ' / ' + weather.sunset);
}

/* ──────────────────────────────────────────────────────────
   RENDER: Weather Alerts
────────────────────────────────────────────────────────── */
function renderAlerts(alerts) {
  const container = document.getElementById('weather-alerts-section');
  if (!container) return;

  if (!alerts || alerts.length === 0) {
    container.innerHTML = '';
    return;
  }

  const typeMap = {
    danger:  { icon: 'fas fa-exclamation-triangle' },
    warning: { icon: 'fas fa-exclamation-circle' },
    info:    { icon: 'fas fa-info-circle' },
    success: { icon: 'fas fa-check-circle' },
  };

  container.innerHTML = alerts.map((a, i) => {
    const t = typeMap[a.type] || typeMap.info;
    return `
      <div class="weather-alert-banner ${a.type}" id="weather-alert-${i}" role="alert" aria-label="${a.title}">
        <div class="weather-alert-icon" aria-hidden="true">${a.icon}</div>
        <div class="weather-alert-body">
          <p class="weather-alert-title">${a.title}</p>
          <p class="weather-alert-text">${a.text}</p>
        </div>
        <button type="button" class="weather-alert-dismiss" onclick="dismissAlert(${i})" aria-label="Dismiss alert: ${a.title}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    `;
  }).join('\n');
}

window.dismissAlert = function(index) {
  const el = document.getElementById('weather-alert-' + index);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }
};

/* ──────────────────────────────────────────────────────────
   RENDER: Hourly Forecast
────────────────────────────────────────────────────────── */
function renderHourlyForecast() {
  const container = document.getElementById('weather-hourly-scroll');
  if (!container) return;
  const data = getMockHourly();

  container.innerHTML = data.map((h, i) => `
    <div class="weather-hourly-item ${i === 0 ? 'active-now' : ''}" role="listitem" aria-label="${h.hour}: ${h.temp}°C, ${h.rain}% rain chance">
      <span class="weather-hourly-item__time">${h.hour}</span>
      <span class="weather-hourly-item__icon" aria-hidden="true">${h.icon}</span>
      <span class="weather-hourly-item__temp">${h.temp}°C</span>
      <span class="weather-hourly-item__rain">
        <i class="fas fa-tint" aria-hidden="true"></i> ${h.rain}%
      </span>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────
   RENDER: 7-Day Forecast
────────────────────────────────────────────────────────── */
function render7DayForecast(city) {
  const container = document.getElementById('weather-7day-grid');
  if (!container) return;
  const forecast = getMockForecast(city);

  // Determine overall min/max for bar normalization
  const allHi = forecast.map(f => f.hi);
  const allLo = forecast.map(f => f.lo);
  const maxH = Math.max(...allHi);
  const minL = Math.min(...allLo);
  const range = maxH - minL || 1;

  container.innerHTML = forecast.map((f, i) => {
    const barStart = Math.round(((f.lo - minL) / range) * 100);
    const barWidth = Math.round(((f.hi - f.lo) / range) * 100);
    const isToday = i === 0;
    return `
      <div class="weather-7day-item" role="listitem" aria-label="${f.day} ${f.date}: ${f.cond}, High ${f.hi}°C Low ${f.lo}°C, Rain ${f.rain}%">
        <div class="weather-7day-item__day">
          ${isToday ? '<strong>Today</strong>' : f.day}
          <span>${f.date}</span>
        </div>
        <div class="weather-7day-item__icon" aria-hidden="true">${f.icon}</div>
        <div class="weather-7day-item__bar-wrap">
          <span class="temp-lo">${f.lo}°</span>
          <div class="weather-temp-range-bar" aria-hidden="true">
            <div class="weather-temp-range-fill" style="margin-left:${barStart}%; width:${barWidth}%;"></div>
          </div>
          <span class="temp-hi">${f.hi}°</span>
        </div>
        <div class="weather-7day-item__rain-chance">
          <i class="fas fa-tint" aria-hidden="true"></i> ${f.rain}%
        </div>
        <div class="weather-7day-item__condition">${f.cond}</div>
      </div>
    `;
  }).join('');
}

/* ──────────────────────────────────────────────────────────
   RENDER: Rainfall Chart
────────────────────────────────────────────────────────── */
function renderRainfallChart() {
  const container = document.getElementById('weather-rain-chart');
  if (!container) return;

  const maxMm = Math.max(...WEEKLY_RAINFALL.map(r => r.mm), 1);
  const maxBarH = 80; // px

  container.innerHTML = WEEKLY_RAINFALL.map(r => {
    const h = Math.max(Math.round((r.mm / maxMm) * maxBarH), 4);
    return `
      <div class="weather-rain-bar-wrap">
        <div class="weather-rain-bar"
             style="height:${h}px;"
             data-val="${r.mm}"
             title="${r.day}: ${r.mm} mm"
             aria-label="${r.day}: ${r.mm} mm rainfall"
        ></div>
        <span class="weather-rain-bar-label" style="position:relative; bottom:auto;">${r.day}</span>
      </div>
    `;
  }).join('');
}

/* ──────────────────────────────────────────────────────────
   RENDER: AI Weather Advisory
────────────────────────────────────────────────────────── */
function renderAIAdvisory() {
  const container = document.getElementById('weather-ai-advisory-content');
  if (!container) return;

  container.innerHTML = AI_ADVISORIES.map(a => `
    <div class="weather-advisory-card ${a.type}">
      <p class="weather-advisory-card__title">
        <span aria-hidden="true">${a.icon}</span> ${a.title}
      </p>
      <p class="weather-advisory-card__text">${a.text}</p>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────
   RENDER: Farm Activity Suitability Grid
────────────────────────────────────────────────────────── */
function renderActivityGrid() {
  const container = document.getElementById('weather-activity-grid');
  if (!container) return;

  container.innerHTML = FARM_ACTIVITIES.map(a => `
    <div class="weather-activity-card" aria-label="${a.name}: ${a.statusLabel}">
      <div class="weather-activity-card__header">
        <span class="weather-activity-card__icon" aria-hidden="true">${a.icon}</span>
        <span class="weather-activity-card__name">${a.name}</span>
      </div>
      <span class="weather-activity-status ${a.status}">
        <i class="fas ${a.status === 'ideal' ? 'fa-check-circle' : a.status === 'avoid' ? 'fa-times-circle' : a.status === 'caution' ? 'fa-exclamation-triangle' : 'fa-info-circle'}" aria-hidden="true"></i>
        ${a.statusLabel}
      </span>
      <p class="weather-activity-reason">${a.reason}</p>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────
   RENDER: Irrigation Timing Panel
────────────────────────────────────────────────────────── */
function renderIrrigationPanel() {
  const container = document.getElementById('weather-irrigation-panel');
  if (!container) return;

  container.innerHTML = `
    <div style="background:var(--green-50); border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:12px 14px; margin-bottom:4px;">
      <p style="font-size:0.8rem; font-weight:700; color:var(--primary); margin:0 0 4px;">🌡️ Today's ET₀ (Evapotranspiration)</p>
      <p style="font-size:1.1rem; font-weight:900; color:var(--text-primary); margin:0;">6.8 mm/day <span style="font-size:0.72rem; font-weight:600; color:var(--text-light);">(High – Demo Value)</span></p>
    </div>
    ${IRRIGATION_SLOTS.map(s => `
      <div class="weather-time-slot ${s.status}" aria-label="${s.time}: ${s.desc}">
        <div class="weather-time-slot__icon">
          <i class="${s.icon}" aria-hidden="true"></i>
        </div>
        <div class="weather-time-slot__info">
          <span class="weather-time-slot__time">${s.time}</span>
          <span class="weather-time-slot__desc">${s.desc}</span>
        </div>
      </div>
    `).join('')}
    <a href="irrigation.html" class="km-btn km-btn--primary km-btn--sm" style="width:100%; justify-content:center; margin-top:4px;" aria-label="Get complete AI irrigation plan">
      <i class="fas fa-calculator" aria-hidden="true"></i> Get Full AI Irrigation Plan
    </a>
  `;
}

/* ──────────────────────────────────────────────────────────
   RENDER: Spray Window Panel
────────────────────────────────────────────────────────── */
function renderSprayPanel() {
  const container = document.getElementById('weather-spray-panel');
  if (!container) return;

  container.innerHTML = `
    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:12px 14px; margin-bottom:4px;">
      <p style="font-size:0.78rem; font-weight:700; color:#1d4ed8; margin:0 0 4px;">Current Conditions for Spraying</p>
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <span style="font-size:0.8rem; color:var(--text-secondary);"><i class="fas fa-wind" aria-hidden="true"></i> Wind: <strong>18 km/h NW</strong></span>
        <span style="font-size:0.8rem; color:var(--text-secondary);"><i class="fas fa-tint" aria-hidden="true"></i> Humidity: <strong>68%</strong></span>
        <span style="font-size:0.8rem; color:var(--text-secondary);"><i class="fas fa-cloud-rain" aria-hidden="true"></i> Rain: <strong>0 mm</strong></span>
      </div>
    </div>
    ${SPRAY_SLOTS.map(s => `
      <div class="weather-time-slot ${s.status}" aria-label="Spray window ${s.time}: ${s.desc}">
        <div class="weather-time-slot__icon">
          <i class="${s.icon}" aria-hidden="true"></i>
        </div>
        <div class="weather-time-slot__info">
          <span class="weather-time-slot__time">${s.time}</span>
          <span class="weather-time-slot__desc">${s.desc}</span>
        </div>
      </div>
    `).join('')}
    <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:var(--radius-md); padding:10px 14px; font-size:0.76rem; color:#92400e; line-height:1.5;">
      <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      <strong>Note:</strong> Always check wind speed before spraying. Avoid spraying if wind &gt; 12 km/h or rain is forecast within 3 hours.
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   RENDER: Historical Comparison
────────────────────────────────────────────────────────── */
function renderHistoricalGrid() {
  const container = document.getElementById('weather-historical-grid');
  if (!container) return;

  container.innerHTML = HISTORICAL_DATA.map(h => `
    <div class="weather-historical-item" aria-label="${h.label}: ${h.val}, ${h.compare}">
      <span class="weather-historical-item__label">${h.label}</span>
      <span class="weather-historical-item__val">${h.val}</span>
      <span class="weather-historical-item__compare ${h.dir}">
        <i class="fas ${h.dir === 'above' ? 'fa-arrow-up' : h.dir === 'below' ? 'fa-arrow-down' : 'fa-check'}" aria-hidden="true"></i>
        ${h.compare}
      </span>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────
   LOCATION MODAL
────────────────────────────────────────────────────────── */
function initLocationModal() {
  const overlay = document.getElementById('location-modal-overlay');
  const changeBtn = document.getElementById('location-change-btn');
  const closeBtn = document.getElementById('location-modal-close');
  const searchInput = document.getElementById('location-search-input');
  const quickGrid = document.getElementById('location-quick-grid');

  if (!overlay) return;

  // Render quick-select city buttons
  if (quickGrid) {
    quickGrid.innerHTML = WEATHER_LOCATIONS.map(city => `
      <button type="button" class="location-quick-btn" onclick="selectLocation('${city}')" aria-label="Select ${city}">
        ${city}
      </button>
    `).join('');
  }

  // Open modal
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      if (searchInput) searchInput.focus();
    });
  }

  // Close modal
  function closeModal() {
    overlay.style.display = 'none';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') closeModal();
  });

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      const btns = quickGrid.querySelectorAll('.location-quick-btn');
      btns.forEach(btn => {
        btn.style.display = btn.textContent.trim().toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

window.selectLocation = function(city) {
  currentCity = city;
  currentWeather = CITY_WEATHER_DATA[city] || FALLBACK_WEATHER;

  // Update location pill
  const locLabel = document.getElementById('location-text-label');
  if (locLabel) locLabel.textContent = city + ', Maharashtra';

  // Close modal
  const overlay = document.getElementById('location-modal-overlay');
  if (overlay) overlay.style.display = 'none';

  // Re-render dashboard
  renderWeatherDashboard();

  // Toast feedback
  if (window.showToast) {
    window.showToast('Location updated to ' + city, 'success');
  }
};

/* ──────────────────────────────────────────────────────────
   REFRESH BUTTON
────────────────────────────────────────────────────────── */
function initRefreshButton() {
  const btn = document.getElementById('weather-refresh-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Refreshing...';
    btn.disabled = true;
    setTimeout(() => {
      renderWeatherDashboard();
      btn.innerHTML = '<i class="fas fa-sync-alt" aria-hidden="true"></i> Refresh';
      btn.disabled = false;
      if (window.showToast) {
        window.showToast('Weather data refreshed (Demo)', 'success');
      }
    }, 1500);
  });
}

/* ──────────────────────────────────────────────────────────
   MASTER RENDER FUNCTION
────────────────────────────────────────────────────────── */
function renderWeatherDashboard() {
  const weather = currentWeather;
  const city = currentCity;

  renderCurrentConditions(weather, city);
  renderAlerts(weather.alerts);
  renderHourlyForecast();
  render7DayForecast(city);
  renderRainfallChart();
  renderAIAdvisory();
  renderActivityGrid();
  renderIrrigationPanel();
  renderSprayPanel();
  renderHistoricalGrid();
}

/* ──────────────────────────────────────────────────────────
   ANIMATE STATS ON LOAD (stagger entrance)
────────────────────────────────────────────────────────── */
function animateStatsEntrance() {
  const cards = document.querySelectorAll('.weather-stat-card, .weather-activity-card, .weather-historical-item');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 80 * i);
  });
}

/* ──────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────── */
function initWeatherPage() {
  // Load initial city data
  currentWeather = CITY_WEATHER_DATA[currentCity] || FALLBACK_WEATHER;

  // Render all sections
  renderWeatherDashboard();

  // Init interactions
  initLocationModal();
  initRefreshButton();

  // Stagger entrance animation (slight delay for DOM render)
  setTimeout(animateStatsEntrance, 200);
}

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeatherPage);
} else {
  initWeatherPage();
}
