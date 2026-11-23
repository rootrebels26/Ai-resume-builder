import React, { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Briefcase, GraduationCap, FolderGit2, Wrench, Award, Palette,
  Sparkles, Download, Printer, FileJson, Upload, RefreshCw, ZoomIn, ZoomOut,
  Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, Check, Eye, Loader2, ArrowRight,
  ArrowLeft, Languages, Layers, MoveUp, MoveDown, CheckCircle2, Sliders,
  HelpCircle, AlertCircle, Edit3, FileText, Scissors
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { ResumeTemplate } from '../components/templates/ResumeTemplate';
import { TEMPLATES, isFullBleedTemplate } from '../constants/templatesList';
import { pdfService } from '../services/pdfService';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { useResumePagination } from '../utils/resumePaginator';

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
  const [zoomScale, setZoomScale] = useState(0.85);
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null); // { type: 'summary'|'bullet'|'skills', options: [...] }
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [docTitle, setDocTitle] = useState(
    resumeData?.personalInfo?.fullName ? `${resumeData.personalInfo.fullName}'s Resume` : 'My Resume'
  );

  const previewRef = useRef(null);
  const jsonInputRef = useRef(null);
  const tabsRef = useRef(null);

  const { pages, pageCount, isMultiPage } = useResumePagination(resumeData);

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

  // Editor Section Tabs
  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'extras', label: 'Certifications', icon: Award },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'design', label: 'Design & Style', icon: Palette },
  ];

  // Calculate real-time ATS readiness score
  const atsScore = useMemo(() => {
    let score = 30;
    if (resumeData.personalInfo?.fullName) score += 10;
    if (resumeData.personalInfo?.email) score += 10;
    if (resumeData.personalInfo?.phone) score += 5;
    if (resumeData.personalInfo?.location) score += 5;
    if (resumeData.professionalSummary && resumeData.professionalSummary.length > 60) score += 10;
    if (resumeData.experience && resumeData.experience.length > 0) score += 15;
    if (resumeData.education && resumeData.education.length > 0) score += 5;
    if (resumeData.skills && resumeData.skills.length > 0) score += 10;
    return Math.min(score, 98);
  }, [resumeData]);

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
    const prevZoom = zoomScale;
    setZoomScale(1);
    await new Promise((r) => setTimeout(r, 100));
    try {
      const candidate = (resumeData.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_');
      const role = (resumeData.personalInfo?.professionalTitle || 'CV').replace(/\s+/g, '_');
      const filename = `${candidate}_${role}.pdf`;
      await pdfService.exportToPDF(previewRef.current, filename);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setZoomScale(prevZoom);
      setIsExporting(false);
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
      {/* Top Application Bar with Figma Styling */}
      <div className="bg-[#FAF8F5] border-b border-ink/15 px-4 py-2.5 flex items-center justify-between gap-4 no-print shrink-0 z-20 shadow-xs">
        {/* Left: Back & Document Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-black/5 rounded-full transition"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                autoFocus
                className="input-base py-1 px-3 text-xs sm:text-sm font-extrabold w-48 sm:w-64"
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-full bg-white border border-ink hover:bg-canvas transition truncate shadow-brutal-sm"
                title="Click to rename resume"
              >
                <span className="font-extrabold text-xs sm:text-sm text-ink truncate">
                  {docTitle}
                </span>
                <Edit3 className="w-3 h-3 text-ink-muted opacity-0 group-hover:opacity-100 transition" />
              </div>
            )}

            {/* ATS Score Meter Pill & Live Sync */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-volt text-ink border border-ink text-[11px] font-mono font-bold shadow-brutal-sm">
              <span className="flex h-2 w-2 relative" title="Live Synced">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ink" />
              </span>
              <span>ATS {atsScore}%</span>
            </div>
          </div>
        </div>

        {/* Center: Mobile Switcher (Editor / Preview) */}
        <div className="md:hidden flex rounded-full bg-white p-0.5 border border-ink shadow-brutal-sm">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition ${
              mobileView === 'editor' ? 'bg-ink text-white' : 'text-ink-muted'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition ${
              mobileView === 'preview' ? 'bg-ink text-white' : 'text-ink-muted'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Right: Template Selector & Actions */}
        <div className="flex items-center gap-2">
          {/* Template Selector dropdown */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-ink-muted uppercase">Template:</span>
            <select
              value={resumeData.templateId || 'ats-01'}
              onChange={(e) => setTemplateId(e.target.value)}
              className="text-xs font-bold text-ink bg-white border border-ink rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-volt cursor-pointer shadow-brutal-sm"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Reset sample data */}
          <button
            onClick={loadSampleData}
            title="Load sample content"
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-black/5 rounded-full transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Hidden JSON input */}
          <input
            type="file"
            ref={jsonInputRef}
            onChange={handleJSONFileSelected}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Download PDF Primary Action */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="btn-volt py-1.5 sm:py-2 px-3.5 sm:px-4 text-xs shadow-brutal-sm group"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL: Section Forms & Ergonomic Inputs            */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-1/2 lg:w-1/2 xl:w-5/12 bg-white border-r border-ink/15 flex flex-col min-h-0 h-full ${
            mobileView === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Section Navigation Tabs with Left & Right Sliding Controls */}
          <div className="relative flex items-center border-b border-ink/10 bg-canvas px-1.5 shrink-0 select-none">
            {/* Scroll Left Button */}
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-black/10 rounded-full transition shrink-0 cursor-pointer"
              title="Slide options left"
              aria-label="Slide options left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Tabs List with Mouse Wheel & Touch Scroll */}
            <div
              ref={tabsRef}
              onWheel={(e) => {
                if (e.deltaY !== 0 && tabsRef.current) {
                  tabsRef.current.scrollLeft += e.deltaY;
                }
              }}
              className="flex items-center gap-1.5 overflow-x-auto py-2.5 px-1 text-xs no-scrollbar flex-1 scroll-smooth"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all duration-150 cursor-pointer border shrink-0 ${
                      isActive
                        ? 'bg-ink text-white border-ink shadow-brutal-sm'
                        : 'bg-white text-ink-muted border-ink/20 hover:border-ink hover:text-ink'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-volt' : 'text-ink-muted'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-black/10 rounded-full transition shrink-0 cursor-pointer"
              title="Slide options right"
              aria-label="Slide options right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content Form Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6 min-h-0">
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
                    <label className="label-base">GitHub / Portfolio URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.github || ''}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                      placeholder="github.com/alex"
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

            {/* 9. DESIGN & TEMPLATES */}
            {activeTab === 'design' && (
              <div className="space-y-6 text-xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Design Customizations</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailor color palette, typography accents, and document style.
                  </p>
                </div>

                {/* Color Swatches */}
                <div className="space-y-2.5">
                  <label className="label-base">Executive Color Theme</label>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    {COLOR_PRESETS.map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => handleColorChange(swatch.color)}
                        className={`w-7 h-7 rounded-full transition-all border flex items-center justify-center cursor-pointer ${
                          (resumeData.preferences?.themeColor || '#1e293b') === swatch.color
                            ? 'ring-2 ring-brand-500 ring-offset-2 scale-110 border-transparent'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.color }}
                        title={swatch.name}
                      >
                        {(resumeData.preferences?.themeColor || '#1e293b') === swatch.color && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-2">
                      <input
                        type="color"
                        value={resumeData.preferences?.themeColor || '#1e293b'}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-7 h-7 rounded-full cursor-pointer border border-slate-200"
                        title="Custom hex color"
                      />
                      <span className="font-mono text-[11px] text-slate-500 uppercase">
                        {resumeData.preferences?.themeColor || '#1e293b'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch Template Grid */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <label className="label-base">Change Active Template ({TEMPLATES.length} Styles)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplateId(t.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          (resumeData.templateId || 'ats-01') === t.id
                            ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500 shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 truncate">{t.name}</span>
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: t.accentColor }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">
                          {t.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Live A4 Document Studio                    */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-1/2 lg:w-1/2 xl:w-7/12 flex-1 bg-canvas p-4 sm:p-8 overflow-y-auto min-h-0 h-full flex flex-col items-center justify-start relative select-none ${
            mobileView === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Floating Canvas Toolbar */}
          <div className="sticky top-0 z-10 mb-6 bg-white px-4 py-2 rounded-full border-[1.5px] border-ink shadow-brutal-sm flex items-center gap-3 text-xs text-ink shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.45, Number((z - 0.05).toFixed(2))))}
                className="p-1 hover:text-ink hover:bg-canvas rounded-full transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(0.85)}
                className="px-2 font-mono text-[11px] font-bold text-ink hover:text-editorial-violet"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.4, Number((z + 0.05).toFixed(2))))}
                className="p-1 hover:text-ink hover:bg-canvas rounded-full transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-3.5 w-px bg-ink/20" />

            {/* Quick Color Swatches on Preview */}
            <div className="flex items-center gap-1.5">
              {COLOR_PRESETS.slice(0, 5).map((s) => (
                <button
                  key={s.color}
                  type="button"
                  onClick={() => handleColorChange(s.color)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border border-ink/40 ${
                    (resumeData.preferences?.themeColor || '#1e293b') === s.color
                      ? 'scale-125 ring-2 ring-volt'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: s.color }}
                  title={s.name}
                />
              ))}
            </div>

            <div className="h-3.5 w-px bg-ink/20" />

            {/* Multi-Page Indicator Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border border-ink/20 font-mono text-[11px] font-bold text-ink">
              <FileText className="w-3.5 h-3.5 text-ink-muted" />
              <span>{pageCount === 1 ? '1 Page (A4)' : `${pageCount} Pages (A4)`}</span>
              {isMultiPage && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-volt text-[9px] font-extrabold uppercase border border-ink/30">
                  Multi-Page
                </span>
              )}
            </div>
          </div>

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

                  {/* Single Authentic A4 Document Paper Sheet */}
                  <div
                    className="resume-a4-page bg-white shadow-brutal-lg rounded-sm border-[1.5px] border-ink text-ink relative flex flex-col justify-between"
                    style={{
                      width: '210mm',
                      height: '297mm', // Fixed genuine A4 sheet height!
                      padding: isFullBleedTemplate(resumeData.templateId || 'ats-01') ? '0' : '18mm',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                    data-page-index={pageIdx + 1}
                  >
                    <div className="flex-1 h-full overflow-hidden flex flex-col">
                      <ResumeTemplate
                        templateId={resumeData.templateId || 'ats-01'}
                        resumeData={pageData}
                      />
                    </div>

                    {/* Authentic subtle footer page indicator when multi-page and NOT full bleed */}
                    {isMultiPage && !isFullBleedTemplate(resumeData.templateId || 'ats-01') && (
                      <div className="pt-2 mt-auto text-[10px] font-mono text-slate-400 flex justify-between items-center border-t border-slate-100 select-none">
                        <span className="truncate max-w-[200px]">
                          {resumeData.personalInfo?.fullName || 'Resume'}
                        </span>
                        <span>Page {pageIdx + 1} of {pageCount}</span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
