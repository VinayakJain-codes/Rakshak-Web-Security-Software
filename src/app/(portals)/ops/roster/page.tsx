'use client';

import React, { useState } from 'react';
import { DocumentUploader } from '../../../../components/ui/rakshak/DocumentUploader';

export default function OpsRosterPage() {
  const [assignedGuards, setAssignedGuards] = useState(12);

  const psaraRatioExceeded = assignedGuards > 15;

  const handleAddGuard = () => {
    setAssignedGuards(prev => prev + 1);
  };

  const handleRemoveGuard = () => {
    setAssignedGuards(prev => Math.max(0, prev - 1));
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-headline font-bold text-on-surface">Shift Roster & Deployment</h2>
        <p className="text-on-surface-variant font-label">Manage guard assignments and ensure PSARA compliance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Roster Management */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
                    <div>
                        <h3 className="font-headline font-bold text-on-surface text-lg">Tech Park Campus - Night Shift</h3>
                        <p className="text-sm text-on-surface-variant font-mono mt-1">20:00 - 08:00 IST | Supervisor: Amit Kumar</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-surface-container text-on-surface font-bold text-sm px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                            Draft
                        </button>
                    </div>
                </div>

                {psaraRatioExceeded && (
                    <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/30 flex items-start gap-3">
                        <span className="material-symbols-outlined text-[24px]">gavel</span>
                        <div>
                            <h4 className="font-bold text-sm">PSARA Section 19 Violation (Ratio Exceeded)</h4>
                            <p className="text-xs mt-1">
                                You cannot assign more than 15 guards to a single supervisor. Current ratio is 1:{assignedGuards}. Please assign an additional supervisor or remove guards from this shift.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-on-surface">Assigned Guards ({assignedGuards})</h4>
                    <div className="flex items-center gap-2">
                        <button onClick={handleRemoveGuard} className="w-8 h-8 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <button onClick={handleAddGuard} className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Mock Guard List */}
                    {Array.from({ length: Math.min(assignedGuards, 5) }).map((_, i) => (
                        <div key={i} className="p-3 bg-surface-container-lowest border border-outline-variant rounded-lg flex justify-between items-center group hover:border-primary transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center font-bold text-xs">G{i+1}</div>
                                <div>
                                    <div className="font-bold text-sm">Guard Name {i+1}</div>
                                    <div className="text-xs text-on-surface-variant font-mono">ID: BLR-{1000 + i}</div>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-success/20 text-success rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                    ))}
                    {assignedGuards > 5 && (
                        <div className="text-center p-2 text-xs font-label text-on-surface-variant italic">
                            + {assignedGuards - 5} more guards...
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-outline-variant flex justify-end">
                    <button disabled={psaraRatioExceeded} className={`px-6 py-2.5 rounded-lg font-bold font-label transition-colors ${psaraRatioExceeded ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' : 'bg-primary text-on-primary hover:opacity-90 shadow-sm'}`}>
                        Publish Roster
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column - PSARA Compliance Docs */}
        <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
                <h3 className="font-headline font-bold text-on-surface text-lg mb-4">Required Certifications</h3>
                <p className="text-sm text-on-surface-variant font-label mb-6">
                    Ensure all deployed personnel have active verified documents to comply with local regulations.
                </p>
                <div className="space-y-4">
                    <DocumentUploader 
                        label="Police Verification (CCTNS)"
                        description="Official background check clearance."
                        required={true}
                        acceptedTypes=".pdf"
                    />
                    <DocumentUploader 
                        label="Physical Fitness Cert"
                        description="Medical sign-off for active duty."
                        required={true}
                    />
                    <DocumentUploader 
                        label="Fire & Safety Training"
                        description="PSARA mandated training completion."
                    />
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
