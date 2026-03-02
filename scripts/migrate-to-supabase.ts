/**
 * One-time migration: import data/products.json → Supabase
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local
 *   - The `products` table must already exist in Supabase (run the SQL from plan.md)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
});

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    sellingPrice: number;
    images: string[];
    category: string;
    sourceUrl: string;
    status: 'staged' | 'published';
    isNew?: boolean;
    inStock?: boolean;
    createdAt: string;
}

async function migrate() {
    const dataFile = path.join(__dirname, '..', 'data', 'products.json');

    if (!fs.existsSync(dataFile)) {
        console.error('❌ data/products.json not found');
        process.exit(1);
    }

    const raw = fs.readFileSync(dataFile, 'utf-8');
    const products: Product[] = JSON.parse(raw);

    console.log(`📦 Found ${products.length} products in products.json`);

    if (products.length === 0) {
        console.log('Nothing to migrate.');
        return;
    }

    // Map camelCase → snake_case for Supabase
    const rows = products.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        price: p.price || 0,
        selling_price: p.sellingPrice || 0,
        images: p.images || [],
        category: p.category || 'Kitchen',
        source_url: p.sourceUrl || '',
        status: p.status || 'published',
        is_new: p.isNew ?? false,
        in_stock: p.inStock ?? true,
        created_at: p.createdAt || new Date().toISOString(),
    }));

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase
            .from('products')
            .upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
        } else {
            inserted += batch.length;
            console.log(`✅ Inserted batch ${i / batchSize + 1} (${inserted}/${rows.length})`);
        }
    }

    console.log(`\n🎉 Migration complete! ${inserted}/${rows.length} products migrated to Supabase.`);
}

migrate().catch(console.error);
