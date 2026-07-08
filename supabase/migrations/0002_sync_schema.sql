-- 1. Create Geofences table
CREATE TABLE IF NOT EXISTS public.geofences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  site_name text NOT NULL,
  polygon jsonb NOT NULL, -- Array of {lat, lng} coordinates
  color text DEFAULT '#007AFF',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

-- 2. Create Patrols table
CREATE TABLE IF NOT EXISTS public.patrols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL,
  site_id uuid NOT NULL,
  checkpoints jsonb NOT NULL, -- Array of checkpoints
  actual_path jsonb DEFAULT '[]'::jsonb, -- Path walked
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.patrols ENABLE ROW LEVEL SECURITY;

-- 3. Create Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL, -- CRITICAL, HIGH, WARNING, INFO
  guard_name text NOT NULL,
  location text NOT NULL,
  acknowledged boolean DEFAULT false,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 4. Create Incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, CLOSED
  priority text NOT NULL DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
  assignee text NOT NULL DEFAULT 'Unassigned',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- 5. Create Support Tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL, -- Can be null for system issues
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
  severity text NOT NULL DEFAULT 'info', -- critical, warning, info
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 6. Create Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  timestamp timestamptz DEFAULT now(),
  actor text NOT NULL,
  action text NOT NULL,
  target_resource text NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Create System Metrics (Global platform metrics)
CREATE TABLE IF NOT EXISTS public.system_metrics (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;


-- ================= RLS POLICIES =================

-- Geofences policies
CREATE POLICY "Tenant Isolation: Geofences SELECT" ON public.geofences
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Geofences INSERT" ON public.geofences
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Geofences UPDATE" ON public.geofences
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Geofences DELETE" ON public.geofences
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');

-- Patrols policies
CREATE POLICY "Tenant Isolation: Patrols SELECT" ON public.patrols
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Patrols INSERT" ON public.patrols
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Patrols UPDATE" ON public.patrols
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Patrols DELETE" ON public.patrols
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');

-- Alerts policies
CREATE POLICY "Tenant Isolation: Alerts SELECT" ON public.alerts
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Alerts INSERT" ON public.alerts
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Alerts UPDATE" ON public.alerts
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Alerts DELETE" ON public.alerts
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');

-- Incidents policies
CREATE POLICY "Tenant Isolation: Incidents SELECT" ON public.incidents
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Incidents INSERT" ON public.incidents
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Incidents UPDATE" ON public.incidents
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Incidents DELETE" ON public.incidents
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');

-- Support Tickets policies (Super Admins can view/update all, Client Owners can view/insert their own)
CREATE POLICY "Support Tickets: SUPER_ADMIN ALL" ON public.support_tickets
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Support Tickets: Tenant View Own" ON public.support_tickets
  FOR SELECT USING (tenant_id = public.tenant_id());
CREATE POLICY "Support Tickets: Tenant Insert Own" ON public.support_tickets
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id());

-- Audit Logs policies (Only Super Admins have full access, Client Owners can view audit logs for their tenant)
CREATE POLICY "Audit Logs: SUPER_ADMIN ALL" ON public.audit_logs
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Audit Logs: Tenant View Own" ON public.audit_logs
  FOR SELECT USING (tenant_id = public.tenant_id());

-- System Metrics policies (Only Super Admins can SELECT/UPDATE, others cannot access)
CREATE POLICY "System Metrics: SUPER_ADMIN ALL" ON public.system_metrics
  FOR ALL USING (public.user_role() = 'SUPER_ADMIN');
