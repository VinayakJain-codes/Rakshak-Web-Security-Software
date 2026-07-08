'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GuardConsentPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [consentGiven, setConsentGiven] = useState(false);

  const texts = {
    EN: {
        title: 'Privacy & Data Consent',
        subtitle: 'Please review how your data is handled during your shifts.',
        biometricTitle: 'Biometric Processing Consent',
        biometricDesc: 'I explicitly consent to Rakshak Security processing my facial biometric data for the sole purpose of verifying my identity during shift check-ins and check-outs. This data will not be shared with third parties and will be auto-deleted after 180 days.',
        locationTitle: 'Surveillance Limitations Notice',
        locationDesc: 'Your GPS location is strictly monitored ONLY during your scheduled shift hours within the designated site geofence. Background tracking automatically turns off when you are off-duty.',
        withdrawNote: 'You have the right to withdraw this consent at any time via your profile settings (Right to be Forgotten).',
        agreeBtn: 'I Agree and Consent',
        declineBtn: 'Decline (Exit)',
    },
    HI: {
        title: 'गोपनीयता और डेटा सहमति',
        subtitle: 'कृपया देखें कि आपकी शिफ्ट के दौरान आपके डेटा को कैसे संभाला जाता है।',
        biometricTitle: 'बायोमेट्रिक प्रसंस्करण सहमति',
        biometricDesc: 'मैं रक्षक सिक्योरिटी को अपनी शिफ्ट के दौरान अपनी पहचान सत्यापित करने के एकमात्र उद्देश्य के लिए मेरे चेहरे के बायोमेट्रिक डेटा को संसाधित करने की स्पष्ट सहमति देता हूं। यह डेटा तीसरे पक्ष के साथ साझा नहीं किया जाएगा और 180 दिनों के बाद स्वतः हटा दिया जाएगा।',
        locationTitle: 'निगरानी सीमा सूचना',
        locationDesc: 'आपके GPS स्थान की सख्ती से निगरानी केवल आपके निर्धारित शिफ्ट घंटों के दौरान निर्दिष्ट साइट जियोफेंस के भीतर की जाती है। जब आप ड्यूटी पर नहीं होते हैं तो बैकग्राउंड ट्रैकिंग स्वचालित रूप से बंद हो जाती है।',
        withdrawNote: 'आपको अपनी प्रोफ़ाइल सेटिंग (भूल जाने का अधिकार) के माध्यम से किसी भी समय इस सहमति को वापस लेने का अधिकार है।',
        agreeBtn: 'मैं सहमत हूं और सहमति देता हूं',
        declineBtn: 'अस्वीकार करें (बाहर निकलें)',
    }
  };

  const current = texts[language];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-surface-container-low p-6 border-b border-outline-variant flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-headline font-bold text-on-surface">{current.title}</h1>
                    <p className="text-sm font-label text-on-surface-variant mt-1">{current.subtitle}</p>
                </div>
                <div className="flex bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                    <button 
                        onClick={() => setLanguage('EN')}
                        className={`px-3 py-1 text-xs font-bold transition-colors ${language === 'EN' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('HI')}
                        className={`px-3 py-1 text-xs font-bold transition-colors ${language === 'HI' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                    >
                        हिंदी
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
                {/* Unbundled Biometric Consent */}
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl">
                    <h3 className="font-bold text-on-surface flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">fingerprint</span>
                        {current.biometricTitle}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        {current.biometricDesc}
                    </p>
                </div>

                {/* Surveillance Limitations */}
                <div className="bg-surface-container p-5 rounded-xl border border-outline-variant">
                    <h3 className="font-bold text-on-surface flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-secondary text-[20px]">location_off</span>
                        {current.locationTitle}
                    </h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        {current.locationDesc}
                    </p>
                </div>

                <div className="flex items-start gap-3 p-4">
                    <input 
                        type="checkbox" 
                        id="consent"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-primary cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-sm font-bold text-on-surface cursor-pointer">
                        {current.withdrawNote}
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-between gap-4">
                <button 
                    onClick={() => router.push('/auth/login')}
                    className="px-6 py-3 rounded-xl font-bold font-label bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors"
                >
                    {current.declineBtn}
                </button>
                <button 
                    disabled={!consentGiven}
                    onClick={() => router.push('/')}
                    className={`px-8 py-3 rounded-xl font-bold font-label transition-all ${consentGiven ? 'bg-primary text-on-primary hover:opacity-90 shadow-md' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'}`}
                >
                    {current.agreeBtn}
                </button>
            </div>
        </div>
    </div>
  );
}
