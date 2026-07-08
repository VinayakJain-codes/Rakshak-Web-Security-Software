import React, { useState } from 'react';
import clsx from 'clsx';

export function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="absolute bottom-6 left-6 z-10">
        <button 
            onClick={() => setCollapsed(false)}
            className="map-overlay-glass p-2 rounded-lg text-on-surface-variant hover:text-on-surface flex items-center justify-center shadow-md"
            title="Show Map Legend"
        >
            <span className="material-symbols-outlined text-[20px]">legend_toggle</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-6 z-10 map-overlay-glass p-4 rounded-xl shadow-lg w-64">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-headline font-bold text-sm text-on-surface">Live Status Key</h4>
        <button 
            onClick={() => setCollapsed(true)}
            className="text-on-surface-variant hover:text-on-surface"
        >
            <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
      
      <div className="space-y-3 font-label text-xs text-on-surface-variant">
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-success bg-surface-container-lowest marker-pulse-active"></div>
            <span>Active & Verified</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-warning bg-surface-container-lowest marker-pulse-pending"></div>
            <span>Pending Verification</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-error bg-surface-container-lowest marker-pulse-critical"></div>
            <span>Critical / Offline / Breach</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-outline-variant bg-surface-container-lowest opacity-60"></div>
            <span>Shift Completed</span>
        </div>
      </div>
    </div>
  );
}
