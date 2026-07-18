require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSignIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@rakshak.in',
    password: process.env.TEST_USER_PASSWORD,
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
  } else {
    console.log('Successfully signed in user:', data.user?.email);
  }
}

testSignIn();
