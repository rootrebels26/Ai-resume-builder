import React, { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { useResume } from '../context/ResumeContext';
import { A4PageSheet } from '../components/templates/A4PageSheet';
import { pdfService } from '../services/pdfService';
import { TEMPLATE_REGISTRY } from '../constants/templateRegistry';
import { getPreviewAvatarForTemplate } from '../utils/previewAvatar';

export function Preview() {
  const { resumeData } = useResume();
  const [searchParams] = useSearchParams();
  const printRef = useRef(null);

  const queryTemplateId = searchParams.get('template');
  const isEmbed = searchParams.get('embed') === '1';
  const effectiveTemplateId = queryTemplateId || resumeData.templateId || 'ats-classic';
  const matchedTemplate = TEMPLATE_REGISTRY.find((t) => t.id === effectiveTemplateId);
  const previewAvatar = queryTemplateId ? getPreviewAvatarForTemplate(matchedTemplate) : null;
  const effectiveResumeData = queryTemplateId
    ? {
        ...resumeData,
        templateId: queryTemplateId,
        preferences: {},
        personalInfo: {
          ...(resumeData.personalInfo || {}),
          photo: resumeData?.personalInfo?.photo || previewAvatar,
        },
      }
    : resumeData;

  const handleDownloadPDF = async () => {
    if (printRef.current) {
      const filename = `${(effectiveResumeData.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}.pdf`;
      await pdfService.exportToPDF(printRef.current, filename, {
        format: effectiveResumeData?.preferences?.paperFormat || 'a4'
      });
    }
  };

  return (
    <div className={`flex-1 flex flex-col ${isEmbed ? 'bg-white' : 'bg-slate-200/70 min-h-screen'}`}>
      {/* Action Header */}
      {!isEmbed && (
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
              onClick={handleDownloadPDF}
              className="btn-primary py-1.5 px-4 text-xs shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Unified A4 Sheet Center (identical renderer & margins to Builder) */}
      <div className={isEmbed ? 'flex justify-center items-start p-0 m-0' : 'flex-1 p-4 sm:p-8 overflow-auto flex justify-center items-start'}>
        <div ref={printRef}>
          <A4PageSheet
            pageData={effectiveResumeData}
            resumeData={effectiveResumeData}
            templateId={effectiveTemplateId}
            pageLayoutMode={effectiveResumeData?.preferences?.pageLayoutMode || 'auto'}
            designOverrides={queryTemplateId ? {} : (resumeData?.preferences || {})}
          />
        </div>
      </div>
    </div>
  );
}
