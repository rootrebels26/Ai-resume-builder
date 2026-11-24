import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, FileText, UploadCloud, Target, ArrowRight, ArrowLeft,
  Check, Star, Briefcase, GraduationCap, Award, ShieldCheck,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw, Palette, Layers, User,
  Search, Eye, X
} from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { TEMPLATES, TEMPLATE_CATEGORIES, TOTAL_TEMPLATES_COUNT } from '../constants/templatesList';
import { TemplateDraftPaper } from '../components/templates/TemplateDraftPaper';
import { TemplateQuickPreviewModal } from '../components/templates/TemplateQuickPreviewModal';
import { resumeService } from '../services/resumeService';
import { ExtractionReviewModal } from '../components/resume/ExtractionReviewModal';
import { sanitizeResumeData } from '../utils/sanitizeResume';

const COLOR_SWATCHES = [
  { name: 'Classic Slate', color: '#1e293b' },
  { name: 'Resume Blue', color: '#0284c7' },
  { name: 'Royal Navy', color: '#1d4ed8' },
  { name: 'Emerald Green', color: '#059669' },
  { name: 'Executive Violet', color: '#7c3aed' },
  { name: 'Crimson Burgundy', color: '#dc2626' },
  { name: 'Cyan Modern', color: '#0891b2' },
  { name: 'Warm Amber', color: '#d97706' },
];

const POPULAR_ROLES = [
  'Senior Full Stack Engineer',
  'Frontend Developer (React/TS)',
  'Backend Engineer (Python/Node)',
  'Data Scientist / AI Engineer',
  'DevOps & Cloud Architect',
  'Product Manager',
  'Software Engineering Lead'
];

const SENIORITY_LEVELS = [
  { id: 'student', label: 'Student / Fresher', desc: '0 years • Highlight education, projects, and coursework' },
  { id: 'entry', label: 'Entry-Level', desc: '1–2 years • Foundational career experience' },
  { id: 'mid', label: 'Mid-Level', desc: '3–5 years • Proven contributor with measurable project achievements' },
  { id: 'senior', label: 'Senior Professional', desc: '6–9 years • Technical leadership and architecture ownership' },
  { id: 'executive', label: 'Lead / Executive', desc: '10+ years • Strategic vision, P&L, and team management' }
];

