'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GuardPin } from '../../types/guard';
import { useMapplsMap } from './MapplsMapWrapper';
import { GuardTelemetryPopover } from './GuardTelemetryPopover';

interface GuardMarkerProps {
  guard: GuardPin;
}

export function GuardMarker({ guard }: GuardMarkerProps) {
  const { map, mapplsObject } = useMapplsMap();
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    if (!map || !mapplsObject) return;

    const initials = guard.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const htmlContent = `<div class="guard-marker font-label text-xs font-bold text-on-surface select-none ${guard.status === 'active' ? 'active marker-pulse-active' : ''} ${guard.status === 'pending' ? 'pending marker-pulse-pending' : ''} ${guard.status === 'critical' ? 'critical marker-pulse-critical' : ''} ${guard.status === 'completed' ? 'completed' : ''}">${initials}</div>`;

    try {
      markerRef.current = mapplsObject.Marker({
        map: map,
        position: { lat: guard.position.lat, lng: guard.position.lng },
        html: htmlContent,
        width: 32,
        height: 32,
        offset: [0, -16]
      });
    } catch (e) {
      console.error('Error creating guard marker:', e);
      return;
    }

    const popupContainer = document.createElement('div');
    rootRef.current = createRoot(popupContainer);

    const closePopup = () => {
        if (infoWindowRef.current) {
           try {
               if (typeof infoWindowRef.current.remove === 'function') {
                   infoWindowRef.current.remove();
               } else {
                   mapplsObject.remove({ map: map, layer: infoWindowRef.current });
               }
           } catch(e) {}
        }
    };

    rootRef.current.render(<GuardTelemetryPopover guard={guard} onClose={closePopup} />);

    if (markerRef.current && typeof markerRef.current.addListener === 'function') {
        markerRef.current.addListener('click', () => {
            closePopup();
            
            try {
              infoWindowRef.current = mapplsObject.InfoWindow({
                  map: map,
                  content: popupContainer,
                  position: { lat: guard.position.lat, lng: guard.position.lng }
              });
            } catch(e) {
              console.error('Error creating info window:', e);
            }
        });
    }

    return () => {
      if (rootRef.current) {
        setTimeout(() => {
            if (rootRef.current) rootRef.current.unmount();
        }, 0);
      }
      if (markerRef.current) {
        try {
            mapplsObject.remove({ map: map, layer: markerRef.current });
        } catch(e) {}
      }
      closePopup();
    };
  }, [map, mapplsObject, guard]);

  return null;
}
