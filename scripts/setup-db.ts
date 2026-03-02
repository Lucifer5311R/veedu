/**
 * Setup database: creates the products table in Supabase.
 *
 * Usage: npm run setup-db
 *
 * This script will:
 * 1. Check if the table already exists → if yes, runs migration automatically
 * 2. If not, shows the SQL to paste in the Supabase dashboard
 * 3. Opens the Supabase SQL Editor in your browser
 * 4. Waits up to 5 minutes, then auto-runs migration once table is detected
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { execSync, spawn } from 'child_process';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

const CREATE_SQL = `CREATE TABLE IF NOT EXISTS products (
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
);`;

async function tableExists(): Promise<boolean> {
    const { error } = await supabase.from('products').select('id').limit(1);
    return !error;
}

async function runMigration() {
    console.log('\n🚀 Running migration: products.json → Supabase...\n');
    try {
        execSync('npx tsx scripts/migrate-to-supabase.ts', {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
        });
    } catch {
        console.error('Migration failed. Run manually: npm run migrate');
    }
}

async function main() {
    console.log('🔧 Veedu — Supabase Setup\n' + '─'.repeat(50));

    if (await tableExists()) {
        console.log('✅ Table "products" already exists!\n');
        await runMigration();
        return;
    }

    // Print instructions
    console.log('\n📋 ACTION REQUIRED: Create the table in Supabase\n');
    console.log('1. Open this URL in your browser:');
    console.log(`   \x1b[36m${sqlEditorUrl}\x1b[0m\n`);
    console.log('2. Paste and run this SQL:\n');
    console.log('─'.repeat(50));
    console.log(CREATE_SQL);
    console.log('─'.repeat(50));

    // Try to open the browser automatically
    try {
        if (process.platform === 'win32') {
            spawn('cmd', ['/c', 'start', sqlEditorUrl], { detached: true, stdio: 'ignore' }).unref();
            console.log('\n✨ Opened Supabase SQL Editor in your browser.');
        }
    } catch { /* ignore */ }

    // Poll until table exists (up to 5 minutes)
    console.log('\n⏳ Waiting for you to create the table...');
    console.log('   (This will auto-continue once done)\n');

    const maxAttempts = 60; // 5 minutes at 5s intervals
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 5000));
        if (await tableExists()) {
            console.log('\n✅ Table detected! Running migration...');
            await runMigration();
            return;
        }
        if ((i + 1) % 6 === 0) console.log(`   Still waiting... (${Math.round((i + 1) / 12)} min elapsed)`);
    }

    console.log('\n⚠️  Timed out. After creating the table, run: npm run migrate');
}

main().catch(console.error);
