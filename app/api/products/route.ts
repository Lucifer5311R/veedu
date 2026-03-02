import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/lib/types';
import { auth } from '@/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// ─── JSON fallback (dev without Supabase) ─────────────────────────────────────
function readProducts(): Product[] {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeProducts(products: Product[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
async function getSupabase() {
    const { supabase, rowToProduct } = await import('@/lib/supabase');
    return { supabase, rowToProduct };
}

// GET /api/products
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const idFilter = searchParams.get('id');

    if (useSupabase) {
        const { supabase, rowToProduct } = await getSupabase();

        if (idFilter) {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', idFilter)
                .eq('status', 'published')
                .single();
            if (error || !data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
            return NextResponse.json(rowToProduct(data));
        }

        if (statusFilter) {
            const session = await auth();
            if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            const { data, error } = await supabase.from('products').select('*').eq('status', statusFilter).order('created_at', { ascending: false });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json((data || []).map(rowToProduct));
        }

        const { data, error } = await supabase.from('products').select('*').eq('status', 'published').order('created_at', { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json((data || []).map(rowToProduct));
    }

    // JSON fallback
    if (idFilter) {
        const products = readProducts();
        const product = products.find(p => p.id === idFilter && p.status === 'published');
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    }
    if (statusFilter) {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return NextResponse.json(readProducts().filter(p => p.status === statusFilter));
    }
    return NextResponse.json(readProducts().filter(p => p.status === 'published'));
}

// POST /api/products
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
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

        if (useSupabase) {
            const { supabase, productToRow, rowToProduct } = await import('@/lib/supabase');
            const { data, error } = await supabase.from('products').insert(productToRow(newProduct as unknown as Record<string, unknown>)).select().single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json(rowToProduct(data), { status: 201 });
        }

        const products = readProducts();
        products.push(newProduct);
        writeProducts(products);
        return NextResponse.json(newProduct, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PATCH /api/products
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

        if (useSupabase) {
            const { supabase, productToRow, rowToProduct } = await import('@/lib/supabase');
            const { data, error } = await supabase
                .from('products')
                .update(productToRow(updates as Record<string, unknown>))
                .eq('id', id)
                .select()
                .single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json(rowToProduct(data));
        }

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

// DELETE /api/products
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

        if (useSupabase) {
            const { supabase } = await getSupabase();
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true });
        }

        const products = readProducts();
        const filtered = products.filter(p => p.id !== id);
        if (filtered.length === products.length) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        writeProducts(filtered);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
