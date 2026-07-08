'use client';

import React from 'react';

export default function AdminSettingsPage() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Platform Settings</h2>
        <p className="text-on-surface-variant font-label">Manage global platform configurations, security, and defaults.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">security</span>
            Global Security Policies
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div>
                <p className="font-bold text-sm text-on-surface">Enforce 2FA for all Super Admins</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Require two-factor authentication for Rakshak internal staff.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div>
                <p className="font-bold text-sm text-on-surface">Session Timeout</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Automatically log out idle users.</p>
              </div>
              <select className="bg-surface-container-lowest border border-outline-variant rounded-md text-sm px-3 py-1 outline-none focus:border-primary text-on-surface">
                <option>15 Minutes</option>
                <option>30 Minutes</option>
                <option>1 Hour</option>
                <option>4 Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tenant Defaults */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">corporate_fare</span>
            Tenant Defaults
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div>
                <p className="font-bold text-sm text-on-surface">Auto-Suspend Overages</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Halt service if guard capacity is exceeded by 20%.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
              <div>
                <p className="font-bold text-sm text-on-surface">Default Data Retention</p>
                <p className="text-xs text-on-surface-variant mt-0.5">How long to store incident logs.</p>
              </div>
              <select className="bg-surface-container-lowest border border-outline-variant rounded-md text-sm px-3 py-1 outline-none focus:border-primary text-on-surface">
                <option>30 Days</option>
                <option>90 Days</option>
                <option>1 Year</option>
                <option>Indefinite</option>
              </select>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 flex justify-end mt-4">
            <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity">Save Platform Settings</button>
        </div>
      </div>
    </>
  );
}
