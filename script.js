const countrySelect = document.getElementById('country-select');
const yearSelect = document.getElementById('year-select');
const searchInput = document.getElementById('search-input');
const statusMessage = document.getElementById('status-message');
const resultsCount = document.getElementById('results-count');
const holidaysGrid = document.getElementById('holidays-grid');

// Countdown Elements
const countdownCard = document.getElementById('countdown-card');
const countdownTitle = document.getElementById('countdown-title');
const countdownDate = document.getElementById('countdown-date');
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');

let allHolidays = [];
let countdownInterval = null;
let nextHolidayTarget = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  await fetchCountries();
  if (countrySelect.value) {
    fetchHolidays();
  }
});

// Event Listeners
countrySelect.addEventListener('change', fetchHolidays);
yearSelect.addEventListener('change', fetchHolidays);
searchInput.addEventListener('input', filterAndRenderHolidays);

// Fetch Available Countries
async function fetchCountries() {
  try {
    const response = await fetch('https://date.nager.at/api/v3/AvailableCountries');
    if (!response.ok) throw new Error('Failed to load country list');
    
    const countries = await response.json();
    countrySelect.innerHTML = countries
      .map(c => `<option value="${c.countryCode}">${c.name}</option>`)
      .join('');

    // Default selection (e.g., US)
    const defaultCountry = countries.find(c => c.countryCode === 'US');
    if (defaultCountry) countrySelect.value = 'US';
  } catch (err) {
    showError('Could not load countries. Please refresh.');
  }
}

// Fetch Holidays for Selected Country & Year
async function fetchHolidays() {
  const countryCode = countrySelect.value;
  const year = yearSelect.value;

  if (!countryCode || !year) return;

  showLoading(`Fetching holidays for ${countryCode} in ${year}...`);

  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP Error status: ${response.status}`);

    allHolidays = await response.json();
    clearStatus();
    setupNextHolidayCountdown();
    filterAndRenderHolidays();
  } catch (err) {
    showError(`Error fetching holidays: ${err.message}`);
    holidaysGrid.innerHTML = '';
    resultsCount.textContent = '';
    countdownCard.classList.add('hidden');
  }
}

// Find next upcoming holiday relative to current date and start ticker
function setupNextHolidayCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  const now = new Date();
  
  // Find first holiday occurring today or in the future
  const upcoming = allHolidays.find(h => {
    const hDate = new Date(h.date + 'T00:00:00');
    // Set end of holiday day for check
    const hEnd = new Date(h.date + 'T23:59:59');
    return hEnd >= now;
  });

  if (!upcoming) {
    countdownCard.classList.add('hidden');
    nextHolidayTarget = null;
    return;
  }

  nextHolidayTarget = upcoming;
  countdownCard.classList.remove('hidden');
  
  countdownTitle.textContent = upcoming.name;
  
  const formattedDate = new Date(upcoming.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  countdownDate.textContent = formattedDate;

  // Run immediately then tick every 1 second
  updateTicker();
  countdownInterval = setInterval(updateTicker, 1000);
}

function updateTicker() {
  if (!nextHolidayTarget) return;

  const now = new Date();
  const targetDate = new Date(nextHolidayTarget.date + 'T00:00:00');
  const diff = targetDate - now;

  if (diff <= 0) {
    // Holiday is happening today!
    cdDays.textContent = '00';
    cdHours.textContent = '00';
    cdMins.textContent = '00';
    cdSecs.textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  cdDays.textContent = String(days).padStart(2, '0');
  cdHours.textContent = String(hours).padStart(2, '0');
  cdMins.textContent = String(mins).padStart(2, '0');
  cdSecs.textContent = String(secs).padStart(2, '0');
}

// Filter and Render Cards
function filterAndRenderHolidays() {
  const query = searchInput.value.toLowerCase().trim();
  
  const filtered = allHolidays.filter(h => 
    h.name.toLowerCase().includes(query) || 
    (h.localName && h.localName.toLowerCase().includes(query))
  );

  resultsCount.textContent = `${filtered.length} holiday${filtered.length === 1 ? '' : 's'} found`;

  if (filtered.length === 0) {
    holidaysGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 2rem;">No matching holidays found.</p>`;
    return;
  }

  holidaysGrid.innerHTML = filtered.map(item => {
    const formattedDate = new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const types = item.types && item.types.length > 0 ? item.types.join(', ') : 'Public Holiday';
    const isNextHoliday = nextHolidayTarget && nextHolidayTarget.date === item.date && nextHolidayTarget.name === item.name;

    return `
      <article class="card ${isNextHoliday ? 'highlighted' : ''}">
        <div class="card-header">
          <span class="date-badge">${isNextHoliday ? '⭐ Next Holiday' : '📅 ' + formattedDate}</span>
          <h2 class="card-title">${escapeHtml(item.name)}</h2>
          ${item.localName !== item.name ? `<p class="card-subtitle">${escapeHtml(item.localName)}</p>` : ''}
        </div>
        <div class="card-footer">
          <span class="type-tag">${types}</span>
          <span>${item.global ? '🌐 National' : '📍 Regional'}</span>
        </div>
      </article>
    `;
  }).join('');
}

function showLoading(msg) {
  statusMessage.className = 'status-message';
  statusMessage.textContent = msg;
}

function showError(msg) {
  statusMessage.className = 'status-message error';
  statusMessage.textContent = msg;
}

function clearStatus() {
  statusMessage.className = 'status-message';
  statusMessage.textContent = '';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}