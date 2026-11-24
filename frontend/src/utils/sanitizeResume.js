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

export function sanitizeResumeData(data) {
  if (!data || typeof data !== 'object') return data;
  const cleaned = { ...data };

  if (cleaned.professionalSummary) {
    cleaned.professionalSummary = sanitizeResumeText(cleaned.professionalSummary);
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
  }

  if (Array.isArray(cleaned.education)) {
    cleaned.education = cleaned.education.map(edu => ({
      ...edu,
      institution: sanitizeResumeText(edu.institution),
      degree: sanitizeResumeText(edu.degree),
      fieldOfStudy: sanitizeResumeText(edu.fieldOfStudy),
      description: sanitizeResumeText(edu.description)
    }));
  }

  return cleaned;
}
