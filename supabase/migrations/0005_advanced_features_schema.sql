-- Phase 6: Advanced Features Schema Extensions

-- 1. Alter tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS custom_pricing numeric,
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{"advanced_geofence": false, "ai_reports": false, "custom_branding": false}'::jsonb;

-- 2. Create guard_locations table
CREATE TABLE IF NOT EXISTS public.guard_locations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL REFERENCES public.guards(id) ON DELETE CASCADE,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.guard_locations ENABLE ROW LEVEL SECURITY;

-- 3. Create guard_schedules table
CREATE TABLE IF NOT EXISTS public.guard_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL REFERENCES public.guards(id) ON DELETE CASCADE,
  task_type text NOT NULL, -- e.g., 'selfie', 'patrol'
  scheduled_time timestamptz NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.guard_schedules ENABLE ROW LEVEL SECURITY;

-- 4. Create guard_checkins table
CREATE TABLE IF NOT EXISTS public.guard_checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL REFERENCES public.guards(id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES public.guard_schedules(id) ON DELETE SET NULL,
  photo_url text,
  lat numeric,
  lng numeric,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.guard_checkins ENABLE ROW LEVEL SECURITY;

-- ================= RLS POLICIES =================

-- guard_locations policies
CREATE POLICY "Tenant Isolation: Guard Locations SELECT" ON public.guard_locations
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Locations INSERT" ON public.guard_locations
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');

-- guard_schedules policies
CREATE POLICY "Tenant Isolation: Guard Schedules SELECT" ON public.guard_schedules
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Schedules INSERT" ON public.guard_schedules
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Schedules UPDATE" ON public.guard_schedules
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Schedules DELETE" ON public.guard_schedules
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');

-- guard_checkins policies
CREATE POLICY "Tenant Isolation: Guard Checkins SELECT" ON public.guard_checkins
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Checkins INSERT" ON public.guard_checkins
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
