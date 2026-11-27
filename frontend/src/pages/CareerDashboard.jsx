import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { RefreshCw, ShieldCheck, Trash2, Sparkles, Info } from 'lucide-react';
import { storageService } from '../services/storageService';
import { careerService } from '../services/careerService';
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

  const runAnalysis = useCallback(async (resData, prefs, forceRefresh = false) => {
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
  }, []);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      setLoading(true);
      const [drafts, wizardState, cachedCareer] = await Promise.all([
        storageService.getAllDrafts(),
        storageService.getWizardState(),
        storageService.getCareerState(),
      ]);

      if (!mounted) return;

      const activeDraft = drafts?.[0]?.data;
      const activeWizard = wizardState?.resumeData;
      const bestResume = hasMeaningfulResume(activeDraft)
        ? activeDraft
        : hasMeaningfulResume(activeWizard)
        ? activeWizard
        : null;

      setResumeData(bestResume);
      if (cachedCareer?.savedRoles) {
        setSavedRoles(cachedCareer.savedRoles);
      }
      if (cachedCareer?.preferences) {
        setPreferences(cachedCareer.preferences);
      }

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
        await runAnalysis(bestResume, prefs, false);
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

      {loading && <CareerLoadingState />}

      {!loading && error && (
        <CareerErrorState
          message={error}
          onRetry={resumeData ? () => runAnalysis(resumeData, preferences, true) : null}
        />
      )}

      {!loading && !error && !resumeData && <CareerEmptyState hasResume={false} />}

      {!loading && !error && resumeData && (
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
