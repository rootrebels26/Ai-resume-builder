import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Sparkles, FolderGit2, CheckCircle2, Search, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { TOTAL_TEMPLATES_COUNT } from '../../constants/templatesList';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { saveStatus } = useResume();

  const navLinks = [
    { to: "/onboarding", label: "Onboarding Flow", icon: Sparkles },
    { to: "/wizard", label: "Resume Studio", icon: FileText },
    { to: "/templates", label: `Templates (${TOTAL_TEMPLATES_COUNT})`, icon: FolderGit2 },
    { to: "/ats-checker", label: "ATS Scanner", icon: CheckCircle2 },
    { to: "/privacy", label: "Privacy", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo - Clean, Senior, No Clunky Badges */}
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-base sm:text-lg text-slate-900 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <span className="tracking-tight text-slate-900">
            Resume<span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Studio</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                  isActive
                    ? "bg-slate-100 text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status & Action */}
        <div className="flex items-center gap-3">
          {/* Subtle Local Storage & Privacy Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local & Private (IndexedDB)</span>
          </div>

          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Start Building</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden transition cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-100 text-brand-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Local IndexedDB Storage
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
