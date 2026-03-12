/**
 * Veedu Meesho Proxy — Cloudflare Worker
 * Paste this into the Cloudflare Workers online editor (no build needed).
 *
 * Setup:
 *   1. Paste this code into the editor → Deploy
 *   2. Settings → Variables → SECRET_KEY = any password you choose
 *   3. Add to Vercel env vars: NEXT_PUBLIC_CF_PROXY_URL + NEXT_PUBLIC_CF_PROXY_SECRET
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Auth check
  const auth = request.headers.get('Authorization') || ''
  if (auth !== 'Bearer ' + SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 })
  }

  let url
  try {
    const body = await request.json()
    url = body.url
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...cors }
    })
  }

  if (!url || !url.includes('meesho.com')) {
    return new Response(JSON.stringify({ error: 'Invalid Meesho URL' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...cors }
    })
  }

  const urlsToTry = [
    url.replace('://www.meesho.com/', '://meesho.com/'),
    url
  ]

  const fetchHeaders = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
    'Referer': 'https://www.google.com/',
    'Cache-Control': 'no-cache',
  }

  for (const fetchUrl of urlsToTry) {
    try {
      const res = await fetch(fetchUrl, { headers: fetchHeaders })
      if (!res.ok) { continue }
      const html = await res.text()
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...cors }
      })
    } catch (e) {
      continue
    }
  }

  return new Response(JSON.stringify({ error: 'Meesho blocked this request' }), {
    status: 502, headers: { 'Content-Type': 'application/json', ...cors }
  })
}
