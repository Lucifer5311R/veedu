import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Review } from '@/lib/types';
import { auth } from '@/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'reviews.json');
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// ─── JSON fallback (dev without Supabase) ─────────────────────────────────────
function readReviews(): Review[] {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeReviews(reviews: Review[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2));
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
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
        createdAt: (row.created_at ?? row.createdAt) as string,
    };
}

function reviewToRow(review: Partial<Review>) {
    const row: Record<string, unknown> = { ...review };
    if ('productId' in review) {
        row.product_id = review.productId;
        delete row.productId;
    }
    if ('createdAt' in review) {
        row.created_at = review.createdAt;
        delete row.createdAt;
    }
    return row;
}

// GET /api/reviews
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    // Public: get approved reviews for a specific product
    if (productId) {
        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .eq('approved', true)
                .order('created_at', { ascending: false });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json((data || []).map(rowToReview));
        }

        const reviews = readReviews()
            .filter(r => r.productId === productId && r.approved)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(reviews);
    }

    // Admin: get all reviews (requires auth)
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (useSupabase) {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json((data || []).map(rowToReview));
    }

    const reviews = readReviews()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(reviews);
}

// POST /api/reviews — public submission
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Honeypot spam check
        if (body.website) {
            return NextResponse.json({ success: true }, { status: 201 });
        }

        const { productId, name, rating, comment } = body;
        if (!productId || !name || !rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        const newReview: Review = {
            id: `rev_${crypto.randomUUID()}`,
            productId,
            name: String(name).trim(),
            rating,
            comment: String(comment).trim(),
            approved: false,
            createdAt: new Date().toISOString(),
        };

        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('reviews')
                .insert(reviewToRow(newReview))
                .select()
                .single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json(rowToReview(data), { status: 201 });
        }

        const reviews = readReviews();
        reviews.push(newReview);
        writeReviews(reviews);
        return NextResponse.json(newReview, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}

// PATCH /api/reviews — approve or delete a review (admin)
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id, approved } = body;
        if (!id) return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });

        // If approved is null/undefined, delete the review
        if (approved === null || approved === undefined) {
            if (useSupabase) {
                const supabase = await getSupabase();
                const { error } = await supabase.from('reviews').delete().eq('id', id);
                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true });
            }

            const reviews = readReviews();
            const filtered = reviews.filter(r => r.id !== id);
            if (filtered.length === reviews.length) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
            writeReviews(filtered);
            return NextResponse.json({ success: true });
        }

        // Otherwise, update the approved status
        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('reviews')
                .update({ approved })
                .eq('id', id)
                .select()
                .single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json(rowToReview(data));
        }

        const reviews = readReviews();
        const index = reviews.findIndex(r => r.id === id);
        if (index === -1) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        reviews[index] = { ...reviews[index], approved };
        writeReviews(reviews);
        return NextResponse.json(reviews[index]);
    } catch {
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// DELETE /api/reviews?id=XXX — delete a review (admin)
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });

        if (useSupabase) {
            const supabase = await getSupabase();
            const { error } = await supabase.from('reviews').delete().eq('id', id);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ success: true });
        }

        const reviews = readReviews();
        const filtered = reviews.filter(r => r.id !== id);
        if (filtered.length === reviews.length) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        writeReviews(filtered);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}
