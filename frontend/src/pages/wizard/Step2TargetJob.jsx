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
  const [activeTab, setActiveTab] = useState(selectedJob?.description ? 'description' : 'roles');
  const [selectedRole, setSelectedRole] = useState(selectedJob?.role || '');
  const [customRole, setCustomRole] = useState('');
  const [companyName, setCompanyName] = useState(selectedJob?.company || '');
  const [jobLocation, setJobLocation] = useState(selectedJob?.location || '');
  const [jobUrl, setJobUrl] = useState(selectedJob?.url || '');
  const [jobDescription, setJobDescription] = useState(selectedJob?.description || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

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
          Step 2 of 7 • Target Role Calibration
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          What Job Are You Targeting?
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Tailoring your resume to a specific job dramatically increases recruiter response rates and ATS compliance.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-2xl inline-flex gap-1 text-xs font-semibold border border-slate-200">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'roles' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Option A: Select Target Job Role
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'description' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Option B: Paste Job Description
          </button>
        </div>
      </div>

      {/* OPTION A: CURATED ROLES */}
      {activeTab === 'roles' && (
        <div className="card-surface p-6 sm:p-7 space-y-5">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              Select Your Target Domain ({CURATED_ROLES.length} Curated Roles)
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
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                        : "bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-white hover:border-slate-300"
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
              <label className="label-base">Enter Custom Job Title</label>
              <input
                type="text"
                placeholder="e.g. Quantitative Risk Specialist"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="input-base"
              />
            </div>
          )}

          {/* Optional metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-slate-100">
            <div>
              <label className="label-base">Target Company (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Google, Stripe, McKinsey"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">Job Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Remote, San Francisco, London"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={onPrev}
              className="btn-secondary py-2 px-4 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipJobTargeting}
                className="btn-ghost py-2 px-3 text-xs"
              >
                <span>Skip targeting</span>
              </button>
              <button
                onClick={handleContinueWithRoleOnly}
                disabled={!selectedRole || (selectedRole === "Other" && !customRole.trim())}
                className="btn-primary py-2 px-5 text-xs shadow-sm"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPTION B: PASTE JOB DESCRIPTION */}
      {activeTab === 'description' && (
        <div className="card-surface p-6 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="label-base">Target Role Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Machine Learning Engineer"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">Company (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="label-base">
              Paste Full Job Posting Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              placeholder="Paste the full job duties, responsibilities, and required qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="input-base font-sans leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={onPrev}
              className="btn-secondary py-2 px-4 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={async () => {
                await handleAnalyzeJD();
                if (onNext) onNext();
              }}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="btn-primary py-2 px-5 text-xs shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Keywords...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Continue</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
