import React from 'react';
import { GuardPin } from '../../types/guard';
import { StatusBadge } from '../ui/rakshak/StatusBadge';
import { TelemetrySlot } from '../ui/rakshak/TelemetryCard';

interface GuardTelemetryPopoverProps {
  guard: GuardPin;
  onClose: () => void;
}

export function GuardTelemetryPopover({ guard, onClose }: GuardTelemetryPopoverProps) {
  
  const getStatusLabel = () => {
    switch (guard.status) {
        case 'active': return 'Active';
        case 'pending': return 'Pending Verification';
        case 'critical': return 'Critical / Offline';
        case 'completed': return 'Shift Completed';
    }
  };

  const getShiftDuration = () => {
    const end = guard.shiftEnd || Date.now();
    const diffHours = (end - guard.shiftStart) / (1000 * 60 * 60);
    return `${diffHours.toFixed(1)} hrs`;
  };

  const timeAgo = Math.round((Date.now() - guard.telemetry.lastSyncedAt) / 1000);
  const syncLabel = timeAgo < 10 ? 'Just now' : `${timeAgo}s ago`;

  return (
    <div className="map-overlay-glass p-4 w-[320px] rounded-xl flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-headline font-bold text-on-surface text-base">{guard.name}</h3>
                <div className="text-xs text-on-surface-variant font-label mt-0.5">Shift Duration: {getShiftDuration()}</div>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
        
        <div>
            <StatusBadge variant={guard.status} className="mb-2">{getStatusLabel()}</StatusBadge>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1">
            <TelemetrySlot 
                icon="fingerprint" 
                label="Biometric" 
                status={guard.telemetry.biometricVector.includes('Verified') ? 'active' : guard.status === 'pending' ? 'pending' : 'critical'} 
                value={guard.telemetry.biometricVector} 
            />
            <TelemetrySlot 
                icon="location_on" 
                label="Location" 
                status="active" 
                value={`${guard.telemetry.gpsCoordinates.lat.toFixed(4)}°, ${guard.telemetry.gpsCoordinates.lng.toFixed(4)}°`} 
            />
            <TelemetrySlot 
                icon="wifi" 
                label="Network" 
                status={guard.telemetry.signalStrength > -80 ? 'active' : 'pending'} 
                value={`${guard.telemetry.signalStrength} dBm`} 
            />
            <TelemetrySlot 
                icon="vital_signs" 
                label="Motion" 
                status="active" 
                value={`[${guard.telemetry.accelerometerVector.map(v => v.toFixed(1)).join(', ')}]`} 
            />
            <TelemetrySlot 
                icon="battery_charging_full" 
                label="Battery" 
                status={guard.telemetry.batteryLevel > 20 ? 'active' : 'critical'} 
                value={`${guard.telemetry.batteryLevel}%`} 
            />
            <TelemetrySlot 
                icon="security" 
                label="Device Integrity" 
                status={guard.telemetry.rootDetectionStatus === 'clean' ? 'active' : 'critical'} 
                value={guard.telemetry.rootDetectionStatus === 'clean' ? 'Clean' : 'Compromised'} 
            />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant text-[10px] text-on-surface-variant font-label uppercase font-bold tracking-wider">
            <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${guard.status === 'critical' ? 'bg-error' : 'bg-success'}`}></span>
                Sync: {syncLabel}
            </div>
            <a href={`/ops/tracker/guard/${guard.id}`} className="text-primary hover:underline cursor-pointer">
                Full History →
            </a>
        </div>
    </div>
  );
}
