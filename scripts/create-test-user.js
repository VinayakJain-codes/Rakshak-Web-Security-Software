require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@rakshak.in',
    password: process.env.TEST_USER_PASSWORD,
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
  } else {
    console.log('Successfully signed up user:', data.user?.email);
  }
}

signUp();
