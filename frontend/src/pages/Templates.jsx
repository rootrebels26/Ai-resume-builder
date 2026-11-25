import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, X, Sparkles, Layout, CheckCircle2, ArrowRight,
  Sliders, Star, Heart, Compass, ShieldCheck, ChevronRight, Columns,
  Layers, Check, HelpCircle, Briefcase, GraduationCap
} from 'lucide-react';
import {
  TEMPLATES, TEMPLATE_CATEGORIES, EXPERIENCE_LEVELS, INDUSTRIES, TOTAL_TEMPLATES_COUNT
} from '../constants/templateRegistry';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { TemplateDraftCard } from '../components/templates/TemplateDraftCard';
import { TemplateQuickPreviewModal } from '../components/templates/TemplateQuickPreviewModal';
import { recommendTemplates, CAREER_LEVEL_CONFIGS } from '../utils/templateRecommender';

export function Templates() {
  const navigate = useNavigate();
  const { selectTemplate, selectedTemplateId, resumeData, updatePreferences } = useResume();
  const { requireAuth } = useAuth();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLayout, setSelectedLayout] = useState("all");
  const [sortBy, setSortBy] = useState("popular"); // 'popular' | 'ats' | 'name'
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('resume_favorite_templates') || '[]');
    } catch {
      return [];
    }
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Quick Preview & Compare State
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Role Recommender State
  const [showRecommender, setShowRecommender] = useState(false);
  const [recommenderRole, setRecommenderRole] = useState(
    resumeData?.personalInfo?.professionalTitle || ''
  );
  const [recommenderLevel, setRecommenderLevel] = useState('mid');
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
      if (selectedCategory !== "all" && tpl.category !== selectedCategory) return false;

      // Experience level filter
      if (selectedExperience !== "all" && tpl.experienceLevels && !tpl.experienceLevels.includes(selectedExperience)) {
        return false;
      }

      // Industry filter
      if (selectedIndustry !== "all" && tpl.industry.toLowerCase() !== selectedIndustry.toLowerCase()) {
        return false;
      }

      // Layout filter
      if (selectedLayout !== "all" && tpl.layout !== selectedLayout) {
        return false;
      }

      // Search match
      if (query) {
        const matchName = tpl.name.toLowerCase().includes(query);
        const matchDesc = tpl.description.toLowerCase().includes(query);
        const matchId = tpl.id.toLowerCase().includes(query);
        const matchRoles = tpl.roles && tpl.roles.some(r => r.toLowerCase().includes(query));
        const matchInd = tpl.industry.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchId && !matchRoles && !matchInd) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'ats') {
      return [...list].sort((a, b) => (b.atsScore || 95) - (a.atsScore || 95));
    } else if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Popular (downloads / rating)
      return [...list].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }
  }, [selectedCategory, searchQuery, selectedExperience, selectedIndustry, selectedLayout, sortBy, favorites, onlyFavorites]);

  const handleSelectTemplate = (id) => {
    requireAuth(() => {
      selectTemplate(id);
      // Automatically apply default palette and layout from template
      const chosenTpl = TEMPLATES.find(t => t.id === id);
      if (chosenTpl) {
        const pal = chosenTpl.palette || chosenTpl.defaultPalette || {};
        updatePreferences({
          layout: chosenTpl.layout || 'single-column',
          themeColor: pal.primary || '#0f172a',
          primaryColor: pal.primary || '#0f172a',
          accentColor: pal.accent || pal.secondary || '#3b82f6',
          dividerStyle: chosenTpl.dividerStyle || 'line',
          bulletStyle: chosenTpl.bulletStyle || 'disc',
        });
      }
      navigate('/builder');
    }, 'Enter your unique company access code to edit and export this template.');
  };

  const handleToggleCompare = (tplId) => {
    setCompareList(prev => {
      if (prev.includes(tplId)) return prev.filter(id => id !== tplId);
      if (prev.length >= 2) return [prev[1], tplId];
      return [...prev, tplId];
    });
  };

  return (
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="eyebrow-tag justify-center">
            <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
            <span>CANVA-INSPIRED DESIGN STUDIO • {TOTAL_TEMPLATES_COUNT} ZERO-PHOTO TEMPLATES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Role-Calibrated Templates.{' '}
            <span className="editorial-italic text-[1.12em]">100% ATS Safe.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            Every template is precision-engineered for recruiter readability and ATS compliance with pure typographic elegance — zero photo requirements, customizable fonts, and instant live canvas editing.
          </p>

          {/* Quick Smart Recommender Trigger */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowRecommender(!showRecommender)}
              className="btn-volt py-2 px-5 text-xs font-extrabold shadow-brutal-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showRecommender ? "Hide Role Recommendation Engine" : "Smart Role Recommendation Engine"}</span>
            </button>
          </div>
        </div>

        {/* Smart Role Recommendation Engine Drawer */}
        {showRecommender && (
          <div className="card-surface p-5 sm:p-6 bg-white border-[1.5px] border-ink shadow-brutal space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-editorial-violet" />
                <h3 className="font-extrabold text-sm sm:text-base text-ink">Intelligent Role & Career Matcher</h3>
              </div>
              <span className="text-[11px] font-mono text-ink-muted">AI-Calibrated ATS Logic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase mb-1">
                  Your Target Role / Title
                </label>
                <input
                  type="text"
                  value={recommenderRole}
                  onChange={(e) => setRecommenderRole(e.target.value)}
                  placeholder="e.g. Senior Data Engineer, Frontend Developer, Registered Nurse..."
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase mb-1">
                  Career Experience Level
                </label>
                <select
                  value={recommenderLevel}
                  onChange={(e) => setRecommenderLevel(e.target.value)}
                  className="input-base text-xs"
                >
                  <option value="student">Student / Intern</option>
                  <option value="fresher">Fresher / Graduate</option>
                  <option value="entry">Entry-Level (1-2 yrs)</option>
                  <option value="mid">Mid-Level (2-5 yrs)</option>
                  <option value="senior">Senior Professional (5-10 yrs)</option>
                  <option value="executive">Director / Executive (10+ yrs)</option>
                  <option value="academic">Academic Researcher / PhD</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRunRecommendation}
                  className="btn-volt w-full py-2.5 text-xs font-bold shadow-brutal-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Find Best Matched Templates</span>
                </button>
              </div>
            </div>

            {/* Recommendation Output */}
            {recommendationResult && (
              <div className="mt-4 pt-4 border-t border-ink/10 space-y-3 bg-canvas p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-ink">
                    🎯 Recommended for <span className="text-editorial-violet underline">{recommenderRole}</span> ({recommendationResult.matchedIndustry})
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Recommended Section Priority: <span className="font-mono font-bold text-ink">{recommendationResult.suggestedSectionOrder.slice(0, 4).join(' → ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {recommendationResult.recommendations.map(tpl => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className="p-2.5 rounded-lg border border-ink/20 hover:border-ink bg-white text-left transition shadow-xs hover:shadow-brutal-xs flex flex-col justify-between cursor-pointer"
                    >
                      <div className="font-extrabold text-xs text-ink truncate">{tpl.name}</div>
                      <div className="text-[10px] text-ink-muted capitalize">{tpl.categoryName || tpl.category}</div>
                      <div className="mt-1 text-[10px] font-mono font-bold text-emerald-700">ATS {tpl.atsScore}%</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Controls Bar: Search, Filters & Sorting */}
        <div className="card-surface p-4 sm:p-5 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search 100 templates by job title, skill, layout, e.g. Data Scientist, Cloud Architect, Executive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-9 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort & Quick Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-base text-xs py-2 w-full sm:w-auto font-semibold"
              >
                <option value="popular">Most Popular</option>
                <option value="ats">Highest ATS Score</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>

              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  onlyFavorites
                    ? 'bg-rose-50 border-rose-500 text-rose-700'
                    : 'border-ink/20 hover:border-ink bg-white text-ink-muted'
                }`}
                title="View favorite templates"
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="hidden sm:inline">Favorites</span>
                {favorites.length > 0 && <span className="font-mono">({favorites.length})</span>}
              </button>

              {compareList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  className="btn-volt py-2 px-3 text-xs font-bold shadow-brutal-sm flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compare ({compareList.length}/2)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink/10 text-xs">
            <span className="text-[11px] font-bold text-ink-muted uppercase mr-1">Layout:</span>
            {[
              { id: 'all', label: 'All Layouts' },
              { id: 'single-column', label: 'Single Column (Standard ATS)' },
              { id: 'two-column', label: 'Two Column' },
              { id: 'sidebar-left', label: 'Sidebar Left' },
              { id: 'header-card', label: 'Header Card' },
            ].map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedLayout(l.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                  selectedLayout === l.id
                    ? 'bg-ink text-white border-ink'
                    : 'bg-canvas text-ink border-ink/15 hover:border-ink'
                }`}
              >
                {l.label}
              </button>
            ))}

            <div className="ml-auto text-xs font-mono font-bold text-ink-muted">
              Showing <strong className="text-ink">{filteredTemplates.length}</strong> of {TOTAL_TEMPLATES_COUNT} templates
            </div>
          </div>
        </div>

        {/* Canva-Style Split Layout: Left Category Sidebar + Right Templates Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Category & Experience Sidebar */}
          <div className="w-full lg:w-64 shrink-0 bg-white border-[1.5px] border-ink rounded-2xl p-4 space-y-6 shadow-brutal-sm">
            {/* Categories */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-ink-muted uppercase tracking-wider">
                Professional Categories
              </label>
              <div className="space-y-1">
                {TEMPLATE_CATEGORIES.map(cat => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-ink text-white shadow-brutal-xs'
                          : 'text-ink-secondary hover:bg-canvas hover:text-ink'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-volt' : 'opacity-30'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="space-y-2 pt-4 border-t border-ink/10">
              <label className="block text-[11px] font-extrabold text-ink-muted uppercase tracking-wider">
                Experience Level
              </label>
              <div className="space-y-1">
                {EXPERIENCE_LEVELS.map(exp => {
                  const active = selectedExperience === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setSelectedExperience(exp.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                          : 'text-ink-muted hover:text-ink hover:bg-canvas'
                      }`}
                    >
                      {exp.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset All Filters Button */}
            {(selectedCategory !== 'all' || selectedExperience !== 'all' || selectedLayout !== 'all' || searchQuery || onlyFavorites) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedExperience('all');
                    setSelectedLayout('all');
                    setSearchQuery('');
                    setOnlyFavorites(false);
                  }}
                  className="w-full btn-secondary py-2 text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Right: Main Templates Grid */}
          <div className="flex-1 w-full min-w-0">
            {filteredTemplates.length === 0 ? (
              <div className="card-surface border-dashed border-2 border-ink p-12 text-center space-y-3 bg-white">
                <Filter className="w-8 h-8 text-ink-muted mx-auto" />
                <h3 className="font-extrabold text-ink text-sm">No templates matched your criteria</h3>
                <p className="text-xs text-ink-secondary max-w-sm mx-auto">
                  Try clearing some filters or searching for broader role keywords.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedExperience("all");
                    setSelectedLayout("all");
                    setOnlyFavorites(false);
                  }}
                  className="btn-secondary text-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                  const isFav = favorites.includes(template.id);
                  const isCompared = compareList.includes(template.id);

                  return (
                    <div key={template.id} className="relative group">
                      <TemplateDraftCard
                        template={template}
                        isSelected={selectedTemplateId === template.id}
                        onSelect={handleSelectTemplate}
                        onOpenPreview={(tpl) => setPreviewTemplate(tpl)}
                      />

                      {/* Favorite Button Badge */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(template.id, e)}
                        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full border border-ink/20 transition cursor-pointer shadow-xs ${
                          isFav ? 'bg-rose-50 text-rose-500 border-rose-300' : 'bg-white/80 text-ink-muted hover:text-ink hover:bg-white'
                        }`}
                        title={isFav ? "Remove from favorites" : "Save to favorites"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>

                      {/* Compare Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleCompare(template.id)}
                        className={`absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                          isCompared
                            ? 'bg-ink text-volt border-ink shadow-xs'
                            : 'bg-white/90 text-ink-muted border-ink/20 hover:border-ink hover:text-ink'
                        }`}
                      >
                        {isCompared ? "✓ Comparing" : "+ Compare"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Preview Modal */}
        <TemplateQuickPreviewModal
          template={previewTemplate}
          isOpen={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(templateId) => {
            handleSelectTemplate(templateId);
            setPreviewTemplate(null);
          }}
        />

        {/* Comparison Modal */}
        {showCompareModal && compareList.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border-[1.5px] border-ink rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-brutal-lg overflow-hidden text-ink">
              <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-canvas-light">
                <div className="flex items-center gap-2">
                  <Columns className="w-5 h-5 text-editorial-violet" />
                  <h3 className="font-extrabold text-base">Template Side-by-Side Comparison</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompareModal(false)}
                  className="p-1 rounded-full hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {compareList.map(tplId => {
                  const tpl = TEMPLATES.find(t => t.id === tplId);
                  if (!tpl) return null;

                  return (
                    <div key={tpl.id} className="border border-ink/20 rounded-2xl p-5 space-y-4 bg-canvas/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-base text-ink">{tpl.name}</h4>
                          <span className="text-xs text-ink-muted">{tpl.categoryName || tpl.category}</span>
                        </div>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          ATS {tpl.atsScore}%
                        </span>
                      </div>

                      <p className="text-xs text-ink-secondary">{tpl.description}</p>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-ink/10">
                          <span className="text-ink-muted">Layout:</span>
                          <span className="font-semibold capitalize">{tpl.layout}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-ink/10">
                          <span className="text-ink-muted">Typography:</span>
                          <span className="font-semibold capitalize">{tpl.fontFamily}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-ink/10">
                          <span className="text-ink-muted">Divider Style:</span>
                          <span className="font-semibold capitalize">{tpl.dividerStyle}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-ink/10">
                          <span className="text-ink-muted">Bullet Point:</span>
                          <span className="font-semibold capitalize">{tpl.bulletStyle}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-ink-muted">Suitable Roles:</span>
                          <span className="font-semibold text-right max-w-[200px] truncate">
                            {tpl.roles ? tpl.roles.slice(0, 3).join(', ') : 'All'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCompareModal(false);
                          handleSelectTemplate(tpl.id);
                        }}
                        className="btn-volt w-full py-2 text-xs font-bold shadow-brutal-sm cursor-pointer"
                      >
                        Use This Template
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
