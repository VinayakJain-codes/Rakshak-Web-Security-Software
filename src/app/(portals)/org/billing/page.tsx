'use client';

import React, { useEffect, useState } from 'react';
import { PricingCard } from '../../../../components/ui/rakshak/PricingCard';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';

export default function OrgBillingPage() {
  const supabase = createClient();
  const { tenantId } = useAuth();
  
  const [tenant, setTenant] = useState<any>(null);
  const [currentGuards, setCurrentGuards] = useState(0);
  const [currentSites, setCurrentSites] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }

    async function loadBilling() {
      try {
        // 1. Fetch tenant limits
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();

        // 2. Fetch active guards (RLS filtered to tenant)
        const { count: guardCount } = await supabase
          .from('guards')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // 3. Fetch geofences (RLS filtered to tenant)
        const { count: siteCount } = await supabase
          .from('geofences')
          .select('*', { count: 'exact', head: true });

        if (tenantData) setTenant(tenantData);
        setCurrentGuards(guardCount || 0);
        setCurrentSites(siteCount || 0);
      } catch (err) {
        console.error('Error loading billing info:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBilling();
  }, [supabase, tenantId]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-label">Loading subscription details...</div>;
  }

  const guardCap = tenant?.guard_capacity || 25;
  const siteCap = tenant?.site_capacity || 2;
  const billingTier = tenant?.billing_tier || 'Starter';

  const guardUsagePercent = Math.min((currentGuards / guardCap) * 100, 100);
  const siteUsagePercent = Math.min((currentSites / siteCap) * 100, 100);

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Subscription & Billing</h2>
        <p className="text-on-surface-variant font-label">Manage your capacity limits and view invoices.</p>
      </header>

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-headline font-bold text-on-surface">Active Guard Capacity</h3>
                    <p className="text-sm text-on-surface-variant font-label mt-1">Current limit based on {billingTier} Tier</p>
                </div>
                <span className="font-mono font-bold text-xl text-on-surface">
                  {currentGuards} / {guardCap >= 9999 ? '∞' : guardCap}
                </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden mb-2">
                <div className={`h-full ${guardUsagePercent >= 90 ? 'bg-error' : 'bg-primary'}`} style={{ width: `${guardUsagePercent}%` }}></div>
            </div>
            {guardUsagePercent >= 90 && guardCap < 9999 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-error mt-2">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    Approaching limit! Additional guards will incur a +₹1,000/mo overage fee.
                </div>
            )}
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-headline font-bold text-on-surface">Monitored Sites</h3>
                    <p className="text-sm text-on-surface-variant font-label mt-1">Current limit based on {billingTier} Tier</p>
                </div>
                <span className="font-mono font-bold text-xl text-on-surface">
                  {currentSites} / {siteCap >= 999 ? '∞' : siteCap}
                </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary" style={{ width: `${siteUsagePercent}%` }}></div>
            </div>
            <div className="text-xs text-on-surface-variant mt-2 font-label">
                {siteCap >= 999 
                  ? 'Unlimited sites included in your Enterprise plan.' 
                  : 'Adding new sites beyond the cap requires an Enterprise upgrade.'}
            </div>
        </div>
      </div>

      {/* Tier Selection */}
      <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Available Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <PricingCard 
            name="Starter"
            description="Perfect for small offices and retail."
            price="₹24,999"
            guardCap="Up to 25 guards"
            siteCap="2 Sites"
            isCurrent={billingTier === 'Starter'}
            features={[
                'Basic Live Tracking',
                'Standard Reports',
                'Email Support'
            ]}
        />
        <PricingCard 
            name="Professional"
            description="Ideal for regional security agencies."
            price="₹64,999"
            guardCap="Up to 100 guards"
            siteCap="10 Sites"
            isCurrent={billingTier === 'Professional'}
            recommended={true}
            features={[
                'Advanced Telemetry',
                'Geofence Management',
                'Automated Alerts',
                'Priority Support'
            ]}
        />
        <PricingCard 
            name="Enterprise"
            description="For large multi-national operations."
            price="Custom"
            guardCap="Unlimited guards"
            siteCap="Unlimited Sites"
            isCurrent={billingTier === 'Enterprise'}
            features={[
                'Custom Integrations (SSO)',
                'Dedicated Account Manager',
                'Custom SLA',
                'On-Premises Options'
            ]}
        />
      </div>

      {/* Invoicing Mock */}
      <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Billing History</h3>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container">
                <tr>
                    <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Date</th>
                    <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Invoice ID</th>
                    <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Amount</th>
                    <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Status</th>
                    <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label text-right">Download</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-label text-sm text-on-surface">
                <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-mono text-xs">Jul 01, 2026</td>
                    <td className="p-4 font-mono text-xs">INV-9281A</td>
                    <td className="p-4 font-bold">{billingTier === 'Starter' ? '₹24,999.00' : billingTier === 'Professional' ? '₹64,999.00' : 'Custom'}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold">Paid</span></td>
                    <td className="p-4 text-right">
                        <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors material-symbols-outlined text-[20px]">download</button>
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </>
  );
}
