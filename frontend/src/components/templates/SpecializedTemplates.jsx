import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection
} from './shared/SharedComponents';

// Student / Fresher Templates: Prioritize Education & Projects
export function StudentTemplate({ resumeData, themeColor = "#2563eb" }) {
  const { personalInfo = {}, professionalSummary, education = [], projects = [], experience = [], internships = [], skills = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-sans text-xs">
      <div className="text-center pb-3 border-b-2" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-bold uppercase" style={{ color: themeColor }}>{personalInfo.fullName}</h1>
        {personalInfo.professionalTitle && (
          <p className="text-xs font-semibold text-slate-700 mt-0.5">{personalInfo.professionalTitle}</p>
        )}
        <ContactList personalInfo={personalInfo} className="justify-center mt-2" separator="|" />
      </div>

      <div className="mt-3.5 space-y-3.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Career Objective" variant="badge" color={themeColor} />
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Academic Standing" variant="badge" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Academic & Personal Projects" variant="badge" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {(experience.length > 0 || internships.length > 0) && (
          <section>
            <SectionHeading title="Work & Internship Experience" variant="badge" color={themeColor} />
            <ExperienceSection items={[...internships, ...experience]} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Technical Proficiencies" variant="badge" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}
      </div>
    </div>
  );
}

// Developer Templates: High tech density with code pills & repositories
export function DeveloperTemplate({ resumeData, themeColor = "#0284c7" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-sans text-xs">
      <div className="bg-slate-950 text-emerald-400 p-4 -mx-4 -mt-4 mb-4 rounded-b border-b-2 border-emerald-500">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold font-mono text-white">&gt; {personalInfo.fullName}</h1>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{personalInfo.professionalTitle}</p>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-mono">
            {personalInfo.github && <div>gh: {personalInfo.github.replace(/^https?:\/\//, '')}</div>}
            {personalInfo.email && <div>email: {personalInfo.email}</div>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {skills.length > 0 && (
          <section>
            <SectionHeading title="Technical Arsenal" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Engineering Experience" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Open Source & Architecture" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Credentials" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}

// Executive Templates: Executive Summary prominence, governance and metrics
export function ExecutiveTemplate({ resumeData, themeColor = "#0f172a" }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], skills = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-serif text-xs">
      <div className="border-b-2 border-slate-900 pb-2 mb-3">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">{personalInfo.fullName}</h1>
        <p className="text-xs uppercase tracking-wider text-slate-600 mt-0.5 font-sans font-semibold">
          {personalInfo.professionalTitle}
        </p>
        <ContactList personalInfo={personalInfo} className="mt-1.5 font-sans" showIcons={false} separator="|" />
      </div>

      <div className="space-y-3 font-sans">
        {professionalSummary && (
          <section>
            <SectionHeading title="Executive Summary & Core Value" variant="serif" color={themeColor} />
            <p className="text-xs text-slate-700 leading-relaxed font-serif italic">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Executive & Leadership Trajectory" variant="serif" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Strategic Capabilities" variant="serif" color={themeColor} />
            <SkillsSection categories={skills} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Academic Credentials" variant="serif" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}

// Creative / Designer Templates: Visual hierarchy, bold typography
export function CreativeTemplate({ resumeData, themeColor = "#ec4899" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-sans text-xs">
      <div className="pb-3 mb-3 border-b-4" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: themeColor }}>
          {personalInfo.fullName}
        </h1>
        <p className="text-sm font-semibold text-slate-700">{personalInfo.professionalTitle}</p>
        <ContactList personalInfo={personalInfo} className="mt-2" separator="•" />
      </div>

      <div className="space-y-3.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Design Philosophy & Bio" variant="bar" color={themeColor} />
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Selected Portfolio Works" variant="bar" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Design & Industry Experience" variant="bar" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Design Systems & Tools" variant="bar" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education" variant="bar" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}
