-- Phase 9: Apply all fixes to existing Supabase instance

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CLIENT_OWNER', 'SUPERVISOR', 'GUARD')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;

-- 2. Create custom access token hook function
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
    SELECT role, tenant_id INTO user_role, user_tenant_id
    FROM public.profiles
    WHERE id = (event->>'user_id')::uuid;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
      claims := jsonb_set(claims, '{app_metadata, role}', to_jsonb(user_role));
      IF user_tenant_id IS NOT NULL THEN
        claims := jsonb_set(claims, '{app_metadata, tenant_id}', to_jsonb(user_tenant_id));
      END IF;
    ELSE
      claims := jsonb_set(claims, '{app_metadata, role}', '"GUARD"');
    END IF;

    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
  END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- 3. Update auth helper functions to read from app_metadata instead of user_metadata
CREATE OR REPLACE FUNCTION public.tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'tenant_id', '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.user_role() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '');
$$ LANGUAGE sql STABLE;

-- 4. Fix Guard Biometrics RLS
DROP POLICY IF EXISTS "Tenant Isolation: Guard Biometrics INSERT" ON public.guard_biometrics;
CREATE POLICY "Tenant Isolation: Guard Biometrics INSERT" ON public.guard_biometrics
  FOR INSERT WITH CHECK (
    (tenant_id = public.tenant_id() AND guard_id = auth.uid()) 
    OR public.user_role() = 'SUPER_ADMIN'
  );
