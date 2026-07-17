'use client';

import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
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
  geofences?: GeofenceZone[]
  patrols?: PatrolRoute[];
  activeRoute?: PatrolRoute | null;
}

interface MapplsContextType {
  map: any;
  mapplsObject: any;
}

export const MapplsMapContext = createContext<MapplsContextType | null>(null);

export function useMapplsMap() {
  const context = useContext(MapplsMapContext);
  if (!context) {
    throw new Error('useMapplsMap must be used within a MapplsMapWrapper');
  }
  return context;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Don't load if already present
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.type = 'text/javascript';
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

const MAP_CONTAINER_ID = 'mappls-map-container';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapplsObj, setMapplsObj] = useState<any>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const token = process.env.NEXT_PUBLIC_MAPPLS_TOKEN;
    if (!token) {
      console.error('[MapplsMap] NEXT_PUBLIC_MAPPLS_TOKEN is not set in .env.local');
      return;
    }

    console.log('[MapplsMap] Loading SDK with token:', token.substring(0, 8) + '...');

    // For Auth2 (newer tokens), the URL format is different
    const auth2Url = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk?layer=vector&v=3.0`;
    const fallbackUrl = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk_plugins?v=3.0`; // Just in case
    
    // Actually the standard Mappls Web Map SDK URL for both is this one, but sometimes it throws 404 if the token isn't authorized for Web SDK
    const primaryUrl = `https://apis.mappls.com/advancedmaps/api/${token}/map_sdk?layer=vector&v=3.0`;

    const checkAndInitMap = (m: any) => {
      console.log('[MapplsMap] window.mappls ready, creating map...');
      try {
        const newMap = new m.Map(MAP_CONTAINER_ID, {
          center: [center.lat, center.lng],
          zoom: zoom,
          zoomControl: true,
        });
        
        newMap.on('load', () => {
          console.log('[MapplsMap] Map loaded!');
          setMapInstance(newMap);
          setMapplsObj(m);
        });
      } catch (err) {
        console.error('[MapplsMap] Error creating map:', err);
      }
    };

    loadScript(primaryUrl)
      .then(() => {
        console.log('[MapplsMap] Primary SDK script loaded.');
        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          const m = (window as any).mappls;
          if (m) {
            clearInterval(poll);
            checkAndInitMap(m);
          } else if (attempts > 50) {
            clearInterval(poll);
            console.error('[MapplsMap] window.mappls not found after loading primary script.');
          }
        }, 100);
      })
      .catch((err) => {
        console.error('[MapplsMap] Primary SDK load failed:', err);
        console.log('[MapplsMap] Trying alternative Auth2 URL...');
        
        // Alternative URL for Mappls Auth2
        const altUrl = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${token}`;
        loadScript(altUrl)
          .then(() => {
            console.log('[MapplsMap] Alternative SDK script loaded.');
            let attempts = 0;
            const poll = setInterval(() => {
              attempts++;
              const m = (window as any).mappls;
              if (m) {
                clearInterval(poll);
                checkAndInitMap(m);
              } else if (attempts > 50) {
                clearInterval(poll);
                console.error('[MapplsMap] window.mappls not found after loading alternative script.');
              }
            }, 100);
          })
          .catch((altErr) => {
            console.error('[MapplsMap] Alternative SDK load also failed:', altErr);
          });
      });
  }, []); // Run only once

  // Dynamic panning when center prop changes
  useEffect(() => {
    if (mapInstance && center) {
      try {
        // Mappls SDK uses [lat, lng] arrays for center in its wrappers
        mapInstance.setCenter([center.lat, center.lng]);
        if (zoom) {
          mapInstance.setZoom(zoom);
        }
      } catch (err) {
        console.error('[MapplsMap] Error panning to new center:', err);
      }
    }
  }, [center.lat, center.lng, zoom, mapInstance]);

  // Cleanup WebGL contexts on unmount to prevent Next.js Fast Refresh crashes
  useEffect(() => {
    return () => {
      if (mapInstance && typeof mapInstance.remove === 'function') {
        try {
          mapInstance.remove();
        } catch (e) {
          console.error('[MapplsMap] Error removing map instance:', e);
        }
      }
    };
  }, [mapInstance]);

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px', zIndex: 0 }}>
      <div 
        id={MAP_CONTAINER_ID}
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
      />
      {children}
      {mapInstance && mapplsObj && (
        <MapplsMapContext.Provider value={{ map: mapInstance, mapplsObject: mapplsObj }}>
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
        </MapplsMapContext.Provider>
      )}
    </div>
  );
}
