import React, { useState, useEffect } from 'react';
import {
  X, ZoomIn, ZoomOut, RotateCcw, Check, Sparkles, Star,
  Maximize2, Eye, ShieldCheck, ArrowRight, Minimize2
} from 'lucide-react';
import { ResumeTemplate } from './ResumeTemplate';
import { INITIAL_RESUME_DATA } from '../../constants/initialResumeData';
import { isFullBleedTemplate } from '../../constants/templatesList';
import { getPreviewAvatarForTemplate } from '../../utils/previewAvatar';

export function TemplateQuickPreviewModal({ template, isOpen, onClose, onSelect }) {
  // Default to 0.65 so the full A4 page fits into view on initial open
  const [zoomLevel, setZoomLevel] = useState(0.65);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))));
  const handleFitPage = () => setZoomLevel(0.60);
  const handleActualSize = () => setZoomLevel(1.0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-[1.5px] border-ink rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-brutal-lg overflow-hidden text-ink">
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-ink/10 flex items-center justify-between gap-4 bg-canvas-light shrink-0">
          {/* Template Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-4 h-4 rounded-full shrink-0 border border-ink shadow-2xs"
              style={{ backgroundColor: template.palette?.accent || template.palette?.primary || template.accentColor || '#0f172a' }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-ink truncate">
                  {template.name}
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-volt text-ink border border-ink shrink-0">
                  {template.badge || template.category}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-500 font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {template.rating}
                </span>
              </div>
              <p className="text-xs text-ink-muted truncate mt-0.5">
                Layout: <span className="text-ink capitalize font-bold">{template.layout}</span> • {template.description}
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Zoom Presets */}
            <div className="flex items-center bg-white rounded-full p-0.5 border border-ink text-xs shadow-brutal-sm">
              <button
                type="button"
                onClick={handleFitPage}
                title="Fit Entire Page on Screen"
                className={`px-2.5 py-1 rounded-full font-bold transition cursor-pointer text-xs ${
                  zoomLevel <= 0.65 ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Fit Page
              </button>
              <button
                type="button"
                onClick={handleActualSize}
                title="100% Reading Scale"
                className={`px-2.5 py-1 rounded-full font-bold transition cursor-pointer text-xs ${
                  zoomLevel === 1.0 ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'
                }`}
              >
                100%
              </button>

              <div className="h-4 w-px bg-ink/20 mx-1" />

              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 text-ink-muted hover:text-ink rounded transition cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 py-0.5 text-ink font-mono text-[11px] min-w-[38px] text-center font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 text-ink-muted hover:text-ink rounded transition cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Select This Template CTA */}
            <button
              type="button"
              onClick={() => onSelect(template.id)}
              className="btn-volt py-2 px-4 text-xs shadow-brutal-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Template</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-ink hover:bg-black/5 rounded-full transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: A4 Resume Preview Stage (1:1 parity with A4PageSheet & TemplateDraftCard) */}
        <div className="flex-1 bg-canvas overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center items-start">
          <div
            style={{
              width: `${793.7 * zoomLevel}px`,
              height: `${1122.5 * zoomLevel}px`,
              position: 'relative',
              marginBottom: '40px'
            }}
          >
            <div
              className="resume-a4-page bg-white shadow-paper rounded-sm border border-slate-200/90 text-slate-900"
              style={{
                width: '793.7px',
                minHeight: '1122.5px',
                padding: isFullBleedTemplate(template.id) ? '0' : '12mm 14mm',
                boxSizing: 'border-box',
                backgroundColor: template.palette?.bg || template.palette?.background || '#ffffff',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                transition: 'transform 180ms ease-out'
              }}
            >
              <ResumeTemplate
                templateId={template.id}
                resumeData={{
                  ...INITIAL_RESUME_DATA,
                  preferences: {},
                  personalInfo: {
                    ...INITIAL_RESUME_DATA.personalInfo,
                    photo: INITIAL_RESUME_DATA.personalInfo?.photo || getPreviewAvatarForTemplate(template),
                  },
                }}
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
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200/90 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% ATS Safe Typography</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden sm:inline">A4 Portrait Standard Dimensions (210 × 297mm)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSelect(template.id)}
              className="btn-primary py-1.5 px-3.5 text-xs"
            >
              <span>Build with {template.name}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
