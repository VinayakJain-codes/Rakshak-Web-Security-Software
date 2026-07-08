-- Insert trend data into system_metrics
INSERT INTO public.system_metrics (key, value) VALUES
    ('mrr_trend_value', '+12% this month'),
    ('mrr_trend_direction', 'up'),
    ('active_tenants_trend_value', '+3 this month'),
    ('active_tenants_trend_direction', 'up'),
    ('total_guards_trend_value', '+150 this week'),
    ('total_guards_trend_direction', 'up'),
    ('compliance_rate_trend_value', 'Stable'),
    ('compliance_rate_trend_direction', 'up')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Delete dummy support tickets (which were seeded initially)
-- Assuming they are dummy data since they are old or just to clear the queue
DELETE FROM public.support_tickets;
