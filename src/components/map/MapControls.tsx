import React from 'react';
import { GuardStatus } from '../../types/guard';

interface MapControlsProps {
    totalGuards: number;
    siteCount: number;
    activeFilters: GuardStatus[];
    toggleFilter: (status: GuardStatus) => void;
    onRecenter: () => void;
    onCreateGeofence?: () => void;
}

export function MapControls({ totalGuards, siteCount, activeFilters, toggleFilter, onRecenter, onCreateGeofence }: MapControlsProps) {
  return (
    <div className="absolute top-4 left-4 right-14 z-10 flex flex-wrap justify-between items-start gap-4 pointer-events-none">
        {/* Left side: Context Summary */}
        <div className="map-overlay-glass px-4 py-2 rounded-full shadow-sm flex items-center gap-2 pointer-events-auto">
            <span className="material-symbols-outlined text-[18px] text-primary">radar</span>
            <span className="font-label font-bold text-sm text-on-surface">
                {totalGuards} Guards <span className="text-outline-variant mx-1">|</span> {siteCount} Sites
            </span>
        </div>

        {/* Right side: Filters & Actions */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="map-overlay-glass p-1.5 rounded-lg shadow-sm flex gap-1 bg-surface-container-lowest/90 backdrop-blur-md">
                <FilterButton 
                    status="active" 
                    icon="check_circle" 
                    isActive={activeFilters.includes('active')} 
                    onClick={() => toggleFilter('active')} 
                    colorClass="text-success"
                />
                <FilterButton 
                    status="pending" 
                    icon="hourglass_empty" 
                    isActive={activeFilters.includes('pending')} 
                    onClick={() => toggleFilter('pending')} 
                    colorClass="text-warning"
                />
                <FilterButton 
                    status="critical" 
                    icon="error" 
                    isActive={activeFilters.includes('critical')} 
                    onClick={() => toggleFilter('critical')} 
                    colorClass="text-error"
                />
                <div className="w-[1px] bg-outline-variant/50 mx-1 my-1"></div>
                {onCreateGeofence && (
                    <button 
                        onClick={onCreateGeofence}
                        className="p-1.5 rounded text-primary hover:bg-primary/10 transition-colors"
                        title="Create Geofence at My Location"
                    >
                        <span className="material-symbols-outlined text-[18px]">share_location</span>
                    </button>
                )}
                <button 
                    onClick={onRecenter}
                    className="p-1.5 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    title="Recenter Map"
                >
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                </button>
            </div>
        </div>
    </div>
  );
}

function FilterButton({ status, icon, isActive, onClick, colorClass }: { status: string, icon: string, isActive: boolean, onClick: () => void, colorClass: string }) {
    return (
        <button 
            onClick={onClick}
            className={`p-1.5 rounded transition-colors ${isActive ? 'bg-surface-container-highest' : 'hover:bg-surface-container-low opacity-50'}`}
            title={`Toggle ${status} guards`}
        >
            <span className={`material-symbols-outlined text-[18px] ${isActive ? colorClass : 'text-on-surface-variant'}`}>
                {icon}
            </span>
        </button>
    );
}
