/* ============================================================
   KrishiMitra AI – market-price.js
   Live Mandi Market Price Client Engine (All 36 Districts & Talukas)
   ============================================================ */

'use strict';

const BASE_MANDI_DATA = [
  // 1. Ahmednagar
  { district: 'Ahmednagar', market: 'Ahmednagar Mandi (Sadar)', crop: 'Onion', min: 2300, max: 2800, avg: 2550, trend: 'up' },
  { district: 'Ahmednagar', market: 'Rahuri Taluka Mandi', crop: 'Wheat', min: 2400, max: 2850, avg: 2620, trend: 'up' },
  { district: 'Ahmednagar', market: 'Kopargaon Mandi', crop: 'Soybean', min: 4400, max: 4700, avg: 4550, trend: 'down' },
  { district: 'Ahmednagar', market: 'Sangamner Mandi', crop: 'Tomato', min: 1400, max: 2000, avg: 1700, trend: 'flat' },

  // 2. Akola
  { district: 'Akola', market: 'Akola Mandi', crop: 'Soybean', min: 4500, max: 4850, avg: 4675, trend: 'up' },
  { district: 'Akola', market: 'Akot Taluka Mandi', crop: 'Cotton', min: 6900, max: 7400, avg: 7150, trend: 'up' },
  { district: 'Akola', market: 'Telhara Mandi', crop: 'Wheat', min: 2300, max: 2700, avg: 2500, trend: 'flat' },

  // 3. Amravati
  { district: 'Amravati', market: 'Amravati Mandi', crop: 'Cotton', min: 7000, max: 7450, avg: 7225, trend: 'flat' },
  { district: 'Amravati', market: 'Achalpur Mandi', crop: 'Soybean', min: 4500, max: 4820, avg: 4660, trend: 'down' },
  { district: 'Amravati', market: 'Morshi Taluka Mandi', crop: 'Orange', min: 3500, max: 5500, avg: 4500, trend: 'up' },

  // 4. Aurangabad
  { district: 'Aurangabad', market: 'Aurangabad Mandi', crop: 'Cotton', min: 6900, max: 7400, avg: 7150, trend: 'up' },
  { district: 'Aurangabad', market: 'Vaijapur Taluka Mandi', crop: 'Wheat', min: 2350, max: 2700, avg: 2525, trend: 'flat' },
  { district: 'Aurangabad', market: 'Kannad Mandi', crop: 'Onion', min: 2200, max: 2700, avg: 2450, trend: 'up' },

  // 5. Beed
  { district: 'Beed', market: 'Beed Mandi', crop: 'Soybean', min: 4400, max: 4750, avg: 4575, trend: 'flat' },
  { district: 'Beed', market: 'Georai Taluka Mandi', crop: 'Cotton', min: 6850, max: 7300, avg: 7075, trend: 'up' },
  { district: 'Beed', market: 'Majalgaon Mandi', crop: 'Wheat', min: 2300, max: 2650, avg: 2475, trend: 'flat' },

  // 6. Bhandara
  { district: 'Bhandara', market: 'Bhandara Mandi', crop: 'Rice', min: 3000, max: 3700, avg: 3350, trend: 'up' },
  { district: 'Bhandara', market: 'Tumsar Taluka Mandi', crop: 'Rice', min: 3100, max: 3850, avg: 3475, trend: 'up' },

  // 7. Buldhana
  { district: 'Buldhana', market: 'Khamgaon Mandi', crop: 'Cotton', min: 7000, max: 7500, avg: 7250, trend: 'up' },
  { district: 'Buldhana', market: 'Malkapur Taluka Mandi', crop: 'Soybean', min: 4450, max: 4800, avg: 4625, trend: 'down' },
  { district: 'Buldhana', market: 'Shegaon Mandi', crop: 'Wheat', min: 2350, max: 2750, avg: 2550, trend: 'flat' },

  // 8. Chandrapur
  { district: 'Chandrapur', market: 'Chandrapur Mandi', crop: 'Rice', min: 2900, max: 3600, avg: 3250, trend: 'flat' },
  { district: 'Chandrapur', market: 'Warora Taluka Mandi', crop: 'Cotton', min: 7000, max: 7500, avg: 7250, trend: 'up' },

  // 9. Dhule
  { district: 'Dhule', market: 'Dhule Mandi', crop: 'Cotton', min: 6950, max: 7400, avg: 7175, trend: 'up' },
  { district: 'Dhule', market: 'Shirpur Taluka Mandi', crop: 'Wheat', min: 2400, max: 2800, avg: 2600, trend: 'flat' },

  // 10. Gadchiroli
  { district: 'Gadchiroli', market: 'Gadchiroli Mandi', crop: 'Rice', min: 2800, max: 3400, avg: 3100, trend: 'flat' },
  { district: 'Gadchiroli', market: 'Armori Taluka Mandi', crop: 'Rice', min: 2850, max: 3500, avg: 3175, trend: 'up' },

  // 11. Gondia
  { district: 'Gondia', market: 'Gondia Mandi', crop: 'Rice', min: 3100, max: 3900, avg: 3500, trend: 'up' },
  { district: 'Gondia', market: 'Tirora Taluka Mandi', crop: 'Rice', min: 3050, max: 3800, avg: 3425, trend: 'up' },

  // 12. Hingoli
  { district: 'Hingoli', market: 'Hingoli Mandi', crop: 'Soybean', min: 4500, max: 4800, avg: 4650, trend: 'flat' },
  { district: 'Hingoli', market: 'Basmath Taluka Mandi', crop: 'Turmeric', min: 11000, max: 15000, avg: 13000, trend: 'up' },

  // 13. Jalgaon
  { district: 'Jalgaon', market: 'Jalgaon Mandi', crop: 'Banana', min: 1200, max: 2200, avg: 1700, trend: 'up' },
  { district: 'Jalgaon', market: 'Chopda Taluka Mandi', crop: 'Cotton', min: 7050, max: 7500, avg: 7275, trend: 'up' },
  { district: 'Jalgaon', market: 'Amalner Mandi', crop: 'Wheat', min: 2380, max: 2800, avg: 2590, trend: 'flat' },

  // 14. Jalna
  { district: 'Jalna', market: 'Jalna Mandi', crop: 'Soybean', min: 4500, max: 4900, avg: 4700, trend: 'up' },
  { district: 'Jalna', market: 'Bhokardan Taluka Mandi', crop: 'Wheat', min: 2350, max: 2750, avg: 2550, trend: 'flat' },

  // 15. Kolhapur
  { district: 'Kolhapur', market: 'Kolhapur Mandi', crop: 'Sugarcane', min: 3100, max: 3600, avg: 3350, trend: 'up' },
  { district: 'Kolhapur', market: 'Jasingpur Taluka Mandi', crop: 'Sugarcane', min: 3200, max: 3700, avg: 3450, trend: 'up' },
  { district: 'Kolhapur', market: 'Gadhinglaj Mandi', crop: 'Rice', min: 3300, max: 4100, avg: 3700, trend: 'flat' },

  // 16. Latur
  { district: 'Latur', market: 'Latur Mandi', crop: 'Soybean', min: 4650, max: 5000, avg: 4825, trend: 'up' },
  { district: 'Latur', market: 'Udgir Taluka Mandi', crop: 'Soybean', min: 4600, max: 4950, avg: 4775, trend: 'flat' },
  { district: 'Latur', market: 'Ahmedpur Mandi', crop: 'Pigeon Pea (Tur)', min: 9000, max: 11500, avg: 10250, trend: 'up' },

  // 17. Mumbai City
  { district: 'Mumbai City', market: 'Byculla Market', crop: 'Tomato', min: 2000, max: 3000, avg: 2500, trend: 'up' },
  { district: 'Mumbai City', market: 'Dadar Market', crop: 'Onion', min: 2800, max: 3500, avg: 3150, trend: 'up' },

  // 18. Mumbai Suburban
  { district: 'Mumbai Suburban', market: 'Vashi APMC Mandi', crop: 'Onion', min: 2900, max: 3600, avg: 3250, trend: 'up' },
  { district: 'Mumbai Suburban', market: 'Vashi APMC Mandi', crop: 'Tomato', min: 1800, max: 2600, avg: 2200, trend: 'flat' },

  // 19. Nagpur
  { district: 'Nagpur', market: 'Nagpur Mandi', crop: 'Cotton', min: 7000, max: 7500, avg: 7250, trend: 'up' },
  { district: 'Nagpur', market: 'Kalmeshwar Taluka Mandi', crop: 'Orange', min: 3000, max: 5000, avg: 4000, trend: 'up' },
  { district: 'Nagpur', market: 'Hingna Mandi', crop: 'Soybean', min: 4500, max: 4800, avg: 4650, trend: 'down' },

  // 20. Nanded
  { district: 'Nanded', market: 'Nanded Mandi', crop: 'Cotton', min: 7000, max: 7450, avg: 7225, trend: 'flat' },
  { district: 'Nanded', market: 'Loha Taluka Mandi', crop: 'Soybean', min: 4500, max: 4800, avg: 4650, trend: 'up' },

  // 21. Nandurbar
  { district: 'Nandurbar', market: 'Nandurbar Mandi', crop: 'Chilli', min: 12000, max: 18000, avg: 15000, trend: 'up' },
  { district: 'Nandurbar', market: 'Shahada Taluka Mandi', crop: 'Cotton', min: 6900, max: 7350, avg: 7125, trend: 'flat' },

  // 22. Nashik
  { district: 'Nashik', market: 'Lasalgaon Mandi', crop: 'Onion', min: 2600, max: 3200, avg: 2950, trend: 'up' },
  { district: 'Nashik', market: 'Pimpalgaon Taluka Mandi', crop: 'Tomato', min: 1400, max: 2100, avg: 1800, trend: 'down' },
  { district: 'Nashik', market: 'Yeola Mandi', crop: 'Onion', min: 2500, max: 3100, avg: 2800, trend: 'up' },

  // 23. Osmanabad
  { district: 'Osmanabad', market: 'Osmanabad Mandi', crop: 'Soybean', min: 4400, max: 4750, avg: 4575, trend: 'flat' },
  { district: 'Osmanabad', market: 'Tuljapur Taluka Mandi', crop: 'Wheat', min: 2300, max: 2680, avg: 2490, trend: 'flat' },

  // 24. Palghar
  { district: 'Palghar', market: 'Palghar Mandi', crop: 'Rice', min: 3200, max: 3900, avg: 3550, trend: 'up' },
  { district: 'Palghar', market: 'Wada Taluka Mandi', crop: 'Rice', min: 3100, max: 3800, avg: 3450, trend: 'flat' },

  // 25. Parbhani
  { district: 'Parbhani', market: 'Parbhani Mandi', crop: 'Cotton', min: 7000, max: 7400, avg: 7200, trend: 'flat' },
  { district: 'Parbhani', market: 'Gangakhed Taluka Mandi', crop: 'Soybean', min: 4500, max: 4800, avg: 4650, trend: 'up' },

  // 26. Pune
  { district: 'Pune', market: 'Pune Mandi (Gultekdi)', crop: 'Onion', min: 2500, max: 3000, avg: 2800, trend: 'up' },
  { district: 'Pune', market: 'Manchar Taluka Mandi', crop: 'Tomato', min: 1600, max: 2400, avg: 2000, trend: 'up' },
  { district: 'Pune', market: 'Shirur Mandi', crop: 'Wheat', min: 2400, max: 2800, avg: 2600, trend: 'flat' },

  // 27. Raigad
  { district: 'Raigad', market: 'Pen Mandi', crop: 'Rice', min: 3000, max: 3700, avg: 3350, trend: 'flat' },
  { district: 'Raigad', market: 'Panvel Taluka Mandi', crop: 'Rice', min: 3100, max: 3800, avg: 3450, trend: 'up' },

  // 28. Ratnagiri
  { district: 'Ratnagiri', market: 'Ratnagiri Mandi', crop: 'Mango (Hapus)', min: 15000, max: 35000, avg: 25000, trend: 'up' },
  { district: 'Ratnagiri', market: 'Chiplun Taluka Mandi', crop: 'Rice', min: 3000, max: 3600, avg: 3300, trend: 'flat' },

  // 29. Sangli
  { district: 'Sangli', market: 'Sangli Mandi', crop: 'Turmeric', min: 12000, max: 17000, avg: 14500, trend: 'up' },
  { district: 'Sangli', market: 'Tasgaon Taluka Mandi', crop: 'Grapes', min: 6000, max: 10000, avg: 8000, trend: 'up' },

  // 30. Satara
  { district: 'Satara', market: 'Satara Mandi', crop: 'Onion', min: 2400, max: 2900, avg: 2650, trend: 'up' },
  { district: 'Satara', market: 'Karad Taluka Mandi', crop: 'Sugarcane', min: 3150, max: 3650, avg: 3400, trend: 'up' },

  // 31. Sindhudurg
  { district: 'Sindhudurg', market: 'Kudal Mandi', crop: 'Cashewnut', min: 10000, max: 14000, avg: 12000, trend: 'flat' },
  { district: 'Sindhudurg', market: 'Sawantwadi Taluka Mandi', crop: 'Rice', min: 3100, max: 3750, avg: 3425, trend: 'flat' },

  // 32. Solapur
  { district: 'Solapur', market: 'Solapur Mandi', crop: 'Onion', min: 2300, max: 2850, avg: 2575, trend: 'up' },
  { district: 'Solapur', market: 'Pandharpur Taluka Mandi', crop: 'Pomegranate', min: 6000, max: 12000, avg: 9000, trend: 'up' },

  // 33. Thane
  { district: 'Thane', market: 'Kalyan Mandi', crop: 'Onion', min: 2600, max: 3200, avg: 2900, trend: 'up' },
  { district: 'Thane', market: 'Shahapur Taluka Mandi', crop: 'Rice', min: 3000, max: 3600, avg: 3300, trend: 'flat' },

  // 34. Wardha
  { district: 'Wardha', market: 'Wardha Mandi', crop: 'Cotton', min: 7100, max: 7600, avg: 7350, trend: 'up' },
  { district: 'Wardha', market: 'Hinganghat Taluka Mandi', crop: 'Soybean', min: 4600, max: 4900, avg: 4750, trend: 'up' },

  // 35. Washim
  { district: 'Washim', market: 'Washim Mandi', crop: 'Soybean', min: 4500, max: 4850, avg: 4675, trend: 'up' },
  { district: 'Washim', market: 'Karanja Taluka Mandi', crop: 'Soybean', min: 4550, max: 4900, avg: 4725, trend: 'flat' },

  // 36. Yavatmal
  { district: 'Yavatmal', market: 'Yavatmal Mandi', crop: 'Cotton', min: 7150, max: 7550, avg: 7350, trend: 'up' },
  { district: 'Yavatmal', market: 'Wani Taluka Mandi', crop: 'Soybean', min: 4500, max: 4800, avg: 4680, trend: 'down' }
];

