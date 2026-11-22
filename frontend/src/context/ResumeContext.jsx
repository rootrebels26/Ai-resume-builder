import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_RESUME_DATA } from '../constants/initialResumeData';
import { storageService, INITIAL_WIZARD_STATE } from '../services/storageService';

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
  }, []);

  const refreshDraftsList = useCallback(async () => {
    const list = await storageService.getAllDrafts();
    setDraftsList(list);
  }, []);

  // Debounced auto-save of entire WizardState to IndexedDB and localStorage
  useEffect(() => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        localStorage.setItem('active_wizard_state', JSON.stringify(wizardState));
        await storageService.saveWizardState(wizardState);

        // Also save draft record
        const draftTitle = resumeData.personalInfo?.fullName
          ? `${resumeData.personalInfo.fullName}'s Resume`
          : 'My Resume';
        await storageService.saveDraft('active_resume_draft', draftTitle, resumeData);
        refreshDraftsList();
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
    setWizardState(prev => ({
      ...prev,
      selectedTemplateId: templateId,
      resumeData: {
        ...prev.resumeData,
        templateId: templateId
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
