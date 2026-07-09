/**
 * View Counter API - Vercel Edge Function
 * Real view counts stored in Vercel KV. Counters start at zero and increment
 * on actual page views only.
 *
 * POST { slug }       -> increments and returns the view count for a post
 * GET  ?slugs=a,b,c   -> returns view counts for the given post slugs
 */

export const config = { runtime: 'edge' };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SLUG_RE = /^[a-z0-9-]{1,80}$/;
const MAX_SLUGS = 50;
// One count per IP per post per window, so refresh-spamming doesn't inflate numbers
const DEDUPE_WINDOW_SEC = 60 * 60 * 6;

function kvHeaders() {
  return {
    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function kvCommand(cmd) {
  const res = await fetch(`${process.env.KV_REST_API_URL}`, {
    method: 'POST',
    headers: kvHeaders(),
    body: JSON.stringify(cmd),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (!kvConfigured()) {
    return json(503, { error: 'Storage not configured' });
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: 'Invalid JSON' });
    }
    const slug = String(body?.slug || '');
    if (!SLUG_RE.test(slug)) return json(400, { error: 'Invalid slug' });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const dedupeKey = `viewed:${slug}:${ip}`;
    const firstView = await kvCommand(['SET', dedupeKey, '1', 'NX', 'EX', DEDUPE_WINDOW_SEC]);

    let views;
    if (firstView === 'OK') {
      views = await kvCommand(['INCR', `views:${slug}`]);
    } else {
      views = await kvCommand(['GET', `views:${slug}`]);
    }
    return json(200, { slug, views: Number(views) || 0 });
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const slugs = (url.searchParams.get('slugs') || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => SLUG_RE.test(s))
      .slice(0, MAX_SLUGS);

    if (slugs.length === 0) return json(400, { error: 'No valid slugs' });

    const results = await kvCommand(['MGET', ...slugs.map((s) => `views:${s}`)]);
    const views = {};
    slugs.forEach((slug, i) => {
      views[slug] = Number(results?.[i]) || 0;
    });
    return json(200, { views });
  }

  return json(405, { error: 'Method not allowed' });
}
