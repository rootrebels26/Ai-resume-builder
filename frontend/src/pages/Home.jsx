import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Sparkles, CheckCircle2, ShieldCheck, Zap, Download,
  ArrowRight, Star, Target, Database, Laptop, Lock, RefreshCw
} from 'lucide-react';
import { TEMPLATES } from '../constants/templatesList';

export function Home() {
  const featuredTemplates = TEMPLATES.slice(0, 6);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,135,235,0.15),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen AI Resume Architecture • 100% Free & Private</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Build ATS-Winning Resumes <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              In Seconds, Zero Signup.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Create, tailor, and audit your resume with real-time ATS scoring, AI bullet enhancements, and 50+ battle-tested templates. All drafts stay securely in your browser's IndexedDB.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/builder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Create Resume From Scratch</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Upload Existing PDF / DOCX</span>
            </Link>
          </div>

          {/* Privacy badge banner */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Database-Free (Browser Local Storage)
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              No Registration Required
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              ATS Parsable Formats
            </span>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600">Engineered For Impact</h2>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">Everything You Need To Land Interviews</p>
          <p className="text-slate-600 text-sm">
            Designed for software engineers, product managers, executives, and new graduates alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AI Bullet & Summary Enhancer</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Transforms passive duties into quantified STAR-formatted achievement statements with strong action verbs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Automated ATS Auditor</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Real-time scanner detects missing skills, contact formatting flaws, and gives a compatibility score before you submit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">50+ Diverse Templates</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              From pure single-column Harvard ATS to modern developer terminal layouts, switch instantly without losing a single word.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Job Description Tailoring</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Paste target job postings. The system identifies keyword gaps and generates tailored bullets aligned to employer expectations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">PDF & DOCX Extractor</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Upload your old resume in seconds. Our dual-engine PyMuPDF and python-docx parser pre-populates all structured sections.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Pixel-Perfect A4 PDF Export</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Export crisp vector PDFs with zero cut-off, preserved margins, and strict standard print CSS stylesheets.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Templates Showcase */}
      <section className="py-16 bg-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600 mb-1">Curated Designs</h2>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Templates</p>
            </div>
            <Link
              to="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Explore all 50+ templates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                <div className="h-44 bg-slate-50 border-b border-slate-100 p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      {template.badge}
                    </span>
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {template.rating}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-24 h-2 rounded" style={{ backgroundColor: template.accentColor }} />
                    <div className="w-16 h-1.5 bg-slate-300 rounded" />
                    <div className="w-32 h-1 bg-slate-200 rounded mt-2" />
                    <div className="w-28 h-1 bg-slate-200 rounded" />
                  </div>

                  <div className="flex justify-end">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">ID: {template.id}</span>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 group-hover:text-brand-600 transition">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">{template.category} Template</p>
                  </div>
                  <Link
                    to={`/builder?template=${template.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-brand-600 hover:text-white transition"
                  >
                    Use
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Guarantees */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Resume Never Leaves Your Control</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Traditional resume sites lock your data behind accounts, subscriptions, and invasive tracking. AI Resume Builder requires no registration, maintains no cloud database of candidate profiles, and stores drafts in your browser via Dexie.js IndexedDB.
        </p>
        <div>
          <Link
            to="/privacy"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
          >
            <span>Read our complete privacy manifesto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FolderGit2(props) {
  return <FileText {...props} />;
}
function Search(props) {
  return <FileText {...props} />;
}
