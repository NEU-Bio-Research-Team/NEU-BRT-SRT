/* ============================================================
   filter.js — Filter / search logic for papers and news pages
   ============================================================ */

'use strict';

/* ═══════════════════════════════
   NEWS PAGE
═══════════════════════════════ */
const NEWS_PER_PAGE = 10;
let allNews = [];
let newsState = { filter: 'All', query: '', page: 1 };

async function initNewsPage() {
  try {
    allNews = await fetchData('news.json');
  } catch (e) {
    console.error('initNewsPage:', e);
    return;
  }

  // Build category tabs dynamically
  const cats = ['All', ...new Set(allNews.map(n => n.category))];
  const tabsContainer = document.querySelector('#news-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = cats.map(c =>
      `<button class="tab ${c === 'All' ? 'tab--active' : ''}" data-filter="${c}">${c}</button>`
    ).join('');

    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
      btn.classList.add('tab--active');
      newsState.filter = btn.dataset.filter;
      newsState.page = 1;
      renderNewsPage();
    });
  }

  // Search input
  const searchInput = document.querySelector('#news-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      newsState.query = searchInput.value.toLowerCase().trim();
      newsState.page = 1;
      renderNewsPage();
    });
  }

  renderNewsPage();
}

function filterNews() {
  return allNews
    .filter(n => newsState.filter === 'All' || n.category === newsState.filter)
    .filter(n =>
      n.title.toLowerCase().includes(newsState.query) ||
      (n.body || '').toLowerCase().includes(newsState.query)
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.date > a.date ? 1 : -1));
}

