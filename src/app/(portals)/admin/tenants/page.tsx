'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '../../../../utils/supabase/client';

interface Tenant {
  id: string;
  name: string;
  owner_email: string;
  billing_tier: string;
  guard_capacity: number;
  site_capacity: number;
  custom_pricing: number | null;
  features: any;
  status: string;
  created_at: string;
}

export default function AdminTenantsPage() {
  const supabase = createClient();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [guardsCountMap, setGuardsCountMap] = useState<Record<string, number>>({});
  const [sitesCountMap, setSitesCountMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [billingTier, setBillingTier] = useState('Starter');
  const [customPricing, setCustomPricing] = useState('');
  const [features, setFeatures] = useState({
    advanced_geofence: false,
    ai_reports: false,
    custom_branding: false
  });

  const loadData = async () => {
    try {
      // 1. Fetch tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('name');
      if (tenantsError) throw tenantsError;

      // 2. Fetch guards for count mapping
      const { data: guardsData } = await supabase.from('guards').select('tenant_id');
      const gMap: Record<string, number> = {};
      guardsData?.forEach(g => {
        gMap[g.tenant_id] = (gMap[g.tenant_id] || 0) + 1;
      });

      // 3. Fetch geofences for count mapping
      const { data: geofencesData } = await supabase.from('geofences').select('tenant_id');
      const sMap: Record<string, number> = {};
      geofencesData?.forEach(s => {
        sMap[s.tenant_id] = (sMap[s.tenant_id] || 0) + 1;
      });

      setTenants(tenantsData || []);
      setGuardsCountMap(gMap);
      setSitesCountMap(sMap);
    } catch (err) {
      console.error('Error loading tenants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [supabase]);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !ownerEmail) return;

    let guardCapacity = 25;
    let siteCapacity = 2;

    if (billingTier === 'Professional') {
      guardCapacity = 100;
      siteCapacity = 10;
    } else if (billingTier === 'Enterprise') {
      guardCapacity = 9999;
      siteCapacity = 999;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .insert([
          {
            name: orgName,
            owner_email: ownerEmail,
            billing_tier: billingTier,
            guard_capacity: guardCapacity,
            site_capacity: siteCapacity,
            custom_pricing: customPricing ? parseFloat(customPricing) : null,
            features: features,
            status: 'active'
          }
        ]);

      if (error) throw error;

      // Reset form
      setOrgName('');
      setOwnerEmail('');
      setBillingTier('Starter');
      setCustomPricing('');
      setFeatures({ advanced_geofence: false, ai_reports: false, custom_branding: false });
      setShowProvisionModal(false);

      // Reload
      loadData();
    } catch (err: any) {
      alert(`Failed to provision client: ${err.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading tenant data...</div>;
  }

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface">Tenant Provisioning</h2>
            <p className="text-on-surface-variant font-label">Manage client organizations, capacity limits, and subscriptions.</p>
        </div>
        <button 
            onClick={() => setShowProvisionModal(true)}
            className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Provision Client
        </button>
      </header>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center gap-4">
            <div className="flex-1 relative max-w-md">
                <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                </span>
                <input 
                    type="text" 
                    placeholder="Search organizations..." 
                    className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm font-label focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
            </div>
            <div className="flex gap-2">
                <select className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface outline-none focus:border-primary">
                    <option>All Tiers</option>
                    <option>Starter</option>
                    <option>Professional</option>
                    <option>Enterprise</option>
                </select>
                <select className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface outline-none focus:border-primary">
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Warning (Near Cap)</option>
                    <option>Suspended</option>
                </select>
            </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Organization</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Tier & Pricing</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Guards Usage</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Features</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Status</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-label text-sm text-on-surface">
                    {tenants.map(tenant => {
                      const guardsCount = guardsCountMap[tenant.id] || 0;
                      const sitesCount = sitesCountMap[tenant.id] || 0;
                      
                      const isOverGuards = guardsCount > tenant.guard_capacity;
                      const isNearGuards = guardsCount >= tenant.guard_capacity * 0.9 && !isOverGuards;
                      
                      const guardProgress = Math.min((guardsCount / tenant.guard_capacity) * 100, 100);
                      const siteProgress = Math.min((sitesCount / tenant.site_capacity) * 100, 100);

                      const getStatusColor = (status: string, over: boolean) => {
                        if (over || status === 'warning') return 'text-error';
                        if (status === 'suspended') return 'text-on-surface-variant';
                        return 'text-success';
                      };

                      return (
                        <tr key={tenant.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4">
                                <div className="font-bold">{tenant.name}</div>
                                <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">ID: {tenant.id}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded font-bold text-xs border inline-block mb-1 ${
                                  tenant.billing_tier === 'Enterprise' 
                                    ? 'bg-primary/10 text-primary border-primary/20' 
                                    : tenant.billing_tier === 'Professional' 
                                      ? 'bg-secondary/10 text-secondary border-secondary/20'
                                      : 'bg-surface-container-high text-on-surface border-outline-variant'
                                }`}>
                                  {tenant.billing_tier}
                                </span>
                                {tenant.custom_pricing !== null && (
                                  <div className="text-xs font-mono text-on-surface-variant">₹{tenant.custom_pricing}/mo</div>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <span className={`font-mono font-bold ${isOverGuards ? 'text-error' : isNearGuards ? 'text-[var(--color-orange)]' : ''}`}>
                                        {guardsCount} / {tenant.guard_capacity >= 9999 ? '∞' : tenant.guard_capacity}
                                    </span>
                                    {isOverGuards && <span className="material-symbols-outlined text-error text-[16px]" title="Over Capacity">warning</span>}
                                </div>
                                <div className="w-24 h-1.5 bg-surface-container rounded-full mt-1 overflow-hidden">
                                    <div className={`h-full ${isOverGuards ? 'bg-error' : isNearGuards ? 'bg-[var(--color-orange)]' : 'bg-primary'}`} style={{ width: `${guardProgress}%` }}></div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                  {tenant.features?.advanced_geofence && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded w-max">Adv Geofence</span>}
                                  {tenant.features?.ai_reports && <span className="text-[10px] bg-[var(--color-orange)]/10 text-[var(--color-orange)] px-1.5 py-0.5 rounded w-max">AI Reports</span>}
                                  {tenant.features?.custom_branding && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded w-max">Branding</span>}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`flex items-center gap-1 text-xs font-bold ${getStatusColor(tenant.status, isOverGuards)}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isOverGuards || tenant.status === 'warning' ? 'bg-error' : tenant.status === 'suspended' ? 'bg-on-surface-variant' : 'bg-success'}`}></div>
                                    {isOverGuards ? 'Overage' : tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button className="text-primary hover:underline font-bold text-sm">Manage Caps</button>
                            </td>
                        </tr>
                      );
                    })}
                    {tenants.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant font-label text-sm">
                          No tenants provisioned yet.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Provision Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <form onSubmit={handleProvision} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-headline font-bold text-on-surface">Provision New Client</h3>
                    <button type="button" onClick={() => setShowProvisionModal(false)} className="text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Organization Name</label>
                        <input 
                          type="text" 
                          required
                          value={orgName}
                          onChange={e => setOrgName(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none text-sm text-on-surface" 
                          placeholder="e.g. Apex Security" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Owner Email</label>
                        <input 
                          type="email" 
                          required
                          value={ownerEmail}
                          onChange={e => setOwnerEmail(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none text-sm text-on-surface" 
                          placeholder="owner@apex.co" 
                        />
                        <p className="text-xs text-on-surface-variant mt-1">An invitation with temporary credentials will be emailed to this address.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Subscription Tier</label>
                        <select 
                          value={billingTier}
                          onChange={e => setBillingTier(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none text-sm text-on-surface mb-3"
                        >
                            <option value="Starter">Starter (Up to 25 guards, 2 sites)</option>
                            <option value="Professional">Professional (Up to 100 guards, 10 sites)</option>
                            <option value="Enterprise">Enterprise (Unlimited)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-1">Custom Pricing (Optional)</label>
                        <div className="flex items-center relative">
                            <span className="absolute left-3 text-on-surface-variant text-sm font-mono">₹</span>
                            <input 
                              type="number"
                              value={customPricing}
                              onChange={e => setCustomPricing(e.target.value)}
                              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-8 pr-3 py-2 focus:border-primary outline-none text-sm text-on-surface" 
                              placeholder="Monthly amount" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-label font-bold text-on-surface mb-2">Enabled Features</label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                            <input type="checkbox" checked={features.advanced_geofence} onChange={e => setFeatures({...features, advanced_geofence: e.target.checked})} className="accent-primary w-4 h-4" />
                            Advanced Geofencing
                          </label>
                          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                            <input type="checkbox" checked={features.ai_reports} onChange={e => setFeatures({...features, ai_reports: e.target.checked})} className="accent-primary w-4 h-4" />
                            AI Incident Reports
                          </label>
                          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                            <input type="checkbox" checked={features.custom_branding} onChange={e => setFeatures({...features, custom_branding: e.target.checked})} className="accent-primary w-4 h-4" />
                            Custom Branding
                          </label>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowProvisionModal(false)} className="px-4 py-2 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg font-bold text-sm bg-primary text-on-primary hover:opacity-90 transition-opacity">Provision & Send Invite</button>
                    </div>
                </div>
            </form>
        </div>
      )}
    </>
  );
}
