import React, { useState } from 'react';
import {
  Bookmark, BookmarkCheck, ExternalLink, MapPin, Building2,
  Calendar, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

export function LiveJobCard({ matchedJob, isSaved, onToggleSave, onOptimizeForJob }) {
  const [expanded, setExpanded] = useState(false);
  const { job, match_score, matching_skills = [], missing_or_unverified_skills = [], reasons_for_match = [] } = matchedJob;

  const scoreColor =
    match_score >= 70
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : match_score >= 45
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-canvas text-ink border-ink/20';

  return (
    <article className="rounded-3xl border-2 border-ink bg-white p-5 shadow-brutal-sm flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-bold">
              <span className="px-2 py-0.5 rounded bg-volt/50 border border-ink/25 text-ink">
                {job.source}
              </span>
              {job.work_mode && job.work_mode !== 'Not specified' && (
                <span className="px-2 py-0.5 rounded bg-canvas border border-ink/15 text-ink">
                  {job.work_mode}
                </span>
              )}
              {job.employment_type && job.employment_type !== 'Not specified' && (
                <span className="px-2 py-0.5 rounded bg-canvas border border-ink/15 text-ink">
                  {job.employment_type}
                </span>
              )}
              {job.is_fresher_friendly && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800">
                  Fresher / Intern Friendly
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-ink tracking-tight break-words">
              {job.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1 font-semibold text-ink">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              {job.posted_at && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {job.posted_at.slice(0, 10)}
                </span>
              )}
            </div>
            {job.salary && (
              <p className="text-xs font-bold text-emerald-800">Salary: {job.salary}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold ${scoreColor}`}
              title="Estimated Resume-Job Compatibility Score"
            >
              {match_score}% Match
            </span>
            <span className="text-[10px] font-mono text-ink-muted">Est. Compatibility</span>
          </div>
        </div>

        {reasons_for_match.length > 0 && (
          <p className="text-xs text-ink-secondary bg-canvas p-2.5 rounded-xl border border-ink/10">
            {reasons_for_match[0]}
          </p>
        )}

        <div className="space-y-1.5">
          {matching_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase mr-1">Matched:</span>
              {matching_skills.slice(0, 5).map((sk) => (
                <span key={sk} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
                  {sk}
                </span>
              ))}
            </div>
          )}
          {missing_or_unverified_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase mr-1">Missing/Unverified:</span>
              {missing_or_unverified_skills.slice(0, 4).map((sk) => (
                <span key={sk} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>

        {expanded && job.description_text && (
          <div className="p-3 rounded-2xl bg-canvas border border-ink/15 text-xs text-ink-secondary whitespace-pre-line max-h-56 overflow-y-auto leading-relaxed">
            {job.description_text}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink/10">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-volt py-1.5 px-3.5 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Apply</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {job.description_text && (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="btn-secondary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{expanded ? 'Hide Description' : 'View Job'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {onOptimizeForJob && job.description_text && (
            <button
              type="button"
              onClick={() => onOptimizeForJob(job)}
              className="btn-secondary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              title="Send job description to ResumeStudio ATS & Optimizer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-700" />
              <span>Optimize Resume</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onToggleSave({
              id: job.id,
              title: job.title,
              company: job.company,
              source: job.source,
              apply_url: job.apply_url,
              estimated_match_score: match_score,
              status: 'Saved',
            })
          }
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isSaved
              ? 'bg-volt border-ink text-ink'
              : 'bg-white border-ink/20 text-ink-muted hover:text-ink hover:border-ink'
          }`}
          title={isSaved ? 'Remove from saved jobs' : 'Save job'}
          aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </article>
  );
}
