/**
 * Home page: project cards (curated + live GitHub sync) and the
 * latest-writing teaser pulled from posts-data.js.
 */

(function () {
  const GH_USER = '22Ujjwal';

  // Curated set, in display order. Live GitHub data refreshes stars and
  // fills missing descriptions, so cards stay current without a rebuild.
  const PROJECTS = [
    {
      repo: 'Denim_AI-Browser',
      title: 'Denim',
      desc: 'Agentic browser that spins the web — navigates, clicks, and gets things done while you watch.',
      tags: ['AGENTS', 'BROWSER'],
      winner: true,
    },
    {
      repo: 'DJ-Bestie',
      url: 'https://github.com/suryajasper/DJ-Bestie',
      title: 'DJ Bestie',
      desc: 'Mood-based music recommendation using face, body, and voice — three real-time modalities feeding Spotify. Winner Overall at TAMUHack 2025.',
      tags: ['MULTIMODAL', 'HACKATHON'],
      winner: true,
    },
    {
      repo: 'Multimodal_Agent',
      title: 'Multimodal Agent',
      desc: 'Voice + vision agent built for the Aven × Headstarter challenge. Talks, sees, and occasionally listens.',
      tags: ['AGENTS', 'MULTIMODAL'],
      winner: true,
    },
    {
      repo: 'saving_water',
      title: 'Saving Water',
      desc: 'Water-conservation platform built in a weekend at HackSMU on caffeine and righteous purpose.',
      tags: ['SUSTAINABILITY', 'FULL-STACK'],
      winner: true,
    },
    {
      repo: 'Dakota',
      title: 'Dakota',
      desc: 'An AI friend with autonomous powers. The "autonomous powers" part is exactly as fun and alarming as it sounds.',
      tags: ['AGENTS', 'AUTONOMY'],
    },
    {
      repo: 'OptiqAid',
      title: 'OptiqAid',
      desc: 'Guides blind users with vocal directions — computer vision narrating the world in real time. Built at HackUTD.',
      tags: ['CV', 'ACCESSIBILITY'],
    },
    {
      repo: 'MyRAG',
      title: 'MyRAG',
      desc: 'Retrieval playground: chunking, hybrid search, reranking — the whole grounding pipeline, hand-rolled to learn its sharp edges.',
      tags: ['RETRIEVAL', 'CONTEXT'],
    },
    {
      repo: 'llm_response_quality_check',
      title: 'LLM Quality Check',
      desc: 'Predicting LLM knowledge performance from reasoning benchmarks — logistic regression from scratch, no sklearn safety net.',
      tags: ['EVALS', 'ML'],
    },
    {
      repo: 'llm-not-close-to-frontier',
      title: 'Not Close to Frontier',
      desc: 'Building a personal language model from scratch. The name is the performance review. Educational in every direction.',
      tags: ['MODELING', 'FROM SCRATCH'],
    },
    {
      repo: 'AI-Coach',
      title: 'AI Coach',
      desc: 'Trusted ally for career guidance — an LLM app that gives better advice than it takes.',
      tags: ['LLM APPS'],
    },
    {
      repo: 'Airline_Crew_Sequence',
      title: 'Crew Sequencing',
      desc: 'Finding flight pairs that should never share a pilot — constraint optimization where the edge cases have consequences.',
      tags: ['OPTIMIZATION', 'DATA'],
    },
    {
      repo: 'secure_voting_formula',
      title: 'Secure Voting',
      desc: 'Blockchain-based voting system. Yes, everyone has one; mine actually focuses on the threat model.',
      tags: ['WEB3', 'SECURITY'],
    },
    {
      repo: '22Ujjwal.github.io',
      title: 'This Site',
      desc: 'The page you are on — an agentic assistant that answers as me, KV-backed subscriber list, and Agentic Cover bolted onto GitHub Pages + Vercel.',
      tags: ['META', 'AGENTS'],
    },
  ];

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------
  // Project cards
  // ---------------------------------------------------------------------

  // GitHub's generated social-preview image for a repo — free per-project art
  function ogImage(repo) {
    return `https://opengraph.githubassets.com/agentic/${GH_USER}/${repo}`;
  }

  function cardHtml(p, withImage) {
    const tags = (p.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join('');
    const stars = p.stars ? `<span class="stars"><i class="far fa-star"></i> ${p.stars}</span>` : '';
    const lang = '';
    const img = withImage
      ? `<div class="proj-shot"><img src="${ogImage(p.repo)}" alt="${escapeHtml(p.title)} repository preview" loading="lazy"></div>`
      : '';
    const trophy = p.winner ? ' 🏆' : '';
    const href = p.url || `https://github.com/${GH_USER}/${encodeURIComponent(p.repo)}`;
    return `
      <a class="proj-card" href="${href}" target="_blank" rel="noopener">
        <div class="proj-chrome">
          <div class="proj-dots"><span></span><span></span><span></span></div>
          <span class="proj-repo">${escapeHtml(p.repo)}</span>
        </div>
        ${img}
        <div class="proj-body">
          <h3 class="proj-title">${escapeHtml(p.title)}${trophy}</h3>
          <p class="proj-desc">${escapeHtml(p.desc)}</p>
          <div class="proj-meta">${tags}${lang}${stars}</div>
        </div>
      </a>`;
  }

  // #proj-track: home teaser strip (no images). #proj-grid: projects page (with images).
  function renderProjects() {
    const track = document.getElementById('proj-track');
    if (track) track.innerHTML = PROJECTS.slice(0, 6).map((p) => cardHtml(p, false)).join('');
    const grid = document.getElementById('proj-grid');
    if (grid) grid.innerHTML = PROJECTS.map((p) => cardHtml(p, true)).join('');
  }

  async function syncGithub() {
    const status = document.getElementById('gh-sync');
    try {
      const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100`);
      if (!res.ok) throw new Error(String(res.status));
      const repos = await res.json();
      const byName = Object.fromEntries(repos.map((r) => [r.name, r]));
      let touched = 0;
      PROJECTS.forEach((p) => {
        const live = byName[p.repo];
        if (!live) return;
        p.stars = live.stargazers_count || 0;
        p.language = live.language || p.language;
        touched++;
      });
      renderProjects();
      if (status) status.textContent = `● synced live from GitHub — ${touched} repos, ${new Date().toLocaleTimeString()}`;
    } catch {
      if (status) status.textContent = '○ GitHub sync unavailable — showing cached project data';
    }
  }

  // ---------------------------------------------------------------------
  // Writing teaser (uses window.POSTS from posts-data.js)
  // ---------------------------------------------------------------------

  function renderWriting() {
    const list = document.getElementById('writing-list');
    const posts = (window.POSTS || []).slice(0, 3);
    if (!list || posts.length === 0) return;
    list.innerHTML = posts
      .map((p) => {
        const d = new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `
          <a class="writing-row" href="post.html?slug=${encodeURIComponent(p.slug)}">
            <span class="writing-date">${d}</span>
            <span class="writing-title">${escapeHtml(p.title)}</span>
            <span class="writing-arrow">&rarr;</span>
          </a>`;
      })
      .join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    renderWriting();
    syncGithub();
  });
})();
