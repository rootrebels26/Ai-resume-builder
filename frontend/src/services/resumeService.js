import { apiClient } from './api';

export const resumeService = {
  // Parse uploaded PDF or DOCX file
  async parseResumeFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post('/resume/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000,
    });
  },

  // Analyze ATS compatibility
  async analyzeATS(resumeData, jobDescription = '') {
    return await apiClient.post('/ats/analyze', {
      resume_data: resumeData,
      job_description: jobDescription,
    });
  },

  // Analyze job description
  async analyzeJobDescription(payload) {
    return await apiClient.post('/jobs/analyze', payload);
  },

  // Tailor resume to a specific job description
  async tailorResume(resumeData, jobDescription, jobTitle = '') {
    return await apiClient.post('/resume/tailor', {
      resume_data: resumeData,
      job_description: jobDescription,
      job_title: jobTitle,
    });
  },

  // Match resume with job description (ATS match %, missing skills & keywords)
  async matchResume(resumeData, jobDescription, jobTitle = '') {
    return await apiClient.post('/jobs/match', {
      resume_data: resumeData,
      job_description: jobDescription,
      job_title: jobTitle,
    });
  },

  // Health check
  async checkHealth() {
    return await apiClient.get('/health');
  }
};
