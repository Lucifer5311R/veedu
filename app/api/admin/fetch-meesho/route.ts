import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { Product } from '@/lib/types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright-extra');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Guard against double-registration on HMR reloads — playwright-extra throws if same plugin type is added twice
try {
    chromium.use(StealthPlugin());
} catch { /* already registered */ }

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

async function saveProduct(product: Product) {
    if (useSupabase) {
        const { supabase, productToRow } = await import('@/lib/supabase');
        const { error } = await supabase.from('products').insert(productToRow(product as unknown as Record<string, unknown>));
        if (error) throw new Error(error.message);
    } else {
        let products: Product[] = [];
        try {
            const raw = fs.readFileSync(DATA_FILE, 'utf-8');
            products = JSON.parse(raw);
        } catch { /* empty file */ }
        products.push(product);
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    }
}

interface MeeshoProductData {
    title: string;
    price: number;
    images: string[];
    description: string;
}

/** Upgrade Meesho CDN image URL to highest available quality */
function upgradeImageQuality(src: string): string {
    // Handles: _512.jpg, _512.webp, _512.png, or no size suffix
    return src.replace(/_([\d]+)\.(jpg|jpeg|webp|png)(\?.*)?$/i, '_1024.$2$3');
}

/** Deduplicate and clean up a list of image URLs */
function cleanImages(urls: string[]): string[] {
    return Array.from(
        new Set(
            urls
                .map((u) => {
                    // Ensure absolute URL
                    const full = u.startsWith('http') ? u : `https://${u}`;
                    return upgradeImageQuality(full);
                })
                .filter((u) => u.includes('meesho.com') && !u.includes('profile'))
        )
    ).slice(0, 6);
}

/**
 * PRIMARY: Fetch via plain HTTP with mobile User-Agent.
 * Meesho is a Next.js app — product data is embedded in __NEXT_DATA__ JSON
 * in the raw HTML, no JavaScript execution needed.
 * Mobile UA is lighter-weight and less likely to trigger Akamai's bot challenge.
 */
async function fetchViaMobileHttp(url: string): Promise<MeeshoProductData | null> {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                Referer: 'https://www.meesho.com/',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="124"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
            },
            // 15s timeout via AbortController
            signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
            console.warn('[Meesho/HTTP] Response not OK:', res.status);
            return null;
        }

        const html = await res.text();

        // ── Path 1: Extract from embedded __NEXT_DATA__ JSON ──────────────────
        const nextDataMatch = html.match(
            /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
        );
        if (nextDataMatch) {
            try {
                const nextData = JSON.parse(nextDataMatch[1]);
                const pageProps = nextData?.props?.pageProps;
                // Meesho nests product data differently across versions — try known paths
                const productData =
                    pageProps?.product ||
                    pageProps?.productData ||
                    pageProps?.data?.product ||
                    pageProps?.catalogData?.product;

                if (productData) {
                    const title: string = productData.name || productData.title || '';
                    const price: number = parseInt(
                        String(productData.mrp || productData.price || productData.cost || 0),
                        10
                    );
                    const rawImages: string[] = (productData.images || []).map(
                        (img: { url?: string; src?: string } | string) =>
                            typeof img === 'string' ? img : img.url || img.src || ''
                    );
                    const description: string =
                        productData.description || productData.details || '';
                    if (title && price) {
                        console.log('[Meesho/HTTP] Got data from __NEXT_DATA__:', title, price);
                        return { title, price, images: cleanImages(rawImages), description };
                    }
                }
            } catch (e) {
                console.warn('[Meesho/HTTP] __NEXT_DATA__ parse failed:', e);
            }
        }

        // ── Path 2: JSON-LD structured data ───────────────────────────────────
        const ldMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        for (const match of ldMatches) {
            try {
                const ld = JSON.parse(match[1]);
                const ldPrice = ld?.offers?.price || ld?.price;
                const ldTitle = ld?.name || ld?.title || '';
                const ldDesc = ld?.description || '';
                if (ldTitle && ldPrice) {
                    const ldImageRaw = ld?.image || [];
                    const ldImages = Array.isArray(ldImageRaw) ? ldImageRaw : [ldImageRaw];
                    // Also scan for CDN images in HTML
                    const cdnImages = [...html.matchAll(/images\.meesho\.com\/images\/products\/[^"'\s\\]+/g)].map(
                        (m) => `https://${m[0]}`
                    );
                    console.log('[Meesho/HTTP] Got data from JSON-LD:', ldTitle, ldPrice);
                    return {
                        title: ldTitle,
                        price: parseInt(String(ldPrice), 10),
                        images: cleanImages([...ldImages, ...cdnImages]),
                        description: ldDesc,
                    };
                }
            } catch { /* skip malformed JSON-LD */ }
        }

        // ── Path 3: og:title + ₹ price from raw HTML ─────────────────────────
        const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)?.[1]
            ?.replace(/\s*[-|–]\s*meesho.*/i, '')
            .trim();
        const ogDesc = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/)?.[1]?.trim();
        const priceMatch = html.match(/₹\s*([0-9,]+)/);
        const cdnImages = [...html.matchAll(/images\.meesho\.com\/images\/products\/[^"'\s\\]+/g)].map(
            (m) => `https://${m[0]}`
        );

        if (ogTitle && priceMatch) {
            console.log('[Meesho/HTTP] Got data from og:meta:', ogTitle, priceMatch[1]);
            return {
                title: ogTitle,
                price: parseInt(priceMatch[1].replace(/,/g, ''), 10),
                images: cleanImages(cdnImages),
                description: ogDesc || '',
            };
        }

        console.warn('[Meesho/HTTP] Could not extract product data from HTML');
        return null;
    } catch (err) {
        console.warn('[Meesho/HTTP] fetch failed:', err);
        return null;
    }
}

