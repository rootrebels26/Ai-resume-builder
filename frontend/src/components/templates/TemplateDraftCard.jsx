import React from 'react';
import { Eye, Sparkles, Check, Heart, Camera, ShieldCheck } from 'lucide-react';
import { DynamicResumeCanvas } from './DynamicResumeCanvas';
import { INITIAL_RESUME_DATA } from '../../constants/initialResumeData';

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
      className={`group bg-white hover:bg-white border-[1.5px] rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-brutal-xs hover:shadow-brutal hover:-translate-y-0.5 ${
        isSelected
          ? 'border-ink ring-2 ring-[#cfff58]'
          : 'border-ink/20 hover:border-ink'
      }`}
    >
      {/* Top Metadata Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-ink/10 bg-canvas-light">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white text-ink border border-ink/20 truncate max-w-[150px]">
          {template.categoryName || template.category}
        </span>
        <div className="flex items-center gap-1.5">
          {template.atsFriendly && (
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1"
              title="ATS Certified Pass-Through"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{template.atsScore || 98}%</span>
            </span>
          )}

          {isPhotoRequired && (
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-300 flex items-center gap-1"
              title="Requires professional profile photo"
            >
              <Camera className="w-3 h-3 text-rose-600" />
              <span>Photo</span>
            </span>
          )}

          {isPhotoOptional && (
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1"
              title="Optional photo support"
            >
              <Camera className="w-2.5 h-2.5 text-indigo-600" />
            </span>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(template.id, e);
              }}
              className="p-1 rounded-md text-ink-muted hover:text-rose-500 hover:bg-black/5 transition cursor-pointer"
              title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-ink-muted'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Realistic Resume Preview Canvas (Exact 1:1 DynamicResumeCanvas miniature) */}
      <div className="bg-[#ede8df] p-4 relative flex items-center justify-center overflow-hidden min-h-[285px] border-b border-ink/10">
        {/* A4 Paper Miniature */}
        <div className="w-[200px] h-[283px] rounded-md bg-white shadow-md border border-black/10 overflow-hidden transform transition-transform duration-300 group-hover:scale-[1.03] relative">
          <div
            style={{
              width: '793.7px',
              minHeight: '1122.5px',
              padding: '12mm 14mm',
              boxSizing: 'border-box',
              transform: 'scale(0.252)',
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          >
            <DynamicResumeCanvas
              templateId={template.id}
              resumeData={{ ...INITIAL_RESUME_DATA, preferences: {} }}
              designOverrides={{
                layout: template.layout || 'single-column',
                primaryColor: template.palette?.primary || template.colors?.primary || template.accentColor || '#0f172a',
                accentColor: template.palette?.accent || template.palette?.secondary || template.colors?.accent || template.accentColor || '#3b82f6',
                backgroundColor: template.palette?.bg || template.palette?.background || '#ffffff',
                textColor: template.palette?.text || '#1e293b',
                fontFamily: template.typography?.bodyFont || template.fontFamily || 'Inter, sans-serif',
                headingFont: template.typography?.headingFont || template.fontFamily || 'Inter, sans-serif',
                dividerStyle: template.dividerStyle || 'line',
                bulletStyle: template.bulletStyle || 'disc',
              }}
            />
          </div>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-ink/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-4 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(template);
            }}
            className="w-full max-w-[150px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-canvas-light text-ink border border-ink shadow-brutal-xs transition active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#5e48d7]" />
            <span>Quick Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(template)}
            className="w-full max-w-[150px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#cfff58] hover:bg-[#bdf529] text-ink border border-black shadow-[2px_2px_0_#171713] transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>{isSelected ? "Current Template" : "Use Template"}</span>
          </button>
        </div>
      </div>

      {/* Card Info and Selection Footer */}
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-ink group-hover:text-[#5e48d7] transition truncate">
              {template.name}
            </h3>
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/30 shadow-2xs"
              style={{ backgroundColor: template.palette?.accent || template.palette?.primary || '#3b82f6' }}
              title="Template Accent"
            />
          </div>
          <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
          {template.roles && template.roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.roles.slice(0, 3).map((r, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-canvas-light text-ink-muted px-1.5 py-0.5 rounded border border-ink/10 font-medium"
                >
                  {r}
                </span>
              ))}
              {template.roles.length > 3 && (
                <span className="text-[10px] text-ink-muted font-mono">+{template.roles.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="pt-2.5 border-t border-ink/10 flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono font-medium text-ink-muted uppercase">
            {template.layout}
          </span>

          <button
            type="button"
            onClick={() => onSelect(template)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border ${
              isSelected
                ? "bg-[#cfff58] text-ink border-black shadow-[2px_2px_0_#171713]"
                : "bg-white hover:bg-[#5e48d7] text-ink hover:text-white border-[1.5px] border-ink shadow-brutal-xs"
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
