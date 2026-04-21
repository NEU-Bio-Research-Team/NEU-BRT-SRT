/* ============================================================
   render.js — Generic JSON → DOM renderer utilities
   ============================================================ */

'use strict';

/**
 * Fetch JSON data from _data/ folder with cache-busting for dev.
 * @param {string} file — filename inside _data/ (e.g. 'members.json')
 */
async function fetchData(file) {
  const base = getBase();
  const url = `${base}_data/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

/** Derive base path so fetch works from any subdirectory depth. */
function getBase() {
  const path = window.location.pathname;
  const depth = (path.match(/\//g) || []).length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

/** Sanitize basic HTML (allow em, strong, a, br only). */
function sanitize(html) {
  const tmp = document.createElement('div');
  tmp.textContent = html;
  return tmp.innerHTML;
}

/** Allow only safe subset of HTML tags in body text. */
function safeHTML(input) {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>')
    .replace(/&lt;strong&gt;/g, '<strong>')
    .replace(/&lt;\/strong&gt;/g, '</strong>')
    .replace(/&lt;br\s*\/?&gt;/g, '<br>');
}

/** Render a list of items into a container using a template function. */
function renderList(selector, items, templateFn) {
  const container = document.querySelector(selector);
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📭</div>
        <p class="empty-state__text">No items found.</p>
      </div>`;
    return;
  }
  container.innerHTML = items.map(templateFn).join('');
}

/** Format date string to display format. */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return { year: y, day: `${m}.${d}` };
}

/** Get badge class for news category. */
function newsCategoryClass(cat) {
  const map = {
    Awards: 'badge--awards',
    Publication: 'badge--publication',
    Event: 'badge--event',
    Notice: 'badge--notice',
  };
  return map[cat] || 'badge--category';
}

/** Get JCR badge class. */
function jcrClass(jcr) {
  if (!jcr) return '';
  if (jcr === 'Q1') return 'badge--jcr-q1';
  if (jcr === 'Q2') return 'badge--jcr-q2';
  return 'badge--jcr-q3';
}

/** Highlight current nav link based on current page. */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop() || 'index.html';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/** Mobile nav toggle. */
function initMobileNav() {
  const toggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/** Populate nav & footer lab name from lab.json. */
async function initSiteShell() {
  try {
    const lab = await fetchData('lab.json');
    // Nav logo
    const logoText = document.querySelector('.nav-logo__text');
    if (logoText) logoText.textContent = lab.short_name;
    const logoSub = document.querySelector('.nav-logo__sub');
    if (logoSub) logoSub.textContent = lab.university;
    // Footer
    const footerBrand = document.querySelector('.footer__brand h3');
    if (footerBrand) footerBrand.textContent = lab.name;
    const footerAddr = document.querySelector('.footer__address');
    if (footerAddr) footerAddr.textContent = lab.address;
    const footerEmail = document.querySelector('.footer__email');
    if (footerEmail) { footerEmail.textContent = lab.email; footerEmail.href = `mailto:${lab.email}`; }
    // Page title prefix
    const titleEl = document.querySelector('title');
    if (titleEl && !titleEl.dataset.set) {
      titleEl.textContent = `${titleEl.textContent} | ${lab.short_name}`;
      titleEl.dataset.set = '1';
    }
  } catch (e) { console.warn('initSiteShell:', e); }
}

/** Client-side pagination helper */
function paginate(items, page, perPage) {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

function renderPagination(selector, total, current, perPage, onPageChange) {
  const container = document.querySelector(selector);
  if (!container) return;
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `<button class="pagination__btn" ${current === 1 ? 'disabled' : ''} data-page="${current - 1}">&#8592;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="pagination__btn ${i === current ? 'pagination__btn--active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="pagination__btn" ${current === totalPages ? 'disabled' : ''} data-page="${current + 1}">&#8594;</button>`;

  container.innerHTML = html;
  container.querySelectorAll('.pagination__btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => onPageChange(parseInt(btn.dataset.page)));
  });
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
  initSiteShell();
});
