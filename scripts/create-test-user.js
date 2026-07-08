const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '***REMOVED***',
  '***REMOVED***'
);

async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@rakshak.in',
    password: '***REMOVED***',
  });
  
  if (error) {
    console.error('Error signing up:', error.message);
  } else {
    console.log('Successfully signed up user:', data.user?.email);
  }
}

signUp();
