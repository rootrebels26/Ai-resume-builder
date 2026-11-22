import React, { useState } from 'react';
import { Briefcase, FileText, Search, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Loader2, SkipForward } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { resumeService } from '../../services/resumeService';

const CURATED_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Python Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Generative AI Engineer",
  "Business Analyst",
  "Cloud Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Other"
];

export function Step2TargetJob({ onNext, onPrev }) {
  const { selectedJob, setTargetJob, setJobAnalysis } = useResume();
  const [activeTab, setActiveTab] = useState(selectedJob?.description ? 'description' : 'roles'); // 'roles' | 'description'
  const [selectedRole, setSelectedRole] = useState(selectedJob?.role || '');
  const [customRole, setCustomRole] = useState('');
  const [companyName, setCompanyName] = useState(selectedJob?.company || '');
  const [jobLocation, setJobLocation] = useState(selectedJob?.location || '');
  const [jobUrl, setJobUrl] = useState(selectedJob?.url || '');
  const [jobDescription, setJobDescription] = useState(selectedJob?.description || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Handle Role selection
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (role !== "Other") {
      setTargetJob({
        role: role,
        company: companyName,
        location: jobLocation,
        url: jobUrl,
        isSkipped: false
      });
    }
  };

  // Submit and analyze job description
  const handleAnalyzeJD = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    try {
      const targetTitle = selectedRole === "Other" ? customRole : selectedRole || "Professional";
      const res = await resumeService.analyzeJobDescription({
        job_title: targetTitle,
        company: companyName,
        job_description: jobDescription
      });
      if (res.success && res.data) {
        setAnalysisResult(res.data);
        setJobAnalysis(res.data);
        setTargetJob({
          role: res.data.job_title || targetTitle,
          company: companyName,
          location: jobLocation,
          url: jobUrl,
          description: jobDescription,
          isSkipped: false
        });
      }
    } catch (e) {
      console.error('Job analysis error:', e);
      // Even if AI service fails, save target job and fallback
      setTargetJob({
        role: selectedRole === "Other" ? customRole : selectedRole || "Professional",
        company: companyName,
        location: jobLocation,
        url: jobUrl,
        description: jobDescription,
        isSkipped: false
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinueWithRoleOnly = () => {
    const finalRole = selectedRole === "Other" ? customRole : selectedRole;
    setTargetJob({
      role: finalRole || "Professional",
      company: companyName,
      location: jobLocation,
      url: jobUrl,
      description: "",
      isSkipped: false
    });
    if (onNext) onNext();
  };

  const handleSkipJobTargeting = () => {
    setTargetJob({
      role: "General Professional",
      company: "",
      location: "",
      url: "",
      description: "",
      isSkipped: true
    });
    if (onNext) onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 2 of 7 • Target Job Connection
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What Job Are You Targeting?
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Tailoring your resume to a specific job dramatically increases recruiter callbacks and ATS pass rates. Choose an option below.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'roles' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Option A: Select Target Job Role
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'description' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Option B: Paste Job Description (AI Analyzed)
          </button>
        </div>
      </div>

      {/* OPTION A: CURATED ROLES */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-3">
              Select Your Target Role ({CURATED_ROLES.length} Domains)
            </h3>
            <div className="flex flex-wrap gap-2">
              {CURATED_ROLES.map((role) => {
                const isSelected = selectedRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleSelectRole(role)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole === "Other" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Custom Job Title</label>
              <input
                type="text"
                placeholder="e.g. Quantitative Risk Specialist"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          )}

          {/* Optional metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Google, Stripe, McKinsey"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Remote, New York, London"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Template</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSkipJobTargeting}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Skip job targeting
              </button>
              <button
                onClick={handleContinueWithRoleOnly}
                disabled={!selectedRole || (selectedRole === "Other" && !customRole.trim())}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Creation Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTION B: PASTE JOB DESCRIPTION */}
      {activeTab === 'description' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Machine Learning Engineer"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Anthropic, OpenAI, Meta"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="Paste the full job posting requirements, responsibilities, and qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleAnalyzeJD}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow transition disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Requirements via AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Analyze Job Requirements</span>
                </>
              )}
            </button>
          </div>

          {/* Extracted Requirements View */}
          {analysisResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job Requirements Successfully Extracted</span>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Required Technical Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.technical_skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-mono text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {analysisResult.soft_skills?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Key Competencies & Soft Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.soft_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                if (onNext) onNext();
              }}
              disabled={!jobDescription.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>Continue to Creation Method</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
