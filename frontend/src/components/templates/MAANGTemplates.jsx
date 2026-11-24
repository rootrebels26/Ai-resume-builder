import React from 'react';
import {
  ContactList, SectionHeading, ExperienceSection, EducationSection, ProjectsSection, SkillsSection,
  CertificationsSection, LanguagesSection
} from './shared/SharedComponents';

/**
 * FAANG / MAANG Specially Optimized Templates
 * Designed strictly against Tier-1 Tech (Google, Meta, Apple, Amazon, Netflix, Microsoft, Nvidia, Stripe, OpenAI)
 * Recruiter & Hiring Committee Guidelines:
 * - 100% Picture-Free & 100% ATS Safe Single-Column & Streamlined Formats
 * - Formatted for the Google "XYZ" Formula: "Accomplished [X] as measured by [Y], by doing [Z]"
 * - Clear Technical Categorization (Languages, Systems, Cloud & Infra, Data Stores)
 * - Highlights Leadership Principles, Five-Nines Reliability, Scale (QPS, DAU, Petabytes)
 */

// 1. Google L4/L5 Senior SWE: Academic Stanford/Ivy Calibrated, XYZ Impact Formula
export function MAANGSWEGoogle({ resumeData, themeColor = "#1a73e8" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs max-w-full">
      {/* Google Recruiter-Approved Clean Header */}
      <div className="text-center pb-2.5 mb-2.5 border-b-2" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personalInfo.fullName}</h1>
        {personalInfo.professionalTitle && (
          <p className="text-xs font-semibold text-slate-700 mt-0.5">{personalInfo.professionalTitle}</p>
        )}
        <ContactList personalInfo={personalInfo} className="justify-center mt-1" separator="|" />
      </div>

      <div className="space-y-2.5">
        {/* Technical Proficiencies Grouped at Top (Google Committee Priority) */}
        {skills.length > 0 && (
          <section>
            <div className="flex items-center gap-2 pb-0.5 mb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Technical Arsenal & Core Competencies</h2>
            </div>
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {/* Google XYZ Experience */}
        {experience.length > 0 && (
          <section>
            <div className="flex items-center justify-between pb-0.5 mb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Engineering & Production Experience</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">[Google XYZ Impact Calibrated]</span>
            </div>
            <ExperienceSection items={experience} />
          </section>
        )}

        {/* Systems & Scale Projects */}
        {projects.length > 0 && (
          <section>
            <div className="flex items-center gap-2 pb-0.5 mb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Key Distributed Systems & Open Source</h2>
            </div>
            <ProjectsSection items={projects} />
          </section>
        )}

        {/* Education & Academic Rigor */}
        {education.length > 0 && (
          <section>
            <div className="flex items-center gap-2 pb-0.5 mb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Education & Computer Science Fundamentals</h2>
            </div>
            <EducationSection items={education} />
          </section>
        )}

        {/* Patents / Certifications */}
        {certifications.length > 0 && (
          <section>
            <div className="flex items-center gap-2 pb-0.5 mb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Certifications & Honors</h2>
            </div>
            <CertificationsSection items={certifications} />
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <div className="flex items-center gap-2 pb-0.5 mb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Languages</h2>
            </div>
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 2. Meta E5 / Production SWE: Fast Iteration, High QPS Scale, GraphQL/React Core
export function MAANGSWEMeta({ resumeData, themeColor = "#0668E1" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="flex justify-between items-start pb-2.5 mb-2.5 border-b-2" style={{ borderColor: themeColor }}>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{personalInfo.fullName}</h1>
          <p className="text-xs font-bold mt-0.5" style={{ color: themeColor }}>
            {personalInfo.professionalTitle || "Senior Full Stack & Systems Engineer"}
          </p>
        </div>
        <div className="text-right">
          <ContactList personalInfo={personalInfo} className="flex-col items-end gap-0.5" separator="" />
        </div>
      </div>

      <div className="space-y-2.5">
        {professionalSummary && (
          <section className="bg-slate-50 p-2.5 rounded border-l-4" style={{ borderColor: themeColor }}>
            <p className="text-slate-700 leading-relaxed font-medium">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Production Impact & High-Concurrency Systems" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Technical Arsenal & Tooling" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Full-Stack Platforms & Tooling" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Academic Background" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" color={themeColor} />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" color={themeColor} />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 3. Amazon Bar-Raiser: Leadership Principles & Cost/Scale Metrics
export function MAANGSWEAmazon({ resumeData, themeColor = "#FF9900" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="text-center pb-1 mb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.professionalTitle && (
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-700 mt-0.5">
            {personalInfo.professionalTitle}
          </p>
        )}
        <ContactList personalInfo={personalInfo} className="justify-center mt-1.5" separator="|" />
        <hr className="border-t border-slate-300 mt-2 mb-2" />
      </div>

      <div className="space-y-2.5">
        {professionalSummary && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Executive Profile & Customer Obsession
            </div>
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300 flex justify-between">
              <span>Work History & Quantifiable Delivery</span>
              <span className="text-[10px] text-slate-500 font-mono">[Ownership • Bias for Action • Frugality]</span>
            </div>
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Cloud Infrastructure & Distributed Technologies
            </div>
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Distributed Systems & Multi-Region Services
            </div>
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Education & Credentials
            </div>
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Certifications & Honors
            </div>
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Languages
            </div>
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 4. Apple CoreOS & Hardware-Software Co-Design: Extreme Precision & Low Latency
export function MAANGAppleCoreOS({ resumeData, themeColor = "#333333" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="border-b border-slate-400 pb-2 mb-2 text-center">
        <h1 className="text-2xl font-light tracking-wide text-slate-900 uppercase">{personalInfo.fullName}</h1>
        <p className="text-xs tracking-wider text-slate-600 uppercase font-medium mt-0.5">{personalInfo.professionalTitle}</p>
        <ContactList personalInfo={personalInfo} className="justify-center mt-1" showIcons={false} separator="|" />
      </div>

      <div className="space-y-2">
        {professionalSummary && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Focus</h2>
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Core Proficiencies</h2>
            <SkillsSection categories={skills} pillVariant={false} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Engineering Experience</h2>
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Architectures & Systems</h2>
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Academics</h2>
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Certifications & Honors</h2>
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-900 pb-0.5 border-b border-slate-200 mb-1">Languages</h2>
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 5. Netflix Chaos & Distributed Systems: Resilient Microservices, High Density
export function MAANGNetflixChaos({ resumeData, themeColor = "#E50914" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="border-l-4 pl-3 py-1 mb-2.5" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{personalInfo.fullName}</h1>
        <p className="text-xs font-bold text-red-600 mt-0.5">{personalInfo.professionalTitle}</p>
        <ContactList personalInfo={personalInfo} className="mt-1" separator="•" />
      </div>

      <div className="space-y-2.5">
        {skills.length > 0 && (
          <section>
            <SectionHeading title="Distributed Systems & Streaming Arsenal" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Microservices, Resiliency & Production Engineering" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="High-Throughput Open Source & Platforms" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Research" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" color={themeColor} />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" color={themeColor} />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 6. Nvidia CUDA & Deep Learning Systems: GPU Kernels, TensorRT, High FLOPs
export function MAANGNvidiaGPU({ resumeData, themeColor = "#76B900" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="text-center pb-1 mb-2">
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 uppercase">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.professionalTitle && (
          <p className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-700 mt-0.5">
            {personalInfo.professionalTitle}
          </p>
        )}
        <ContactList personalInfo={personalInfo} className="justify-center mt-1.5 font-mono text-[11px]" separator="|" />
        <hr className="border-t border-slate-300 mt-2 mb-2" />
      </div>

      <div className="space-y-2.5">
        {skills.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-slate-300">
              <span className="w-2 h-2 bg-lime-500 rounded-sm" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-900">Accelerated Computing & Kernel Stack</h2>
            </div>
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-slate-300">
              <span className="w-2 h-2 bg-lime-500 rounded-sm" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-900">GPU Systems & Distributed Inference Experience</h2>
            </div>
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-slate-300">
              <span className="w-2 h-2 bg-lime-500 rounded-sm" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-900">Low-Level Optimizations & Benchmarks</h2>
            </div>
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-slate-300">
              <span className="w-2 h-2 bg-lime-500 rounded-sm" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-900">Education & Computer Engineering Rigor</h2>
            </div>
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-slate-300">
              <span className="w-2 h-2 bg-lime-500 rounded-sm" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-900">Certifications & Honors</h2>
            </div>
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-slate-300">
              <span className="w-2 h-2 bg-lime-500 rounded-sm" />
              <h2 className="text-xs font-mono font-bold uppercase text-slate-900">Languages</h2>
            </div>
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 7. Stripe FinTech Infrastructure: 99.999% Availability & Idempotent Transactions
export function MAANGStripeFinTech({ resumeData, themeColor = "#635BFF" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="border-b-2 pb-2 mb-2.5 flex justify-between items-baseline" style={{ borderColor: themeColor }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personalInfo.fullName}</h1>
          <p className="text-xs font-semibold text-indigo-600 mt-0.5">{personalInfo.professionalTitle}</p>
        </div>
        <div className="text-right">
          <ContactList personalInfo={personalInfo} className="flex-col items-end gap-0.5" separator="" />
        </div>
      </div>

      <div className="space-y-2.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Infrastructure Reliability & Ledger Guarantees" color={themeColor} />
            <p className="text-slate-700 leading-relaxed">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Mission-Critical Systems & Payment Pipelines" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Technical Proficiencies" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Distributed Datastores & High-Availability Services" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Education & Foundations" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" color={themeColor} />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" color={themeColor} />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 8. OpenAI / Anthropic LLM Infrastructure: Training Clusters, Slurm, vLLM, Megatron
export function MAANGOpenAIAI({ resumeData, themeColor = "#10A37F" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="pb-2.5 mb-2.5 border-b-2 flex justify-between items-start" style={{ borderColor: themeColor }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personalInfo.fullName}</h1>
          </div>
          <p className="text-xs font-mono font-semibold text-emerald-700 mt-0.5 ml-5">{personalInfo.professionalTitle}</p>
        </div>
        <div className="text-right">
          <ContactList personalInfo={personalInfo} className="flex-col items-end gap-0.5 font-mono text-[11px]" separator="" />
        </div>
      </div>

      <div className="space-y-2.5">
        {professionalSummary && (
          <section>
            <SectionHeading title="Technical Focus & LLM Specialization" color={themeColor} />
            <p className="text-slate-700 leading-relaxed font-medium">{professionalSummary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionHeading title="Distributed AI & LLM Systems Stack" color={themeColor} />
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionHeading title="Cluster Orchestration & Model Scaling Experience" color={themeColor} />
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionHeading title="Inference Acceleration & RLHF Pipelines" color={themeColor} />
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionHeading title="Academic Background & Research Credentials" color={themeColor} />
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionHeading title="Certifications & Honors" color={themeColor} />
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <SectionHeading title="Languages" color={themeColor} />
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 9. FAANG Staff / Principal Engineer (L6/L7+): Cross-Org Leadership & Multi-Year Roadmaps
export function MAANGStaffPrincipal({ resumeData, themeColor = "#0f172a" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="border-b-2 border-slate-900 pb-2 mb-2.5 text-center">
        <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">{personalInfo.fullName}</h1>
        <p className="text-xs uppercase font-bold tracking-wider text-slate-600 mt-0.5">{personalInfo.professionalTitle}</p>
        <ContactList personalInfo={personalInfo} className="justify-center mt-1" separator="|" />
      </div>

      <div className="space-y-2.5">
        {professionalSummary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Architectural Vision & Org-Wide Leadership
            </h2>
            <p className="text-slate-700 leading-relaxed font-serif text-[12.5px] italic">{professionalSummary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Leadership, Strategic Impact & Multi-Team Execution
            </h2>
            <ExperienceSection items={experience} />
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Architecture & Strategic Technologies
            </h2>
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Foundational Architecture & Standards
            </h2>
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Education & Honors
            </h2>
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Certifications & Honors
            </h2>
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 border-b border-slate-300 mb-1">
              Languages
            </h2>
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 10. FAANG SRE & Production Engineering: Error Budgets, Incident Remediation, SLI/SLO
export function MAANGSREPlatform({ resumeData, themeColor = "#0284c7" }) {
  const { personalInfo = {}, professionalSummary, experience = [], projects = [], skills = [], education = [], certifications = [], languages = [] } = resumeData;

  return (
    <div className="text-slate-900 leading-normal font-sans text-xs">
      <div className="text-center pb-1 mb-2">
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 uppercase">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.professionalTitle && (
          <p className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-700 mt-0.5">
            {personalInfo.professionalTitle}
          </p>
        )}
        <ContactList personalInfo={personalInfo} className="justify-center mt-1.5 font-mono text-[11px]" separator="|" />
        <hr className="border-t border-slate-300 mt-2 mb-2" />
      </div>

      <div className="space-y-2.5">
        {skills.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300 flex justify-between">
              <span>Platform & Observability Arsenal</span>
              <span className="text-[10px] text-slate-500 font-mono">[99.999% SLA • Zero-Outage]</span>
            </div>
            <SkillsSection categories={skills} pillVariant={true} />
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Site Reliability & Production Engineering History
            </div>
            <ExperienceSection items={experience} />
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Chaos Engineering, Tooling & Automation
            </div>
            <ProjectsSection items={projects} />
          </section>
        )}

        {education.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Education & Honors
            </div>
            <EducationSection items={education} />
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Certifications & Honors
            </div>
            <CertificationsSection items={certifications} />
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-0.5 mb-1 border-b border-slate-300">
              Languages
            </div>
            <LanguagesSection items={languages} />
          </section>
        )}
      </div>
    </div>
  );
}

// 11. Generic MAANG Template Dispatcher
export function MAANGTemplateRouter({ templateId, resumeData, themeColor }) {
  const id = templateId || "maang-01";

  if (id === "maang-01" || id === "maang-10" || id === "maang-12" || id === "maang-23") {
    return <MAANGSWEGoogle resumeData={resumeData} themeColor={themeColor || "#1a73e8"} />;
  }
  if (id === "maang-02" || id === "maang-11" || id === "maang-21") {
    return <MAANGSWEMeta resumeData={resumeData} themeColor={themeColor || "#0668E1"} />;
  }
  if (id === "maang-03" || id === "maang-17" || id === "maang-18") {
    return <MAANGSWEAmazon resumeData={resumeData} themeColor={themeColor || "#FF9900"} />;
  }
  if (id === "maang-04" || id === "maang-22") {
    return <MAANGAppleCoreOS resumeData={resumeData} themeColor={themeColor || "#333333"} />;
  }
  if (id === "maang-05") {
    return <MAANGNetflixChaos resumeData={resumeData} themeColor={themeColor || "#E50914"} />;
  }
  if (id === "maang-07" || id === "maang-25") {
    return <MAANGNvidiaGPU resumeData={resumeData} themeColor={themeColor || "#76B900"} />;
  }
  if (id === "maang-08" || id === "maang-24") {
    return <MAANGStripeFinTech resumeData={resumeData} themeColor={themeColor || "#635BFF"} />;
  }
  if (id === "maang-09" || id === "maang-19") {
    return <MAANGOpenAIAI resumeData={resumeData} themeColor={themeColor || "#10A37F"} />;
  }
  if (id === "maang-15" || id === "maang-16") {
    return <MAANGStaffPrincipal resumeData={resumeData} themeColor={themeColor || "#0f172a"} />;
  }
  if (id === "maang-13" || id === "maang-14" || id === "maang-20" || id.startsWith("infra-")) {
    return <MAANGSREPlatform resumeData={resumeData} themeColor={themeColor || "#0284c7"} />;
  }

  // Fallback to Google standard
  return <MAANGSWEGoogle resumeData={resumeData} themeColor={themeColor || "#1a73e8"} />;
}
