import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Edit } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { ResumeTemplate } from '../components/templates/ResumeTemplate';
import { isFullBleedTemplate } from '../constants/templatesList';
import { pdfService } from '../services/pdfService';

export function Preview() {
  const { resumeData } = useResume();
  const printRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (printRef.current) {
      const filename = `${(resumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}.pdf`;
      await pdfService.exportToPDF(printRef.current, filename, {
        format: resumeData?.preferences?.paperFormat || 'a4'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-200/70 min-h-screen">
      {/* Action Header */}
      <div className="bg-white border-b border-slate-200/90 px-6 py-3 flex justify-between items-center no-print sticky top-16 z-30 shadow-2xs">
        <Link
          to="/builder"
          className="btn-secondary py-1.5 px-3 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Editor</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => pdfService.print()}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="btn-primary py-1.5 px-4 text-xs shadow-sm"
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
          className="resume-a4-page bg-white shadow-paper rounded-sm border border-slate-200/90 text-slate-900"
          style={{
            width: '210mm',
            height: '297mm',
            padding: isFullBleedTemplate(resumeData?.templateId) ? '0' : '18mm',
            boxSizing: 'border-box',
            overflow: 'hidden'
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
