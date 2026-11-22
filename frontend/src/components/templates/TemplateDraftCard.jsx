import React from 'react';
import { Eye, Sparkles, Check, Star, ArrowRight } from 'lucide-react';
import { TemplateDraftPaper } from './TemplateDraftPaper';

export function TemplateDraftCard({
  template,
  isSelected,
  onSelect,
  onOpenPreview
}) {
  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isSelected
          ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Top Card Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {template.badge || template.category}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{template.rating}</span>
        </div>
      </div>

      {/* Realistic Resume Draft Preview Container */}
      <div className="bg-slate-100/75 p-3.5 sm:p-4 relative flex items-center justify-center overflow-hidden min-h-[260px]">
        {/* A4 Paper Miniature */}
        <div className="w-full max-w-[210px] aspect-[210/297] rounded-sm bg-white shadow-md border border-slate-200/90 overflow-hidden transform transition-transform duration-300 group-hover:scale-[1.03]">
          <TemplateDraftPaper template={template} />
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(template);
            }}
            className="w-full max-w-[170px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-brand-600" />
            <span>Preview Draft</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(template.id)}
            className="w-full max-w-[170px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-lg hover:bg-brand-500 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSelected ? "Current Template" : "Use Template"}</span>
          </button>
        </div>
      </div>

      {/* Card Info and Direct Selection Footer */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition truncate">
              {template.name}
            </h3>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
              style={{ backgroundColor: template.accentColor }}
              title={`Accent: ${template.accentColor}`}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-400 capitalize truncate max-w-[120px]">
            {template.layout}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreview(template);
              }}
              title="View full-size resume draft"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onSelect(template.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {isSelected ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selected
                </span>
              ) : (
                "Select"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
