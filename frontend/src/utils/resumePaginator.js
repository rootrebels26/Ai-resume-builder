/**
 * Resume Paginator Utility & Hook
 * Automatically partitions resume sections and items into discrete A4 pages (210mm x 297mm).
 * Prevents text cut-off across page boundaries and handles multi-page preview & PDF export.
 */
import { useMemo } from 'react';
import { sanitizeResumeData } from './sanitizeResume.js';

/**
 * Calculates estimated heights of resume sections and assigns them to discrete pages
 * A4 height = 297mm ≈ 1122.5px at 96 DPI
 * 18mm padding top and bottom = 36mm ≈ 136px
 * Footer area ≈ 26px
 * Printable content height safety threshold ≈ 890px (ensuring zero text clipping).
 */
export function paginateResume(rawResumeData, options = {}) {
  if (!rawResumeData) return [{}];
  const resumeData = sanitizeResumeData(rawResumeData);

  const forceTwoPages = options.forceTwoPages === true;
  const forceSinglePage = options.forceSinglePage === true;

  // Realistic thresholds calibrated for 18mm padding + footer
  const NATURAL_PAGE_1_MAX = options.page1Max || 890;
  const PAGE_CONT_MAX = options.pageContMax || 880;

  const personalInfo = resumeData.personalInfo || {};
  const professionalSummary = resumeData.professionalSummary || '';
  const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
  const education = Array.isArray(resumeData.education) ? resumeData.education : [];
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
  const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];
  const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  const languages = Array.isArray(resumeData.languages) ? resumeData.languages : [];
  const customSections = Array.isArray(resumeData.customSections) ? resumeData.customSections : [];

  // Calibrated height calculators matching real rendered DOM
  const calcHeaderHeight = () => {
    let h = 48; // Name + margins
    if (personalInfo.professionalTitle) h += 18;
    if (personalInfo.email || personalInfo.phone || personalInfo.location || personalInfo.linkedin) h += 22;
    return Math.max(68, h);
  };

  const calcSummaryHeight = () => {
    if (!professionalSummary) return 0;
    const lines = Math.ceil(professionalSummary.length / 90);
    return 24 + (lines * 16) + 8; // Header + lines + margins
  };

  const calcJobHeight = (job) => {
    let h = 26; // Title + company + dates
    if (job.responsibilities && job.responsibilities.length > 0) {
      h += job.responsibilities.reduce((acc, r) => acc + Math.max(16, Math.ceil(r.length / 90) * 16 + 4), 0);
    }
    if (job.achievements && job.achievements.length > 0) {
      h += 20;
    }
    return h + 8; // margin
  };

  const calcEduHeight = (edu) => {
    let h = 32; // Degree + institution + dates
    if (edu.cgpa) h += 16;
    if (edu.description) h += Math.max(16, Math.ceil(edu.description.length / 85) * 15);
    return h + 10;
  };

  const calcProjHeight = (proj) => {
    let h = 28; // Title + links
    if (proj.description) h += Math.max(16, Math.ceil(proj.description.length / 85) * 15);
    if (proj.technologies && proj.technologies.length > 0) h += 26; // Pill badges row
    if (proj.highlights && proj.highlights.length > 0) h += proj.highlights.length * 16;
    return h + 10;
  };

  const calcSkillsHeight = (skillsList) => {
    if (!skillsList || skillsList.length === 0) return 0;
    return 28 + skillsList.reduce((acc, cat) => {
      const textLen = (cat.category || '').length + (cat.items || []).join(', ').length;
      const lines = Math.max(1, Math.ceil(textLen / 70));
      return acc + (lines * 24) + 6;
    }, 0) + 8;
  };

  const calcCertsHeight = (certs) => {
    if (!certs || certs.length === 0) return 0;
    return 26 + (certs.length * 20) + 8;
  };

  const calcLangsHeight = (langs) => {
    if (!langs || langs.length === 0) return 0;
    return 24 + Math.max(18, Math.ceil(langs.length / 3) * 18) + 8;
  };

  // Check total document height first
  const headerH = calcHeaderHeight();
  const summaryH = calcSummaryHeight();
  const expH = experience.reduce((acc, j) => acc + calcJobHeight(j), 0) + (experience.length ? 24 : 0);
  const eduH = education.reduce((acc, e) => acc + calcEduHeight(e), 0) + (education.length ? 24 : 0);
  const projH = projects.reduce((acc, p) => acc + calcProjHeight(p), 0) + (projects.length ? 24 : 0);
  const skillsH = calcSkillsHeight(skills);
  const certsH = calcCertsHeight(certifications);
  const langsH = calcLangsHeight(languages);

  const totalCalculatedHeight = headerH + summaryH + expH + eduH + projH + skillsH + certsH + langsH;

  // When forceTwoPages is requested:
  // If the resume has ample content (>= NATURAL_PAGE_1_MAX), Page 1 MUST use its full natural capacity (890px).
  // This guarantees Page 1 is filled completely and professionally without premature pagination or awkward blank voids.
  // Only if total content is shorter than a single page do we balance the split.
  const PAGE_1_MAX = (forceTwoPages && totalCalculatedHeight < NATURAL_PAGE_1_MAX)
    ? Math.max(420, Math.round(totalCalculatedHeight * 0.55))
    : NATURAL_PAGE_1_MAX;

  const templateId = resumeData.templateId || options.templateId || '';
  const isTwoColumn = typeof templateId === 'string' && templateId.startsWith('modern-');

  // Handle Two-Column Modern templates specifically
  if (isTwoColumn) {
    const NATURAL_RIGHT_PAGE_1_MAX = options.rightPage1Max || 860;
    const RIGHT_PAGE_1_MAX = (forceTwoPages && rightContentH < NATURAL_RIGHT_PAGE_1_MAX)
      ? Math.max(400, Math.round(rightContentH * 0.55))
      : NATURAL_RIGHT_PAGE_1_MAX;
    const RIGHT_PAGE_CONT_MAX = options.rightPageContMax || 840;
    const rightHeaderH = 80;
    const rightContentH = rightHeaderH + summaryH + expH + projH;

    if (!forceTwoPages && (forceSinglePage || rightContentH <= RIGHT_PAGE_1_MAX)) {
      return [{
        ...resumeData,
        isContinuation: false,
        pageNumber: 1,
        totalPages: 1
      }];
    }

    const pages = [];
    let currentPage = {
      ...resumeData,
      professionalSummary: '',
      experience: [],
      education: education,
      projects: [],
      skills: skills,
      certifications,
      languages,
      customSections,
      isContinuation: false,
      pageNumber: 1
    };

    let currentLimit = RIGHT_PAGE_1_MAX;
    let currentHeight = rightHeaderH;

    const advanceTwoColumnPage = () => {
      pages.push(currentPage);
      currentPage = {
        ...resumeData,
        professionalSummary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        languages: [],
        customSections: [],
        isContinuation: true,
        pageNumber: pages.length + 1
      };
      currentHeight = 45;
      currentLimit = RIGHT_PAGE_CONT_MAX;
    };

    if (summaryH > 0) {
      currentPage.professionalSummary = professionalSummary;
      currentHeight += summaryH;
    }

    if (experience.length > 0) {
      let expHeadingAdded = false;
      for (const job of experience) {
        const jh = calcJobHeight(job) + (expHeadingAdded ? 0 : 28);
        if (currentHeight + jh > currentLimit && (currentPage.experience.length > 0 || currentHeight > 240)) {
          advanceTwoColumnPage();
          expHeadingAdded = false;
        }
        currentPage.experience.push(job);
        currentHeight += calcJobHeight(job) + (expHeadingAdded ? 0 : 28);
        expHeadingAdded = true;
      }
    }

    if (projects.length > 0) {
      let projHeadingAdded = false;
      for (const proj of projects) {
        const ph = calcProjHeight(proj) + (projHeadingAdded ? 0 : 28);
        if (currentHeight + ph > currentLimit && (currentPage.projects.length > 0 || currentPage.experience.length > 0)) {
          advanceTwoColumnPage();
          projHeadingAdded = false;
        }
        currentPage.projects.push(proj);
        currentHeight += calcProjHeight(proj) + (projHeadingAdded ? 0 : 28);
        projHeadingAdded = true;
      }
    }

    pages.push(currentPage);

    return pages.map((page, idx) => ({
      ...page,
      pageNumber: idx + 1,
      totalPages: pages.length
    }));
  }

  // Single page fits cleanly and not forced to 2 pages
  if (!forceTwoPages && (forceSinglePage || totalCalculatedHeight <= PAGE_1_MAX)) {
    return [{
      ...resumeData,
      isContinuation: false,
      pageNumber: 1,
      totalPages: 1
    }];
  }

  // Multi-page distribution
  const pages = [];
  let currentPage = {
    ...resumeData,
    professionalSummary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
    customSections: [],
    isContinuation: false,
    pageNumber: 1
  };

  let currentLimit = PAGE_1_MAX;
  let currentHeight = headerH;

  const advancePage = () => {
    pages.push(currentPage);
    currentPage = {
      ...resumeData,
      professionalSummary: '',
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      languages: [],
      customSections: [],
      isContinuation: true,
      pageNumber: pages.length + 1
    };
    currentHeight = 45; // Height of ContinuationHeader
    currentLimit = PAGE_CONT_MAX;
  };

  // Check template rendering order:
  // Only templates intentionally designed with skills before experience should paginate skills first:
  const skillsFirst = typeof templateId === 'string' && (
    templateId === 'maang-google' ||
    templateId.startsWith('student-')
  );

  // MAANG & developer templates (such as maang-meta, maang-amazon, developer-*) render:
  // Summary -> Experience -> Skills -> Projects -> Education
  const skillsBeforeProjects = typeof templateId === 'string' && (
    templateId.startsWith('maang-') ||
    templateId.startsWith('developer-') ||
    templateId.startsWith('data-') ||
    templateId.startsWith('executive-')
  );

  // 1. Summary
  if (summaryH > 0) {
    if (currentHeight + summaryH <= currentLimit) {
      currentPage.professionalSummary = professionalSummary;
      currentHeight += summaryH;
    } else {
      advancePage();
      currentPage.professionalSummary = professionalSummary;
      currentHeight += summaryH;
    }
  }

  // Helper function for adding skills
  const addSkillsSection = () => {
    if (skills.length > 0) {
      const sh = calcSkillsHeight(skills);
      if (currentHeight + sh > currentLimit && (currentHeight > 200 || currentPage.experience.length > 0)) {
        advancePage();
      }
      currentPage.skills = skills;
      currentHeight += sh;
    }
  };

  // Helper function for adding experience
  const addExperienceSection = () => {
    if (experience.length > 0) {
      let expHeadingAdded = false;
      for (const job of experience) {
        const jh = calcJobHeight(job) + (expHeadingAdded ? 0 : 28);
        if (currentHeight + jh > currentLimit && (currentPage.experience.length > 0 || currentHeight > 240)) {
          advancePage();
          expHeadingAdded = false;
        }
        currentPage.experience.push(job);
        currentHeight += calcJobHeight(job) + (expHeadingAdded ? 0 : 28);
        expHeadingAdded = true;
      }
    }
  };

  // Helper function for adding projects
  const addProjectsSection = () => {
    if (projects.length > 0) {
      let projHeadingAdded = false;
      for (const proj of projects) {
        const ph = calcProjHeight(proj) + (projHeadingAdded ? 0 : 28);
        if (currentHeight + ph > currentLimit && (currentPage.projects.length > 0 || currentPage.experience.length > 0 || currentPage.skills.length > 0)) {
          advancePage();
          projHeadingAdded = false;
        }
        currentPage.projects.push(proj);
        currentHeight += calcProjHeight(proj) + (projHeadingAdded ? 0 : 28);
        projHeadingAdded = true;
      }
    }
  };

  // Helper function for adding education
  const addEducationSection = () => {
    if (education.length > 0) {
      let eduHeadingAdded = false;
      for (const edu of education) {
        const eh = calcEduHeight(edu) + (eduHeadingAdded ? 0 : 28);
        if (currentHeight + eh > currentLimit && (currentPage.education.length > 0 || currentPage.experience.length > 0 || currentPage.projects.length > 0)) {
          advancePage();
          eduHeadingAdded = false;
        }
        currentPage.education.push(edu);
        currentHeight += calcEduHeight(edu) + (eduHeadingAdded ? 0 : 28);
        eduHeadingAdded = true;
      }
    }
  };

  // Execute in the exact visual order of the active template
  if (skillsFirst) {
    addSkillsSection();
    addExperienceSection();
    addProjectsSection();
    addEducationSection();
  } else if (skillsBeforeProjects) {
    addExperienceSection();
    addSkillsSection();
    addProjectsSection();
    addEducationSection();
  } else {
    addExperienceSection();
    addProjectsSection();
    addSkillsSection();
    addEducationSection();
  }

  // Certifications
  if (certifications.length > 0) {
    const ch = calcCertsHeight(certifications);
    if (currentHeight + ch > currentLimit && (currentHeight > 220 || currentPage.education.length > 0 || currentPage.projects.length > 0)) {
      advancePage();
    }
    currentPage.certifications = certifications;
    currentHeight += ch;
  }

  // Languages
  if (languages.length > 0) {
    const lh = calcLangsHeight(languages);
    if (currentHeight + lh > currentLimit && (currentHeight > 220 || currentPage.certifications.length > 0)) {
      advancePage();
    }
    currentPage.languages = languages;
    currentHeight += lh;
  }

  // Custom Sections
  if (customSections.length > 0) {
    if (currentHeight + 60 > currentLimit) {
      advancePage();
    }
    currentPage.customSections = customSections;
  }

  // Add final page
  pages.push(currentPage);

  // Set totalPages on all pages
  return pages.map((page, idx) => ({
    ...page,
    pageNumber: idx + 1,
    totalPages: pages.length
  }));
}

/**
 * React hook for live resume pagination
 */
export function useResumePagination(resumeData, options = {}) {
  const pages = useMemo(() => {
    return paginateResume(resumeData, options);
  }, [resumeData, options.forceTwoPages, options.forceSinglePage, options.page1Max, options.pageContMax]);

  return {
    pages,
    pageCount: pages.length,
    isMultiPage: pages.length > 1
  };
}
