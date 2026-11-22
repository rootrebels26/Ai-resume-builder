import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RefreshCw, Loader2, Check, X, Edit3, ShieldAlert } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { resumeService } from '../../services/resumeService';

export function Step5AIOptimization({ onNext, onPrev }) {
  const { resumeData, selectedJob, updateSummary, updateItemInSection, setOptimizationResults } = useResume();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationData, setOptimizationData] = useState(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState({});
  const [rejectedSuggestions, setRejectedSuggestions] = useState({});
  const [editedText, setEditedText] = useState({});

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const jdText = selectedJob?.description || `Position for ${selectedJob?.role || 'Senior Professional'}`;
      const res = await resumeService.tailorResume(resumeData, jdText, selectedJob?.role);
      if (res.success && res.data) {
        setOptimizationData(res.data);
        setOptimizationResults(res.data);
      }
    } catch (e) {
      console.error('Optimization error:', e);
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, []);

  const handleAcceptSummary = (tailoredSummary) => {
    updateSummary(tailoredSummary);
    setAcceptedSuggestions(prev => ({ ...prev, summary: true }));
    setRejectedSuggestions(prev => ({ ...prev, summary: false }));
  };

  const handleRejectSummary = () => {
    setRejectedSuggestions(prev => ({ ...prev, summary: true }));
    setAcceptedSuggestions(prev => ({ ...prev, summary: false }));
  };

  const handleAcceptBullet = (targetId, tailoredText, idx) => {
    const key = `bullet_${targetId || idx}`;
    if (resumeData.experience.length > 0) {
      const exp = resumeData.experience[0];
      const newResp = [...exp.responsibilities];
      newResp[0] = tailoredText;
      updateItemInSection('experience', exp.id, { responsibilities: newResp });
    }
    setAcceptedSuggestions(prev => ({ ...prev, [key]: true }));
    setRejectedSuggestions(prev => ({ ...prev, [key]: false }));
  };

  const handleRejectBullet = (targetId, idx) => {
    const key = `bullet_${targetId || idx}`;
    setRejectedSuggestions(prev => ({ ...prev, [key]: true }));
    setAcceptedSuggestions(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 5 of 7 • AI Resume Optimization
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Job-Specific Content Optimization
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          AI aligns your real qualifications with the expectations of <strong>{selectedJob?.role || 'your target role'}</strong>. Review, accept, or reject every recommendation below.
        </p>
      </div>

      {isOptimizing && !optimizationData ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Analyzing qualifications against job requirements...</p>
          <p className="text-[11px] text-slate-400">Preserving factual claims • Zero hallucinations</p>
        </div>
      ) : optimizationData ? (
        <div className="space-y-6">
          {/* Summary Optimization Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                1. Professional Summary Calibration
              </span>
              {acceptedSuggestions.summary && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <Check className="w-3.5 h-3.5" /> Accepted & Applied
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Original Text</span>
                <p className="text-slate-700 leading-relaxed">
                  {resumeData.professionalSummary || 'No summary entered yet.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-200 space-y-1">
                <span className="font-bold text-brand-700 uppercase text-[10px]">AI Job-Targeted Optimization</span>
                <p className="text-slate-900 leading-relaxed font-medium">
                  {optimizationData.tailored_summary}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleRejectSummary}
                className={`px-3 py-1.5 rounded-lg border font-semibold text-xs cursor-pointer ${
                  rejectedSuggestions.summary ? "bg-slate-200 text-slate-700 border-slate-300" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Keep Original
              </button>
              <button
                onClick={() => handleAcceptSummary(optimizationData.tailored_summary)}
                className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-white font-semibold text-xs shadow-2xs cursor-pointer ${
                  acceptedSuggestions.summary ? "bg-emerald-600" : "bg-brand-600 hover:bg-brand-500"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Suggestion</span>
              </button>
            </div>
          </div>

          {/* Experience Bullets Optimization */}
          {optimizationData.suggestions && optimizationData.suggestions.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
                2. Experience Bullet Point Enhancements (STAR Method)
              </h3>

              {optimizationData.suggestions.map((sug, idx) => {
                const key = `bullet_${sug.target_id || idx}`;
                const isAccepted = acceptedSuggestions[key];

                return (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                    <div className="text-[11px] text-slate-500 italic">
                      Why: {sug.reason}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white border border-slate-200">
                        <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Before:</span>
                        <p className="text-slate-600">{sug.original_text}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
                        <span className="font-bold text-brand-700 uppercase text-[10px] block mb-1">After (Targeted):</span>
                        <p className="text-slate-900 font-medium">{sug.tailored_text}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRejectBullet(sug.target_id, idx)}
                        className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptBullet(sug.target_id, sug.tailored_text, idx)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-white text-xs font-semibold cursor-pointer ${
                          isAccepted ? "bg-emerald-600" : "bg-brand-600 hover:bg-brand-500"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept Bullet</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Genuine Skill Gaps & Honesty Notice */}
          {optimizationData.recommended_skills_to_add && optimizationData.recommended_skills_to_add.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Zero Hallucination Rule • Identified Skill Gaps</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The job posting seeks proficiency in: <strong>{optimizationData.recommended_skills_to_add.join(', ')}</strong>.
                We have <em>not</em> added these automatically. Only add skills you have verified practical experience with.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Information</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition active:scale-95 cursor-pointer"
        >
          <span>Continue to ATS Audit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
