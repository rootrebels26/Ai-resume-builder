import { TEMPLATE_REGISTRY, TEMPLATE_CATEGORIES } from '../constants/templateRegistry';

/**
 * Role to Industry & Category mapping heuristics
 */
const ROLE_MAPPINGS = [
  {
    keywords: ['software', 'developer', 'frontend', 'backend', 'full stack', 'web', 'react', 'node', 'python', 'java', 'cloud', 'devops', 'cyber', 'security', 'database', 'architect', 'systems', 'mobile', 'ios', 'android', 'embedded', 'qa', 'test'],
    category: 'software',
    industry: 'Technology & Software',
    suggestedLayouts: ['single-column', 'two-column', 'header-card'],
    prioritySections: ['summary', 'skills', 'experience', 'projects', 'certifications', 'education'],
  },
  {
    keywords: ['data', 'data scientist', 'machine learning', 'ai', 'analytics', 'data analyst', 'bi', 'business intelligence', 'big data', 'etl', 'deep learning', 'lakehouse', 'databricks', 'spark', 'llm'],
    category: 'datascience',
    industry: 'Data Science & AI/ML',
    suggestedLayouts: ['single-column', 'two-column'],
    prioritySections: ['summary', 'skills', 'experience', 'projects', 'publications', 'education'],
  },
  {
    keywords: ['designer', 'ui', 'ux', 'product designer', 'graphic', 'visual', 'creative', 'art', 'animator', 'video', 'content creator', 'media', 'photographer', 'actor'],
    category: 'creative',
    industry: 'Creative / Designer / Media',
    suggestedLayouts: ['sidebar-left', 'two-column', 'header-card'],
    prioritySections: ['summary', 'skills', 'projects', 'experience', 'education', 'awards'],
  },
  {
    keywords: ['product manager', 'project manager', 'scrum', 'agile', 'operations', 'business analyst', 'consultant', 'strategy', 'program manager', 'chief of staff', 'general manager'],
    category: 'business',
    industry: 'Business / Management',
    suggestedLayouts: ['two-column', 'single-column', 'header-card'],
    prioritySections: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'],
  },
  {
    keywords: ['finance', 'financial', 'accountant', 'accounting', 'auditor', 'tax', 'banking', 'investment', 'portfolio', 'cpa', 'risk', 'actuary', 'treasury', 'controller'],
    category: 'finance',
    industry: 'Finance / Accounting',
    suggestedLayouts: ['single-column', 'two-column', 'header-card'],
    prioritySections: ['summary', 'experience', 'certifications', 'skills', 'education'],
  },
  {
    keywords: ['marketing', 'seo', 'growth', 'brand', 'sales', 'account executive', 'social media', 'content strategist', 'copywriter', 'pr', 'public relations', 'e-commerce'],
    category: 'marketing',
    industry: 'Marketing / Sales',
    suggestedLayouts: ['two-column', 'sidebar-left', 'header-card'],
    prioritySections: ['summary', 'experience', 'skills', 'projects', 'education'],
  },
  {
    keywords: ['mechanical', 'electrical', 'civil', 'hardware', 'aerospace', 'chemical', 'robotics', 'quality', 'manufacturing', 'renewable', 'energy', 'materials'],
    category: 'engineering',
    industry: 'Engineering / Technical',
    suggestedLayouts: ['single-column', 'two-column', 'header-card'],
    prioritySections: ['summary', 'skills', 'experience', 'projects', 'certifications', 'education'],
  },
  {
    keywords: ['student', 'fresher', 'intern', 'graduate', 'entry level', 'junior', 'campus', 'hackathon'],
    category: 'student',
    industry: 'Student / Fresher / Internship',
    suggestedLayouts: ['two-column', 'single-column'],
    prioritySections: ['education', 'projects', 'skills', 'experience', 'certifications'],
  },
  {
    keywords: ['nurse', 'doctor', 'physician', 'medical', 'healthcare', 'clinical', 'pharmacist', 'therapist', 'professor', 'teacher', 'educator', 'principal', 'researcher', 'scientist'],
    category: 'healthcare',
    industry: 'Healthcare / Education / Research',
    suggestedLayouts: ['single-column', 'two-column', 'header-card'],
    prioritySections: ['summary', 'certifications', 'experience', 'education', 'skills'],
  },
  {
    keywords: ['traditional', 'corporate', 'federal', 'compliance', 'legal', 'lawyer', 'general', 'ats'],
    category: 'ats',
    industry: 'ATS-Friendly / Traditional',
    suggestedLayouts: ['single-column'],
    prioritySections: ['summary', 'skills', 'experience', 'education', 'certifications'],
  },
];

/**
 * Career level section order adaptations
 */
