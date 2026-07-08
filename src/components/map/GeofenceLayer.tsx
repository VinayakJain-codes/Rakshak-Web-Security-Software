'use client';

import React from 'react';
import { Polygon } from 'react-leaflet';
import { GeofenceZone, GeoCoord } from '../../types/guard';

interface GeofenceLayerProps {
  zone: GeofenceZone;
}

export function GeofenceLayer({ zone }: GeofenceLayerProps) {
  const coords = zone.polygon.map((coord: GeoCoord) => [coord.lat, coord.lng] as [number, number]);

  return (
    <Polygon
      positions={coords}
      pathOptions={{
        color: '#4c5e8b',
        weight: 2,
        opacity: 0.8,
        fillColor: '#4c5e8b',
        fillOpacity: 0.15,
      }}
    />
  );
}
