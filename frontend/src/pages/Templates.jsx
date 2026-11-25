import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Filter, X, Sparkles, Layout, CheckCircle2, ArrowRight,
  Sliders, Star, Heart, Compass, ShieldCheck, ChevronRight, Columns,
  Layers, Check, HelpCircle, Briefcase, GraduationCap, Plus, Camera,
  FileText, Wand2, Info
} from 'lucide-react';
import {
  TEMPLATES, TEMPLATE_CATEGORIES, EXPERIENCE_LEVELS, INDUSTRIES, TOTAL_TEMPLATES_COUNT
} from '../constants/templateRegistry';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { TemplateDraftCard } from '../components/templates/TemplateDraftCard';
import { TemplateQuickPreviewModal } from '../components/templates/TemplateQuickPreviewModal';
import { PhotoUploadModal } from '../components/templates/PhotoUploadModal';
import { recommendTemplates } from '../utils/templateRecommender';

export function Templates() {
  const navigate = useNavigate();
  const { selectTemplate, selectedTemplateId, resumeData, updatePreferences, updatePersonalInfo, createNewResume } = useResume();
  const { requireAuth } = useAuth();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedPhotoPolicy, setSelectedPhotoPolicy] = useState("all"); // 'all' | 'no_photo' | 'required' | 'optional'
  const [onlyAtsFriendly, setOnlyAtsFriendly] = useState(false);
  const [sortBy, setSortBy] = useState("popular"); // 'popular' | 'ats' | 'name'
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('resume_favorite_templates') || '[]');
    } catch {
      return [];
    }
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Quick Preview State
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Photo Upload Modal State
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);

  // Role Recommender State
  const [showRecommender, setShowRecommender] = useState(false);
  const [recommenderRole, setRecommenderRole] = useState(
    resumeData?.personalInfo?.professionalTitle || ''
  );
  const [recommenderLevel, setRecommenderLevel] = useState('mid');
  const [recommenderPhotoPref, setRecommenderPhotoPref] = useState('any');
  const [recommendationResult, setRecommendationResult] = useState(null);

  // Toggle favorite
  const toggleFavorite = (tplId, e) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(tplId) ? prev.filter(id => id !== tplId) : [...prev, tplId];
      try {
        localStorage.setItem('resume_favorite_templates', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Run Recommendation Match
  const handleRunRecommendation = () => {
    if (!recommenderRole.trim()) return;
    const res = recommendTemplates({
      jobTitle: recommenderRole,
      careerLevel: recommenderLevel,
      limit: 6,
    });
    setRecommendationResult(res);
  };

  // Filtered & Sorted Templates
  const filteredTemplates = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const list = TEMPLATES.filter((tpl) => {
      // Favorites only
      if (onlyFavorites && !favorites.includes(tpl.id)) return false;

      // Category filter
      if (selectedCategory !== "all" && tpl.categoryId !== selectedCategory && tpl.category !== selectedCategory) {
        return false;
      }

      // Experience level filter
      if (selectedExperience !== "all" && tpl.experienceLevels && !tpl.experienceLevels.includes(selectedExperience)) {
        return false;
      }

      // Photo Policy filter
      if (selectedPhotoPolicy !== "all") {
        if (selectedPhotoPolicy === "required" && tpl.photoPolicy !== "required" && !tpl.photoRequired) return false;
        if (selectedPhotoPolicy === "no_photo" && tpl.photoPolicy !== "no_photo") return false;
        if (selectedPhotoPolicy === "optional" && tpl.photoPolicy !== "optional") return false;
      }

      // ATS filter
      if (onlyAtsFriendly && (!tpl.atsFriendly || (tpl.atsScore && tpl.atsScore < 98))) {
        return false;
      }

      // Search match
      if (query) {
        const matchName = tpl.name.toLowerCase().includes(query);
        const matchDesc = tpl.description?.toLowerCase().includes(query);
        const matchId = tpl.id.toLowerCase().includes(query);
        const matchRoles = tpl.roles && tpl.roles.some(r => r.toLowerCase().includes(query));
        const matchCat = (tpl.category || '').toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchId && !matchRoles && !matchCat) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'ats') {
      return [...list].sort((a, b) => (b.atsScore || 95) - (a.atsScore || 95));
    } else if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return list;
    }
  }, [selectedCategory, searchQuery, selectedExperience, selectedPhotoPolicy, onlyAtsFriendly, sortBy, favorites, onlyFavorites]);

  // Handle template selection with photo check
  const handleSelectTemplate = (template) => {
    const tplId = typeof template === 'string' ? template : template.id;
    const targetTpl = typeof template === 'object' ? template : TEMPLATES.find(t => t.id === tplId);

    // If template requires photo and user doesn't have one, show photo upload modal
    if (targetTpl && (targetTpl.photoPolicy === 'required' || targetTpl.photoRequired)) {
      if (!resumeData?.personalInfo?.photo) {
        setPendingTemplate(targetTpl);
        setPhotoModalOpen(true);
        return;
      }
    }

    applyTemplateAndNavigate(targetTpl || tplId);
  };

  const applyTemplateAndNavigate = (targetTpl) => {
    const tplId = typeof targetTpl === 'string' ? targetTpl : targetTpl.id;
    const tplObj = typeof targetTpl === 'object' ? targetTpl : TEMPLATES.find(t => t.id === tplId);

    selectTemplate(tplId);
    if (tplObj) {
      const pal = tplObj.palette || tplObj.colors || {};
      updatePreferences({
        layout: tplObj.layout || 'single-column',
        themeColor: pal.primary || '#0f172a',
        primaryColor: pal.primary || '#0f172a',
        accentColor: pal.accent || pal.secondary || '#3b82f6',
        dividerStyle: tplObj.dividerStyle || 'line',
        bulletStyle: tplObj.bulletStyle || 'disc',
      });
    }
    navigate('/builder');
  };

  // Photo modal confirmed
  const handlePhotoConfirmed = (photoDataUrl) => {
    updatePersonalInfo({ photo: photoDataUrl });
    if (pendingTemplate) {
      applyTemplateAndNavigate(pendingTemplate);
      setPendingTemplate(null);
    }
  };

  // Handle Create Blank Resume
  const handleCreateBlankResume = () => {
    createNewResume('Blank Resume');
    selectTemplate('ats-classic');
    updatePreferences({
      layout: 'single-column',
      themeColor: '#0f172a',
      primaryColor: '#0f172a',
      accentColor: '#3b82f6',
      dividerStyle: 'line',
      bulletStyle: 'disc',
    });
    navigate('/builder');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Gallery Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#cfff58] text-[#171713] border border-black shadow-[2px_2px_0_#171713] text-xs font-mono font-bold">
            <span className="size-2 rounded-full bg-green-600 animate-pulse" />
            <span>100 INDUSTRY-CERTIFIED ATS TEMPLATES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-ink tracking-tight font-display">
            Find Your Resume Template
          </h1>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-2xl mx-auto font-sans">
            Choose from 100 professionally designed, ATS-optimized resume templates. Tailored for software engineering, data science, leadership, finance, and creative fields.
          </p>

          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowRecommender(!showRecommender)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5e48d7] hover:bg-[#4d3ab8] text-white transition flex items-center gap-2 border border-black shadow-[2px_2px_0_#171713] cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{showRecommender ? 'Hide Role Matcher' : 'Find Best Template for My Role'}</span>
            </button>
            <Link
              to="/builder"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-black/5 text-ink transition flex items-center gap-1.5 border border-black shadow-[2px_2px_0_#171713]"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#5e48d7]" />
              <span>Open Builder</span>
            </Link>
          </div>
        </div>

        {/* Role-Wise Template Recommendation Engine Drawer */}
        {showRecommender && (
          <div className="p-6 bg-white border-[1.5px] border-ink rounded-3xl shadow-brutal-sm space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5e48d7]/10 border border-[#5e48d7]/30 flex items-center justify-center text-[#5e48d7]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink">Role-Wise Template Recommendation Engine</h3>
                  <p className="text-xs text-ink-muted">Answer 3 questions to get instant curated template recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecommender(false)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-black/5 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Target Job Role
                </label>
                <input
                  type="text"
                  value={recommenderRole}
                  onChange={(e) => setRecommenderRole(e.target.value)}
                  placeholder="e.g. Data Scientist, Azure Architect, Full Stack SWE..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-canvas-light border-[1.5px] border-ink text-ink placeholder-ink-muted/60 focus:outline-none focus:border-[#5e48d7] shadow-brutal-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Experience Level
                </label>
                <select
                  value={recommenderLevel}
                  onChange={(e) => setRecommenderLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-canvas-light border-[1.5px] border-ink text-ink focus:outline-none focus:border-[#5e48d7] shadow-brutal-xs font-medium"
                >
                  <option value="student">Student / Campus</option>
                  <option value="fresher">Fresher / Graduate</option>
                  <option value="mid">Mid-Level (3-6 yrs)</option>
                  <option value="senior">Senior Professional (6-10 yrs)</option>
                  <option value="lead">Staff / Tech Lead</option>
                  <option value="executive">Director / VP / Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Profile Photo Preference
                </label>
                <select
                  value={recommenderPhotoPref}
                  onChange={(e) => setRecommenderPhotoPref(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-canvas-light border-[1.5px] border-ink text-ink focus:outline-none focus:border-[#5e48d7] shadow-brutal-xs font-medium"
                >
                  <option value="any">Any Template Style</option>
                  <option value="no_photo">No Photo (100% Traditional ATS)</option>
                  <option value="required">Photo-Required (Executive & Media)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-ink-muted">
                Matches role titles against all 100 specialized template definitions
              </span>
              <button
                type="button"
                onClick={handleRunRecommendation}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#5e48d7] hover:bg-[#4d3ab8] text-white transition flex items-center gap-2 border border-black shadow-[2px_2px_0_#171713] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find Recommended Templates</span>
              </button>
            </div>

            {/* Recommendation Results */}
            {recommendationResult && (
              <div className="pt-4 border-t border-ink/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5e48d7] uppercase tracking-wider">
                    Top Recommended Matches for "{recommenderRole}":
                  </span>
                  <button
                    onClick={() => setRecommendationResult(null)}
                    className="text-xs text-ink-muted hover:text-ink underline cursor-pointer"
                  >
                    Clear Results
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {recommendationResult.recommendations.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className="p-3 bg-white rounded-xl border-[1.5px] border-ink hover:border-[#5e48d7] cursor-pointer transition text-left group shadow-brutal-xs hover:shadow-brutal hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-ink-muted mb-1">
                        <span className="truncate">{tpl.category}</span>
                        <span className="text-emerald-700 font-mono font-bold">ATS {tpl.atsScore || 98}%</span>
                      </div>
                      <h4 className="text-xs font-bold text-ink group-hover:text-[#5e48d7] truncate">
                        {tpl.name}
                      </h4>
                      <p className="text-[10px] text-ink-muted mt-1 truncate">
                        {tpl.layout}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search & Filter System */}
        <div className="space-y-4">
          {/* Main search and quick toggle controls */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 100 templates by title, role (e.g. Data Scientist, SWE, Director)..."
                className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-white border-[1.5px] border-ink text-ink placeholder-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-[#5e48d7]/20 shadow-brutal-xs transition font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Toggles */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Photo Filter */}
              <select
                value={selectedPhotoPolicy}
                onChange={(e) => setSelectedPhotoPolicy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border-[1.5px] border-ink text-ink focus:outline-none font-semibold shadow-brutal-xs"
              >
                <option value="all">All Photo Styles</option>
                <option value="no_photo">No Photo (ATS Safe)</option>
                <option value="required">Photo Required</option>
                <option value="optional">Optional Photo</option>
              </select>

              {/* Experience Filter */}
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border-[1.5px] border-ink text-ink focus:outline-none font-semibold shadow-brutal-xs"
              >
                <option value="all">All Experience Levels</option>
                <option value="student">Student / Campus</option>
                <option value="fresher">Fresher (0-1 yrs)</option>
                <option value="mid">Mid-Level (3-6 yrs)</option>
                <option value="senior">Senior (6-10 yrs)</option>
                <option value="lead">Lead / Staff</option>
                <option value="executive">Executive</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border-[1.5px] border-ink text-ink focus:outline-none font-semibold shadow-brutal-xs"
              >
                <option value="popular">Recommended</option>
                <option value="ats">Highest ATS Score</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>

              {/* ATS Toggle */}
              <button
                type="button"
                onClick={() => setOnlyAtsFriendly(!onlyAtsFriendly)}
                className={`px-3 py-2 rounded-xl border-[1.5px] transition flex items-center gap-1.5 font-bold cursor-pointer ${
                  onlyAtsFriendly
                    ? 'bg-[#cfff58] text-[#171713] border-black shadow-[2px_2px_0_#171713]'
                    : 'bg-white text-ink border-ink/40 hover:border-ink shadow-brutal-xs'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>ATS 98%+</span>
              </button>

              {/* Favorites Toggle */}
              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`px-3 py-2 rounded-xl border-[1.5px] transition flex items-center gap-1.5 font-bold cursor-pointer ${
                  onlyFavorites
                    ? 'bg-rose-100 text-rose-800 border-rose-500 shadow-brutal-xs'
                    : 'bg-white text-ink border-ink/40 hover:border-ink shadow-brutal-xs'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-ink-muted'}`} />
                <span>Favorites ({favorites.length})</span>
              </button>
            </div>
          </div>

          {/* 10 Category Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border-[1.5px] shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#171713] text-white border-black shadow-[2px_2px_0_rgba(0,0,0,0.25)]'
                      : 'bg-white text-ink border-ink/30 hover:border-ink hover:bg-canvas-light shadow-brutal-xs'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-[#5e48d7] text-white' : 'bg-black/5 text-ink-muted'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Results Count */}
        <div className="flex items-center justify-between text-xs text-ink-muted px-1">
          <span>
            Showing <strong className="text-ink font-bold">{filteredTemplates.length}</strong> of {TOTAL_TEMPLATES_COUNT} templates
          </span>
          {(selectedCategory !== 'all' || searchQuery || selectedPhotoPolicy !== 'all' || onlyAtsFriendly || onlyFavorites) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSelectedPhotoPolicy('all');
                setSelectedExperience('all');
                setOnlyAtsFriendly(false);
                setOnlyFavorites(false);
              }}
              className="text-[#5e48d7] font-semibold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* CARD 1: Create Blank Resume */}
          <div
            onClick={handleCreateBlankResume}
            className="group rounded-2xl border-2 border-dashed border-ink/30 hover:border-ink bg-white hover:bg-canvas-light/60 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[460px] shadow-brutal-xs hover:shadow-brutal hover:-translate-y-0.5"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#cfff58] border border-black flex items-center justify-center text-ink mb-4 shadow-[2px_2px_0_#171713] group-hover:scale-105 transition-all">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-base text-ink group-hover:text-[#5e48d7] transition">
              Create a Blank Resume
            </h3>
            <p className="text-xs text-ink-muted mt-2 max-w-[220px] leading-relaxed">
              Start with a clean slate instead of a predefined template and customize your own layout from scratch.
            </p>
            <div className="mt-6 px-4 py-2 rounded-xl text-xs font-bold bg-[#171713] text-white border border-black shadow-[2px_2px_0_rgba(0,0,0,0.2)] group-hover:bg-[#5e48d7] transition">
              Start Blank Resume
            </div>
          </div>

          {/* 100 Template Cards */}
          {filteredTemplates.map((template) => (
            <TemplateDraftCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={handleSelectTemplate}
              onOpenPreview={setPreviewTemplate}
              isFavorite={favorites.includes(template.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border-[1.5px] border-ink shadow-brutal-sm space-y-3">
            <Info className="w-8 h-8 text-ink-muted mx-auto" />
            <h3 className="font-bold text-base text-ink">No templates matched your filters</h3>
            <p className="text-xs text-ink-muted">
              Try adjusting your search query, photo style, or selected category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSelectedPhotoPolicy('all');
                setOnlyAtsFriendly(false);
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5e48d7] text-white hover:bg-[#4d3ab8] border border-black shadow-[2px_2px_0_#171713] transition cursor-pointer"
            >
              Show All 100 Templates
            </button>
          </div>
        )}
      </main>

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <TemplateQuickPreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(tpl) => {
            setPreviewTemplate(null);
            handleSelectTemplate(tpl);
          }}
        />
      )}

      {/* Profile Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => {
          setPhotoModalOpen(false);
          setPendingTemplate(null);
        }}
        onConfirm={handlePhotoConfirmed}
        currentPhoto={resumeData?.personalInfo?.photo}
        templateName={pendingTemplate?.name || 'Selected Template'}
      />
    </div>
  );
}
