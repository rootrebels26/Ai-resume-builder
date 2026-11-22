import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Filter, ArrowRight, Check } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, TOTAL_TEMPLATES_COUNT } from '../constants/templatesList';
import { useResume } from '../context/ResumeContext';

export function Templates() {
  const navigate = useNavigate();
  const { setTemplateId, resumeData } = useResume();
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

  const handleSelectTemplate = (id) => {
    setTemplateId(id);
    navigate(`/builder?template=${id}`);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">
          Master Template Catalog ({TOTAL_TEMPLATES_COUNT} Designs)
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Resume Template
        </h1>
        <p className="text-slate-600 text-sm">
          Every template consumes your central resume data. Switch anytime without retyping or losing any information.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates by keyword, role, or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => {
          const isCurrent = resumeData.templateId === template.id;

          return (
            <div
              key={template.id}
              className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                isCurrent ? "border-brand-600 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Visual Card Preview */}
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

                {/* Mock wireframe of layout */}
                <div className="space-y-1.5 p-2 bg-white rounded border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: template.accentColor }} />
                    <div className="w-20 h-2 bg-slate-800 rounded" />
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded" />
                  <div className="w-4/5 h-1 bg-slate-200 rounded" />
                  <div className="w-2/3 h-1 bg-slate-200 rounded" />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                  <span>{template.id}</span>
                  <span className="capitalize">{template.category}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                      Active Template
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Ready to use</span>
                  )}

                  <button
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                      isCurrent
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white"
                    }`}
                  >
                    {isCurrent ? "Continue" : "Select Template"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
          <p className="text-slate-500 text-sm">No templates matched your search criteria.</p>
          <button
            onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
