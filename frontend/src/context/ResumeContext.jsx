import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_RESUME_DATA } from '../constants/initialResumeData';
import { storageService, INITIAL_WIZARD_STATE } from '../services/storageService';
import { TEMPLATES } from '../constants/templatesList';

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  // Wizard Master State
  const [wizardState, setWizardState] = useState(() => {
    try {
      const local = localStorage.getItem('active_wizard_state');
      return local ? JSON.parse(local) : INITIAL_WIZARD_STATE;
    } catch (e) {
      return INITIAL_WIZARD_STATE;
    }
  });

  const [draftsList, setDraftsList] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Resume Data is the core document inside wizardState
  const resumeData = wizardState.resumeData || INITIAL_RESUME_DATA;
  const activeDraftId = wizardState.activeDraftId || 'active_resume_draft';

  const refreshDraftsList = useCallback(async () => {
    try {
      const list = await storageService.getAllDrafts();
      setDraftsList(list);
    } catch (e) {
      console.error('Failed to refresh drafts list:', e);
    }
  }, []);

  // Restore saved wizard state from Dexie IndexedDB on mount
  useEffect(() => {
    async function restoreFromIndexedDB() {
      const saved = await storageService.getWizardState();
      if (saved && saved.resumeData) {
        setWizardState(saved);
      }
    }
    restoreFromIndexedDB();
    refreshDraftsList();
  }, [refreshDraftsList]);

  // Debounced auto-save of entire WizardState to IndexedDB and localStorage
  useEffect(() => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        localStorage.setItem('active_wizard_state', JSON.stringify(wizardState));
        await storageService.saveWizardState(wizardState);

        // Also save draft record with current activeDraftId
        const currentDraftId = wizardState.activeDraftId || 'active_resume_draft';
        const draftTitle = resumeData.personalInfo?.fullName
          ? `${resumeData.personalInfo.fullName}'s Resume`
          : 'My Resume';
        await storageService.saveDraft(currentDraftId, draftTitle, resumeData);
        await refreshDraftsList();
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to auto-save wizard state:', e);
        setSaveStatus('unsaved');
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [wizardState, resumeData, refreshDraftsList]);

  // Wizard Step Navigation
  const setWizardStep = (step) => {
    setWizardState(prev => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    setWizardState(prev => ({ ...prev, currentStep: Math.min(7, prev.currentStep + 1) }));
  };

  const prevStep = () => {
    setWizardState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  };

  // Step 1: Select Template
  const selectTemplate = (templateId) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    const newColor = tpl?.accentColor;
    setWizardState(prev => ({
      ...prev,
      selectedTemplateId: templateId,
      resumeData: {
        ...prev.resumeData,
        templateId: templateId,
        preferences: {
          ...prev.resumeData?.preferences,
          themeColor: newColor || prev.resumeData?.preferences?.themeColor || '#1e293b',
          accentColor: newColor || prev.resumeData?.preferences?.accentColor || '#1e293b'
        }
      }
    }));
  };

  // Step 2: Target Job Selection & Analysis
  const setTargetJob = (jobPayload) => {
    setWizardState(prev => ({
      ...prev,
      selectedJob: {
        ...prev.selectedJob,
        ...jobPayload
      }
    }));
  };

  const setJobAnalysis = (analysis) => {
    setWizardState(prev => ({
      ...prev,
      jobAnalysis: analysis
    }));
  };

  // Step 3: Creation Method
  const setCreationMethod = (method) => {
    setWizardState(prev => ({
      ...prev,
      creationMethod: method
    }));
  };

  // Step 5: Optimization Results
  const setOptimizationResults = (results) => {
    setWizardState(prev => ({
      ...prev,
      optimizationResults: results
    }));
  };

  // Step 6: ATS Results
  const setAtsResults = (results) => {
    setWizardState(prev => ({
      ...prev,
      atsResults: results
    }));
  };

  // Full resumeData setter
  const setResumeData = (updater) => {
    setWizardState(prev => {
      const nextResume = typeof updater === 'function' ? updater(prev.resumeData) : updater;
      return {
        ...prev,
        resumeData: nextResume
      };
    });
  };

  // Resume Section Updaters
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
    selectTemplate(templateId);
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

  // Multi-Document Draft Operations
  const loadDraft = useCallback(async (draftId) => {
    try {
      const draft = await storageService.getDraft(draftId);
      if (draft && draft.data) {
        setWizardState(prev => ({
          ...prev,
          activeDraftId: draftId,
          selectedTemplateId: draft.templateId || draft.data.templateId || prev.selectedTemplateId || 'ats-01',
          resumeData: draft.data
        }));
        return true;
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
    return false;
  }, []);

  const createNewResume = useCallback(async (templateId = 'ats-01', title = 'My Resume') => {
    const newId = `draft_${Date.now()}`;
    const newResume = {
      ...INITIAL_RESUME_DATA,
      templateId,
      personalInfo: {
        ...INITIAL_RESUME_DATA.personalInfo,
        fullName: title === 'My Resume' ? 'Jane Doe' : title
      }
    };
    await storageService.saveDraft(newId, title, newResume);
    setWizardState({
      ...INITIAL_WIZARD_STATE,
      activeDraftId: newId,
      selectedTemplateId: templateId,
      resumeData: newResume
    });
    await refreshDraftsList();
    return newId;
  }, [refreshDraftsList]);

  const deleteDraft = useCallback(async (draftId) => {
    try {
      await storageService.deleteDraft(draftId);
      await refreshDraftsList();
      const currentActiveId = wizardState.activeDraftId || 'active_resume_draft';
      if (currentActiveId === draftId) {
        const remaining = await storageService.getAllDrafts();
        if (remaining.length > 0) {
          await loadDraft(remaining[0].id);
        } else {
          setWizardState(INITIAL_WIZARD_STATE);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to delete draft:', e);
      return false;
    }
  }, [wizardState.activeDraftId, loadDraft, refreshDraftsList]);

  const duplicateDraft = useCallback(async (draftId) => {
    try {
      const source = await storageService.getDraft(draftId);
      if (source) {
        const newId = `draft_${Date.now()}`;
        const newTitle = `${source.title || 'Resume'} (Copy)`;
        await storageService.saveDraft(newId, newTitle, source.data);
        await refreshDraftsList();
        return newId;
      }
    } catch (e) {
      console.error('Failed to duplicate draft:', e);
    }
    return null;
  }, [refreshDraftsList]);

  const renameDraft = useCallback(async (draftId, newTitle) => {
    try {
      const draft = await storageService.getDraft(draftId);
      if (draft) {
        await storageService.saveDraft(draftId, newTitle, draft.data);
        await refreshDraftsList();
        return true;
      }
    } catch (e) {
      console.error('Failed to rename draft:', e);
    }
    return false;
  }, [refreshDraftsList]);

  // Reset entire wizard
  const resetWizard = async () => {
    await storageService.clearWizardState();
    setWizardState(INITIAL_WIZARD_STATE);
  };

  // Load sample data
  const loadSampleData = () => {
    setResumeData(INITIAL_RESUME_DATA);
  };

  return (
    <ResumeContext.Provider value={{
      wizardState,
      currentStep: wizardState.currentStep,
      selectedTemplateId: wizardState.selectedTemplateId,
      selectedJob: wizardState.selectedJob,
      jobAnalysis: wizardState.jobAnalysis,
      creationMethod: wizardState.creationMethod,
      optimizationResults: wizardState.optimizationResults,
      atsResults: wizardState.atsResults,
      resumeData,
      activeDraftId,
      draftsList,
      saveStatus,
      isAiLoading,
      setIsAiLoading,
      setWizardStep,
      nextStep,
      prevStep,
      selectTemplate,
      setTargetJob,
      setJobAnalysis,
      setCreationMethod,
      setOptimizationResults,
      setAtsResults,
      setResumeData,
      updatePersonalInfo,
      updateSummary,
      setTemplateId,
      updatePreferences,
      updateSection,
      addItemToSection,
      removeItemFromSection,
      updateItemInSection,
      resetWizard,
      loadSampleData,
      refreshDraftsList,
      loadDraft,
      createNewResume,
      deleteDraft,
      duplicateDraft,
      renameDraft
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
