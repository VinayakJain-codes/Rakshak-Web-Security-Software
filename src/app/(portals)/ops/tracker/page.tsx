'use client';

import React, { useState, useEffect } from 'react';
import { useGuardPositions } from '../../../../hooks/useGuardPositions';
import { GuardStatus, GeofenceZone, PatrolRoute } from '../../../../types/guard';
import { MapContainer } from '../../../../components/map/MapContainer';
import { MapLegend } from '../../../../components/map/MapLegend';
import { MapControls } from '../../../../components/map/MapControls';
import { StatusBadge } from '../../../../components/ui/rakshak/StatusBadge';
import { createClient } from '../../../../utils/supabase/client';

export default function OpsTrackerPage() {
  const supabase = createClient();
  const { guards, isLoading: guardsLoading, lastUpdated } = useGuardPositions();
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [patrols, setPatrols] = useState<PatrolRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<GuardStatus[]>(['active', 'pending', 'critical']);
  const [searchQuery, setSearchQuery] = useState('');
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

  const loadTrackerData = async () => {
    try {
      // 1. Load geofences
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

      // 2. Load patrols
      const { data: patrolData } = await supabase.from('patrols').select('*');
      if (patrolData) {
        const mappedPatrols: PatrolRoute[] = patrolData.map((row: any) => ({
          id: row.id,
          guardId: row.guard_id,
          siteId: row.site_id,
          checkpoints: row.checkpoints || [],
          actualPath: row.actual_path || []
        }));
        setPatrols(mappedPatrols);
      }
    } catch (err) {
      console.error('Error loading tracker database details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrackerData();

    // Subscribe to changes on geofences and patrols
    const channel = supabase
      .channel('live-tracker-entities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'geofences' }, () => loadTrackerData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patrols' }, () => loadTrackerData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleFilter = (status: GuardStatus) => {
    setActiveFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleRecenter = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setMapCenter({ lat: 23.0225, lng: 72.5714 });
        }
      );
    } else {
      setMapCenter({ lat: 23.0225, lng: 72.5714 });
    }
  };

  const filteredGuards = guards.filter(g => 
    activeFilters.includes(g.status) && 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalGuards = guards.filter(g => g.status === 'critical');

  if (guardsLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[500px]">Loading telemetry...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-4 md:-m-8">
      {criticalGuards.length > 0 && (
        <div className="bg-error-container text-on-error-container px-6 py-2 flex items-center justify-between font-label text-sm z-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <span className="font-bold">CRITICAL ALERT:</span> {criticalGuards.length} guard(s) offline or out of bounds.
          </div>
          <button className="underline font-bold text-error">Dispatch Supervisor</button>
        </div>
      )}
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            className="w-full h-full"
            guards={filteredGuards}
            geofences={geofences}
            patrols={patrols}
          >
            <MapControls 
                totalGuards={guards.length} 
                siteCount={geofences.length}
                activeFilters={activeFilters}
                toggleFilter={toggleFilter}
                onRecenter={handleRecenter}
            />
            
            <MapLegend />
          </MapContainer>
        </div>

        {/* Right Sidebar - Guard List */}
        <div className="w-80 bg-surface border-l border-outline-variant flex flex-col z-10 hidden lg:flex">
          <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
            <h3 className="font-headline font-bold text-on-surface mb-3">Active Shift Registry</h3>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input 
                type="text" 
                placeholder="Search guards..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-3 py-1.5 text-sm font-label focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="text-[10px] text-on-surface-variant font-mono mt-2 text-right">
              Last synced: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1 bg-surface">
            {filteredGuards.map(guard => (
              <div 
                key={guard.id}
                onClick={() => setMapCenter(guard.position)}
                className="p-3 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors border border-transparent hover:border-outline-variant flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-on-surface">{guard.name}</div>
                  <StatusBadge variant={guard.status} showDot={true}>
                    {guard.status === 'active' ? 'Active' : guard.status === 'pending' ? 'Pending' : guard.status === 'critical' ? 'Critical' : 'Completed'}
                  </StatusBadge>
                </div>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant font-mono">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {geofences.find(g => g.id === guard.siteId || g.siteId === guard.siteId)?.siteName || 'Unknown Site'}
                </div>
              </div>
            ))}
            {filteredGuards.length === 0 && (
              <div className="text-center p-6 text-on-surface-variant font-label text-sm">
                No guards found matching current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
