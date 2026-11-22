import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Sparkles, Star, Layout, ShieldCheck, ArrowRight } from 'lucide-react';
import { ResumeTemplate } from './ResumeTemplate';
import { INITIAL_RESUME_DATA } from '../../constants/initialResumeData';

export function TemplateQuickPreviewModal({ template, isOpen, onClose, onSelect }) {
  const [zoomLevel, setZoomLevel] = useState(0.85);

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
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))));
  const handleResetZoom = () => setZoomLevel(0.85);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-4 h-4 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: template.accentColor }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white truncate">
                  {template.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
                  {template.badge || template.category}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {template.rating}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Layout: <span className="text-slate-200 capitalize">{template.layout}</span> • {template.description}
              </p>
            </div>
          </div>

          {/* Action and Zoom Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Zoom"
                className="px-2 py-1 text-slate-300 hover:text-white font-mono text-[11px]"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Select Button */}
            <button
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
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable A4 Document View */}
        <div className="flex-1 bg-slate-950 overflow-auto p-4 sm:p-8 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="shadow-2xl rounded-sm bg-white text-slate-900 border border-slate-200"
          >
            {/* Real Full-Scale Template Preview */}
            <ResumeTemplate
              templateId={template.id}
              resumeData={INITIAL_RESUME_DATA}
            />
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>High-precision ATS format • All sections adapt dynamically to your personal content</span>
          </div>
          <div className="hidden sm:block text-[11px] text-slate-500 font-mono">
            Template ID: {template.id}
          </div>
        </div>
      </div>
    </div>
  );
}
