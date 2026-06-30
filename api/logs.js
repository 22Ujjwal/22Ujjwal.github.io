/**
 * Chat Logs Viewer API - Vercel Edge Function
 * Returns chat logs from Vercel KV for admin review.
 * Protected by ADMIN_PASSWORD environment variable.
 */

export const config = { runtime: 'edge' };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ---------------------------------------------------------------------------
// KV helpers
// ---------------------------------------------------------------------------

function kvHeaders() {
  return {
    Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function kvScan(cursor, pattern, count = 100) {
  const url = `${process.env.KV_REST_API_URL}`;
  const body = JSON.stringify(['SCAN', cursor, 'MATCH', pattern, 'COUNT', count]);
  const res = await fetch(url, { method: 'POST', headers: kvHeaders(), body });
  if (!res.ok) return { cursor: '0', keys: [] };
  const data = await res.json();
  // SCAN returns [nextCursor, [key1, key2, ...]]
  return {
    cursor: String(data.result[0]),
    keys: data.result[1] || [],
  };
}

async function kvMget(keys) {
  if (keys.length === 0) return [];
  const url = `${process.env.KV_REST_API_URL}`;
  const body = JSON.stringify(['MGET', ...keys]);
  const res = await fetch(url, { method: 'POST', headers: kvHeaders(), body });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.result || []).map((v) => (v ? JSON.parse(v) : null));
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Only allow GET
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Authenticate
  const url = new URL(request.url);
  const password = url.searchParams.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Check KV availability
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return new Response(JSON.stringify({ error: 'KV not configured' }), {
      status: 503,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Scan all chat:* keys
  let allKeys = [];
  let cursor = '0';
  let iterations = 0;
  const MAX_ITERATIONS = 20; // safety limit

  do {
    const result = await kvScan(cursor, 'chat:*', 200);
    allKeys = allKeys.concat(result.keys);
    cursor = result.cursor;
    iterations++;
  } while (cursor !== '0' && iterations < MAX_ITERATIONS);

  // Fetch all values in batches (MGET has limits)
  const BATCH_SIZE = 50;
  let entries = [];

  for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
    const batch = allKeys.slice(i, i + BATCH_SIZE);
    const values = await kvMget(batch);

    for (let j = 0; j < batch.length; j++) {
      if (values[j]) {
        // Extract sessionId from key format: chat:sessionId:timestamp
        const parts = batch[j].split(':');
        const sessionId = parts.length >= 3 ? parts.slice(1, -1).join(':') : 'unknown';
        entries.push({
          key: batch[j],
          sessionId,
          ...values[j],
        });
      }
    }
  }

  // Sort by timestamp descending (most recent first)
  entries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Compute stats
  const totalMessages = entries.length;
  const sessionSet = new Set(entries.map((e) => e.sessionId));
  const totalSessions = sessionSet.size;

  // Messages today
  const now = Date.now();
  const startOfDay = now - (now % 86400000);
  const messagesToday = entries.filter((e) => e.timestamp >= startOfDay).length;

  // Top intents
  const intentCounts = {};
  for (const entry of entries) {
    const intent = entry.intent || 'unknown';
    intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  }
  const topIntents = Object.entries(intentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([intent, count]) => ({ intent, count }));

  const response = {
    stats: {
      totalSessions,
      totalMessages,
      messagesToday,
      topIntents,
    },
    entries,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
