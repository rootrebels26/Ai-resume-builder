import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, Sparkles, Layout, CheckCircle2, ArrowRight } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, TOTAL_TEMPLATES_COUNT } from '../constants/templatesList';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { TemplateDraftCard } from '../components/templates/TemplateDraftCard';
import { TemplateQuickPreviewModal } from '../components/templates/TemplateQuickPreviewModal';

export function Templates() {
  const navigate = useNavigate();
  const { selectTemplate, selectedTemplateId } = useResume();
  const { requireAuth } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      const matchCat = selectedCategory === "all" || tpl.category === selectedCategory;
      const matchSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.layout && tpl.layout.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectTemplate = (id) => {
    requireAuth(() => {
      selectTemplate(id);
      navigate('/builder');
    }, 'Enter your unique company access code to edit and export this template.');
  };

  return (
    <div className="flex-1 bg-canvas min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Header Banner matching Figma */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="eyebrow-tag justify-center">
            <span className="w-2 h-2 rounded-full bg-volt border border-ink" />
            <span>RECRUITER-CALIBRATED • {TOTAL_TEMPLATES_COUNT} DESIGNS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight">
            Explore 50+ Templates.{' '}
            <span className="editorial-italic text-[1.12em]">Tested for ATS.</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            Crafted for recruiter scanning and modern ATS parsers. Every layout adapts seamlessly to your real qualifications with instant live editing.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="card-surface p-4 sm:p-5 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates by role (e.g., Data Scientist, Software Engineer, ATS, Executive)..."
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

            <div className="text-xs font-mono font-bold text-ink-muted whitespace-nowrap self-end sm:self-center">
              Showing <strong className="text-ink">{filteredTemplates.length}</strong> of {TOTAL_TEMPLATES_COUNT} designs
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full font-bold transition cursor-pointer text-xs border border-ink ${
                    active
                      ? "bg-ink text-white shadow-brutal-sm"
                      : "bg-canvas text-ink hover:bg-canvas-dark"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="card-surface border-dashed border-2 border-ink p-12 text-center space-y-3 bg-white">
            <Filter className="w-8 h-8 text-ink-muted mx-auto" />
            <h3 className="font-extrabold text-ink text-sm">No templates found</h3>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              Try resetting your search query or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateDraftCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onSelect={handleSelectTemplate}
                onOpenPreview={(tpl) => setPreviewTemplate(tpl)}
              />
            ))}
          </div>
        )}

        {/* High-Resolution Quick Preview Modal */}
        <TemplateQuickPreviewModal
          template={previewTemplate}
          isOpen={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(templateId) => {
            handleSelectTemplate(templateId);
            setPreviewTemplate(null);
          }}
        />
      </div>
    </div>
  );
}
