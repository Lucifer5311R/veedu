import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { Product } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

function setCORSHeaders(res: NextResponse, origin: string) {
    const allowed = ['https://www.meesho.com', 'https://meesho.com'];
    res.headers.set('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://www.meesho.com');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
}

// OPTIONS for CORS preflight (Bookmarklet bypass)
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin') || '';
    const res = new NextResponse(null, { status: 204 });
    setCORSHeaders(res, origin);
    return res;
}

// POST /api/admin/scrape-meesho
export async function POST(req: NextRequest) {
    const origin = req.headers.get('origin') || '';

    const session = await auth();
    if (!session) {
        const errRes = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        setCORSHeaders(errRes, origin);
        return errRes;
    }

    try {
        const body = await req.json();

        if (!body.url || !body.title || !body.price) {
            const errRes = NextResponse.json({ error: 'Incomplete data from bookmarklet' }, { status: 400 });
            setCORSHeaders(errRes, origin);
            return errRes;
        }

        const basePrice = parseInt(String(body.price).replace(/,/g, ''), 10);
        const sellingPrice = Math.round(basePrice * 1.3 + 40);

        const newProduct: Product = {
            id: `prod_${crypto.randomUUID()}`,
            title: body.title,
            description: `High quality ${body.title.toLowerCase()}. Auto-imported from supplier.`,
            price: basePrice,
            sellingPrice,
            images: body.images || [],
            category: 'Kitchen',
            sourceUrl: body.url,
            status: 'staged',
            isNew: true,
            createdAt: new Date().toISOString(),
        };

        // Persist to products.json
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const products: Product[] = JSON.parse(raw);
        products.push(newProduct);
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

        const res = NextResponse.json({ success: true, product: newProduct });
        setCORSHeaders(res, origin);
        return res;

    } catch (error) {
        console.error('Bookmarklet sync error:', error);
        const errRes = NextResponse.json({ error: 'Failed to sync product data' }, { status: 500 });
        setCORSHeaders(errRes, origin);
        return errRes;
    }
}

