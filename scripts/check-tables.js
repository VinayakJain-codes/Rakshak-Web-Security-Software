require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: gData, error: gError } = await supabase.from('guards').select('*').limit(1);
  console.log('Guards check:', { gData, gError });

  const { data: tData, error: tError } = await supabase.from('tenants').select('*').limit(1);
  console.log('Tenants check:', { tData, tError });
}

check();
