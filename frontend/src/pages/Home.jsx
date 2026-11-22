import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Sparkles, CheckCircle2, ShieldCheck, Zap, Download,
  ArrowRight, Star, Target, Lock, RefreshCw, Briefcase, Eye
} from 'lucide-react';
import { TEMPLATES } from '../constants/templatesList';
import { useResume } from '../context/ResumeContext';

export function Home() {
  const navigate = useNavigate();
  const { setWizardStep, selectTemplate } = useResume();
  const featuredTemplates = TEMPLATES.slice(0, 6);

  const handleStartCreation = () => {
    setWizardStep(1);
    navigate('/wizard');
  };

  const handleSelectTemplateCard = (templateId) => {
    selectTemplate(templateId);
    setWizardStep(2); // Immediately advance to Target Job
    navigate('/wizard');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,135,235,0.18),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Template-First • Job-Targeted • Privacy-First</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Build Your Career-Ready <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Resume with AI
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Choose a professional template, select your dream job, and let AI help you create a tailored resume that highlights your real skills and experience.
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
              to="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <span>Explore Templates</span>
            </Link>
          </div>

          {/* Value props */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Privacy (IndexedDB Browser Storage)
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              Zero Sign-Up Required
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              50+ ATS-Optimized Templates
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Sequential Workflow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600">The Template-First Workflow</h2>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">How AI Resume Builder Works</p>
          <p className="text-slate-600 text-sm">
            No filling out generic forms blindly. Every step is tied directly to your selected design and target career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">1</span>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Select Template First</h3>
            <p className="text-slate-600 leading-relaxed">
              Browse 50+ templates across ATS, Modern, Tech, Data, Executive, and Student categories. Choose your visual style upfront.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">2</span>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Target Job Description</h3>
            <p className="text-slate-600 leading-relaxed">
              Select your target role or paste the exact job posting. AI extracts required skills, soft skills, and keywords.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">3</span>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Add Real Qualifications</h3>
            <p className="text-slate-600 leading-relaxed">
              Enter details with our 10-step guided form or upload an existing PDF/DOCX to pre-populate sections in seconds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">4</span>
            <h3 className="font-bold text-sm text-slate-900 mb-1">AI Optimize & Download</h3>
            <p className="text-slate-600 leading-relaxed">
              Review ATS compatibility, approve tailored STAR bullet recommendations, and export a pixel-perfect A4 PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Templates Showcase */}
      <section className="py-16 bg-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600 mb-1">Step 1 Preview</h2>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Templates (65+ Designs)</p>
            </div>
            <Link
              to="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Browse all categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-50 border-b border-slate-100 p-4 flex flex-col justify-between relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {template.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {template.rating}
                    </span>
                  </div>

                  <div className="space-y-1.5 p-2 bg-white rounded border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: template.accentColor }} />
                      <div className="w-20 h-2 bg-slate-800 rounded" />
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded" />
                    <div className="w-4/5 h-1 bg-slate-200 rounded" />
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span>{template.id}</span>
                    <span className="capitalize">{template.category}</span>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition">
                      {template.name}
                    </h3>
                    <p className="text-xs text-slate-500">{template.layout}</p>
                  </div>
                  <button
                    onClick={() => handleSelectTemplateCard(template.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white transition cursor-pointer"
                  >
                    Select & Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Privacy-First Architecture</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Your career data belongs to you. We maintain zero database servers. All drafts, job comparisons, and customized templates are stored exclusively in your browser's IndexedDB sandbox.
        </p>
        <div>
          <button
            onClick={handleStartCreation}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Launch Resume Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
