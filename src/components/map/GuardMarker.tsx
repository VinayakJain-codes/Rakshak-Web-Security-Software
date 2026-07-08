'use client';

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { GuardPin } from '../../types/guard';
import { GuardTelemetryPopover } from './GuardTelemetryPopover';

interface GuardMarkerProps {
  guard: GuardPin;
}

export function GuardMarker({ guard }: GuardMarkerProps) {
  const initials = guard.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  
  const customIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="guard-marker font-label text-xs font-bold text-on-surface select-none ${guard.status === 'active' ? 'active marker-pulse-active' : ''} ${guard.status === 'pending' ? 'pending marker-pulse-pending' : ''} ${guard.status === 'critical' ? 'critical marker-pulse-critical' : ''} ${guard.status === 'completed' ? 'completed' : ''}">${initials}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  return (
    <Marker position={[guard.position.lat, guard.position.lng]} icon={customIcon}>
      <Popup className="custom-popup" maxWidth={320} minWidth={300}>
        <GuardTelemetryPopover guard={guard} onClose={() => {}} />
      </Popup>
    </Marker>
  );
}
