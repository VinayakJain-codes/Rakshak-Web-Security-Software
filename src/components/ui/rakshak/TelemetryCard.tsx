import React from 'react';
import { GuardPin } from '../../../types/guard';

interface TelemetryCardProps {
  guard: GuardPin;
}

export function TelemetryCard({ guard }: TelemetryCardProps) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-lg border border-outline-variant w-80">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant">
        <div>
          <h4 className="font-bold text-on-surface text-sm">{guard.name}</h4>
          <p className="text-xs text-on-surface-variant font-label">Device Diagnostics</p>
        </div>
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" title="Live Syncing" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TelemetrySlot icon="fingerprint" label="Biometric" status={guard.telemetry.biometricVector.includes('Verified') ? 'active' : 'critical'} value={guard.telemetry.biometricVector} />
        <TelemetrySlot icon="location_on" label="Location" status="active" value={`${guard.telemetry.gpsCoordinates.lat.toFixed(4)}°, ${guard.telemetry.gpsCoordinates.lng.toFixed(4)}°`} />
        <TelemetrySlot icon="wifi" label="Network" status="active" value={`${guard.telemetry.signalStrength} dBm`} />
        <TelemetrySlot icon="vital_signs" label="Motion" status="active" value={`[${guard.telemetry.accelerometerVector.map(v => v.toFixed(1)).join(', ')}]`} />
        <TelemetrySlot icon="battery_charging_full" label="Battery" status={guard.telemetry.batteryLevel > 20 ? 'active' : 'critical'} value={`${guard.telemetry.batteryLevel}%`} />
        <TelemetrySlot icon="light_mode" label="Display" status="active" value={`${guard.telemetry.ambientBrightness}% Brightness`} />
      </div>
    </div>
  );
}

export function TelemetrySlot({ icon, label, status, value }: { icon: string; label: string; status: 'active' | 'pending' | 'critical' | 'completed'; value: string }) {
  const statusColor = 
    status === 'active' ? 'text-success' :
    status === 'pending' ? 'text-warning' :
    status === 'critical' ? 'text-error' :
    'text-on-surface-variant';

  return (
    <div className="flex flex-col gap-1 p-2 bg-surface-container-low rounded-lg">
      <div className="flex justify-between items-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        <span className={`material-symbols-outlined text-[12px] ${statusColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          circle
        </span>
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{label}</div>
        <div className="text-xs font-mono text-on-surface truncate mt-0.5" title={value}>{value}</div>
      </div>
    </div>
  );
}
