/**
 * Veedu Meesho Proxy — Cloudflare Worker
 *
 * Fetches Meesho product pages from Cloudflare's network (not blocked by Akamai),
 * then returns the HTML to the Veedu Vercel app.
 *
 * Setup:
 *   1. Go to https://workers.cloudflare.com/ → Create Worker → paste this code
 *   2. Settings → Variables → add SECRET_KEY = any random string (e.g. a UUID)
 *   3. Copy your worker URL (e.g. https://veedu-proxy.your-name.workers.dev)
 *   4. In Vercel: add env vars CF_PROXY_URL and CF_PROXY_SECRET
 *
 * Free tier: 100,000 requests / day — more than enough.
 */
export default {
    async fetch(request, env) {
        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders(),
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        // Authenticate — prevent public abuse of your proxy
        const auth = request.headers.get('Authorization') || '';
        const secret = env.SECRET_KEY || '';
        if (!secret || auth !== `Bearer ${secret}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        let url;
        try {
            const body = await request.json();
            url = body.url;
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders() },
            });
        }

        if (!url || !url.includes('meesho.com')) {
            return new Response(JSON.stringify({ error: 'Invalid Meesho URL' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders() },
            });
        }

        // Normalise: strip www — try both
        const urlsToTry = [
            url.replace('://www.meesho.com/', '://meesho.com/'),
            url,
        ];

        for (const fetchUrl of urlsToTry) {
            try {
                const res = await fetch(fetchUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                        'Referer': 'https://www.google.com/',
                        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="124"',
                        'sec-ch-ua-mobile': '?1',
                        'sec-ch-ua-platform': '"Android"',
                        'Upgrade-Insecure-Requests': '1',
                        'Cache-Control': 'no-cache',
                    },
                });

                if (!res.ok) {
                    console.log(`[Proxy] ${fetchUrl} → ${res.status}`);
                    continue;
                }

                const html = await res.text();

                // Return raw HTML — Vercel app will parse it
                return new Response(html, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'X-Proxy-Source': new URL(fetchUrl).hostname,
                        ...corsHeaders(),
                    },
                });
            } catch (err) {
                console.error(`[Proxy] fetch failed for ${fetchUrl}:`, err.message);
            }
        }

        return new Response(JSON.stringify({ error: 'Meesho blocked this request' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
    },
};

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}
