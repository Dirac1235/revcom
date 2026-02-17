import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
  const { data, error } = await supabase.from('profiles').select('id, email, user_type');
  console.log('Profiles:', data);
  console.log('Error:', error);
}

check();
