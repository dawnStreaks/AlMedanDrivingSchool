const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin');
        const cors = corsHeaders(origin, env);

        if (url.pathname === '/api/reviews' && request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }

        if (url.pathname === '/api/reviews' && request.method === 'GET') {
            if (!isAllowedOrigin(origin, env)) return json({ error: 'Origin not allowed.' }, 403);
            const { results } = await env.REVIEWS_DB.prepare(
                'SELECT name, rating, review FROM reviews ORDER BY created_at DESC LIMIT 100'
            ).all();
            return json(results, 200, { ...cors, 'Cache-Control': 'public, max-age=30' });
        }

        if (url.pathname === '/api/reviews' && request.method === 'POST') {
            if (!isAllowedOrigin(origin, env)) return json({ error: 'Origin not allowed.' }, 403, cors);
            return submitReview(request, env, cors);
        }

        if (url.pathname === '/health' && request.method === 'GET') return json({ ok: true });
        return json({ error: 'Not found.' }, 404, cors);
    }
};

async function submitReview(request, env, cors) {
    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid request.' }, 400, cors);
    }

    if (typeof body.website === 'string' && body.website.trim()) return json({ message: 'Thanks. Your review is now published.' }, 201, cors);

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const review = typeof body.review === 'string' ? body.review.trim() : '';
    const rating = Number(body.rating);
    if (!name || name.length > 100 || !review || review.length > 1000 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return json({ error: 'Enter a name, a review under 1,000 characters, and a rating from 1 to 5.' }, 400, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await sha256((env.RATE_LIMIT_SALT || env.ALLOWED_ORIGINS || 'reviews') + ':' + ip);
    const recent = await env.REVIEWS_DB.prepare(
        'SELECT COUNT(*) AS count FROM reviews WHERE submitter_hash = ? AND created_at > ?'
    ).bind(ipHash, Math.floor(Date.now() / 1000) - 3600).first();
    if (recent && recent.count >= 5) return json({ error: 'Please wait before submitting another review.' }, 429, cors);

    const createdAt = Math.floor(Date.now() / 1000);
    const inserted = await env.REVIEWS_DB.prepare(
        'INSERT INTO reviews (name, rating, review, submitter_hash, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(name, rating, review, ipHash, createdAt).run();

    return json({
        message: 'Thanks. Your review is now published.',
        review: { id: inserted.meta.last_row_id, name, rating, review }
    }, 201, cors);
}

function isAllowedOrigin(origin, env) {
    if (!origin) return true;
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    return allowed.includes(origin);
}

function corsHeaders(origin, env) {
    if (!origin || !isAllowedOrigin(origin, env)) return {};
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}

function json(value, status = 200, headers = {}) {
    return new Response(JSON.stringify(value), { status, headers: { ...JSON_HEADERS, ...headers } });
}

async function sha256(value) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
