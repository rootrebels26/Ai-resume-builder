import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Palette, Download, Loader2,
  MoreHorizontal, RefreshCw, FileJson, Upload, LayoutTemplate
} from 'lucide-react';

/**
 * Clean, single-row Studio Header for the Resume Builder.
 * Groups navigation, phase switching, design toggle, primary PDF download,
 * and secondary utility actions into a calm, structured bar.
 */
export function BuilderToolbar({
  docTitle,
  setDocTitle,
  isEditingTitle,
  setIsEditingTitle,
  onTitleBlur,
  displayAtsScore,
  editorPhase,
  setEditorPhase,
  mobileView,
  setMobileView,
  showDesignStudio,
  setShowDesignStudio,
  isExporting,
  exportProgressText,
  onDownloadPDF,
  onLoadSampleData,
  onExportJSON,
  onImportJSONClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  return (
    <header className="bg-[#FAF8F5] border-b border-ink/15 px-3 sm:px-5 py-2 flex items-center justify-between gap-3 no-print shrink-0 z-20">
      {/* Left: Back + Editable Title + ATS Pill */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link
          to="/"
          className="p-1.5 text-ink-muted hover:text-ink hover:bg-black/5 rounded-lg transition shrink-0"
          title="Back to Home"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {isEditingTitle ? (
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            onBlur={onTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && onTitleBlur()}
            autoFocus
            className="input-base py-1 px-2.5 text-xs sm:text-sm font-bold w-40 sm:w-56"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            className="group flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-black/5 transition truncate max-w-[180px] sm:max-w-[240px]"
            title="Click to rename resume"
          >
            <span className="font-bold text-xs sm:text-sm text-ink truncate">
              {docTitle}
            </span>
            <Edit3 className="w-3 h-3 text-ink-muted opacity-0 group-hover:opacity-100 transition shrink-0" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setEditorPhase('ats_and_download')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-volt text-ink border border-ink text-[11px] font-mono font-bold shadow-[1px_1px_0_#171713] cursor-pointer hover:opacity-90 transition shrink-0"
          title="View ATS Readiness"
        >
          <span className="size-1.5 rounded-full bg-emerald-700" />
          <span>ATS {displayAtsScore}%</span>
        </button>
      </div>

      {/* Center: Clean Segmented Phase Switcher (Desktop) */}
      <nav
        aria-label="Resume Builder Steps"
        className="hidden md:flex items-center bg-white border border-ink/20 rounded-xl p-0.5 shadow-2xs"
      >
        {[
          { id: 'edit', label: '1. Edit' },
          { id: 'optimize', label: '2. AI Optimize' },
          { id: 'ats_and_download', label: '3. ATS & Export' },
        ].map((step) => {
          const active = editorPhase === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setEditorPhase(step.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                active
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </nav>

      {/* Center: Mobile View Switcher */}
      <div className="md:hidden flex rounded-xl bg-white p-0.5 border border-ink/20">
        {[
          { id: 'editor', label: 'Edit' },
          { id: 'preview', label: 'Preview' },
          { id: 'design', label: 'Design' },
        ].map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setMobileView(view.id)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
              mobileView === view.id ? 'bg-ink text-white' : 'text-ink-muted'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Right: Design Toggle + Primary Download PDF + Overflow Menu */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setShowDesignStudio(!showDesignStudio)}
          className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
            showDesignStudio
              ? 'bg-ink text-volt border-ink shadow-[2px_2px_0_rgba(0,0,0,0.2)]'
              : 'bg-white text-ink border-ink/25 hover:border-ink'
          }`}
          title="Customize Layout, Fonts & Colors"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Design</span>
        </button>

        <button
          type="button"
          onClick={onDownloadPDF}
          disabled={isExporting}
          title="Download Pixel-Perfect PDF"
          className="btn-volt py-1.5 px-3.5 text-xs font-extrabold shadow-[2px_2px_0_#171713] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">{exportProgressText}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </>
          )}
        </button>

        {/* Secondary Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-xl bg-white border border-ink/20 hover:border-ink text-ink-muted hover:text-ink transition cursor-pointer"
            title="More options"
            aria-label="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border-[1.5px] border-ink rounded-2xl shadow-brutal py-1.5 z-50 text-xs font-semibold text-ink">
              <Link
                to="/templates"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-canvas-light transition"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-[#5e48d7]" />
                <span>Browse 100 Templates</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLoadSampleData();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-canvas-light transition text-left cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-ink-muted" />
                <span>Load Sample Resume</span>
              </button>
              <div className="my-1 border-t border-ink/10" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onImportJSONClick();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-canvas-light transition text-left cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-ink-muted" />
                <span>Import JSON Backup</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onExportJSON();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-canvas-light transition text-left cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-ink-muted" />
                <span>Export JSON Backup</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
