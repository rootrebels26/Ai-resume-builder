import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Trash2, Sparkles, Info, FileUp, FileText, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { careerService } from '../services/careerService';
import { resumeService } from '../services/resumeService';
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
  // Never auto-analyze the sample starter template ("Alex Rivera") as a user's real resume
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
  const [resumeData, setResumeData] = useState(null);
  const [resumeSourceLabel, setResumeSourceLabel] = useState('');
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [careerProfile, setCareerProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [skillsGap, setSkillsGap] = useState(null);
  const [savedRoles, setSavedRoles] = useState([]);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState('');
  const [providerUsed, setProviderUsed] = useState('');
  const [disclaimer, setDisclaimer] = useState('');

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const runAnalysis = useCallback(async (resData, prefs, forceRefresh = false, sourceLabel = '') => {
    if (!hasMeaningfulResume(resData)) {
      setLoading(false);
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
      setProviderUsed(data.provider_used || 'gemini');
      setDisclaimer(data.disclaimer || '');

      await storageService.saveCareerState({
        uploadedResumeData: resData,
        uploadedSourceLabel: sourceLabel || resumeSourceLabel,
        careerProfile: data.career_profile,
        recommendations: data.recommendations || [],
        skillsGap: data.skills_gap || null,
        preferences: prefs,
        lastAnalyzedAt: data.generated_at || new Date().toISOString(),
        resumeFingerprint: data.resume_fingerprint || careerService.computeResumeFingerprint(resData, prefs),
        providerUsed: data.provider_used || 'gemini',
        disclaimer: data.disclaimer || '',
      });
    } catch (err) {
      setError(err?.message || 'Failed to analyze resume for job recommendations.');
    } finally {
      setLoading(false);
    }
  }, [resumeSourceLabel]);

  const handleResumeFileUpload = async (file) => {
    if (!file) return;
    setUploadingResume(true);
    setError('');
    try {
      const parsedResp = await resumeService.parseResumeFile(file);
      const parsedData = parsedResp?.data?.resume_data || parsedResp?.resume_data || parsedResp?.data;
      if (!parsedData || !hasMeaningfulResume(parsedData)) {
        throw new Error('Could not extract enough resume details from this file. Please try another PDF, DOCX, or TXT resume.');
      }
      const label = `Uploaded: ${file.name}`;
      setResumeData(parsedData);
      setResumeSourceLabel(label);
      await runAnalysis(parsedData, preferences, true, label);
    } catch (err) {
      setError(err?.message || 'Failed to parse uploaded resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSelectDraft = async (draftId) => {
    const draft = savedDrafts.find((d) => d.id === draftId);
    if (!draft?.data || !hasMeaningfulResume(draft.data)) return;
    const label = `Saved Draft: ${draft.title || draft.data?.personalInfo?.fullName || 'Resume'}`;
    setResumeData(draft.data);
    setResumeSourceLabel(label);
    await runAnalysis(draft.data, preferences, true, label);
  };

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      setLoading(true);
      const [drafts, cachedCareer] = await Promise.all([
        storageService.getAllDrafts(),
        storageService.getCareerState(),
      ]);

      if (!mounted) return;

      const validDrafts = (drafts || []).filter((d) => hasMeaningfulResume(d?.data));
      setSavedDrafts(validDrafts);

      if (cachedCareer?.savedRoles) {
        setSavedRoles(cachedCareer.savedRoles);
      }
      if (cachedCareer?.preferences) {
        setPreferences(cachedCareer.preferences);
      }

      const cachedUploaded = cachedCareer?.uploadedResumeData;
      const bestResume = hasMeaningfulResume(cachedUploaded)
        ? cachedUploaded
        : validDrafts[0]?.data || null;

      const initialLabel = hasMeaningfulResume(cachedUploaded)
        ? cachedCareer?.uploadedSourceLabel || 'Uploaded Resume'
        : validDrafts[0]
        ? `Saved Draft: ${validDrafts[0].title || 'Resume'}`
        : '';

      setResumeData(bestResume);
      setResumeSourceLabel(initialLabel);

      if (!bestResume) {
        setLoading(false);
        return;
      }

      const prefs = cachedCareer?.preferences || DEFAULT_PREFERENCES;
      const currentFp = careerService.computeResumeFingerprint(bestResume, prefs);

      if (
        cachedCareer?.recommendations?.length > 0 &&
        cachedCareer?.resumeFingerprint === currentFp
      ) {
        setCareerProfile(cachedCareer.careerProfile);
        setRecommendations(cachedCareer.recommendations);
        setSkillsGap(cachedCareer.skillsGap || null);
        setLastAnalyzedAt(cachedCareer.lastAnalyzedAt || cachedCareer.updatedAt || '');
        setProviderUsed(cachedCareer.providerUsed || 'cached');
        setDisclaimer(cachedCareer.disclaimer || '');
        setLoading(false);
      } else {
        await runAnalysis(bestResume, prefs, false, initialLabel);
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, [runAnalysis]);

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
    setResumeData(null);
    setResumeSourceLabel('');
    setCareerProfile(null);
    setRecommendations([]);
    setSkillsGap(null);
    setSavedRoles([]);
    setLastAnalyzedAt('');
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
    <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:px-14 space-y-6">
      {/* A. Header */}
      <header className="rounded-3xl border-2 border-ink bg-white p-6 shadow-brutal flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-volt border border-ink text-[11px] font-mono font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-API-Key External Search + Gemini Career Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            AI Job Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl">
            Personalized career paths, estimated resume-to-role matches, and targeted external search links generated directly from your local resume.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-ink-muted">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {resumeData ? 'Resume Loaded Locally' : 'No Resume Loaded'}
            </span>
            {lastAnalyzedAt && (
              <span>Last analyzed: {new Date(lastAnalyzedAt).toLocaleString()}</span>
            )}
            {providerUsed && <span>Engine: {providerUsed}</span>}
            <span>Saved roles: {savedRoles.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resumeData && (
            <button
              type="button"
              disabled={loading}
              onClick={() => runAnalysis(resumeData, preferences, true)}
              className="btn-volt py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Recommendations</span>
            </button>
          )}
          {(recommendations.length > 0 || savedRoles.length > 0) && (
            <button
              type="button"
              onClick={handleClearCareerData}
              className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-rose-700"
              title="Delete locally stored career profile, recommendations, and saved roles"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Data</span>
            </button>
          )}
        </div>
      </header>

      {/* Transparency Banner */}
      <div className="p-3.5 rounded-2xl bg-canvas border border-ink/15 flex items-start gap-2.5 text-xs text-ink-secondary">
        <Info className="w-4 h-4 text-ink shrink-0 mt-0.5" />
        <p>
          {disclaimer ||
            'AI-generated career recommendations and external job-search links based on your resume. Match scores are transparent estimates and do not represent verified live vacancies or selection probability.'}
        </p>
      </div>

      {/* Direct Resume Upload & Source Selector */}
      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer?.files?.[0];
          if (file) handleResumeFileUpload(file);
        }}
        className={`rounded-3xl border-2 p-5 transition-colors flex flex-wrap items-center justify-between gap-4 ${
          dragActive
            ? 'border-brand-600 bg-volt/25'
            : 'border-dashed border-ink/35 bg-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-volt border border-ink flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-ink" />
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-extrabold text-ink">
              {resumeSourceLabel ? `Active Resume: ${resumeSourceLabel}` : 'Upload Your Resume (PDF, DOCX, TXT, RTF)'}
            </div>
            <p className="text-xs text-ink-muted">
              Upload any resume file or drop it here — recommendations are generated directly from your uploaded resume without storing it on any server.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="btn-volt py-2 px-4 text-xs font-bold inline-flex items-center gap-2 cursor-pointer">
            {uploadingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
            <span>{uploadingResume ? 'Extracting Resume...' : resumeData ? 'Upload Another Resume' : 'Upload Resume'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.rtf,.png,.jpg,.jpeg"
              className="hidden"
              disabled={uploadingResume}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleResumeFileUpload(file);
                e.target.value = '';
              }}
            />
          </label>

          {savedDrafts.length > 0 && (
            <select
              aria-label="Choose saved resume draft"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleSelectDraft(e.target.value);
              }}
              className="input-base text-xs py-2"
            >
              <option value="" disabled>
                Or use saved draft...
              </option>
              {savedDrafts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title || d.data?.personalInfo?.fullName || 'Saved Resume'}
                </option>
              ))}
            </select>
          )}
        </div>
      </section>

      {(loading || uploadingResume) && <CareerLoadingState />}

      {!loading && !uploadingResume && error && (
        <CareerErrorState
          message={error}
          onRetry={resumeData ? () => runAnalysis(resumeData, preferences, true) : null}
        />
      )}

      {!loading && !uploadingResume && !error && !resumeData && (
        <CareerEmptyState
          hasResume={false}
          onFileUpload={handleResumeFileUpload}
          uploading={uploadingResume}
        />
      )}

      {!loading && !uploadingResume && !error && resumeData && (
        <>
          {/* B. Career Snapshot */}
          <CareerSnapshot careerProfile={careerProfile} resumeData={resumeData} />

          {/* Advanced Filters */}
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

          {/* C & D. Recommended Roles Grid */}
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

          {/* E & F. Skills Gap & Development */}
          <SkillsGapAnalysis skillsGap={skillsGap} />
        </>
      )}

      <RoleDetailsModal
        isOpen={Boolean(selectedRole)}
        onClose={() => setSelectedRole(null)}
        role={selectedRole}
        resumeData={resumeData}
        preferences={preferences}
      />
    </div>
  );
}
