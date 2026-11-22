import React, { useRef, useState } from 'react';
import {
  Download, Printer, ZoomIn, ZoomOut, RotateCcw, Palette,
  Sparkles, Check, CheckCircle2, ShieldCheck, ChevronDown
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { ResumeTemplate } from '../templates/ResumeTemplate';
import { TEMPLATES } from '../../constants/templatesList';
import { pdfService } from '../../services/pdfService';

const COLOR_SWATCHES = [
  { name: 'Slate Dark', color: '#1e293b' },
  { name: 'Royal Blue', color: '#2563eb' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Indigo / Violet', color: '#6366f1' },
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

  const [zoomScale, setZoomScale] = useState(0.65);
  const [activeColor, setActiveColor] = useState(
    resumeData?.preferences?.accentColor || '#1e293b'
  );
  const [isExporting, setIsExporting] = useState(false);
  const canvasPrintRef = useRef(null);

  const activeTemplate =
    TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const handleZoomIn = () =>
    setZoomScale((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))));
  const handleZoomOut = () =>
    setZoomScale((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))));
  const handleResetZoom = () => setZoomScale(0.85);

  const handleColorChange = (hex) => {
    setActiveColor(hex);
    if (updatePreferences) {
      updatePreferences({ accentColor: hex });
    }
  };

  const handleDownloadPDF = async () => {
    if (!canvasPrintRef.current) return;
    setIsExporting(true);
    try {
      const name = resumeData?.personalInfo?.fullName || 'Resume';
      const role = selectedJob?.role || 'Professional';
      const filename = `${name.replace(/\s+/g, '_')}_${role.replace(/\s+/g, '_')}.pdf`;
      await pdfService.exportToPDF(canvasPrintRef.current, filename);
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
    <div className={`flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl ${className}`}>
      {/* Enhancv-Style Floating Design & Controls Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 text-slate-200">
        {/* Template Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Design:</span>
          <div className="relative">
            <select
              value={selectedTemplateId || 'ats-01'}
              onChange={(e) => selectTemplate(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-semibold text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Color Palette Circles */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.color}
              onClick={() => handleColorChange(swatch.color)}
              title={swatch.name}
              className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                activeColor === swatch.color
                  ? 'scale-125 ring-2 ring-white border-transparent'
                  : 'border-slate-600 hover:scale-110'
              }`}
              style={{ backgroundColor: swatch.color }}
            />
          ))}
        </div>

        {/* Right Section: Zoom Controls & Quick PDF Download */}
        <div className="flex items-center gap-2">
          {/* Live ATS Pill */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">ATS {quickScore}%</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-slate-300 hover:text-white rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="px-2 py-0.5 text-slate-300 hover:text-white font-mono text-[10px]"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-slate-300 hover:text-white rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Live Canvas Surface with Centered A4 Page */}
      <div className="flex-1 bg-slate-950 overflow-y-auto overflow-x-auto p-4 sm:p-6 flex justify-center items-start">
        <div
          style={{
            width: `${210 * zoomScale}mm`,
            minHeight: `${297 * zoomScale}mm`,
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '80px'
          }}
        >
          <div
            ref={canvasPrintRef}
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '16mm 18mm',
              boxSizing: 'border-box',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.12s ease-out'
            }}
            className="shadow-2xl rounded-sm bg-white text-slate-900 border border-slate-300 my-2 select-text shrink-0"
          >
            {/* Dynamic Real-Time Resume Template */}
            <ResumeTemplate
              templateId={selectedTemplateId || 'ats-01'}
              resumeData={resumeData}
            />
          </div>
        </div>
      </div>

      {/* Canvas Sub-footer */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Synchronized A4 Canvas • Updates as you type</span>
        </div>
        <div className="font-mono text-slate-500 hidden sm:block">
          {activeTemplate.layout}
        </div>
      </div>
    </div>
  );
}
