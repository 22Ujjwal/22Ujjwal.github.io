/**
 * Agentic Cover — publications index + single post rendering,
 * subscribe forms, and real view counts (fetched from /api/views, never faked;
 * hidden entirely if the API is unavailable).
 */

(function () {
  const posts = (typeof window !== 'undefined' && window.POSTS) || [];
  const API_VIEWS = '/api/views';
  const API_SUBSCRIBE = '/api/subscribe';

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------

  function formatDate(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Compact "07.08.26" style for list rows
  function formatDateShort(iso) {
    const [y, m, d] = iso.split('-');
    return `${m}.${d}.${y.slice(2)}`;
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function tagChips(tags) {
    return tags.map((t) => `<span class="post-tag">${escapeHtml(t)}</span>`).join('');
  }

  // ---------------------------------------------------------------------
  // View counts (real, from KV; gracefully absent otherwise)
  // ---------------------------------------------------------------------

  async function fetchViewCounts(slugs) {
    try {
      const res = await fetch(`${API_VIEWS}?slugs=${slugs.join(',')}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.views || null;
    } catch {
      return null;
    }
  }

  function applyViewCounts(views) {
    if (!views) return;
    document.querySelectorAll('[data-views-slug]').forEach((el) => {
      const slug = el.getAttribute('data-views-slug');
      if (typeof views[slug] === 'number') {
        el.querySelector('.view-num').textContent = views[slug].toLocaleString();
        el.hidden = false;
      }
    });
  }

  async function recordView(slug) {
    try {
      const res = await fetch(API_VIEWS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data.views === 'number' ? data.views : null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------
  // Subscribe forms
  // ---------------------------------------------------------------------

  function initSubscribeForms() {
    document.querySelectorAll('[data-subscribe-form]').forEach((form) => {
      const status = form.parentElement.querySelector('[data-subscribe-status]');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value.trim();
        const button = form.querySelector('button');
        button.disabled = true;
        button.textContent = 'Subscribing…';
        status.textContent = '';
        status.className = 'subscribe-status';
        try {
          const res = await fetch(API_SUBSCRIBE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: location.pathname + location.search }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            status.textContent = data.alreadySubscribed
              ? "You're already on the list — appreciated twice over."
              : "You're in! Talk soon.";
            status.classList.add('ok');
            form.reset();
          } else {
            status.textContent = data.error || 'Something went wrong — try again?';
            status.classList.add('err');
          }
        } catch {
          status.textContent = 'Network hiccup — try again in a moment.';
          status.classList.add('err');
        }
        button.disabled = false;
        button.textContent = 'Subscribe';
      });
    });
  }

  // ---------------------------------------------------------------------
  // Index page
  // ---------------------------------------------------------------------

  // Thumbnails only on featured (conference) rows; regular rows stay text-only
  function postCard(post) {
    const showThumb = Boolean(post.featured && post.image);
    const thumb = showThumb
      ? `<div class="row-thumb"><img src="${post.image}" alt="${escapeHtml(post.imageAlt || post.title)}" loading="lazy"></div>`
      : '';
    return `
      <a class="post-row${showThumb ? ' has-thumb' : ''}" href="post.html?slug=${encodeURIComponent(post.slug)}">
        <div class="row-date">${formatDateShort(post.date)}</div>
        ${thumb}
        <div class="row-main">
          <h3 class="row-title">${escapeHtml(post.title)}</h3>
          <p class="row-summary">${escapeHtml(post.summary)}</p>
          <div class="row-tags">${tagChips(post.tags)}</div>
        </div>
        <div class="row-side">
          <span>${post.readMins} MIN</span>
          <span class="post-views" data-views-slug="${post.slug}" hidden><i class="far fa-eye"></i><span class="view-num">0</span></span>
          <span class="row-arrow">&rarr;</span>
        </div>
      </a>`;
  }

  function renderIndex() {
    const featuredEl = document.getElementById('featured-posts');
    const allEl = document.getElementById('all-posts');
    const filterEl = document.getElementById('tag-filter');
    if (!featuredEl || !allEl) return false;

    const featured = posts.filter((p) => p.featured);
    const rest = posts.filter((p) => !p.featured);

    featuredEl.innerHTML = featured.map((p) => postCard(p)).join('');

    const allTags = [...new Set(rest.flatMap((p) => p.tags))].sort();
    let activeTag = null;

    function renderRest() {
      const visible = activeTag ? rest.filter((p) => p.tags.includes(activeTag)) : rest;
      allEl.innerHTML = visible.map((p) => postCard(p)).join('');
      fetchViewCounts(visible.map((p) => p.slug)).then(applyViewCounts);
    }

    if (filterEl) {
      filterEl.innerHTML =
        `<button class="tag-btn active" data-tag="">All</button>` +
        allTags.map((t) => `<button class="tag-btn" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
      filterEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        activeTag = btn.dataset.tag || null;
        filterEl.querySelectorAll('.tag-btn').forEach((b) => b.classList.toggle('active', b === btn));
        renderRest();
      });
    }

    renderRest();
    fetchViewCounts(featured.map((p) => p.slug)).then(applyViewCounts);
    return true;
  }

  // ---------------------------------------------------------------------
  // Single post page
  // ---------------------------------------------------------------------

  // Every post gets a cover inside the article: an explicit image if the post
  // defines one, otherwise its generated Agentic Cover art
  // (images/posts/<slug>.svg, produced by scripts/gen-post-art.mjs).
  function heroFigure(post) {
    const src = post.image || `images/posts/${post.slug}.svg`;
    const credit = post.imageCredit || (post.image ? '' : 'Cover art: Agentic Cover');
    return `
      <figure class="post-hero">
        <img src="${src}" alt="${escapeHtml(post.imageAlt || post.title)}">
        ${credit ? `<figcaption>${escapeHtml(credit)}</figcaption>` : ''}
      </figure>`;
  }

  function renderPost() {
    const article = document.getElementById('post-article');
    if (!article) return false;

    const slug = new URLSearchParams(location.search).get('slug');
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      article.innerHTML = `
        <h1 class="post-title">Post not found</h1>
        <p>That link doesn't match anything here. <a href="publications.html">Back to all posts</a>.</p>`;
      return true;
    }

    document.title = `${post.title} — Agentic Cover by Ujjwal`;

    article.innerHTML = `
      <div class="post-tags-line">${tagChips(post.tags)}</div>
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <div class="post-header-meta">
        <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
        <span><i class="far fa-clock"></i> ${post.readMins} MIN READ</span>
        <span class="post-views" data-views-slug="${post.slug}" hidden><i class="far fa-eye"></i> <span class="view-num">0</span> VIEWS</span>
      </div>
      ${heroFigure(post)}
      <div class="post-body">${post.content}</div>
      <p class="post-signoff">— Ujjwal</p>`;

    document.getElementById('post-subscribe')?.removeAttribute('hidden');
    document.getElementById('post-nav')?.removeAttribute('hidden');

    recordView(post.slug).then((views) => {
      if (typeof views === 'number') applyViewCounts({ [post.slug]: views });
    });
    return true;
  }

  // ---------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', () => {
    renderIndex() || renderPost();
    initSubscribeForms();
  });
})();
