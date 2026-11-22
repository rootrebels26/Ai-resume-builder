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

// Developer Templates: Code terminal header, tech pills, repo links
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

// Data Analyst & Data Scientist Templates: Metrics, Dashboards, Statistical Models
export function DataScienceTemplate({ resumeData, themeColor = "#0284c7" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-sans text-xs">
      <div className="border-l-4 pl-4 py-1 mb-4" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{personalInfo.fullName}</h1>
        <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: themeColor }}>
          {personalInfo.professionalTitle || "Data Scientist / Analytics Specialist"}
        </p>
        <ContactList personalInfo={personalInfo} className="mt-1.5" separator="•" />
      </div>

      <div className="space-y-3.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Quantitative Profile & Impact" variant="bar" color={themeColor} />
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Analytics & Tooling Stack" variant="bar" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Data & Business Impact" variant="bar" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Modeling & Pipeline Projects" variant="bar" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Academics & Mathematics" variant="bar" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}

// AI/ML & Generative AI Engineer Templates
export function AIMLTemplate({ resumeData, themeColor = "#7c3aed" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-sans text-xs">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 -mx-4 -mt-4 mb-4 rounded-b">
        <div className="flex justify-between items-baseline flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{personalInfo.fullName}</h1>
            <p className="text-xs font-mono text-purple-300 mt-0.5">{personalInfo.professionalTitle || "AI / Machine Learning Engineer"}</p>
          </div>
          <div className="text-[11px] text-purple-200">
            {personalInfo.email} • {personalInfo.location}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-purple-800">
          <ContactList personalInfo={personalInfo} iconClass="w-3.5 h-3.5 text-purple-300" className="text-purple-200" />
        </div>
      </div>

      <div className="space-y-3.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Research & Machine Learning Focus" variant="bar" color={themeColor} />
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="AI / ML Frameworks & Architectures" variant="bar" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Model Development & Engineering" variant="bar" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Published Models & LLM Systems" variant="bar" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Research" variant="bar" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}

// Executive & Leadership Templates: Prominent summary, governance
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

// Creative / Designer Templates: Bold visual hierarchy, portfolio links
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

// Business Professional Templates: Strategic delivery, ROI metrics
export function BusinessTemplate({ resumeData, themeColor = "#1e3a8a" }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-relaxed font-sans text-xs">
      <div className="bg-slate-100 p-4 rounded-lg border-t-4 mb-4" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-extrabold text-slate-900">{personalInfo.fullName}</h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-0.5">{personalInfo.professionalTitle}</p>
        <ContactList personalInfo={personalInfo} className="mt-2 text-slate-600" separator="|" />
      </div>

      <div className="space-y-3.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Professional Profile" variant="bar" color={themeColor} />
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Career Achievements & Operations" variant="bar" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Core Competencies & Tools" variant="bar" color={themeColor} />
            <SkillsSection categories={skills} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Strategic Initiatives" variant="bar" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Accreditations" variant="bar" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}
