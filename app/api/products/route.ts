import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/lib/types';
import { auth } from '@/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

function readProducts(): Product[] {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeProducts(products: Product[]) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    } catch (err) {
        throw new Error(`Failed to write products: ${err}`);
    }
}

// GET /api/products - List published products (or filtered by ?status= / ?id= for admin)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const idFilter = searchParams.get('id');

    // Single product by ID (public — needed for product detail page)
    if (idFilter) {
        const products = readProducts();
        const product = products.find(p => p.id === idFilter && p.status === 'published');
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    }

    if (statusFilter) {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const products = readProducts();
        return NextResponse.json(products.filter(p => p.status === statusFilter));
    }

    const products = readProducts();
    return NextResponse.json(products.filter(p => p.status === 'published'));
}

// POST /api/products - Create a new product (admin only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const products = readProducts();

        const newProduct: Product = {
            id: `prod_${crypto.randomUUID()}`,
            title: body.title || 'Untitled Product',
            description: body.description || '',
            price: body.price || 0,
            sellingPrice: body.sellingPrice || Math.round((body.price || 0) * 1.3 + 40),
            images: body.images || [],
            category: body.category || 'Kitchen',
            sourceUrl: body.sourceUrl || '',
            status: body.status || 'staged',
            isNew: true,
            inStock: true,
            createdAt: new Date().toISOString(),
        };

        products.push(newProduct);
        writeProducts(products);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PATCH /api/products - Update a product (admin only)
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

        const products = readProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        products[index] = { ...products[index], ...updates };
        writeProducts(products);

        return NextResponse.json(products[index]);
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE /api/products - Delete a product (admin only)
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

        const products = readProducts();
        const filtered = products.filter(p => p.id !== id);

        if (filtered.length === products.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        writeProducts(filtered);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}

