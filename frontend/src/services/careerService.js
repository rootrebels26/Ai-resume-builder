import { apiClient } from './api';

export const careerService = {
  /**
   * Compute a lightweight deterministic fingerprint of the resume fields used for
   * career analysis so unchanged resumes reuse the cached Dexie result.
   */
  computeResumeFingerprint(resumeData, preferences = {}) {
    const pinfo = resumeData?.personalInfo || {};
    const payload = {
      headline: pinfo.professionalTitle || pinfo.headline || '',
      summary: resumeData?.professionalSummary || '',
      education: resumeData?.education || [],
      experience: resumeData?.experience || [],
      internships: resumeData?.internships || [],
      projects: resumeData?.projects || [],
      skills: resumeData?.skills || [],
      certifications: resumeData?.certifications || [],
      customSections: resumeData?.customSections || [],
      preferences: {
        locationType: preferences.locationType || 'none',
        location: preferences.location || '',
        workMode: preferences.workMode || 'any',
        jobType: preferences.jobType || 'any',
      },
    };
    const str = JSON.stringify(payload);
    let hash = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `fp_${(hash >>> 0).toString(16)}`;
  },

  async checkHealth() {
    return apiClient.get('/career/health');
  },

  async analyzeResume(resumeData, preferences = {}, forceRefresh = false) {
    return apiClient.post(
      '/career/analyze-resume',
      {
        resume_data: resumeData,
        preferences,
        force_refresh: forceRefresh,
      },
      { timeout: 45000 }
    );
  },

  async refreshRecommendations(resumeData, preferences = {}) {
    return apiClient.post(
      '/career/recommendations',
      {
        resume_data: resumeData,
        preferences,
        force_refresh: true,
      },
      { timeout: 45000 }
    );
  },

  async getRoleDetails(resumeData, role, preferences = {}) {
    return apiClient.post(
      '/career/role-details',
      {
        resume_data: resumeData,
        role,
        preferences,
      },
      { timeout: 30000 }
    );
  },

  /**
   * Client-side safe external search URL generator so changing location/job-type
   * filters updates external search links instantaneously without extra Gemini calls.
   */
  buildExternalSearchLinks(roleTitle, skills = [], preferences = {}, experienceLevel = '') {
    const parts = [roleTitle.trim()];
    const jobType = (preferences.jobType || 'any').toLowerCase();
    if (jobType === 'internship' && !roleTitle.toLowerCase().includes('intern')) {
      parts.push('Intern');
    } else if (['part-time', 'contract', 'freelance'].includes(jobType)) {
      parts.push(jobType.replace('-', ' '));
    }

    const cleanSkills = (skills || []).filter((s) => s && s.length <= 24).slice(0, 2);
    parts.push(...cleanSkills);
    if (preferences.workMode === 'remote' && !parts.join(' ').toLowerCase().includes('remote')) {
      parts.push('Remote');
    }

    const query = parts.filter(Boolean).join(' ').trim();
    const locType = (preferences.locationType || 'none').toLowerCase();
    let location = '';
    if (locType === 'india') location = 'India';
    else if (locType === 'remote' || preferences.workMode === 'remote') location = 'Remote';
    else if (['city', 'custom'].includes(locType) && preferences.location) {
      location = preferences.location.trim();
    }

    const isRemote = preferences.workMode === 'remote' || locType === 'remote';
    const isInternship =
      jobType === 'internship' ||
      roleTitle.toLowerCase().includes('intern') ||
      ['intern', 'student'].includes((experienceLevel || '').toLowerCase());

    const slug = roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'jobs';
    const enc = encodeURIComponent;

    return [
      {
        platform: 'linkedin',
        label: 'Search on LinkedIn',
        query,
        url: `https://www.linkedin.com/jobs/search/?keywords=${enc(query)}${
          location && location.toLowerCase() !== 'remote' ? `&location=${enc(location)}` : ''
        }${isRemote ? '&f_WT=2' : ''}`,
      },
      {
        platform: 'indeed',
        label: 'Search on Indeed',
        query,
        url: `https://www.indeed.com/jobs?q=${enc(query)}${location ? `&l=${enc(location)}` : ''}`,
      },
      {
        platform: 'google_jobs',
        label: 'Search on Google Jobs',
        query: location ? `${query} ${location}` : `${query} jobs`,
        url: `https://www.google.com/search?q=${enc(
          location ? `${query} ${location}` : `${query} jobs`
        )}&ibp=htl;jobs`,
      },
      {
        platform: 'naukri',
        label: 'Search on Naukri',
        query,
        url: `https://www.naukri.com/${slug}-jobs?k=${enc(query)}${
          location && location.toLowerCase() !== 'remote' ? `&l=${enc(location)}` : ''
        }`,
      },
      {
        platform: 'wellfound',
        label: 'Search on Wellfound',
        query,
        url: `https://wellfound.com/jobs?q=${enc(query)}`,
      },
      {
        platform: 'internshala',
        label: 'Search on Internshala',
        query: roleTitle.trim(),
        url: `https://internshala.com/${isInternship ? 'internships' : 'jobs'}/keywords-${enc(
          roleTitle.trim()
        )}/`,
      },
      {
        platform: 'foundit',
        label: 'Search on Foundit',
        query,
        url: `https://www.foundit.in/srp/results?query=${enc(query)}${
          location && location.toLowerCase() !== 'remote' ? `&locations=${enc(location)}` : ''
        }`,
      },
      {
        platform: 'glassdoor',
        label: 'Search on Glassdoor',
        query,
        url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${enc(query)}`,
      },
    ];
  },
};
