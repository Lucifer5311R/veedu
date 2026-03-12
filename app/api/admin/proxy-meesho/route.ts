import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Run on Vercel Edge (Cloudflare Workers infrastructure).
// Cloudflare IPs bypass Meesho/Akamai bot-protection that blocks Vercel Node IPs.
export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = req.nextUrl.searchParams.get('url') || '';
    if (!url.includes('meesho.com')) {
        return new NextResponse('Invalid URL', { status: 400 });
    }

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                'Referer': 'https://meesho.com/',
                'Cache-Control': 'no-cache',
            },
            // @ts-expect-error - cf is a Cloudflare Workers extension
            cf: { cacheEverything: false },
        });

        if (!res.ok) {
            return new NextResponse(`Upstream error: ${res.status}`, { status: 502 });
        }

        const html = await res.text();
        return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    } catch (err) {
        return new NextResponse(`Fetch failed: ${err}`, { status: 502 });
    }
}
