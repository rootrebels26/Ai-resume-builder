import React from 'react';
import { ExternalLink } from 'lucide-react';

export function JobSearchPlatforms({ links = [], roleTitle = '' }) {
  if (!links.length) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-ink/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase text-ink-muted">
          Search Jobs{roleTitle ? ` — ${roleTitle}` : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {links.map((lnk) => (
          <a
            key={lnk.platform}
            href={lnk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-xl bg-canvas border border-ink/20 hover:border-ink hover:bg-volt/40 transition-colors flex items-center justify-between gap-1.5 text-[11px] font-bold text-ink"
            title={`Query: ${lnk.query}`}
          >
            <span className="truncate">{lnk.label.replace('Search on ', '')}</span>
            <ExternalLink className="w-3 h-3 shrink-0 text-ink-muted" />
          </a>
        ))}
      </div>
    </div>
  );
}
