'use client';

import React, { useState, useEffect } from 'react';

export function IndianTimeClock() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: 'Asia/Kolkata', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      };
      setTimeStr(now.toLocaleTimeString('en-IN', options) + ' IST');
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-lg text-on-surface-variant text-xs font-bold font-mono shadow-sm border border-outline-variant mr-2">
      <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
      {timeStr}
    </div>
  );
}
