'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IndianTimeClock } from '../../../../components/ui/rakshak/IndianTimeClock';
import { KPICard } from '../../../../components/ui/rakshak/KPICard';
import { AlertCard } from '../../../../components/ui/rakshak/AlertCard';
import { EmptyState } from '../../../../components/ui/rakshak/EmptyState';
import { StatusBadge } from '../../../../components/ui/rakshak/StatusBadge';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';

type Alert = {
  id: string;
  type: string;
  severity: string;
  guard_name: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
};

type Incident = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  created_at: string;
};

export default function OpsDashboardPage() {
  const supabase = createClient();
  const { tenantId } = useAuth();
  
  const [activeGuardsCount, setActiveGuardsCount] = useState(0);
  const [criticalGuardsCount, setCriticalGuardsCount] = useState(0);
  const [openIncidentsCount, setOpenIncidentsCount] = useState(0);
  const [pendingAlerts, setPendingAlerts] = useState<Alert[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      // 1. Fetch guards stats
      const { data: guardsData } = await supabase.from('guards').select('status');
      if (guardsData) {
        setActiveGuardsCount(guardsData.filter(g => g.status === 'active' || g.status === 'critical' || g.status === 'pending').length);
        setCriticalGuardsCount(guardsData.filter(g => g.status === 'critical').length);
      }

      // 2. Fetch incidents
      const { data: incidentsData } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (incidentsData) {
        setOpenIncidentsCount(incidentsData.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length);
        setRecentIncidents(incidentsData.slice(0, 5));
      }

      // 3. Fetch alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (alertsData) {
        setPendingAlerts(alertsData as Alert[]);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to live updates
    const channel = supabase
      .channel('ops-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guards' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await supabase.from('alerts').update({ acknowledged: true }).eq('id', id);
      // Optimistic update
      setPendingAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleBroadcastSOS = async () => {
    try {
      await supabase.from('alerts').insert([{
        type: 'SOS Broadcast Alert',
        severity: 'CRITICAL',
        guard_name: 'Operations Room',
        location: 'Command Center',
        acknowledged: false,
        tenant_id: tenantId
      }]);
      alert('SOS Broadcast Sent Successfully!');
    } catch (err) {
      console.error('Failed to broadcast SOS:', err);
      alert('Failed to send SOS.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading tactical command...</div>;
  }

  const supervisorRatio = activeGuardsCount;
  const maxGuards = 15;
  const ratioExceeded = supervisorRatio > maxGuards;

  const getMappedSeverity = (sev: string): 'critical' | 'warning' | 'info' => {
    const s = sev.toLowerCase();
    if (s === 'critical' || s === 'high') return 'critical';
    if (s === 'warning') return 'warning';
    return 'info';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Daily Operational Dashboard</h2>
          <p className="text-on-surface-variant font-label mt-1">Tactical overview of active shifts and anomalies.</p>
        </div>
        <div className="flex items-center gap-3">
          <IndianTimeClock />
          <span className="bg-success/20 text-success px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 border border-success/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live Sync
          </span>
        </div>
      </header>

      {/* Critical Banner */}
      {criticalGuardsCount > 0 && (
        <div className="bg-error-container text-on-error-container px-6 py-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between font-label text-sm border border-error/30 shadow-md animate-pulse">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <span className="material-symbols-outlined text-error text-[28px]">warning</span>
            <div>
              <span className="font-bold text-base block">CRITICAL SIGNAL DETECTED</span>
              <span>{criticalGuardsCount} guard(s) offline or out of geofence bounds.</span>
            </div>
          </div>
          <Link href="/ops/tracker">
            <button className="bg-error text-on-error px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
              Dispatch Support
            </button>
          </Link>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Active Guards on Duty" 
          value={activeGuardsCount.toString()} 
          icon="shield_person" 
          variant="primary"
        />
        <KPICard 
          title="Open Incidents" 
          value={openIncidentsCount.toString()} 
          icon="report" 
          variant={openIncidentsCount > 0 ? "error" : "secondary"}
        />
        <KPICard 
          title="Pending Alerts" 
          value={pendingAlerts.length.toString()} 
          icon="notifications_active" 
          variant={pendingAlerts.length > 0 ? "error" : "secondary"}
        />
        <div className={`bg-surface-container-lowest p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${ratioExceeded ? 'border-error/50' : 'border-outline-variant'}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-headline font-bold text-on-surface text-sm">Supervisor Load Ratio</h3>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">group</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-black ${ratioExceeded ? 'text-error' : 'text-on-surface'}`}>{supervisorRatio}</span>
            <span className="text-on-surface-variant font-label text-sm">/ {maxGuards} max</span>
          </div>
          {ratioExceeded && (
            <p className="text-xs text-error font-bold mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">gavel</span>
              PSARA Limit Exceeded
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Incidents */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Tactical Actions */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5">
            <h3 className="font-headline font-bold text-on-surface mb-4">Tactical Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleBroadcastSOS}
                className="w-full flex items-center gap-3 bg-error-container text-on-error-container hover:bg-error hover:text-on-error px-4 py-3 rounded-lg font-bold text-sm transition-colors font-label border border-error/20"
              >
                <span className="material-symbols-outlined">emergency</span>
                Broadcast SOS Alert
              </button>
              <Link href="/ops/incidents" className="block">
                <button className="w-full flex items-center gap-3 bg-surface-container hover:bg-surface-container-high text-on-surface px-4 py-3 rounded-lg font-bold text-sm transition-colors font-label border border-outline-variant">
                  <span className="material-symbols-outlined">add_box</span>
                  Log New Incident
                </button>
              </Link>
              <Link href="/ops/roster" className="block">
                <button className="w-full flex items-center gap-3 bg-surface-container hover:bg-surface-container-high text-on-surface px-4 py-3 rounded-lg font-bold text-sm transition-colors font-label border border-outline-variant">
                  <span className="material-symbols-outlined">assignment_ind</span>
                  Manage Shift Roster
                </button>
              </Link>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-on-surface">Recent Incidents</h3>
              <Link href="/ops/incidents" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentIncidents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm font-label text-on-surface-variant">No recent incidents logged.</p>
                </div>
              ) : (
                recentIncidents.map(inc => (
                  <div key={inc.id} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/50">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-on-surface truncate pr-2">{inc.title}</h4>
                      <StatusBadge variant={inc.status === 'OPEN' ? 'critical' : inc.status === 'INVESTIGATING' ? 'pending' : 'completed'}>
                        {inc.status}
                      </StatusBadge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-label ${
                        inc.priority === 'HIGH' ? 'bg-error/20 text-error' : 
                        inc.priority === 'MEDIUM' ? 'bg-warning/20 text-warning' : 
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {inc.priority} PRIORITY
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(inc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Alert Feed */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-5 flex flex-col h-full min-h-[500px]">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error">campaign</span>
              <h3 className="font-headline font-bold text-on-surface text-lg">Live Alert Feed</h3>
            </div>
            <span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded text-xs font-bold font-mono">
              {pendingAlerts.length} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {pendingAlerts.length === 0 ? (
              <EmptyState 
                icon="verified_user"
                title="All Clear"
                description="There are currently no active alerts requiring your attention."
              />
            ) : (
              pendingAlerts.map(alert => {
                const timeAgo = (dateStr: string) => {
                  const elapsed = Date.now() - new Date(dateStr).getTime();
                  const mins = Math.floor(elapsed / 60000);
                  if (mins < 1) return 'Just now';
                  if (mins < 60) return `${mins}m ago`;
                  return `${Math.floor(mins / 60)}h ago`;
                };

                return (
                  <div key={alert.id} className="relative group">
                    <AlertCard 
                      severity={getMappedSeverity(alert.severity)}
                      title={alert.type}
                      location={alert.location}
                      timestamp={timeAgo(alert.timestamp)}
                      status="active"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="bg-surface-container-high hover:bg-success hover:text-on-success text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors border border-outline-variant hover:border-success flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">done</span>
                        Ack
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {pendingAlerts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-outline-variant text-center">
              <Link href="/ops/alerts" className="text-primary text-sm font-bold hover:underline">
                View All Pending Alerts →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
