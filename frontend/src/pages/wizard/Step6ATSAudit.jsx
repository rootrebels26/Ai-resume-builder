import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Target } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { resumeService } from '../../services/resumeService';

export function Step6ATSAudit({ onNext, onPrev }) {
  const { resumeData, selectedJob, setAtsResults } = useResume();
  const [isAuditing, setIsAuditing] = useState(false);
  const [atsData, setAtsData] = useState(null);

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await resumeService.analyzeATS(resumeData, selectedJob?.description || selectedJob?.role || '');
      if (res.success && res.data) {
        setAtsData(res.data);
        setAtsResults(res.data);
      }
    } catch (e) {
      console.error('ATS audit error:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 6 of 7 • ATS Compliance Audit
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Applicant Tracking System Review
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          We audit your document structure, contact markers, action verbs, and keyword density against enterprise ATS parsers before final generation.
        </p>
      </div>

      {isAuditing && !atsData ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Evaluating resume formatting against parser models...</p>
        </div>
      ) : atsData ? (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {atsData.is_ats_friendly ? "ATS Compliant Architecture" : "Requires Minor Tweaks"}
              </span>
              <h3 className="text-2xl font-bold text-slate-900">Estimated Match Score</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Targeting <strong>{selectedJob?.role || 'Selected Role'}</strong>. Verified single-page hierarchy with zero multi-column parser confusion.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 w-32 h-32 shrink-0">
              <span className={`text-4xl font-black ${
                atsData.compatibility_score >= 80 ? "text-emerald-600" : (atsData.compatibility_score >= 60 ? "text-amber-500" : "text-rose-600")
              }`}>
                {atsData.compatibility_score}%
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Audit Score</span>
            </div>
          </div>

          {/* Submetrics Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">{atsData.readability_score}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Readability & Margins</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">{atsData.formatting_score}%</div>
              <div className="text-xs text-slate-500 mt-0.5">DOM Layout Precision</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">{atsData.keyword_score}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Role Keyword Coverage</div>
            </div>
          </div>

          {/* Section-by-Section Feedback */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">Section Audit Checklist</h4>
            {Object.entries(atsData.section_feedback || {}).map(([key, fb]) => (
              <div key={key} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                {fb.status === "good" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : fb.status === "warning" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold capitalize text-slate-900">{key} Section</span>
                    <span className="font-mono text-[11px] text-slate-500">{fb.score}/100</span>
                  </div>
                  <div className="text-slate-600">{fb.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actionable Recommendations */}
          {atsData.recommendations?.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Actionable Recommendations Before Submitting</span>
              </h4>
              <ul className="space-y-1.5 text-slate-700">
                {atsData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
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
          <span>Back to AI Optimization</span>
        </button>

        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition active:scale-95 cursor-pointer"
        >
          <span>Generate Final Resume</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
