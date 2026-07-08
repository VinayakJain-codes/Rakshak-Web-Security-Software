'use client';

import React, { useEffect, useState } from 'react';
import { KPICard } from '../../../../components/ui/rakshak/KPICard';
import { createClient } from '../../../../utils/supabase/client';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
}

interface PlatformMetricHistory {
  id: string;
  month: string;
  mrr: number;
  sort_order: number;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    mrr: '₹0',
    activeTenants: '0',
    totalGuards: '0',
    complianceRate: '0%'
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [mrrHistory, setMrrHistory] = useState<PlatformMetricHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch support tickets
        const { data: ticketData } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false });

        // 2. Fetch MRR History
        const { data: historyData } = await supabase
          .from('platform_metrics_history')
          .select('*')
          .order('sort_order', { ascending: true });

        // 3. Count active tenants and guards directly for live precision
        const { count: tenantCount } = await supabase
          .from('tenants')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        const { count: guardCount } = await supabase
          .from('guards')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // 4. Fetch tenant metrics for global compliance average
        const { data: tenantMetricsData } = await supabase
          .from('tenant_metrics')
          .select('patrol_compliance');

        let avgCompliance = 0;
        if (tenantMetricsData && tenantMetricsData.length > 0) {
          const sum = tenantMetricsData.reduce((acc, curr) => acc + Number(curr.patrol_compliance), 0);
          avgCompliance = sum / tenantMetricsData.length;
        }

        const currentMrr = historyData && historyData.length > 0 
          ? historyData[historyData.length - 1].mrr 
          : 0;

        setMetrics({
          mrr: currentMrr > 0 ? `₹${currentMrr.toLocaleString('en-IN')}` : '₹0',
          activeTenants: tenantCount !== null ? tenantCount.toString() : '0',
          totalGuards: guardCount !== null ? guardCount.toString() : '0',
          complianceRate: tenantMetricsData && tenantMetricsData.length > 0 ? `${avgCompliance.toFixed(1)}%` : '0%'
        });

        if (ticketData) {
          setTickets(ticketData);
        }
        
        if (historyData) {
          setMrrHistory(historyData);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  const getTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-label">Loading command center...</div>;
  }

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface">Agency Command Center</h2>
            <p className="text-on-surface-variant font-label">Global platform telemetry and revenue tracking.</p>
        </div>
        <div className="flex gap-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">public</span>
                Platform Status: Healthy
            </span>
        </div>
      </header>

      {/* Financial & Scale KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Monthly Recurring Revenue" 
          value={metrics.mrr} 
          icon="payments" 
          variant="primary"
        />
        <KPICard 
          title="Active Tenants (Clients)" 
          value={metrics.activeTenants} 
          icon="corporate_fare" 
          variant="secondary"
        />
        <KPICard 
          title="Total Guards Monitored" 
          value={metrics.totalGuards} 
          icon="groups" 
          variant="secondary"
        />
        <KPICard 
          title="Global Compliance Rate" 
          value={metrics.complianceRate} 
          icon="verified_user" 
          variant="primary"
        />
      </div>

      {/* Analytics Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* MRR Growth Chart */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col h-[400px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h3 className="font-headline font-bold text-on-surface">MRR Growth (Last 6 Months)</h3>
                <button className="text-on-surface-variant hover:text-primary material-symbols-outlined text-[20px]">download</button>
            </div>
            <div className="flex-1 p-6 flex items-end gap-4 justify-between relative overflow-hidden">
                <div className="w-full flex justify-between items-end h-full gap-2 px-4 opacity-80">
                    {mrrHistory.length > 0 ? mrrHistory.map((data, index) => {
                      const maxMrr = Math.max(...mrrHistory.map(m => m.mrr));
                      const heightPercent = maxMrr > 0 ? Math.max(10, (data.mrr / maxMrr) * 95) : 10;
                      const opacity = 0.4 + (index * 0.1); 
                      
                      return (
                        <div key={data.id} style={{ height: `${heightPercent}%`, opacity }} className="w-1/6 bg-primary rounded-t-sm hover:opacity-100 transition-opacity cursor-pointer group relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-xs px-2 py-1 rounded text-on-surface whitespace-nowrap">
                                ₹{(data.mrr / 1000).toFixed(1)}k
                            </div>
                        </div>
                      );
                    }) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm">
                        No MRR data available
                      </div>
                    )}
                </div>
            </div>
            <div className="px-6 pb-4 pt-2 border-t border-outline-variant flex justify-between text-xs font-label text-on-surface-variant uppercase">
                {mrrHistory.map(m => <span key={m.id}>{m.month}</span>)}
            </div>
        </div>

        {/* Global Support Queue */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col h-[400px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h3 className="font-headline font-bold text-on-surface">Critical Support Queue</h3>
                <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-xs font-bold">{tickets.length} Open</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className={`p-3 rounded-lg border ${
                      ticket.severity === 'critical' 
                        ? 'bg-error-container text-on-error-container border-error/30' 
                        : 'bg-surface-container text-on-surface border-outline-variant'
                    }`}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm">{ticket.title}</h4>
                          <span className="text-[10px] font-mono opacity-80">{getTimeAgo(ticket.created_at)}</span>
                      </div>
                      <p className="text-xs">{ticket.description}</p>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="text-center p-12 text-on-surface-variant font-label text-sm">
                    No active critical tickets in the queue.
                  </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
}
