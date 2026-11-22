import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, FileText, Upload, Target, ArrowRight, ArrowLeft,
  Check, Star, Briefcase, GraduationCap, Award, Compass, ShieldCheck
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { TEMPLATES } from '../constants/templatesList';
import { TemplateDraftPaper } from '../components/templates/TemplateDraftPaper';

const GOALS = [
  {
    id: 'scratch',
    title: 'Create a brand new resume',
    desc: 'Start with our guided AI writer and select from 65+ modern and ATS-proven templates.',
    icon: Sparkles,
    badge: 'Most Popular',
    method: 'scratch'
  },
  {
    id: 'upload',
    title: 'Upload & improve my existing resume',
    desc: 'Upload your current PDF or DOCX. Our engine extracts all fields and enhances your bullet points.',
    icon: Upload,
    badge: 'Fastest (2 min)',
    method: 'upload'
  },
  {
    id: 'target',
    title: 'Target a specific job description',
    desc: 'Paste a job posting to match keywords, pass ATS filters, and tailor your real experience.',
    icon: Target,
    badge: 'High Conversion',
    method: 'target'
  }
];

const POPULAR_ROLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'AI / ML Engineer',
  'Financial Analyst',
  'Marketing Specialist',
  'Business Analyst'
];

const SENIORITY_LEVELS = [
  { id: 'student', label: 'Student / Fresher', desc: '0 years • Highlighting education, projects, and internships' },
  { id: 'entry', label: 'Entry-Level', desc: '1–2 years • Early career professional' },
  { id: 'mid', label: 'Mid-Level', desc: '3–5 years • Proven contributor with measurable achievements' },
  { id: 'senior', label: 'Senior Professional', desc: '6–9 years • Deep technical expertise and leadership' },
  { id: 'executive', label: 'Lead / Executive', desc: '10+ years • Strategic vision, P&L, and team management' }
];

