'use client';

import React, { useEffect, useRef } from 'react';
import { PatrolRoute } from '../../types/guard';
import { useMapplsMap } from './MapplsMapWrapper';

interface PatrolRouteLayerProps {
  route: PatrolRoute;
}

export function PatrolRouteLayer({ route }: PatrolRouteLayerProps) {
  const { map, mapplsClassObject } = useMapplsMap();
  const layersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map || !mapplsClassObject) return;

    const expectedCoords = route.checkpoints
      .sort((a, b) => a.sequence - b.sequence)
      .map(cp => ({ lat: cp.position.lat, lng: cp.position.lng }));

    const actualCoords = route.actualPath.map(coord => ({ lat: coord.lat, lng: coord.lng }));

    if (expectedCoords.length > 1) {
      const expectedPolyline = new mapplsClassObject.Polyline({
        map: map,
        paths: expectedCoords,
        strokeColor: '#787a84',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fitbounds: false
      });
      layersRef.current.push(expectedPolyline);
    }

    if (actualCoords.length > 1) {
      const actualPolyline = new mapplsClassObject.Polyline({
        map: map,
        paths: actualCoords,
        strokeColor: '#4c5e8b',
        strokeOpacity: 1,
        strokeWeight: 3,
        fitbounds: false
      });
      layersRef.current.push(actualPolyline);
    }

    route.checkpoints.forEach(cp => {
      const isScanned = cp.scannedAt !== null;
      const maxScannedSequence = Math.max(...route.checkpoints.filter(c => c.scannedAt !== null).map(c => c.sequence), 0);
      const isMissed = !isScanned && cp.sequence < maxScannedSequence;
      
      let bgColor = 'bg-surface-container-highest';
      let textColor = 'text-on-surface';
      let content = cp.sequence.toString();
      let extraClasses = '';
      
      if (isScanned) {
          bgColor = 'bg-[var(--color-green)]';
          textColor = 'text-on-primary';
      } else if (isMissed) {
          bgColor = 'bg-error';
          textColor = 'text-on-error';
          content = `<span class="material-symbols-outlined text-[12px]">priority_high</span>`;
          extraClasses = 'animate-pulse';
      }

      const htmlContent = `<div class="w-6 h-6 rounded-full ${bgColor} ${textColor} flex items-center justify-center font-bold text-[10px] font-mono border-2 border-surface shadow-sm ${extraClasses}">${content}</div>`;

      const marker = new mapplsClassObject.Marker({
        map: map,
        position: { lat: cp.position.lat, lng: cp.position.lng },
        html: htmlContent,
        width: 24,
        height: 24,
        offset: [0, -12]
      });

      const infoContent = `
        <div style="padding: 4px; font-family: sans-serif; font-size: 12px; color: #333;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${cp.label}</div>
          <div>Sequence: ${cp.sequence}</div>
          <div>Type: ${cp.type.toUpperCase()}</div>
          <div>
            Status: <span style="font-weight: bold; color: ${isScanned ? 'green' : isMissed ? 'red' : 'gray'}">
              ${isScanned ? 'Scanned' : isMissed ? 'Missed' : 'Pending'}
            </span>
          </div>
        </div>
      `;

      if (typeof marker.addListener === 'function') {
        marker.addListener('click', () => {
          new mapplsClassObject.InfoWindow({
            map: map,
            content: infoContent,
            position: { lat: cp.position.lat, lng: cp.position.lng }
          });
        });
      }

      layersRef.current.push(marker);
    });

    return () => {
      layersRef.current.forEach(layer => {
        if (layer) {
          try {
            mapplsClassObject.remove({ map: map, layer: layer });
          } catch(e) {}
        }
      });
      layersRef.current = [];
    };
  }, [map, mapplsClassObject, route]);

  return null;
}
