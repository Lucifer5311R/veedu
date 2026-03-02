import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { Product } from '@/lib/types';

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

    try {
        // Fetch the Meesho page HTML server-side
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Referer': 'https://www.meesho.com/',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch page: ${response.status}` }, { status: 502 });
        }

        const html = await response.text();

        // Extract title from <h1> tag
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/ui);
        let title: string | null = titleMatch
            ? titleMatch[1].replace(/<[^>]+>/g, '').trim()
            : null;

        // Fallback: og:title meta tag
        if (!title) {
            const metaTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
                || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
            if (metaTitleMatch) title = metaTitleMatch[1].trim();
        }

        // Extract price from ₹ symbol
        const priceMatch = html.match(/\u20b9\s*([0-9,]+)/u);
        let price: number | null = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : null;

        // Fallback: JSON-LD price
        if (!price) {
            const jsonPriceMatch = html.match(/"price"\s*:\s*"?([0-9]+)"?/);
            if (jsonPriceMatch) price = parseInt(jsonPriceMatch[1], 10);
        }

        // Extract product images from Meesho CDN
        const imgRegex = /<img[^>]+src="([^"]+images\.meesho\.com\/images\/products\/[^"]+)"/g;
        const images: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = imgRegex.exec(html)) !== null) {
            images.push(m[1].replace(/_\d+\.jpg/g, '_512.jpg'));
        }
        const uniqueImages = Array.from(new Set(images))
            .filter(i => !i.includes('profile'))
            .slice(0, 4);

        if (!title || !price) {
            return NextResponse.json(
                { error: 'Could not extract product details. The page may be blocked or the URL is not a product page.' },
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
    }
}
