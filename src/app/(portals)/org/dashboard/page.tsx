'use client';

import React, { useState, useEffect } from 'react';
import { KPICard } from '../../../../components/ui/rakshak/KPICard';
import { AlertCard } from '../../../../components/ui/rakshak/AlertCard';
import { MapContainer } from '../../../../components/map/MapContainer';
import { useGuardPositions } from '../../../../hooks/useGuardPositions';
import { createClient } from '../../../../utils/supabase/client';
import { GeofenceZone } from '../../../../types/guard';

interface Alert {
  id: string;
  type: string;
  severity: string;
  guard_name: string;
  location: string;
  acknowledged: boolean;
  timestamp: string;
}

export default function OrgDashboardPage() {
  const supabase = createClient();
  const { guards, isLoading: guardsLoading } = useGuardPositions();
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [patrolCompliance, setPatrolCompliance] = useState('0%');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 23.0225, lng: 72.5714 });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  const loadOrgData = async () => {
    try {
      // 1. Fetch geofences/sites for the active tenant (RLS scoped)
      const { data: geoData } = await supabase.from('geofences').select('*');
      if (geoData) {
        const mappedGeo: GeofenceZone[] = geoData.map((row: any) => ({
          id: row.id,
          siteId: row.id,
          siteName: row.site_name,
          polygon: row.polygon,
          color: row.color
        }));
        setGeofences(mappedGeo);
      }

      // 2. Fetch alerts for the active tenant (RLS scoped)
      const { data: alertData } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      if (alertData) {
        setAlerts(alertData);
      }

      // 3. Fetch tenant metrics for the active tenant
      const { data: tenantMetrics } = await supabase
        .from('tenant_metrics')
        .select('patrol_compliance')
        .limit(1)
        .single();
      
      if (tenantMetrics) {
        setPatrolCompliance(`${tenantMetrics.patrol_compliance}%`);
      }
    } catch (err) {
      console.error('Error loading org dashboard details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();

    // Subscribe to live alert updates
    const channel = supabase
      .channel('live-org-alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => {
          loadOrgData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
  
  const activeGuardsCount = guards.filter(g => g.status === 'active').length;
  const criticalGuardsCount = guards.filter(g => g.status === 'critical').length;
  const unacknowledgedCriticalAlerts = alerts.filter(a => !a.acknowledged && (a.severity === 'CRITICAL' || a.severity === 'HIGH')).length;

  const getTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (guardsLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-[500px] text-on-surface-variant font-label">Loading organization overview...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Organization Dashboard</h2>
        <p className="text-on-surface-variant font-label">Enterprise overview of locations and compliance.</p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Active Guards" 
          value={activeGuardsCount.toString()} 
          icon="shield_person" 
          trend={{ value: '+2 from yesterday', direction: 'up' }}
          variant="primary"
        />
        <KPICard 
          title="Sites Monitored" 
          value={geofences.length.toString()} 
          icon="location_city" 
          variant="secondary"
        />
        <KPICard 
          title="Critical Alerts" 
          value={unacknowledgedCriticalAlerts.toString()} 
          icon="warning" 
          trend={unacknowledgedCriticalAlerts > 0 ? { value: 'Requires Action', direction: 'down' } : undefined}
          variant={unacknowledgedCriticalAlerts > 0 ? 'error' : 'secondary'}
        />
        <KPICard 
          title="Patrol Compliance" 
          value={patrolCompliance} 
          icon="fact_check" 
          trend={{ value: 'Real-time', direction: 'up' }}
          variant="primary"
        />
      </div>

      {/* Embedded Map & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Overview */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="font-headline font-bold text-on-surface">Live Geographic Overview</h3>
                <span className="text-xs font-label text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full">
                    {guards.length} Total Guards
                </span>
            </div>
            <div className="flex-1 relative">
                <MapContainer 
                    center={mapCenter}
                    zoom={11.5} 
                    className="w-full h-full"
                    guards={guards}
                    geofences={geofences}
                />
            </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col h-[500px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h3 className="font-headline font-bold text-on-surface">Recent Alerts</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {alerts.map(alert => (
                  <AlertCard 
                      key={alert.id}
                      severity={alert.severity.toLowerCase() as any}
                      title={alert.type}
                      location={alert.location}
                      timestamp={getTimeAgo(alert.timestamp)}
                      status={alert.acknowledged ? 'resolved' : 'active'}
                  />
                ))}
                {alerts.length === 0 && (
                  <div className="text-center p-12 text-on-surface-variant font-label text-sm">
                    No recent alerts generated.
                  </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
}
