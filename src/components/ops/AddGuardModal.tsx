'use client';

import React, { useState } from 'react';
import { createGuardAccount } from '../../app/actions/auth';

interface AddGuardModalProps {
  tenantId: string;
  geofences: { id: string; site_name: string }[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddGuardModal({ tenantId, geofences, onClose, onSuccess }: AddGuardModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [siteId, setSiteId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createGuardAccount({
        name,
        email,
        tenantId,
        siteId: siteId || undefined
      });

      if (result.error) {
        setError(result.error);
      } else {
        setGeneratedPassword(result.password || null);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      alert('Password copied to clipboard!');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {!generatedPassword ? (
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <h2 className="text-xl font-headline font-bold mb-2 text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Add New Guard
              </h2>
              <p className="text-on-surface-variant text-sm mb-6">
                Register a new guard. A secure account and temporary password will be generated for them.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg border border-error/30">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Email Address (Login ID)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guard@example.com"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Assign Site (Optional)</label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="">Select a site...</option>
                    {geofences.map(geo => (
                      <option key={geo.id} value={geo.id}>{geo.site_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-surface-container p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-label font-bold text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!name.trim() || !email.trim() || isSubmitting}
                className="px-4 py-2 font-label font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">add</span>
                )}
                {isSubmitting ? 'Creating...' : 'Add Guard'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
            </div>
            <h2 className="text-xl font-headline font-bold mb-2 text-center text-on-surface">
              Account Created
            </h2>
            <p className="text-on-surface-variant text-sm mb-6 text-center">
              Please share these temporary credentials with the guard securely. You will not be able to see this password again.
            </p>
            
            <div className="bg-surface-container p-4 rounded-xl space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Email (Login ID)</label>
                <div className="font-mono text-sm text-on-surface font-bold">{email}</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Temporary Password</label>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-mono text-sm text-on-surface font-bold select-all bg-surface-container-lowest px-2 py-1 rounded">
                    {generatedPassword}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={onClose}
                className="w-full px-4 py-2 font-label font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
