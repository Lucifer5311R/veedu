import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Review } from '@/lib/types';
import { auth } from '@/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'reviews.json');
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// ─── JSON fallback ──────────────────────────────────────────────────────────
function readReviews(): Review[] {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch { return []; }
}
function writeReviews(reviews: Review[]) {
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2)); } catch (e) { console.error('Failed to write reviews:', e); }
}
function readOrders(): { items?: { product?: { id?: string }; productId?: string }[] }[] {
    try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8')); } catch { return []; }
}

// ─── Supabase helpers ───────────────────────────────────────────────────────
async function getSupabase() {
    const { supabase } = await import('@/lib/supabase');
    return supabase;
}

function rowToReview(row: Record<string, unknown>): Review {
    return {
        id: row.id as string,
        productId: (row.product_id ?? row.productId) as string,
        name: row.name as string,
        rating: row.rating as number,
        comment: row.comment as string,
        approved: row.approved as boolean,
        verifiedPurchase: (row.verified_purchase ?? row.verifiedPurchase) as boolean | undefined,
        createdAt: (row.created_at ?? row.createdAt) as string,
    };
}

function reviewToRow(review: Partial<Review>) {
    const row: Record<string, unknown> = { ...review };
    if ('productId' in review) { row.product_id = review.productId; delete row.productId; }
    if ('verifiedPurchase' in review) { row.verified_purchase = review.verifiedPurchase; delete row.verifiedPurchase; }
    if ('createdAt' in review) { row.created_at = review.createdAt; delete row.createdAt; }
    return row;
}

// Helper: try Supabase, fall back gracefully if table doesn't exist
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function trySupabase<T>(fn: (sb: any) => Promise<{ data: T | null; error: any }>): Promise<{ data: T | null; ok: boolean }> {
    if (!useSupabase) return { data: null, ok: false };
    try {
        const sb = await getSupabase();
        const { data, error } = await fn(sb);
        if (error) {
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn('Supabase reviews table not found, using JSON fallback');
                return { data: null, ok: false };
            }
            throw error;
        }
        return { data, ok: true };
    } catch (err) {
        console.warn('Supabase reviews query failed, using JSON fallback:', err);
        return { data: null, ok: false };
    }
}

// ─── GET /api/reviews ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        // Public: approved reviews for a product
        if (productId) {
            const { data, ok } = await trySupabase<Record<string, unknown>[]>(sb =>
                sb.from('reviews').select('*').eq('product_id', productId).eq('approved', true).order('created_at', { ascending: false })
            );
            if (ok) return NextResponse.json((data || []).map(rowToReview));

            const reviews = readReviews()
                .filter(r => r.productId === productId && r.approved)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return NextResponse.json(reviews);
        }

        // Admin: all reviews
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, ok } = await trySupabase<Record<string, unknown>[]>(sb =>
            sb.from('reviews').select('*').order('created_at', { ascending: false })
        );
        if (ok) return NextResponse.json((data || []).map(rowToReview));

        const reviews = readReviews()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(reviews);
    } catch (err) {
        console.error('GET /api/reviews error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ─── POST /api/reviews ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Honeypot spam check
        if (body.website) return NextResponse.json({ success: true }, { status: 201 });

        const { productId, name, rating, comment } = body;
        if (!productId || !name || !rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Check if reviewer has purchased this product
        let verifiedPurchase = false;
        try {
            const { data: ordersData, ok } = await trySupabase<Record<string, unknown>[]>(sb => sb.from('orders').select('items'));
            if (ok && ordersData) {
                verifiedPurchase = (ordersData as { items?: { product?: { id?: string }; productId?: string }[] }[]).some(order =>
                    order.items?.some(item => (item.product?.id ?? item.productId) === productId)
                );
            } else {
                const orders = readOrders();
                verifiedPurchase = orders.some(order =>
                    order.items?.some(item => (item.product?.id ?? item.productId) === productId)
                );
            }
        } catch { /* keep verifiedPurchase = false */ }

        const newReview: Review = {
            id: `rev_${crypto.randomUUID()}`,
            productId,
            name: String(name).trim(),
            rating,
            comment: String(comment).trim(),
            approved: false,
            verifiedPurchase,
            createdAt: new Date().toISOString(),
        };

        const { data, ok } = await trySupabase<Record<string, unknown>>(sb =>
            sb.from('reviews').insert(reviewToRow(newReview)).select().single()
        );
        if (ok && data) return NextResponse.json(rowToReview(data as Record<string, unknown>), { status: 201 });

        const reviews = readReviews();
        reviews.push(newReview);
        writeReviews(reviews);
        return NextResponse.json(newReview, { status: 201 });
    } catch (err) {
        console.error('POST /api/reviews error:', err);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}

// ─── PATCH /api/reviews ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, approved } = body;
        if (!id) return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });

        // If approved is null/undefined, delete the review
        if (approved === null || approved === undefined) {
            const { ok } = await trySupabase<Record<string, unknown>>(sb => sb.from('reviews').delete().eq('id', id));
            if (ok) return NextResponse.json({ success: true });

            const reviews = readReviews();
            const filtered = reviews.filter(r => r.id !== id);
            if (filtered.length === reviews.length) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
            writeReviews(filtered);
            return NextResponse.json({ success: true });
        }

        // Update approved status
        const { data, ok } = await trySupabase<Record<string, unknown>>(sb =>
            sb.from('reviews').update({ approved }).eq('id', id).select().single()
        );
        if (ok && data) return NextResponse.json(rowToReview(data as Record<string, unknown>));

        const reviews = readReviews();
        const index = reviews.findIndex(r => r.id === id);
        if (index === -1) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        reviews[index] = { ...reviews[index], approved };
        writeReviews(reviews);
        return NextResponse.json(reviews[index]);
    } catch (err) {
        console.error('PATCH /api/reviews error:', err);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// ─── DELETE /api/reviews?id=XXX ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });

        const { ok } = await trySupabase<Record<string, unknown>>(sb => sb.from('reviews').delete().eq('id', id));
        if (ok) return NextResponse.json({ success: true });

        const reviews = readReviews();
        const filtered = reviews.filter(r => r.id !== id);
        if (filtered.length === reviews.length) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        writeReviews(filtered);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/reviews error:', err);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
