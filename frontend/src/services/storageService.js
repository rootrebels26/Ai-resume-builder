import Dexie from 'dexie';
import { INITIAL_RESUME_DATA } from '../constants/initialResumeData';

class ResumeDatabase extends Dexie {
  constructor() {
    super('AIResumeBuilderDB');
    this.version(1).stores({
      drafts: 'id, title, updatedAt, createdAt, templateId'
    });
  }
}

export const db = new ResumeDatabase();

export const storageService = {
  // Get all drafts
  async getAllDrafts() {
    try {
      const drafts = await db.drafts.orderBy('updatedAt').reverse().toArray();
      return drafts;
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
        title: title || resumeData.personalInfo?.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'Untitled Resume',
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
      return true;
    } catch (e) {
      console.error('Dexie clearAll error:', e);
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
