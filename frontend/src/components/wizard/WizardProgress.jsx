import React from 'react';
import { Check, Sparkles, FolderGit2, Briefcase, FileText, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { TEMPLATES } from '../../constants/templatesList';

const WIZARD_STEPS = [
  { step: 1, label: "Template", icon: FolderGit2 },
  { step: 2, label: "Target Job", icon: Briefcase },
  { step: 3, label: "Method", icon: FileText },
  { step: 4, label: "Information", icon: FileText },
  { step: 5, label: "AI Optimize", icon: Sparkles },
  { step: 6, label: "ATS Audit", icon: CheckCircle2 },
  { step: 7, label: "Final Resume", icon: Download },
];

export function WizardProgress() {
  const { currentStep, setWizardStep, selectedTemplateId, selectedJob, saveStatus, resetWizard } = useResume();
  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top contextual metadata banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Workflow:</span>
            
            {/* Selected Template Badge */}
            {activeTemplate && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium border border-slate-200">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTemplate.accentColor }} />
                <span>Template: <strong>{activeTemplate.name}</strong></span>
              </span>
            )}

            {/* Selected Job Badge */}
            {selectedJob?.role && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 font-medium border border-brand-200">
                <Briefcase className="w-3 h-3 text-brand-600" />
                <span>Target: <strong>{selectedJob.role}</strong> {selectedJob.company ? `@ ${selectedJob.company}` : ''}</span>
              </span>
            )}
            {selectedJob?.isSkipped && (
              <span className="text-[11px] text-slate-400 italic">General Resume (Job targeting skipped)</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
              {saveStatus === 'saving' ? 'Saving to IndexedDB...' : 'Draft Saved Locally'}
            </span>
            <button
              onClick={() => {
                if (window.confirm("Start over from Step 1? Your current draft will be reset.")) {
                  resetWizard();
                }
              }}
              title="Reset Wizard"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Step indicator breadcrumbs */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
          {WIZARD_STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            const Icon = s.icon;

            return (
              <React.Fragment key={s.step}>
                <button
                  onClick={() => {
                    // Allow navigating to any prior step or adjacent step
                    if (s.step <= currentStep + 1) {
                      setWizardStep(s.step);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isCurrent
                      ? "bg-brand-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? "bg-white text-brand-700"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : s.step}
                  </span>
                  <span>{s.label}</span>
                </button>

                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`h-0.5 w-4 sm:w-8 shrink-0 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
