-- Phase 4: Initial Multi-Tenant Schema and Row-Level Security

-- Create a custom function to automatically extract the tenant_id from the active JWT
CREATE OR REPLACE FUNCTION auth.tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'tenant_id', '')::uuid;
$$ LANGUAGE sql STABLE;

-- Ensure our schema extension allows creating policies easily
-- Example: Creating a multi-tenant Guards table
CREATE TABLE public.guards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.guards ENABLE ROW LEVEL SECURITY;

-- Create policy for Client Owners (Users can only see guards belonging to their tenant)
CREATE POLICY "Tenant Isolation: Guards Select" ON public.guards
  FOR SELECT
  USING (
    tenant_id = auth.tenant_id()
  );

CREATE POLICY "Tenant Isolation: Guards Insert" ON public.guards
  FOR INSERT
  WITH CHECK (
    tenant_id = auth.tenant_id()
  );

CREATE POLICY "Tenant Isolation: Guards Update" ON public.guards
  FOR UPDATE
  USING (
    tenant_id = auth.tenant_id()
  );

CREATE POLICY "Tenant Isolation: Guards Delete" ON public.guards
  FOR DELETE
  USING (
    tenant_id = auth.tenant_id()
  );

-- (Optional) If Super Admins need to see everything, we can add a bypass policy based on role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '');
$$ LANGUAGE sql STABLE;

CREATE POLICY "Super Admin Bypass" ON public.guards
  FOR ALL
  USING (
    auth.user_role() = 'SUPER_ADMIN'
  );
