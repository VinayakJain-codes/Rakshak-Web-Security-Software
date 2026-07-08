'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/'); // Middleware will redirect to correct portal
}

export async function loginWithSSO(provider: string) {
    const supabase = await createClient();
    
    // For MVP, this might just redirect to a mocked flow or actual OAuth if setup
    // Example Azure AD / Okta (SAML/OIDC usually uses signInWithOAuth)
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure' as any, // Cast to any to bypass strict type if provider not in enum
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        }
    });
    
    if (data.url) {
        redirect(data.url);
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}
