const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: CORS });
    }

    const auth = request.headers.get('Authorization');
    if (!env.API_KEY || auth !== `Bearer ${env.API_KEY}`) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const url = new URL(request.url);
    const flushIndex = parseInt(url.searchParams.get('flushIndex'), 10);
    const date       = url.searchParams.get('date');
    const count      = parseInt(url.searchParams.get('count'), 10);

    if (!flushIndex || !date || isNaN(count)) {
      return json({ error: 'Missing query params: flushIndex, date, count' }, 400);
    }

    if (count === 0) {
      return json({ ok: true, stored: 0 });
    }

    // Body is plain CSV text — no JSON parsing needed, stays within Worker CPU limits
    const csvData = await request.text();

    try {
      await env.DB
        .prepare('INSERT INTO accelerometer_data (date, flush_index, csv_data, count) VALUES (?, ?, ?, ?)')
        .bind(date, flushIndex, csvData, count)
        .run();

      return json({ ok: true, stored: count });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
