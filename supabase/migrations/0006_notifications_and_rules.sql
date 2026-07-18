-- Phase 7: Notifications and Recurring Rules Schema

-- 1. Create guard_schedule_rules table
CREATE TABLE IF NOT EXISTS public.guard_schedule_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL REFERENCES public.guards(id) ON DELETE CASCADE,
  task_type text NOT NULL, -- e.g., 'selfie', 'patrol'
  interval_minutes integer NOT NULL,
  last_triggered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.guard_schedule_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: Guard Schedule Rules SELECT" ON public.guard_schedule_rules
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Schedule Rules INSERT" ON public.guard_schedule_rules
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Schedule Rules UPDATE" ON public.guard_schedule_rules
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Schedule Rules DELETE" ON public.guard_schedule_rules
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');


-- 2. Create guard_notifications table
CREATE TABLE IF NOT EXISTS public.guard_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL REFERENCES public.guards(id) ON DELETE CASCADE,
  title text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.guard_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation: Guard Notifications SELECT" ON public.guard_notifications
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Notifications INSERT" ON public.guard_notifications
  FOR INSERT WITH CHECK (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Notifications UPDATE" ON public.guard_notifications
  FOR UPDATE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Notifications DELETE" ON public.guard_notifications
  FOR DELETE USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
