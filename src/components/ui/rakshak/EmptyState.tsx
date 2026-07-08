import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full w-full">
      <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-headline font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-sm font-label text-on-surface-variant max-w-sm mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
