import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Sparkles, CheckCircle2, Search, ShieldCheck, FolderGit2 } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

export function Navbar() {
  const location = useLocation();
  const { saveStatus } = useResume();

  const navLinks = [
    { to: "/builder", label: "Builder", icon: FileText },
    { to: "/templates", label: "Templates", icon: FolderGit2 },
    { to: "/upload", label: "Upload & Parse", icon: Sparkles },
    { to: "/job-analyzer", label: "Job Match", icon: Search },
    { to: "/ats-checker", label: "ATS Audit", icon: CheckCircle2 },
    { to: "/privacy", label: "Privacy", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="tracking-tight">
            AI Resume<span className="text-brand-600">Builder</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
            Free & Private
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side status indicator & CTAs */}
        <div className="flex items-center gap-3">
          {location.pathname.startsWith('/builder') && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className={`w-2 h-2 rounded-full ${
                saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
              }`} />
              <span className="capitalize">{saveStatus === 'saving' ? 'Saving...' : 'Draft Saved'}</span>
            </div>
          )}

          <Link
            to="/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Builder</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
