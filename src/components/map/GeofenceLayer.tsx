'use client';

import React, { useEffect, useRef } from 'react';
import { GeofenceZone, GeoCoord } from '../../types/guard';
import { useMapplsMap } from './MapplsMapWrapper';

interface GeofenceLayerProps {
  zone: GeofenceZone;
}

export function GeofenceLayer({ zone }: GeofenceLayerProps) {
  const { map, mapplsClassObject } = useMapplsMap();
  const polygonRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !mapplsClassObject) return;

    const coords = zone.polygon.map((coord: GeoCoord) => ({ lat: coord.lat, lng: coord.lng }));

    polygonRef.current = new mapplsClassObject.Polygon({
      map: map,
      paths: coords,
      fillColor: '#4c5e8b',
      fillOpacity: 0.15,
      strokeColor: '#4c5e8b',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fitbounds: false
    });

    return () => {
      if (polygonRef.current) {
        mapplsClassObject.remove({ map: map, layer: polygonRef.current });
      }
    };
  }, [map, mapplsClassObject, zone]);

  return null;
}
