import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order } from '@/lib/types';
import { auth } from '@/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'orders.json');
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

// ─── JSON fallback helpers ──────────────────────────────────────────────────
function readOrders(): Order[] {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function writeOrders(orders: Order[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
}

// ─── Supabase helpers ───────────────────────────────────────────────────────
async function getSupabase() {
    const { supabase } = await import('@/lib/supabase');
    return supabase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(row: Record<string, any>): Order {
    return {
        id: row.id,
        items: row.items,
        subtotal: row.subtotal,
        shipping: row.shipping,
        tax: row.tax,
        total: row.total,
        customer: row.customer,
        upiTransactionId: row.upi_transaction_id ?? undefined,
        status: row.status,
        createdAt: row.created_at,
    };
}

function orderToRow(order: Partial<Order>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if ('id' in order) row.id = order.id;
    if ('items' in order) row.items = order.items;
    if ('subtotal' in order) row.subtotal = order.subtotal;
    if ('shipping' in order) row.shipping = order.shipping;
    if ('tax' in order) row.tax = order.tax;
    if ('total' in order) row.total = order.total;
    if ('customer' in order) row.customer = order.customer;
    if ('upiTransactionId' in order) row.upi_transaction_id = order.upiTransactionId;
    if ('status' in order) row.status = order.status;
    if ('createdAt' in order) row.created_at = order.createdAt;
    return row;
}

// ─── GET /api/orders ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    // Lookup by phone (public)
    if (phone) {
        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer->>phone', phone)
                .order('created_at', { ascending: false });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json((data || []).map(rowToOrder));
        }
        const orders = readOrders()
            .filter(o => o.customer.phone === phone)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(orders);
    }

    // Lookup by ID (public)
    if (id) {
        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();
            if (error || !data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            return NextResponse.json(rowToOrder(data));
        }
        const order = readOrders().find(o => o.id === id);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        return NextResponse.json(order);
    }

    // Admin: return all orders
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (useSupabase) {
        const supabase = await getSupabase();
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json((data || []).map(rowToOrder));
    }

    const orders = readOrders().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(orders);
}

// ─── POST /api/orders ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, subtotal, shipping, tax, total, customer, upiTransactionId } = body;

        if (!items || !customer) {
            return NextResponse.json({ error: 'Items and customer details are required' }, { status: 400 });
        }

        const orderId = `VDU-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

        const newOrder: Order = {
            id: orderId,
            items,
            subtotal: subtotal || 0,
            shipping: shipping || 0,
            tax: tax || 0,
            total: total || 0,
            customer,
            upiTransactionId: upiTransactionId || undefined,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('orders')
                .insert(orderToRow(newOrder))
                .select()
                .single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json(rowToOrder(data), { status: 201 });
        }

        const orders = readOrders();
        orders.push(newOrder);
        writeOrders(orders);
        return NextResponse.json(newOrder, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

// ─── PATCH /api/orders ──────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
        }

        const validStatuses = ['pending', 'paid', 'shipped', 'delivered'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
        }

        if (useSupabase) {
            const supabase = await getSupabase();
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json(rowToOrder(data));
        }

        const orders = readOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        orders[index] = { ...orders[index], status };
        writeOrders(orders);
        return NextResponse.json(orders[index]);
    } catch {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
