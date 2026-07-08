-- Drop the old policy which restricted access solely to the exact tenant_id
DROP POLICY IF EXISTS "Allow read access for tenant members" ON public.tenant_metrics;

-- Create the new policy using the standard user_role() and tenant_id() helpers
CREATE POLICY "Tenant Isolation: Tenant Metrics SELECT" ON public.tenant_metrics
    FOR SELECT
    TO authenticated
    USING ((tenant_id = tenant_id()) OR (user_role() = 'SUPER_ADMIN'::text));
