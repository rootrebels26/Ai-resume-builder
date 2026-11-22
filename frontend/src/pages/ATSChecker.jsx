import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useResume } from '../context/ResumeContext';

export function ATSChecker() {
  const { resumeData } = useResume();
  const [atsResult, setAtsResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const res = await resumeService.analyzeATS(resumeData, jobDescription);
      if (res.success && res.data) {
        setAtsResult(res.data);
      }
    } catch (e) {
      console.error('ATS check failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, [resumeData]);

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Compliance & Parsing Audit</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ATS Compatibility Auditor</h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Applicant Tracking Systems filter out non-compliant resumes before human recruiters see them. Our auditor checks structure, section markers, contact validity, and keyword presence.
        </p>
      </div>

      {isLoading && !atsResult ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs text-slate-500">Performing comprehensive ATS compliance evaluation...</p>
        </div>
      ) : atsResult ? (
        <div className="space-y-6">
          {/* Main Score Hero Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {atsResult.is_ats_friendly ? "ATS Compliant" : "Needs Optimization"}
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Estimated Compatibility</h2>
              <p className="text-xs text-slate-500 max-w-md">
                Heuristic scoring evaluated against industry standard parsers (Workday, Greenhouse, Lever format models).
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 w-32 h-32">
              <span className={`text-4xl font-extrabold ${
                atsResult.compatibility_score >= 80 ? "text-emerald-600" : (atsResult.compatibility_score >= 60 ? "text-amber-500" : "text-rose-600")
              }`}>
                {atsResult.compatibility_score}%
              </span>
              <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mt-1">Audit Score</span>
            </div>
          </div>

          {/* Metric Sub-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">{atsResult.readability_score}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Readability & Spacing</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">{atsResult.formatting_score}%</div>
              <div className="text-xs text-slate-500 mt-0.5">DOM Layout Precision</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-2xl font-bold text-slate-900">{atsResult.keyword_score}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Core Keyword Density</div>
            </div>
          </div>

          {/* Section Feedbacks */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Section Analysis</h3>
            <div className="space-y-3">
              {Object.entries(atsResult.section_feedback || {}).map(([key, feedback]) => (
                <div key={key} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-3">
                  {feedback.status === "good" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : feedback.status === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 text-xs flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold capitalize text-slate-900">{key} Section</span>
                      <span className="font-mono text-[11px] text-slate-500">{feedback.score}/100</span>
                    </div>
                    <div className="text-slate-600">{feedback.message}</div>
                    {feedback.details && feedback.details.length > 0 && (
                      <ul className="text-[11px] text-slate-500 list-disc list-inside mt-1">
                        {feedback.details.map((d, dIdx) => (
                          <li key={dIdx}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          {atsResult.recommendations && atsResult.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Recommended Steps</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {atsResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition"
            >
              <span>Edit Resume in Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
