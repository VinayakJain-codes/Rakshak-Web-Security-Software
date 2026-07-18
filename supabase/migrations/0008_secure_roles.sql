-- Phase 8: Secure Profiles and Custom Claims Hook

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CLIENT_OWNER', 'SUPERVISOR', 'GUARD')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile RLS: users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Give auth hook permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;

-- Create custom access token hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
  DECLARE
    claims jsonb;
    user_role text;
    user_tenant_id uuid;
  BEGIN
    -- Fetch the user's role and tenant_id from public.profiles
    SELECT role, tenant_id INTO user_role, user_tenant_id
    FROM public.profiles
    WHERE id = (event->>'user_id')::uuid;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
      -- Inject role and tenant_id into app_metadata (which goes into the JWT)
      claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
      
      IF user_tenant_id IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata, tenant_id}', to_jsonb(user_tenant_id));
      END IF;
    ELSE
      -- Fallback to default role
      claims := jsonb_set(claims, '{app_metadata, role}', '"GUARD"');
    END IF;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
  END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- NOTE: To enable this hook, you must configure it in the Supabase Dashboard
-- Authentication -> Hooks -> Custom access token (auth.hook_custom_access_token)
