import React from 'react';
import { BookOpen, CheckCircle2, Info, Target } from 'lucide-react';

export function SkillsGapAnalysis({ skillsGap }) {
  if (!skillsGap) return null;

  return (
    <section className="rounded-3xl border-2 border-ink bg-white p-6 shadow-brutal-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-ink">
          <Target className="w-4 h-4 text-brand-700" />
          <span>Skills Gap &amp; Career Development Analysis</span>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-2.5 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <p>{skillsGap.distinction_note}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Existing Resume Skills ({(skillsGap.existing_skills || []).length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(skillsGap.existing_skills || []).map((sk) => (
              <span key={sk} className="px-2 py-0.5 rounded-md bg-white border border-ink/15 text-xs font-medium text-ink">
                {sk}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-amber-800">
            Missing From Resume Text ({(skillsGap.missing_from_resume || []).length})
          </div>
          <p className="text-[11px] text-ink-muted">
            Frequently requested across matched roles; add if you know them, or prioritize learning.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(skillsGap.missing_from_resume || []).map((sk) => (
              <span key={sk} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
                {sk}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-brand-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recommended Learning Priorities</span>
          </div>
          <ul className="space-y-1.5 text-xs text-ink-secondary list-disc list-inside">
            {(skillsGap.learning_priorities || []).map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
