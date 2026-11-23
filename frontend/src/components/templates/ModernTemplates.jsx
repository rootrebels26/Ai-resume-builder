import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection
} from './shared/SharedComponents';

/**
 * Modern01: Apex Modern Blue & Base Modern Template
 * Split Two-Column Layout featuring a solid accent color sidebar on the left
 * and clean white main content column on the right.
 * Matches TemplateDraftPaper miniature preview 1:1.
 */
export function Modern01({ resumeData, defaultColor = "#0284c7" }) {
  const {
    personalInfo = {},
    professionalSummary,
    experience = [],
    education = [],
    projects = [],
    skills = [],
    preferences = {}
  } = resumeData;

  // Prioritize user's chosen themeColor, fall back to template default
  const color = preferences.themeColor || defaultColor;

  return (
    <div className="w-full h-full flex text-slate-900 leading-relaxed font-sans bg-white overflow-hidden box-border">
      {/* ======================================================== */}
      {/* LEFT ACCENT SIDEBAR (34% width, solid color, white text) */}
      {/* ======================================================== */}
      <div
        className="w-[34%] h-full p-6 text-white flex flex-col justify-between shrink-0 box-border overflow-hidden select-none"
        style={{ backgroundColor: color }}
      >
        <div className="space-y-4">
          {/* Header in Sidebar */}
          {resumeData.isContinuation ? (
            <div className="pb-3 border-b border-white/20">
              <h1 className="font-extrabold text-base tracking-wider uppercase text-white leading-tight">
                {personalInfo.fullName || "Resume"}
              </h1>
              {personalInfo.professionalTitle && (
                <p className="text-[11px] font-semibold text-white/80 mt-0.5">
                  {personalInfo.professionalTitle}
                </p>
              )}
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono font-bold tracking-widest uppercase">
                Page {resumeData.pageNumber || 2} of {resumeData.totalPages || 2}
              </span>
            </div>
          ) : (
            <div className="space-y-1 pb-3 border-b border-white/25">
              <h1 className="font-extrabold text-xl tracking-wider uppercase text-white leading-tight">
                {personalInfo.fullName || "Your Full Name"}
              </h1>
              {personalInfo.professionalTitle && (
                <p className="text-xs font-semibold text-white/85 mt-0.5">
                  {personalInfo.professionalTitle}
                </p>
              )}
            </div>
          )}

          {/* Contact Details */}
          {!resumeData.isContinuation && (
            <div className="space-y-2 text-xs text-white/95">
              <div className="font-bold text-[10px] uppercase tracking-wider text-white/70 border-b border-white/20 pb-0.5">
                Contact
              </div>
              {personalInfo.email && <div className="truncate text-[11px]">{personalInfo.email}</div>}
              {personalInfo.phone && <div className="text-[11px]">{personalInfo.phone}</div>}
              {personalInfo.location && <div className="text-[11px]">{personalInfo.location}</div>}
              {personalInfo.website && (
                <div className="truncate text-[11px]">
                  <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:underline text-white">
                    {personalInfo.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="truncate text-[11px]">
                  <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline text-white">
                    LinkedIn
                  </a>
                </div>
              )}
              {personalInfo.github && (
                <div className="truncate text-[11px]">
                  <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:underline text-white">
                    GitHub
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Skills Section with clean tags */}
          {skills.length > 0 && (
            <div className="space-y-2.5">
              <div className="font-bold text-[10px] uppercase tracking-wider text-white/70 border-b border-white/20 pb-0.5">
                Skills
              </div>
              <div className="space-y-2 text-xs">
                {skills.map((cat, idx) => (
                  <div key={idx} className="space-y-1 break-inside-avoid">
                    <div className="font-semibold text-white text-[11px]">{cat.category}</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item, iIdx) => (
                        <span
                          key={iIdx}
                          className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/20 text-white backdrop-blur-xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Education in Sidebar */}
        {education.length > 0 && (
          <div className="border-t border-white/25 pt-3 mt-4 space-y-2 text-xs text-white/95">
            <div className="font-bold text-[10px] uppercase tracking-wider text-white/70">
              Education
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="space-y-0.5 break-inside-avoid">
                <div className="font-bold text-white text-xs">{edu.institution}</div>
                <div className="text-[11px] text-white/90">
                  {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                </div>
                <div className="text-[10px] text-white/75 font-mono">
                  {edu.startDate} – {edu.endDate} {edu.cgpa ? `• GPA: ${edu.cgpa}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* RIGHT MAIN CONTENT COLUMN (66% width, clean white canvas) */}
      {/* ======================================================== */}
      <div className="w-[66%] h-full p-7 flex flex-col justify-between bg-white text-slate-800 box-border overflow-hidden">
        <div className="space-y-4">
          {/* Top Header */}
          {!resumeData.isContinuation && (
            <div className="pb-3 border-b border-slate-200">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {personalInfo.fullName || "Your Full Name"}
              </h2>
              {personalInfo.professionalTitle && (
                <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: color }}>
                  {personalInfo.professionalTitle}
                </p>
              )}
              {professionalSummary && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {professionalSummary}
                </p>
              )}
            </div>
          )}

          {/* Continuation Header on Page 2 */}
          {resumeData.isContinuation && (
            <div className="pb-2 border-b-2 flex justify-between items-baseline" style={{ borderColor: color }}>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                  {personalInfo.fullName}
                </span>
                {personalInfo.professionalTitle && (
                  <span className="text-xs font-medium text-slate-600 ml-2">
                    — {personalInfo.professionalTitle}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Page {resumeData.pageNumber || 2} of {resumeData.totalPages || 2}
              </span>
            </div>
          )}

          {/* Work Experience with Left Accent Bar */}
          {experience.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }}></span>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-900">Work Experience</h3>
              </div>
              <div className="space-y-3 pl-2.5 border-l-2" style={{ borderColor: color }}>
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="space-y-1 break-inside-avoid">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {exp.position} <span className="font-normal text-slate-600">— {exp.company}</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate || "Present"}
                        {exp.location ? ` | ${exp.location}` : ""}
                      </span>
                    </div>

                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="mt-1 space-y-1 text-xs text-slate-700 list-disc list-inside">
                        {exp.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="leading-relaxed">
                            <span className="-ml-1">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-1 pl-2 text-xs italic text-slate-600 border-l-2 border-slate-200">
                        {exp.achievements.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key Projects */}
          {projects.length > 0 && (
            <section className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color }}></span>
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-900">Featured Projects</h3>
              </div>
              <ProjectsSection items={projects} />
            </section>
          )}
        </div>

        {/* Footer for Page Number when Multi-page */}
        {resumeData.totalPages > 1 && (
          <div className="pt-2 mt-auto text-[10px] font-mono text-slate-400 flex justify-between items-center border-t border-slate-100 select-none">
            <span className="truncate max-w-[200px]">
              {personalInfo.fullName || 'Resume'}
            </span>
            <span>Page {resumeData.pageNumber || 1} of {resumeData.totalPages || 2}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// modern-02: Emerald Horizon
export function Modern02({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#059669" />;
}

// modern-03: Slate Prestige
export function Modern03({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#334155" />;
}

// modern-04: Violet Edge
export function Modern04({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#7c3aed" />;
}

// modern-05: Indigo Split
export function Modern05({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#4338ca" />;
}

// modern-06: Teal Minimal
export function Modern06({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#0d9488" />;
}

// modern-07: Dark Onyx
export function Modern07({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#18181b" />;
}

// modern-08: Royal Blue
export function Modern08({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#2563eb" />;
}

// modern-09: Charcoal Grid
export function Modern09({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#4b5563" />;
}

// modern-10: Navy Executive
export function Modern10({ resumeData }) {
  return <Modern01 resumeData={resumeData} defaultColor="#1d4ed8" />;
}
