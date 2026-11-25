import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck,
  RefreshCw, Loader2, Sparkles, Search, Target, UploadCloud,
  FileText, Briefcase, Plus, Check, Copy, HelpCircle, Layers,
  ChevronDown, ChevronRight, Award, Zap
} from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useResume } from '../context/ResumeContext';

const POPULAR_ROLES = [
  "Senior Full Stack Engineer",
  "Frontend Developer (React/TS)",
  "Backend Engineer (Python/Node)",
  "Data Scientist / AI Engineer",
  "DevOps & Cloud Architect",
  "Product Manager",
  "Software Engineering Lead"
];

// Role-based keyword benchmark hints for common roles
const ROLE_BENCHMARK_KEYWORDS = {
  "full stack": ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "REST APIs", "GraphQL", "AWS", "CI/CD"],
  "frontend": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "HTML5", "CSS3", "Webpack", "Performance Optimization", "Jest"],
  "backend": ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "Microservices", "Docker", "Kubernetes", "AWS", "System Architecture"],
  "data": ["Python", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Machine Learning", "PyTorch", "Data Visualization", "Big Data", "Statistical Modeling"],
  "devops": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Ansible", "Monitoring", "Cloud Architecture", "Python"],
  "product": ["Product Strategy", "Agile / Scrum", "User Research", "Data Analytics", "Roadmap Execution", "A/B Testing", "GTM Strategy", "Stakeholder Management"]
};

