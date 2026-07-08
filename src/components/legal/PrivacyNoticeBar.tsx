'use client';

import { useState, useEffect } from 'react';
import en from '../../i18n/messages/en.json';

export function PrivacyNoticeBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('rakshak_privacy_dismissed');
    if (!dismissed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('rakshak_privacy_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 shadow-lg border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm font-label text-center sm:text-left">
        {en.privacy.bannerText}{' '}
        <a href="#" className="text-inverse-primary underline hover:opacity-80 transition-opacity">
          {en.privacy.link}
        </a>
      </p>
      <button 
        onClick={dismiss}
        className="shrink-0 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg text-sm font-bold font-label hover:opacity-90 transition-opacity"
      >
        {en.privacy.dismiss}
      </button>
    </div>
  );
}
