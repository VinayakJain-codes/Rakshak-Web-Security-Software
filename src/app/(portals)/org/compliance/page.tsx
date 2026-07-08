'use client';

import React, { useState } from 'react';

export default function OrgCompliancePage() {
  const [retentionDays, setRetentionDays] = useState(180);

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Trust & Compliance Center</h2>
        <p className="text-on-surface-variant font-label">Manage data privacy policies, retention limits, and enterprise integrations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GDPR / DPDPA Settings */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-[24px]">shield_person</span>
                <h3 className="font-headline font-bold text-on-surface text-lg">Data Privacy (DPDPA / GDPR)</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-label font-bold text-on-surface">Biometric Data Retention Limit</label>
                        <span className="font-mono text-primary font-bold">{retentionDays} Days</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                        Configure how long facial recognition embeddings and raw telemetry data are stored before being permanently purged. Audit logs are kept immutably for 1 year.
                    </p>
                    <input 
                        type="range" 
                        min="30" max="365" step="30"
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                </div>

                <div className="border-t border-outline-variant pt-6">
                    <h4 className="font-bold text-sm text-on-surface mb-2">Right to be Forgotten (Self-Service)</h4>
                    <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                        Pending erasure requests from former guards seeking to permanently delete their PII and biometric profiles from your active database.
                    </p>
                    <div className="p-3 bg-warning-container/30 border border-warning/30 rounded-lg flex justify-between items-center">
                        <div>
                            <div className="font-bold text-sm">3 Pending Erasure Requests</div>
                            <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">SLA limit: 30 days</div>
                        </div>
                        <button className="bg-surface-container-lowest text-on-surface font-bold text-xs px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                            Review Requests
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Enterprise Integrations */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-[24px]">integration_instructions</span>
                <h3 className="font-headline font-bold text-on-surface text-lg">Enterprise Integrations</h3>
            </div>

            <div className="space-y-6">
                {/* SIEM */}
                <div>
                    <h4 className="font-bold text-sm text-on-surface mb-2">SIEM Log Forwarding</h4>
                    <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                        Stream security events and authentication failures to your internal SIEM (Splunk, DataDog, AWS Kinesis).
                    </p>
                    <div className="space-y-3">
                        <input type="text" placeholder="Webhook URL (e.g. https://http-inputs-company.splunkcloud.com)" className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label focus:border-primary outline-none" />
                        <input type="password" placeholder="HEC Token / API Key" className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label focus:border-primary outline-none" />
                    </div>
                    <button className="mt-3 text-sm font-bold text-primary hover:underline">Test Connection</button>
                </div>

                {/* ERP / Payroll */}
                <div className="border-t border-outline-variant pt-6">
                    <h4 className="font-bold text-sm text-on-surface mb-2">ERP & Payroll Sync (SAP/Workday)</h4>
                    <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                        Automatically synchronize verified shift attendance hours directly to your HR systems.
                    </p>
                    <div className="space-y-3">
                        <select className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface focus:border-primary outline-none">
                            <option>Select Provider...</option>
                            <option>Workday</option>
                            <option>SAP SuccessFactors</option>
                            <option>Custom Webhook</option>
                        </select>
                        <input type="password" placeholder="Integration Bearer Token" className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label focus:border-primary outline-none" />
                    </div>
                    <button className="mt-3 text-sm font-bold text-primary hover:underline">Verify HR Sync</button>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <button className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    Save Configurations
                </button>
            </div>
        </div>

      </div>
    </>
  );
}