export function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    resumeData,
    setResumeData,
    selectTemplate,
    selectedTemplateId,
    updatePreferences,
    setTargetJob
  } = useResume();

  // Step hash sync (#1, #2, #3) matching Enhancv
  const parseStepFromHash = () => {
    const hash = window.location.hash;
    if (hash === '#2') return 2;
    if (hash === '#3') return 3;
    return 1;
  };

  const [step, setStep] = useState(parseStepFromHash);

  // Creation approach: 'upload' (Enhancv auto-extract) or 'scratch'
  const [method, setMethod] = useState('upload');

  // File Upload & Parser State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [rawParseResult, setRawParseResult] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Scratch Mode inputs
  const [targetRole, setTargetRole] = useState('');
  const [seniority, setSeniority] = useState('mid');

  // Step 2: Template & Style Selection
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [chosenTemplateId, setChosenTemplateId] = useState(selectedTemplateId || 'maang-01');
  const [chosenColor, setChosenColor] = useState('#1a73e8');

  const fileInputRef = useRef(null);

  // Keep window.location.hash synchronized with step
  useEffect(() => {
    window.location.hash = `#${step}`;
  }, [step]);

  // Handle file drop & selection
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async (file) => {
    setUploadedFile(file);
    setParseError(null);
    setIsParsing(true);

    try {
      const res = await resumeService.parseResumeFile(file);
      if (res.success && res.data?.resume_data) {
        const parsed = sanitizeResumeData(res.data.resume_data);
        setExtractedData(parsed);
        setRawParseResult(res.data);

        // Pre-fill target role if detected in resume
        const extractedTitle = parsed.personalInfo?.professionalTitle ||
          parsed.experience?.[0]?.position ||
          parsed.internships?.[0]?.role ||
          '';

        if (extractedTitle) {
          setTargetRole(extractedTitle);
          if (setTargetJob) {
            setTargetJob({ role: extractedTitle, company: '', description: '' });
          }
        }
      } else {
        setParseError(res.message || "Failed to extract text from document. Please upload a standard PDF or Word file.");
      }
    } catch (err) {
      console.error("Resume file extraction error:", err);
      setParseError(err.message || "Failed to process document. Please ensure it is a valid PDF or DOCX file.");
    } finally {
      setIsParsing(false);
    }
  };

  // Filter templates for Step 2
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      const matchCat = selectedCategory === 'all' || tpl.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.id.toLowerCase().includes(q) ||
        (tpl.badge && tpl.badge.toLowerCase().includes(q)) ||
        (tpl.layout && tpl.layout.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeTemplateObj = useMemo(() => {
    return TEMPLATES.find(t => t.id === chosenTemplateId) || TEMPLATES[0];
  }, [chosenTemplateId]);

  // Handle template selection
  const handleSelectTemplate = (id) => {
    setChosenTemplateId(id);
    const tpl = TEMPLATES.find(t => t.id === id);
    if (tpl?.accentColor) {
      setChosenColor(tpl.accentColor);
    }
  };

  // Commit all data and enter the Builder
  const handleLaunchBuilder = () => {
    let finalResume;

    if (method === 'upload' && extractedData) {
      finalResume = {
        ...extractedData,
        templateId: chosenTemplateId,
        preferences: {
          ...(extractedData.preferences || {}),
          themeColor: chosenColor,
          accentColor: chosenColor
        }
      };
      if (targetRole) {
        finalResume.personalInfo = {
          ...(finalResume.personalInfo || {}),
          professionalTitle: targetRole
        };
      }
    } else {
      // Create from scratch with chosen role & target seniority
      finalResume = {
        ...resumeData,
        templateId: chosenTemplateId,
        personalInfo: {
          ...(resumeData.personalInfo || {}),
          professionalTitle: targetRole
        },
        preferences: {
          ...(resumeData.preferences || {}),
          themeColor: chosenColor,
          accentColor: chosenColor
        }
      };
    }

    // Update global context
    setResumeData(finalResume);
    selectTemplate(chosenTemplateId);
    if (setTargetJob) {
      setTargetJob({
        role: targetRole || finalResume.personalInfo?.professionalTitle || 'Software Engineer',
        company: '',
        description: ''
      });
    }
    if (updatePreferences) {
      updatePreferences('themeColor', chosenColor);
      updatePreferences('accentColor', chosenColor);
    }

    navigate('/builder');
  };

  return (
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12 flex flex-col justify-between text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Top Enhancv-Style Multi-Segment Step Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-volt border border-ink animate-pulse" />
              <span className="font-extrabold text-ink uppercase tracking-wider text-[11px]">
                Nitya CloudTech Resume Builder
              </span>
            </div>
            <span className="font-mono text-ink-muted text-[11px] font-bold">
              Step {step} of 3 • {step === 1 ? 'Data Source' : step === 2 ? 'Choose Design' : 'Launch Resume'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={`h-2 rounded-full border border-ink transition-colors duration-300 ${step >= 1 ? 'bg-ink' : 'bg-canvas-dark'}`} />
            <div className={`h-2 rounded-full border border-ink transition-colors duration-300 ${step >= 2 ? 'bg-ink' : 'bg-canvas-dark'}`} />
            <div className={`h-2 rounded-full border border-ink transition-colors duration-300 ${step >= 3 ? 'bg-ink' : 'bg-canvas-dark'}`} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCREEN 1: HOW WOULD YOU LIKE TO START? (#1)              */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="eyebrow-tag justify-center">
                <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
                <span>ONBOARDING • STEP 1</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                How would you like to build your resume?
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Import an existing resume to automatically extract all sections, or start fresh with our role-targeted writer.
              </p>
            </div>

            {/* Two Primary Method Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Upload Existing Resume */}
              <div
                onClick={() => setMethod('upload')}
                className={`card-surface p-5 sm:p-6 cursor-pointer transition-all flex flex-col justify-between ${
                  method === 'upload'
                    ? 'ring-2 ring-volt bg-white shadow-brutal-lg'
                    : 'bg-white/70 hover:bg-white hover:shadow-brutal-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-volt text-ink border border-ink">
                      Fastest (2 min)
                    </span>
                    <div className={`w-5 h-5 rounded-full border border-ink flex items-center justify-center ${
                      method === 'upload' ? 'bg-ink text-white' : 'bg-canvas'
                    }`}>
                      {method === 'upload' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-ink flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-editorial-violet" />
                      <span>Upload &amp; Extract Existing Resume</span>
                    </h3>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Upload your current PDF or Word resume. Our engine extracts your work experience, education, skills, and summary automatically into the builder.
                    </p>
                  </div>
                </div>

                {/* Integrated Upload Dropzone when upload method is active */}
                {method === 'upload' && (
                  <div className="mt-4 pt-3 border-t border-ink/10 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        uploadedFile
                          ? 'border-emerald-500 bg-emerald-50/60'
                          : 'border-ink/25 hover:border-ink hover:bg-canvas'
                      }`}
                    >
                      {isParsing ? (
                        <div className="py-2 flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 text-editorial-violet animate-spin" />
                          <p className="text-xs font-bold text-ink">Extracting resume data with AI parser...</p>
                        </div>
                      ) : uploadedFile ? (
                        <div className="flex items-center justify-between text-left">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-600 text-emerald-700 flex items-center justify-center font-bold">
                              <Check className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-extrabold text-ink truncate max-w-[200px]">{uploadedFile.name}</p>
                              <p className="text-[10px] text-ink-muted font-mono">
                                {(uploadedFile.size / 1024).toFixed(1)} KB • Extracted Successfully
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-editorial-violet underline">
                            Replace
                          </span>
                        </div>
                      ) : (
                        <div className="py-1 flex flex-col items-center gap-1.5">
                          <UploadCloud className="w-7 h-7 text-ink" />
                          <p className="text-xs font-bold text-ink">
                            Drop PDF or DOCX here, or <span className="text-editorial-violet underline">Browse</span>
                          </p>
                          <p className="text-[10px] text-ink-muted">Accepts PDF, DOCX up to 10MB</p>
                        </div>
                      )}
                    </div>

                    {parseError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{parseError}</span>
                      </div>
                    )}

                    {/* Extracted Sections Checklist */}
                    {extractedData && (
                      <div className="p-3.5 bg-canvas rounded-xl border border-ink/15 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] uppercase tracking-wider text-ink-muted block">
                            Extracted Sections Ready to Populate:
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsReviewOpen(true)}
                            className="btn-secondary py-1 px-2.5 text-[11px] font-mono font-bold flex items-center gap-1 shadow-brutal-sm"
                          >
                            <Sparkles className="w-3 h-3 text-editorial-violet" />
                            <span>Review Details</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{extractedData.personalInfo?.fullName || "Personal Info"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{extractedData.experience?.length || 0} Work Roles</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{extractedData.projects?.length || 0} Projects</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{extractedData.education?.length || 0} Degrees</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{extractedData.skills?.length || 0} Skill Groups</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Option B: Create from Scratch */}
              <div
                onClick={() => setMethod('scratch')}
                className={`card-surface p-5 sm:p-6 cursor-pointer transition-all flex flex-col justify-between ${
                  method === 'scratch'
                    ? 'ring-2 ring-volt bg-white shadow-brutal-lg'
                    : 'bg-white/70 hover:bg-white hover:shadow-brutal-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-canvas text-ink border border-ink">
                      Guided Writer
                    </span>
                    <div className={`w-5 h-5 rounded-full border border-ink flex items-center justify-center ${
                      method === 'scratch' ? 'bg-ink text-white' : 'bg-canvas'
                    }`}>
                      {method === 'scratch' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-ink flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-ink" />
                      <span>Create New Resume from Scratch</span>
                    </h3>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Start fresh with our calibrated layout engine. Select your target role and seniority, and our AI assistant will recommend power bullet points.
                    </p>
                  </div>
                </div>

                {/* Target Role & Seniority Selector when scratch is active */}
                {method === 'scratch' && (
                  <div className="mt-4 pt-3 border-t border-ink/10 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Target Job Title</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Full Stack Engineer"
                        className="input-base text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">Experience Level</label>
                      <select
                        value={seniority}
                        onChange={(e) => setSeniority(e.target.value)}
                        className="input-base text-xs font-medium cursor-pointer"
                      >
                        {SENIORITY_LEVELS.map((lvl) => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.label} ({lvl.desc.split('•')[0].trim()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Step 1 Action */}
            <div className="flex items-center justify-between pt-4 border-t border-ink/10">
              <div className="flex items-center gap-2 text-xs text-ink-muted font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privacy First • No Credit Card Required</span>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={method === 'upload' && !extractedData && !uploadedFile}
                className="btn-volt py-3 px-8 text-xs sm:text-sm font-extrabold shadow-brutal flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Step 2: Choose Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: CHOOSE TEMPLATE & STYLE (#2)                   */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="eyebrow-tag justify-center">
                <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
                <span>ONBOARDING • STEP 2</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Choose your foundation template
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                {method === 'upload' && extractedData
                  ? `Your extracted data for ${extractedData.personalInfo?.fullName || "Candidate"} (${targetRole || extractedData.personalInfo?.professionalTitle || 'Software Engineer'}) will be formatted with your chosen template.`
                  : `Tailored for ${targetRole || 'your target role'}. You can switch templates anytime inside the live editor.`}
              </p>
            </div>

            {/* Category Filter Pills, Search Bar & Swatches */}
            <div className="card-surface p-4 sm:p-5 bg-white space-y-4">
              {/* Row 1: Search & Color Palette */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-ink/10">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 130+ templates (Google, AWS, React, Python, ATS, Minimalist)..."
                    className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-ink/20 bg-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Counter & Color Swatches */}
                <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-ink-muted uppercase">
                    Showing <span className="text-ink font-black">{filteredTemplates.length}</span> of {TOTAL_TEMPLATES_COUNT} Designs
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-ink-muted uppercase">Accent:</span>
                    <div className="flex items-center gap-1.5">
                      {COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => setChosenColor(swatch.color)}
                          title={swatch.name}
                          className={`w-5 h-5 rounded-full border border-ink transition-transform cursor-pointer ${
                            chosenColor === swatch.color ? 'scale-125 ring-2 ring-ink shadow-sm' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: swatch.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Comprehensive Category Pills (All 14 Categories with Badges) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const count = cat.id === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === cat.id).length;
                  const isActive = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-ink text-white border-ink shadow-brutal-sm'
                          : 'bg-canvas text-ink border-ink/20 hover:bg-canvas-dark'
                      }`}
                    >
                      <span>{cat.name.split(' (')[0]}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-volt text-ink font-bold' : 'bg-ink/10 text-ink-muted'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Templates Grid — Shows ALL matching templates without slicing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {filteredTemplates.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-ink-muted">
                    <p className="font-bold text-sm">No templates found matching "{searchQuery}"</p>
                    <p className="text-xs mt-1">Try selecting another category or clear your search.</p>
                  </div>
                ) : (
                  filteredTemplates.map((tpl) => {
                    const isSelected = chosenTemplateId === tpl.id;

                    return (
                      <div
                        key={tpl.id}
                        className={`card-surface p-3.5 rounded-2xl border transition-all flex flex-col justify-between group relative ${
                          isSelected
                            ? 'ring-2 ring-volt border-ink shadow-brutal-lg bg-white'
                            : 'border-ink/20 bg-white/70 hover:bg-white hover:border-ink'
                        }`}
                      >
                        {/* Top Bar */}
                        <div className="flex items-center justify-between pb-2 text-xs">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-volt text-ink border border-ink">
                            {tpl.badge || tpl.category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-ink">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>{tpl.rating}</span>
                          </div>
                        </div>

                        {/* Miniature Paper Sheet Preview Container with Hover Action */}
                        <div
                          onClick={() => handleSelectTemplate(tpl.id)}
                          className="bg-canvas p-2.5 rounded-lg border border-ink/10 flex items-center justify-center overflow-hidden aspect-[210/297] my-1 relative cursor-pointer"
                        >
                          <div className="w-full h-full rounded shadow-sm overflow-hidden transform transition-transform group-hover:scale-[1.02]">
                            <TemplateDraftPaper template={{ ...tpl, accentColor: chosenColor }} />
                          </div>

                          {/* Hover Quick Preview Button */}
                          <div className="absolute inset-0 bg-ink/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTemplate(tpl);
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white text-ink border border-ink shadow-brutal-sm hover:bg-canvas transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-editorial-violet" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <div className="truncate">
                            <h4 className="font-extrabold text-xs text-ink truncate">{tpl.name}</h4>
                            <span className="text-[10px] text-ink-muted capitalize">{tpl.layout}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectTemplate(tpl.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition cursor-pointer ${
                              isSelected ? 'bg-volt text-ink border border-ink shadow-brutal-sm' : 'bg-canvas text-ink border border-ink/20 hover:bg-ink hover:text-white'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Choose'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Step 2 Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Step 1</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-volt py-3 px-8 text-xs sm:text-sm font-extrabold shadow-brutal flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step 3: Review &amp; Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: REVIEW & LAUNCH RESUME (#3)                    */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="eyebrow-tag justify-center">
                <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
                <span>ONBOARDING • STEP 3 (FINAL)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Your resume is ready to populate
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                We're ready to launch the editor with your extracted sections mapped directly into your chosen design.
              </p>
            </div>

            {/* Enhancv Summary Review Card */}
            <div className="card-surface p-6 sm:p-8 bg-white space-y-6 shadow-brutal-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Left: Chosen Template Miniature */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-full max-w-[190px] aspect-[210/297] rounded-xl bg-white shadow-paper border border-ink overflow-hidden p-1">
                    <TemplateDraftPaper template={{ ...activeTemplateObj, accentColor: chosenColor }} />
                  </div>
                  <span className="mt-2 text-xs font-extrabold text-ink">{activeTemplateObj.name}</span>
                  <span className="text-[10px] font-mono text-ink-muted uppercase">{activeTemplateObj.layout}</span>
                </div>

                {/* Right: Extracted Sections Summary */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 bg-canvas rounded-2xl border border-ink/15 space-y-3">
                    <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-editorial-violet" />
                        <span className="font-extrabold text-sm text-ink">
                          {method === 'upload' && extractedData?.personalInfo?.fullName
                            ? extractedData.personalInfo.fullName
                            : (resumeData?.personalInfo?.fullName || "Candidate Resume")}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-volt px-2 py-0.5 rounded border border-ink">
                        {method === 'upload' ? 'Auto-Extracted' : 'Clean Slate'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs items-center">
                      <div>
                        <span className="text-[10px] text-ink-muted uppercase font-bold block mb-1">Target Role</span>
                        <input
                          type="text"
                          value={targetRole || extractedData?.personalInfo?.professionalTitle || (extractedData?.experience?.[0]?.position) || ''}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g. Senior Full Stack Engineer"
                          className="w-full text-xs font-bold text-ink bg-white border border-ink/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-ink"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-muted uppercase font-bold block mb-1">Selected Color</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-4 h-4 rounded-full border border-ink" style={{ backgroundColor: chosenColor }} />
                          <span className="font-mono text-xs font-bold">{chosenColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sections Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-ink block uppercase tracking-wide">
                      Populated Sections Breakdown:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-3 bg-canvas rounded-xl border border-ink/10">
                        <span className="text-lg font-black text-ink">
                          {method === 'upload' && extractedData ? (extractedData.experience?.length || 0) : 2}
                        </span>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Experience</span>
                      </div>
                      <div className="p-3 bg-canvas rounded-xl border border-ink/10">
                        <span className="text-lg font-black text-ink">
                          {method === 'upload' && extractedData ? (extractedData.education?.length || 0) : 1}
                        </span>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Education</span>
                      </div>
                      <div className="p-3 bg-canvas rounded-xl border border-ink/10">
                        <span className="text-lg font-black text-ink">
                          {method === 'upload' && extractedData ? (extractedData.skills?.length || 0) : 3}
                        </span>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Skill Groups</span>
                      </div>
                      <div className="p-3 bg-canvas rounded-xl border border-ink/10">
                        <span className="text-lg font-black text-ink">
                          {method === 'upload' && extractedData ? (extractedData.projects?.length || 0) : 2}
                        </span>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Projects</span>
                      </div>
                    </div>
                  </div>

                  {/* ATS Compatibility Preview */}
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Formatted with ATS-safe semantic tags, linear hierarchy, and high-DPI PDF compatibility.</span>
                  </div>
                </div>
              </div>

              {/* Big Launch Action Button */}
              <div className="pt-2 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Templates</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchBuilder}
                  className="w-full sm:w-auto btn-volt py-3.5 px-10 text-sm font-extrabold shadow-brutal flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-ink" />
                  <span>Open in Live Resume Editor</span>
                  <ArrowRight className="w-4 h-4 text-ink" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for In-depth Extraction Review */}
        {rawParseResult && (
          <ExtractionReviewModal
            isOpen={isReviewOpen}
            onClose={() => setIsReviewOpen(false)}
            onConfirm={(editedData) => {
              setExtractedData(editedData);
              setIsReviewOpen(false);
            }}
            parseResult={rawParseResult}
          />
        )}

        {/* Modal for Quick Template Preview */}
        {previewTemplate && (
          <TemplateQuickPreviewModal
            isOpen={!!previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            template={previewTemplate}
            onSelect={(id) => {
              handleSelectTemplate(id);
              setPreviewTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
