'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';

interface AuditLog {
  id: string;
  tenant_id: string | null;
  timestamp: string;
  actor: string;
  action: string;
  target_resource: string;
  ip_address: string | null;
}

export default function AdminAuditPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [tenantsMap, setTenantsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch audits
        const { data: auditData, error: auditError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        if (auditError) throw auditError;

        // 2. Fetch tenants to map names
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, name');
        
        const tMap: Record<string, string> = {};
        tenantData?.forEach(t => {
          tMap[t.id] = t.name;
        });

        setLogs(auditData || []);
        setTenantsMap(tMap);
      } catch (err) {
        console.error('Error loading audits:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const filteredLogs = logs.filter(log => {
    // Search filter
    const matchesSearch = 
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target_resource.toLowerCase().includes(search.toLowerCase());
    
    // Tenant filter
    const tenantName = log.tenant_id ? tenantsMap[log.tenant_id] || '' : 'Rakshak Internal';
    const matchesTenant = selectedTenant === 'ALL' || tenantName === selectedTenant;

    // Action filter
    const matchesAction = selectedAction === 'ALL' || 
      (selectedAction === 'Auth Events' && log.action.toLowerCase().includes('login')) ||
      (selectedAction === 'Billing Events' && log.action.toLowerCase().includes('billing')) ||
      (selectedAction === 'Resource Mod' && (log.action.toLowerCase().includes('update') || log.action.toLowerCase().includes('provision') || log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('insert')));

    return matchesSearch && matchesTenant && matchesAction;
  });

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('fail') || act.includes('overage')) return 'text-error';
    if (act.includes('update') || act.includes('provision')) return 'text-primary';
    if (act.includes('login') || act.includes('success')) return 'text-success';
    return 'text-on-surface-variant';
  };

  // Extract unique tenant names for filter dropdown
  const uniqueTenants = Array.from(new Set(logs.map(l => l.tenant_id ? tenantsMap[l.tenant_id] || 'Unknown' : 'Rakshak Internal')));

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading audit logs...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Global Audit Log Streams</h2>
        <p className="text-on-surface-variant font-label">System-wide activity tracking for forensic review and compliance.</p>
      </header>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col h-[calc(100vh-250px)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center gap-4">
            <div className="flex-1 relative max-w-md">
                <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                </span>
                <input 
                    type="text" 
                    placeholder="Search by User, Action, or Resource..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm font-label focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
            </div>
            <div className="flex gap-2">
                <select 
                  value={selectedTenant}
                  onChange={e => setSelectedTenant(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface outline-none focus:border-primary"
                >
                    <option value="ALL">All Tenants</option>
                    {uniqueTenants.map(tName => (
                      <option key={tName} value={tName}>{tName}</option>
                    ))}
                </select>
                <select 
                  value={selectedAction}
                  onChange={e => setSelectedAction(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface outline-none focus:border-primary"
                >
                    <option value="ALL">All Actions</option>
                    <option value="Auth Events">Auth Events</option>
                    <option value="Billing Events">Billing Events</option>
                    <option value="Resource Mod">Resource Mod</option>
                </select>
                <button className="bg-surface-container border border-outline-variant text-on-surface font-bold rounded-lg px-4 py-2 hover:bg-surface-container-high transition-colors flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export CSV
                </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container sticky top-0 z-10">
                    <tr>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Timestamp</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Tenant</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Actor (User)</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Action</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Target Resource</th>
                        <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">IP Address</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-label text-sm text-on-surface">
                    {filteredLogs.map(log => {
                      const tenantName = log.tenant_id ? tenantsMap[log.tenant_id] || 'Unknown' : 'Rakshak Internal';
                      return (
                        <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4 whitespace-nowrap font-mono text-xs">{formatDate(log.timestamp)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded font-bold text-xs ${
                                tenantName === 'Rakshak Internal' 
                                  ? 'bg-secondary/10 text-secondary' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {tenantName}
                              </span>
                            </td>
                            <td className="p-4">{log.actor}</td>
                            <td className={`p-4 font-bold ${getActionColor(log.action)}`}>{log.action}</td>
                            <td className="p-4">{log.target_resource}</td>
                            <td className="p-4 font-mono text-xs text-on-surface-variant">{log.ip_address || 'N/A'}</td>
                        </tr>
                      );
                    })}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant font-label text-sm">
                          No audit entries found matching the filters.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </>
  );
}
