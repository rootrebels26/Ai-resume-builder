import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection
} from './shared/SharedComponents';

// modern-01: Apex Modern Blue
export function Modern01({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], preferences = {} } = resumeData;
  const color = preferences.themeColor || "#0284c7";

  return (
    <div className="text-slate-900 leading-relaxed font-sans">
      <div className="bg-slate-900 text-white p-5 -mx-4 -mt-4 mb-4 rounded-b-lg">
        <h1 className="text-2xl font-bold tracking-tight">{personalInfo.fullName}</h1>
        {personalInfo.professionalTitle && (
          <p className="text-sm font-medium text-slate-300 mt-0.5">{personalInfo.professionalTitle}</p>
        )}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <ContactList personalInfo={personalInfo} iconClass="w-3.5 h-3.5 text-slate-400" className="text-slate-300" />
        </div>
      </div>

      <div className="space-y-3.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="About Me" variant="bar" color={color} />
            <p className="text-xs text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Work Experience" variant="bar" color={color} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Featured Projects" variant="bar" color={color} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Technical Stack" variant="bar" color={color} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education" variant="bar" color={color} />
            <EducationSection items={education} />
          </section>
        )}
      </div>
    </div>
  );
}

// modern-03: Slate Prestige (Two-Column Sidebar Layout)
export function Modern03({ resumeData }) {
  const { personalInfo = {}, professionalSummary, experience = [], education = [], projects = [], skills = [], preferences = {} } = resumeData;
  const color = preferences.themeColor || "#334155";

  return (
    <div className="text-slate-900 leading-relaxed font-sans">
      <div className="grid grid-cols-12 gap-5">
        {/* Left Sidebar */}
        <div className="col-span-4 bg-slate-100 p-3.5 rounded-lg space-y-4 text-xs">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{personalInfo.fullName}</h1>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{personalInfo.professionalTitle}</p>
          </div>

          <div>
            <SectionHeading title="Contact" variant="minimal" />
            <div className="space-y-1.5 text-slate-700 text-[11px]">
              {personalInfo.email && <div>{personalInfo.email}</div>}
              {personalInfo.phone && <div>{personalInfo.phone}</div>}
              {personalInfo.location && <div>{personalInfo.location}</div>}
              {personalInfo.linkedin && (
                <div>
                  <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {personalInfo.github && (
                <div>
                  <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    GitHub Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <SectionHeading title="Skills" variant="minimal" />
              <SkillsSection categories={skills} pillVariant={true} />
            </div>
          )}

          {education.length > 0 && (
            <div>
              <SectionHeading title="Education" variant="minimal" />
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-semibold text-slate-900">{edu.degree}</div>
                    <div className="text-slate-600">{edu.institution}</div>
                    <div className="text-slate-500 font-mono text-[10px]">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="col-span-8 space-y-3.5">
          {professionalSummary && (
            <section>
              <SectionHeading title="Profile" variant="bar" color={color} />
              <p className="text-xs text-slate-700 leading-relaxed">{professionalSummary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionHeading title="Experience" variant="bar" color={color} />
              <ExperienceSection items={experience} />
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <SectionHeading title="Projects" variant="bar" color={color} />
              <ProjectsSection items={projects} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Remaining Modern Templates with specific thematic accents
export function Modern02({ resumeData }) {
  return <Modern01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#059669" } }} />;
}
export function Modern04({ resumeData }) {
  return <Modern01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#7c3aed" } }} />;
}
export function Modern05({ resumeData }) {
  return <Modern03 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#4338ca" } }} />;
}
export function Modern06({ resumeData }) {
  return <Modern01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#0d9488" } }} />;
}
export function Modern07({ resumeData }) {
  return <Modern01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#18181b" } }} />;
}
export function Modern08({ resumeData }) {
  return <Modern01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#2563eb" } }} />;
}
export function Modern09({ resumeData }) {
  return <Modern03 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#4b5563" } }} />;
}
export function Modern10({ resumeData }) {
  return <Modern01 resumeData={{ ...resumeData, preferences: { ...resumeData.preferences, themeColor: "#1d4ed8" } }} />;
}
