import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Sparkles, CheckCircle2, ShieldCheck, Zap, Download,
  ArrowRight, Target, Lock, RefreshCw, Briefcase, Search, Upload
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  const handleStartCreation = () => {
    navigate('/wizard');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,135,235,0.18),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation AI Resume Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Build Your Career-Ready <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Resume with AI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Target your dream role, enter your real career qualifications, and let our intelligent engine craft an ATS-optimized resume tailored to industry expectations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleStartCreation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Create My Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <Link
              to="/ats-checker"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-brand-400" />
              <span>Check ATS Score</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Free Core Features</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Privacy-First & No Registration</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Browser IndexedDB Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — 4 Clear Steps */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">
            The Intelligent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How The Resume Platform Works
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            No filling out generic forms blindly. Every step connects directly to your target role and real accomplishments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative space-y-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">1</span>
            <h3 className="font-bold text-sm text-slate-900">Select Design Style</h3>
            <p className="text-slate-600 leading-relaxed">
              Choose your clean typographic layout upfront. Switch anytime later with zero data loss.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative space-y-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">2</span>
            <h3 className="font-bold text-sm text-slate-900">Target Job Description</h3>
            <p className="text-slate-600 leading-relaxed">
              Select your target role or paste the exact job posting. AI extracts required skills and keywords.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative space-y-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">3</span>
            <h3 className="font-bold text-sm text-slate-900">Add Real Qualifications</h3>
            <p className="text-slate-600 leading-relaxed">
              Enter details with our guided split-screen form or upload an existing PDF/DOCX to pre-populate.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative space-y-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">4</span>
            <h3 className="font-bold text-sm text-slate-900">AI Optimize & Download</h3>
            <p className="text-slate-600 leading-relaxed">
              Review 27 ATS checks, approve tailored STAR bullet points, and export a clean A4 PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section (Replaces Templates on Home) */}
      <section className="py-20 bg-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Built for Modern Careers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Engineered for Recruiters & Machine Parsers
            </h2>
            <p className="text-slate-600 text-sm">
              Everything you need to create a high-impact job application without paying subscriptions or compromising your privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Intelligent AI Writing Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transform rough notes into high-impact STAR achievement bullets with action verbs. Generates role-specific professional summaries without fabricating unverified claims.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">27-Check Transparent ATS Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time compliance check across structure, formatting hygiene, keyword density, action verb strength, and fair hiring rules with actionable remediation advice.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">100% Privacy & Local Storage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your career data never leaves your device unprompted. All drafts, job postings, and resumes save directly to your browser's IndexedDB. No server database required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ready to Build Your Career-Ready Resume?
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
          Start building now with real-time A4 preview, intelligent bullet enhancements, and instant PDF download.
        </p>
        <div>
          <button
            onClick={handleStartCreation}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create My Resume Now</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
