import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  RefreshCw, Trash2, Sparkles, Info, UploadCloud, FileText,
  Loader2, Check, AlertTriangle, Target
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { careerService } from '../services/careerService';
import { resumeService } from '../services/resumeService';
import { useResume } from '../context/ResumeContext';
import { CareerSnapshot } from '../components/career/CareerSnapshot';
import { CareerFilters } from '../components/career/CareerFilters';
import { RecommendedRoleCard } from '../components/career/RecommendedRoleCard';
import { SkillsGapAnalysis } from '../components/career/SkillsGapAnalysis';
import { RoleDetailsModal } from '../components/career/RoleDetailsModal';
import { CareerLoadingState, CareerErrorState, CareerEmptyState } from '../components/career/CareerStates';

const DEFAULT_PREFERENCES = {
  location: '',
  locationType: 'none',
  workMode: 'any',
  jobType: 'any',
};

const DEFAULT_FILTERS = {
  category: 'all',
  experienceLevel: 'all',
  industry: 'all',
  skill: 'all',
  minMatch: 0,
  savedOnly: false,
};

function hasMeaningfulResume(data) {
  if (!data || typeof data !== 'object') return false;
  if (
    data.personalInfo?.fullName === 'Alex Rivera' &&
    data.personalInfo?.email === 'alex.rivera@example.com'
  ) {
    return false;
  }
  return Boolean(
    data.personalInfo?.professionalTitle ||
      data.professionalSummary?.trim() ||
      (data.experience && data.experience.length > 0) ||
      (data.internships && data.internships.length > 0) ||
      (data.education && data.education.length > 0) ||
      (data.projects && data.projects.length > 0) ||
      (data.skills && data.skills.length > 0)
  );
}

