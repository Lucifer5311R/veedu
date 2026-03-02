import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { Product } from '@/lib/types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright-extra');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Guard against double-registration on HMR reloads
let stealthRegistered = false;
if (!stealthRegistered) {
    chromium.use(StealthPlugin());
    stealthRegistered = true;
}

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

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url || !url.includes('meesho.com')) {
        return NextResponse.json({ error: 'Invalid Meesho URL' }, { status: 400 });
    }

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
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 },
            locale: 'en-IN',
            timezoneId: 'Asia/Kolkata',
            extraHTTPHeaders: {
                'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Referer': 'https://www.meesho.com/',
            },
        });

        const page = await context.newPage();

        // Step 1: Visit Meesho homepage first so Akamai Bot Manager can set its
        // challenge cookies (_abck etc.) on a "safe" page before we visit the product.
        await page.goto('https://www.meesho.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
        // Simulate human-like pause
        await page.waitForTimeout(1500 + Math.floor(Math.random() * 1000));

        // Step 2: Navigate to the actual product page
        await page.goto(url, { waitUntil: 'load', timeout: 45000 });

        // Wait until h1 has actual text content (React has hydrated + Akamai challenge resolved)
        try {
            await page.waitForFunction(
                () => {
                    const h1 = document.querySelector('h1');
                    return h1 && h1.textContent && h1.textContent.trim().length > 3;
                },
                { timeout: 30000 }
            );
        } catch {
            // Log debug info so we can see what Meesho returned
            const debugUrl = page.url();
            const debugTitle = await page.title();
            const debugHtml = (await page.content()).substring(0, 800);
            console.warn('[Meesho] h1 not found. URL:', debugUrl, '| Title:', debugTitle, '| HTML preview:', debugHtml);
        }

        // Extract title — try h1 first, then og:title meta, then page title
        let title: string = '';
        try {
            title = await page.$eval('h1', (el: HTMLElement) => el.innerText.trim());
        } catch { /* h1 not found */ }

        if (!title) {
            try {
                title = await page.$eval(
                    'meta[property="og:title"]',
                    (el: Element) => (el as HTMLMetaElement).content.trim()
                );
            } catch { /* meta not found */ }
        }

        if (!title) {
            const pageTitle = await page.title();
            title = pageTitle.replace(/\s*[|\-–]\s*meesho.*/i, '').trim();
        }

        console.log('[Meesho] Extracted title:', title);

        // Extract price — try JSON-LD structured data first (most reliable), then DOM walk
        const price: number = await page.evaluate(() => {
            // 1. JSON-LD
            const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
            for (const s of scripts) {
                try {
                    const data = JSON.parse(s.textContent || '');
                    const p = data?.offers?.price || data?.price;
                    if (p) return parseInt(String(p), 10);
                } catch { /* skip */ }
            }
            // 2. DOM leaf nodes containing ₹
            const all = Array.from(document.querySelectorAll('*'));
            for (const el of all) {
                const text = (el as HTMLElement).innerText || '';
                const m = text.match(/₹\s*([0-9,]+)/);
                if (m && el.children.length === 0) {
                    return parseInt(m[1].replace(/,/g, ''), 10);
                }
            }
            // 3. Full body text
            const bodyText = document.body.innerText;
            const fallback = bodyText.match(/₹\s*([0-9,]+)/);
            return fallback ? parseInt(fallback[1].replace(/,/g, ''), 10) : 0;
        });

        console.log('[Meesho] Extracted price:', price);

        // Extract product images from Meesho CDN
        const images: string[] = await page.$$eval(
            'img[src*="images.meesho.com/images/products"]',
            (imgs: HTMLImageElement[]) =>
                imgs
                    .map((img) => img.src.replace(/_\d+\.jpg/, '_1024.jpg'))
                    .filter((src) => !src.includes('profile'))
                    .slice(0, 4)
        );
        const uniqueImages = Array.from(new Set(images));

        console.log('[Meesho] Extracted images:', uniqueImages.length);

        if (!title || !price) {
            return NextResponse.json(
                { error: 'Could not extract product details. Make sure the URL is a valid Meesho product page.' },
                { status: 422 }
            );
        }

        const sellingPrice = Math.round(price * 1.3 + 40);

        const newProduct: Product = {
            id: `prod_${crypto.randomUUID()}`,
            title,
            description: `High quality ${title.toLowerCase()}. Auto-imported from supplier.`,
            price,
            sellingPrice,
            images: uniqueImages,
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
        const msg = (error instanceof Error ? error.message : String(error));
        // Playwright / Chromium not available (e.g. on Vercel serverless)
        if (msg.includes('executable') || msg.includes('chromium') || msg.includes('ENOENT') || msg.includes('browserType')) {
            return NextResponse.json(
                { error: 'Browser scraping is not available in this environment. Use the bookmarklet fallback instead.' },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: 'Failed to fetch product from Meesho' }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
