import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { ResumeTemplate } from '../components/templates/ResumeTemplate';
import { pdfService } from '../services/pdfService';

export function Preview() {
  const { resumeData } = useResume();
  const printRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (printRef.current) {
      const filename = `${(resumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}.pdf`;
      await pdfService.exportToPDF(printRef.current, filename);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-200/80">
      {/* Action Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center no-print sticky top-16 z-30 shadow-2xs">
        <Link
          to="/builder"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Editor</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => pdfService.print()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Center */}
      <div className="flex-1 p-8 overflow-auto flex justify-center items-start">
        <div
          ref={printRef}
          className="resume-a4-page bg-white shadow-2xl text-slate-900"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '18mm',
            boxSizing: 'border-box'
          }}
        >
          <ResumeTemplate
            templateId={resumeData.templateId || "ats-01"}
            resumeData={resumeData}
          />
        </div>
      </div>
    </div>
  );
}
