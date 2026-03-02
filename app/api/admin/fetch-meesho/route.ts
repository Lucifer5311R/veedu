import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { Product } from '@/lib/types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { chromium } = require('playwright-extra');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

chromium.use(StealthPlugin());

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

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
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // Set realistic viewport and extra headers
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for the product title to be rendered by React
        await page.waitForSelector('h1', { timeout: 15000 });

        // Extract title
        const title: string = await page.$eval('h1', (el: HTMLElement) => el.innerText.trim());

        // Extract price — look for elements containing ₹
        const price: number = await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll('*'));
            for (const el of all) {
                const text = (el as HTMLElement).innerText || '';
                const m = text.match(/₹\s*([0-9,]+)/);
                if (m && el.children.length === 0) {
                    return parseInt(m[1].replace(/,/g, ''), 10);
                }
            }
            // Fallback: any ₹ in the page text
            const bodyText = document.body.innerText;
            const fallback = bodyText.match(/₹\s*([0-9,]+)/);
            return fallback ? parseInt(fallback[1].replace(/,/g, ''), 10) : 0;
        });

        // Extract product images from Meesho CDN
        const images: string[] = await page.$$eval(
            'img[src*="images.meesho.com/images/products"]',
            (imgs: HTMLImageElement[]) =>
                imgs
                    .map((img) => img.src.replace(/_\d+\.jpg/, '_512.jpg'))
                    .filter((src) => !src.includes('profile'))
                    .slice(0, 4)
        );
        const uniqueImages = Array.from(new Set(images));

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
            createdAt: new Date().toISOString(),
        };

        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const products: Product[] = JSON.parse(raw);
        products.push(newProduct);
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

        return NextResponse.json({ success: true, product: newProduct });

    } catch (error) {
        console.error('Meesho fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch product from Meesho' }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