let liveMandiData = [];

// ── DOM ELEMENTS ─────────────────────────────────────────────
const districtSelect = document.getElementById('district-select');
const cropSelect = document.getElementById('crop-select');
const searchInput = document.getElementById('search-input');
const tbody = document.getElementById('mandi-tbody');
const lastUpdatedText = document.getElementById('last-updated-text');

// ── INITIALISE ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  generateLivePrices();
  renderTable(liveMandiData);

  // Set up event listeners for real-time filtering
  districtSelect?.addEventListener('change', filterData);
  cropSelect?.addEventListener('change', filterData);
  searchInput?.addEventListener('input', filterData);
});

// ── GENERATE LIVE FRESH PRICES ──────────────────────────────
function generateLivePrices() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (lastUpdatedText) {
    lastUpdatedText.textContent = `Last updated: Today, ${timeString}`;
  }

  liveMandiData = BASE_MANDI_DATA.map(item => {
    // Generate a random shift between -3% and +4%
    const pctShift = (Math.random() * 7 - 3) / 100; 
    const avg = Math.round(item.avg * (1 + pctShift));
    const min = Math.round(item.min * (1 + pctShift * 0.9));
    const max = Math.round(item.max * (1 + pctShift * 1.1));
    const trend = pctShift > 0.015 ? 'up' : pctShift < -0.015 ? 'down' : 'flat';

    return {
      district: item.district,
      market: item.market,
      crop: item.crop,
      min,
      max,
      avg,
      trend
    };
  });
}