export function CareerDashboard() {
  const { resumeData: editorResumeData } = useResume();
  const fileInputRef = useRef(null);

  const [sourceMode, setSourceMode] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedResumeData, setUploadedResumeData] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileError, setFileError] = useState('');

  const [careerProfile, setCareerProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skillsGap, setSkillsGap] = useState(null);
  const [savedRoles, setSavedRoles] = useState([]);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState('');

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const activeSubjectResume =
    sourceMode === 'upload' ? uploadedResumeData : editorResumeData;

  const runAnalysis = useCallback(async (resData, prefs, forceRefresh = false, fileName = '') => {
    if (!hasMeaningfulResume(resData)) {
      setError('Please upload a resume file or open a completed draft in the Resume Builder first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await careerService.analyzeResume(resData, prefs, forceRefresh);
      const data = resp?.data || resp;
      if (!data || !data.career_profile) {
        throw new Error('Unexpected response from career analysis service.');
      }
      setCareerProfile(data.career_profile);
      setRecommendations(data.recommendations || []);
      setSkillsGap(data.skills_gap || null);
      setLastAnalyzedAt(data.generated_at || new Date().toISOString());

      await storageService.saveCareerState({
        uploadedResumeData: resData,
        uploadedFileName: fileName || uploadedFile?.name || '',
        careerProfile: data.career_profile,
        recommendations: data.recommendations || [],
        skillsGap: data.skills_gap || null,
        preferences: prefs,
        lastAnalyzedAt: data.generated_at || new Date().toISOString(),
        resumeFingerprint: data.resume_fingerprint || careerService.computeResumeFingerprint(resData, prefs),
      });
    } catch (err) {
      setError(err?.message || 'Failed to analyze resume for job recommendations.');
    } finally {
      setLoading(false);
    }
  }, [uploadedFile]);

  // Hydrate saved career results & uploaded resume from local IndexedDB
  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const cachedCareer = await storageService.getCareerState();
      if (!mounted || !cachedCareer) return;

      if (cachedCareer.savedRoles) setSavedRoles(cachedCareer.savedRoles);
      if (cachedCareer.preferences) setPreferences(cachedCareer.preferences);
      if (hasMeaningfulResume(cachedCareer.uploadedResumeData)) {
        setUploadedResumeData(cachedCareer.uploadedResumeData);
        if (cachedCareer.uploadedFileName) {
          setUploadedFile({ name: cachedCareer.uploadedFileName, size: 0 });
        }
      }
      if (cachedCareer.recommendations?.length > 0 && cachedCareer.careerProfile) {
        setCareerProfile(cachedCareer.careerProfile);
        setRecommendations(cachedCareer.recommendations);
        setSkillsGap(cachedCareer.skillsGap || null);
        setLastAnalyzedAt(cachedCareer.lastAnalyzedAt || cachedCareer.updatedAt || '');
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const processSelectedFile = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setFileError('');
    setIsParsingFile(true);
    setError('');
    try {
      const res = await resumeService.parseResumeFile(file);
      const parsed = res?.data?.resume_data || res?.resume_data || res?.data;
      if (!parsed || !hasMeaningfulResume(parsed)) {
        setFileError('Could not extract enough resume details. Please upload a readable PDF or DOCX file.');
        return;
      }
      setUploadedResumeData(parsed);
      await runAnalysis(parsed, preferences, true, file.name);
    } catch (err) {
      setFileError(err?.message || 'Failed to process resume file. Please ensure it is a readable PDF or Word document.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      processSelectedFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => {
      const next = { ...prev, [field]: value };
      storageService.saveCareerState({ preferences: next });
      return next;
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleSave = async (role) => {
    const updated = await storageService.toggleSavedRole(role);
    setSavedRoles(updated);
  };

  const handleClearCareerData = async () => {
    await storageService.clearCareerState();
    setUploadedFile(null);
    setUploadedResumeData(null);
    setCareerProfile(null);
    setRecommendations([]);
    setSkillsGap(null);
    setSavedRoles([]);
    setLastAnalyzedAt('');
    setError('');
    setFileError('');
  };

  const savedSet = useMemo(() => new Set(savedRoles.map((r) => r.title)), [savedRoles]);

  const categories = useMemo(
    () => Array.from(new Set(recommendations.map((r) => r.category).filter(Boolean))),
    [recommendations]
  );
  const industries = useMemo(
    () => Array.from(new Set(recommendations.map((r) => r.industry).filter(Boolean))),
    [recommendations]
  );
  const allSkills = useMemo(() => {
    const s = new Set();
    recommendations.forEach((r) => (r.matched_skills || []).forEach((sk) => s.add(sk)));
    return Array.from(s);
  }, [recommendations]);

  const filteredRoles = useMemo(() => {
    return recommendations.filter((r) => {
      if (filters.category !== 'all' && r.category !== filters.category) return false;
      if (filters.experienceLevel !== 'all' && r.experience_level !== filters.experienceLevel) return false;
      if (filters.industry !== 'all' && r.industry !== filters.industry) return false;
      if (filters.skill !== 'all' && !(r.matched_skills || []).includes(filters.skill)) return false;
      if (r.estimated_match_score < filters.minMatch) return false;
      if (filters.savedOnly && !savedSet.has(r.title)) return false;
      return true;
    });
  }, [recommendations, filters, savedSet]);

  return (
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Centered Header Banner (Matching ATSChecker) */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="eyebrow-tag justify-center">
            <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
            <span>AI CAREER MATCHER • RESUME-TO-ROLE INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            AI Job Recommendations.{' '}
            <span className="editorial-italic text-[1.12em]">Personalized.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Upload your resume or use your active draft. Our AI analyzes your skills, projects, and experience to recommend matching roles and direct job-search links.
          </p>
        </div>

        {/* Source & Configuration Card (Matching ATSChecker) */}
        <div className="card-surface p-5 sm:p-7 space-y-6 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
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

            {recommendations.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => runAnalysis(activeSubjectResume, preferences, true)}
                  disabled={loading || isParsingFile}
                  className="btn-secondary py-1 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Re-Analyze</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearCareerData}
                  className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 text-rose-700 cursor-pointer"
                  title="Clear saved recommendations"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* Upload Area when sourceMode === 'upload' */}
          {sourceMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg,.webp"
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
                    <p className="text-xs font-bold text-ink">Extracting text &amp; sections from document...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-600 text-emerald-700 flex items-center justify-center font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-extrabold text-ink">{uploadedFile.name}</p>
                      <p className="text-xs text-ink-muted font-mono">
                        {uploadedFile.size ? `${(uploadedFile.size / 1024).toFixed(1)} KB • ` : ''}Ready for Job Recommendations
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

          {/* Current Draft Indicator when sourceMode === 'current' */}
          {sourceMode === 'current' && (
            <div className="p-4 bg-canvas rounded-2xl border border-ink/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-volt border border-ink flex items-center justify-center font-bold text-ink">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-ink">
                    {editorResumeData?.personalInfo?.fullName || 'Active Editor Draft'}
                  </p>
                  <p className="text-ink-muted">
                    {editorResumeData?.personalInfo?.professionalTitle || 'Candidate Resume'} • {editorResumeData?.experience?.length || 0} Positions • {editorResumeData?.skills?.length || 0} Skill Categories
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-full border border-ink/20">
                Live Data
              </span>
            </div>
          )}

          {/* Quick Preferences Row */}
          <div className="space-y-3 pt-2 border-t border-ink/10">
            <label className="label-base flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-editorial-violet" />
              <span>Job Search Preferences (Optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <select
                value={preferences.jobType}
                onChange={(e) => handlePreferenceChange('jobType', e.target.value)}
                className="input-base w-full"
              >
                <option value="any">Any Job Type</option>
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>

              <select
                value={preferences.workMode}
                onChange={(e) => handlePreferenceChange('workMode', e.target.value)}
                className="input-base w-full"
              >
                <option value="any">Any Work Mode</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>

              <select
                value={preferences.locationType}
                onChange={(e) => handlePreferenceChange('locationType', e.target.value)}
                className="input-base w-full"
              >
                <option value="none">Any Location</option>
                <option value="india">India</option>
                <option value="remote">Remote</option>
                <option value="worldwide">Worldwide</option>
                <option value="city">Specific City</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || isParsingFile}
            onClick={() => runAnalysis(activeSubjectResume, preferences, true)}
            className="btn-volt w-full py-3.5 text-sm shadow-brutal flex items-center justify-center gap-2 font-extrabold cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Resume &amp; Matching Roles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find Matching Jobs &amp; Career Paths</span>
              </>
            )}
          </button>
        </div>

        {(loading || isParsingFile) && <CareerLoadingState />}

        {!loading && !isParsingFile && error && (
          <CareerErrorState
            message={error}
            onRetry={
              hasMeaningfulResume(activeSubjectResume)
                ? () => runAnalysis(activeSubjectResume, preferences, true)
                : null
            }
          />
        )}

        {!loading && !isParsingFile && !error && recommendations.length > 0 && (
          <>
            <div className="p-3.5 rounded-2xl bg-white border border-ink/15 flex items-start justify-between gap-3 text-xs text-ink-secondary">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                <p>
                  Recommendations and search links are personalized from your resume. Match scores are transparent estimates, not live vacancy guarantees.
                </p>
              </div>
              {lastAnalyzedAt && (
                <span className="text-[11px] font-mono text-ink-muted shrink-0">
                  Updated: {new Date(lastAnalyzedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            <CareerSnapshot careerProfile={careerProfile} resumeData={activeSubjectResume} />

            <CareerFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              preferences={preferences}
              onPreferenceChange={handlePreferenceChange}
              categories={categories}
              industries={industries}
              skills={allSkills}
              onReset={() => {
                setFilters(DEFAULT_FILTERS);
                setPreferences(DEFAULT_PREFERENCES);
              }}
            />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-ink">
                  Recommended Roles ({filteredRoles.length})
                </h2>
                <span className="text-xs font-mono text-ink-muted">
                  Sorted by Estimated Resume-to-Role Match
                </span>
              </div>

              {filteredRoles.length === 0 ? (
                <CareerEmptyState hasResume={true} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredRoles.map((role) => (
                    <RecommendedRoleCard
                      key={role.id || role.title}
                      role={role}
                      isSaved={savedSet.has(role.title)}
                      onToggleSave={handleToggleSave}
                      onViewDetails={setSelectedRole}
                      liveLinks={careerService.buildExternalSearchLinks(
                        role.title,
                        role.matched_skills,
                        preferences,
                        role.experience_level
                      )}
                    />
                  ))}
                </div>
              )}
            </section>

            <SkillsGapAnalysis skillsGap={skillsGap} />
          </>
        )}
      </div>

      <RoleDetailsModal
        isOpen={Boolean(selectedRole)}
        onClose={() => setSelectedRole(null)}
        role={selectedRole}
        resumeData={activeSubjectResume}
        preferences={preferences}
      />
    </div>
  );
}
