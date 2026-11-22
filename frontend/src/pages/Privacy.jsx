import React from 'react';
import { ShieldCheck, Lock, Database, FileCheck, EyeOff, ServerOff } from 'lucide-react';

export function Privacy() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Architecture Manifesto</h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Our uncompromising pledge to protect your confidential career history, contact details, and documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ServerOff className="w-4 h-4 text-emerald-600" />
            <span>Zero Server-Side Database</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not operate PostgreSQL, MongoDB, MySQL, Firebase, or Supabase. There is simply no central database where your resume or identity could ever be queried, leaked, or breached.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>No Account Registration</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            You will never be asked for passwords, telephone OTPs, or third-party OAuth logins. All core features are immediately accessible as a guest.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Browser-Local IndexedDB (Dexie.js)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your resume drafts and preferences are saved exclusively in your browser sandbox. You can clear them instantly or export them as portable JSON files at any time.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <span>Ephemeral Processing Only</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you upload a PDF/DOCX for parsing or invoke AI bullet optimization, data is processed in memory or securely deleted temporary files, and never logged or stored permanently.
          </p>
        </div>
      </div>

      <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
        <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Storage Notice & Best Practices</h3>
        <p>
          Because drafts are stored locally inside your browser's IndexedDB, clearing your browser cache or switching devices will not automatically sync your drafts.
        </p>
        <p>
          We strongly advise utilizing the <strong>"Export JSON"</strong> button in the Builder toolbar to archive copies of your resumes on your personal storage.
        </p>
      </div>
    </div>
  );
}
