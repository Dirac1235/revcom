import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}:5432/postgres`,
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating tables...\n');

    // Products table
    await client.query(`
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
    `);
    console.log('✓ Products table created');

    // Enable RLS on products
    await client.query(`ALTER TABLE products ENABLE ROW LEVEL SECURITY;`);
    
    // Products RLS policies
    await client.query(`DROP POLICY IF EXISTS "Users can view all products" ON products;`);
    await client.query(`CREATE POLICY "Users can view all products" ON products FOR SELECT USING (true);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can insert their own products" ON products;`);
    await client.query(`CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can update their own products" ON products;`);
    await client.query(`CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (auth.uid() = seller_id);`);
    
    await client.query(`DROP POLICY IF EXISTS "Users can delete their own products" ON products;`);
    await client.query(`CREATE POLICY "Users can delete their own products" ON products FOR DELETE USING (auth.uid() = seller_id);`);
    
    console.log('✓ Products RLS policies created');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);`);
    console.log('✓ Products indexes created');

    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();
