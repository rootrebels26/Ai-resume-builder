import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn, ZoomOut, Sparkles, ChevronDown, Type, Palette
} from 'lucide-react';
import { FONT_OPTIONS, COLOR_PALETTES } from '../design/CanvaDesignPanel';

/**
 * Canva-Inspired Canvas Properties Toolbar.
 * Sits cleanly above the live A4 resume preview so users can adjust
 * Font Style, Font Size, Theme Color, Zoom, and Page Fit in 1 click.
 */
export function PreviewCanvasToolbar({
  preferences = {},
  onUpdatePreferences,
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
  onOpenDesignPanel,
}) {
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const aiMenuRef = useRef(null);
  const colorMenuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target)) {
        setAiMenuOpen(false);
      }
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target)) {
        setColorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const currentFont = preferences.fontFamily || 'Inter, sans-serif';
  const currentScale = preferences.fontScale || 1;
  const currentAccent = preferences.accentColor || preferences.themeColor || '#3b82f6';

  const adjustFontScale = (delta) => {
    const next = Math.min(1.2, Math.max(0.8, Number((currentScale + delta).toFixed(2))));
    onUpdatePreferences({ fontScale: next });
  };

  return (
    <div className="sticky top-0 z-10 mb-5 flex flex-col items-center gap-2 shrink-0 max-w-full">
      {/* Canva-style Properties Bar */}
      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-2xl border border-ink/20 shadow-brutal-sm flex flex-wrap items-center justify-center gap-2 text-xs text-ink">
        {/* Font Family Picker (Canva-style) */}
        <div className="flex items-center gap-1.5 bg-canvas-light border border-ink/15 rounded-xl px-2 py-1">
          <Type className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <select
            value={currentFont}
            onChange={(e) => onUpdatePreferences({ fontFamily: e.target.value })}
            aria-label="Font Style"
            title="Change Resume Font Style"
            style={{ fontFamily: currentFont }}
            className="bg-transparent text-xs font-bold text-ink focus:outline-none cursor-pointer max-w-[135px] truncate"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Stepper */}
        <div className="flex items-center bg-canvas-light border border-ink/15 rounded-xl px-1 py-0.5">
          <button
            type="button"
            onClick={() => adjustFontScale(-0.04)}
            className="px-1.5 py-0.5 text-[11px] font-bold text-ink-muted hover:text-ink rounded-lg hover:bg-white transition cursor-pointer"
            title="Decrease Font Size"
          >
            A-
          </button>
          <span className="px-1.5 font-mono text-[10px] font-bold text-ink">
            {Math.round(currentScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => adjustFontScale(0.04)}
            className="px-1.5 py-0.5 text-[11px] font-bold text-ink-muted hover:text-ink rounded-lg hover:bg-white transition cursor-pointer"
            title="Increase Font Size"
          >
            A+
          </button>
        </div>

        {/* Accent Color Popover */}
        <div className="relative" ref={colorMenuRef}>
          <button
            type="button"
            onClick={() => setColorMenuOpen(!colorMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-canvas-light border border-ink/15 hover:border-ink transition cursor-pointer"
            title="Change Theme Colors"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/30"
              style={{ backgroundColor: currentAccent }}
            />
            <Palette className="w-3 h-3 text-ink-muted" />
          </button>

          {colorMenuOpen && (
            <div className="absolute left-0 mt-2 w-60 bg-white border-[1.5px] border-ink rounded-2xl shadow-brutal p-3 z-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wide">
                  Theme Palette
                </span>
                {onOpenDesignPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      setColorMenuOpen(false);
                      onOpenDesignPanel();
                    }}
                    className="text-[10px] font-bold text-[#5e48d7] hover:underline cursor-pointer"
                  >
                    More Styles →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => {
                      onUpdatePreferences({
                        primaryColor: pal.primary,
                        themeColor: pal.primary,
                        accentColor: pal.accent,
                        backgroundColor: pal.bg,
                        textColor: pal.text,
                      });
                      setColorMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg border border-ink/15 hover:border-ink transition cursor-pointer text-left"
                    title={pal.name}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: pal.primary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full shrink-0 -ml-2 border border-white"
                      style={{ backgroundColor: pal.accent }}
                    />
                    <span className="text-[10px] font-semibold text-ink truncate">
                      {pal.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-ink/15 hidden sm:block" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.45, Number((z - 0.05).toFixed(2))))}
            className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-lg transition cursor-pointer"
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
            className="p-1 text-ink-muted hover:text-ink hover:bg-canvas rounded-lg transition cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-ink/15 hidden sm:block" />

        {/* Page Count + Fit Segmented Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold text-ink-muted">
            {pageCount}P
          </span>
          <div className="flex items-center bg-canvas rounded-xl p-0.5 border border-ink/15 text-[11px] font-bold">
            {[
              { id: 'auto', label: 'Auto' },
              { id: '1_page', label: '1P' },
              { id: '2_pages', label: '2P' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPageLayoutMode(mode.id)}
                className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                  pageLayoutMode === mode.id
                    ? 'bg-ink text-white'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compact AI Smart Fit Dropdown */}
        <div className="relative" ref={aiMenuRef}>
          <button
            type="button"
            disabled={isSmartCondensing}
            onClick={() => setAiMenuOpen(!aiMenuOpen)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#5e48d7]/10 hover:bg-[#5e48d7]/20 text-[#5e48d7] text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
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