export function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectTemplate,
    selectedTemplateId,
    setSelectedJob,
    setCreationMethod,
    setWizardStep
  } = useResume();

  // Determine current screen from hash (#1, #2, #3) or state
  const getInitialStep = () => {
    const hash = window.location.hash;
    if (hash === '#2') return 2;
    if (hash === '#3') return 3;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep);
  const [selectedGoal, setSelectedGoal] = useState('scratch');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [seniority, setSeniority] = useState('mid');
  const [localTemplateId, setLocalTemplateId] = useState(selectedTemplateId || 'ats-01');

  // Sync hash with step
  useEffect(() => {
    window.location.hash = `#${step}`;
  }, [step]);

  // Recommended templates based on seniority
  const recommendedTemplates = React.useMemo(() => {
    if (seniority === 'student') {
      return TEMPLATES.filter(t => t.category === 'student' || t.category === 'ats').slice(0, 4);
    }
    if (seniority === 'executive') {
      return TEMPLATES.filter(t => t.category === 'executive' || t.category === 'modern').slice(0, 4);
    }
    if (targetRole.toLowerCase().includes('data')) {
      return TEMPLATES.filter(t => t.category === 'data' || t.category === 'modern').slice(0, 4);
    }
    if (targetRole.toLowerCase().includes('ai') || targetRole.toLowerCase().includes('ml')) {
      return TEMPLATES.filter(t => t.category === 'aiml' || t.category === 'developer').slice(0, 4);
    }
    return [
      TEMPLATES.find(t => t.id === 'ats-01') || TEMPLATES[0],
      TEMPLATES.find(t => t.id === 'modern-01') || TEMPLATES[1],
      TEMPLATES.find(t => t.id === 'developer-01') || TEMPLATES[2],
      TEMPLATES.find(t => t.id === 'minimalist-01') || TEMPLATES[3]
    ];
  }, [seniority, targetRole]);

  const handleFinishOnboarding = () => {
    // 1. Commit template
    selectTemplate(localTemplateId);

    // 2. Commit target job
    setSelectedJob({
      role: targetRole,
      company: '',
      jobDescription: '',
      experienceLevel: seniority
    });

    // 3. Commit creation method
    setCreationMethod(selectedGoal === 'upload' ? 'upload' : 'scratch');

    // 4. Navigate into wizard at appropriate step
    if (selectedGoal === 'upload') {
      setWizardStep(3); // Upload screen
    } else {
      setWizardStep(4); // Direct into Split-Screen Live Builder!
    }
    navigate('/wizard');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Enhancv Progress Bar */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="font-semibold text-white">Resume Studio Onboarding</span>
          </div>
          <span className="font-mono text-slate-400">Step {step} of 3</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-brand-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-brand-500' : 'bg-slate-800'}`} />
          <div className={`h-1.5 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-brand-500' : 'bg-slate-800'}`} />
        </div>
      </div>

      {/* Main Step Content Container */}
      <div className="max-w-3xl mx-auto w-full my-8">
        {/* ================= STEP 1: GOAL / INTENT ================= */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Enhancv Guided Experience • Step 1
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                What brings you to Resume Studio today?
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Select your primary goal to help us personalize your workspace, AI assistant, and templates.
              </p>
            </div>

            {/* Interactive Goal Cards */}
            <div className="grid grid-cols-1 gap-4">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;

                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 group ${
                      isSelected
                        ? 'bg-slate-800/90 border-brand-500 ring-2 ring-brand-500/30 shadow-lg'
                        : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300 group-hover:text-white'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-base text-white group-hover:text-brand-300 transition">
                          {goal.title}
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                          {goal.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {goal.desc}
                      </p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 transition ${
                      isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: TARGET ROLE & SENIORITY ================= */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Enhancv Guided Experience • Step 2
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                What role and experience level are you targeting?
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                This enables our AI engine to tailor bullet points and suggest industry keywords matching your seniority.
              </p>
            </div>

            {/* Target Role Input & Chips */}
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/80 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Target Job Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              {/* Popular Role Chips */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400">Popular roles:</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        targetRole === role
                          ? 'bg-brand-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seniority Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Experience Seniority Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SENIORITY_LEVELS.map((lvl) => {
                  const isSelected = seniority === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSeniority(lvl.id)}
                      className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-brand-500 ring-1 ring-brand-500/40 text-white'
                          : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="font-bold text-xs text-white flex items-center justify-between">
                        <span>{lvl.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{lvl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TEMPLATE SELECTION ================= */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Enhancv Guided Experience • Step 3
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Pick your foundation template
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Recommended based on your target role ({targetRole}) and seniority ({seniority}). You can switch templates anytime in the live builder without retyping.
              </p>
            </div>

            {/* 4 Recommended Authentic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedTemplates.map((tpl) => {
                const isSelected = localTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setLocalTemplateId(tpl.id)}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-slate-800 border-brand-500 ring-2 ring-brand-500/30 shadow-xl'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Top Bar */}
                    <div className="px-3 py-2 flex items-center justify-between border-b border-slate-700 text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-brand-400 truncate">
                        {tpl.badge}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{tpl.rating}</span>
                      </div>
                    </div>

                    {/* Miniature Paper Sheet */}
                    <div className="p-3 bg-slate-900/80 flex items-center justify-center">
                      <div className="w-full max-w-[160px] aspect-[210/297] rounded-sm bg-white shadow-md overflow-hidden transform transition-transform group-hover:scale-105">
                        <TemplateDraftPaper template={tpl} />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-3 bg-slate-800 space-y-1">
                      <div className="font-bold text-xs text-white truncate">{tpl.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{tpl.layout}</div>
                      <div className="pt-2">
                        <span className={`w-full py-1 rounded-lg text-center block text-[11px] font-semibold transition ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {isSelected ? '✓ Selected' : 'Choose Design'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="max-w-3xl mx-auto w-full pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy-First • No Account Required</span>
          </div>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Split-Screen Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
