import React from 'react';
import { Eye, Sparkles, Check, Star, Heart, Camera, ShieldCheck } from 'lucide-react';
import { TemplateDraftPaper } from './TemplateDraftPaper';

export function TemplateDraftCard({
  template,
  isSelected,
  onSelect,
  onOpenPreview,
  isFavorite = false,
  onToggleFavorite,
}) {
  const isPhotoRequired = template.photoPolicy === 'required' || template.photoRequired;
  const isPhotoOptional = template.photoPolicy === 'optional';

  return (
    <div
      className={`group bg-slate-900/90 hover:bg-slate-900 border rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
        isSelected
          ? 'border-violet-500 ring-2 ring-violet-500/50'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Metadata Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 truncate max-w-[150px]">
          {template.categoryName || template.category}
        </span>
        <div className="flex items-center gap-1.5">
          {template.atsFriendly && (
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
              title="ATS Certified Pass-Through"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{template.atsScore || 98}%</span>
            </span>
          )}

          {isPhotoRequired && (
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1"
              title="Requires professional profile photo"
            >
              <Camera className="w-3 h-3" />
              <span>Photo</span>
            </span>
          )}

          {isPhotoOptional && (
            <span
              className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1"
              title="Optional photo support"
            >
              <Camera className="w-2.5 h-2.5" />
            </span>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(template.id, e);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Realistic Resume Preview Canvas */}
      <div className="bg-slate-950/80 p-4 relative flex items-center justify-center overflow-hidden min-h-[270px] border-b border-slate-800/80">
        {/* A4 Paper Miniature */}
        <div className="w-full max-w-[200px] aspect-[210/297] rounded-md bg-white shadow-2xl border border-slate-200 overflow-hidden transform transition-transform duration-300 group-hover:scale-[1.03]">
          <TemplateDraftPaper template={template} />
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-4 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(template);
            }}
            className="w-full max-w-[150px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-violet-400" />
            <span>Quick Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(template)}
            className="w-full max-w-[150px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span>{isSelected ? "Current Template" : "Use Template"}</span>
          </button>
        </div>
      </div>

      {/* Card Info and Selection Footer */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-slate-900/90">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-white group-hover:text-violet-400 transition truncate">
              {template.name}
            </h3>
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-700 shadow-sm"
              style={{ backgroundColor: template.palette?.accent || template.palette?.primary || '#3b82f6' }}
              title="Template Accent"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
          {template.roles && template.roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.roles.slice(0, 3).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60"
                >
                  {r}
                </span>
              ))}
              {template.roles.length > 3 && (
                <span className="text-[10px] text-slate-500 font-mono">+{template.roles.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
            {template.layout}
          </span>

          <button
            type="button"
            onClick={() => onSelect(template)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
              isSelected
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                : "bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white border-slate-700 hover:border-violet-500"
            }`}
          >
            {isSelected ? (
              <span className="inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Active
              </span>
            ) : (
              "Use Template"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
