'use client';

import React, { useEffect, useRef } from 'react';
import { GeofenceZone, GeoCoord } from '../../types/guard';
import { useMapplsMap } from './MapplsMapWrapper';

interface GeofenceLayerProps {
  zone: GeofenceZone;
}

export function GeofenceLayer({ zone }: GeofenceLayerProps) {
  const { map, mapplsObject } = useMapplsMap();
  const polygonRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !mapplsObject) return;

    const coords = zone.polygon.map((coord: GeoCoord) => ({ lat: coord.lat, lng: coord.lng }));

    try {
      polygonRef.current = mapplsObject.Polygon({
        map: map,
        paths: coords,
        fillColor: '#4c5e8b',
        fillOpacity: 0.15,
        strokeColor: '#4c5e8b',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fitbounds: false
      });
    } catch (e) {
      console.error('Error creating geofence polygon:', e);
    }

    return () => {
      if (polygonRef.current) {
        try {
          mapplsObject.remove({ map: map, layer: polygonRef.current });
        } catch(e) {}
      }
    };
  }, [map, mapplsObject, zone]);

  return null;
}
