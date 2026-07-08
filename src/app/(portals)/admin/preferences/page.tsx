'use client';

import React from 'react';

export default function AdminPreferencesPage() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">User Preferences</h2>
        <p className="text-on-surface-variant font-label">Manage your personal account, notifications, and localization.</p>
      </header>

      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline text-2xl font-bold shadow-inner border border-outline-variant">
            RS
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">Super Admin</h3>
            <p className="text-sm text-on-surface-variant mb-2">superadmin@rakshak.in</p>
            <button className="text-primary text-sm font-bold hover:underline">Change Password</button>
          </div>
        </div>

        {/* Localization & Display */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">language</span>
            Localization & Display
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 items-center p-3 bg-surface-container-low rounded-lg gap-4 border border-outline-variant/30">
              <div className="col-span-2">
                <p className="font-bold text-sm text-on-surface">Timezone Override</p>
                <p className="text-xs text-on-surface-variant mt-0.5">System defaults to Asia/Kolkata (IST).</p>
              </div>
              <select className="col-span-1 bg-surface-container-lowest border border-outline-variant rounded-md text-sm px-3 py-2 outline-none focus:border-primary w-full text-on-surface">
                <option>System Default (IST)</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </div>
            
            <div className="grid grid-cols-3 items-center p-3 bg-surface-container-low rounded-lg gap-4 border border-outline-variant/30">
              <div className="col-span-2">
                <p className="font-bold text-sm text-on-surface">Dashboard Density</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Adjust the visual density of tables and cards.</p>
              </div>
              <select className="col-span-1 bg-surface-container-lowest border border-outline-variant rounded-md text-sm px-3 py-2 outline-none focus:border-primary w-full text-on-surface">
                <option>Comfortable</option>
                <option>Compact</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-warning">notifications_active</span>
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div>
                <p className="font-bold text-sm text-on-surface">System Alerts (Email)</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Receive emails for CRITICAL support tickets and outages.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div>
                <p className="font-bold text-sm text-on-surface">Weekly Summary Reports</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Receive a weekly digest of platform MRR and tenant growth.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
            <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">Save Preferences</button>
        </div>
      </div>
    </>
  );
}
