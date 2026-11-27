import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Eye, Sparkles } from 'lucide-react';
import { JobSearchPlatforms } from './JobSearchPlatforms';

export function RecommendedRoleCard({
  role,
  isSaved,
  onToggleSave,
  onViewDetails,
  liveLinks,
}) {
  const [showPlatforms, setShowPlatforms] = useState(false);

  const scoreColor =
    role.estimated_match_score >= 75
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : role.estimated_match_score >= 55
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-canvas text-ink border-ink/20';

  const links = liveLinks || role.search_links || [];

  return (
    <article className="rounded-3xl border-2 border-ink bg-white p-5 shadow-brutal-sm flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-canvas border border-ink/15 text-[10px] font-mono font-bold uppercase text-ink-muted">
                {role.category}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-canvas border border-ink/15 text-[10px] font-mono font-bold text-ink">
                {role.experience_level}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-ink tracking-tight break-words">
              {role.title}
            </h3>
            <p className="text-xs text-ink-muted">{role.industry}</p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold ${scoreColor}`}
              title="Estimated Resume-to-Role Match (reproducible heuristic + AI match, not selection probability)"
            >
              {role.estimated_match_score}% Match
            </span>
            <span className="text-[10px] font-mono text-ink-muted">Est. Resume Match</span>
          </div>
        </div>

        {/* Why it matches */}
        {role.why_matches?.length > 0 && (
          <div className="p-3 rounded-2xl bg-canvas border border-ink/10 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-ink-muted">
              <Sparkles className="w-3 h-3" />
              <span>Why this role matches</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {role.why_matches[0]}
            </p>
          </div>
        )}

        {/* Skills matched vs missing from resume */}
        <div className="space-y-2">
          {role.matched_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase mr-1">Matched:</span>
              {role.matched_skills.slice(0, 5).map((sk) => (
                <span key={sk} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
                  {sk}
                </span>
              ))}
            </div>
          )}
          {role.missing_from_resume_skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase mr-1">To highlight/learn:</span>
              {role.missing_from_resume_skills.slice(0, 4).map((sk) => (
                <span key={sk} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-800">
                  {sk}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2 border-t border-ink/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPlatforms((prev) => !prev)}
              className="btn-volt py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Jobs</span>
              {showPlatforms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(role)}
              className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Details</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(role)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-volt border-ink text-ink'
                : 'bg-white border-ink/20 text-ink-muted hover:text-ink hover:border-ink'
            }`}
            title={isSaved ? 'Remove from saved roles' : 'Save role'}
            aria-label={isSaved ? 'Remove from saved roles' : 'Save role'}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {showPlatforms && <JobSearchPlatforms links={links} roleTitle={role.title} />}
      </div>
    </article>
  );
}
