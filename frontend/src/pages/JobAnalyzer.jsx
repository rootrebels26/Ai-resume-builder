import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Loader2, Target, Briefcase } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import { useResume } from '../context/ResumeContext';

export function JobAnalyzer() {
  const navigate = useNavigate();
  const { resumeData, setResumeData } = useResume();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      // 1. Analyze Job Requirements
      const jobRes = await resumeService.analyzeJobDescription({
        job_title: jobTitle,
        company: company,
        job_description: jobDescription
      });

      // 2. Match with current resume
      const matchRes = await resumeService.matchResumeWithJob(
        resumeData,
        jobDescription,
        jobTitle
      );

      if (jobRes.success) setAnalysisResult(jobRes.data);
      if (matchRes.success) setMatchResult(matchRes.data);
    } catch (err) {
      console.error('Job analysis error:', err);
      setError(err.message || 'Failed to analyze job description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailorAndApply = async () => {
    if (!jobDescription.trim()) return;

    setIsTailoring(true);
    try {
      const tailorRes = await resumeService.tailorResume(resumeData, jobDescription, jobTitle);
      if (tailorRes.success && tailorRes.data) {
        // Update resume professionalSummary
        setResumeData(prev => ({
          ...prev,
          professionalSummary: tailorRes.data.tailored_summary || prev.professionalSummary
        }));
        navigate('/builder');
      }
    } catch (err) {
      console.error('Tailor error:', err);
      setError('Failed to tailor resume.');
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Requirement Intelligence</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Description & Gap Analyzer</h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Paste any job description to extract core competencies, calculate keyword alignment with your active resume, and generate tailor-fit improvements.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Stripe, Google, Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Job Description Text <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={7}
            placeholder="Paste the full job posting, duties, and requirements here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white leading-relaxed font-mono"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleAnalyzeJob}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Requirements...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Analyze Job & Compare</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Match Score Banner */}
          {matchResult && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-400">Match Compatibility</div>
                <div className="text-2xl font-black">
                  {matchResult.match_percentage}% Match with Your Resume
                </div>
                <p className="text-xs text-slate-300 max-w-lg">
                  {matchResult.strengths[0] || 'Matches primary domain keywords for this position.'}
                </p>
              </div>

              <button
                onClick={handleTailorAndApply}
                disabled={isTailoring}
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition"
              >
                {isTailoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Apply Tailored Summary & Bullets</span>
              </button>
            </div>
          )}

          {/* Detailed Skill Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills Extracted */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-brand-600" />
                <span>Required Technical Skills ({analysisResult.technical_skills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.technical_skills.map((skill, idx) => {
                  const isMatched = matchResult?.matched_skills.includes(skill);
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                        isMatched
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Skills Gap (Recommended to Add)</span>
              </h3>
              {matchResult?.missing_critical_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missing_critical_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Your resume covers all detected primary technical skills!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
