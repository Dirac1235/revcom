import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  // Try to query each table to see if it exists
  const tables = ['products', 'requests', 'orders', 'profiles', 'conversations', 'messages'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    console.log(`${table}: ${error ? error.message : 'exists'}`);
  }
}

check();
