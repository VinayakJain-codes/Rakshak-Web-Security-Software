const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '***REMOVED***',
  '***REMOVED***'
);

async function testSignIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@rakshak.in',
    password: '***REMOVED***',
  });
  
  if (error) {
    console.error('Error signing in:', error.message);
  } else {
    console.log('Successfully signed in user:', data.user?.email);
  }
}

testSignIn();