export function ATSChecker() {
  const navigate = useNavigate();
  const { resumeData, setResumeData } = useResume();

  // Mode: 'current' (audit active draft) or 'upload' (upload file)
  const [sourceMode, setSourceMode] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedResumeData, setUploadedResumeData] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Target role & job description
  const [targetRole, setTargetRole] = useState(resumeData?.personalInfo?.professionalTitle || "Senior Full Stack Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);

  // Audit and AI suggestions states
  const [isLoading, setIsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [aiTailorData, setAiTailorData] = useState(null);
  const [activeTab, setActiveTab] = useState('ai_suggestions'); // 'ai_suggestions' | 'detailed_checks' | 'section_audit'
  const [checksFilter, setChecksFilter] = useState('all'); // 'all' | 'pass' | 'warning' | 'fail'
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [addedSkills, setAddedSkills] = useState(new Set());

  const fileInputRef = useRef(null);

  // Active data being audited
  const currentSubjectResume = sourceMode === 'upload' && uploadedResumeData ? uploadedResumeData : resumeData;

  // Handle file drop & selection
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file) => {
    setUploadedFile(file);
    setFileError(null);
    setIsParsingFile(true);

    try {
      const res = await resumeService.parseResumeFile(file);
      if (res.success && res.data?.resume_data) {
        setUploadedResumeData(res.data.resume_data);
        if (res.data.resume_data.personalInfo?.professionalTitle && !targetRole) {
          setTargetRole(res.data.resume_data.personalInfo.professionalTitle);
        }
      } else {
        setFileError(res.message || "Could not parse document. Please upload a standard PDF or DOCX file.");
      }
    } catch (err) {
      console.error("Resume file parse error:", err);
      setFileError(err.message || "Failed to process resume file. Please ensure it is a readable PDF or Word document.");
    } finally {
      setIsParsingFile(false);
    }
  };

  // Run comprehensive AI ATS Audit & Recommendations
  const runFullAudit = async (customResume = null) => {
    const resumeToAudit = customResume || currentSubjectResume;
    if (!resumeToAudit) return;

    setIsLoading(true);

    // Build role-calibrated job description prompt
    const effectiveRole = targetRole.trim() || resumeToAudit.personalInfo?.professionalTitle || "Software Engineer";
    const roleHints = Object.entries(ROLE_BENCHMARK_KEYWORDS).find(([k]) => effectiveRole.toLowerCase().includes(k))?.[1] || [];
    const effectiveJD = jobDescription.trim() || `Target Job Title: ${effectiveRole}. Required proficiencies: ${roleHints.join(", ")}. Strong track record of technical delivery, scalable architecture, and measurable project outcomes.`;

    try {
      // 1. Run 27-Point ATS Compatibility Analysis
      const atsRes = await resumeService.analyzeATS(resumeToAudit, effectiveJD);
      if (atsRes.success && atsRes.data) {
        setAtsResult(atsRes.data);
      }

      // 2. Run AI Role Optimization & Bullet Tailoring
      const tailorRes = await resumeService.tailorResume(resumeToAudit, effectiveJD, effectiveRole);
      if (tailorRes.success && tailorRes.data) {
        setAiTailorData(tailorRes.data);
      }
    } catch (e) {
      console.error('ATS AI Audit failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run when switching to current draft or when a file is parsed
  useEffect(() => {
    if (sourceMode === 'current' && resumeData) {
      runFullAudit(resumeData);
    } else if (sourceMode === 'upload' && uploadedResumeData) {
      runFullAudit(uploadedResumeData);
    }
  }, [sourceMode, uploadedResumeData]);

  // Apply analyzed resume to builder
  const handleApplyToBuilder = () => {
    const baseResume = currentSubjectResume ? { ...currentSubjectResume } : { ...resumeData };

    // Inject any added skills
    if (addedSkills.size > 0) {
      const skillsList = Array.isArray(baseResume.skills) ? [...baseResume.skills] : [];
      if (skillsList.length > 0) {
        const firstCat = { ...skillsList[0], items: Array.from(new Set([...skillsList[0].items, ...Array.from(addedSkills)])) };
        skillsList[0] = firstCat;
      } else {
        skillsList.push({ category: "Core Competencies", items: Array.from(addedSkills) });
      }
      baseResume.skills = skillsList;
    }

    // Set updated professional title
    if (targetRole && baseResume.personalInfo) {
      baseResume.personalInfo = {
        ...baseResume.personalInfo,
        professionalTitle: targetRole
      };
    }

    setResumeData(baseResume);
    navigate('/builder');
  };

  // Copy AI summary
  const handleCopySummary = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Toggle adding suggested skill
  const handleToggleAddSkill = (skill) => {
    setAddedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="eyebrow-tag justify-center">
            <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
            <span>AI ATS AUDITOR • 27-POINT SCAN & ROLE CALIBRATION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            ATS Score & Optimization.{' '}
            <span className="editorial-italic text-[1.12em]">Role-calibrated.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Upload your resume or audit your active draft. Our AI measures compatibility against enterprise parsers (Workday, Lever, Greenhouse) and generates tailored suggestions to reach a 95%+ ATS score.
          </p>
        </div>

        {/* Source & Configuration Card */}
        <div className="card-surface p-5 sm:p-7 space-y-6 bg-white">
          {/* Source Switcher: Upload File vs Current Draft */}
          <div className="flex items-center justify-between border-b border-ink/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-muted uppercase">Resume Source:</span>
              <div className="inline-flex rounded-full border border-ink bg-canvas p-1 shadow-brutal-sm text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                    sourceMode === 'upload'
                      ? 'bg-ink text-white'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Resume (PDF/DOCX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('current')}
                  className={`px-3 py-1 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                    sourceMode === 'current'
                      ? 'bg-ink text-white'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Current Editor Draft</span>
                </button>
              </div>
            </div>

            {atsResult && (
              <button
                onClick={() => runFullAudit()}
                disabled={isLoading}
                className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Re-Analyze</span>
              </button>
            )}
          </div>

          {/* Upload Area when SourceMode === 'upload' */}
          {sourceMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/rtf,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  uploadedFile
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-ink/20 hover:border-ink hover:bg-canvas/60'
                }`}
              >
                {isParsingFile ? (
                  <div className="space-y-3 py-2 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-editorial-violet animate-spin" />
                    <p className="text-xs font-bold text-ink">Extracting text & sections from document...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-600 text-emerald-700 flex items-center justify-center font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-extrabold text-ink">{uploadedFile.name}</p>
                      <p className="text-xs text-ink-muted font-mono">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • Ready for AI Audit
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-editorial-violet underline">
                      Click or drop another file to replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-volt/30 border border-ink flex items-center justify-center text-ink shadow-brutal-sm">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">
                        Drag and drop your resume file, or <span className="text-editorial-violet underline">Browse Files</span>
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Accepts PDF (.pdf) or Word (.docx) documents up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {/* Current Draft Indicator when SourceMode === 'current' */}
          {sourceMode === 'current' && (
            <div className="p-4 bg-canvas rounded-2xl border border-ink/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-volt border border-ink flex items-center justify-center font-bold text-ink">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-ink">
                    {resumeData?.personalInfo?.fullName || "Active Editor Draft"}
                  </p>
                  <p className="text-ink-muted">
                    {resumeData?.personalInfo?.professionalTitle || "Candidate Resume"} • {resumeData?.experience?.length || 0} Positions • {resumeData?.skills?.length || 0} Skill Categories
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-full border border-ink/20">
                Live Data
              </span>
            </div>
          )}

          {/* Target Job Role Calibration */}
          <div className="space-y-3 pt-2 border-t border-ink/10">
            <div className="flex items-center justify-between">
              <label className="label-base flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-editorial-violet" />
                <span>Target Job Role (For Role-Based ATS Calibration)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowJdInput(!showJdInput)}
                className="text-[11px] font-bold text-editorial-violet hover:underline flex items-center gap-1"
              >
                <span>{showJdInput ? "- Hide Job Description" : "+ Add Specific Job Description"}</span>
              </button>
            </div>

            <input
              type="text"
              placeholder="e.g. Senior Full Stack Engineer, Data Scientist, Product Manager..."
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input-base text-xs sm:text-sm font-semibold"
            />

            {/* Quick Role Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-mono text-ink-muted uppercase">Quick Select:</span>
              {POPULAR_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer font-medium ${
                    targetRole.toLowerCase() === role.toLowerCase()
                      ? 'bg-ink text-white border-ink shadow-2xs'
                      : 'bg-canvas text-ink hover:bg-canvas-dark border-ink/20'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Optional specific Job Description textarea */}
            {showJdInput && (
              <div className="pt-2 space-y-1.5">
                <label className="text-[11px] font-bold text-ink-muted">
                  Paste Job Description / Requirements (Optional for deeper keyword cross-matching):
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste responsibilities, preferred qualifications, and tech stack from job posting..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input-base text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => runFullAudit()}
              disabled={isLoading || isParsingFile}
              className="w-full btn-volt py-3 px-6 text-sm font-extrabold shadow-brutal flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ink" />
                  <span>Scanning Compatibility & Generating AI Suggestions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-ink" />
                  <span>Analyze ATS Score & Get Role Suggestions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && !atsResult && (
          <div className="card-surface py-16 text-center space-y-4 bg-white">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-ink/20 border-t-volt animate-spin flex items-center justify-center">
                <Search className="w-6 h-6 text-ink" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-ink">Running AI ATS Audit for {targetRole || "Target Role"}</p>
              <p className="text-xs text-ink-muted">
                Evaluating parsing compliance, ATS keyword coverage, and generating actionable suggestions...
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {atsResult && !isLoading && (
          <div className="space-y-6">
            {/* Main Score Hero Card */}
            <div className="card-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-ink ${
                    atsResult.compatibility_score >= 80
                      ? 'bg-volt text-ink shadow-brutal-sm'
                      : 'bg-[#ffd2c9] text-ink shadow-brutal-sm'
                  }`}>
                    {atsResult.compatibility_score >= 80 ? "ATS High Match" : "Optimization Required"}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-ink-muted uppercase bg-canvas px-2.5 py-1 rounded-full border border-ink/15">
                    Target: {targetRole || "Professional"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                  Compatibility Score: {atsResult.compatibility_score}%
                </h2>
                <p className="text-xs text-ink-secondary max-w-md leading-relaxed">
                  {atsResult.compatibility_score >= 85
                    ? "Your resume passes standard ATS parsing filters and aligns well with the structural benchmarks for this role."
                    : "Your resume has structural gaps or missing role-critical keywords that lower interview callback chances. Review the AI suggestions below."}
                </p>
              </div>

              {/* Neo-Brutalist Circular Gauge */}
              <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#EAE6DC"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke={atsResult.compatibility_score >= 80 ? "#CCFF00" : atsResult.compatibility_score >= 60 ? "#8B5CF6" : "#EF4444"}
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - atsResult.compatibility_score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-ink">
                    {atsResult.compatibility_score}%
                  </span>
                  <span className="text-[9px] font-mono text-ink-muted uppercase font-bold">ATS Score</span>
                </div>
              </div>
            </div>

            {/* 4 Metric Sub-cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">{atsResult.keyword_score || 85}%</div>
                <div className="text-[10px] font-bold text-ink-muted uppercase font-mono mt-0.5">Keywords & Tech</div>
              </div>
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">{atsResult.readability_score || 88}%</div>
                <div className="text-[10px] font-bold text-ink-muted uppercase font-mono mt-0.5">Readability</div>
              </div>
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">{atsResult.formatting_score || 92}%</div>
                <div className="text-[10px] font-bold text-ink-muted uppercase font-mono mt-0.5">Layout Structure</div>
              </div>
              <div className="card-surface p-4 bg-white">
                <div className="text-2xl font-black text-ink">
                  {atsResult.section_feedback?.experience?.score || 80}%
                </div>
                <div className="text-[10px] font-bold text-ink-muted uppercase font-mono mt-0.5">Impact Metrics</div>
              </div>
            </div>

            {/* Results Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-ink/15 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('ai_suggestions')}
                className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ai_suggestions'
                    ? 'bg-ink text-white shadow-brutal-sm'
                    : 'bg-white text-ink hover:bg-canvas'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Role Suggestions ({targetRole})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('detailed_checks')}
                className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'detailed_checks'
                    ? 'bg-ink text-white shadow-brutal-sm'
                    : 'bg-white text-ink hover:bg-canvas'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>27-Point Audit Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('section_audit')}
                className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'section_audit'
                    ? 'bg-ink text-white shadow-brutal-sm'
                    : 'bg-white text-ink hover:bg-canvas'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Section Breakdown</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: AI ROLE SUGGESTIONS & OPTIMIZATION ROADMAP        */}
            {/* ======================================================== */}
            {activeTab === 'ai_suggestions' && (
              <div className="space-y-6">
                {/* 1. Missing Critical Keywords for Target Role */}
                <div className="card-surface p-6 sm:p-7 space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-ink flex items-center gap-2">
                        <Zap className="w-4 h-4 text-editorial-violet" />
                        <span>High-Value Keywords for {targetRole}</span>
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        These industry keywords are heavily weighted by ATS parsers. Click to include them in your skills.
                      </p>
                    </div>
                    {addedSkills.size > 0 && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-volt text-ink">
                        {addedSkills.size} ready to add
                      </span>
                    )}
                  </div>

                  {/* Skills Grid */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(aiTailorData?.recommended_skills_to_add && aiTailorData.recommended_skills_to_add.length > 0
                      ? aiTailorData.recommended_skills_to_add
                      : ROLE_BENCHMARK_KEYWORDS[Object.keys(ROLE_BENCHMARK_KEYWORDS).find(k => targetRole.toLowerCase().includes(k)) || "full stack"] || []
                    ).map((skill, idx) => {
                      const isAdded = addedSkills.has(skill);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleAddSkill(skill)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1.5 font-bold ${
                            isAdded
                              ? 'bg-ink text-white border-ink shadow-brutal-xs'
                              : 'bg-canvas text-ink hover:bg-canvas-dark border-ink/20'
                          }`}
                        >
                          <span>{skill}</span>
                          {isAdded ? (
                            <Check className="w-3 h-3 text-volt" />
                          ) : (
                            <Plus className="w-3 h-3 text-ink-muted" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. AI Bullet Point Rewrites (Before vs. After) */}
                {aiTailorData?.suggestions && aiTailorData.suggestions.length > 0 && (
                  <div className="card-surface p-6 sm:p-7 space-y-4 bg-white">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-ink flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-editorial-violet" />
                        <span>Bullet Point Impact Enhancements</span>
                      </h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Transform weak or passive bullets into quantifiable, achievement-oriented STAR statements.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {aiTailorData.suggestions.map((sug, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-ink/20 bg-canvas space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-ink-muted uppercase">
                            <span>Section: {sug.section}</span>
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              +15% ATS Impact
                            </span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white border border-red-200/80 text-slate-700">
                              <span className="text-[10px] font-bold text-red-600 block uppercase mb-1">
                                Original Phrasing:
                              </span>
                              <p className="italic">{sug.original_text}</p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 shadow-2xs">
                              <span className="text-[10px] font-bold text-emerald-700 block uppercase mb-1">
                                Recommended AI Optimization:
                              </span>
                              <p className="font-medium text-emerald-950">{sug.tailored_text}</p>
                            </div>
                          </div>

                          <p className="text-[11px] text-ink-muted leading-relaxed">
                            <strong className="text-ink">Why this boosts score:</strong> {sug.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AI Tailored Summary */}
                {aiTailorData?.tailored_summary && (
                  <div className="card-surface p-6 sm:p-7 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm sm:text-base text-ink flex items-center gap-2">
                        <Award className="w-4 h-4 text-editorial-violet" />
                        <span>Role-Aligned Professional Summary</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopySummary(aiTailorData.tailored_summary)}
                        className="text-xs font-bold text-editorial-violet hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSummary ? "Copied!" : "Copy Summary"}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-canvas border border-ink/15 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
                      "{aiTailorData.tailored_summary}"
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      A concise 2-3 sentence executive summary frames your core value proposition within the critical 6-second recruiter glance.
                    </p>
                  </div>
                )}

                {/* 4. Actionable Steps to reach 95%+ */}
                <div className="bento-peach p-6 sm:p-7 space-y-3.5">
                  <h3 className="font-extrabold text-sm text-ink uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-ink" />
                    <span>Roadmap to 95%+ ATS Score</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-ink">
                    {atsResult.critical_issues && atsResult.critical_issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-bold text-red-900">{issue}</span>
                      </li>
                    ))}
                    {atsResult.recommendations && atsResult.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                        <span className="font-medium leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: 27-POINT AUDIT CHECKLIST                          */}
            {/* ======================================================== */}
            {activeTab === 'detailed_checks' && (
              <div className="card-surface p-6 sm:p-7 space-y-4 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/10 pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-ink">
                      27-Point Parsing & Structural Checklist
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Full breakdown of applicant tracking benchmarks tested against your resume.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {['all', 'pass', 'warning', 'fail'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setChecksFilter(f)}
                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] transition cursor-pointer ${
                          checksFilter === f
                            ? 'bg-ink text-white'
                            : 'bg-canvas text-ink hover:bg-canvas-dark border border-ink/10'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checks List */}
                <div className="space-y-2.5">
                  {atsResult.detailed_checks
                    ?.filter((chk) => checksFilter === 'all' || chk.status === checksFilter)
                    ?.map((chk) => (
                      <div
                        key={chk.id}
                        className="p-3.5 rounded-xl border border-ink/15 bg-canvas flex items-start gap-3 text-xs"
                      >
                        {chk.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : chk.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 space-y-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-extrabold text-ink">{chk.name}</span>
                            <span className="text-[10px] font-mono font-bold uppercase text-ink-muted">
                              {chk.category}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-snug">{chk.explanation}</p>
                          {chk.status !== 'pass' && chk.recommended_fix && (
                            <p className="text-[11px] font-medium text-editorial-violet pt-0.5">
                              <strong>Recommended Fix:</strong> {chk.recommended_fix}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: SECTION BREAKDOWN                                 */}
            {/* ======================================================== */}
            {activeTab === 'section_audit' && (
              <div className="card-surface p-6 sm:p-7 space-y-4 bg-white">
                <h3 className="font-extrabold text-sm sm:text-base text-ink">
                  Section Health & Score Weights
                </h3>
                <div className="space-y-3">
                  {Object.entries(atsResult.section_feedback || {}).map(([key, feedback]) => (
                    <div
                      key={key}
                      className="p-4 rounded-2xl border border-ink/20 bg-canvas flex items-start gap-3.5"
                    >
                      {feedback.status === "good" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : feedback.status === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1 text-xs flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold capitalize text-ink text-xs sm:text-sm">
                            {key} Section
                          </span>
                          <span className="font-mono text-[11px] font-bold text-ink-muted">
                            {feedback.score}/100
                          </span>
                        </div>
                        <p className="text-ink-secondary leading-relaxed">{feedback.message}</p>
                        {feedback.details && feedback.details.length > 0 && (
                          <ul className="text-[11px] text-ink-muted list-disc list-inside space-y-0.5 pt-1">
                            {feedback.details.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="card-surface p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-ink-muted text-center sm:text-left">
                {sourceMode === 'upload' ? (
                  <span>Ready to edit your parsed resume with role optimizations?</span>
                ) : (
                  <span>Ready to apply these improvements directly in the resume editor?</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyToBuilder}
                  className="btn-primary py-2.5 px-6 text-xs sm:text-sm shadow-brutal flex items-center gap-2 cursor-pointer"
                >
                  <span>Open in Resume Editor & Apply</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
