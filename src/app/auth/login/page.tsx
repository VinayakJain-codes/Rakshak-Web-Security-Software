'use client';

import React, { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from '../actions';

import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <>
      <form action={login} className="space-y-4">
        <div>
          <label className="block text-sm font-label font-medium text-on-surface mb-1" htmlFor="email">
            Corporate Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-sm font-label focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
            placeholder="name@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-label font-medium text-on-surface mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2.5 text-sm font-label focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm font-label flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary text-on-primary font-bold font-label rounded-lg px-4 py-3 hover:opacity-90 transition-opacity flex justify-center items-center"
        >
          Sign In Securely
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface-container-lowest/80 text-on-surface-variant font-label">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full bg-surface-container border border-outline-variant text-on-surface font-bold font-label rounded-lg px-4 py-3 hover:bg-surface-container-high transition-colors flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            Enterprise SSO (SAML)
          </button>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center font-bold font-headline text-2xl mx-auto mb-4 shadow-lg border-2 border-primary-container">
            RS
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Rakshak Security</h1>
          <p className="text-sm font-label text-on-surface-variant mt-1">Enterprise Access Portal</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading form...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
