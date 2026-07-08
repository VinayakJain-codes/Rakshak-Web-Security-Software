const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = '***REMOVED***';
const supabaseAnonKey = '***REMOVED***';

// Create a client that persists the session in memory so we can log in and update the user
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'mem-storage',
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const tenantId = 'c032649b-73e4-4d1a-be03-5197825d19a4';

async function handleUser({ email, password, role, tenantId }) {
  console.log(`\n--- Processing User: ${email} ---`);
  
  // Try to sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...(tenantId ? { tenant_id: tenantId } : {})
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log(`User ${email} is already registered. Attempting to log in and update credentials/metadata...`);
      
      // Try to log in with the target password
      const res1 = await supabase.auth.signInWithPassword({ email, password });
      
      if (!res1.error) {
        console.log(`Successfully logged in with target password for ${email}`);
      } else {
        console.log(`Could not log in with target password: ${res1.error.message}. Trying fallback password (***REMOVED***)...`);
        
        const res2 = await supabase.auth.signInWithPassword({
          email,
          password: '***REMOVED***'
        });

        if (!res2.error) {
          console.log(`Logged in with fallback password. Updating password to target password...`);
          
          const { error: updatePassError } = await supabase.auth.updateUser({
            password
          });
          
          if (updatePassError) {
            console.error(`Failed to update password for ${email}:`, updatePassError.message);
          } else {
            console.log(`Password updated successfully for ${email}`);
          }
        } else {
          console.error(`Failed to authenticate ${email} with any password.`);
          return;
        }
      }

      // Now update the user metadata (role and tenant_id) using the active session
      console.log(`Updating metadata for ${email} to role: ${role}, tenant_id: ${tenantId}...`);
      const { error: updateMetaError } = await supabase.auth.updateUser({
        data: {
          role,
          ...(tenantId ? { tenant_id: tenantId } : {})
        }
      });
      
      if (updateMetaError) {
        console.error(`Failed to update metadata for ${email}:`, updateMetaError.message);
      } else {
        console.log(`Metadata updated successfully for ${email}`);
      }
      
      // Sign out to clear the session for the next user
      await supabase.auth.signOut();
    } else {
      console.error(`Sign up error for ${email}:`, signUpError.message);
    }
  } else {
    console.log(`Successfully signed up new user: ${signUpData.user?.email}`);
    // Sign out to clear the session for the next user
    await supabase.auth.signOut();
  }
}

async function run() {
  // 1. Super Admin
  await handleUser({
    email: 'admin@rakshak.in',
    password: '***REMOVED***',
    role: 'SUPER_ADMIN'
  });

  // 2. Client Owner
  await handleUser({
    email: 'client1@rakshak.in',
    password: '***REMOVED***',
    role: 'CLIENT_OWNER',
    tenantId
  });

  // 3. Supervisor
  await handleUser({
    email: 'supervisor@rakshak.in',
    password: '***REMOVED***',
    role: 'SUPERVISOR',
    tenantId
  });

  console.log('\nAll processing completed!');
}

run().catch(console.error);
