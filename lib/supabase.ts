import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side only client using service_role key — bypasses RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
});

// Map DB row (snake_case) → Product type (camelCase)
export function rowToProduct(row: Record<string, unknown>) {
    return {
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        price: row.price as number,
        sellingPrice: row.selling_price as number,
        images: (row.images as string[]) || [],
        category: row.category as string,
        sourceUrl: (row.source_url as string) || '',
        status: row.status as 'staged' | 'published',
        isNew: row.is_new as boolean,
        inStock: row.in_stock as boolean,
        createdAt: row.created_at as string,
    };
}

// Map Product type → DB row (snake_case)
export function productToRow(product: Partial<Record<string, unknown>>) {
    const row: Record<string, unknown> = {};
    if ('id' in product) row.id = product.id;
    if ('title' in product) row.title = product.title;
    if ('description' in product) row.description = product.description;
    if ('price' in product) row.price = product.price;
    if ('sellingPrice' in product) row.selling_price = product.sellingPrice;
    if ('images' in product) row.images = product.images;
    if ('category' in product) row.category = product.category;
    if ('sourceUrl' in product) row.source_url = product.sourceUrl;
    if ('status' in product) row.status = product.status;
    if ('isNew' in product) row.is_new = product.isNew;
    if ('inStock' in product) row.in_stock = product.inStock;
    if ('createdAt' in product) row.created_at = product.createdAt;
    return row;
}
