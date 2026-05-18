const API = 'http://127.0.0.1:8000';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let currentEventId = null;
let allEvents = [];
let activeCategory = 'all';

const cardBgs = ['card-bg-1','card-bg-2','card-bg-3','card-bg-4','card-bg-5'];
const cardEmojis = ['🎤','🎪','💡','🎵','🚀','🎯','🎨','🌐','⚡','🔥'];
const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const avatarBgs = ['#c94a1a','#8a2f0a','#e05a28','#3a2510','#6b3a1a'];
const catLabels = { general:'📌 General', music:'🎵 Music', tech:'💻 Tech', business:'💼 Business', sports:'⚽ Sports', art:'🎨 Art & Culture', workshop:'🛠️ Workshop' };

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (name === 'home') loadEvents();
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if (name === 'home') document.querySelector('.nav-links a')?.classList.add('active');
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openCreateModal() {
  if (!token) { toast('Please sign in to create events', 'error'); showPage('login'); return; }
  openModal('create-modal');
}

function openRsvpModal() { openModal('rsvp-modal'); }

function updateNav() {
  const loggedIn = !!token;
  document.getElementById('nav-login-btn').style.display = loggedIn ? 'none' : '';
  document.getElementById('nav-register-btn').style.display = loggedIn ? 'none' : '';
  document.getElementById('nav-create-btn').style.display = loggedIn ? '' : 'none';
  document.getElementById('nav-logout-btn').style.display = loggedIn ? '' : 'none';
  const ud = document.getElementById('user-display');
  ud.style.display = loggedIn && currentUser ? 'flex' : 'none';
  if (currentUser) document.getElementById('user-name-nav').textContent = currentUser.name;
}

function logout() {
  token = null; currentUser = null;
  localStorage.removeItem('token'); localStorage.removeItem('user');
  updateNav(); showPage('home'); toast('Signed out successfully');
}

function setCat(el, cat) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  activeCategory = cat;
  applyFilters();
}

function applyFilters() {
  if (!allEvents.length) return;
  const q = document.getElementById('search-input').value.toLowerCase().trim();
  let filtered = allEvents;
  if (activeCategory !== 'all') {
    filtered = filtered.filter(e => (e.category || 'general') === activeCategory);
  }
  if (q) {
    filtered = filtered.filter(e => {
      const hay = (e.name + ' ' + (e.description || '') + ' ' + e.location + ' ' + (e.category || '')).toLowerCase();
      return hay.includes(q);
    });
  }
  renderEvents(filtered);
}

// ── API helper — always reads latest token ──
async function apiFetch(path, options = {}) {
  const currentToken = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Something went wrong');
  return data;
}

// ── AUTH ──
async function login() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  if (!email || !pass) { toast('Please fill all fields', 'error'); return; }
  try {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', pass);
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    // Save token immediately to localStorage
    token = data.access_token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    updateNav();
    toast(`Welcome back, ${currentUser.name}! 🎉`);
    showPage('home');
  } catch (e) { toast(e.message, 'error'); }
}

async function register() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  if (!name || !email || !pass) { toast('Please fill all fields', 'error'); return; }
  try {
    await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password: pass }) });
    toast('Account created! Please sign in.');
    // Auto-fill login fields
    document.getElementById('login-email').value = email;
    showPage('login');
  } catch (e) { toast(e.message, 'error'); }
}

// ── EVENTS ──
async function loadEvents() {
  document.getElementById('events-container').innerHTML = '<div class="loading-state"><div class="loader"></div><br>Loading events...</div>';
  document.getElementById('event-count').textContent = '';
  try {
    allEvents = await apiFetch('/events/');
    applyFilters();
  } catch (e) {
    document.getElementById('events-container').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>Make sure your FastAPI server is running on port 8000</p>
        <button class="btn btn-rust" onclick="loadEvents()">Try Again</button>
      </div>`;
  }
}

function getDateParts(dateStr) {
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d)) return { day: '--', month: 'TBD' };
    return { day: d.getDate(), month: months[d.getMonth()] };
  } catch { return { day: '--', month: 'TBD' }; }
}

function renderEvents(events) {
  const el = document.getElementById('events-container');
  document.getElementById('event-count').textContent = events.length + ' event' + (events.length !== 1 ? 's' : '');
  if (!events.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No Events Found</h3><p>Try a different search or category</p><button class="btn btn-rust" onclick="resetFilters()">Clear Filters</button></div>`;
    return;
  }
  el.innerHTML = `<div class="events-grid">${events.map((e, i) => {
    const dp = getDateParts(e.date);
    const bg = cardBgs[i % cardBgs.length];
    const emoji = cardEmojis[i % cardEmojis.length];
    const cat = catLabels[e.category] || '📌 General';
    return `
      <div class="event-card" onclick="openEvent(${e.id})">
        <div class="event-card-img ${bg}">
          ${emoji}
          <div class="event-card-date-badge"><div class="badge-day">${dp.day}</div><div class="badge-month">${dp.month}</div></div>
          ${i < 2 ? '<div class="new-badge">New</div>' : ''}
        </div>
        <div class="event-card-body">
          <div class="event-card-cat">${cat}</div>
          <div class="event-card-title">${e.name}</div>
          <div class="event-card-loc">📍 ${e.location}</div>
          <div class="event-card-time">🕐 ${e.date}</div>
          <div class="event-card-footer">
            <span class="spots-pill">${e.max_attendees ? e.max_attendees + ' max' : 'Open'}</span>
            <button class="rsvp-btn" onclick="event.stopPropagation(); openEvent(${e.id})">RSVP Now</button>
          </div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  activeCategory = 'all';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.cat-btn').classList.add('active');
  renderEvents(allEvents);
}

