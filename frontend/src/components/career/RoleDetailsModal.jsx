import React, { useEffect, useState } from 'react';
import { X, Briefcase, CheckCircle2, BookOpen, Sparkles, Info, Loader2 } from 'lucide-react';
import { careerService } from '../../services/careerService';
import { JobSearchPlatforms } from './JobSearchPlatforms';

export function RoleDetailsModal({ isOpen, onClose, role, resumeData, preferences }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !role) return;
    let active = true;
    setLoading(true);
    careerService
      .getRoleDetails(resumeData || {}, role, preferences || {})
      .then((res) => {
        if (active && res?.data) {
          setDetails(res.data);
        }
      })
      .catch(() => {
        if (active) setDetails(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, role, resumeData, preferences]);

  if (!isOpen || !role) return null;

  const liveLinks = careerService.buildExternalSearchLinks(
    role.title,
    role.matched_skills,
    preferences,
    role.experience_level
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
      <div className="bg-canvas border-2 border-ink rounded-3xl shadow-brutal w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-ink">
        <div className="p-5 sm:p-6 border-b border-ink/15 bg-white flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold uppercase text-ink-muted">
              <span className="px-2 py-0.5 rounded bg-canvas border border-ink/15">{role.category}</span>
              <span>{role.industry}</span>
              <span>•</span>
              <span>{role.experience_level}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              {role.title}
            </h2>
            <p className="text-xs text-ink-muted">
              Estimated Resume-to-Role Match: <strong className="text-ink">{role.estimated_match_score}%</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-ink/20 hover:border-ink hover:bg-canvas flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
            aria-label="Close role details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs font-mono text-ink-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Preparing role guidance...</span>
            </div>
          ) : (
            <>
              {/* Score Breakdown */}
              {role.score_breakdown && (
                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-ink-muted">
                    Match Score Factor Breakdown
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    {[
                      ['Skills (40%)', role.score_breakdown.skills_score],
                      ['Education (20%)', role.score_breakdown.education_score],
                      ['Experience (20%)', role.score_breakdown.experience_score],
                      ['Projects (10%)', role.score_breakdown.projects_score],
                      ['Certs (10%)', role.score_breakdown.certifications_score],
                    ].map(([label, val]) => (
                      <div key={label} className="p-2 rounded-xl bg-white border border-ink/10">
                        <div className="font-extrabold text-ink">{Math.round(val || 0)}%</div>
                        <div className="text-[10px] font-mono text-ink-muted">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-ink">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Typical Responsibilities</span>
                  </div>
                  <ul className="space-y-1 text-xs text-ink-secondary list-disc list-inside">
                    {(details?.typical_responsibilities || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Resume Compatibility</span>
                  </div>
                  <div className="text-xs space-y-1.5 text-ink-secondary">
                    <p>
                      <strong>Matched Skills:</strong>{' '}
                      {(details?.matched_skills || role.matched_skills || []).join(', ') || 'Transferable profile'}
                    </p>
                    <p>
                      <strong>Relevant Projects:</strong>{' '}
                      {(details?.relevant_projects || []).join(', ') || 'None detected in resume'}
                    </p>
                    <p>
                      <strong>Missing Resume Keywords:</strong>{' '}
                      {(details?.missing_resume_keywords || role.missing_from_resume_skills || []).join(', ') || 'None'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Career Preparation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-brand-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggested Projects &amp; Portfolio</span>
                  </div>
                  <ul className="space-y-1 text-xs text-ink-secondary list-disc list-inside">
                    {(details?.suggested_projects || []).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                    {(details?.portfolio_improvements || []).map((p, i) => (
                      <li key={`pf_${i}`}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-ink">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Interview &amp; Resume Prep</span>
                  </div>
                  <ul className="space-y-1 text-xs text-ink-secondary list-disc list-inside">
                    {(details?.interview_preparation_topics || []).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                    {(details?.resume_improvements || []).map((r, i) => (
                      <li key={`ri_${i}`}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  {details?.salary_note ||
                    'Salary information is not shown because no verified live vacancy source is connected.'}
                </span>
              </div>

              <JobSearchPlatforms links={liveLinks} roleTitle={role.title} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-ink/15 bg-canvas flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary py-2 px-5 text-xs cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
