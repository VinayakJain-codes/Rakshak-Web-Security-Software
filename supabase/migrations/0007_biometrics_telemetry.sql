-- Phase 7: Biometric Telemetry Schema

CREATE TABLE IF NOT EXISTS public.guard_biometrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guard_id uuid NOT NULL REFERENCES public.guards(id) ON DELETE CASCADE,
  focus_score numeric DEFAULT 100,
  stress_score numeric DEFAULT 0,
  is_drowsy boolean DEFAULT false,
  is_distracted boolean DEFAULT false,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.guard_biometrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant Isolation: Guard Biometrics SELECT" ON public.guard_biometrics
  FOR SELECT USING (tenant_id = public.tenant_id() OR public.user_role() = 'SUPER_ADMIN');
CREATE POLICY "Tenant Isolation: Guard Biometrics INSERT" ON public.guard_biometrics
  FOR INSERT WITH CHECK (
    (tenant_id = public.tenant_id() AND guard_id = auth.uid()) 
    OR public.user_role() = 'SUPER_ADMIN'
  );
