'use client';

import React, { useState, useEffect } from 'react';
import { useGuardPositions } from '../../../../hooks/useGuardPositions';
import { GuardStatus, GeofenceZone, PatrolRoute } from '../../../../types/guard';
import { MapContainer } from '../../../../components/map/MapContainer';
import { MapLegend } from '../../../../components/map/MapLegend';
import { MapControls } from '../../../../components/map/MapControls';
import { StatusBadge } from '../../../../components/ui/rakshak/StatusBadge';
import { createClient } from '../../../../utils/supabase/client';
import { useAuth } from '../../../../providers/AuthProvider';

function generateCirclePolygon(centerLat: number, centerLng: number, radiusInMeters: number = 100, numberOfPoints: number = 24): {lat: number, lng: number}[] {
  const points: {lat: number, lng: number}[] = [];
  const earthRadius = 6378137;

  for (let i = 0; i < numberOfPoints; i++) {
    const angle = (i * 360) / numberOfPoints;
    const bearing = (angle * Math.PI) / 180;
    
    const dR = radiusInMeters / earthRadius;
    const latRad = (centerLat * Math.PI) / 180;
    const lngRad = (centerLng * Math.PI) / 180;

    const destLatRad = Math.asin(
      Math.sin(latRad) * Math.cos(dR) +
      Math.cos(latRad) * Math.sin(dR) * Math.cos(bearing)
    );

    const destLngRad = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(dR) * Math.cos(latRad),
      Math.cos(dR) - Math.sin(latRad) * Math.sin(destLatRad)
    );

    points.push({
      lat: (destLatRad * 180) / Math.PI,
      lng: (destLngRad * 180) / Math.PI,
    });
  }

  points.push({ ...points[0] });
  return points;
}

export default function OpsTrackerPage() {
  const supabase = createClient();
  const { tenantId } = useAuth();
  const { guards, isLoading: guardsLoading, lastUpdated } = useGuardPositions();
  const [geofences, setGeofences] = useState<GeofenceZone[]>([]);
  const [patrols, setPatrols] = useState<PatrolRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<GuardStatus[]>(['active', 'pending', 'critical']);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 23.0225, lng: 72.5714 });

  // Geofence Creation State
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [geofenceName, setGeofenceName] = useState('');
  const [geofenceColor, setGeofenceColor] = useState('#007AFF');
  const [tempGeofence, setTempGeofence] = useState<GeofenceZone | null>(null);

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
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setMapCenter({ lat: 23.0225, lng: 72.5714 });
    }
  };

  const handleCreateGeofenceStart = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter({ lat, lng });
          
          const polygon = generateCirclePolygon(lat, lng, 100);
          setTempGeofence({
            id: 'temp-geofence',
            siteId: 'temp',
            siteName: 'New Site (Pending)',
            polygon,
            color: geofenceColor
          });
          setShowGeofenceModal(true);
        },
        (error) => {
          alert('Unable to get exact location. Please allow browser location access.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const saveGeofence = async () => {
    if (!tempGeofence || !tenantId || !geofenceName.trim()) return;

    try {
      const { error } = await supabase.from('geofences').insert([{
        tenant_id: tenantId,
        site_name: geofenceName,
        polygon: tempGeofence.polygon,
        color: geofenceColor
      }]);

      if (error) throw error;
      
      // Reset state and hide modal, loadTrackerData will be triggered by realtime
      setShowGeofenceModal(false);
      setTempGeofence(null);
      setGeofenceName('');
      loadTrackerData();
    } catch (e: any) {
      alert(`Error saving geofence: ${e.message}`);
    }
  };

  const cancelGeofence = () => {
    setShowGeofenceModal(false);
    setTempGeofence(null);
    setGeofenceName('');
  };

  const filteredGuards = guards.filter(g => 
    activeFilters.includes(g.status) && 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalGuards = guards.filter(g => g.status === 'critical');

  if (guardsLoading || isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[500px]">Loading telemetry...</div>;
  }

  // Inject the temp geofence if it exists so MapContainer renders it immediately
  const renderGeofences = tempGeofence ? [...geofences, tempGeofence] : geofences;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-4 md:-m-8 relative">
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
            zoom={16} 
            className="w-full h-full"
            guards={filteredGuards}
            geofences={renderGeofences}
            patrols={patrols}
          >
            <MapControls 
                totalGuards={guards.length} 
                siteCount={geofences.length}
                activeFilters={activeFilters}
                toggleFilter={toggleFilter}
                onRecenter={handleRecenter}
                onCreateGeofence={handleCreateGeofenceStart}
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

      {/* Geofence Creation Modal */}
      {showGeofenceModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-headline font-bold mb-2 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_location_alt</span>
                Save New Site Geofence
              </h2>
              <p className="text-on-surface-variant text-sm mb-6">
                A 100m radius geofence has been drawn around your current exact location. Give it a name to save it to your database.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Site Name</label>
                  <input
                    type="text"
                    value={geofenceName}
                    onChange={(e) => setGeofenceName(e.target.value)}
                    placeholder="e.g. Headquarters"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Boundary Color</label>
                  <div className="flex gap-2">
                    {['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setGeofenceColor(color);
                          if (tempGeofence) {
                            setTempGeofence({...tempGeofence, color});
                          }
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${geofenceColor === color ? 'scale-110 border-on-surface' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={cancelGeofence}
                className="px-4 py-2 font-label font-bold text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveGeofence}
                disabled={!geofenceName.trim()}
                className="px-4 py-2 font-label font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Geofence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
