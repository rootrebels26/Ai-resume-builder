import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter, X, ArrowRight } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, TOTAL_TEMPLATES_COUNT } from '../../constants/templatesList';
import { useResume } from '../../context/ResumeContext';
import { TemplateDraftCard } from '../../components/templates/TemplateDraftCard';
import { TemplateQuickPreviewModal } from '../../components/templates/TemplateQuickPreviewModal';

export function Step1TemplateSelection({ onNext }) {
  const { selectedTemplateId, selectTemplate } = useResume();
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

  const handleSelect = (templateId) => {
    selectTemplate(templateId);
    if (onNext) onNext();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 7 • Template-First Foundation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Choose Your Professional Resume Design
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Select from {TOTAL_TEMPLATES_COUNT} purpose-built designs. Every template features real A4 typography and instant ATS parsing. You can freely switch templates at any time without losing any data.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role (e.g. Data Scientist, Developer, ATS, Harvard, Minimalist)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap self-end sm:self-center">
            Showing <strong className="text-slate-900">{filteredTemplates.length}</strong> of {TOTAL_TEMPLATES_COUNT} designs
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid with Authentic Resume Drafts */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Filter className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No templates match your search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for terms like "Developer", "ATS", "Executive", or "Data Analyst".
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
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
              onSelect={handleSelect}
              onOpenPreview={(tpl) => setPreviewTemplate(tpl)}
            />
          ))}
        </div>
      )}

      {/* High-Resolution Full A4 Quick Preview Modal */}
      <TemplateQuickPreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelect={(templateId) => {
          handleSelect(templateId);
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
}
