'use client';

import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PatrolRoute } from '../../types/guard';

interface PatrolRouteLayerProps {
  route: PatrolRoute;
}

export function PatrolRouteLayer({ route }: PatrolRouteLayerProps) {
  // Expected route (connecting checkpoints in sequence)
  const expectedCoords = route.checkpoints
    .sort((a, b) => a.sequence - b.sequence)
    .map(cp => [cp.position.lat, cp.position.lng] as [number, number]);

  // Actual path (GPS trail)
  const actualCoords = route.actualPath.map(coord => [coord.lat, coord.lng] as [number, number]);

  return (
    <>
      {/* Expected route polyline (dashed, lower opacity) */}
      {expectedCoords.length > 1 && (
        <Polyline
          positions={expectedCoords}
          pathOptions={{
            color: '#787a84',
            weight: 2,
            opacity: 0.5,
            dashArray: '5, 10',
          }}
        />
      )}

      {/* Actual path polyline */}
      {actualCoords.length > 1 && (
        <Polyline
          positions={actualCoords}
          pathOptions={{
            color: '#4c5e8b',
            weight: 3,
            opacity: 1,
          }}
        />
      )}

      {/* Checkpoint markers */}
      {route.checkpoints.map(cp => {
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

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="w-6 h-6 rounded-full ${bgColor} ${textColor} flex items-center justify-center font-bold text-[10px] font-mono border-2 border-surface shadow-sm ${extraClasses}">${content}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });

        return (
          <Marker 
            key={cp.id} 
            position={[cp.position.lat, cp.position.lng]} 
            icon={customIcon}
          >
            <Popup>
              <div style={{ padding: '4px', fontFamily: 'sans-serif', fontSize: '12px', color: '#333' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{cp.label}</div>
                <div>Sequence: {cp.sequence}</div>
                <div>Type: {cp.type.toUpperCase()}</div>
                <div>
                  Status: <span style={{ fontWeight: 'bold', color: isScanned ? 'green' : isMissed ? 'red' : 'gray' }}>
                    {isScanned ? 'Scanned' : isMissed ? 'Missed' : 'Pending'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
