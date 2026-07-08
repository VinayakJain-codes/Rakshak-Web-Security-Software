'use client';

import React, { useState } from 'react';

export default function OrgReportsPage() {
  const [activeTab, setActiveTab] = useState<'exports' | 'ai'>('exports');

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Reports & Analytics</h2>
        <p className="text-on-surface-variant font-label">Export certified compliance logs and review AI insights.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-outline-variant mb-6">
        <button 
            onClick={() => setActiveTab('exports')}
            className={`pb-3 font-bold font-label transition-colors ${activeTab === 'exports' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
            Certified Data Exports
        </button>
        <button 
            onClick={() => setActiveTab('ai')}
            className={`pb-3 font-bold font-label transition-colors flex items-center gap-1 ${activeTab === 'ai' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        >
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            AI Compliance Digests
        </button>
      </div>

      {activeTab === 'exports' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center gap-4">
                <div className="flex gap-2">
                    <select className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface outline-none focus:border-primary">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Current Month</option>
                        <option>Custom Range...</option>
                    </select>
                    <select className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm font-label text-on-surface outline-none focus:border-primary">
                        <option>All Sites</option>
                        <option>Tech Park Campus</option>
                        <option>Logistics Hub</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="bg-surface-container-high border border-outline-variant text-on-surface font-bold rounded-lg px-4 py-2 hover:bg-surface-container-highest transition-colors flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px]">table_chart</span>
                        Export CSV (Payroll)
                    </button>
                    <button className="bg-primary text-on-primary font-bold rounded-lg px-4 py-2 hover:opacity-90 transition-opacity flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        Download PDF (Certified)
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container sticky top-0">
                        <tr>
                            <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Date</th>
                            <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Site / Geofence</th>
                            <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Total Guards</th>
                            <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">Total Hours</th>
                            <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label">PSARA Violations</th>
                            <th className="p-4 font-bold text-sm text-on-surface-variant border-b border-outline-variant uppercase font-label text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-label text-sm text-on-surface">
                        <tr className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4 font-mono text-xs">Jul 06, 2026</td>
                            <td className="p-4 font-bold">Tech Park Campus</td>
                            <td className="p-4">12</td>
                            <td className="p-4 font-mono text-xs">96.5 hrs</td>
                            <td className="p-4 text-on-surface-variant">0</td>
                            <td className="p-4 text-right"><span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold">Verified</span></td>
                        </tr>
                        <tr className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4 font-mono text-xs">Jul 05, 2026</td>
                            <td className="p-4 font-bold">Logistics Hub</td>
                            <td className="p-4">18</td>
                            <td className="p-4 font-mono text-xs">144.0 hrs</td>
                            <td className="p-4 text-error font-bold">1 (Ratio Exceeded)</td>
                            <td className="p-4 text-right"><span className="px-2 py-1 bg-warning-container text-on-warning-container rounded text-xs font-bold">Flagged</span></td>
                        </tr>
                        <tr className="hover:bg-surface-container-low transition-colors">
                            <td className="p-4 font-mono text-xs">Jul 04, 2026</td>
                            <td className="p-4 font-bold">Tech Park Campus</td>
                            <td className="p-4">11</td>
                            <td className="p-4 font-mono text-xs">88.2 hrs</td>
                            <td className="p-4 text-on-surface-variant">0</td>
                            <td className="p-4 text-right"><span className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold">Verified</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 border-l-4 border-l-primary">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
                        <h3 className="font-headline font-bold text-on-surface text-lg">Weekly Operations Digest (Jul 1 - Jul 7)</h3>
                    </div>
                    <p className="text-on-surface-variant text-sm font-label mb-4 leading-relaxed">
                        Overall compliance remains high at <strong>98.4%</strong> across all sites. However, the AI model detected a recurring pattern of delayed biometric check-ins at the <strong>Logistics Hub</strong> between 18:00 and 19:00 IST on weekdays.
                    </p>
                    <ul className="space-y-2 text-sm text-on-surface font-label">
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-warning text-[18px]">warning</span>
                            <span><strong>Risk Highlight:</strong> Logistics Hub night shift transitions frequently exceed the 15-minute SLA grace period.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-success text-[18px]">check_circle</span>
                            <span><strong>Positive Trend:</strong> Geofence breaches at Tech Park Campus dropped to zero this week.</span>
                        </li>
                    </ul>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 border-l-4 border-l-error">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-error text-[24px]">gavel</span>
                        <h3 className="font-headline font-bold text-on-surface text-lg">Regulatory Alert (PSARA)</h3>
                    </div>
                    <p className="text-on-surface-variant text-sm font-label leading-relaxed">
                        On July 5th, a shift allocation at Logistics Hub briefly reached a <strong>1:18 supervisor-to-guard ratio</strong>, violating PSARA Section 19 rules (Max 1:15). Although the supervisor manually approved an override, this requires immediate attention to prevent audit fines.
                    </p>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 h-fit">
                <h3 className="font-headline font-bold text-on-surface mb-4">AI Model Status</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs font-bold text-on-surface mb-1">
                            <span>Telemetry Vectors Analysed</span>
                            <span className="text-primary">124.5k</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs font-bold text-on-surface mb-1">
                            <span>Confidence Score</span>
                            <span className="text-success">96%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-success w-[96%]"></div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-outline-variant mt-4 text-xs text-on-surface-variant font-label text-center">
                        Last trained: 2 hours ago via Gemini Pro
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
