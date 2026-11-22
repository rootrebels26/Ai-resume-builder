import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection
} from './shared/SharedComponents';

export function Minimalist01({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [] } = resumeData;

  return (
    <div className="text-slate-900 font-sans text-xs leading-relaxed max-w-4xl mx-auto">
      <div className="pb-3 mb-3 border-b border-slate-200">
        <h1 className="text-xl font-medium tracking-tight text-slate-900">{personalInfo.fullName}</h1>
        {personalInfo.professionalTitle && (
          <p className="text-slate-500 font-normal mt-0.5">{personalInfo.professionalTitle}</p>
        )}
        <ContactList personalInfo={personalInfo} className="mt-2 text-slate-500" showIcons={false} separator="·" />
      </div>

      <div className="space-y-4">
        {professionalSummary && (
          <section>
            <p className="text-slate-600 leading-relaxed text-xs">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Experience" variant="minimal" />
            <ExperienceSection items={experience} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education" variant="minimal" />
            <EducationSection items={education} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Projects" variant="minimal" />
            <ProjectsSection items={projects} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Skills" variant="minimal" />
            <SkillsSection categories={skills} />
          </section>
        )}
      </div>
    </div>
  );
}

export function Minimalist02({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist03({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist04({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist05({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist06({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist07({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist08({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist09({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
export function Minimalist10({ resumeData }) {
  return <Minimalist01 resumeData={resumeData} />;
}
