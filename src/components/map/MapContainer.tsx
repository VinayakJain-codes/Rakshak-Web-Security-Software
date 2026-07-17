'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GeoCoord, GuardPin, GeofenceZone, PatrolRoute } from '../../types/guard';

import type { MapContainerProps } from './MapplsMapWrapper';

const MapplsMapWrapper = dynamic(
  () => import('./MapplsMapWrapper'),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-surface-container-lowest text-on-surface-variant font-label">Loading map...</div> }
) as React.ComponentType<MapContainerProps>;

export function MapContainer(props: MapContainerProps) {
  return <MapplsMapWrapper {...props} />;
}
