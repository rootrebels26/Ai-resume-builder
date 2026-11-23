import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft,
  Loader2, Sparkles, Target, ShieldCheck, ChevronDown, ChevronUp, Filter
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { resumeService } from '../../services/resumeService';

const CATEGORIES = [
  'All (27 Checks)',
  'ATS Essentials',
  'Resume Structure',
  'Content Quality',
  'Job Matching',
  'Recruiter Readiness',
  'Fairness and Consistency',
  'Career Impact'
];

export function Step6ATSAudit({ onNext, onPrev }) {
  const { resumeData, selectedJob, setAtsResults } = useResume();
  const [isAuditing, setIsAuditing] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All (27 Checks)');
  const [expandedCheck, setExpandedCheck] = useState(null);

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await resumeService.analyzeATS(
        resumeData,
        selectedJob?.jobDescription || selectedJob?.role || ''
      );
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

  const filteredChecks = React.useMemo(() => {
    if (!atsData?.detailed_checks) return [];
    if (selectedCategory === 'All (27 Checks)') return atsData.detailed_checks;
    return atsData.detailed_checks.filter(c => c.category === selectedCategory);
  }, [atsData, selectedCategory]);

  const passedChecks = atsData?.detailed_checks?.filter(c => c.status === 'pass').length || 0;
  const warningChecks = atsData?.detailed_checks?.filter(c => c.status === 'warning').length || 0;
  const failChecks = atsData?.detailed_checks?.filter(c => c.status === 'fail').length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 6 of 7 • Comprehensive 27-Check ATS Audit
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Applicant Tracking System Review
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          We audit your document against 27 transparent checks across 7 categories: Essentials, Structure, Content, Matching, Recruiter Readiness, Fairness, and Career Impact.
        </p>
      </div>

      {isAuditing && !atsData ? (
        <div className="py-20 text-center space-y-3 card-surface">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Evaluating 27 algorithmic checks across resume sections...</p>
        </div>
      ) : atsData ? (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="card-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {atsData.is_ats_friendly ? "ATS Certified Architecture" : "Requires Minor Optimizations"}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">Overall ATS Score: {atsData.compatibility_score}/100</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Targeting <strong>{selectedJob?.role || 'Selected Role'}</strong>. Verified {passedChecks} passed, {warningChecks} optimizations, and {failChecks} critical items out of 27 checks.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-200/90 w-32 h-32 shrink-0 shadow-2xs">
              <span className={`text-4xl font-black ${
                atsData.compatibility_score >= 80 ? "text-emerald-600" : (atsData.compatibility_score >= 60 ? "text-amber-500" : "text-rose-600")
              }`}>
                {atsData.compatibility_score}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Audit Score</span>
            </div>
          </div>

          {/* Submetrics Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="card-surface p-4.5 space-y-1">
              <div className="text-2xl font-extrabold text-slate-900">{atsData.readability_score}%</div>
              <div className="text-xs text-slate-500 font-medium">Readability & Action Verbs</div>
            </div>
            <div className="card-surface p-4.5 space-y-1">
              <div className="text-2xl font-extrabold text-slate-900">{atsData.formatting_score}%</div>
              <div className="text-xs text-slate-500 font-medium">Structure & Layout Precision</div>
            </div>
            <div className="card-surface p-4.5 space-y-1">
              <div className="text-2xl font-extrabold text-slate-900">{atsData.keyword_score}%</div>
              <div className="text-xs text-slate-500 font-medium">Job Keyword Coverage</div>
            </div>
          </div>

          {/* 27-Check Inspector with Filter Pills */}
          <div className="card-surface p-6 sm:p-7 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">27-Check Transparent ATS Breakdown</h4>
                <p className="text-slate-500 text-[11px]">Inspect the exact findings, evidence, and remediation for every rule.</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-emerald-600 font-bold">{passedChecks} Passed</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600 font-bold">{warningChecks} Warnings</span>
                <span className="text-slate-300">•</span>
                <span className="text-rose-600 font-bold">{failChecks} Fails</span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Checks Accordion List */}
            <div className="space-y-2 pt-2">
              {filteredChecks.map((check) => {
                const isExpanded = expandedCheck === check.id;

                return (
                  <div
                    key={check.id}
                    className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/60 transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/60 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {check.status === 'pass' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {check.status === 'warning' && (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        {check.status === 'fail' && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}

                        <div className="truncate">
                          <span className="font-mono text-[10px] text-slate-400 mr-2">#{check.id}</span>
                          <span className="font-bold text-slate-900 text-xs">{check.name}</span>
                          <span className="ml-2 text-[10px] text-slate-400">({check.category})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          check.status === 'pass'
                            ? 'bg-emerald-100 text-emerald-800'
                            : check.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {check.status}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 py-3 bg-white border-t border-slate-200 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-700">Explanation: </span>
                          <span className="text-slate-600">{check.explanation}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Evidence from Resume: </span>
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {check.evidence}
                          </span>
                        </div>
                        {check.recommended_fix && (
                          <div className="pt-1 text-brand-600 font-medium">
                            <span className="font-bold">Recommended Action: </span>
                            {check.recommended_fix}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actionable Recommendations Summary */}
          {atsData.recommendations?.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Priority Recommendations Before Applying</span>
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
          className="btn-secondary py-2 px-4 text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to AI Optimization</span>
        </button>

        <button
          onClick={onNext}
          className="btn-primary py-2 px-5 text-xs shadow-sm"
        >
          <span>Generate Final Resume</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
