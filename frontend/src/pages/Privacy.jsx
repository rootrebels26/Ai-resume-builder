import React from 'react';
import { ShieldCheck, Lock, Database, ServerOff, EyeOff, CheckCircle2 } from 'lucide-react';

export function Privacy() {
  return (
    <div className="flex-1 bg-canvas min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-10 max-w-5xl mx-auto w-full">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-volt border border-ink flex items-center justify-center mx-auto shadow-brutal-sm">
          <ShieldCheck className="w-7 h-7 text-ink" />
        </div>
        <div className="eyebrow-tag justify-center">
          <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
          <span>ZERO DATABASE • ZERO TRACKING</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
          Privacy Architecture Manifesto.{' '}
          <span className="editorial-italic text-[1.12em]">By design.</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary max-w-xl mx-auto leading-relaxed">
          Our uncompromising pledge to protect your confidential career history, contact details, and documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-surface p-6 sm:p-7 space-y-3 bg-white">
          <div className="flex items-center gap-2 text-ink font-extrabold text-sm">
            <ServerOff className="w-4 h-4 text-editorial-violet" />
            <span>Zero Server-Side Database</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            We do not operate PostgreSQL, MongoDB, MySQL, Firebase, or Supabase. There is simply no central database where your resume or identity could ever be queried, leaked, or breached.
          </p>
        </div>

        <div className="card-surface p-6 sm:p-7 space-y-3 bg-white">
          <div className="flex items-center gap-2 text-ink font-extrabold text-sm">
            <Lock className="w-4 h-4 text-editorial-violet" />
            <span>No Account Registration</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            You will never be asked for passwords, telephone OTPs, or third-party OAuth logins. All core features are immediately accessible as a guest.
          </p>
        </div>

        <div className="card-surface p-6 sm:p-7 space-y-3 bg-white">
          <div className="flex items-center gap-2 text-ink font-extrabold text-sm">
            <Database className="w-4 h-4 text-editorial-violet" />
            <span>Browser-Local IndexedDB (Dexie.js)</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Your resume drafts and preferences are saved exclusively in your browser sandbox. You can clear them instantly or export them as portable JSON files at any time.
          </p>
        </div>

        <div className="card-surface p-6 sm:p-7 space-y-3 bg-white">
          <div className="flex items-center gap-2 text-ink font-extrabold text-sm">
            <EyeOff className="w-4 h-4 text-editorial-violet" />
            <span>Ephemeral Processing Only</span>
          </div>
          <p className="text-xs text-ink-secondary leading-relaxed">
            When you upload a PDF/DOCX for parsing or invoke AI bullet optimization, data is processed in memory or securely deleted temporary files, and never logged or stored permanently.
          </p>
        </div>
      </div>

      <div className="bento-lavender p-6 sm:p-7 space-y-3">
        <h3 className="font-extrabold text-ink uppercase tracking-wide text-xs">Storage Notice & Best Practices</h3>
        <p className="text-xs text-ink leading-relaxed">
          Because drafts are stored locally inside your browser's IndexedDB, clearing your browser cache or switching devices will not automatically sync your drafts.
        </p>
        <p className="text-xs text-ink leading-relaxed font-bold">
          We strongly advise utilizing the "Export JSON" button in the Builder toolbar to archive copies of your resumes on your personal storage.
        </p>
      </div>
    </div>
  );
}
