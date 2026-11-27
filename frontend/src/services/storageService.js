import Dexie from 'dexie';
import { INITIAL_RESUME_DATA } from '../constants/initialResumeData';

export const INITIAL_WIZARD_STATE = {
  id: 'active_wizard_session',
  currentStep: 1, // 1: Template Selection, 2: Target Job, 3: Creation Method, 4: Guided Info, 5: AI Optimization, 6: ATS Audit, 7: Final Resume
  selectedTemplateId: 'ats-01',
  selectedJob: {
    role: '',
    company: '',
    location: '',
    url: '',
    description: '',
    isSkipped: false
  },
  jobAnalysis: null,
  creationMethod: 'scratch', // 'scratch' | 'upload'
  resumeData: INITIAL_RESUME_DATA,
  optimizationResults: null,
  atsResults: null,
  updatedAt: new Date().toISOString()
};

class ResumeDatabase extends Dexie {
  constructor() {
    super('AIResumeBuilderDB');
    this.version(2).stores({
      drafts: 'id, title, updatedAt, createdAt, templateId',
      wizard: 'id, updatedAt, currentStep, selectedTemplateId'
    });
    this.version(3).stores({
      drafts: 'id, title, updatedAt, createdAt, templateId',
      wizard: 'id, updatedAt, currentStep, selectedTemplateId',
      career: 'id, updatedAt, resumeFingerprint'
    });
  }
}

export const db = new ResumeDatabase();

export const storageService = {
  // Wizard State Persistence
  async getWizardState() {
    try {
      const state = await db.wizard.get('active_wizard_session');
      return state || null;
    } catch (e) {
      console.error('Dexie getWizardState error:', e);
      return null;
    }
  },

  async saveWizardState(wizardState) {
    try {
      const record = {
        ...wizardState,
        id: 'active_wizard_session',
        updatedAt: new Date().toISOString()
      };
      await db.wizard.put(record);
      return record;
    } catch (e) {
      console.error('Dexie saveWizardState error:', e);
    }
  },

  async clearWizardState() {
    try {
      await db.wizard.delete('active_wizard_session');
    } catch (e) {
      console.error('Dexie clearWizardState error:', e);
    }
  },

  // Get all drafts
  async getAllDrafts() {
    try {
      return await db.drafts.orderBy('updatedAt').reverse().toArray();
    } catch (e) {
      console.error('Dexie getAllDrafts error:', e);
      return [];
    }
  },

  // Get single draft by id
  async getDraft(id) {
    try {
      return await db.drafts.get(id);
    } catch (e) {
      console.error('Dexie getDraft error:', e);
      return null;
    }
  },

  // Save or update draft
  async saveDraft(id, title, resumeData) {
    try {
      const now = new Date().toISOString();
      const existing = await db.drafts.get(id);
      const draftRecord = {
        id: id || `draft_${Date.now()}`,
        title: title || (resumeData.personalInfo?.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'Untitled Resume'),
        templateId: resumeData.templateId || 'ats-01',
        data: resumeData,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      };
      await db.drafts.put(draftRecord);
      return draftRecord;
    } catch (e) {
      console.error('Dexie saveDraft error:', e);
      throw e;
    }
  },

  // Delete draft
  async deleteDraft(id) {
    try {
      await db.drafts.delete(id);
      return true;
    } catch (e) {
      console.error('Dexie deleteDraft error:', e);
      return false;
    }
  },

  // Clear all drafts
  async clearAll() {
    try {
      await db.drafts.clear();
      await db.wizard.clear();
      if (db.career) await db.career.clear();
      return true;
    } catch (e) {
      console.error('Dexie clearAll error:', e);
      return false;
    }
  },

  // Career Recommendation State Persistence
  async getCareerState() {
    try {
      const state = await db.career.get('active_career_state');
      return state || null;
    } catch (e) {
      console.error('Dexie getCareerState error:', e);
      return null;
    }
  },

  async saveCareerState(careerState) {
    try {
      const existing = (await db.career.get('active_career_state')) || {};
      const record = {
        ...existing,
        ...careerState,
        id: 'active_career_state',
        updatedAt: new Date().toISOString()
      };
      await db.career.put(record);
      return record;
    } catch (e) {
      console.error('Dexie saveCareerState error:', e);
      return null;
    }
  },

  async toggleSavedRole(role) {
    try {
      const existing = (await db.career.get('active_career_state')) || {
        id: 'active_career_state',
        savedRoles: []
      };
      const saved = Array.isArray(existing.savedRoles) ? [...existing.savedRoles] : [];
      const idx = saved.findIndex((r) => r.id === role.id || r.title === role.title);
      if (idx >= 0) {
        saved.splice(idx, 1);
      } else {
        saved.push({ ...role, savedAt: new Date().toISOString() });
      }
      const next = { ...existing, savedRoles: saved, updatedAt: new Date().toISOString() };
      await db.career.put(next);
      return saved;
    } catch (e) {
      console.error('Dexie toggleSavedRole error:', e);
      return [];
    }
  },

  async clearCareerState() {
    try {
      await db.career.delete('active_career_state');
      return true;
    } catch (e) {
      console.error('Dexie clearCareerState error:', e);
      return false;
    }
  },

  // Export resume data to JSON file
  exportJSON(resumeData, filename = 'resume.json') {
    const jsonStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import JSON file and parse into resumeData
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.schemaVersion && !parsed.personalInfo) {
            throw new Error('Invalid resume schema file format.');
          }
          resolve(parsed);
        } catch (err) {
          reject(new Error('Failed to parse resume JSON file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed.'));
      reader.readAsText(file);
    });
  }
};