function newsCardTemplate(item) {
  const d = formatDate(item.date);
  const catClass = newsCategoryClass(item.category);
  return `
  <article class="card card--news" role="article">
    <div class="date-badge">
      <span class="date-badge__year">${d.year}</span>
      <span class="date-badge__day">${d.day}</span>
    </div>
    <div>
      <div class="news-meta-row">
        ${item.pinned ? '<span class="badge badge--pin">&#9733; Pinned</span>' : ''}
        <span class="badge ${catClass}">${item.category}</span>
      </div>
      <h3 class="news-title">${sanitize(item.title)}</h3>
      <p class="news-body mt-4">${safeHTML(item.body)}</p>
      ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="paper-action-btn mt-4" style="display:inline-flex;margin-top:0.5rem;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Read more
      </a>` : ''}
    </div>
    <div class="news-arrow">&#8594;</div>
  </article>`;
}

function renderNewsPage() {
  const filtered = filterNews();
  const paged = paginate(filtered, newsState.page, NEWS_PER_PAGE);
  renderList('#news-list', paged, newsCardTemplate);

  const countEl = document.querySelector('#news-count');
  if (countEl) countEl.textContent = `Showing ${filtered.length} announcement${filtered.length !== 1 ? 's' : ''}`;

  renderPagination('#news-pagination', filtered.length, newsState.page, NEWS_PER_PAGE, (p) => {
    newsState.page = p;
    renderNewsPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ═══════════════════════════════
   PAPERS PAGE
═══════════════════════════════ */
let allPapers = [];
let papersState = { type: 'All', year: 'All', query: '' };

async function initPapersPage() {
  try {
    allPapers = await fetchData('papers.json');
  } catch (e) {
    console.error('initPapersPage:', e);
    return;
  }

  // Build type tabs
  const types = ['All', ...new Set(allPapers.map(p => p.type))];
  const tabsContainer = document.querySelector('#paper-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = types.map(t =>
      `<button class="tab ${t === 'All' ? 'tab--active' : ''}" data-type="${t}">${t}</button>`
    ).join('');

    tabsContainer.addEventListener('click', e => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
      btn.classList.add('tab--active');
      papersState.type = btn.dataset.type;
      renderPapersPage();
    });
  }

  // Build year select
  const years = ['All', ...new Set(allPapers.map(p => String(p.year)))].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return b - a;
  });
  const yearSelect = document.querySelector('#paper-year');
  if (yearSelect) {
    yearSelect.innerHTML = years.map(y => `<option value="${y}">${y === 'All' ? 'All Years' : y}</option>`).join('');
    yearSelect.addEventListener('change', () => {
      papersState.year = yearSelect.value;
      renderPapersPage();
    });
  }

  // Search
  const searchInput = document.querySelector('#paper-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      papersState.query = searchInput.value.toLowerCase().trim();
      renderPapersPage();
    });
  }

  renderPapersPage();
}

function filterPapers() {
  return allPapers
    .filter(p => papersState.type === 'All' || p.type === papersState.type)
    .filter(p => papersState.year === 'All' || String(p.year) === papersState.year)
    .filter(p =>
      p.title.toLowerCase().includes(papersState.query) ||
      p.authors.join(' ').toLowerCase().includes(papersState.query) ||
      (p.venue || '').toLowerCase().includes(papersState.query)
    )
    .sort((a, b) => b.year - a.year);
}

function paperCardTemplate(paper) {
  return `
  <article class="card card--paper ${paper.highlighted ? 'highlighted' : ''}">
    <div class="paper-title">
      ${paper.doi
        ? `<a href="${paper.doi}" target="_blank" rel="noopener noreferrer">${sanitize(paper.title)}</a>`
        : sanitize(paper.title)
      }
    </div>
    <div class="paper-authors">${sanitize(paper.authors.join(', '))}</div>
    <div class="paper-venue">${sanitize(paper.venue)}${paper.volume ? `, Vol. ${paper.volume}` : ''}${paper.pages ? `, pp. ${paper.pages}` : ''}, ${paper.year}</div>
    <div class="paper-meta">
      <span class="badge badge--type">${paper.type}</span>
      ${paper.if ? `<span class="badge badge--if">IF: ${paper.if}</span>` : ''}
      ${paper.jcr ? `<span class="badge ${jcrClass(paper.jcr)}">${paper.jcr}</span>` : ''}
    </div>
    <div class="paper-actions">
      ${paper.doi ? `<a href="${paper.doi}" target="_blank" rel="noopener noreferrer" class="paper-action-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        DOI
      </a>` : ''}
      ${paper.pdf ? `<a href="${paper.pdf}" target="_blank" rel="noopener noreferrer" class="paper-action-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        PDF
      </a>` : ''}
      ${paper.abstract ? `<button class="paper-action-btn" onclick="toggleAbstract(this)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Abstract
      </button>` : ''}
    </div>
    ${paper.abstract ? `<div class="paper-abstract-toggle">${sanitize(paper.abstract)}</div>` : ''}
  </article>`;
}

function renderPapersPage() {
  const filtered = filterPapers();

  // Group by year
  const grouped = {};
  filtered.forEach(p => {
    if (!grouped[p.year]) grouped[p.year] = [];
    grouped[p.year].push(p);
  });

  const container = document.querySelector('#papers-list');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📚</div>
        <p class="empty-state__text">No publications match your filter.</p>
      </div>`;
  } else {
    container.innerHTML = Object.keys(grouped)
      .sort((a, b) => b - a)
      .map(year => `
        <section class="year-group">
          <h2 class="year-header">${year}</h2>
          <div class="papers-list">
            ${grouped[year].map(paperCardTemplate).join('')}
          </div>
        </section>`)
      .join('');
  }

  const countEl = document.querySelector('#paper-count');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${allPapers.length} publication${allPapers.length !== 1 ? 's' : ''}`;
  }
}

function toggleAbstract(btn) {
  const card = btn.closest('.card--paper');
  const abs = card.querySelector('.paper-abstract-toggle');
  if (!abs) return;
  abs.classList.toggle('open');
  btn.textContent = abs.classList.contains('open') ? '▲ Hide Abstract' : 'Abstract';
}
