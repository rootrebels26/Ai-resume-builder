import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection,
  CertificationsSection, LanguagesSection
} from './shared/SharedComponents';

export function Minimalist01({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 font-sans text-xs leading-relaxed max-w-4xl mx-auto">
      <div className="pb-2.5 mb-2.5 border-b border-slate-200">
        <h1 className="text-xl font-medium tracking-tight text-slate-900">{personalInfo.fullName}</h1>
        {personalInfo.professionalTitle && (
          <p className="text-slate-500 font-normal mt-0.5">{personalInfo.professionalTitle}</p>
        )}
        <ContactList personalInfo={personalInfo} className="mt-1.5 text-slate-500" showIcons={false} separator="·" />
      </div>

      <div className="space-y-3">
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

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications" variant="minimal" />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" variant="minimal" />
            <LanguagesSection items={languages} />
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
