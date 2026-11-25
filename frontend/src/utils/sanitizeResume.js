/**
 * Sanitizes resume text by stripping out unwanted parsing artifacts
 * such as --- [PAGE 1] --- or [SECTION: ...] markers.
 */
export function sanitizeResumeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/---\s*\[PAGE\s*\d+\]\s*---/gi, '')
    .replace(/\[PAGE\s*\d+\]/gi, '')
    .replace(/\[SECTION:[^\]]+\]/gi, '')
    .trim();
}

/**
 * Strips leading contact artifacts and noisy headers from summary text.
 */
export function cleanSummaryText(str) {
  if (typeof str !== 'string') return '';
  let s = sanitizeResumeText(str);

  // Recursively remove leading contact keywords or phone prefixes that leaked into summary
  for (let i = 0; i < 5; i++) {
    s = s.replace(/^(?:email|contact|phone|mobile|tel|telephone|cell|linkedin|github|portfolio|website|location|address)[\s:,-]*/i, '');
    s = s.replace(/^(?:professional\s+summary|summary|profile|about\s+me|career\s+objective|executive\s+summary)[\s:,-]*/i, '');
    s = s.replace(/^(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b[\s:,-]*/i, '');
    s = s.replace(/^\+\d{2}\s*\d{10}\b[\s:,-]*/i, '');
    s = s.replace(/^\d{10}\b[\s:,-]*/i, '');
    s = s.trim();
  }
  return s;
}

export function sanitizeResumeData(data) {
  if (!data || typeof data !== 'object') return data;
  const cleaned = { ...data };

  if (cleaned.professionalSummary) {
    cleaned.professionalSummary = cleanSummaryText(cleaned.professionalSummary);
  }

  if (cleaned.personalInfo) {
    cleaned.personalInfo = {
      ...cleaned.personalInfo,
      fullName: sanitizeResumeText(cleaned.personalInfo.fullName),
      professionalTitle: sanitizeResumeText(cleaned.personalInfo.professionalTitle),
      location: sanitizeResumeText(cleaned.personalInfo.location),
      email: sanitizeResumeText(cleaned.personalInfo.email),
      phone: sanitizeResumeText(cleaned.personalInfo.phone),
      website: sanitizeResumeText(cleaned.personalInfo.website),
      linkedin: sanitizeResumeText(cleaned.personalInfo.linkedin),
      github: sanitizeResumeText(cleaned.personalInfo.github),
      portfolio: sanitizeResumeText(cleaned.personalInfo.portfolio),
    };
  }

  if (Array.isArray(cleaned.experience)) {
    cleaned.experience = cleaned.experience.map(exp => ({
      ...exp,
      position: sanitizeResumeText(exp.position),
      company: sanitizeResumeText(exp.company),
      responsibilities: Array.isArray(exp.responsibilities)
        ? exp.responsibilities.map(r => sanitizeResumeText(r)).filter(Boolean)
        : []
    }));
  }

  if (Array.isArray(cleaned.projects)) {
    cleaned.projects = cleaned.projects.map(proj => ({
      ...proj,
      name: sanitizeResumeText(proj.name),
      description: sanitizeResumeText(proj.description),
      highlights: Array.isArray(proj.highlights)
        ? proj.highlights.map(h => sanitizeResumeText(h)).filter(Boolean)
        : []
    }));
  } else {
    cleaned.projects = [];
  }

  // Universal fallback for projects: if 0 projects but experience exists, derive key systems
  // (Guard: NEVER re-derive on continuation pages Page 2+ to prevent duplicating sections)
  if (!cleaned.isContinuation && cleaned.projects.length === 0 && Array.isArray(cleaned.experience) && cleaned.experience.length > 0) {
    const actionWords = ['architected', 'designed', 'developed', 'engineered', 'built', 'created', 'implemented', 'orchestrated', 'automated'];
    const derived = [];
    for (const exp of cleaned.experience) {
      for (const resp of (exp.responsibilities || [])) {
        const rLower = resp.toLowerCase().slice(0, 30);
        if (actionWords.some(w => rLower.includes(w))) {
          const firstClause = resp.split(/[,;]|\susing\s|\swith\s|\sfor\s/i)[0];
          let title = firstClause.replace(/^(?:designed|architected|developed|engineered|built|created|implemented|orchestrated|automated)\s+(?:and\s+\w+\s+)?/i, '').trim();
          title = title.slice(0, 50).trim();
          if (title.length > 8) {
            // Capitalize title
            const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
            derived.push({
              id: `proj-der-${derived.length + 1}`,
              name: capitalizedTitle,
              description: resp,
              technologies: [],
              githubUrl: '',
              liveUrl: '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              highlights: [resp]
            });
            if (derived.length >= 4) break;
          }
        }
      }
      if (derived.length >= 4) break;
    }
    if (derived.length > 0) {
      cleaned.projects = derived;
    }
  }

  if (Array.isArray(cleaned.education)) {
    cleaned.education = cleaned.education.map(edu => ({
      ...edu,
      institution: sanitizeResumeText(edu.institution),
      degree: sanitizeResumeText(edu.degree),
      fieldOfStudy: sanitizeResumeText(edu.fieldOfStudy),
      description: sanitizeResumeText(edu.description)
    }));
  } else {
    cleaned.education = [];
  }

  // Universal fallback for education: ensure at least 1 education entry exists
  if (cleaned.education.length === 0) {
    const title = cleaned.personalInfo?.professionalTitle || '';
    const isTech = /engineer|architect|developer|data|scientist/i.test(title);
    cleaned.education = [{
      id: 'edu-primary-1',
      institution: 'University / Institute of Technology',
      degree: isTech ? 'Bachelor of Engineering (B.Tech / B.E.)' : 'Bachelor of Science / Business',
      fieldOfStudy: isTech ? 'Computer Science & Engineering' : 'Information Systems',
      startDate: '',
      endDate: '',
      cgpa: '',
      description: 'Graduated with Honors. Click to update institution name and details.'
    }];
  }

  // Fallback for summary if missing
  if (!cleaned.professionalSummary || cleaned.professionalSummary.length < 20) {
    const profRole = cleaned.personalInfo?.professionalTitle || (cleaned.experience?.[0]?.position) || 'Professional';
    cleaned.professionalSummary = `Accomplished ${profRole} with proven expertise in designing, architecting, and delivering enterprise solutions, mentoring engineering teams, and driving operational excellence.`;
  }

  return cleaned;
}
