/* ============================================================
   map.js - Contact map + Members rendering
   ============================================================ */

'use strict';

/* ---------------- CONTACT PAGE ---------------- */
async function initContactMap() {
  let lab;
  try {
    lab = await fetchData('lab.json');
  } catch (e) {
    console.error('initContactMap:', e);
    return;
  }

  const bindings = {
    '#contact-name': lab.name,
    '#contact-university': lab.university,
    '#contact-address': lab.address,
    '#contact-room': lab.room,
    '#contact-email': lab.email,
    '#contact-phone': lab.phone,
  };

  Object.entries(bindings).forEach(([selector, value]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = value || '';
  });

  const emailLink = document.querySelector('#contact-email-link');
  if (emailLink) {
    emailLink.textContent = lab.email || '';
    emailLink.href = `mailto:${lab.email || ''}`;
  }

  const phoneLink = document.querySelector('#contact-phone');
  if (phoneLink) {
    phoneLink.textContent = lab.phone || '';
    const cleaned = String(lab.phone || '').replace(/[^\d+]/g, '');
    phoneLink.href = cleaned ? `tel:${cleaned}` : '#';
  }

  const applyBtn = document.querySelector('#apply-btn');
  if (applyBtn && lab.apply_link) applyBtn.href = lab.apply_link;

  const recruitWrap = document.querySelector('#recruit-card-wrap');
  if (recruitWrap) recruitWrap.style.display = lab.recruiting ? '' : 'none';

  const mapEl = document.querySelector('#map');
  if (!mapEl || typeof L === 'undefined') return;

  const lat = lab.map_lat || 21.0039;
  const lng = lab.map_lng || 105.8412;

  const map = L.map('map', {
    center: [lat, lng],
    zoom: 15,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const marker = L.circleMarker([lat, lng], {
    radius: 8,
    color: '#1B6EF3',
    fillColor: '#1B6EF3',
    fillOpacity: 0.8,
    weight: 2,
  }).addTo(map);

  marker.bindPopup(`<strong>${sanitize(lab.name || '')}</strong><br>${sanitize(lab.address || '')}`);
}

/* ---------------- MEMBERS PAGE ---------------- */
let allMembers = [];
let membersTab = 'bio';
let membersRole = 'All';

const ROLE_ORDER = ['mentor', 'member'];
const ROLE_LABELS = {
  mentor: 'Giảng viên hướng dẫn',
  member: 'Thành viên',
};

const TAB_LABELS = {
  bio: 'Bio',
  finance: 'Finance',
};

async function initMembersPage() {
  try {
    allMembers = await fetchData('members.json');
  } catch (e) {
    console.error('initMembersPage:', e);
    return;
  }

  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');
      membersTab = tab.dataset.tab;
      renderMembersPage();
    });
  });

  const roleSelect = document.querySelector('#member-role-filter');
  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      membersRole = roleSelect.value;
      renderMembersPage();
    });
  }

  renderMembersPage();
}

function inferTeamNameFromImage(imagePath) {
  const fileName = String(imagePath || '').split('/').pop() || '';
  const baseName = fileName.split('.')[0] || '';
  return (baseName || 'Team').toUpperCase();
}

function normalizeMemberTeams(teams) {
  if (!Array.isArray(teams)) return [];

  return teams
    .map((team) => {
      if (typeof team === 'string') {
        const image = team.trim();
        if (!image) return null;
        return {
          name: inferTeamNameFromImage(image),
          image,
          code: inferTeamCode({ image }),
        };
      }

      if (!team || typeof team !== 'object') return null;

      const image = String(team.image || team.src || '').trim();
      if (!image) return null;

      const name = String(team.name || team.label || inferTeamNameFromImage(image)).trim();
      const code = String(team.code || inferTeamCode({ name, image })).trim().toUpperCase();

      return {
        name,
        image,
        code,
      };
    })
    .filter(Boolean);
}

function inferTeamCode(team) {
  const combined = `${team.code || ''} ${team.name || ''} ${team.image || ''}`.toLowerCase();
  if (/brt|bio/.test(combined)) return 'BRT';
  if (/srt|stress|finance/.test(combined)) return 'SRT';
  return '';
}

function normalizeRoleKey(member) {
  const roleKey = String(member.role_key || '').trim().toLowerCase();
  if (roleKey === 'mentor' || roleKey === 'member') return roleKey;

  const roleText = String(member.role || '').trim().toLowerCase();
  if (roleText.includes('giảng viên hướng dẫn')) return 'mentor';
  return 'member';
}

