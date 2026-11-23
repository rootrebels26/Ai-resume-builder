import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck,
  RefreshCw, Loader2, Sparkles, Search, Target
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useResume } from '../context/ResumeContext';

export function ATSChecker() {
  const { resumeData } = useResume();
  const [atsResult, setAtsResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(resumeData?.personalInfo?.professionalTitle || "");

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
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Header Banner matching Figma */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="eyebrow-tag justify-center">
            <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
            <span>27-POINT AUDIT • APPLICANT TRACKING SYSTEMS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            ATS Compatibility Auditor.{' '}
            <span className="editorial-italic text-[1.12em]">Live scan.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Verify structural formatting, section markers, contact validity, and keyword alignment against enterprise parsers (Workday, Greenhouse, Lever).
          </p>
        </div>

        {/* Optional Target Job Testing Box */}
        <div className="card-surface p-5 sm:p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <Target className="w-4 h-4 text-editorial-violet" />
              <span>Target Job Calibration (Optional)</span>
            </div>
            <button
              onClick={runAudit}
              disabled={isLoading}
              className="btn-volt py-1.5 px-3 text-xs shadow-brutal-sm"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Re-Run Audit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="label-base">Target Role</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-base">Job Description (For keyword matching)</label>
              <input
                type="text"
                placeholder="Paste key requirements or job description snippets..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="input-base"
              />
            </div>
          </div>
        </div>

        {/* Audit State */}
        {isLoading && !atsResult ? (
          <div className="card-surface py-20 text-center space-y-4 bg-white">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-ink/20 border-t-volt animate-spin flex items-center justify-center">
                <Search className="w-6 h-6 text-ink" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-ink">Auditing Resume Structure</p>
              <p className="text-xs text-ink-muted">Evaluating formatting, standard headings, and ATS readability...</p>
            </div>
          </div>
        ) : atsResult ? (
          <div className="space-y-6">
            {/* Main Score Hero Card */}
            <div className="card-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white">
              <div className="space-y-2 text-center sm:text-left">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-ink ${
                  atsResult.is_ats_friendly
                    ? 'bg-volt text-ink shadow-brutal-sm'
                    : 'bg-editorial-coral text-ink shadow-brutal-sm'
                }`}>
                  {atsResult.is_ats_friendly ? "ATS Certified Format" : "Needs Minor Tweaks"}
                </span>
                <h2 className="text-2xl font-extrabold text-ink">
                  Compatibility Score: {atsResult.compatibility_score}%
                </h2>
                <p className="text-xs text-ink-secondary max-w-md leading-relaxed">
                  Evaluated against single-column parsing, standard section headers, legible contact hierarchy, and keyword frequency.
                </p>
              </div>

              {/* Neo-Brutalist Circular Gauge */}
              <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#EAE6DC"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke={atsResult.compatibility_score >= 80 ? "#CCFF00" : atsResult.compatibility_score >= 60 ? "#D2CBFF" : "#FFCABF"}
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - atsResult.compatibility_score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-ink">
                    {atsResult.compatibility_score}%
                  </span>
                  <span className="text-[9px] font-mono text-ink-muted uppercase font-bold">ATS Score</span>
                </div>
              </div>
            </div>

            {/* Metric Sub-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">{atsResult.readability_score}%</div>
                <div className="text-xs font-bold text-ink-muted uppercase font-mono mt-0.5">Readability</div>
              </div>
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">{atsResult.formatting_score}%</div>
                <div className="text-xs font-bold text-ink-muted uppercase font-mono mt-0.5">Layout Precision</div>
              </div>
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">{atsResult.keyword_score}%</div>
                <div className="text-xs font-bold text-ink-muted uppercase font-mono mt-0.5">Keyword Match</div>
              </div>
            </div>

            {/* Section Analysis Breakdown */}
            <div className="card-surface p-6 sm:p-7 space-y-4 bg-white">
              <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide">
                Detailed Section Audit
              </h3>
              <div className="space-y-3">
                {Object.entries(atsResult.section_feedback || {}).map(([key, feedback]) => (
                  <div
                    key={key}
                    className="p-4 rounded-2xl border border-ink/20 bg-canvas flex items-start gap-3.5"
                  >
                    {feedback.status === "good" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : feedback.status === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold capitalize text-ink text-xs sm:text-sm">
                          {key} Section
                        </span>
                        <span className="font-mono text-[11px] font-bold text-ink-muted">
                          {feedback.score}/100
                        </span>
                      </div>
                      <p className="text-ink-secondary leading-relaxed">{feedback.message}</p>
                      {feedback.details && feedback.details.length > 0 && (
                        <ul className="text-[11px] text-ink-muted list-disc list-inside space-y-0.5 pt-1">
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

            {/* Recommendations */}
            {atsResult.recommendations && atsResult.recommendations.length > 0 && (
              <div className="bento-peach p-6 sm:p-7 space-y-3.5">
                <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide">
                  Recommended Optimizations
                </h3>
                <ul className="space-y-2.5 text-xs text-ink">
                  {atsResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/builder" className="btn-primary py-3 px-8 text-xs sm:text-sm shadow-brutal group">
                <span>Open in Resume Editor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
