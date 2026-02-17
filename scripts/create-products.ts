import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function createProductsTable() {
  console.log('Creating products table...\n');

  // Create products table using raw SQL via postgrest
  const createSQL = `
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      image_url TEXT,
      inventory_quantity INTEGER DEFAULT 0,
      specifications JSONB DEFAULT '{}',
      views INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // Use pg_catalog to execute
  const { error } = await supabase.from('pg_catalog.pg_tables').select('*');
  
  // Alternative: Try with auth.users
  console.log('Trying alternative approach...');
  
  // Check if we can at least see what's available
  const { data, error: err } = await supabase.auth.admin.listUsers();
  console.log('Auth users:', data?.users?.length || 0);
  console.log('Error:', err);
}

createProductsTable();
