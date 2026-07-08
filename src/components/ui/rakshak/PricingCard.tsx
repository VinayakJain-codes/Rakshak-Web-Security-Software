import React from 'react';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  recommended?: boolean;
  guardCap: string;
  siteCap: string;
  onSelect?: () => void;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isCurrent,
  recommended,
  guardCap,
  siteCap,
  onSelect
}: PricingCardProps) {
  return (
    <div className={`relative flex flex-col p-6 rounded-2xl border ${recommended ? 'border-primary shadow-lg bg-surface-container-lowest scale-[1.02]' : 'border-outline-variant bg-surface-container-lowest'} transition-all`}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-0.5 rounded-full text-xs font-bold font-label shadow-sm">
          Recommended
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-headline font-bold text-on-surface">{name}</h3>
        <p className="text-sm font-label text-on-surface-variant mt-1">{description}</p>
      </div>

      <div className="mb-6 flex items-end gap-1">
        <span className="text-3xl font-headline font-black text-on-surface">{price}</span>
        {price !== 'Custom' && <span className="text-on-surface-variant font-label text-sm mb-1">/ mo</span>}
      </div>

      <div className="space-y-4 mb-8 flex-1">
        <div className="p-3 bg-surface-container rounded-lg border border-outline-variant font-mono text-xs text-on-surface">
            <div className="flex justify-between mb-1">
                <span>Guard Capacity:</span>
                <span className="font-bold">{guardCap}</span>
            </div>
            <div className="flex justify-between">
                <span>Site Capacity:</span>
                <span className="font-bold">{siteCap}</span>
            </div>
        </div>

        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-label text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-2.5 rounded-lg font-bold font-label transition-colors ${
          isCurrent 
            ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed border border-outline-variant' 
            : recommended
                ? 'bg-primary text-on-primary hover:opacity-90'
                : 'bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high'
        }`}
      >
        {isCurrent ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
}
