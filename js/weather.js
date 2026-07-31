/* ============================================================
   KrishiMitra AI – weather.js
   LIVE Weather Data via OpenWeatherMap Free API
   Covers all 36 Maharashtra Districts
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   OpenWeatherMap API Config
   Free tier: 60 calls/min, 1M calls/month
   Get your free key at: https://openweathermap.org/api
────────────────────────────────────────────────────────── */
const OWM_API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // Free public demo key (replace with your own)
const OWM_BASE    = 'https://api.openweathermap.org/data/2.5';
const OWM_ONECALL = 'https://api.openweathermap.org/data/3.0/onecall';

/* ──────────────────────────────────────────────────────────
   ALL 36 MAHARASHTRA DISTRICTS with coordinates
────────────────────────────────────────────────────────── */
const MAHARASHTRA_DISTRICTS = [
  { name: 'Nagpur',        lat: 21.1458, lon: 79.0882 },
  { name: 'Pune',          lat: 18.5204, lon: 73.8567 },
  { name: 'Mumbai',        lat: 19.0760, lon: 72.8777 },
  { name: 'Nashik',        lat: 20.0059, lon: 73.7898 },
  { name: 'Aurangabad',    lat: 19.8762, lon: 75.3433 },
  { name: 'Solapur',       lat: 17.6868, lon: 75.9064 },
  { name: 'Amravati',      lat: 20.9374, lon: 77.7796 },
  { name: 'Kolhapur',      lat: 16.7050, lon: 74.2433 },
  { name: 'Latur',         lat: 18.4088, lon: 76.5604 },
  { name: 'Jalgaon',       lat: 21.0077, lon: 75.5626 },
  { name: 'Akola',         lat: 20.7002, lon: 77.0082 },
  { name: 'Wardha',        lat: 20.7453, lon: 78.5989 },
  { name: 'Yavatmal',      lat: 20.3888, lon: 78.1204 },
  { name: 'Satara',        lat: 17.6805, lon: 74.0183 },
  { name: 'Sangli',        lat: 16.8524, lon: 74.5815 },
  { name: 'Nanded',        lat: 18.9940, lon: 77.3083 },
  { name: 'Chandrapur',    lat: 19.9615, lon: 79.2961 },
  { name: 'Dhule',         lat: 20.9042, lon: 74.7749 },
  { name: 'Osmanabad',     lat: 18.1860, lon: 76.0412 },
  { name: 'Parbhani',      lat: 19.2609, lon: 76.7748 },
  { name: 'Beed',          lat: 18.9891, lon: 75.7601 },
  { name: 'Hingoli',       lat: 19.7197, lon: 77.1500 },
  { name: 'Buldhana',      lat: 20.5292, lon: 76.1842 },
  { name: 'Washim',        lat: 20.1120, lon: 77.1338 },
  { name: 'Gadchiroli',    lat: 20.1809, lon: 80.0000 },
  { name: 'Gondia',        lat: 21.4600, lon: 80.2000 },
  { name: 'Bhandara',      lat: 21.1666, lon: 79.6500 },
  { name: 'Nandurbar',     lat: 21.3667, lon: 74.2333 },
  { name: 'Ahmednagar',    lat: 19.0948, lon: 74.7480 },
  { name: 'Raigad',        lat: 18.5158, lon: 73.1812 },
  { name: 'Ratnagiri',     lat: 16.9902, lon: 73.3120 },
  { name: 'Sindhudurg',    lat: 16.3491, lon: 73.8573 },
  { name: 'Thane',         lat: 19.2183, lon: 72.9781 },
  { name: 'Palghar',       lat: 19.6967, lon: 72.7697 },
  { name: 'Mumbai Suburban',lat:19.1334, lon: 72.9133 },
  { name: 'Jalna',         lat: 19.8347, lon: 75.8816 },
];

/* ──────────────────────────────────────────────────────────
   WEATHER CONDITION MAPPING (OWM icon → local style)
────────────────────────────────────────────────────────── */
const WEATHER_CONDITIONS = {
  sunny:     { label: 'Sunny',         icon: 'fas fa-sun',        emoji: '☀️',  gradient: 'linear-gradient(135deg,#f97316 0%,#ef4444 100%)', textCol: '#fff' },
  partCloud: { label: 'Partly Cloudy', icon: 'fas fa-cloud-sun',  emoji: '⛅',  gradient: 'linear-gradient(135deg,#60a5fa 0%,#3b82f6 100%)', textCol: '#fff' },
  cloudy:    { label: 'Cloudy',        icon: 'fas fa-cloud',      emoji: '☁️',  gradient: 'linear-gradient(135deg,#94a3b8 0%,#64748b 100%)', textCol: '#fff' },
  lightRain: { label: 'Light Rain',    icon: 'fas fa-cloud-rain', emoji: '🌧️', gradient: 'linear-gradient(135deg,#38bdf8 0%,#0284c7 100%)', textCol: '#fff' },
  heavyRain: { label: 'Heavy Rain',    icon: 'fas fa-cloud-showers-heavy', emoji: '🌧️', gradient: 'linear-gradient(135deg,#1e40af 0%,#1e3a8a 100%)', textCol: '#fff' },
  thunder:   { label: 'Thunderstorm',  icon: 'fas fa-bolt',       emoji: '⛈️', gradient: 'linear-gradient(135deg,#7c3aed 0%,#4c1d95 100%)', textCol: '#fff' },
  snow:      { label: 'Snow',          icon: 'fas fa-snowflake',  emoji: '❄️',  gradient: 'linear-gradient(135deg,#bae6fd 0%,#7dd3fc 100%)', textCol: '#1e3a8a' },
  haze:      { label: 'Hazy',          icon: 'fas fa-smog',       emoji: '🌫️', gradient: 'linear-gradient(135deg,#d1d5db 0%,#9ca3af 100%)', textCol: '#fff' },
  mist:      { label: 'Misty',         icon: 'fas fa-water',      emoji: '🌫️', gradient: 'linear-gradient(135deg,#e2e8f0 0%,#94a3b8 100%)', textCol: '#fff' },
  drizzle:   { label: 'Drizzle',       icon: 'fas fa-cloud-drizzle', emoji: '🌦️', gradient: 'linear-gradient(135deg,#7dd3fc 0%,#38bdf8 100%)', textCol: '#fff' },
};

function owmIconToCondition(iconCode, description) {
  const d = (description || '').toLowerCase();
  if (d.includes('thunderstorm'))      return 'thunder';
  if (d.includes('drizzle'))           return 'drizzle';
  if (d.includes('heavy') && d.includes('rain')) return 'heavyRain';
  if (d.includes('rain'))              return 'lightRain';
  if (d.includes('snow'))              return 'snow';
  if (d.includes('mist') || d.includes('fog')) return 'mist';
  if (d.includes('haze') || d.includes('dust') || d.includes('smoke')) return 'haze';
  if (d.includes('cloud') && d.includes('overcast')) return 'cloudy';
  if (d.includes('cloud'))             return 'partCloud';
  return 'sunny';
}