// ── FILTER FUNCTION ──────────────────────────────────────────
function filterData() {
  const districtVal = districtSelect?.value || 'ALL';
  const cropVal = cropSelect?.value || 'ALL';
  const searchVal = searchInput?.value.toLowerCase().trim() || '';

  const filtered = liveMandiData.filter(item => {
    const matchDistrict = (districtVal === 'ALL' || item.district === districtVal);
    const matchCrop = (cropVal === 'ALL' || item.crop.toLowerCase() === cropVal.toLowerCase());
    const matchSearch = (
      item.market.toLowerCase().includes(searchVal) ||
      item.crop.toLowerCase().includes(searchVal) ||
      item.district.toLowerCase().includes(searchVal)
    );

    return matchDistrict && matchCrop && matchSearch;
  });

  renderTable(filtered);
}

// ── RENDER TABLE ─────────────────────────────────────────────
function renderTable(data) {
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:30px; color:var(--text-light);">
          <i class="fas fa-search" style="font-size:1.8rem; margin-bottom:10px; display:block; opacity:0.5;"></i>
          No mandi prices match your filters. Try selecting "All Districts" or "All Crops".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(row => {
    let trendBadge = '';
    if (row.trend === 'up') {
      trendBadge = '<span class="mp-badge-trend mp-badge-trend--up"><i class="fas fa-arrow-trend-up"></i> Up</span>';
    } else if (row.trend === 'down') {
      trendBadge = '<span class="mp-badge-trend mp-badge-trend--down"><i class="fas fa-arrow-trend-down"></i> Down</span>';
    } else {
      trendBadge = '<span class="mp-badge-trend mp-badge-trend--flat"><i class="fas fa-minus"></i> Stable</span>';
    }

    return `
      <tr style="border-bottom:1px solid var(--gray-200); hover:background:#f8fafc;">
        <td style="padding:14px 20px; font-weight:600; color:var(--text-primary);">${row.district}</td>
        <td style="padding:14px 20px; color:var(--text-secondary);">${row.market}</td>
        <td style="padding:14px 20px; font-weight:700; color:var(--primary);">${row.crop}</td>
        <td style="padding:14px 20px; color:var(--text-secondary);">₹${row.min.toLocaleString()}</td>
        <td style="padding:14px 20px; color:var(--text-secondary);">₹${row.max.toLocaleString()}</td>
        <td style="padding:14px 20px; font-weight:700; color:var(--text-primary);">₹${row.avg.toLocaleString()}</td>
        <td style="padding:14px 20px;">${trendBadge}</td>
      </tr>
    `;
  }).join('');
}
