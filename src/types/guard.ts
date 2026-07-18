export type GuardStatus = 'active' | 'pending' | 'critical' | 'completed';

export interface Guard {
  id: string;
  name: string;
  status: string;
  tenant_id: string;
}

export interface GeoCoord {
  lng: number;
  lat: number;
}

export interface TelemetryPayload {
  biometricVector: string;
  gpsCoordinates: GeoCoord;
  networkEpochTime: number;
  accelerometerVector: [number, number, number];
  ambientBrightness: number;
  rootDetectionStatus: 'clean' | 'rooted' | 'unknown';
  batteryLevel: number;
  signalStrength: number;
  lastSyncedAt: number;
}

export interface GuardPin {
  id: string;
  name: string;
  status: GuardStatus;
  position: GeoCoord;
  siteId: string;
  shiftStart: number;
  shiftEnd: number | null;
  telemetry: TelemetryPayload;
  avatarUrl?: string;
}

export interface GeofenceZone {
  id: string;
  siteId: string;
  siteName: string;
  polygon: GeoCoord[];
  color?: string;
}

export interface PatrolCheckpoint {
  id: string;
  label: string;
  position: GeoCoord;
  type: 'qr' | 'nfc' | 'ble';
  scannedAt: number | null;
  sequence: number;
}

export interface PatrolRoute {
  id: string;
  guardId: string;
  siteId: string;
  checkpoints: PatrolCheckpoint[];
  actualPath: GeoCoord[];
}
