import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Sparkles, ChevronDown } from 'lucide-react';

/**
 * Minimal, distraction-free Preview Canvas Toolbar.
 * Holds only preview zoom, page count/fit mode, and optional AI Smart-Condense menu.
 */
export function PreviewCanvasToolbar({
  zoomScale,
  setZoomScale,
  pageCount,
  pageLayoutMode,
  setPageLayoutMode,
  isSmartCondensing,
  onSmartCondense,
  condenseNotice,
  undoSnapshot,
  onUndoCondense,
}) {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const aiMenuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target)) {
        setAiMenuOpen(false);
      }
    };
    if (aiMenuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [aiMenuOpen]);

  return (
    <div className="sticky top-0 z-10 mb-5 flex flex-col items-center gap-2 shrink-0">
      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-ink/20 shadow-brutal-sm flex items-center gap-2.5 text-xs text-ink">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.45, Number((z - 0.05).toFixed(2))))}
            className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-full transition cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale(0.85)}
            className="px-1.5 font-mono text-[11px] font-bold text-ink hover:text-[#5e48d7] cursor-pointer"
            title="Reset Zoom to 85%"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(1.4, Number((z + 0.05).toFixed(2))))}
            className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-full transition cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-3.5 w-px bg-ink/15" />

        {/* Page Count Badge */}
        <span className="font-mono text-[11px] font-bold text-ink-muted px-1">
          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
        </span>

        {/* Clean Segmented Page Fit Toggle */}
        <div className="flex items-center bg-canvas rounded-full p-0.5 border border-ink/15 text-[11px] font-bold">
          {[
            { id: 'auto', label: 'Auto' },
            { id: '1_page', label: '1P' },
            { id: '2_pages', label: '2P' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPageLayoutMode(mode.id)}
              className={`px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                pageLayoutMode === mode.id
                  ? 'bg-ink text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="h-3.5 w-px bg-ink/15" />

        {/* Compact AI Smart Fit Dropdown */}
        <div className="relative" ref={aiMenuRef}>
          <button
            type="button"
            disabled={isSmartCondensing}
            onClick={() => setAiMenuOpen(!aiMenuOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#5e48d7]/10 hover:bg-[#5e48d7]/20 text-[#5e48d7] text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
            title="AI Smart-Condense to fit 1 or 2 pages cleanly"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isSmartCondensing ? 'Fitting...' : 'AI Fit'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {aiMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border-[1.5px] border-ink rounded-2xl shadow-brutal p-1.5 z-50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAiMenuOpen(false);
                  onSmartCondense(1);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-canvas-light transition cursor-pointer"
              >
                <div className="font-bold text-ink">AI Fit to 1 Page</div>
                <div className="text-[10px] text-ink-muted">Condenses bullets with zero lost details</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMenuOpen(false);
                  onSmartCondense(2);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-canvas-light transition cursor-pointer"
              >
                <div className="font-bold text-ink">AI Balance to 2 Pages</div>
                <div className="text-[10px] text-ink-muted">Distributes sections cleanly across 2 pages</div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Optimization Notice Banner with 1-Click Undo */}
      {condenseNotice && (
        <div className="bg-emerald-50 border border-emerald-300 px-4 py-1.5 text-xs font-semibold text-emerald-950 flex items-center gap-3 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{condenseNotice}</span>
          {undoSnapshot && (
            <button
              type="button"
              onClick={onUndoCondense}
              className="font-bold underline text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
