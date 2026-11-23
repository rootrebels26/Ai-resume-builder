import React from 'react';
import { Eye, Sparkles, Check, Star } from 'lucide-react';
import { TemplateDraftPaper } from './TemplateDraftPaper';

export function TemplateDraftCard({
  template,
  isSelected,
  onSelect,
  onOpenPreview
}) {
  return (
    <div
      className={`group bg-white rounded-3xl border-[1.5px] border-ink transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 ${
        isSelected ? 'ring-2 ring-volt' : ''
      }`}
    >
      {/* Top Card Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-ink/10 bg-canvas-light">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-volt text-ink border border-ink">
          {template.badge || template.category}
        </span>
        <div className="flex items-center gap-1 text-xs font-bold text-ink">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>{template.rating}</span>
        </div>
      </div>

      {/* Realistic Resume Draft Preview Container */}
      <div className="bg-canvas p-4 relative flex items-center justify-center overflow-hidden min-h-[260px] border-b border-ink/10">
        {/* A4 Paper Miniature */}
        <div className="w-full max-w-[200px] aspect-[210/297] rounded-lg bg-white shadow-paper border border-ink overflow-hidden transform transition-transform duration-200 group-hover:scale-[1.02]">
          <TemplateDraftPaper template={template} />
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(template);
            }}
            className="w-full max-w-[160px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-white text-ink border border-ink shadow-brutal-sm hover:bg-canvas transition active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-editorial-violet" />
            <span>Preview Draft</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(template.id)}
            className="w-full max-w-[160px] inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-volt text-ink border border-ink shadow-brutal-sm hover:bg-volt-hover transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>{isSelected ? "Current Template" : "Use Template"}</span>
          </button>
        </div>
      </div>

      {/* Card Info and Selection Footer */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm text-ink group-hover:text-editorial-violet transition truncate">
              {template.name}
            </h3>
            <span
              className="w-3 h-3 rounded-full shrink-0 border border-ink shadow-2xs"
              style={{ backgroundColor: template.accentColor }}
              title={`Accent: ${template.accentColor}`}
            />
          </div>
          <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>

        <div className="pt-2.5 border-t border-ink/10 flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono font-bold text-ink-muted uppercase">
            {template.layout}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelect(template.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer border border-ink ${
                isSelected
                  ? "bg-volt text-ink shadow-brutal-sm"
                  : "bg-ink text-white hover:bg-ink-secondary shadow-brutal-sm"
              }`}
            >
              {isSelected ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Selected
                </span>
              ) : (
                "Use"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
