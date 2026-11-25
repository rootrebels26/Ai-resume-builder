import React, { useRef, useState, useMemo } from 'react';
import {
  Download, Printer, ZoomIn, ZoomOut, RotateCcw, Palette,
  Sparkles, Check, CheckCircle2, ShieldCheck, ChevronDown, FileText, Scissors,
  Plus, Minimize2
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { ResumeTemplate } from '../templates/ResumeTemplate';
import { A4PageSheet } from '../templates/A4PageSheet';
import { TEMPLATES, isFullBleedTemplate } from '../../constants/templatesList';
import { pdfService } from '../../services/pdfService';
import { useResumePagination } from '../../utils/resumePaginator';

const COLOR_SWATCHES = [
  { name: 'Classic Slate', color: '#1e293b' },
  { name: 'Resume Blue', color: '#1a91f0' },
  { name: 'Royal Navy', color: '#1d4ed8' },
  { name: 'Emerald Green', color: '#059669' },
  { name: 'Executive Violet', color: '#6366f1' },
  { name: 'Crimson', color: '#dc2626' },
  { name: 'Cyan Tech', color: '#0891b2' },
  { name: 'Amber Gold', color: '#d97706' },
];

export function LiveResumeCanvas({ className = "" }) {
  const {
    resumeData,
    selectedTemplateId,
    selectTemplate,
    selectedJob,
    updatePreferences
  } = useResume();

  const [zoomScale, setZoomScale] = useState(0.72);
  const [activeColor, setActiveColor] = useState(
    resumeData?.preferences?.accentColor || '#1e293b'
  );
  const [isExporting, setIsExporting] = useState(false);
  const canvasPrintRef = useRef(null);

  const [pageLayoutMode, setPageLayoutMode] = useState('auto'); // 'auto' | '1_page' | '2_pages'

  const paginationOptions = useMemo(() => ({
    forceTwoPages: pageLayoutMode === '2_pages',
    forceSinglePage: pageLayoutMode === '1_page',
    templateId: selectedTemplateId || resumeData?.templateId || 'ats-01'
  }), [pageLayoutMode, selectedTemplateId, resumeData?.templateId]);

  const { pages, pageCount, isMultiPage } = useResumePagination(resumeData, paginationOptions);

  const activeTemplate =
    TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const handleZoomIn = () =>
    setZoomScale((z) => Math.min(1.3, Number((z + 0.08).toFixed(2))));
  const handleZoomOut = () =>
    setZoomScale((z) => Math.max(0.45, Number((z - 0.08).toFixed(2))));
  const handleResetZoom = () => setZoomScale(0.72);

  const handleColorChange = (hex) => {
    setActiveColor(hex);
    if (updatePreferences) {
      updatePreferences('accentColor', hex);
      updatePreferences('themeColor', hex);
    }
  };

  const handleDownloadPDF = async () => {
    if (!canvasPrintRef.current) return;
    setIsExporting(true);
    try {
      const name = resumeData?.personalInfo?.fullName || 'Resume';
      const role = selectedJob?.role || 'Professional';
      const filename = `${name.replace(/\s+/g, '_')}_${role.replace(/\s+/g, '_')}.pdf`;
      await pdfService.exportToPDF(canvasPrintRef.current, filename, {
        format: resumeData?.preferences?.paperFormat || 'a4'
      });
    } catch (e) {
      console.error('PDF Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Quick calculate a live ATS score based on populated fields
  const calculateQuickScore = () => {
    let score = 40;
    if (resumeData?.personalInfo?.fullName) score += 10;
    if (resumeData?.personalInfo?.email) score += 10;
    if (resumeData?.professionalSummary && resumeData.professionalSummary.length > 50) score += 10;
    if (resumeData?.experience && resumeData.experience.length > 0) score += 15;
    if (resumeData?.skills && resumeData.skills.length > 0) score += 10;
    if (resumeData?.education && resumeData.education.length > 0) score += 5;
    return Math.min(score, 98);
  };

  const quickScore = calculateQuickScore();

  return (
    <div className={`flex flex-col h-full bg-canvas border-[1.5px] border-ink rounded-3xl overflow-hidden shadow-brutal ${className}`}>
      {/* Floating Design & Controls Bar */}
      <div className="bg-[#FAF8F5] px-4 py-2.5 border-b border-ink/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 text-ink">
        {/* Template Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-ink-muted uppercase">Design:</span>
          <div className="relative">
            <select
              value={selectedTemplateId || 'ats-01'}
              onChange={(e) => selectTemplate(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-full bg-white border border-ink font-bold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-volt cursor-pointer shadow-brutal-sm"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Color Palette Circles */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-ink-muted mr-0.5" />
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.color}
              onClick={() => handleColorChange(swatch.color)}
              title={swatch.name}
              className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border border-ink/30 ${
                activeColor === swatch.color
                  ? 'scale-125 ring-2 ring-volt'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: swatch.color }}
            />
          ))}
        </div>

        {/* Right Section: Layout controls, Zoom & Quick PDF Download */}
        <div className="flex items-center gap-2">
          {/* Live ATS Pill */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-volt border border-ink text-[11px] font-mono font-bold shadow-brutal-sm">
            <span>ATS {quickScore}%</span>
          </div>

          {/* Layout Controls: Fit 1 Page & + Add 1 More Page */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPageLayoutMode(prev => prev === '1_page' ? 'auto' : '1_page')}
              title={pageLayoutMode === '1_page' ? "1 Page Fit is active (Click to reset to Auto)" : "Fit all content onto 1 Page with zero cut-off"}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold font-mono transition cursor-pointer shadow-brutal-sm ${
                pageLayoutMode === '1_page'
                  ? 'bg-ink text-volt border-ink ring-2 ring-volt/40'
                  : 'bg-white text-ink border-ink/20 hover:border-ink hover:text-ink'
              }`}
            >
              {pageLayoutMode === '1_page' ? (
                <>
                  <Check className="w-3 h-3 text-volt" />
                  <span>1 Page Fit</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3 h-3 text-ink-muted" />
                  <span>Fit 1 Page</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setPageLayoutMode(prev => prev === '2_pages' ? 'auto' : '2_pages')}
              title={pageLayoutMode === '2_pages' ? "Switch back to Auto Fit" : "Add 1 more page (Split content across 2 pages)"}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold font-mono transition cursor-pointer shadow-brutal-sm ${
                pageLayoutMode === '2_pages'
                  ? 'bg-ink text-volt border-ink ring-2 ring-volt/40'
                  : 'bg-white text-ink border-ink/20 hover:border-ink'
              }`}
            >
              {pageLayoutMode === '2_pages' ? (
                <>
                  <Check className="w-3 h-3 text-volt" />
                  <span>2 Pages</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>+ Add Page</span>
                </>
              )}
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-white rounded-full p-0.5 border border-ink text-xs shadow-brutal-sm">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-ink-muted hover:text-ink rounded-full transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="px-2 py-0.5 text-ink font-mono text-[11px] font-bold"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-ink-muted hover:text-ink rounded-full transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="btn-volt py-1.5 px-3.5 text-xs shadow-brutal-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Live Canvas Surface with Centered A4 Page */}
      <div className="flex-1 bg-canvas overflow-y-auto overflow-x-auto p-4 sm:p-6 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            marginBottom: `${Math.max(60, pageCount * 45)}px`
          }}
        >
          <div
            ref={canvasPrintRef}
            id="printable-resume"
            className="flex flex-col items-center gap-8"
            style={{ width: '210mm' }}
          >
            {pages.map((pageData, pageIdx) => (
              <React.Fragment key={pageIdx}>
                {/* Visual Page Break Divider between pages */}
                {pageIdx > 0 && (
                  <div className="no-print flex items-center justify-center gap-3 w-[210mm] py-2 text-xs font-mono font-bold text-ink-muted select-none">
                    <div className="flex-1 border-t-2 border-dashed border-ink/30" />
                    <span className="bg-white px-3.5 py-1 rounded-full border border-ink/20 shadow-brutal-sm text-[11px] flex items-center gap-1.5 text-ink">
                      <Scissors className="w-3 h-3 text-ink-muted" />
                      <span>PAGE BREAK • PAGE {pageIdx + 1} OF {pageCount}</span>
                    </span>
                    <div className="flex-1 border-t-2 border-dashed border-ink/30" />
                  </div>
                )}

                {/* HTML2PDF page break anchor for PDF export */}
                {pageIdx > 0 && (
                  <div className="html2pdf__page-break" style={{ height: 0, margin: 0, padding: 0 }} />
                )}

                {/* Single Authentic A4 Document Paper Sheet with Smart Auto-Fit */}
                <A4PageSheet
                  pageData={pageData}
                  pageIdx={pageIdx}
                  pageCount={pageCount}
                  isMultiPage={isMultiPage}
                  pageLayoutMode={pageLayoutMode}
                  resumeData={resumeData}
                  templateId={selectedTemplateId || resumeData?.templateId || 'ats-01'}
                  designOverrides={resumeData?.preferences || {}}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