/**
 * FALLBACK: Playwright + stealth headless browser.
 * Used only when the lightweight HTTP approach fails (e.g. Akamai challenge returned).
 */
async function fetchViaPlaywright(url: string): Promise<MeeshoProductData | null> {
    let browser = null;
    try {
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ],
        });

        const context = await browser.newContext({
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 },
            locale: 'en-IN',
            timezoneId: 'Asia/Kolkata',
            extraHTTPHeaders: {
                'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                Referer: 'https://www.meesho.com/',
            },
        });

        const page = await context.newPage();

        // Visit homepage first so Akamai can set challenge cookies on a "safe" page
        await page.goto('https://www.meesho.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(1500 + Math.floor(Math.random() * 1000));

        await page.goto(url, { waitUntil: 'load', timeout: 45000 });

        // Wait for h1 to have real text content after React hydration
        try {
            await page.waitForFunction(
                () => {
                    const h1 = document.querySelector('h1');
                    return h1 && h1.textContent && h1.textContent.trim().length > 3;
                },
                { timeout: 30000 }
            );
        } catch {
            const debugUrl = page.url();
            const debugTitle = await page.title();
            console.warn('[Meesho/PW] h1 not found. URL:', debugUrl, '| Title:', debugTitle);
        }

        // Title
        let title = '';
        try { title = await page.$eval('h1', (el: HTMLElement) => el.innerText.trim()); } catch { /* skip */ }
        if (!title) {
            try {
                title = await page.$eval(
                    'meta[property="og:title"]',
                    (el: Element) => (el as HTMLMetaElement).content.trim()
                );
            } catch { /* skip */ }
        }
        if (!title) {
            title = (await page.title()).replace(/\s*[|\-–]\s*meesho.*/i, '').trim();
        }

        // Description from og:description
        let description = '';
        try {
            description = await page.$eval(
                'meta[property="og:description"]',
                (el: Element) => (el as HTMLMetaElement).content.trim()
            );
        } catch { /* skip */ }

        // Price — JSON-LD → ₹ leaf nodes → body text
        const price: number = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
            for (const s of scripts) {
                try {
                    const data = JSON.parse(s.textContent || '');
                    const p = data?.offers?.price || data?.price;
                    if (p) return parseInt(String(p), 10);
                } catch { /* skip */ }
            }
            for (const el of Array.from(document.querySelectorAll('*'))) {
                const text = (el as HTMLElement).innerText || '';
                const m = text.match(/₹\s*([0-9,]+)/);
                if (m && el.children.length === 0) return parseInt(m[1].replace(/,/g, ''), 10);
            }
            const fallback = document.body.innerText.match(/₹\s*([0-9,]+)/);
            return fallback ? parseInt(fallback[1].replace(/,/g, ''), 10) : 0;
        });

        // Images from CDN
        const rawImages: string[] = await page.$$eval(
            'img[src*="images.meesho.com/images/products"]',
            (imgs: HTMLImageElement[]) => imgs.map((img) => img.src).filter((s) => !s.includes('profile'))
        );

        console.log('[Meesho/PW] title:', title, '| price:', price, '| images:', rawImages.length);

        if (!title || !price) return null;
        return { title, price, images: cleanImages(rawImages), description };
    } catch (err) {
        console.error('[Meesho/PW] error:', err);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url || !url.includes('meesho.com')) {
        return NextResponse.json({ error: 'Invalid Meesho URL' }, { status: 400 });
    }

    try {
        // Try lightweight HTTP approach first (no browser, harder to block)
        let productData = await fetchViaMobileHttp(url);

        if (!productData) {
            console.log('[Meesho] HTTP approach failed, trying Playwright...');
            productData = await fetchViaPlaywright(url);
        }

        if (!productData || !productData.title || !productData.price) {
            return NextResponse.json(
                { error: 'Could not extract product details. Make sure the URL is a valid Meesho product page.' },
                { status: 422 }
            );
        }

        const { title, price, images, description } = productData;
        const sellingPrice = Math.round(price * 1.3 + 40);

        const newProduct: Product = {
            id: `prod_${crypto.randomUUID()}`,
            title,
            description: description || `High quality ${title.toLowerCase()}. Imported from supplier.`,
            price,
            sellingPrice,
            images,
            category: 'Kitchen',
            sourceUrl: url,
            status: 'staged',
            isNew: true,
            inStock: true,
            createdAt: new Date().toISOString(),
        };

        await saveProduct(newProduct);

        return NextResponse.json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Meesho fetch error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        if (
            msg.includes('executable') ||
            msg.includes('chromium') ||
            msg.includes('ENOENT') ||
            msg.includes('browserType')
        ) {
            return NextResponse.json(
                { error: 'Browser scraping is not available in this environment. Use the bookmarklet fallback instead.' },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: 'Failed to fetch product from Meesho' }, { status: 500 });
    }
}
