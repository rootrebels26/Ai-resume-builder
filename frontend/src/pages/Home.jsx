import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Sparkles, CheckCircle2, ShieldCheck, Zap, Download,
  ArrowRight, Star, Target, Lock, RefreshCw, Briefcase, Eye
} from 'lucide-react';
import { TEMPLATES, TOTAL_TEMPLATES_COUNT } from '../constants/templatesList';
import { useResume } from '../context/ResumeContext';
import { TemplateDraftCard } from '../components/templates/TemplateDraftCard';
import { TemplateQuickPreviewModal } from '../components/templates/TemplateQuickPreviewModal';

export function Home() {
  const navigate = useNavigate();
  const { setWizardStep, selectTemplate, selectedTemplateId } = useResume();
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  // Pick 4 diverse, stunning featured templates across ATS, Modern, Developer, and Data
  const featuredTemplates = [
    TEMPLATES.find(t => t.id === 'ats-01') || TEMPLATES[0],
    TEMPLATES.find(t => t.id === 'modern-01') || TEMPLATES[1],
    TEMPLATES.find(t => t.id === 'developer-01') || TEMPLATES[2],
    TEMPLATES.find(t => t.id === 'data-01') || TEMPLATES[3],
  ];

  const handleStartCreation = () => {
    navigate('/onboarding#1');
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation AI Resume Platform</span>
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
              <span>Explore {TOTAL_TEMPLATES_COUNT}+ Templates</span>
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
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">
            The Intelligent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How The Resume Platform Works
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            No filling out generic forms blindly. Every step is tied directly to your selected design and target career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center mb-3">1</span>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Select Template First</h3>
            <p className="text-slate-600 leading-relaxed">
              Browse {TOTAL_TEMPLATES_COUNT} templates across ATS, Modern, Tech, Data, Executive, and Student categories. Choose your visual style upfront.
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

      {/* Featured Templates Showcase with Real Visual Drafts */}
      <section className="py-16 bg-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-brand-600 mb-1">Authentic Designs</h2>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Templates ({TOTAL_TEMPLATES_COUNT} Designs)</p>
            </div>
            <Link
              to="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Browse all categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTemplates.map((template) => (
              <TemplateDraftCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onSelect={handleSelectTemplateCard}
                onOpenPreview={(tpl) => setPreviewTemplate(tpl)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* High-Resolution Quick Preview Modal */}
      <TemplateQuickPreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(templateId) => {
          handleSelectTemplateCard(templateId);
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
}