function memberHasTeam(member, targetTeamCode) {
  const teams = normalizeMemberTeams(member.teams);
  return teams.some((team) => team.code === targetTeamCode);
}

function memberInTab(member, tab) {
  if (tab === 'bio') return memberHasTeam(member, 'BRT');
  if (tab === 'finance') return memberHasTeam(member, 'SRT');
  return true;
}

function memberRowTemplate(member) {
  const photo = member.photo || '';
  const photoSrc = photo ? encodeURI(photo) : '';
  const roleKey = normalizeRoleKey(member);
  const role = member.role || ROLE_LABELS[roleKey] || '';
  const teams = normalizeMemberTeams(member.teams);

  const metadataLines = [
    member.professional_level
      ? `<p class="member-meta"><span class="member-meta-label">Trình độ chuyên môn:</span> ${sanitize(member.professional_level)}</p>`
      : '',
    member.department
      ? `<p class="member-meta"><span class="member-meta-label">Khoa:</span> ${sanitize(member.department)}</p>`
      : '',
    member.research_scope
      ? `<p class="member-meta"><span class="member-meta-label">Phạm vi nghiên cứu:</span> ${sanitize(member.research_scope)}</p>`
      : '',
    member.start_date
      ? `<p class="member-meta"><span class="member-meta-label">Thời gian bắt đầu nghiên cứu:</span> ${sanitize(member.start_date)}</p>`
      : '',
    member.timestamp
      ? `<p class="member-meta"><span class="member-meta-label">Dấu thời gian:</span> ${sanitize(member.timestamp)}</p>`
      : '',
  ].filter(Boolean).join('');

  const teamMarkup = teams.length
    ? `
      <div class="member-teams">
        <span class="member-team-label">Team</span>
        <div class="member-team-list">
          ${teams
            .map((team) => `
              <span class="member-team-item" title="${sanitize(team.name)}">
                <img src="${sanitize(encodeURI(team.image))}" alt="${sanitize(team.name)} logo" loading="lazy" onerror="this.closest('.member-team-item').style.display='none'">
                <span class="member-team-name">${sanitize(team.name)}</span>
              </span>`)
            .join('')}
        </div>
      </div>`
    : '';

  return `
    <article class="card member-row">
      ${photoSrc
        ? `<img class="member-photo" src="${sanitize(photoSrc)}" alt="${sanitize(member.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex'">
           <div class="member-photo-placeholder" style="display:none">M</div>`
        : `<div class="member-photo-placeholder">M</div>`}
      <div class="member-main">
        <h3 class="member-name">${sanitize(member.name)}</h3>
        <p class="member-role">${sanitize(role)}</p>
        ${metadataLines}
        ${teamMarkup}
      </div>
      <div class="member-links">
        ${member.email ? `<a href="mailto:${member.email}" aria-label="Email ${sanitize(member.name)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </a>` : ''}
      </div>
    </article>`;
}

function renderMembersPage() {
  const container = document.querySelector('#members-container');
  if (!container) return;

  let list = allMembers.filter((member) => memberInTab(member, membersTab));
  if (membersRole !== 'All') {
    list = list.filter((member) => normalizeRoleKey(member) === membersRole);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">-</div>
        <p class="empty-state__text">No members found for this filter.</p>
      </div>`;
    const countEl = document.querySelector('#members-count');
    if (countEl) countEl.textContent = `0 members in ${TAB_LABELS[membersTab] || 'this tab'}`;
    return;
  }

  const groupedMarkup = ROLE_ORDER
    .filter((roleKey) => list.some((member) => normalizeRoleKey(member) === roleKey))
    .map((roleKey) => {
      const group = list.filter((member) => normalizeRoleKey(member) === roleKey);
      const title = ROLE_LABELS[roleKey] || roleKey;
      const rows = group.map((member) => memberRowTemplate(member)).join('');

      return `
        <section class="member-group">
          <div class="group-heading">
            <span class="group-accent" aria-hidden="true"></span>
            <h2 class="group-title">${sanitize(title)}</h2>
            <span class="group-count">${group.length}</span>
          </div>
          <div class="member-list">${rows}</div>
        </section>`;
    })
    .join('');

  container.innerHTML = `<div class="member-groups">${groupedMarkup}</div>`;

  const countEl = document.querySelector('#members-count');
  if (countEl) countEl.textContent = `${list.length} member${list.length !== 1 ? 's' : ''} in ${TAB_LABELS[membersTab] || 'this tab'}`;
}
