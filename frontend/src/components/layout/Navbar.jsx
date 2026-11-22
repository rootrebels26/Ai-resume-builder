import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Sparkles, CheckCircle2, Search, ShieldCheck, FolderGit2 } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

export function Navbar() {
  const location = useLocation();
  const { saveStatus, currentStep, setWizardStep } = useResume();

  const navLinks = [
    { to: "/wizard", label: "Resume Wizard", icon: Sparkles },
    { to: "/templates", label: "50+ Templates", icon: FolderGit2 },
    { to: "/job-analyzer", label: "Job Match", icon: Search },
    { to: "/ats-checker", label: "ATS Audit", icon: CheckCircle2 },
    { to: "/upload", label: "Upload & Parse", icon: FileText },
    { to: "/privacy", label: "Privacy", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="tracking-tight">
            AI Resume<span className="text-brand-600">Builder</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
            Template-First
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side CTAs */}
        <div className="flex items-center gap-3">
          <Link
            to="/wizard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-500 transition shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Resume Wizard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
