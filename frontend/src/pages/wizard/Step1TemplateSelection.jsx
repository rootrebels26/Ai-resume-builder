import React, { useState, useMemo } from 'react';
import { Search, Star, Check, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, TOTAL_TEMPLATES_COUNT } from '../../constants/templatesList';
import { useResume } from '../../context/ResumeContext';

export function Step1TemplateSelection({ onNext }) {
  const { selectedTemplateId, selectTemplate } = useResume();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      const matchCat = selectedCategory === "all" || tpl.category === selectedCategory;
      const matchSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tpl.id.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600">
          Step 1 of 7 • Template First Selection
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Choose Your Resume Design
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm">
          Select from {TOTAL_TEMPLATES_COUNT} professional templates. You can switch templates anytime later without re-entering any data.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates by role (e.g., Data, Developer, ATS, Harvard)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <div
              key={template.id}
              className={`bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                isSelected
                  ? "border-brand-600 ring-2 ring-brand-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Miniature Layout Preview Card */}
              <div className="h-44 bg-slate-50 border-b border-slate-100 p-4 flex flex-col justify-between relative group">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {template.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {template.rating}
                  </span>
                </div>

                {/* Wireframe representation */}
                <div className="space-y-1.5 p-2.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: template.accentColor }} />
                    <div className="w-24 h-2 bg-slate-800 rounded" />
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded" />
                  <div className="w-5/6 h-1 bg-slate-200 rounded" />
                  <div className="w-3/4 h-1 bg-slate-200 rounded" />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                  <span>{template.id}</span>
                  <span className="capitalize">{template.layout}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                      Selected
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Ready</span>
                  )}

                  <button
                    onClick={() => handleSelect(template.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-brand-600 text-white hover:bg-brand-500"
                    }`}
                  >
                    {isSelected ? "Continue to Job" : "Select Template"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
