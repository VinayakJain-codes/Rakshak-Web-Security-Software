-- Create platform_metrics_history table
CREATE TABLE IF NOT EXISTS public.platform_metrics_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month TEXT NOT NULL,
    mrr NUMERIC NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platform_metrics_history ENABLE ROW LEVEL SECURITY;

-- Allow reading for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.platform_metrics_history
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert baseline data for MRR Growth chart
INSERT INTO public.platform_metrics_history (month, mrr, sort_order) VALUES
    ('Jan', 110000, 1),
    ('Feb', 115000, 2),
    ('Mar', 122000, 3),
    ('Apr', 128000, 4),
    ('May', 135000, 5),
    ('Jun', 142500, 6);

-- Insert baseline system metrics if not exist
INSERT INTO public.system_metrics (key, value) VALUES
    ('mrr', '$142,500'),
    ('compliance_rate', '98.4%')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create tenant_metrics table
CREATE TABLE IF NOT EXISTS public.tenant_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    patrol_compliance NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.tenant_metrics ENABLE ROW LEVEL SECURITY;

-- Allow reading for tenant members
CREATE POLICY "Allow read access for tenant members" ON public.tenant_metrics
    FOR SELECT
    TO authenticated
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Insert seed data into tenant_metrics for the active tenant
-- Find the first tenant and assign it 94.2% compliance
DO $$
DECLARE
    first_tenant_id UUID;
BEGIN
    SELECT id INTO first_tenant_id FROM public.tenants LIMIT 1;
    IF first_tenant_id IS NOT NULL THEN
        INSERT INTO public.tenant_metrics (tenant_id, patrol_compliance)
        VALUES (first_tenant_id, 94.2)
        ON CONFLICT (tenant_id) DO NOTHING;
    END IF;
END $$;
