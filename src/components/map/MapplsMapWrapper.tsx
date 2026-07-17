'use client';

import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { mappls } from 'mappls-web-maps';
import { GeoCoord, GuardPin, GeofenceZone, PatrolRoute } from '../../types/guard';
import { GuardMarker } from './GuardMarker';
import { GeofenceLayer } from './GeofenceLayer';
import { PatrolRouteLayer } from './PatrolRouteLayer';

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

interface MapplsContextType {
  map: any;
  mapplsClassObject: any;
}

export const MapplsMapContext = createContext<MapplsContextType | null>(null);

export function useMapplsMap() {
  const context = useContext(MapplsMapContext);
  if (!context) {
    throw new Error('useMapplsMap must be used within a MapplsMapWrapper');
  }
  return context;
}

export default function MapplsMapWrapper({ 
  children, 
  center = { lat: 23.0225, lng: 72.5714 },
  zoom = 13,
  className = "w-full h-full min-h-[400px]",
  guards = [],
  geofences = [],
  patrols = [],
  activeRoute = null,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapplsClass, setMapplsClass] = useState<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance) return;

    const mapplsClassObject = new mappls();
    const token = process.env.NEXT_PUBLIC_MAPPLS_TOKEN || "";
    
    // Fallback ID to ensure map has a container id
    const containerId = "mappls-map-" + Math.random().toString(36).substring(7);
    mapRef.current.id = containerId;

    mapplsClassObject.initialize(token, { map: true }, () => {
      const newMap = mapplsClassObject.Map({
        id: containerId,
        properties: {
          center: [center.lat, center.lng],
          zoom: zoom,
          zoomControl: true,
          location: true
        }
      });
      
      newMap.on('load', () => {
        setMapInstance(newMap);
        setMapplsClass(mapplsClassObject);
      });
    });

    return () => {
      if (mapInstance && typeof mapInstance.remove === 'function') {
        mapInstance.remove();
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px', zIndex: 0 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      {mapInstance && mapplsClass && (
        <MapplsMapContext.Provider value={{ map: mapInstance, mapplsClassObject: mapplsClass }}>
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
        </MapplsMapContext.Provider>
      )}
    </div>
  );
}
