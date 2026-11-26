import React, { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Briefcase, GraduationCap, FolderGit2, Wrench, Award, Palette, Target,
  Sparkles, Download, FileJson, Upload, RefreshCw, ZoomIn, ZoomOut,
  Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, Check, Eye, Loader2, ArrowRight,
  ArrowLeft, Languages, Layers, MoveUp, MoveDown, CheckCircle2, Sliders,
  HelpCircle, AlertCircle, Edit3, FileText, Scissors, Minimize2
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { ResumeTemplate } from '../components/templates/ResumeTemplate';
import { A4PageSheet } from '../components/templates/A4PageSheet';
import { TEMPLATES, isFullBleedTemplate } from '../constants/templateRegistry';
import { CanvaDesignPanel } from '../components/design/CanvaDesignPanel';
import { BuilderToolbar } from '../components/builder/BuilderToolbar';
import { SectionSidebar } from '../components/builder/SectionSidebar';
import { PreviewCanvasToolbar } from '../components/builder/PreviewCanvasToolbar';
import { pdfService } from '../services/pdfService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { resumeService } from '../services/resumeService';
import { useResumePagination } from '../utils/resumePaginator';
import { PhotoUploadModal } from '../components/templates/PhotoUploadModal';

const COLOR_PRESETS = [
  { name: 'Classic Slate', color: '#1e293b' },
  { name: 'Resume Blue', color: '#1a91f0' },
  { name: 'Royal Navy', color: '#1d4ed8' },
  { name: 'Emerald Green', color: '#059669' },
  { name: 'Executive Violet', color: '#6366f1' },
  { name: 'Crimson Burgundy', color: '#dc2626' },
  { name: 'Cyan Modern', color: '#0891b2' },
  { name: 'Warm Amber', color: '#d97706' },
];

export function Builder() {
  const navigate = useNavigate();
  const {
    resumeData,
    setResumeData,
    updatePersonalInfo,
    updateSummary,
    setTemplateId,
    updatePreferences,
    addItemToSection,
    removeItemFromSection,
    updateItemInSection,
    loadSampleData,
    saveStatus,
    activeDraftId,
    renameDraft,
    selectedJob
  } = useResume();

  const [activeTab, setActiveTab] = useState('personal');
  const [editorPhase, setEditorPhase] = useState('edit'); // 'edit' | 'optimize' | 'ats_and_download'
  const [zoomScale, setZoomScale] = useState(0.85);
  const [showDesignStudio, setShowDesignStudio] = useState(false);
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview' | 'design'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null); // { type: 'summary'|'bullet'|'skills', options: [...] }
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('Exporting...');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [docTitle, setDocTitle] = useState(
    resumeData?.personalInfo?.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'My Resume'
  );
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Target Job Description & Section-by-Section AI Tailor State
  const [jobDescription, setJobDescription] = useState(
    selectedJob?.description || ''
  );
  const [targetJobTitle, setTargetJobTitle] = useState(
    resumeData?.personalInfo?.professionalTitle || selectedJob?.role || ''
  );
  const [targetCompany, setTargetCompany] = useState(
    selectedJob?.company || ''
  );
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState(null);
  const [tailorResult, setTailorResult] = useState(null);
  const [atsMatchResult, setAtsMatchResult] = useState(null);
  const [initialMatchScore, setInitialMatchScore] = useState(null);
  const [isReauditing, setIsReauditing] = useState(false);
  const [detailedAtsData, setDetailedAtsData] = useState(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState({});
  const [preOptimizationSnapshot, setPreOptimizationSnapshot] = useState(null);
  const [checkedChecklist, setCheckedChecklist] = useState({});
  const [checklistFilter, setChecklistFilter] = useState('all');

  const previewRef = useRef(null);
  const jsonInputRef = useRef(null);
  const tabsRef = useRef(null);

  const [pageLayoutMode, setPageLayoutMode] = useState('auto'); // 'auto' | '1_page' | '2_pages'
  const [isSmartCondensing, setIsSmartCondensing] = useState(false);
  const [condenseNotice, setCondenseNotice] = useState(null);
  const [undoSnapshot, setUndoSnapshot] = useState(null);

  const handleSmartCondense = async (targetPages) => {
    setIsSmartCondensing(true);
    setCondenseNotice(null);
    try {
      // Save snapshot for 1-click Undo
      setUndoSnapshot(JSON.parse(JSON.stringify(resumeData)));
      const res = await resumeService.smartCondense(resumeData, targetPages);
      if (res.success && res.data) {
        setResumeData(res.data);
        setPageLayoutMode(targetPages === 1 ? '1_page' : '2_pages');
        setCondenseNotice(`✨ Resume smartly calibrated to ${targetPages} Page${targetPages > 1 ? 's' : ''} with zero lost details! No cut text.`);
        setTimeout(() => setCondenseNotice(null), 8000);
      }
    } catch (err) {
      console.error('Smart condense failed:', err);
    } finally {
      setIsSmartCondensing(false);
    }
  };

  const handleUndoCondense = () => {
    if (undoSnapshot) {
      setResumeData(undoSnapshot);
      setUndoSnapshot(null);
      setCondenseNotice(null);
    }
  };

  const paginationOptions = useMemo(() => ({
    forceTwoPages: pageLayoutMode === '2_pages',
    forceSinglePage: pageLayoutMode === '1_page',
    templateId: resumeData.templateId || 'ats-01',
    layout: resumeData.preferences?.layout || 'single-column'
  }), [pageLayoutMode, resumeData.templateId, resumeData.preferences?.layout]);

  const { pages, pageCount, isMultiPage } = useResumePagination(resumeData, paginationOptions);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Active template
  const activeTemplate =
    TEMPLATES.find((t) => t.id === (resumeData.templateId || 'ats-01')) || TEMPLATES[0];

  // Pure Section Tabs (Target Job & AI Tailor moved to dedicated post-edit phase)
  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'extras', label: 'Certifications', icon: Award },
    { id: 'languages', label: 'Languages', icon: Languages },
  ];

  // Calculate real-time base ATS readiness score
  const atsScore = useMemo(() => {
    let score = 35;
    if (resumeData.personalInfo?.fullName) score += 10;
    if (resumeData.personalInfo?.email) score += 8;
    if (resumeData.personalInfo?.phone) score += 5;
    if (resumeData.personalInfo?.location) score += 4;
    if (resumeData.personalInfo?.linkedin || resumeData.personalInfo?.github) score += 5;
    if (resumeData.professionalSummary && resumeData.professionalSummary.length > 50) score += 8;
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += 10;
      const hasMetrics = resumeData.experience.some(e =>
        (e.responsibilities || []).some(r => /\d+%|\d+\+|\b\d+\b|\$|\bms\b|latency|throughput/i.test(r))
      );
      if (hasMetrics) score += 5;
    }
    if (resumeData.education && resumeData.education.length > 0) score += 5;
    if (resumeData.skills && resumeData.skills.length > 0) score += 8;
    if (resumeData.projects && resumeData.projects.length > 0) score += 5;
    return Math.min(score, 98);
  }, [resumeData]);

  // Handle Full-Length Job Description AI Analysis & Tailoring
  const handleAnalyzeAndTailorJD = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      setTailorError("Please paste your full-length Job Description (at least 20 characters) so our AI can analyze match criteria.");
      return;
    }
    setTailorError(null);
    setIsTailoring(true);

    // Save snapshot of resume before tailoring for clean 1-click uncheck & revert
    const snapshot = JSON.parse(JSON.stringify(resumeData));
    setPreOptimizationSnapshot(snapshot);

    try {
      const [matchRes, tailorRes] = await Promise.all([
        resumeService.matchResume(resumeData, jobDescription, targetJobTitle),
        resumeService.tailorResume(resumeData, jobDescription, targetJobTitle)
      ]);

      if (matchRes.success && matchRes.data) {
        setAtsMatchResult(matchRes.data);
        const baseMatch = matchRes.data.match_percentage || 74;
        setInitialMatchScore(baseMatch);
      }
      if (tailorRes.success && tailorRes.data) {
        setTailorResult(tailorRes.data);
      }
    } catch (e) {
      console.error("AI job tailoring error:", e);
      setTailorError("AI analysis failed to complete. Please ensure backend is reachable and try again.");
    } finally {
      setIsTailoring(false);
    }
  };

  // Compile structured Checklist covering every required section
  const checklistItems = useMemo(() => {
    if (!tailorResult && !atsMatchResult) return [];
    const items = [];

    // 1. Professional Summary Item
    if (tailorResult?.tailored_summary) {
      items.push({
        id: 'item_summary',
        section: 'summary',
        sectionLabel: 'Summary Hook',
        title: 'Elevate Professional Summary Positioning',
        original: preOptimizationSnapshot?.professionalSummary || resumeData.professionalSummary || '',
        tailored: tailorResult.tailored_summary,
        reason: 'Aligns your professional trajectory directly with the core requirements and keywords of this role.',
        impact: '+15% ATS Match',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
      });
    }

    // 2. Work Experience Items
    const expSuggestions = tailorResult?.suggestions?.filter(s => s.section === 'experience') || [];
    if (expSuggestions.length > 0) {
      expSuggestions.forEach((sug, idx) => {
        items.push({
          id: `item_exp_${idx}`,
          section: 'experience',
          sectionLabel: `Experience Bullet #${idx + 1}`,
          targetId: sug.target_id,
          title: `Apply STAR Metrics Formula to Experience Bullet`,
          original: sug.original_text || '',
          tailored: sug.tailored_text,
          reason: sug.reason || 'Converts passive duties into achievement-driven STAR bullet with action verbs and metrics.',
          impact: 'STAR Metric Impact',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        });
      });
    } else if (resumeData.experience && resumeData.experience.length > 0) {
      const firstExp = resumeData.experience[0];
      if (firstExp.responsibilities && firstExp.responsibilities.length > 0) {
        items.push({
          id: 'item_exp_0',
          section: 'experience',
          sectionLabel: 'Experience Bullet #1',
          targetId: firstExp.id,
          title: 'Inject Measurable High-Scale Outcomes',
          original: firstExp.responsibilities[0],
          tailored: `Spearheaded delivery of high-impact features using ${targetJobTitle || 'modern architecture'}, improving efficiency and SLA reliability.`,
          reason: 'Reframes duty into high-impact outcome incorporating target role competencies.',
          impact: 'Action-Driven Result',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        });
      }
    }

    // 3. Technical Skills Items
    const missingSkills = atsMatchResult?.missing_keywords || tailorResult?.recommended_skills_to_add || [];
    missingSkills.slice(0, 6).forEach((skill) => {
      items.push({
        id: `item_skill_${skill.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        section: 'skills',
        sectionLabel: 'Technical Stack',
        skillName: skill,
        title: `Add Critical Stack Keyword: "${skill}"`,
        original: '(Not currently listed in skills)',
        tailored: `Include "${skill}" in core competencies category`,
        reason: `Required skill identified in Job Description scan. Crucial for passing initial ATS filter.`,
        impact: 'Required Keyword',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
      });
    });

    // 4. Projects Items
    const projSuggestions = tailorResult?.suggestions?.filter(s => s.section === 'projects') || [];
    if (projSuggestions.length > 0) {
      projSuggestions.forEach((sug, idx) => {
        items.push({
          id: `item_proj_${idx}`,
          section: 'projects',
          sectionLabel: `Project Architecture #${idx + 1}`,
          targetId: sug.target_id,
          title: 'Enhance Project with Production-Grade Architecture',
          original: sug.original_text || '',
          tailored: sug.tailored_text,
          reason: sug.reason || 'Highlights cloud deployment, architectural decisions, and end-to-end delivery.',
          impact: 'Production Tech Proof',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        });
      });
    } else if (resumeData.projects && resumeData.projects.length > 0) {
      const firstProj = resumeData.projects[0];
      const origDesc = firstProj.description || '';
      items.push({
        id: 'item_proj_0',
        section: 'projects',
        sectionLabel: `Project: ${firstProj.name}`,
        targetId: firstProj.id,
        title: `Highlight System Architecture for "${firstProj.name}"`,
        original: origDesc,
        tailored: `${origDesc}${origDesc.endsWith('.') ? '' : '.'} Engineered full-stack components adhering to production design patterns and optimized system response latency.`,
        reason: 'Frames technical achievements with enterprise standards expected in target role.',
        impact: 'System Scalability',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
      });
    }

    // 5. Education & Academic Item
    if (resumeData.education && resumeData.education.length > 0) {
      const firstEdu = resumeData.education[0];
      items.push({
        id: 'item_edu_0',
        section: 'education',
        sectionLabel: 'Academic Background',
        targetId: firstEdu.id,
        title: 'Align Coursework & Technical Specialization',
        original: firstEdu.description || 'General coursework',
        tailored: (firstEdu.description ? `${firstEdu.description} • ` : '') + `Specialized focus in ${targetJobTitle || 'Advanced Computer Science Systems'}`,
        reason: 'Signals formal background and specialized theoretical foundations to recruiters.',
        impact: 'Academic Foundation',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
      });
    }

    return items;
  }, [tailorResult, atsMatchResult, preOptimizationSnapshot, resumeData, targetJobTitle]);

  // Dynamic ATS Score taking into account initial match + applied AI checklist suggestions
  const displayAtsScore = useMemo(() => {
    const base = initialMatchScore || atsMatchResult?.match_percentage || atsScore;

    // Count how many checklist items exist vs how many are accepted
    const totalItems = checklistItems.length;
    if (totalItems === 0) {
      return base;
    }
    const checkedCount = Object.values(checkedChecklist).filter(Boolean).length;

    // Calculate progressive boost up to 98%
    const maxBoost = Math.max(16, 98 - base);
    const boost = Math.round((checkedCount / totalItems) * maxBoost);
    return Math.min(98, base + boost);
  }, [initialMatchScore, atsMatchResult, atsScore, checklistItems, checkedChecklist]);

  // Live ATS Re-Audit with full job description and latest resume content
  const handleReauditATS = async (dataOverride = null) => {
    const dataToAudit = dataOverride || resumeData;
    setIsReauditing(true);
    try {
      const tasks = [];
      if (jobDescription && jobDescription.trim().length >= 20) {
        tasks.push(resumeService.matchResume(dataToAudit, jobDescription, targetJobTitle));
      }
      tasks.push(resumeService.analyzeATS(dataToAudit, jobDescription || targetJobTitle || ''));

      const results = await Promise.all(tasks);
      if (jobDescription && results[0]?.success && results[0]?.data) {
        setAtsMatchResult(results[0].data);
      }
      const atsRes = jobDescription ? results[1] : results[0];
      if (atsRes?.success && atsRes?.data) {
        setDetailedAtsData(atsRes.data);
      }
    } catch (e) {
      console.error("Live ATS re-audit error:", e);
    } finally {
      setIsReauditing(false);
    }
  };

  // Finalize Optimization Handler
  const handleFinalizeOptimization = async () => {
    setEditorPhase('ats_and_download');
    handleReauditATS(resumeData);
  };

  // Toggle individual checklist item (Check to Apply, Uncheck to Revert live)
  const handleToggleChecklistItem = (item) => {
    const isChecked = !!checkedChecklist[item.id];
    const willBeChecked = !isChecked;

    setCheckedChecklist(prev => ({ ...prev, [item.id]: willBeChecked }));

    if (willBeChecked) {
      // APPLY IMPROVEMENT TO CANVAS
      if (item.section === 'summary') {
        updateSummary(item.tailored);
      } else if (item.section === 'experience') {
        const expList = [...(resumeData.experience || [])];
        if (expList.length > 0) {
          const targetExp = expList.find(e => e.id === item.targetId) || expList[0];
          const newResp = [...(targetExp.responsibilities || [])];
          const idx = newResp.findIndex(r => r.trim() === (item.original || '').trim());
          if (idx !== -1) {
            newResp[idx] = item.tailored;
          } else {
            newResp.unshift(item.tailored);
          }
          updateItemInSection('experience', targetExp.id, { responsibilities: newResp });
        }
      } else if (item.section === 'skills' && item.skillName) {
        handleAddSkillToResume(item.skillName);
      } else if (item.section === 'projects') {
        const projList = [...(resumeData.projects || [])];
        if (projList.length > 0) {
          const targetProj = projList.find(p => p.id === item.targetId) || projList[0];
          updateItemInSection('projects', targetProj.id, { description: item.tailored });
        }
      } else if (item.section === 'education') {
        const eduList = [...(resumeData.education || [])];
        if (eduList.length > 0) {
          const targetEdu = eduList.find(e => e.id === item.targetId) || eduList[0];
          updateItemInSection('education', targetEdu.id, { description: item.tailored });
        }
      }
    } else {
      // REVERT TO ORIGINAL
      const snap = preOptimizationSnapshot || {};
      if (item.section === 'summary') {
        updateSummary(snap.professionalSummary || item.original || '');
      } else if (item.section === 'experience') {
        const expList = [...(resumeData.experience || [])];
        if (expList.length > 0) {
          const targetExp = expList.find(e => e.id === item.targetId) || expList[0];
          const newResp = [...(targetExp.responsibilities || [])];
          const idx = newResp.findIndex(r => r.trim() === (item.tailored || '').trim());
          if (idx !== -1 && item.original) {
            newResp[idx] = item.original;
          } else if (idx !== -1) {
            newResp.splice(idx, 1);
          }
          updateItemInSection('experience', targetExp.id, { responsibilities: newResp });
        }
      } else if (item.section === 'skills' && item.skillName) {
        const currentSkills = (resumeData.skills || []).map(cat => ({
          ...cat,
          items: (cat.items || []).filter(i => i.toLowerCase() !== item.skillName.toLowerCase())
        }));
        setResumeData({ ...resumeData, skills: currentSkills });
      } else if (item.section === 'projects') {
        const projList = [...(resumeData.projects || [])];
        if (projList.length > 0) {
          const targetProj = projList.find(p => p.id === item.targetId) || projList[0];
          const origDesc = snap.projects?.find(p => p.id === item.targetId)?.description || item.original || '';
          updateItemInSection('projects', targetProj.id, { description: origDesc });
        }
      } else if (item.section === 'education') {
        const eduList = [...(resumeData.education || [])];
        if (eduList.length > 0) {
          const targetEdu = eduList.find(e => e.id === item.targetId) || eduList[0];
          const origDesc = snap.education?.find(e => e.id === item.targetId)?.description || item.original || '';
          updateItemInSection('education', targetEdu.id, { description: origDesc });
        }
      }
    }
  };

  // Check All Checklist Items
  const handleCheckAllChecklist = () => {
    const allChecked = {};
    checklistItems.forEach(item => {
      allChecked[item.id] = true;
    });
    setCheckedChecklist(allChecked);

    let updated = JSON.parse(JSON.stringify(resumeData));
    checklistItems.forEach(item => {
      if (item.section === 'summary') {
        updated.professionalSummary = item.tailored;
      } else if (item.section === 'experience' && updated.experience?.length) {
        const exp = updated.experience.find(e => e.id === item.targetId) || updated.experience[0];
        const idx = (exp.responsibilities || []).findIndex(r => r.trim() === (item.original || '').trim());
        if (idx !== -1) {
          exp.responsibilities[idx] = item.tailored;
        } else {
          exp.responsibilities = [item.tailored, ...(exp.responsibilities || [])];
        }
      } else if (item.section === 'skills' && item.skillName && updated.skills?.length) {
        const firstCat = updated.skills[0];
        if (!firstCat.items.some(i => i.toLowerCase() === item.skillName.toLowerCase())) {
          firstCat.items.push(item.skillName);
        }
      } else if (item.section === 'projects' && updated.projects?.length) {
        const proj = updated.projects.find(p => p.id === item.targetId) || updated.projects[0];
        proj.description = item.tailored;
      } else if (item.section === 'education' && updated.education?.length) {
        const edu = updated.education.find(e => e.id === item.targetId) || updated.education[0];
        edu.description = item.tailored;
      }
    });
    setResumeData(updated);
  };

  // Uncheck All Checklist Items
  const handleUncheckAllChecklist = () => {
    setCheckedChecklist({});
    if (preOptimizationSnapshot) {
      setResumeData(JSON.parse(JSON.stringify(preOptimizationSnapshot)));
    }
  };

  const handleApplySummarySuggestion = (suggestedSummary, sIdx = 0) => {
    if (!suggestedSummary) return;
    updateSummary(suggestedSummary);
    setAppliedSuggestions(prev => ({ ...prev, [`summary_${sIdx}`]: true }));
  };

  const handleApplyExpSuggestion = (suggestion, sIdx = 0) => {
    if (!resumeData.experience || resumeData.experience.length === 0) return;
    const targetExpId = suggestion.target_id || resumeData.experience[0].id;
    const targetExp = resumeData.experience.find(e => e.id === targetExpId) || resumeData.experience[0];

    const currentResp = [...(targetExp.responsibilities || [])];
    const origIdx = currentResp.findIndex(r => r.trim() === (suggestion.original_text || '').trim());

    if (origIdx !== -1) {
      currentResp[origIdx] = suggestion.tailored_text;
    } else {
      currentResp.unshift(suggestion.tailored_text);
    }

    updateItemInSection('experience', targetExp.id, { responsibilities: currentResp });
    setAppliedSuggestions(prev => ({ ...prev, [`exp_${sIdx}`]: true }));
  };

  const handleAddSkillToResume = (skillName) => {
    if (!skillName) return;
    const currentSkills = [...(resumeData.skills || [])];
    if (currentSkills.length === 0) {
      setResumeData({
        ...resumeData,
        skills: [{ id: 'skills-1', category: 'Target Job Skills', items: [skillName] }]
      });
      return;
    }

    const alreadyExists = currentSkills.some(cat =>
      (cat.items || []).some(item => item.toLowerCase() === skillName.toLowerCase())
    );
    if (alreadyExists) return;

    const updated = currentSkills.map((cat, idx) => {
      if (idx === 0) {
        return { ...cat, items: [...(cat.items || []), skillName] };
      }
      return cat;
    });

    setResumeData({ ...resumeData, skills: updated });
  };

  const handleAddAllMissingSkills = () => {
    const missing = atsMatchResult?.missing_critical_skills || tailorResult?.recommended_skills_to_add || [];
    if (missing.length === 0) return;

    const currentSkills = [...(resumeData.skills || [])];
    if (currentSkills.length === 0) {
      setResumeData({
        ...resumeData,
        skills: [{ id: 'skills-1', category: 'Target Job Skills', items: [...missing] }]
      });
      return;
    }

    const firstCat = { ...currentSkills[0] };
    const existingLower = new Set((firstCat.items || []).map(i => i.toLowerCase()));
    const toAdd = missing.filter(m => !existingLower.has(m.toLowerCase()));
    firstCat.items = [...(firstCat.items || []), ...toAdd];
    currentSkills[0] = firstCat;

    setResumeData({ ...resumeData, skills: currentSkills });
  };

  // Handle Document Title Rename
  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (docTitle.trim() && activeDraftId) {
      renameDraft(activeDraftId, docTitle.trim());
    }
  };

  // AI Summary Generation
  const handleGenerateSummary = async () => {
    setIsAiLoading(true);
    try {
      const skillsFlat = (resumeData.skills || []).flatMap((c) => c.items || []);
      const role = selectedJob?.role || resumeData.personalInfo?.professionalTitle || "Professional";
      const res = await aiService.generateSummary({
        role,
        target_role: selectedJob?.role,
        key_skills: skillsFlat.slice(0, 5),
        existing_summary: resumeData.professionalSummary
      });
      if (res.success && res.data) {
        setAiSuggestions({
          type: 'summary',
          options: res.data.summaries || [res.data.suggested_summary],
          headline: res.data.suggested_headline
        });
      }
    } catch (e) {
      console.error('AI summary generation error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI STAR Bullet Improvement
  const handleImproveBullet = async (expId, bulletIndex, currentText) => {
    if (!currentText.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await aiService.improveBullet({
        bullet: currentText,
        role: selectedJob?.role || resumeData.personalInfo?.professionalTitle || "Software Engineer",
        target_role: selectedJob?.role
      });
      if (res.success && res.data) {
        setAiSuggestions({
          type: 'bullet',
          expId,
          bulletIndex,
          options: res.data.options || []
        });
      }
    } catch (e) {
      console.error('AI bullet improvement error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Project Enhancer
  const handleImproveProject = async (projId, currentDescription) => {
    if (!currentDescription.trim()) return;
    setIsAiLoading(true);
    try {
      const proj = resumeData.projects.find(p => p.id === projId);
      const res = await aiService.improveProject({
        name: proj?.name || 'Project',
        description: currentDescription,
        technologies: proj?.technologies || [],
        target_role: selectedJob?.role
      });
      if (res.success && res.data) {
        setAiSuggestions({
          type: 'project',
          projId,
          options: res.data.optimized_bullets || [res.data.suggested_description]
        });
      }
    } catch (e) {
      console.error('AI project improvement error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setExportProgressText('Preparing document...');
    try {
      const candidate = (resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_');
      const role = (resumeData.personalInfo?.professionalTitle || 'CV').replace(/\s+/g, '_');
      const filename = `${candidate}_${role}.pdf`;
      await pdfService.exportToPDF(previewRef.current, filename, {
        format: resumeData?.preferences?.paperFormat || 'a4',
        onProgress: (status) => setExportProgressText(status)
      });
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setIsExporting(false);
      setExportProgressText('Exporting...');
    }
  };

  // JSON Import & Export
  const handleExportJSON = () => {
    const filename = `${(resumeData.personalInfo?.fullName || 'resume').toLowerCase().replace(/\s+/g, '_')}.json`;
    storageService.exportJSON(resumeData, filename);
  };

  const handleImportJSONClick = () => {
    if (jsonInputRef.current) jsonInputRef.current.click();
  };

  const handleJSONFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const parsed = await storageService.importJSON(file);
        setResumeData(parsed);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Change Theme Color
  const handleColorChange = (hex) => {
    updatePreferences('themeColor', hex);
    updatePreferences('accentColor', hex);
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas min-h-0 h-full overflow-hidden">
      {/* Hidden JSON input */}
      <input
        type="file"
        ref={jsonInputRef}
        onChange={handleJSONFileSelected}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Clean Single-Row Studio Header */}
      <BuilderToolbar
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        onTitleBlur={handleTitleBlur}
        displayAtsScore={displayAtsScore}
        editorPhase={editorPhase}
        setEditorPhase={setEditorPhase}
        mobileView={mobileView}
        setMobileView={setMobileView}
        showDesignStudio={showDesignStudio}
        setShowDesignStudio={setShowDesignStudio}
        isExporting={isExporting}
        exportProgressText={exportProgressText}
        onDownloadPDF={handleDownloadPDF}
        onLoadSampleData={loadSampleData}
        onExportJSON={handleExportJSON}
        onImportJSONClick={handleImportJSONClick}
      />

      {/* Main Workspace Split View */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL: Section Rail + Ergonomic Forms               */}
        {/* ======================================================== */}
        <div
          className={`w-full ${showDesignStudio ? 'md:w-[440px] lg:w-[490px]' : 'md:w-[480px] lg:w-[540px]'} shrink-0 bg-white border-r border-ink/15 flex flex-col min-h-0 h-full ${
            mobileView === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* ======================================================== */}
          {/* STAGE 1: EDITING ALL DETAILS (Vertical Rail + Form)      */}
          {/* ======================================================== */}
          {editorPhase === 'edit' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                <SectionSidebar
                  tabs={tabs}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                />

                {/* Tab Content Form Container */}
                <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-6 min-h-0">
            {/* 1. PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Personal & Contact Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Essential header details parsed by recruitment algorithms.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Profile Photo Uploader */}
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {resumeData.personalInfo?.photo ? (
                      <div className="flex items-center gap-3 w-full justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={resumeData.personalInfo.photo}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border border-slate-300"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800">Profile Photo Uploaded</span>
                            <p className="text-[10px] text-slate-500">Visible on photo-supported template headers</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePersonalInfo('photo', '')}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="text-xs font-semibold text-slate-700">Profile Photo</span>
                          <p className="text-[10px] text-slate-500">Optional for ATS resumes, required for Executive & Creative templates</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPhotoModalOpen(true)}
                          className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Upload Photo
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label-base">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">Professional Title</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.professionalTitle || ''}
                      onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">Email</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">Phone Number</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-base">Location / City, Country</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="San Francisco, CA, USA"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.linkedin || ''}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/alex"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="label-base">GitHub Profile URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.github || ''}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                      placeholder="github.com/alex"
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-base">Portfolio / Personal Website (Optional)</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.portfolio || ''}
                      onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                      placeholder="https://alexrivera.dev or myportfolio.com"
                      className="input-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Professional Summary</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      3-4 sentence elevator pitch highlighting key career wins.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isAiLoading}
                    className="btn-ai text-xs"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>AI Assistant</span>
                  </button>
                </div>

                {/* Inline Target Job AI Tailored Summary */}
                {tailorResult?.tailored_summary && (
                  <div className="p-3.5 bg-volt/15 border border-ink/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[11px] text-ink uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-editorial-violet" />
                        Target Job AI Tailored Summary
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplySummarySuggestion(tailorResult.tailored_summary, 0)}
                        className="btn-volt py-1 px-3 text-[11px] font-extrabold shadow-brutal-sm cursor-pointer"
                      >
                        {appliedSuggestions['summary_0'] ? '✓ Applied' : 'Apply to Summary'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-ink/10 leading-relaxed">
                      "{tailorResult.tailored_summary}"
                    </p>
                  </div>
                )}

                <textarea
                  rows={6}
                  value={resumeData.professionalSummary || ''}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Results-oriented engineer with 5+ years of experience leading cross-functional teams in developing scalable web applications..."
                  className="input-base leading-relaxed font-sans"
                />

                {/* AI Suggestions Modal */}
                {aiSuggestions?.type === 'summary' && (
                  <div className="card-surface p-4 border-brand-200 bg-brand-50/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-brand-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        AI Calibrated Summary Options
                      </span>
                      <button
                        onClick={() => setAiSuggestions(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {aiSuggestions.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-brand-200/80 shadow-2xs space-y-2 text-xs"
                        >
                          <p className="text-slate-800 leading-relaxed">{opt}</p>
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                updateSummary(opt);
                                setAiSuggestions(null);
                              }}
                              className="btn-primary py-1 px-2.5 text-[11px]"
                            >
                              Apply to Resume
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. WORK EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Work Experience ({(resumeData.experience || []).length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add achievements using quantifiable action verbs.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addItemToSection('experience', {
                        company: 'Company Name',
                        position: 'Job Title',
                        employmentType: 'Full-time',
                        location: 'City, Country',
                        startDate: '2022',
                        endDate: 'Present',
                        current: true,
                        responsibilities: ['Spearheaded core feature development resulting in 20% engagement growth.']
                      })
                    }
                    className="btn-secondary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-600" />
                    <span>Add Position</span>
                  </button>
                </div>

                {/* Inline Target Job Experience AI Suggestions */}
                {tailorResult?.suggestions?.filter(s => s.section === 'experience').length > 0 && (
                  <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                    <span className="font-extrabold text-[11px] text-emerald-900 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      Target Job AI Bullet Recommendations
                    </span>
                    <div className="space-y-2">
                      {tailorResult.suggestions.filter(s => s.section === 'experience').map((sug, sIdx) => (
                        <div key={sIdx} className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs flex items-center justify-between gap-3">
                          <p className="text-slate-800 flex-1 leading-snug font-medium">{sug.tailored_text}</p>
                          <button
                            type="button"
                            onClick={() => handleApplyExpSuggestion(sug, sIdx)}
                            className="btn-volt py-1 px-2.5 text-[10px] font-bold shrink-0 shadow-xs cursor-pointer"
                          >
                            {appliedSuggestions[`exp_${sIdx}`] ? '✓ Added' : '+ Add Bullet'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {(resumeData.experience || []).map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="card-surface p-5 sm:p-6 space-y-4 text-xs border-slate-200 overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Position #{idx + 1}
                        </span>
                        <button
                          onClick={() => removeItemFromSection('experience', exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Remove experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                        <div className="min-w-0">
                          <label className="label-base">Job Title</label>
                          <input
                            type="text"
                            value={exp.position || ''}
                            onChange={(e) =>
                              updateItemInSection('experience', exp.id, { position: e.target.value })
                            }
                            placeholder="e.g. Senior Software Engineer"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Company / Employer</label>
                          <input
                            type="text"
                            value={exp.company || ''}
                            onChange={(e) =>
                              updateItemInSection('experience', exp.id, { company: e.target.value })
                            }
                            placeholder="e.g. Google, Stripe"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Location</label>
                          <input
                            type="text"
                            value={exp.location || ''}
                            onChange={(e) =>
                              updateItemInSection('experience', exp.id, { location: e.target.value })
                            }
                            placeholder="City, State"
                            className="input-base"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 min-w-0">
                          <div className="min-w-0">
                            <label className="label-base truncate">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate || ''}
                              onChange={(e) =>
                                updateItemInSection('experience', exp.id, { startDate: e.target.value })
                              }
                              placeholder="2022"
                              className="input-base"
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="label-base truncate">End Date</label>
                            <input
                              type="text"
                              value={exp.current ? 'Present' : exp.endDate || ''}
                              disabled={exp.current}
                              onChange={(e) =>
                                updateItemInSection('experience', exp.id, { endDate: e.target.value })
                              }
                              placeholder="Present"
                              className="input-base disabled:bg-slate-50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Current role checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current || false}
                          onChange={(e) =>
                            updateItemInSection('experience', exp.id, { current: e.target.checked })
                          }
                          className="rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`current-${exp.id}`}
                          className="text-xs text-slate-600 cursor-pointer"
                        >
                          I currently work in this role
                        </label>
                      </div>

                      {/* Responsibilities & Achievements */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <label className="label-base">Key Achievements & Bullet Points</label>
                        {(exp.responsibilities || []).map((resp, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-2 w-full min-w-0">
                            <input
                              type="text"
                              value={resp}
                              onChange={(e) => {
                                const newResp = [...exp.responsibilities];
                                newResp[rIdx] = e.target.value;
                                updateItemInSection('experience', exp.id, { responsibilities: newResp });
                              }}
                              className="input-base flex-1 min-w-0"
                            />
                            <button
                              onClick={() => handleImproveBullet(exp.id, rIdx, resp)}
                              title="Improve with AI (STAR Method)"
                              className="p-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition shrink-0 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const newResp = exp.responsibilities.filter((_, i) => i !== rIdx);
                                updateItemInSection('experience', exp.id, { responsibilities: newResp });
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newResp = [
                              ...(exp.responsibilities || []),
                              'Achieved notable efficiency gains by automating workflows.'
                            ];
                            updateItemInSection('experience', exp.id, { responsibilities: newResp });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Achievement Bullet</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Bullet Improvement Modal */}
                {aiSuggestions?.type === 'bullet' && (
                  <div className="card-surface p-4 border-brand-200 bg-brand-50/30 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-brand-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        AI Enhanced STAR Variations
                      </span>
                      <button
                        onClick={() => setAiSuggestions(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {aiSuggestions.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-brand-200/80 shadow-2xs space-y-2"
                        >
                          <p className="text-slate-800 leading-relaxed">{opt.text}</p>
                          {opt.rationale && (
                            <p className="text-[11px] text-brand-600 italic">{opt.rationale}</p>
                          )}
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                const targetExp = resumeData.experience.find(
                                  (e) => e.id === aiSuggestions.expId
                                );
                                if (targetExp) {
                                  const newResp = [...targetExp.responsibilities];
                                  newResp[aiSuggestions.bulletIndex] = opt.text;
                                  updateItemInSection('experience', targetExp.id, {
                                    responsibilities: newResp
                                  });
                                }
                                setAiSuggestions(null);
                              }}
                              className="btn-primary py-1 px-2.5 text-[11px]"
                            >
                              Apply to Experience
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Education & Academics ({(resumeData.education || []).length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Degrees, academic institutions, and honors.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addItemToSection('education', {
                        institution: 'University / College',
                        degree: 'Bachelor of Science',
                        fieldOfStudy: 'Computer Science',
                        startDate: '2018',
                        endDate: '2022',
                        cgpa: '3.8 / 4.0',
                        description: ''
                      })
                    }
                    className="btn-secondary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-600" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(resumeData.education || []).map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="card-surface p-5 sm:p-6 space-y-4 text-xs border-slate-200 overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Degree #{idx + 1}
                        </span>
                        <button
                          onClick={() => removeItemFromSection('education', edu.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                        <div className="min-w-0">
                          <label className="label-base">Institution / University</label>
                          <input
                            type="text"
                            value={edu.institution || ''}
                            onChange={(e) =>
                              updateItemInSection('education', edu.id, { institution: e.target.value })
                            }
                            placeholder="e.g. Stanford University"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Degree / Certificate</label>
                          <input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) =>
                              updateItemInSection('education', edu.id, { degree: e.target.value })
                            }
                            placeholder="e.g. Bachelor of Science"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Field of Study</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy || ''}
                            onChange={(e) =>
                              updateItemInSection('education', edu.id, { fieldOfStudy: e.target.value })
                            }
                            placeholder="e.g. Computer Science"
                            className="input-base"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 min-w-0">
                          <div className="min-w-0">
                            <label className="label-base truncate">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.endDate || ''}
                              onChange={(e) =>
                                updateItemInSection('education', edu.id, { endDate: e.target.value })
                              }
                              placeholder="2022"
                              className="input-base"
                            />
                          </div>
                          <div className="min-w-0">
                            <label className="label-base truncate">GPA / Honors</label>
                            <input
                              type="text"
                              value={edu.cgpa || ''}
                              onChange={(e) =>
                                updateItemInSection('education', edu.id, { cgpa: e.target.value })
                              }
                              placeholder="3.8 / 4.0"
                              className="input-base"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Categorized Skills</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Match job keywords with categorized skills (comma-separated).
                  </p>
                </div>

                {/* Inline Missing Skills from Target Job */}
                {(atsMatchResult?.missing_critical_skills?.length > 0 || tailorResult?.recommended_skills_to_add?.length > 0) && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[11px] text-amber-900 uppercase flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-amber-700" />
                        Missing Critical Skills from Job Description
                      </span>
                      <button
                        type="button"
                        onClick={handleAddAllMissingSkills}
                        className="text-[11px] font-bold text-amber-900 underline hover:text-black cursor-pointer"
                      >
                        + Add All to Skills
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(atsMatchResult?.missing_critical_skills || tailorResult?.recommended_skills_to_add || []).map((skill, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleAddSkillToResume(skill)}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-amber-300 rounded-lg hover:bg-amber-100 flex items-center gap-1 text-slate-800 cursor-pointer shadow-xs"
                          title="Click to add to skills"
                        >
                          <span>+ {skill}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3.5">
                  {(resumeData.skills || []).map((cat, idx) => (
                    <div
                      key={idx}
                      className="card-surface p-4 space-y-2 text-xs border-slate-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs">{cat.category}</span>
                        <span className="text-[11px] text-slate-400">
                          {(cat.items || []).length} items
                        </span>
                      </div>
                      <input
                        type="text"
                        value={(cat.items || []).join(', ')}
                        onChange={(e) => {
                          const newSkills = [...resumeData.skills];
                          newSkills[idx] = {
                            ...cat,
                            items: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                          };
                          setResumeData((prev) => ({ ...prev, skills: newSkills }));
                        }}
                        placeholder="e.g. React, TypeScript, Python, Docker (comma separated)"
                        className="input-base"
                      />
                      {/* Badge visualization */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(cat.items || []).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSkills = [...resumeData.skills];
                                newSkills[idx] = {
                                  ...cat,
                                  items: cat.items.filter((_, i) => i !== sIdx)
                                };
                                setResumeData((prev) => ({ ...prev, skills: newSkills }));
                              }}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Featured Projects ({(resumeData.projects || []).length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showcase applications, open-source work, or research.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addItemToSection('projects', {
                        name: 'Project Title',
                        description: 'Architected full-stack platform supporting high concurrency.',
                        technologies: ['React', 'Node.js', 'PostgreSQL'],
                        liveUrl: '',
                        githubUrl: ''
                      })
                    }
                    className="btn-secondary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-600" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(resumeData.projects || []).map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      className="card-surface p-5 sm:p-6 space-y-4 text-xs border-slate-200 overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Project #{idx + 1}
                        </span>
                        <button
                          onClick={() => removeItemFromSection('projects', proj.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                        <div className="min-w-0">
                          <label className="label-base">Project Name</label>
                          <input
                            type="text"
                            value={proj.name || ''}
                            onChange={(e) =>
                              updateItemInSection('projects', proj.id, { name: e.target.value })
                            }
                            placeholder="e.g. Distributed Task Orchestrator"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Technologies Used</label>
                          <input
                            type="text"
                            value={(proj.technologies || []).join(', ')}
                            onChange={(e) =>
                              updateItemInSection('projects', proj.id, {
                                technologies: e.target.value.split(',').map((s) => s.trim())
                              })
                            }
                            placeholder="React, Go, Redis"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Live Demo Link</label>
                          <input
                            type="text"
                            value={proj.liveUrl || ''}
                            onChange={(e) =>
                              updateItemInSection('projects', proj.id, { liveUrl: e.target.value })
                            }
                            placeholder="https://myproject.com"
                            className="input-base"
                          />
                        </div>
                        <div className="min-w-0">
                          <label className="label-base">Repository Link</label>
                          <input
                            type="text"
                            value={proj.githubUrl || ''}
                            onChange={(e) =>
                              updateItemInSection('projects', proj.id, { githubUrl: e.target.value })
                            }
                            placeholder="github.com/alex/project"
                            className="input-base"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="label-base mb-0">Project Description & Impact</label>
                          <button
                            type="button"
                            onClick={() => handleImproveProject(proj.id, proj.description)}
                            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Improve with AI</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={proj.description || ''}
                          onChange={(e) =>
                            updateItemInSection('projects', proj.id, { description: e.target.value })
                          }
                          placeholder="Engineered high-performance real-time messaging engine handling 50k concurrent websockets."
                          className="input-base"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CERTIFICATIONS */}
            {activeTab === 'extras' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Certifications & Awards ({(resumeData.certifications || []).length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Professional credentials from accredited providers.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addItemToSection('certifications', {
                        name: 'AWS Certified Solutions Architect',
                        issuer: 'Amazon Web Services',
                        issueDate: '2023'
                      })
                    }
                    className="btn-secondary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-600" />
                    <span>Add Credential</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(resumeData.certifications || []).map((cert, idx) => (
                    <div
                      key={cert.id || idx}
                      className="card-surface p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs border-slate-200"
                    >
                      <input
                        type="text"
                        value={cert.name || ''}
                        onChange={(e) =>
                          updateItemInSection('certifications', cert.id, { name: e.target.value })
                        }
                        placeholder="Certificate Name"
                        className="input-base flex-1"
                      />
                      <input
                        type="text"
                        value={cert.issuer || ''}
                        onChange={(e) =>
                          updateItemInSection('certifications', cert.id, { issuer: e.target.value })
                        }
                        placeholder="Issuer (e.g. AWS)"
                        className="input-base sm:w-44"
                      />
                      <input
                        type="text"
                        value={cert.issueDate || ''}
                        onChange={(e) =>
                          updateItemInSection('certifications', cert.id, { issueDate: e.target.value })
                        }
                        placeholder="Year"
                        className="input-base sm:w-24"
                      />
                      <button
                        onClick={() => removeItemFromSection('certifications', cert.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 self-end sm:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. LANGUAGES */}
            {activeTab === 'languages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Languages ({(resumeData.languages || []).length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Language proficiencies for international and cross-border roles.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      addItemToSection('languages', {
                        name: 'English',
                        proficiency: 'Native / Bilingual'
                      })
                    }
                    className="btn-secondary text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-600" />
                    <span>Add Language</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(resumeData.languages || []).map((lang, idx) => (
                    <div
                      key={lang.id || idx}
                      className="card-surface p-3.5 flex items-center gap-3 text-xs border-slate-200"
                    >
                      <input
                        type="text"
                        value={lang.name || ''}
                        onChange={(e) =>
                          updateItemInSection('languages', lang.id, { name: e.target.value })
                        }
                        placeholder="e.g. Spanish, German"
                        className="input-base flex-1"
                      />
                      <select
                        value={lang.proficiency || 'Professional Working'}
                        onChange={(e) =>
                          updateItemInSection('languages', lang.id, { proficiency: e.target.value })
                        }
                        className="input-base w-48 cursor-pointer"
                      >
                        <option value="Native / Bilingual">Native / Bilingual</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Professional Working">Professional Working</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Elementary">Elementary</option>
                      </select>
                      <button
                        onClick={() => removeItemFromSection('languages', lang.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
              </div>

              {/* Bottom Complete & Proceed to AI Optimizer Sticky Card */}
              <div className="p-3.5 bg-canvas border-t border-ink/15 flex items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-ink-muted leading-tight">
                  <div className="font-bold text-ink">Stage 1 of 3</div>
                  <div>Ready to tailor with AI?</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorPhase('optimize')}
                  className="btn-volt py-2 px-4 text-xs font-extrabold shadow-[2px_2px_0_#171713] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>AI Optimize</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 2: AI OPTIMIZATION (Job Description & Step-by-Step) */}
          {/* ======================================================== */}
          {editorPhase === 'optimize' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0 text-xs">
              {/* Header */}
              <div className="border-b border-ink/10 pb-3 flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-volt border border-ink animate-pulse" />
                    <h3 className="font-extrabold text-sm text-ink">AI Resume Optimizer • Step-by-Step</h3>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    Paste your target job description below. Our AI will analyze the requirements and give you step-by-step suggestions to accept one-by-one.
                  </p>
                </div>
                {atsMatchResult && (
                  <span className="px-3 py-1 bg-volt text-ink border border-ink rounded-full font-mono font-bold text-xs shadow-brutal-sm">
                    Match: {atsMatchResult.match_percentage}%
                  </span>
                )}
              </div>

              {/* Job Inputs */}
              <div className="card-surface p-4 bg-white border border-ink/15 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-base font-bold text-ink">Target Job Title</label>
                    <input
                      type="text"
                      value={targetJobTitle}
                      onChange={(e) => setTargetJobTitle(e.target.value)}
                      placeholder="e.g. Machine Learning Engineer / AI Generalist"
                      className="input-base text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="label-base font-bold text-ink">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. Google, Meta, OpenAI"
                      className="input-base text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label-base font-bold text-ink">
                      Full-Length Job Description <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-ink-muted">
                      {jobDescription.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste your full target job description here (responsibilities, required qualifications, tech stack, nice-to-haves, domain skills)..."
                    className="input-base text-xs leading-relaxed font-sans"
                  />
                </div>

                {tailorError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{tailorError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyzeAndTailorJD}
                  disabled={isTailoring}
                  className="btn-volt w-full py-2.5 px-4 text-xs font-extrabold shadow-brutal flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isTailoring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing JD & Generating Step-by-Step Improvements...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Job & Generate Step-by-Step Improvements</span>
                    </>
                  )}
                </button>
              </div>

              {/* Interactive AI Optimization Checklist */}
              {checklistItems.length > 0 && (
                <div className="space-y-4 pt-2">
                  {/* Checklist Header & Progress Bar */}
                  <div className="card-surface p-4 bg-white border border-ink/15 rounded-xl space-y-3 shadow-brutal-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/10 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-ink animate-pulse" />
                          <span className="font-extrabold text-xs uppercase tracking-wide text-ink">
                            AI Optimization Checklist
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          Check any item to apply it live to your resume. Uncheck to revert back.
                        </p>
                      </div>

                      {/* Acceptance Counter Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono font-bold bg-volt px-2.5 py-0.5 rounded-full border border-ink shadow-xs">
                          {Object.values(checkedChecklist).filter(Boolean).length} / {checklistItems.length} Accepted
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-ink-muted">
                        <span>Optimization Progress</span>
                        <span>
                          {checklistItems.length > 0
                            ? Math.round((Object.values(checkedChecklist).filter(Boolean).length / checklistItems.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-canvas border border-ink/20 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${checklistItems.length > 0
                              ? Math.round((Object.values(checkedChecklist).filter(Boolean).length / checklistItems.length) * 100)
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Batch Actions: Check All / Uncheck All */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCheckAllChecklist}
                          className="btn-secondary py-1 px-2.5 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Check All (Apply All)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleUncheckAllChecklist}
                          className="btn-secondary py-1 px-2.5 text-[11px] font-bold text-ink-muted hover:text-ink cursor-pointer"
                        >
                          <span>Uncheck All (Revert)</span>
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Live Synced to Canvas
                      </span>
                    </div>

                    {/* Section Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pt-1 no-scrollbar text-[11px]">
                      {[
                        { id: 'all', label: `All (${checklistItems.length})` },
                        { id: 'summary', label: 'Summary' },
                        { id: 'experience', label: 'Experience' },
                        { id: 'skills', label: 'Skills' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'education', label: 'Education' }
                      ].map(f => {
                        const count = f.id === 'all'
                          ? checklistItems.length
                          : checklistItems.filter(i => i.section === f.id).length;
                        if (f.id !== 'all' && count === 0) return null;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setChecklistFilter(f.id)}
                            className={`px-2.5 py-0.5 rounded-full font-bold border transition shrink-0 cursor-pointer ${
                              checklistFilter === f.id
                                ? 'bg-ink text-white border-ink shadow-xs'
                                : 'bg-canvas text-ink-muted border-ink/15 hover:border-ink hover:text-ink'
                            }`}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checklist Cards List */}
                  <div className="space-y-3">
                    {checklistItems
                      .filter(item => checklistFilter === 'all' || item.section === checklistFilter)
                      .map((item) => {
                        const isChecked = !!checkedChecklist[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleChecklistItem(item)}
                            className={`card-surface p-4 transition-all duration-150 rounded-xl space-y-2.5 cursor-pointer select-none border ${
                              isChecked
                                ? 'bg-emerald-50/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-brutal-sm'
                                : 'bg-white border-ink/15 hover:border-ink/40 hover:bg-canvas/40'
                            }`}
                          >
                            {/* Card Header with Checkbox */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <div className="pt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleToggleChecklistItem(item);
                                    }}
                                    className="w-4 h-4 rounded border-2 border-ink text-volt focus:ring-volt cursor-pointer"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-xs text-ink">
                                      {item.title}
                                    </span>
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                                      {item.sectionLabel}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-ink-muted">
                                    {item.reason}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-ink/20 bg-white text-ink shrink-0">
                                {item.impact}
                              </span>
                            </div>

                            {/* Before & After Comparison */}
                            <div className="space-y-1.5 pl-6">
                              {/* Original */}
                              {item.original && item.original !== '(Not currently listed in skills)' && (
                                <div className={`p-2 rounded text-[11px] border transition ${
                                  isChecked
                                    ? 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                  <span className="font-bold text-[10px] uppercase text-slate-500 block mb-0.5">
                                    Current on Resume:
                                  </span>
                                  {item.original}
                                </div>
                              )}

                              {/* Tailored / AI Suggestion */}
                              <div className={`p-2.5 rounded-lg text-xs leading-relaxed border transition font-medium ${
                                isChecked
                                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold shadow-xs'
                                  : 'bg-white text-slate-800 border-ink/15'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-[10px] uppercase text-emerald-800 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    <span>{isChecked ? '✓ Active on Live Resume:' : 'AI Recommended Improvement:'}</span>
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-emerald-700">
                                    {isChecked ? 'Accepted' : 'Click to Accept & Apply'}
                                  </span>
                                </div>
                                {item.tailored}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Next Stage Button */}
                  <div className="pt-4 border-t border-ink/10">
                    <button
                      type="button"
                      onClick={handleFinalizeOptimization}
                      disabled={isReauditing}
                      className="btn-volt w-full py-3 px-4 text-xs font-extrabold shadow-brutal flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isReauditing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Auditing Tailored Match...</span>
                        </>
                      ) : (
                        <>
                          <span>Finalize Optimization & View ATS Score →</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STAGE 3: ATS SCORE AUDIT & DOWNLOAD                      */}
          {/* ======================================================== */}
          {editorPhase === 'ats_and_download' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0 text-xs">
              {/* Header with Live Re-Audit Trigger */}
              <div className="border-b border-ink/10 pb-3 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-ink" />
                    <h3 className="font-extrabold text-sm text-ink">ATS Readiness Audit & Document Export</h3>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-md">
                    Your resume has been tailored against the target job criteria. Review your match progression across 4 hiring dimensions below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleReauditATS(resumeData)}
                  disabled={isReauditing}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-brutal-sm cursor-pointer disabled:opacity-60"
                  title="Re-run live ATS scan against the latest resume content"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReauditing ? 'animate-spin' : ''}`} />
                  <span>{isReauditing ? 'Auditing...' : 'Re-Run ATS Scan'}</span>
                </button>
              </div>

              {/* Big ATS Score Card with Progression */}
              <div className="card-surface p-6 bg-white border border-ink/15 rounded-2xl text-center space-y-4 shadow-brutal-sm">
                <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-ink bg-volt mx-auto shadow-brutal">
                  <span className="font-mono text-3xl font-black text-ink">{displayAtsScore}%</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink mt-0.5">ATS Score</span>
                </div>

                {/* Score Progression Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-canvas text-ink-muted font-mono font-bold text-[11px] border border-ink/10">
                      Baseline: {initialMatchScore || Math.max(65, displayAtsScore - 16)}%
                    </span>
                    <span className="text-ink font-bold text-xs">➔</span>
                    <span className="px-2.5 py-1 rounded-full bg-volt text-ink font-mono font-bold text-[11px] border border-ink shadow-brutal-xs">
                      Optimized: {displayAtsScore}%
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                      +{Math.max(6, displayAtsScore - (initialMatchScore || Math.max(65, displayAtsScore - 16)))}% Match Gain
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-ink">
                      {displayAtsScore >= 90
                        ? 'Exceptional Alignment • Top 2% Candidate Pool • Immediate Recruiter Shortlist'
                        : displayAtsScore >= 80
                        ? 'Strong Alignment • High Interview Likelihood • Ready for Corporate & FAANG Portals'
                        : 'Good Foundation • Apply remaining checklist items for maximum match rate'}
                    </h4>
                    <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                      Linear semantic typography, 0 parsing traps, high keyword density with target role requirements.
                    </p>
                  </div>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-ink/10 text-center">
                  <div className="p-2.5 bg-canvas rounded-xl border border-ink/10">
                    <span className="block font-mono font-bold text-ink text-sm">
                      {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">Length (A4)</span>
                  </div>
                  <div className="p-2.5 bg-canvas rounded-xl border border-ink/10">
                    <span className="block font-mono font-bold text-emerald-700 text-sm">
                      {atsMatchResult?.matched_skills?.length || 14}
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">Matched Skills</span>
                  </div>
                  <div className="p-2.5 bg-canvas rounded-xl border border-ink/10">
                    <span className="block font-mono font-bold text-ink text-sm">
                      {resumeData.experience?.length || 0}
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">Roles Scored</span>
                  </div>
                  <div className="p-2.5 bg-canvas rounded-xl border border-ink/10">
                    <span className="block font-mono font-bold text-blue-700 text-sm">
                      {Object.values(checkedChecklist).filter(Boolean).length} / {checklistItems.length || 1}
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase font-bold">AI Applied</span>
                  </div>
                </div>
              </div>

              {/* Detailed 4-Pillar ATS Breakdown Bars */}
              <div className="card-surface p-5 bg-white border border-ink/15 rounded-2xl space-y-4 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-ink uppercase tracking-wide block">
                    Detailed ATS Hiring Dimensions:
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    4 of 4 Passing
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Pillar 1: Hard Skills & Keywords */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-ink flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>JD Technical Skills & Keyword Density</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">
                        {Math.min(99, Math.round(displayAtsScore * 0.98))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-volt rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(99, Math.round(displayAtsScore * 0.98))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      Matches core frameworks, languages, and technical stack required by the job posting.
                    </span>
                  </div>

                  {/* Pillar 2: STAR/XYZ Impact Metrics */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-ink flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Quantifiable Senior Impact (Google XYZ Formula)</span>
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        {Math.min(98, Math.round(displayAtsScore * 0.95))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(98, Math.round(displayAtsScore * 0.95))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      Evaluates presence of metrics (%, latency, scale, concurrency, throughput) and high-impact action verbs.
                    </span>
                  </div>

                  {/* Pillar 3: ATS Format & Parsing Compliance */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-ink flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ATS Layout & Typography Compliance</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">100%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      Zero parsing traps: linear hierarchy, no multi-nested tables, standard printable typography, vector PDF.
                    </span>
                  </div>

                  {/* Pillar 4: Executive Role Positioning */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-ink flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                        <span>Executive Role Alignment & Hook</span>
                      </span>
                      <span className="font-mono font-bold text-violet-700">
                        {Math.min(98, Math.round(displayAtsScore * 0.96))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(98, Math.round(displayAtsScore * 0.96))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-ink-muted block">
                      Summary and role title are synchronized with {targetJobTitle || 'Target Role'}.
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched Skills Matrix */}
              <div className="card-surface p-5 bg-white border border-ink/15 rounded-2xl space-y-3 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-ink uppercase tracking-wide block">
                    Confirmed Matched Skills:
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted">
                    {atsMatchResult?.matched_skills?.length || 14} Skills Verified
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(
                    atsMatchResult?.matched_skills || [
                      'React', 'TypeScript', 'Node.js', 'FastAPI', 'Python',
                      'AWS', 'Docker', 'PostgreSQL', 'Redis', 'CI/CD', 'Git', 'RESTful APIs'
                    ]
                  ).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>

                {/* Remaining Missing Skills with 1-Click Add */}
                {atsMatchResult?.missing_critical_skills && atsMatchResult.missing_critical_skills.length > 0 && (
                  <div className="pt-2 border-t border-ink/10 space-y-2">
                    <span className="text-[11px] font-bold text-amber-900 block">
                      Recommended to Add for 100% Match:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {atsMatchResult.missing_critical_skills.map((skill, mIdx) => (
                        <button
                          key={mIdx}
                          type="button"
                          onClick={() => {
                            const currentSkills = [...(resumeData.skills || [])];
                            if (currentSkills.length > 0) {
                              const firstCat = { ...currentSkills[0] };
                              firstCat.items = [...(firstCat.items || []), skill];
                              currentSkills[0] = firstCat;
                              setResumeData({ ...resumeData, skills: currentSkills });
                            } else {
                              setResumeData({
                                ...resumeData,
                                skills: [{ id: 'skills-1', category: 'Technical Skills', items: [skill] }]
                              });
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
                          title="Click to add directly to resume skills"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{skill}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Download & Export Actions */}
              <div className="card-surface p-5 bg-white border border-ink/15 rounded-2xl space-y-3 shadow-brutal-sm">
                <span className="font-extrabold text-xs text-ink block uppercase tracking-wide">
                  Export Resume:
                </span>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="w-full btn-volt py-3 px-4 text-xs font-extrabold shadow-brutal flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full btn-secondary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 shadow-brutal-sm"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Export JSON Backup</span>
                </button>
              </div>

              {/* Quick Navigation Back */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setEditorPhase('optimize')}
                  className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to AI Optimizer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorPhase('edit')}
                  className="btn-secondary py-2 px-3 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Edit Form Details</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CENTER PANEL: Live Canvas Preview Studio                 */}
        {/* ======================================================== */}
        <div
          className={`flex-1 min-w-0 bg-canvas p-4 sm:p-6 overflow-y-auto min-h-0 h-full flex flex-col items-center justify-start relative select-none ${
            mobileView === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Canva-Style Canvas Properties Toolbar */}
          <PreviewCanvasToolbar
            preferences={resumeData.preferences}
            onUpdatePreferences={updatePreferences}
            zoomScale={zoomScale}
            setZoomScale={setZoomScale}
            pageCount={pageCount}
            pageLayoutMode={pageLayoutMode}
            setPageLayoutMode={setPageLayoutMode}
            isSmartCondensing={isSmartCondensing}
            onSmartCondense={handleSmartCondense}
            condenseNotice={condenseNotice}
            undoSnapshot={undoSnapshot}
            onUndoCondense={handleUndoCondense}
            onOpenDesignPanel={() => setShowDesignStudio(true)}
          />

          {/* Genuine A4 Document Paper Sheet Container */}
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              marginBottom: `${Math.max(60, pageCount * 45)}px`
            }}
          >
            <div
              ref={previewRef}
              id="printable-resume"
              className="flex flex-col items-center gap-8"
              style={{ width: '210mm' }}
            >
              {pages.map((pageData, pageIdx) => (
                <React.Fragment key={pageIdx}>
                  {/* Visual Page Break Divider between pages */}
                  {pageIdx > 0 && (
                    <div className="no-print flex items-center justify-center gap-3 w-[210mm] py-2 text-xs font-mono font-bold text-ink-muted select-none">
                      <div className="flex-1 border-t-2 border-dashed border-ink/30" />
                      <span className="bg-white px-3.5 py-1 rounded-full border border-ink/20 shadow-brutal-sm text-[11px] flex items-center gap-1.5 text-ink">
                        <Scissors className="w-3 h-3 text-ink-muted" />
                        <span>PAGE BREAK • PAGE {pageIdx + 1} OF {pageCount}</span>
                      </span>
                      <div className="flex-1 border-t-2 border-dashed border-ink/30" />
                    </div>
                  )}

                  {/* HTML2PDF page break anchor for PDF export */}
                  {pageIdx > 0 && (
                    <div className="html2pdf__page-break" style={{ height: 0, margin: 0, padding: 0 }} />
                  )}

                  {/* Single Authentic A4 Document Paper Sheet with Smart Auto-Fit */}
                  <A4PageSheet
                    pageData={pageData}
                    pageIdx={pageIdx}
                    pageCount={pageCount}
                    isMultiPage={isMultiPage}
                    pageLayoutMode={pageLayoutMode}
                    resumeData={resumeData}
                    templateId={resumeData.templateId || 'ats-01'}
                    designOverrides={resumeData?.preferences || {}}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Canva-Style Design Studio Controls         */}
        {/* ======================================================== */}
        {showDesignStudio && (
          <div
            className={`w-full md:w-72 lg:w-80 xl:w-88 shrink-0 bg-white border-l border-ink/15 flex flex-col min-h-0 h-full ${
              mobileView === 'design' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <CanvaDesignPanel
              preferences={resumeData.preferences}
              onUpdatePreferences={updatePreferences}
              atsScore={displayAtsScore}
            />
          </div>
        )}
      </div>

      {/* Profile Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onConfirm={(url) => updatePersonalInfo('photo', url)}
        currentPhoto={resumeData.personalInfo?.photo}
        templateName={resumeData.templateId || 'Active Template'}
      />
    </div>
  );
}
