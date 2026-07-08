-- Phase 5: Billing and Capacity Management Schema Extension

-- 1. Extend the tenants table (assuming it exists or creating it if it doesn't)
-- In a real scenario, this would alter the existing table. Here we create it for completeness if not present.
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_email text NOT NULL,
  
  -- Billing & Capacity Columns
  billing_tier text NOT NULL DEFAULT 'Starter', -- Starter, Professional, Enterprise
  guard_capacity integer NOT NULL DEFAULT 25,
  site_capacity integer NOT NULL DEFAULT 2,
  razorpay_customer_id text,
  
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Client Owner RLS Policy
-- A client owner should only be able to view their own tenant details (including billing limits)
CREATE POLICY "Client Owner View Own Tenant" ON public.tenants
  FOR SELECT
  USING (
    id = auth.tenant_id()
  );

-- 3. Super Admin RLS Policy
-- Super Admins can view and update all tenants to manage provisioning and capacities
CREATE POLICY "Super Admin View All Tenants" ON public.tenants
  FOR SELECT
  USING (
    auth.user_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "Super Admin Update Tenants" ON public.tenants
  FOR UPDATE
  USING (
    auth.user_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "Super Admin Insert Tenants" ON public.tenants
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'SUPER_ADMIN'
  );

-- 4. Overage Tracking Function (Optional Helper)
-- A function to quickly check if a tenant is over capacity
CREATE OR REPLACE FUNCTION public.check_tenant_capacity(check_tenant_id uuid)
RETURNS json AS $$
DECLARE
  current_guards int;
  cap_guards int;
  is_overage boolean;
BEGIN
  -- Get active guards count
  SELECT count(*) INTO current_guards FROM public.guards WHERE tenant_id = check_tenant_id AND status = 'active';
  
  -- Get capacity
  SELECT guard_capacity INTO cap_guards FROM public.tenants WHERE id = check_tenant_id;
  
  is_overage := current_guards > cap_guards;
  
  RETURN json_build_object(
    'current_guards', current_guards,
    'capacity', cap_guards,
    'is_overage', is_overage,
    'overage_amount', CASE WHEN is_overage THEN (current_guards - cap_guards) * 12 ELSE 0 END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
