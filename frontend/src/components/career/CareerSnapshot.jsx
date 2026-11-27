import React from 'react';
import { Briefcase, Award, Sparkles, Compass, CheckCircle2 } from 'lucide-react';

export function CareerSnapshot({ careerProfile, resumeData }) {
  if (!careerProfile) return null;

  const hasSummary = Boolean(resumeData?.professionalSummary?.trim());
  const projectCount = (resumeData?.projects || []).length;
  const expCount = (resumeData?.experience || []).length + (resumeData?.internships || []).length;
  const certCount = (resumeData?.certifications || []).length;

  return (
    <section className="rounded-3xl border-2 border-ink bg-white p-6 shadow-brutal space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-700">
            <Compass className="w-3.5 h-3.5" />
            <span>Resume Career Snapshot</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
            {careerProfile.primary_domain || 'Career Profile'}
          </h2>
          {careerProfile.secondary_domains?.length > 0 && (
            <p className="text-xs text-ink-muted">
              Secondary domains: {careerProfile.secondary_domains.join(' • ')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-volt border border-ink text-xs font-bold text-ink">
            Level: {careerProfile.experience_level || 'Student'}
          </span>
          <span className="px-3 py-1 rounded-full bg-canvas border border-ink/20 text-xs font-semibold text-ink">
            Education: {careerProfile.education_level || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink-muted uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Resume Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(careerProfile.top_skills || []).slice(0, 8).map((sk) => (
              <span
                key={sk}
                className="px-2.5 py-0.5 rounded-lg bg-white border border-ink/15 text-xs font-medium text-ink"
              >
                {sk}
              </span>
            ))}
            {(!careerProfile.top_skills || careerProfile.top_skills.length === 0) && (
              <span className="text-xs text-ink-muted">Add skills to your resume for tighter matching.</span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink-muted uppercase">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recommended Titles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(careerProfile.recommended_job_titles || []).slice(0, 6).map((title) => (
              <span
                key={title}
                className="px-2.5 py-0.5 rounded-lg bg-white border border-ink/15 text-xs font-semibold text-ink"
              >
                {title}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-canvas border border-ink/15 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink-muted uppercase">
            <Award className="w-3.5 h-3.5" />
            <span>Career Readiness Indicators</span>
          </div>
          <ul className="space-y-1 text-xs text-ink-secondary">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasSummary ? 'text-emerald-600' : 'text-ink-muted'}`} />
              <span>Summary: {hasSummary ? 'Present' : 'Missing'}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-3.5 h-3.5 ${expCount > 0 ? 'text-emerald-600' : 'text-ink-muted'}`} />
              <span>Experience / Internships: {expCount}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-3.5 h-3.5 ${projectCount > 0 ? 'text-emerald-600' : 'text-ink-muted'}`} />
              <span>Projects: {projectCount} • Certifications: {certCount}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
