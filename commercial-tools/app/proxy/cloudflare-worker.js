const ALLOWED_HEADERS = 'Authorization, Content-Type, X-API-Key';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': ALLOWED_HEADERS, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!env.CONNECTSAFELY_ORIGIN) return new Response('CONNECTSAFELY_ORIGIN is not configured', { status: 500, headers: cors });
    const incoming = new URL(request.url), upstream = new URL(incoming.pathname + incoming.search, env.CONNECTSAFELY_ORIGIN);
    const headers = new Headers(request.headers); headers.delete('origin'); headers.delete('host');
    const response = await fetch(upstream, { method: request.method, headers, body: ['GET','HEAD'].includes(request.method) ? undefined : request.body, redirect: 'follow' });
    const output = new Headers(response.headers); Object.entries(cors).forEach(([key, value]) => output.set(key, value));
    return new Response(response.body, { status: response.status, headers: output });
  }
};
