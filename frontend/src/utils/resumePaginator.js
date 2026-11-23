/**
 * Resume Paginator Utility & Hook
 * Automatically partitions resume sections and items into discrete A4 pages (210mm x 297mm).
 * Prevents text cut-off across page boundaries and handles multi-page preview & PDF export.
 */
import { useMemo } from 'react';

/**
 * Calculates estimated heights of resume sections and assigns them to discrete pages
 * A4 height = 297mm ≈ 1122.5px at 96 DPI
 * 18mm padding top and bottom = 36mm ≈ 136px
 * Available printable content height = 986px.
 * Using 930px for Page 1 and 920px for continuation pages gives safe margins.
 */
export function paginateResume(resumeData, options = {}) {
  if (!resumeData) return [{}];

  const PAGE_1_MAX = options.page1Max || 925;
  const PAGE_CONT_MAX = options.pageContMax || 910;

  const personalInfo = resumeData.personalInfo || {};
  const professionalSummary = resumeData.professionalSummary || '';
  const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
  const education = Array.isArray(resumeData.education) ? resumeData.education : [];
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
  const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];
  const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  const languages = Array.isArray(resumeData.languages) ? resumeData.languages : [];
  const customSections = Array.isArray(resumeData.customSections) ? resumeData.customSections : [];

  // Helper height calculators (in pixels)
  const calcHeaderHeight = () => {
    let h = 55; // Name
    if (personalInfo.professionalTitle) h += 20;
    if (personalInfo.email || personalInfo.phone || personalInfo.location || personalInfo.linkedin) h += 26;
    return Math.max(75, h);
  };

  const calcSummaryHeight = () => {
    if (!professionalSummary) return 0;
    // Section header (26px) + body text (~18px per 85 chars) + margins
    const lines = Math.ceil(professionalSummary.length / 85);
    return 28 + (lines * 18) + 12;
  };

  const calcJobHeight = (job) => {
    let h = 30; // Title + company + dates
    if (job.responsibilities && job.responsibilities.length > 0) {
      h += job.responsibilities.reduce((acc, r) => acc + Math.max(18, Math.ceil(r.length / 80) * 18), 0);
    }
    if (job.achievements && job.achievements.length > 0) {
      h += 22;
    }
    return h + 14; // margin
  };

  const calcEduHeight = (edu) => {
    let h = 46; // Degree + institution + dates
    if (edu.description) h += Math.max(18, Math.ceil(edu.description.length / 80) * 16);
    return h + 10;
  };

  const calcProjHeight = (proj) => {
    let h = 28; // Title + links
    if (proj.description) h += Math.max(18, Math.ceil(proj.description.length / 80) * 16);
    if (proj.technologies && proj.technologies.length > 0) h += 24;
    if (proj.highlights && proj.highlights.length > 0) h += proj.highlights.length * 18;
    return h + 12;
  };

  const calcSkillsHeight = (skillsList) => {
    if (!skillsList || skillsList.length === 0) return 0;
    return 28 + skillsList.reduce((acc, cat) => {
      const textLen = (cat.category || '').length + (cat.items || []).join(', ').length;
      return acc + Math.max(22, Math.ceil(textLen / 70) * 20);
    }, 0) + 10;
  };

  const calcCertsHeight = (certs) => {
    if (!certs || certs.length === 0) return 0;
    return 28 + (certs.length * 24) + 10;
  };

  const calcLangsHeight = (langs) => {
    if (!langs || langs.length === 0) return 0;
    return 28 + Math.max(22, Math.ceil(langs.length / 3) * 22) + 10;
  };

  // Check total document height first
  const headerH = calcHeaderHeight();
  const summaryH = calcSummaryHeight();
  const expH = experience.reduce((acc, j) => acc + calcJobHeight(j), 0) + (experience.length ? 28 : 0);
  const eduH = education.reduce((acc, e) => acc + calcEduHeight(e), 0) + (education.length ? 28 : 0);
  const projH = projects.reduce((acc, p) => acc + calcProjHeight(p), 0) + (projects.length ? 28 : 0);
  const skillsH = calcSkillsHeight(skills);
  const certsH = calcCertsHeight(certifications);
  const langsH = calcLangsHeight(languages);

  const totalCalculatedHeight = headerH + summaryH + expH + eduH + projH + skillsH + certsH + langsH;

  const templateId = resumeData.templateId || options.templateId || '';
  const isTwoColumn = typeof templateId === 'string' && templateId.startsWith('modern-');

  // Handle Two-Column Modern templates specifically
  if (isTwoColumn) {
    const RIGHT_PAGE_1_MAX = options.rightPage1Max || 940;
    const RIGHT_PAGE_CONT_MAX = options.rightPageContMax || 920;
    const rightHeaderH = 80;
    const rightContentH = rightHeaderH + summaryH + expH + projH;

    if (rightContentH <= RIGHT_PAGE_1_MAX) {
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

  // Single page fits cleanly!
  if (totalCalculatedHeight <= PAGE_1_MAX) {
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

  // 1. Professional Summary
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

  // 2. Work Experience
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

  // 3. Education
  if (education.length > 0) {
    let eduHeadingAdded = false;
    for (const edu of education) {
      const eh = calcEduHeight(edu) + (eduHeadingAdded ? 0 : 28);
      if (currentHeight + eh > currentLimit && (currentPage.education.length > 0 || currentPage.experience.length > 0)) {
        advancePage();
        eduHeadingAdded = false;
      }
      currentPage.education.push(edu);
      currentHeight += calcEduHeight(edu) + (eduHeadingAdded ? 0 : 28);
      eduHeadingAdded = true;
    }
  }

  // 4. Projects
  if (projects.length > 0) {
    let projHeadingAdded = false;
    for (const proj of projects) {
      const ph = calcProjHeight(proj) + (projHeadingAdded ? 0 : 28);
      if (currentHeight + ph > currentLimit && (currentPage.projects.length > 0 || currentPage.education.length > 0 || currentPage.experience.length > 0)) {
        advancePage();
        projHeadingAdded = false;
      }
      currentPage.projects.push(proj);
      currentHeight += calcProjHeight(proj) + (projHeadingAdded ? 0 : 28);
      projHeadingAdded = true;
    }
  }

  // 5. Skills
  if (skills.length > 0) {
    const sh = calcSkillsHeight(skills);
    if (currentHeight + sh > currentLimit && (currentPage.projects.length > 0 || currentPage.education.length > 0 || currentPage.experience.length > 0)) {
      advancePage();
    }
    currentPage.skills = skills;
    currentHeight += sh;
  }

  // 6. Certifications
  if (certifications.length > 0) {
    const ch = calcCertsHeight(certifications);
    if (currentHeight + ch > currentLimit) {
      advancePage();
    }
    currentPage.certifications = certifications;
    currentHeight += ch;
  }

  // 7. Languages
  if (languages.length > 0) {
    const lh = calcLangsHeight(languages);
    if (currentHeight + lh > currentLimit) {
      advancePage();
    }
    currentPage.languages = languages;
    currentHeight += lh;
  }

  // 8. Custom Sections
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
  }, [resumeData, options]);

  return {
    pages,
    pageCount: pages.length,
    isMultiPage: pages.length > 1
  };
}
