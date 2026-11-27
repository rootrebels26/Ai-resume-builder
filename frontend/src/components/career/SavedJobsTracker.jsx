import React from 'react';
import { ExternalLink, Trash2, BookmarkCheck } from 'lucide-react';

const STATUS_OPTIONS = ['Saved', 'Interested', 'Applied', 'Interview', 'Rejected', 'Offer'];

export function SavedJobsTracker({ savedRoles = [], onUpdateStatus, onRemove }) {
  if (!savedRoles.length) {
    return (
      <div className="rounded-3xl border-2 border-ink bg-white p-8 text-center space-y-2 shadow-brutal-sm">
        <BookmarkCheck className="w-8 h-8 mx-auto text-ink-muted" />
        <h3 className="text-base font-extrabold text-ink">No Saved Jobs Yet</h3>
        <p className="text-xs text-ink-muted max-w-md mx-auto">
          Bookmark any recommended role or live job listing to track your application status locally in your browser.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border-2 border-ink bg-white p-5 space-y-4 shadow-brutal-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">
          Saved Jobs &amp; Application Tracker ({savedRoles.length})
        </h2>
        <span className="text-[11px] font-mono text-ink-muted">
          Stored locally in IndexedDB
        </span>
      </div>

      <div className="space-y-3">
        {savedRoles.map((item) => {
          const key = item.id || item.title;
          const applyUrl = item.apply_url || item.search_links?.[0]?.url;
          return (
            <div
              key={key}
              className="p-4 rounded-2xl bg-canvas border border-ink/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-ink truncate">{item.title}</span>
                  {item.estimated_match_score != null && (
                    <span className="px-2 py-0.5 rounded bg-white border border-ink/15 text-[10px] font-mono font-bold">
                      {item.estimated_match_score}% Match
                    </span>
                  )}
                </div>
                <div className="text-xs text-ink-muted flex flex-wrap gap-2">
                  {item.company && <span>{item.company}</span>}
                  {item.source && <span>• {item.source}</span>}
                  {item.savedAt && <span>• Saved {new Date(item.savedAt).toLocaleDateString()}</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  aria-label={`Application status for ${item.title}`}
                  value={item.status || 'Saved'}
                  onChange={(e) => onUpdateStatus(item, e.target.value)}
                  className="input-base text-xs py-1.5"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                {applyUrl && (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-volt py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="p-2 rounded-xl border border-ink/20 bg-white text-ink-muted hover:text-rose-600 cursor-pointer"
                  title="Remove saved job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
