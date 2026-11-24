import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection, ContinuationHeader,
  CertificationsSection, LanguagesSection
} from './shared/SharedComponents';

// ats-01: Classic ATS Standard
export function ATS01({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], certifications = [], languages = [], preferences = {} } = resumeData;
  const color = preferences.themeColor || "#1e293b";

  return (
    <div className="text-slate-900 leading-relaxed font-sans">
      {resumeData.isContinuation ? (
        <ContinuationHeader personalInfo={personalInfo} color={color} pageNumber={resumeData.pageNumber} totalPages={resumeData.totalPages} />
      ) : (
        <div className="text-center pb-2.5 border-b-2" style={{ borderColor: color }}>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase">{personalInfo.fullName || "Your Full Name"}</h1>
          {personalInfo.professionalTitle && (
            <p className="text-sm font-medium text-slate-700 mt-0.5">{personalInfo.professionalTitle}</p>
          )}
          <ContactList personalInfo={personalInfo} className="justify-center mt-1.5" showIcons={preferences.showIcons} />
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Professional Summary" color={color} />
            <p className="text-xs text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Work Experience" color={color} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education" color={color} />
            <EducationSection items={education} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Key Projects" color={color} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Skills & Competencies" color={color} />
            <SkillsSection categories={skills} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" color={color} />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" color={color} />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// ats-02: ATS Executive Corporate
export function ATS02({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], certifications = [], languages = [], preferences = {} } = resumeData;
  const color = preferences.themeColor || "#0f172a";

  return (
    <div className="text-slate-900 leading-relaxed font-sans border-t-4" style={{ borderColor: color }}>
      {resumeData.isContinuation ? (
        <ContinuationHeader personalInfo={personalInfo} color={color} pageNumber={resumeData.pageNumber} totalPages={resumeData.totalPages} />
      ) : (
        <div className="pt-2 pb-2.5 border-b border-slate-300">
          <h1 className="text-xl sm:text-2xl font-extrabold uppercase text-slate-900">{personalInfo.fullName}</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-0.5">{personalInfo.professionalTitle}</p>
          <ContactList personalInfo={personalInfo} className="mt-1.5" separator="|" showIcons={false} />
        </div>
      )}

      <div className="mt-3 space-y-2.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Executive Summary" variant="bar" color={color} />
            <p className="text-xs text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Professional Experience" variant="bar" color={color} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Credentials" variant="bar" color={color} />
            <EducationSection items={education} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Strategic Projects" variant="bar" color={color} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Core Competencies" variant="bar" color={color} />
            <SkillsSection categories={skills} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" variant="bar" color={color} />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" variant="bar" color={color} />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// ats-03: ATS Clean Compact
export function ATS03({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], certifications = [], languages = [] } = resumeData;
  return (
    <div className="text-slate-900 leading-snug font-sans text-xs">
      {resumeData.isContinuation ? (
        <ContinuationHeader personalInfo={personalInfo} color="#000000" pageNumber={resumeData.pageNumber} totalPages={resumeData.totalPages} />
      ) : (
        <div className="flex justify-between items-end border-b border-black pb-1.5 mb-2.5">
          <div>
            <h1 className="text-lg font-bold tracking-tight uppercase text-black">{personalInfo.fullName}</h1>
            <p className="font-medium text-slate-700">{personalInfo.professionalTitle}</p>
          </div>
          <div className="text-right text-[11px] text-slate-600">
            <div>{personalInfo.email} | {personalInfo.phone}</div>
            <div>{personalInfo.location} {personalInfo.linkedin ? `| ${personalInfo.linkedin.replace(/^https?:\/\//, '')}` : ''}</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {professionalSummary && (
          <section>
            <SectionHeading title="Profile" variant="minimal" />
            <p className="text-slate-800 leading-normal">{professionalSummary}</p>
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

// ats-04: ATS Harvard Standard
export function ATS04({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], certifications = [], languages = [] } = resumeData;
  return (
    <div className="text-black font-serif text-xs leading-relaxed">
      {resumeData.isContinuation ? (
        <ContinuationHeader personalInfo={personalInfo} color="#000000" pageNumber={resumeData.pageNumber} totalPages={resumeData.totalPages} />
      ) : (
        <div className="text-center pb-2 border-b border-black mb-3">
          <h1 className="text-2xl font-bold tracking-normal">{personalInfo.fullName}</h1>
          <ContactList personalInfo={personalInfo} className="justify-center mt-1.5 font-sans" showIcons={false} separator="•" />
        </div>
      )}

      <div className="space-y-2.5 font-sans">
        {education.length > 0 && (
          <section>
            <SectionHeading title="Education" variant="serif" color="#000000" />
            <EducationSection items={education} />
          </section>
        )}
        {experience.length > 0 && (
          <section>
            <SectionHeading title="Experience" variant="serif" color="#000000" />
            <ExperienceSection items={experience} />
          </section>
        )}
        {projects.length > 0 && (
          <section>
            <SectionHeading title="Projects & Research" variant="serif" color="#000000" />
            <ProjectsSection items={projects} />
          </section>
        )}
        {skills.length > 0 && (
          <section>
            <SectionHeading title="Skills & Interests" variant="serif" color="#000000" />
            <SkillsSection categories={skills} />
          </section>
        )}
        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" variant="serif" color="#000000" />
            <CertificationsSection items={certifications} />
          </section>
        )}
        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" variant="serif" color="#000000" />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// ats-05 to ats-10: Additional ATS Formats
export function ATS05({ resumeData }) {
  const color = resumeData.preferences?.themeColor || "#0284c7";
  return <ATS01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: color } }} />;
}

export function ATS06({ resumeData }) {
  const color = resumeData.preferences?.themeColor || "#000000";
  return <ATS01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: color, showIcons: false } }} />;
}

export function ATS07({ resumeData }) {
  const color = resumeData.preferences?.themeColor || "#1d4ed8";
  return <ATS02 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: color } }} />;
}

export function ATS08({ resumeData }) {
  return <ATS04 resumeData={resumeData} />;
}

export function ATS09({ resumeData }) {
  const color = resumeData.preferences?.themeColor || "#0369a1";
  return <ATS01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: color } }} />;
}

export function ATS10({ resumeData }) {
  const color = resumeData.preferences?.themeColor || "#0f766e";
  return <ATS02 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: color } }} />;
}
