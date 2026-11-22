import React, { useRef, useState } from 'react';
import { Download, Printer, FileJson, ArrowLeft, RefreshCw, ZoomIn, ZoomOut, Check, Palette } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { ResumeTemplate } from '../../components/templates/ResumeTemplate';
import { TEMPLATES } from '../../constants/templatesList';
import { pdfService } from '../../services/pdfService';
import { storageService } from '../../services/storageService';

export function Step7FinalResume({ onPrev }) {
  const { resumeData, selectedTemplateId, selectTemplate, selectedJob, updatePreferences } = useResume();
  const [zoomScale, setZoomScale] = useState(1);
  const printRef = useRef(null);

  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  const handleDownloadPDF = async () => {
    if (printRef.current) {
      const filename = `${(resumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_${(selectedJob?.role || 'Resume').replace(/\s+/g, '_')}.pdf`;
      await pdfService.exportToPDF(printRef.current, filename);
    }
  };

  const handleExportJSON = () => {
    const filename = `${(resumeData.personalInfo.fullName || 'resume').toLowerCase().replace(/\s+/g, '_')}.json`;
    storageService.exportJSON(resumeData, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs no-print">
        {/* Template Switcher & Accent Color */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Audit</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Template:</span>
            <select
              value={selectedTemplateId || "ats-01"}
              onChange={(e) => selectTemplate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Color:</span>
            <input
              type="color"
              value={resumeData.preferences?.themeColor || activeTemplate.accentColor}
              onChange={(e) => updatePreferences('themeColor', e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-slate-300"
            />
          </div>
        </div>

        {/* Zoom & Export Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5">
            <button
              onClick={() => setZoomScale(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-600">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => pdfService.print()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow transition active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download A4 PDF</span>
          </button>
        </div>
      </div>

      {/* Target Job Connection Banner */}
      {selectedJob?.role && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center justify-between text-xs no-print shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-500 text-white font-bold text-[10px] uppercase">Job-Targeted</span>
            <span>Target Role: <strong>{selectedJob.role}</strong> {selectedJob.company ? `at ${selectedJob.company}` : ''}</span>
          </div>
          <span className="text-[11px] text-slate-400">Template ID: {selectedTemplateId}</span>
        </div>
      )}

      {/* A4 Sheet Container */}
      <div className="bg-slate-200/70 p-4 sm:p-10 rounded-2xl overflow-y-auto overflow-x-auto flex justify-center items-start shadow-inner">
        <div
          style={{
            width: `${210 * zoomScale}mm`,
            minHeight: `${297 * zoomScale}mm`,
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '96px'
          }}
        >
          <div
            ref={printRef}
            id="final-printable-resume"
            className="resume-a4-page bg-white shadow-2xl transition-transform origin-top text-slate-900 shrink-0"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '16mm 18mm',
              boxSizing: 'border-box',
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center'
            }}
          >
            <ResumeTemplate
              templateId={selectedTemplateId || "ats-01"}
              resumeData={resumeData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
