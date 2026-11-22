import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_RESUME_DATA } from '../constants/initialResumeData';
import { storageService } from '../services/storageService';

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resumeData, setResumeData] = useState(() => {
    // Attempt to load active draft from localStorage if available
    try {
      const saved = localStorage.getItem('active_resume_data');
      return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
    } catch (e) {
      return INITIAL_RESUME_DATA;
    }
  });

  const [currentDraftId, setCurrentDraftId] = useState(() => {
    return localStorage.getItem('active_draft_id') || 'draft_default';
  });

  const [draftsList, setDraftsList] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Load drafts list on mount
  const refreshDraftsList = useCallback(async () => {
    const list = await storageService.getAllDrafts();
    setDraftsList(list);
  }, []);

  useEffect(() => {
    refreshDraftsList();
  }, [refreshDraftsList]);

  // Debounced auto-save to Dexie & localStorage
  useEffect(() => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        localStorage.setItem('active_resume_data', JSON.stringify(resumeData));
        localStorage.setItem('active_draft_id', currentDraftId);
        
        await storageService.saveDraft(
          currentDraftId,
          resumeData.personalInfo?.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'My Resume',
          resumeData
        );
        refreshDraftsList();
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to auto-save:', e);
        setSaveStatus('unsaved');
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resumeData, currentDraftId, refreshDraftsList]);

  // Helper actions for updating sections
  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateSummary = (value) => {
    setResumeData(prev => ({ ...prev, professionalSummary: value }));
  };

  const setTemplateId = (templateId) => {
    setResumeData(prev => ({ ...prev, templateId }));
  };

  const updatePreferences = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  // Section item handlers
  const updateSection = (sectionKey, updatedList) => {
    setResumeData(prev => ({ ...prev, [sectionKey]: updatedList }));
  };

  const addItemToSection = (sectionKey, defaultItem) => {
    const newItem = {
      id: `${sectionKey.slice(0, 3)}-${Date.now()}`,
      ...defaultItem
    };
    setResumeData(prev => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), newItem]
    }));
  };

  const removeItemFromSection = (sectionKey, id) => {
    setResumeData(prev => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] || []).filter(item => item.id !== id)
    }));
  };

  const updateItemInSection = (sectionKey, id, updatedFields) => {
    setResumeData(prev => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] || []).map(item => 
        item.id === id ? { ...item, ...updatedFields } : item
      )
    }));
  };

  // Load draft
  const loadDraft = async (id) => {
    const draft = await storageService.getDraft(id);
    if (draft && draft.data) {
      setCurrentDraftId(id);
      setResumeData(draft.data);
    }
  };

  // Create new blank or template draft
  const createNewDraft = async (templateId = 'ats-01') => {
    const newId = `draft_${Date.now()}`;
    const fresh = {
      ...INITIAL_RESUME_DATA,
      templateId,
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        professionalTitle: "",
        website: "",
        linkedin: "",
        github: "",
        portfolio: ""
      },
      professionalSummary: "",
      education: [],
      experience: [],
      internships: [],
      projects: [],
      skills: [
        { category: "Technical Skills", items: [] },
        { category: "Soft Skills", items: [] }
      ],
      certifications: [],
      achievements: [],
      languages: []
    };
    setCurrentDraftId(newId);
    setResumeData(fresh);
    await storageService.saveDraft(newId, 'New Resume', fresh);
    refreshDraftsList();
  };

  // Reset to initial sample data
  const loadSampleData = () => {
    setResumeData(INITIAL_RESUME_DATA);
  };

  return (
    <ResumeContext.Provider value={{
      resumeData,
      setResumeData,
      currentDraftId,
      draftsList,
      saveStatus,
      isAiLoading,
      setIsAiLoading,
      updatePersonalInfo,
      updateSummary,
      setTemplateId,
      updatePreferences,
      updateSection,
      addItemToSection,
      removeItemFromSection,
      updateItemInSection,
      loadDraft,
      createNewDraft,
      loadSampleData,
      refreshDraftsList
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