async function openEvent(id) {
  currentEventId = id;
  showPage('detail');
  document.getElementById('rsvp-list-container').innerHTML = '<div class="loading-state"><div class="loader"></div></div>';
  try {
    const ev = await apiFetch(`/events/${id}`);
    document.getElementById('detail-cat').textContent = catLabels[ev.category] || '📌 General';
    document.getElementById('detail-title').textContent = ev.name;
    document.getElementById('detail-date').textContent = ev.date;
    document.getElementById('detail-location').textContent = ev.location;
    document.getElementById('detail-desc').textContent = ev.description || 'No description provided.';
    document.getElementById('detail-cap-meta').textContent = ev.max_attendees ? '🎟 ' + ev.max_attendees + ' max seats' : '';
    document.getElementById('delete-event-btn').style.display = (currentUser && currentUser.id === ev.owner_id) ? '' : 'none';
    await loadRsvps(id, ev.max_attendees);
  } catch (e) { toast(e.message, 'error'); }
}

async function loadRsvps(eventId, maxAttendees) {
  try {
    const data = await apiFetch(`/events/${eventId}/rsvps`);
    document.getElementById('stat-going').textContent = data.going;
    document.getElementById('stat-maybe').textContent = data.maybe;
    document.getElementById('stat-no').textContent = data.not_going;
    if (maxAttendees) {
      const pct = Math.min(100, Math.round((data.going / maxAttendees) * 100));
      document.getElementById('capacity-section').style.display = '';
      document.getElementById('capacity-text').textContent = data.going + '/' + maxAttendees;
      document.getElementById('capacity-fill').style.width = pct + '%';
    }
    const container = document.getElementById('rsvp-list-container');
    if (!data.rsvps.length) {
      container.innerHTML = `<div class="empty-state" style="padding:40px 0;text-align:left;background:transparent;"><div class="empty-icon">👋</div><h3>No RSVPs yet</h3><p>Be the first to RSVP!</p></div>`;
      return;
    }
    container.innerHTML = `<div class="rsvp-list">${data.rsvps.map((r, i) => `
      <div class="rsvp-item">
        <div class="rsvp-avatar" style="background:${avatarBgs[i % avatarBgs.length]}">${r.name[0].toUpperCase()}</div>
        <div class="rsvp-info"><div class="rsvp-name">${r.name}</div><div class="rsvp-email">${r.email}</div></div>
        <span class="status-badge status-${r.status}">${r.status === 'yes' ? '✓ Going' : r.status === 'no' ? '✗ No' : '? Maybe'}</span>
      </div>`).join('')}</div>`;
  } catch (e) { toast(e.message, 'error'); }
}

async function submitcreateEvent() {
  const name = document.getElementById('ev-name').value.trim();
  const desc = document.getElementById('ev-desc').value.trim();
  const location = document.getElementById('ev-location').value.trim();
  const date = document.getElementById('ev-date').value.trim();
  const max = document.getElementById('ev-max').value;
  const category = document.getElementById('ev-category').value;

  if (!name || !location || !date) { toast('Name, location and date are required', 'error'); return; }

  // Always read token fresh from localStorage
  const currentToken = localStorage.getItem('token');
  if (!currentToken) {
    toast('You must be signed in to create events', 'error');
    closeModal('create-modal');
    showPage('login');
    return;
  }

  try {
    const res = await fetch(API + '/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({
        name,
        description: desc || null,
        location,
        date,
        max_attendees: max ? parseInt(max) : null,
        category
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to create event');
    closeModal('create-modal');
    toast('Event published! 🎉');
    ['ev-name','ev-desc','ev-location','ev-date','ev-max'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('ev-category').value = 'general';
    loadEvents();
  } catch (e) { toast(e.message, 'error'); }
}

async function submitRsvpForm() {
  const name = document.getElementById('rsvp-name').value.trim();
  const email = document.getElementById('rsvp-email').value.trim();
  const status = document.getElementById('rsvp-status').value;
  if (!name || !email) { toast('Please fill all fields', 'error'); return; }
  try {
    await apiFetch(`/events/${currentEventId}/rsvps`, { method: 'POST', body: JSON.stringify({ name, email, status }) });
    closeModal('rsvp-modal');
    toast('RSVP confirmed! See you there 🎉');
    document.getElementById('rsvp-name').value = '';
    document.getElementById('rsvp-email').value = '';
    await loadRsvps(currentEventId);
  } catch (e) { toast(e.message, 'error'); }
}

async function submitDeleteEvent() {
  if (!confirm('Delete this event? This cannot be undone.')) return;
  try {
    await apiFetch(`/events/${currentEventId}`, { method: 'DELETE' });
    toast('Event deleted');
    showPage('home');
  } catch (e) { toast(e.message, 'error'); }
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

updateNav();
loadEvents();