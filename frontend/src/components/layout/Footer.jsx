import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, FileText, CheckCircle2, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 no-print mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>AI Resume Builder</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Privacy-first, database-free resume builder with ATS scoring and 50+ professional templates. Your data remains in your browser.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero server database storage</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/builder" className="hover:text-white transition">Resume Builder</Link></li>
              <li><Link to="/templates" className="hover:text-white transition">50+ Resume Templates</Link></li>
              <li><Link to="/upload" className="hover:text-white transition">PDF & DOCX Parser</Link></li>
              <li><Link to="/job-analyzer" className="hover:text-white transition">Job Description Analyzer</Link></li>
              <li><Link to="/ats-checker" className="hover:text-white transition">ATS Compatibility Checker</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Templates</h4>
            <ul className="space-y-2">
              <li><Link to="/templates?cat=ats" className="hover:text-white transition">ATS-Friendly (10)</Link></li>
              <li><Link to="/templates?cat=modern" className="hover:text-white transition">Modern Professional (10)</Link></li>
              <li><Link to="/templates?cat=minimalist" className="hover:text-white transition">Minimalist (10)</Link></li>
              <li><Link to="/templates?cat=developer" className="hover:text-white transition">Software Engineer (5)</Link></li>
              <li><Link to="/templates?cat=executive" className="hover:text-white transition">Executive & Leadership (5)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Guarantees</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>100% Free Core Features</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>No Account Registration Required</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Instant High-Fidelity PDF Export</span>
              </li>
              <li><Link to="/privacy" className="text-brand-400 hover:underline">Read Privacy Statement</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} AI Resume Builder. Open source & privacy oriented.
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            Built for job seekers worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}
