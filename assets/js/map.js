/* ============================================================
   map.js — Contact page map (Leaflet.js) + members page
   ============================================================ */

'use strict';

async function initContactMap() {
  try {
    const lab = await fetchData('lab.json');
    const lat = lab.map_lat || 20.9988;
    const lng = lab.map_lng || 105.8426;
    const name = lab.name;
    const address = lab.address;

    // Populate contact info from lab.json
    const infoEls = {
      '#contact-name':    { text: name },
      '#contact-univ':    { text: lab.university },
      '#contact-address': { text: address },
      '#contact-room':    { text: lab.room },
      '#contact-email':   { text: lab.email, href: `mailto:${lab.email}` },
      '#contact-phone':   { text: lab.phone },
    };

    Object.entries(infoEls).forEach(([sel, v]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (v.href) el.href = v.href;
      el.textContent = v.text || '';
    });

    // Recruiting banner
    const banner = document.querySelector('#recruit-banner');
    if (banner) banner.style.display = lab.recruiting ? '' : 'none';
    const applyBtn = document.querySelector('#apply-btn');
    if (applyBtn && lab.apply_link) applyBtn.href = lab.apply_link;

    // Map
    const mapEl = document.querySelector('#map');
    if (!mapEl || typeof L === 'undefined') return;

    const map = L.map('map', {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        background:#0D6EFD;
        width:36px;height:36px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(13,110,253,0.4)">
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: '',
    });

    L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(`<strong>${name}</strong><br>${address}`)
      .openPopup();

  } catch (e) { console.error('initContactMap:', e); }
}


/* ═══════════════════════════════
   MEMBERS PAGE
═══════════════════════════════ */
let allMembers = [];
let membersTab = 'current';

const ROLE_ORDER = ['professor', 'research-professor', 'phd', 'ms', 'undergrad', 'visiting'];
const ROLE_LABELS = {
  professor: 'Professor',
  'research-professor': 'Research Professors',
  phd: 'PhD Students',
  ms: 'MS Students',
  undergrad: 'Undergraduate Researchers',
  visiting: 'Visiting Researchers',
};

async function initMembersPage() {
  try {
    allMembers = await fetchData('members.json');
  } catch (e) {
    console.error('initMembersPage:', e);
    return;
  }

  // Tab switching
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');
      membersTab = tab.dataset.tab;
      renderMembersPage();
    });
  });

  renderMembersPage();
}

function memberCardTemplate(m) {
  const hasPhoto = m.photo && m.photo !== '';
  return `
  <div class="card card--member">
    ${hasPhoto
      ? `<img class="member-photo"
           src="${m.photo}"
           alt="${sanitize(m.name)}"
           loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="member-photo-placeholder" style="display:none">👤</div>`
      : `<div class="member-photo-placeholder">👤</div>`
    }
    <div>
      <div class="member-name">${sanitize(m.name)}</div>
      <div class="member-role">${sanitize(m.role)}</div>
      ${m.graduated ? `<div class="member-dept">Graduated ${m.graduated}</div>` : ''}
      ${m.department ? `<div class="member-dept">${sanitize(m.department)}</div>` : ''}
    </div>
    ${m.bio ? `<p style="font-size:var(--text-xs);color:var(--color-text-muted);line-height:1.6;text-align:left;">${sanitize(m.bio)}</p>` : ''}
    <div class="member-links">
      ${m.email ? `<a href="mailto:${m.email}" title="Email" aria-label="Email ${m.name}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </a>` : ''}
      ${m.scholar ? `<a href="${m.scholar}" target="_blank" rel="noopener noreferrer" title="Google Scholar" aria-label="${m.name} Google Scholar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z"/></svg>
      </a>` : ''}
      ${m.homepage ? `<a href="${m.homepage}" target="_blank" rel="noopener noreferrer" title="Homepage" aria-label="${m.name} homepage">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </a>` : ''}
    </div>
  </div>`;
}

function renderMembersPage() {
  const container = document.querySelector('#members-container');
  if (!container) return;

  const group = allMembers.filter(m => m.category === membersTab);
  if (group.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><p class="empty-state__text">No members in this category yet.</p></div>`;
    return;
  }

  container.innerHTML = ROLE_ORDER
    .filter(level => group.some(m => m.level === level))
    .map(level => {
      const levelGroup = group.filter(m => m.level === level);
      return `
        <section class="role-section">
          <h2 class="role-section-title">
            ${ROLE_LABELS[level]}
            <span class="role-count">${levelGroup.length}</span>
          </h2>
          <div class="member-grid">
            ${levelGroup.map(memberCardTemplate).join('')}
          </div>
        </section>`;
    })
    .join('');

  // Total count
  const countEl = document.querySelector('#members-count');
  if (countEl) countEl.textContent = `${group.length} member${group.length !== 1 ? 's' : ''}`;
}
