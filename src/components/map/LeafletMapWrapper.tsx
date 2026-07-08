'use client';

import React from 'react';
import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { GeoCoord, GuardPin, GeofenceZone, PatrolRoute } from '../../types/guard';
import { GuardMarker } from './GuardMarker';
import { GeofenceLayer } from './GeofenceLayer';
import { PatrolRouteLayer } from './PatrolRouteLayer';
import { useMapTheme } from '../../hooks/useMapTheme';

export interface MapContainerProps {
  children?: React.ReactNode;
  center?: GeoCoord;
  zoom?: number;
  className?: string;
  guards?: GuardPin[];
  geofences?: GeofenceZone[];
  patrols?: PatrolRoute[];
  activeRoute?: PatrolRoute | null;
}

export default function LeafletMapWrapper({ 
  children, 
  center = { lat: 23.0225, lng: 72.5714 },
  zoom = 13,
  className = "w-full h-full min-h-[400px]",
  guards = [],
  geofences = [],
  patrols = [],
  activeRoute = null,
}: MapContainerProps) {
  const mapStyle = useMapTheme();
  
  // Use a modern, clean tile style. CartoDB Voyager is a great default.
  // Alternatively, CartoDB Positron for a light theme, or Dark Matter for dark theme.
  const tileUrl = mapStyle.includes('dark') 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px', zIndex: 0 }}>
      <LeafletMap 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        
        {geofences.map(zone => (
          <GeofenceLayer key={zone.id} zone={zone} />
        ))}
        
        {patrols.map(patrol => (
          <PatrolRouteLayer key={patrol.id} route={patrol} />
        ))}
        
        {activeRoute && (
          <PatrolRouteLayer route={activeRoute} />
        )}
        
        {guards.map(guard => (
          <GuardMarker key={guard.id} guard={guard} />
        ))}

        {children}
      </LeafletMap>
    </div>
  );
}