function uvIndexLabel(uv) {
  if (uv <= 2)  return 'Low';
  if (uv <= 5)  return 'Moderate';
  if (uv <= 7)  return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

/* ──────────────────────────────────────────────────────────
   IN-MEMORY CACHE (5-minute TTL)
────────────────────────────────────────────────────────── */
const weatherCache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = weatherCache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    delete weatherCache[key];
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  weatherCache[key] = { data, ts: Date.now() };
}

/* ──────────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────────── */
let currentCity    = 'Nagpur';
let currentWeather = null;
let currentForecast = null;
let isLoading      = false;

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
   LOADING OVERLAY
────────────────────────────────────────────────────────── */
function showLoading(msg = 'Fetching live weather data...') {
  let overlay = document.getElementById('weather-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'weather-loading-overlay';
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.45);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      z-index:9999; backdrop-filter:blur(4px);
    `;
    overlay.innerHTML = `
      <div style="background:#fff; border-radius:16px; padding:32px 40px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div style="font-size:3rem; margin-bottom:12px;">🌤️</div>
        <div style="font-size:1.4rem; font-weight:800; color:#166534; margin-bottom:8px;">Live हवामान लोड होत आहे</div>
        <div id="weather-loading-msg" style="font-size:0.9rem; color:#64748b; margin-bottom:20px;">${msg}</div>
        <div style="width:200px; height:4px; background:#e2e8f0; border-radius:9999px; overflow:hidden;">
          <div id="weather-load-bar" style="height:100%; background:linear-gradient(90deg,#16a34a,#4ade80); border-radius:9999px; animation:loadSlide 1.5s infinite ease-in-out;"></div>
        </div>
      </div>
      <style>
        @keyframes loadSlide {
          0%   { width:0%;   margin-left:0%; }
          50%  { width:60%;  margin-left:20%; }
          100% { width:0%;   margin-left:100%; }
        }
      </style>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('weather-loading-msg').textContent = msg;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('weather-loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

function updateLoadingMsg(msg) {
  const el = document.getElementById('weather-loading-msg');
  if (el) el.textContent = msg;
}

/* ──────────────────────────────────────────────────────────
   FETCH LIVE WEATHER from OpenWeatherMap
────────────────────────────────────────────────────────── */
async function fetchLiveWeather(districtObj) {
  const key = districtObj.name;
  const cached = getCached(key);
  if (cached) return cached;

  const { lat, lon } = districtObj;

  // Current weather
  const currentUrl = `${OWM_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=en`;
  // 5-day / 3-hour forecast (free tier)
  const forecastUrl = `${OWM_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric&lang=en`;
  // UV Index (current)
  const uvUrl = `${OWM_BASE}/uvi?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`;

  const [currentRes, forecastRes, uvRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
    fetch(uvUrl),
  ]);

  if (!currentRes.ok) throw new Error(`Weather API error: ${currentRes.status}`);

  const currentData  = await currentRes.json();
  const forecastData = forecastRes.ok ? await forecastRes.json() : null;
  const uvData       = uvRes.ok ? await uvRes.json() : null;

  const uvVal = uvData ? Math.round(uvData.value || 0) : Math.round(currentData.uvi || 0);
  const desc  = currentData.weather[0]?.description || '';
  const icon  = currentData.weather[0]?.icon || '';
  const cond  = owmIconToCondition(icon, desc);

  // Build sunrise/sunset times (IST = UTC+5:30)
  function toIST(unixSec) {
    const d = new Date((unixSec + 5.5 * 3600) * 1000);
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  // Dew point (compute from temp & humidity using Magnus formula)
  function dewPoint(T, RH) {
    const a = 17.27, b = 237.7;
    const alpha = (a * T) / (b + T) + Math.log(RH / 100);
    return Math.round((b * alpha) / (a - alpha));
  }

  const temp     = Math.round(currentData.main.temp);
  const humidity = currentData.main.humidity;
  const pressure = currentData.main.pressure;
  const windSpd  = Math.round((currentData.wind?.speed || 0) * 3.6); // m/s → km/h
  const windDeg  = currentData.wind?.deg || 0;
  const windDirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const windDir  = windDirs[Math.round(windDeg / 22.5) % 16] + ' Direction';
  const vis      = Math.round((currentData.visibility || 10000) / 1000); // m → km
  const feelsLike= Math.round(currentData.main.feels_like);
  const high     = Math.round(currentData.main.temp_max);
  const low      = Math.round(currentData.main.temp_min);
  const rainfall = currentData.rain?.['1h'] || currentData.rain?.['3h'] || 0;
  const sunrise  = toIST(currentData.sys.sunrise);
  const sunset   = toIST(currentData.sys.sunset);
  const dp       = dewPoint(temp, humidity);

  // Build smart alerts from real data
  const alerts = [];
  if (temp >= 40) {
    alerts.push({ type: 'danger', icon: '🌡️', title: 'Extreme Heat Alert', text: `${key} मध्ये तापमान ${temp}°C आहे. शेतकाम दुपारी 11 ते 4 टाळा. जनावरांना पुरेसे पाणी द्या.` });
  } else if (temp >= 35) {
    alerts.push({ type: 'warning', icon: '⚠️', title: 'Heat Wave Advisory', text: `तापमान ${temp}°C आहे. सकाळी लवकर किंवा सायंकाळी काम करा. झाडांना आच्छादन (mulching) करा.` });
  }
  if (windSpd > 30) {
    alerts.push({ type: 'danger', icon: '💨', title: 'Strong Wind Warning', text: `वाऱ्याचा वेग ${windSpd} km/h आहे. फवारणी (spray) करू नका. तंबू किंवा पॉलिहाऊस सुरक्षित करा.` });
  }
  if (humidity > 90) {
    alerts.push({ type: 'warning', icon: '💧', title: 'High Humidity Alert', text: `आर्द्रता ${humidity}% आहे. बुरशीजन्य रोगांचा (fungal disease) धोका आहे. पिकांची नियमित तपासणी करा.` });
  }
  if (rainfall > 20) {
    alerts.push({ type: 'danger', icon: '🌧️', title: 'Heavy Rainfall Warning', text: `${key} मध्ये आज ${rainfall.toFixed(1)} mm पाऊस झाला. शेतातून जास्तीचे पाणी काढण्याची व्यवस्था करा.` });
  } else if (rainfall > 5) {
    alerts.push({ type: 'info', icon: 'ℹ️', title: 'Light Rain Today', text: `${rainfall.toFixed(1)} mm पाऊस पडला आहे. आजचे सिंचन (irrigation) टाळा. मातीत ओलावा आहे.` });
  }
  if (uvVal >= 8) {
    alerts.push({ type: 'warning', icon: '☀️', title: 'Very High UV Index', text: `UV Index ${uvVal} (Very High). दुपारी बाहेर काम करताना डोक्यावर टोपी आणि पाण्याची सोय करा.` });
  }
  if (alerts.length === 0) {
    alerts.push({ type: 'success', icon: '✅', title: 'हवामान सामान्य आहे', text: `${key} मध्ये आज हवामान चांगले आहे. शेतीकामासाठी अनुकूल स्थिती आहे.` });
  }

  // Build hourly & 7-day from forecast
  const hourlyData = [];
  const sevenDay   = [];

  if (forecastData?.list) {
    // Next 24 hours (8 slots of 3hr)
    forecastData.list.slice(0, 8).forEach(slot => {
      const d = new Date(slot.dt * 1000);
      const h = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const em = owmIconToCondition(slot.weather[0]?.icon, slot.weather[0]?.description);
      const condObj = WEATHER_CONDITIONS[em] || WEATHER_CONDITIONS.partCloud;
      hourlyData.push({
        hour : h,
        temp : Math.round(slot.main.temp),
        icon : condObj.emoji,
        rain : Math.round((slot.pop || 0) * 100),
      });
    });

    // Group by day for 7-day
    const dayMap = {};
    forecastData.list.forEach(slot => {
      const d = new Date(slot.dt * 1000);
      const dateKey = d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
      const dayShort= d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dateShort=d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = {
          day: dayShort, date: dateShort,
          hi: slot.main.temp_max, lo: slot.main.temp_min,
          rain: (slot.pop || 0) * 100,
          icon: owmIconToCondition(slot.weather[0]?.icon, slot.weather[0]?.description),
          cond: slot.weather[0]?.main || 'Clear',
          count: 1,
        };
      } else {
        const e = dayMap[dateKey];
        e.hi   = Math.max(e.hi, slot.main.temp_max);
        e.lo   = Math.min(e.lo, slot.main.temp_min);
        e.rain = Math.max(e.rain, (slot.pop || 0) * 100);
        e.count++;
      }
    });

    Object.values(dayMap).slice(0, 7).forEach(d => {
      const condObj = WEATHER_CONDITIONS[d.icon] || WEATHER_CONDITIONS.partCloud;
      sevenDay.push({
        day  : d.day,
        date : d.date,
        icon : condObj.emoji,
        cond : d.cond,
        hi   : Math.round(d.hi),
        lo   : Math.round(d.lo),
        rain : Math.round(d.rain),
      });
    });
  }

  // Weekly rainfall from forecast
  const weeklyRainfall = sevenDay.slice(0, 7).map(d => ({
    day: d.day,
    mm : Math.round((d.rain / 100) * 20), // estimate mm from probability
  }));

  const result = {
    temp, feelsLike, high, low, condition: cond,
    humidity, wind: windSpd, windDir,
    uvIndex: uvVal, uvLabel: uvIndexLabel(uvVal),
    visibility: vis, dewPoint: dp, pressure,
    rainfall: Math.round(rainfall * 10) / 10,
    sunrise, sunset,
    alerts, hourlyData, sevenDay, weeklyRainfall,
    fetchedAt: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
    description: desc.charAt(0).toUpperCase() + desc.slice(1),
  };

  setCache(key, result);
  return result;
}

/* ──────────────────────────────────────────────────────────
   RENDER: Main Current Conditions
────────────────────────────────────────────────────────── */
function renderCurrentConditions(weather, city) {
  const cond = WEATHER_CONDITIONS[weather.condition] || WEATHER_CONDITIONS.sunny;

  const heroCard = document.getElementById('weather-main-card');
  if (heroCard) heroCard.style.background = cond.gradient;

  setText('wmc-location',       city + ', Maharashtra');
  setText('wmc-updated',        `Last updated: ${weather.fetchedAt} · Live Data 🟢`);
  setText('wmc-condition-text', weather.description || cond.label);
  setText('wmc-temp',           weather.temp);
  setText('wmc-feels-like',     weather.feelsLike + '°C');
  setText('wmc-high',           weather.high + '°C');
  setText('wmc-low',            weather.low + '°C');

  const icon = document.getElementById('wmc-icon');
  if (icon) icon.className = cond.icon;
  setText('wmc-big-icon', cond.emoji);

  setText('stat-humidity',   weather.humidity + '%');
  const humBar = document.getElementById('stat-humidity-bar');
  if (humBar) humBar.style.width = weather.humidity + '%';

  setText('stat-wind',      weather.wind + ' km/h');
  setText('stat-wind-dir',  weather.windDir);
  setText('stat-uv',        weather.uvIndex);
  setText('stat-uv-label',  weather.uvLabel);

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
  setText('stat-dew',        weather.dewPoint + '°C');
  setText('stat-pressure',   weather.pressure + ' hPa');
  setText('stat-rainfall',   weather.rainfall + ' mm');
  setText('stat-sun-times',  weather.sunrise + ' / ' + weather.sunset);

  // Update location pill
  const locLabel = document.getElementById('location-text-label');
  if (locLabel) locLabel.textContent = city + ', Maharashtra';
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

  container.innerHTML = alerts.map((a, i) => `
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
  `).join('\n');
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
   RENDER: Hourly Forecast (Live)
────────────────────────────────────────────────────────── */
function renderHourlyForecast(weather) {
  const container = document.getElementById('weather-hourly-scroll');
  if (!container) return;

  const data = weather?.hourlyData;
  if (!data || data.length === 0) {
    container.innerHTML = '<p style="color:#64748b;padding:12px;">तास-तासानुसार डेटा उपलब्ध नाही.</p>';
    return;
  }

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
   RENDER: 7-Day Forecast (Live)
────────────────────────────────────────────────────────── */
function render7DayForecast(weather) {
  const container = document.getElementById('weather-7day-grid');
  if (!container) return;

  const forecast = weather?.sevenDay;
  if (!forecast || forecast.length === 0) {
    container.innerHTML = '<p style="color:#64748b;padding:12px;">7 दिवसांचा डेटा उपलब्ध नाही.</p>';
    return;
  }

  const allHi = forecast.map(f => f.hi);
  const allLo = forecast.map(f => f.lo);
  const maxH  = Math.max(...allHi);
  const minL  = Math.min(...allLo);
  const range = maxH - minL || 1;

  container.innerHTML = forecast.map((f, i) => {
    const barStart = Math.round(((f.lo - minL) / range) * 100);
    const barWidth = Math.round(((f.hi - f.lo) / range) * 100);
    return `
      <div class="weather-7day-item" role="listitem" aria-label="${f.day} ${f.date}: ${f.cond}, High ${f.hi}°C Low ${f.lo}°C, Rain ${f.rain}%">
        <div class="weather-7day-item__day">
          ${i === 0 ? '<strong>Today</strong>' : f.day}
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
   RENDER: Rainfall Chart (Live)
────────────────────────────────────────────────────────── */
function renderRainfallChart(weather) {
  const container = document.getElementById('weather-rain-chart');
  if (!container) return;

  const data = weather?.weeklyRainfall;
  if (!data || data.length === 0) {
    container.innerHTML = '<p style="color:#64748b;padding:12px;">पावसाचा डेटा उपलब्ध नाही.</p>';
    return;
  }

  const maxMm  = Math.max(...data.map(r => r.mm), 1);
  const maxBarH = 80;

  container.innerHTML = data.map(r => {
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
   RENDER: AI Weather Advisory (Dynamic from live data)
────────────────────────────────────────────────────────── */
function renderAIAdvisory(weather) {
  const container = document.getElementById('weather-ai-advisory-content');
  if (!container) return;

  const advisories = [];

  // Heat advisory
  if (weather.temp >= 35) {
    advisories.push({
      type: 'critical', icon: '🌡️', title: 'Heat Stress Management',
      text: `${currentCity} मध्ये तापमान ${weather.temp}°C आहे आणि feels-like ${weather.feelsLike}°C. कापूस आणि सोयाबीन पिकांना उष्णतेचा ताण होऊ शकतो. झाडांभोवती आच्छादन (mulching) करा. Evapotranspiration जास्त आहे - सिंचन 20-30% वाढवा.`
    });
  } else {
    advisories.push({
      type: 'success', icon: '🌡️', title: 'Favorable Temperature',
      text: `${currentCity} मध्ये तापमान ${weather.temp}°C आहे. हवामान पिकांसाठी अनुकूल आहे. सामान्य शेतकाम करता येईल.`
    });
  }

  // Wind advisory
  if (weather.wind > 25) {
    advisories.push({
      type: 'warning', icon: '💨', title: 'Wind Speed Alert',
      text: `वाऱ्याचा वेग ${weather.wind} km/h आहे. आज फवारणी (pesticide spray) करणे टाळा. पॉलिहाऊस आणि शेडनेट सुरक्षित ठेवा.`
    });
  } else {
    advisories.push({
      type: 'info', icon: '💨', title: 'Spray Window',
      text: `वाऱ्याचा वेग ${weather.wind} km/h ${weather.windDir}. सकाळी 6-8 वाजता फवारणीसाठी चांगली वेळ आहे. UV Index ${weather.uvIndex} (${weather.uvLabel}).`
    });
  }

  // Rain advisory
  if (weather.rainfall > 10) {
    advisories.push({
      type: 'warning', icon: '🌧️', title: 'Rainfall Impact',
      text: `आज ${weather.rainfall} mm पाऊस झाला. सिंचन थांबवा. शेतातून पाण्याचा निचरा करा. खत आणि कीटकनाशक फवारणी पुढे ढका.`
    });
  } else {
    advisories.push({
      type: 'info', icon: '🌧️', title: 'Irrigation Advice',
      text: `आज ${weather.rainfall} mm पाऊस झाला. आर्द्रता ${weather.humidity}% आहे. ${weather.humidity < 60 ? 'सिंचनाची गरज आहे. ठिबक सिंचन वापरा.' : 'माती ओलसर आहे. सिंचन टाळा.'}`
    });
  }

  // Harvest advisory
  if (weather.humidity < 65 && weather.rainfall === 0) {
    advisories.push({
      type: 'success', icon: '🌾', title: 'Harvest Opportunity',
      text: `कोरडे हवामान आणि कमी आर्द्रता (${weather.humidity}%) धान्य आणि कडधान्य कापणीसाठी आदर्श आहे. यंत्रांनी काढणी करा.`
    });
  }

  container.innerHTML = advisories.map(a => `
    <div class="weather-advisory-card ${a.type}">
      <p class="weather-advisory-card__title">
        <span aria-hidden="true">${a.icon}</span> ${a.title}
      </p>
      <p class="weather-advisory-card__text">${a.text}</p>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────
   RENDER: Farm Activity Suitability (Dynamic)
────────────────────────────────────────────────────────── */
function renderActivityGrid(weather) {
  const container = document.getElementById('weather-activity-grid');
  if (!container) return;

  const isHot     = weather.temp >= 35;
  const isWindy   = weather.wind > 20;
  const isRainy   = weather.rainfall > 5;
  const isHumid   = weather.humidity > 85;
  const isClear   = weather.rainfall === 0 && !isHot;

  const activities = [
    {
      name: 'Sowing',
      icon: '🌱',
      status: isHot ? 'caution' : isRainy ? 'ideal' : 'moderate',
      statusLabel: isHot ? 'Caution – उष्णता' : isRainy ? 'Ideal' : 'Moderate',
      reason: isHot ? `तापमान ${weather.temp}°C - सकाळी लवकर पेरणी करा.` : isRainy ? 'पावसानंतर माती ओलसर - पेरणीसाठी उत्तम.' : 'सामान्य परिस्थिती. पेरणी करता येईल.'
    },
    {
      name: 'Irrigation',
      icon: '💧',
      status: isRainy ? 'avoid' : isHot ? 'ideal' : 'caution',
      statusLabel: isRainy ? 'Avoid – पाऊस आहे' : isHot ? 'Ideal (Early AM)' : 'Moderate',
      reason: isRainy ? `${weather.rainfall} mm पाऊस झाला - सिंचन टाळा.` : `${weather.temp}°C - सकाळी 5-7 वाजता सिंचन करा. ठिबक सिंचन वापरा.`
    },
    {
      name: 'Pesticide Spray',
      icon: '🧪',
      status: isWindy || isRainy ? 'avoid' : 'ideal',
      statusLabel: isWindy ? 'Avoid – वारा जास्त' : isRainy ? 'Avoid – पाऊस' : 'Ideal',
      reason: isWindy ? `वाऱ्याचा वेग ${weather.wind} km/h - फवारणी करू नका.` : isRainy ? 'पावसामुळे फवारणी निष्फळ होईल.' : `सकाळी 6-8 वाजता फवारणी करा. वारा ${weather.wind} km/h ${weather.windDir}.`
    },
    {
      name: 'Harvesting',
      icon: '🌾',
      status: isClear ? 'ideal' : isRainy ? 'avoid' : 'moderate',
      statusLabel: isClear ? 'Ideal' : isRainy ? 'Avoid' : 'Moderate',
      reason: isClear ? 'कोरडे आणि स्वच्छ हवामान - काढणीसाठी उत्तम.' : isRainy ? 'पावसामुळे काढणी टाळा - धान्य ओले होईल.' : 'सावधगिरीने काढणी करा.'
    },
    {
      name: 'Fertilizer Application',
      icon: '🏭',
      status: isRainy ? 'avoid' : 'moderate',
      statusLabel: isRainy ? 'Avoid – पाऊस' : 'Moderate',
      reason: isRainy ? 'पावसामुळे खत वाहून जाईल - उद्या किंवा पावसानंतर टाका.' : `सायंकाळी ${weather.temp}°C तापमान कमी झाल्यावर खत टाका. सिंचन नंतर करा.`
    },
    {
      name: 'Ploughing / Tillage',
      icon: '🚜',
      status: isRainy ? 'caution' : isHot ? 'caution' : 'ideal',
      statusLabel: isRainy ? 'Caution' : isHot ? 'Caution' : 'Ideal',
      reason: isRainy ? 'माती जड आहे - उथळ नांगरणी करा.' : isHot ? 'उष्णतेमुळे माती लवकर सुकते - सायंकाळी नांगरणी करा.' : 'नांगरणीसाठी चांगले हवामान आहे.'
    },
    {
      name: 'Transplanting',
      icon: '🌿',
      status: isHot ? 'avoid' : 'ideal',
      statusLabel: isHot ? 'Avoid 11–4 PM' : 'Ideal',
      reason: isHot ? `${weather.temp}°C उष्णतेमध्ये रोपे मरू शकतात. सकाळी 6-9 किंवा सायंकाळी 5-7 वाजता लावा.` : 'हवामान रोप लावणीसाठी अनुकूल आहे.'
    },
    {
      name: 'Weed Management',
      icon: '✂️',
      status: isHumid ? 'caution' : 'moderate',
      statusLabel: isHumid ? 'Caution – दमट' : 'Moderate',
      reason: isHumid ? `आर्द्रता ${weather.humidity}% - तणनाशक (herbicide) आज प्रभावी नाही. हाताने तण काढा.` : 'सकाळी हाताने तण काढता येईल. तणनाशक फवारणी शक्य आहे.'
    },
  ];

  container.innerHTML = activities.map(a => `
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
   RENDER: Irrigation Panel (Dynamic)
────────────────────────────────────────────────────────── */
function renderIrrigationPanel(weather) {
  const container = document.getElementById('weather-irrigation-panel');
  if (!container) return;

  // Penman–Monteith simplified ET0 estimate
  const et0 = ((0.0023 * (weather.temp + 17.8) * Math.sqrt(Math.abs(weather.high - weather.low)) * 0.408 * 35) / 10).toFixed(1);

  const slots = [
    { time: '5:00 AM – 7:00 AM', desc: 'Best window. कमी evaporation, थंड तापमान.', status: 'ideal', icon: 'fas fa-check-circle' },
    { time: '7:00 AM – 10:00 AM', desc: 'Acceptable. तापमान वाढत आहे.', status: 'caution', icon: 'fas fa-exclamation-triangle' },
    { time: '10:00 AM – 4:00 PM', desc: `Avoid. ${weather.temp}°C उष्णतेमुळे 40% जास्त evaporation.`, status: 'avoid', icon: 'fas fa-times-circle' },
    { time: '4:00 PM – 7:00 PM', desc: 'Good window. तापमान कमी होत आहे.', status: 'ideal', icon: 'fas fa-check-circle' },
  ];

  container.innerHTML = `
    <div style="background:var(--green-50); border:1px solid var(--dash-border); border-radius:var(--radius-md); padding:12px 14px; margin-bottom:4px;">
      <p style="font-size:0.8rem; font-weight:700; color:var(--primary); margin:0 0 4px;">🌡️ Today's ET₀ (Evapotranspiration) – ${currentCity}</p>
      <p style="font-size:1.1rem; font-weight:900; color:var(--text-primary); margin:0;">${et0} mm/day <span style="font-size:0.72rem; font-weight:600; color:var(--text-light);">(Live Estimate)</span></p>
    </div>
    ${slots.map(s => `
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
   RENDER: Spray Panel (Dynamic)
────────────────────────────────────────────────────────── */
function renderSprayPanel(weather) {
  const container = document.getElementById('weather-spray-panel');
  if (!container) return;

  const spraySlots = [
    { time: '6:00 AM – 8:00 AM', desc: 'Ideal: कमी वारा, थंड, पाऊस नाही.', status: 'ideal', icon: 'fas fa-check-circle' },
    { time: '8:00 AM – 11:00 AM', desc: 'Acceptable. फवारणीपूर्वी वाऱ्याचा वेग तपासा.', status: 'caution', icon: 'fas fa-exclamation-triangle' },
    { time: '11:00 AM – 5:00 PM', desc: `Not recommended: वारा ${weather.wind} km/h आणि UV ${weather.uvIndex} (${weather.uvLabel}).`, status: 'avoid', icon: 'fas fa-times-circle' },
    { time: '5:00 PM – 7:30 PM', desc: 'Acceptable. वारा कमी होत आहे.', status: 'caution', icon: 'fas fa-exclamation-triangle' },
  ];

  container.innerHTML = `
    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-md); padding:12px 14px; margin-bottom:4px;">
      <p style="font-size:0.78rem; font-weight:700; color:#1d4ed8; margin:0 0 4px;">फवारणीसाठी आजची स्थिती – ${currentCity}</p>
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <span style="font-size:0.8rem; color:var(--text-secondary);"><i class="fas fa-wind" aria-hidden="true"></i> वारा: <strong>${weather.wind} km/h ${weather.windDir}</strong></span>
        <span style="font-size:0.8rem; color:var(--text-secondary);"><i class="fas fa-tint" aria-hidden="true"></i> आर्द्रता: <strong>${weather.humidity}%</strong></span>
        <span style="font-size:0.8rem; color:var(--text-secondary);"><i class="fas fa-cloud-rain" aria-hidden="true"></i> पाऊस: <strong>${weather.rainfall} mm</strong></span>
      </div>
    </div>
    ${spraySlots.map(s => `
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
      <strong>Note:</strong> वाऱ्याचा वेग 12 km/h पेक्षा जास्त असल्यास किंवा 3 तासांत पाऊस येणार असल्यास फवारणी करू नका.
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   RENDER: Historical Comparison (Live vs normal)
────────────────────────────────────────────────────────── */
function renderHistoricalGrid(weather) {
  const container = document.getElementById('weather-historical-grid');
  if (!container) return;

  // July normals for Maharashtra
  const normals = { temp: 29, rainfall: 200, humidity: 80, uv: 7 };
  const month = new Date().toLocaleString('en-IN', { month: 'long' });

  const historicalData = [
    {
      label: `Temp (${month})`,
      val: `${weather.temp}°C`,
      compare: weather.temp > normals.temp ? `+${weather.temp - normals.temp}°C above normal` : `${weather.temp - normals.temp}°C below normal`,
      dir: weather.temp > normals.temp ? 'above' : weather.temp < normals.temp ? 'below' : 'normal'
    },
    {
      label: 'Humidity',
      val: `${weather.humidity}%`,
      compare: weather.humidity > normals.humidity ? `${weather.humidity - normals.humidity}% above normal` : weather.humidity === normals.humidity ? 'Normal range' : `${normals.humidity - weather.humidity}% below normal`,
      dir: weather.humidity > normals.humidity ? 'above' : weather.humidity < normals.humidity ? 'below' : 'normal'
    },
    {
      label: 'Wind Speed',
      val: `${weather.wind} km/h`,
      compare: weather.wind > 20 ? 'Above average' : weather.wind < 10 ? 'Below average' : 'Normal range',
      dir: weather.wind > 20 ? 'above' : weather.wind < 10 ? 'below' : 'normal'
    },
    {
      label: 'UV Index',
      val: `${weather.uvIndex}`,
      compare: weather.uvIndex > normals.uv ? `+${weather.uvIndex - normals.uv} above ${month} avg` : weather.uvIndex === normals.uv ? `Normal for ${month}` : `${normals.uv - weather.uvIndex} below avg`,
      dir: weather.uvIndex > normals.uv ? 'above' : weather.uvIndex < normals.uv ? 'below' : 'normal'
    },
  ];

  container.innerHTML = historicalData.map(h => `
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
   ALL DISTRICTS MAP (Live data panel)
────────────────────────────────────────────────────────── */
function initDistrictMap() {
  // Add a district overview section if it exists
  const mapContainer = document.getElementById('weather-district-overview');
  if (!mapContainer) return;

  mapContainer.innerHTML = `
    <div style="text-align:center; color:#64748b; padding:20px;">
      <i class="fas fa-spinner fa-spin" style="font-size:1.5rem; margin-bottom:8px;"></i>
      <p>सर्व जिल्ह्यांचे हवामान लोड होत आहे...</p>
    </div>
  `;

  // Fetch top 12 districts in background (to avoid rate limits)
  const topDistricts = MAHARASHTRA_DISTRICTS.slice(0, 12);
  Promise.allSettled(topDistricts.map(d => fetchLiveWeather(d)))
    .then(results => {
      const cards = results.map((res, i) => {
        const district = topDistricts[i];
        if (res.status !== 'fulfilled') {
          return `<div class="district-mini-card" style="opacity:0.5;">
            <span class="dist-name">${district.name}</span>
            <span class="dist-temp">--°C</span>
          </div>`;
        }
        const w = res.value;
        const condObj = WEATHER_CONDITIONS[w.condition] || WEATHER_CONDITIONS.partCloud;
        return `
          <div class="district-mini-card" onclick="selectLocation('${district.name}')"
               title="${district.name}: ${w.temp}°C, ${w.description}"
               style="cursor:pointer;"
               aria-label="${district.name}: ${w.temp}°C">
            <span class="dist-emoji">${condObj.emoji}</span>
            <span class="dist-name">${district.name}</span>
            <span class="dist-temp">${w.temp}°C</span>
            <span class="dist-humidity">${w.humidity}%💧</span>
          </div>
        `;
      }).join('');

      mapContainer.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap:8px;">
          ${cards}
        </div>
        <p style="font-size:0.72rem; color:#94a3b8; text-align:right; margin-top:8px;">
          🟢 Live data · जिल्ह्यावर क्लिक करा
        </p>
      `;
    });
}

/* ──────────────────────────────────────────────────────────
   LOCATION MODAL – 3-Step: District → Taluka → Village
────────────────────────────────────────────────────────── */
(function() {
  // Internal state
  let locStep = 'district';       // 'district' | 'taluka' | 'village'
  let locDistrict = null;
  let locTaluka   = null;

  /* ── helpers ── */
  function qs(sel) { return document.querySelector(sel); }

  function setStepActive(step) {
    locStep = step;
    ['district','taluka','village'].forEach(s => {
      const btn = document.getElementById('step-btn-' + s);
      if (!btn) return;
      btn.classList.toggle('active', s === step);
    });
  }

  function updateBreadcrumb() {
    const bc = document.getElementById('loc-breadcrumb');
    if (!bc) return;
    let html = `<span class="loc-bc-chip active" onclick="window.locGoToStep('district')">Maharashtra</span>`;
    if (locDistrict) {
      html += `<span class="loc-bc-sep">›</span>
               <span class="loc-bc-chip ${locStep === 'district' ? '' : 'active'}" onclick="window.locGoToStep('taluka')">${locDistrict}</span>`;
    }
    if (locTaluka) {
      html += `<span class="loc-bc-sep">›</span>
               <span class="loc-bc-chip active">${locTaluka}</span>`;
    }
    bc.innerHTML = html;
  }

  function updateCountInfo(text) {
    const el = document.getElementById('loc-count-info');
    if (el) el.textContent = text;
  }

  /* ── STEP 1: Show all 36 Districts ── */
  function renderDistrictStep(filter) {
    const content = document.getElementById('loc-step-content');
    if (!content) return;

    const districts = Object.keys(MH_LOCATION_DATA).sort();
    const q = (filter || '').toLowerCase();
    const filtered = q ? districts.filter(d => d.toLowerCase().includes(q)) : districts;

    updateCountInfo(`${filtered.length} जिल्हे`);

    if (!filtered.length) {
      content.innerHTML = `<div style="text-align:center; padding:24px; color:#94a3b8;">
        <i class="fas fa-search-minus" style="font-size:2rem; margin-bottom:8px;"></i>
        <p style="margin:0;">कोणताही जिल्हा सापडला नाही</p></div>`;
      return;
    }

    content.innerHTML = filtered.map(d => {
      const data = MH_LOCATION_DATA[d];
      const talukaCount = data ? data.talukas.length : 0;
      const villageCount = data ? data.talukas.reduce((s, t) => s + t.villages.length, 0) : 0;
      return `<button class="loc-grid-btn${locDistrict === d ? ' selected' : ''}"
                onclick="window.locSelectDistrict('${d}')"
                aria-label="${d} जिल्हा निवडा - ${talukaCount} तालुके, ${villageCount} गावे">
        <span>
          <i class="fas fa-map-marker-alt" style="color:#16a34a; margin-right:6px;"></i>${d}
          <div class="loc-btn-meta">${talukaCount} तालुके &nbsp;·&nbsp; ${villageCount} गावे</div>
        </span>
        <i class="fas fa-chevron-right loc-btn-arrow"></i>
      </button>`;
    }).join('');
  }

  /* ── STEP 2: Show Talukas of selected District ── */
  function renderTalukaStep(filter) {
    const content = document.getElementById('loc-step-content');
    if (!content || !locDistrict) return;

    const data = MH_LOCATION_DATA[locDistrict];
    if (!data) return;

    const q = (filter || '').toLowerCase();
    const talukas = q
      ? data.talukas.filter(t => t.name.toLowerCase().includes(q))
      : data.talukas;

    updateCountInfo(`${talukas.length} तालुके`);

    if (!talukas.length) {
      content.innerHTML = `<div style="text-align:center; padding:24px; color:#94a3b8;">
        <i class="fas fa-search-minus" style="font-size:2rem; margin-bottom:8px;"></i>
        <p style="margin:0;">कोणताही तालुका सापडला नाही</p></div>`;
      return;
    }

    // Also allow selecting just the district
    content.innerHTML = `
      <div style="margin-bottom:10px; padding:10px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px;">
        <button class="loc-grid-btn" style="margin:0; background:transparent; border:none; padding:0;"
          onclick="window.selectLocation('${locDistrict}')"
          aria-label="${locDistrict} जिल्हा निवडा (तालुका नाही)">
          <span><i class="fas fa-cloud-sun" style="color:#2563eb; margin-right:6px;"></i>
            <strong>${locDistrict} District</strong>
            <div class="loc-btn-meta">फक्त जिल्ह्याचे हवामान पाहा</div>
          </span>
          <i class="fas fa-check-circle" style="color:#2563eb;"></i>
        </button>
      </div>
      <p style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:0 0 8px; letter-spacing:0.05em;">
        किंवा तालुका निवडा:
      </p>
      ${talukas.map(t => {
        const vCount = t.villages.length;
        return `<button class="loc-grid-btn${locTaluka === t.name ? ' selected' : ''}"
          onclick="window.locSelectTaluka('${t.name}')"
          aria-label="${t.name} तालुका - ${vCount} गावे">
          <span>
            <i class="fas fa-layer-group" style="color:#f59e0b; margin-right:6px;"></i>${t.name}
            <div class="loc-btn-meta">${vCount} गावे</div>
          </span>
          <i class="fas fa-chevron-right loc-btn-arrow"></i>
        </button>`;
      }).join('')}`;
  }

  /* ── STEP 3: Show Villages of selected Taluka ── */
  function renderVillageStep(filter) {
    const content = document.getElementById('loc-step-content');
    if (!content || !locDistrict || !locTaluka) return;

    const data = MH_LOCATION_DATA[locDistrict];
    if (!data) return;
    const talukaObj = data.talukas.find(t => t.name === locTaluka);
    if (!talukaObj) return;

    const q = (filter || '').toLowerCase();
    const villages = q
      ? talukaObj.villages.filter(v => v.toLowerCase().includes(q))
      : talukaObj.villages;

    updateCountInfo(`${villages.length} गावे`);

    if (!villages.length) {
      content.innerHTML = `<div style="text-align:center; padding:24px; color:#94a3b8;">
        <i class="fas fa-search-minus" style="font-size:2rem; margin-bottom:8px;"></i>
        <p style="margin:0;">कोणतेही गाव सापडले नाही</p></div>`;
      return;
    }

    // Allow selecting just the taluka
    content.innerHTML = `
      <div style="margin-bottom:10px; padding:10px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px;">
        <button class="loc-grid-btn" style="margin:0; background:transparent; border:none; padding:0;"
          onclick="window.selectLocation('${locTaluka}')"
          aria-label="${locTaluka} तालुका निवडा">
          <span><i class="fas fa-cloud-sun" style="color:#2563eb; margin-right:6px;"></i>
            <strong>${locTaluka} Taluka</strong>
            <div class="loc-btn-meta">फक्त तालुक्याचे हवामान पाहा</div>
          </span>
          <i class="fas fa-check-circle" style="color:#2563eb;"></i>
        </button>
      </div>
      <p style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase; margin:0 0 8px; letter-spacing:0.05em;">
        किंवा गाव निवडा (${villages.length} गावे – ${locTaluka} तालुका):
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:2px;">
        ${villages.map(v => `
          <button class="loc-village-chip"
            onclick="window.selectLocation('${v}')"
            aria-label="${v} गाव निवडा">
            <i class="fas fa-home" style="font-size:0.6rem;"></i> ${v}
          </button>`).join('')}
      </div>`;
  }

  /* ── Public: step switcher ── */
  window.locGoToStep = function(step) {
    if (step === 'district') {
      locDistrict = null;
      locTaluka   = null;
      const tbtn = document.getElementById('step-btn-taluka');
      const vbtn = document.getElementById('step-btn-village');
      if (tbtn) tbtn.disabled = true;
      if (vbtn) vbtn.disabled = true;
    } else if (step === 'taluka') {
      if (!locDistrict) return;
      locTaluka = null;
      const vbtn = document.getElementById('step-btn-village');
      if (vbtn) vbtn.disabled = true;
    } else if (step === 'village') {
      if (!locTaluka) return;
    }
    setStepActive(step);
    updateBreadcrumb();
    clearSearch();
    renderCurrentStep();
  };

  window.locSelectDistrict = function(district) {
    locDistrict = district;
    locTaluka   = null;
    const tbtn = document.getElementById('step-btn-taluka');
    const vbtn = document.getElementById('step-btn-village');
    if (tbtn) { tbtn.disabled = false; }
    if (vbtn) { vbtn.disabled = true; }
    setStepActive('taluka');
    updateBreadcrumb();
    clearSearch();
    renderTalukaStep('');
  };

  window.locSelectTaluka = function(taluka) {
    locTaluka = taluka;
    const vbtn = document.getElementById('step-btn-village');
    if (vbtn) vbtn.disabled = false;
    setStepActive('village');
    updateBreadcrumb();
    clearSearch();
    renderVillageStep('');
  };

  function renderCurrentStep(filter) {
    const f = filter || '';
    if (locStep === 'district') renderDistrictStep(f);
    else if (locStep === 'taluka') renderTalukaStep(f);
    else renderVillageStep(f);
  }

  function clearSearch() {
    const inp = document.getElementById('loc-search-input');
    if (inp) inp.value = '';
  }

  /* ── INIT ── */
  function initLocationModal() {
    const overlay   = document.getElementById('location-modal-overlay');
    const changeBtn = document.getElementById('location-change-btn');
    const closeBtn  = document.getElementById('location-modal-close');
    const searchInp = document.getElementById('loc-search-input');

    if (!overlay) return;

    // Render initial district list
    renderDistrictStep('');

    if (changeBtn) {
      changeBtn.addEventListener('click', () => {
        // Reset to district step each time modal opens
        locStep     = 'district';
        locDistrict = null;
        locTaluka   = null;
        const tbtn = document.getElementById('step-btn-taluka');
        const vbtn = document.getElementById('step-btn-village');
        if (tbtn) tbtn.disabled = true;
        if (vbtn) vbtn.disabled = true;
        setStepActive('district');
        updateBreadcrumb();
        clearSearch();
        renderDistrictStep('');
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
      });
    }

    function closeModal() { overlay.style.display = 'none'; }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.style.display !== 'none') closeModal();
    });

    if (searchInp) {
      searchInp.addEventListener('input', () => {
        renderCurrentStep(searchInp.value);
      });
    }
  }

  // Export so weather.js can call it
  window._initLocationModal = initLocationModal;
})();

function initLocationModal() {
  if (window._initLocationModal) window._initLocationModal();
}


/* ──────────────────────────────────────────────────────────
   SELECT LOCATION → Fetch Live Data
────────────────────────────────────────────────────────── */
window.selectLocation = async function(city) {
  if (isLoading) return;
  isLoading = true;

  currentCity = city;

  const overlay = document.getElementById('location-modal-overlay');
  if (overlay) overlay.style.display = 'none';

  showLoading(`${city} साठी live हवामान आणत आहे...`);

  try {
    const districtObj = MAHARASHTRA_DISTRICTS.find(d => d.name === city)
      || { name: city, lat: 19.0760, lon: 72.8777 }; // fallback to Mumbai coords

    const weather = await fetchLiveWeather(districtObj);
    currentWeather = weather;

    hideLoading();
    renderWeatherDashboard();

    if (window.showToast) {
      window.showToast(`${city} चे live हवामान अपडेट झाले ✅`, 'success');
    }
  } catch (err) {
    console.error('Weather fetch error:', err);
    hideLoading();
    showApiError(err.message);
  } finally {
    isLoading = false;
  }
};

/* ──────────────────────────────────────────────────────────
   API ERROR UI
────────────────────────────────────────────────────────── */
function showApiError(msg) {
  const heroCard = document.getElementById('weather-main-card');
  if (heroCard) {
    const errBanner = document.getElementById('weather-api-error') || document.createElement('div');
    errBanner.id = 'weather-api-error';
    errBanner.style.cssText = `
      background:#fee2e2; border:1px solid #fca5a5; border-radius:12px;
      padding:16px; margin:12px 0; text-align:center; color:#991b1b;
    `;
    errBanner.innerHTML = `
      <strong>⚠️ Live API Error</strong><br>
      <small>${msg}</small><br>
      <small>OpenWeatherMap API key तपासा. <a href="https://openweathermap.org/api" target="_blank" style="color:#1d4ed8;">येथे मोफत key मिळवा →</a></small>
    `;
    heroCard.parentElement.insertBefore(errBanner, heroCard.nextSibling);
  }
  if (window.showToast) {
    window.showToast('Live weather fetch failed. API key check करा.', 'error');
  }
}

/* ──────────────────────────────────────────────────────────
   REFRESH BUTTON (Live)
────────────────────────────────────────────────────────── */
function initRefreshButton() {
  const btn = document.getElementById('weather-refresh-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (isLoading) return;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Refreshing...';
    btn.disabled = true;

    // Clear cache for current city to force fresh fetch
    delete weatherCache[currentCity];

    try {
      const districtObj = MAHARASHTRA_DISTRICTS.find(d => d.name === currentCity)
        || { name: currentCity, lat: 19.0760, lon: 72.8777 };

      showLoading(`${currentCity} साठी ताजे हवामान आणत आहे...`);
      currentWeather = await fetchLiveWeather(districtObj);
      hideLoading();
      renderWeatherDashboard();

      if (window.showToast) {
        window.showToast(`${currentCity} चे live हवामान refresh झाले 🔄`, 'success');
      }
    } catch (err) {
      hideLoading();
      showApiError(err.message);
    } finally {
      btn.innerHTML = '<i class="fas fa-sync-alt" aria-hidden="true"></i> Refresh';
      btn.disabled = false;
    }
  });
}

/* ──────────────────────────────────────────────────────────
   MASTER RENDER FUNCTION
────────────────────────────────────────────────────────── */
function renderWeatherDashboard() {
  const weather = currentWeather;
  if (!weather) return;

  renderCurrentConditions(weather, currentCity);
  renderAlerts(weather.alerts);
  renderHourlyForecast(weather);
  render7DayForecast(weather);
  renderRainfallChart(weather);
  renderAIAdvisory(weather);
  renderActivityGrid(weather);
  renderIrrigationPanel(weather);
  renderSprayPanel(weather);
  renderHistoricalGrid(weather);

  setTimeout(animateStatsEntrance, 100);
}

/* ──────────────────────────────────────────────────────────
   ANIMATE STATS ON LOAD
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
   ADD DISTRICT MINI CARD STYLES
────────────────────────────────────────────────────────── */
function injectDistrictStyles() {
  if (document.getElementById('district-mini-styles')) return;
  const style = document.createElement('style');
  style.id = 'district-mini-styles';
  style.textContent = `
    .district-mini-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 8px;
      text-align: center;
      transition: all 0.2s ease;
      display: flex; flex-direction: column; align-items: center; gap: 2px;
    }
    .district-mini-card:hover {
      border-color: #16a34a;
      box-shadow: 0 4px 12px rgba(22,163,74,0.15);
      transform: translateY(-2px);
    }
    .dist-emoji { font-size: 1.3rem; }
    .dist-name  { font-size: 0.7rem; font-weight: 700; color: #374151; }
    .dist-temp  { font-size: 0.9rem; font-weight: 900; color: #111827; }
    .dist-humidity { font-size: 0.65rem; color: #6b7280; }
  `;
  document.head.appendChild(style);
}

/* ──────────────────────────────────────────────────────────
   INIT – Main Entry Point
────────────────────────────────────────────────────────── */
async function initWeatherPage() {
  injectDistrictStyles();
  showLoading('Nagpur साठी live हवामान आणत आहे...');

  try {
    const defaultDistrict = MAHARASHTRA_DISTRICTS.find(d => d.name === 'Nagpur');
    updateLoadingMsg('OpenWeatherMap API शी जोडत आहे...');
    currentWeather = await fetchLiveWeather(defaultDistrict);

    hideLoading();

    // Render main dashboard
    renderWeatherDashboard();

    // Init UI interactions
    initLocationModal();
    initRefreshButton();

    // Load district overview in background
    setTimeout(() => initDistrictMap(), 1000);

    console.log('✅ KrishiMitra: Live weather loaded for', currentCity);
  } catch (err) {
    console.error('Weather init error:', err);
    hideLoading();
    showApiError(err.message);

    // Still init UI
    initLocationModal();
    initRefreshButton();
  }
}

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeatherPage);
} else {
  initWeatherPage();
}
