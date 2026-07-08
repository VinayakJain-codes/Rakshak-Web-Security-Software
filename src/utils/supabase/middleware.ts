import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { UserRole } from '../../types/rbac';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there is no user and the request is not for /auth/login or root, redirect to login
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isRoot = request.nextUrl.pathname === '/';
  const isPublicAsset = request.nextUrl.pathname.startsWith('/_next') || 
                        request.nextUrl.pathname.includes('.') || 
                        request.nextUrl.pathname.startsWith('/api');

  if (!isPublicAsset) {
    if (!user && !isAuthRoute) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        return NextResponse.redirect(loginUrl);
    }
    
    // RBAC Routing logic
    if (user) {
        // Extract custom claims (we assume role and tenant_id are stored in user_metadata or app_metadata depending on implementation, here we'll use user_metadata for MVP simulation)
        const role = (user.user_metadata?.role as UserRole) || UserRole.SUPERVISOR; // Default fallback for safety

        if (isAuthRoute || isRoot) {
            // Redirect logged-in users away from login/root to their portal
            const redirectUrl = request.nextUrl.clone();
            switch (role) {
                case UserRole.SUPER_ADMIN:
                    redirectUrl.pathname = '/admin/dashboard';
                    break;
                case UserRole.CLIENT_OWNER:
                    redirectUrl.pathname = '/org/dashboard';
                    break;
                case UserRole.SUPERVISOR:
                    redirectUrl.pathname = '/ops/dashboard';
                    break;
            }
            return NextResponse.redirect(redirectUrl);
        }

        // Boundary enforcement:
        if (request.nextUrl.pathname.startsWith('/admin') && role !== UserRole.SUPER_ADMIN) {
            return NextResponse.redirect(new URL('/unauthorized', request.url)); // Or route them back to their dashboard
        }
        if (request.nextUrl.pathname.startsWith('/org') && role !== UserRole.CLIENT_OWNER && role !== UserRole.SUPER_ADMIN) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }
  }

  return supabaseResponse;
}
