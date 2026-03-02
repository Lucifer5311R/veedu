-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste & run

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    selling_price INTEGER NOT NULL DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    category TEXT DEFAULT 'Kitchen',
    source_url TEXT DEFAULT '',
    status TEXT DEFAULT 'staged' CHECK (status IN ('staged', 'published')),
    is_new BOOLEAN DEFAULT true,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to read published products (for storefront)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Public can read published products"
    ON products FOR SELECT
    USING (status = 'published');