export const CAREER_LEVEL_CONFIGS = {
  student: {
    label: 'Student',
    recommendedOrder: ['education', 'projects', 'skills', 'experience', 'certifications', 'interests'],
    summaryHint: 'Focus on relevant coursework, academic honors, hands-on projects, and internships.',
  },
  fresher: {
    label: 'Fresher / Entry-Level',
    recommendedOrder: ['education', 'skills', 'projects', 'experience', 'certifications', 'interests'],
    summaryHint: 'Highlight foundational technical competencies, key capstone projects, and fast learner mindset.',
  },
  mid: {
    label: 'Mid-Level Professional (2-5 yrs)',
    recommendedOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'],
    summaryHint: 'Emphasize measurable impact, delivered projects, and growing technical/business ownership.',
  },
  senior: {
    label: 'Senior Professional (5-10 yrs)',
    recommendedOrder: ['summary', 'skills', 'experience', 'projects', 'certifications', 'education'],
    summaryHint: 'Lead with architecture, business outcomes, mentoring, system design, and technology leadership.',
  },
  executive: {
    label: 'Executive / Director (10+ yrs)',
    recommendedOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'awards'],
    summaryHint: 'Focus on strategic vision, P&L, revenue growth, team scaling, and cross-functional leadership.',
  },
  academic: {
    label: 'Academic / Researcher',
    recommendedOrder: ['summary', 'education', 'experience', 'publications', 'skills', 'certifications', 'awards'],
    summaryHint: 'Highlight citations, research methodologies, peer-reviewed publications, and grant funding.',
  },
};

/**
 * Recommend templates based on role title, experience level, and industry
 */
export function recommendTemplates({
  jobTitle = '',
  careerLevel = 'mid',
  industry = '',
  limit = 6,
} = {}) {
  const titleLower = (jobTitle || '').toLowerCase().trim();
  const industryLower = (industry || '').toLowerCase().trim();

  // Find best match in role mappings
  let matchedRule = ROLE_MAPPINGS.find(rule => 
    rule.keywords.some(kw => titleLower.includes(kw))
  );

  // If no match by title, check industry
  if (!matchedRule && industryLower) {
    matchedRule = ROLE_MAPPINGS.find(rule =>
      rule.industry.toLowerCase().includes(industryLower) ||
      rule.keywords.some(kw => industryLower.includes(kw))
    );
  }

  // Score each template in the registry
  const scoredTemplates = TEMPLATE_REGISTRY.map(tpl => {
    let score = 0;

    // Category match
    if (matchedRule && (tpl.categoryId === matchedRule.category || tpl.category === matchedRule.category)) {
      score += 40;
    }

    // Role tags match
    if (tpl.roles && tpl.roles.some(r => titleLower.includes(r.toLowerCase()) || r.toLowerCase().includes(titleLower))) {
      score += 35;
    }

    // Industry match
    if (matchedRule && tpl.industry && tpl.industry.toLowerCase().includes(matchedRule.industry.toLowerCase())) {
      score += 20;
    }

    // Career level match
    if (tpl.experienceLevels && tpl.experienceLevels.includes(careerLevel)) {
      score += 25;
    }

    // Suggested layout match
    if (matchedRule && matchedRule.suggestedLayouts.includes(tpl.layout)) {
      score += 15;
    }

    // High ATS score bonus
    if (tpl.atsScore >= 98) {
      score += 10;
    }

    return {
      template: tpl,
      score,
    };
  });

  // Sort descending by score
  scoredTemplates.sort((a, b) => b.score - a.score);

  const topTemplates = scoredTemplates.slice(0, limit).map(item => item.template);

  // Fallback: if topTemplates has fewer than limit, fill with ATS/Modern
  if (topTemplates.length < limit) {
    const existingIds = new Set(topTemplates.map(t => t.id));
    for (const tpl of TEMPLATE_REGISTRY) {
      if (!existingIds.has(tpl.id)) {
        topTemplates.push(tpl);
        existingIds.add(tpl.id);
        if (topTemplates.length >= limit) break;
      }
    }
  }

  return {
    recommendations: topTemplates,
    matchedCategory: matchedRule ? matchedRule.category : 'ats',
    matchedIndustry: matchedRule ? matchedRule.industry : 'General',
    suggestedSectionOrder: (CAREER_LEVEL_CONFIGS[careerLevel] || CAREER_LEVEL_CONFIGS.mid).recommendedOrder,
    summaryAdvice: (CAREER_LEVEL_CONFIGS[careerLevel] || CAREER_LEVEL_CONFIGS.mid).summaryHint,
  };
}

/**
 * Filter and search templates in the registry
 */
export function filterTemplates({
  category = 'all',
  searchQuery = '',
  experienceLevel = 'all',
  industry = 'all',
  layout = 'all',
  minAtsScore = 0,
  favorites = [],
  onlyFavorites = false,
}) {
  const query = searchQuery.toLowerCase().trim();

  return TEMPLATE_REGISTRY.filter(tpl => {
    // Favorites only
    if (onlyFavorites && !favorites.includes(tpl.id)) {
      return false;
    }

    // Category filter
    if (category !== 'all' && tpl.category !== category) {
      return false;
    }

    // Experience level filter
    if (experienceLevel !== 'all' && tpl.experienceLevels && !tpl.experienceLevels.includes(experienceLevel)) {
      return false;
    }

    // Industry filter
    if (industry !== 'all' && tpl.industry.toLowerCase() !== industry.toLowerCase()) {
      return false;
    }

    // Layout filter
    if (layout !== 'all' && tpl.layout !== layout) {
      return false;
    }

    // Min ATS score filter
    if (minAtsScore > 0 && tpl.atsScore < minAtsScore) {
      return false;
    }

    // Search query matching
    if (query) {
      const matchName = tpl.name.toLowerCase().includes(query);
      const matchDesc = tpl.description.toLowerCase().includes(query);
      const matchIndustry = tpl.industry.toLowerCase().includes(query);
      const matchRole = tpl.roles && tpl.roles.some(r => r.toLowerCase().includes(query));
      if (!matchName && !matchDesc && !matchIndustry && !matchRole) {
        return false;
      }
    }

    return true;
  });
}
