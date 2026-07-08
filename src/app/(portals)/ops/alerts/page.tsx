'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '../../../../utils/supabase/client';

type Severity = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';

interface Alert {
  id: string;
  timestamp: string;
  type: string;
  severity: Severity;
  guardName: string;
  location: string;
  acknowledged: boolean;
}

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    CRITICAL: 'bg-error text-on-error animate-pulse shadow-[0_0_10px_rgba(186,26,26,0.5)]',
    HIGH: 'bg-[var(--color-orange-container)] text-[var(--color-on-orange-container)]',
    WARNING: 'bg-primary-container text-on-primary-container',
    INFO: 'bg-surface-container-high text-on-surface-variant'
  };
  
  return (
    <span className={clsx('px-2.5 py-1 text-[10px] font-bold font-label rounded-full tracking-wider', styles[severity])}>
      {severity}
    </span>
  );
};

export default function AlertsPage() {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNACKNOWLEDGED' | 'CRITICAL'>('UNACKNOWLEDGED');

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Alert[] = data.map((row: any) => ({
          id: row.id,
          timestamp: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: row.type,
          severity: row.severity as Severity,
          guardName: row.guard_name,
          location: row.location,
          acknowledged: row.acknowledged
        }));
        setAlerts(mapped);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    // Subscribe to live database alert updates
    const channel = supabase
      .channel('live-alerts-page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAcknowledge = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ acknowledged: true })
        .eq('id', id);

      if (error) throw error;
      
      // Update state locally immediately
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (err: any) {
      alert(`Failed to acknowledge alert: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'UNACKNOWLEDGED') return !a.acknowledged;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    return true;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading anomaly stream...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Pending Alert Stream</h1>
          <p className="text-sm font-label text-on-surface-variant mt-1">Real-time telemetry and operational anomalies.</p>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'UNACKNOWLEDGED', 'CRITICAL'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 text-xs font-label font-bold rounded-lg transition-colors",
                filter === f 
                  ? "bg-primary text-on-primary" 
                  : "bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high"
              )}
            >
              {f === 'UNACKNOWLEDGED' ? 'Active' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-primary opacity-50 mb-2">check_circle</span>
            <h3 className="text-lg font-headline font-medium text-on-surface">All Clear</h3>
            <p className="text-sm text-on-surface-variant font-label">No alerts match the current filter.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={twMerge(
                clsx(
                  "flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-5 rounded-2xl border transition-all",
                  alert.acknowledged 
                    ? "bg-surface-container-lowest border-outline-variant opacity-70"
                    : "bg-surface-container-low border-error/30 shadow-sm"
                )
              )}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className={clsx(
                  "p-3 rounded-xl flex items-center justify-center",
                  alert.acknowledged ? "bg-surface-container" : "bg-error-container text-on-error-container"
                )}>
                  <span className="material-symbols-outlined">
                    {alert.type.includes('SOS') || alert.type.includes('Breach') ? 'emergency' : 
                     alert.type.includes('Geofence') || alert.type.includes('Offline') ? 'location_off' : 
                     alert.type.includes('Check-in') ? 'schedule' : 'battery_alert'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={clsx("font-headline font-bold text-base", alert.acknowledged ? "text-on-surface-variant" : "text-on-surface")}>
                      {alert.type}
                    </h3>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-label text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">person</span> {alert.guardName}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span> {alert.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {alert.timestamp}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex w-full md:w-auto gap-2">
                {!alert.acknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface text-sm font-bold font-label rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                    Acknowledge
                  </button>
                )}
                <button 
                  className={clsx(
                    "flex-1 md:flex-none px-4 py-2 text-sm font-bold font-label rounded-lg transition-colors flex items-center justify-center gap-2",
                    alert.acknowledged
                      ? "bg-surface-container text-on-surface border border-outline-variant"
                      : "bg-error text-on-error hover:opacity-90 shadow-sm"
                  )}
                >
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  Escalate
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
