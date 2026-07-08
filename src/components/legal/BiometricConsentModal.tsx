'use client';

import { useState } from 'react';
import en from '../../i18n/messages/en.json';
import hi from '../../i18n/messages/hi.json';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function BiometricConsentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [hasScrolled, setHasScrolled] = useState(false);

  if (!isOpen) return null;

  const t = lang === 'en' ? en.consent : hi.consent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-highest/80 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-start bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-container text-on-primary-container rounded-lg">
              <span className="material-symbols-outlined">fingerprint</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">{t.title}</h2>
          </div>
          <div className="flex bg-surface-container-high rounded-lg p-1">
            <button 
              onClick={() => setLang('en')}
              className={twMerge(clsx('px-3 py-1 text-xs font-bold rounded-md transition-colors', lang === 'en' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'))}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('hi')}
              className={twMerge(clsx('px-3 py-1 text-xs font-bold rounded-md transition-colors', lang === 'hi' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'))}
            >
              हिं
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div 
          className="p-6 overflow-y-auto font-label text-sm text-on-surface-variant space-y-6"
          onScroll={(e) => {
            const target = e.currentTarget;
            if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
              setHasScrolled(true);
            }
          }}
        >
          <p className="text-on-surface text-base">{t.description}</p>
          
          <div>
            <h3 className="font-bold text-on-surface mb-2">{t.listTitle}</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t.listFacial}</li>
              <li>{t.listFingerprint}</li>
            </ul>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <h3 className="font-bold text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">policy</span>
              {t.rightsTitle}
            </h3>
            <p className="text-xs">{t.rightsDescription}</p>
          </div>
          
          {/* Dummy extra content to force scroll if needed */}
          <div className="h-10"></div>
          <p className="text-xs italic opacity-70 text-center">Please scroll to the bottom to consent.</p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row-reverse gap-3">
          <button 
            disabled={!hasScrolled}
            onClick={onClose}
            className={twMerge(clsx(
              'flex-1 py-3 px-4 rounded-xl font-bold font-label transition-all',
              hasScrolled 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' 
                : 'bg-surface-container-highest text-outline cursor-not-allowed'
            ))}
          >
            {t.accept}
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold font-label border border-error/50 text-error hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            {t.decline}
          </button>
        </div>
      </div>
    </div>
  );
}
