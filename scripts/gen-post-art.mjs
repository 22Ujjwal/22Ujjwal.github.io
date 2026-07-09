// Generates editorial SVG cover art for Agentic Cover posts.
// Seeded per slug so each post gets a stable, unique composition
// in the publication's palette. Run: node scripts/gen-post-art.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'images', 'posts');
mkdirSync(OUT_DIR, { recursive: true });

const POSTS = [
  ['context-engineering-is-the-job', 'CONTEXT'],
  ['agent-is-mostly-harness', 'HARNESS'],
  ['mcp-won-now-what', 'MCP'],
  ['real-cost-of-inference', 'INFERENCE'],
  ['anatomy-of-an-agent', 'AGENTS'],
  ['evals-or-it-didnt-happen', 'EVALS'],
  ['small-models-big-moment', 'MODELS'],
  ['agents-dont-have-memory', 'MEMORY'],
  ['reasoning-models-when-to-think', 'REASONING'],
  ['rag-grew-up', 'RETRIEVAL'],
  ['structured-outputs', 'SCHEMA'],
  ['multi-agent-when', 'MULTI-AGENT'],
  ['finetune-vs-prompt', 'TUNING'],
  ['prompt-injection-agents', 'SECURITY'],
  ['open-weights-vs-apis', 'WEIGHTS'],
  ['reviewing-ai-code', 'REVIEW'],
  ['latency-is-a-feature', 'LATENCY'],
  ['human-in-the-loop-design', 'HITL'],
  ['tool-design-for-agents', 'TOOLING'],
  ['ai-engineer-job-decoded', 'THE JOB'],
];

const W = 1200;
const H = 630;
const INK = '#16171d';
const FAINT = '#e3e2db';
const ACCENT = '#2b45ff';
const PAPER = '#fcfcfa';

// Deterministic PRNG seeded from the slug (mulberry32 over a string hash)
function rngFor(slug) {
  let h = 1779033703;
  for (let i = 0; i < slug.length; i++) {
    h = Math.imul(h ^ slug.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

function composition(slug, label, index) {
  const r = rngFor(slug);
  const parts = [];

  // Paper + hairline grid
  parts.push(`<rect width="${W}" height="${H}" fill="${PAPER}"/>`);
  const cols = 12;
  for (let i = 1; i < cols; i++) {
    const x = (W / cols) * i;
    parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${FAINT}" stroke-width="1"/>`);
  }
  for (let y = H / 6; y < H; y += H / 6) {
    parts.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${FAINT}" stroke-width="1"/>`);
  }

  // Scattered geometric composition: outlined rects, filled accent blocks,
  // circles/arcs, diagonal strokes. Kept to a coarse grid so it reads designed.
  const gx = (n) => Math.round((W / cols) * n);
  const gy = (n) => Math.round((H / 6) * n);
  const shapes = 9 + Math.floor(r() * 5);
  for (let i = 0; i < shapes; i++) {
    const kind = pick(r, ['rect', 'rect', 'accent', 'circle', 'arc', 'diag', 'dots']);
    const cx = gx(1 + Math.floor(r() * 10));
    const cy = gy(1 + Math.floor(r() * 4));
    if (kind === 'rect') {
      const w = gx(1 + Math.floor(r() * 3)) - gx(0);
      const h = gy(1 + Math.floor(r() * 2)) - gy(0);
      parts.push(`<rect x="${cx}" y="${cy}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="2"/>`);
    } else if (kind === 'accent') {
      const s = 18 + Math.floor(r() * 40);
      parts.push(`<rect x="${cx}" y="${cy}" width="${s}" height="${s}" fill="${ACCENT}"/>`);
    } else if (kind === 'circle') {
      const rad = 24 + Math.floor(r() * 70);
      const filled = r() < 0.25;
      parts.push(
        filled
          ? `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${INK}"/>`
          : `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${INK}" stroke-width="2"/>`
      );
    } else if (kind === 'arc') {
      const rad = 60 + Math.floor(r() * 120);
      parts.push(
        `<path d="M ${cx - rad} ${cy} A ${rad} ${rad} 0 0 1 ${cx + rad} ${cy}" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>`
      );
    } else if (kind === 'diag') {
      const len = gx(2 + Math.floor(r() * 3)) - gx(0);
      const dir = r() < 0.5 ? 1 : -1;
      parts.push(
        `<line x1="${cx}" y1="${cy}" x2="${cx + len}" y2="${cy + dir * len * 0.5}" stroke="${INK}" stroke-width="2"/>`
      );
    } else {
      const n = 3 + Math.floor(r() * 4);
      for (let d = 0; d < n; d++) {
        parts.push(`<circle cx="${cx + d * 22}" cy="${cy}" r="4.5" fill="${INK}"/>`);
      }
    }
  }

  // Masthead corners: publication mark + issue number + topic label
  const mono = `font-family="'IBM Plex Mono','SF Mono',Menlo,monospace"`;
  const no = String(index + 1).padStart(2, '0');
  parts.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${INK}" stroke-width="1.5"/>`);
  parts.push(`<rect x="40" y="${H - 96}" width="${36 + label.length * 19}" height="52" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`);
  parts.push(`<text x="57" y="${H - 62}" ${mono} font-size="24" letter-spacing="4" fill="${INK}">${label}</text>`);
  parts.push(`<rect x="28" y="38" width="320" height="40" fill="${PAPER}"/>`);
  parts.push(`<rect x="${W - 180}" y="38" width="152" height="40" fill="${PAPER}"/>`);
  parts.push(`<text x="40" y="64" ${mono} font-size="17" letter-spacing="5" fill="${INK}">AGENTIC COVER</text>`);
  parts.push(`<text x="${W - 40}" y="64" text-anchor="end" ${mono} font-size="17" letter-spacing="3" fill="${ACCENT}">NO. ${no}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img">${parts.join('')}</svg>\n`;
}

POSTS.forEach(([slug, label], i) => {
  writeFileSync(join(OUT_DIR, `${slug}.svg`), composition(slug, label, i));
  console.log(`images/posts/${slug}.svg`);
});
console.log(`\n${POSTS.length} covers generated.`);
