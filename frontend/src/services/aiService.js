import { apiClient } from './api';

export const aiService = {
  async generateSummary(params) {
    return await apiClient.post('/ai/generate-summary', params);
  },

  async improveBullet(params) {
    return await apiClient.post('/ai/improve-bullet', params);
  },

  async improveProject(params) {
    return await apiClient.post('/ai/improve-project', params);
  },

  async reviewResume(resumeData) {
    return await apiClient.post('/ai/review-resume', { resume_data: resumeData });
  }
};
