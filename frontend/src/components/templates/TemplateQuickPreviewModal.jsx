import React, { useState, useEffect } from 'react';
import {
  X, ZoomIn, ZoomOut, RotateCcw, Check, Sparkles, Star,
  Maximize2, Eye, ShieldCheck, ArrowRight, Minimize2
} from 'lucide-react';
import { ResumeTemplate } from './ResumeTemplate';
import { INITIAL_RESUME_DATA } from '../../constants/initialResumeData';

export function TemplateQuickPreviewModal({ template, isOpen, onClose, onSelect }) {
  // Default to 0.65 so the full A4 page fits into view on initial open!
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
  const handleFitPage = () => setZoomLevel(0.60); // Fits entire A4 page from header to footer
  const handleActualSize = () => setZoomLevel(1.0); // 100% true scale

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/95 shrink-0">
          {/* Template Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-4 h-4 rounded-full shrink-0 shadow-sm border border-white/20"
              style={{ backgroundColor: template.accentColor }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white truncate">
                  {template.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-brand-400 border border-slate-700 shrink-0">
                  {template.badge || template.category}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-400 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {template.rating}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Layout: <span className="text-slate-200 capitalize font-medium">{template.layout}</span> • {template.description}
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Zoom Presets */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={handleFitPage}
                title="Fit Entire Page on Screen"
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                  zoomLevel <= 0.65 ? 'bg-brand-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Fit Page
              </button>
              <button
                type="button"
                onClick={handleActualSize}
                title="100% Reading Scale"
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-xs ${
                  zoomLevel === 1.0 ? 'bg-brand-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                100%
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 py-0.5 text-slate-300 font-mono text-[11px] min-w-[38px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Select Button */}
            <button
              type="button"
              onClick={() => {
                onSelect(template.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use This Template</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Canvas with Full A4 Dimensions & Clearance */}
        <div className="flex-1 bg-slate-950 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center items-start">
          {/* Scaled Bounds Wrapper: guarantees browser allocates full scrollable height for the document */}
          <div
            style={{
              width: `${210 * zoomLevel}mm`,
              minHeight: `${297 * zoomLevel}mm`,
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '96px'
            }}
          >
            {/* The True A4 Sheet */}
            <div
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '16mm 18mm',
                boxSizing: 'border-box',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.12s ease-out'
              }}
              className="shadow-2xl rounded-sm bg-white text-slate-900 border border-slate-300 shrink-0 select-text"
            >
              <ResumeTemplate
                templateId={template.id}
                resumeData={INITIAL_RESUME_DATA}
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-5 py-2.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Full A4 Document View • Standard 210mm × 297mm • Formatted for machine parsers and human recruiters</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {zoomLevel <= 0.65 ? 'Viewing Full Page' : 'Zoomed Detail View'} • ID: {template.id}
          </div>
        </div>
      </div>
    </div>
  );
}
