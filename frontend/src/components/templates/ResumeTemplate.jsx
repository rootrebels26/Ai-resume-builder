import React from 'react';
import { TEMPLATE_REGISTRY } from '../../constants/templateRegistry';
import { DynamicResumeCanvas } from './DynamicResumeCanvas';
import {
  ATS01, ATS02, ATS03, ATS04, ATS05, ATS06, ATS07, ATS08, ATS09, ATS10
} from './ATSTemplates';
import {
  Modern01, Modern02, Modern03, Modern04, Modern05, Modern06, Modern07, Modern08, Modern09, Modern10
} from './ModernTemplates';
import {
  Minimalist01, Minimalist02, Minimalist03, Minimalist04, Minimalist05,
  Minimalist06, Minimalist07, Minimalist08, Minimalist09, Minimalist10
} from './MinimalistTemplates';
import {
  StudentTemplate, DeveloperTemplate, DataScienceTemplate, AIMLTemplate,
  ExecutiveTemplate, CreativeTemplate, BusinessTemplate
} from './SpecializedTemplates';
import {
  MAANGTemplateRouter, MAANGStaffPrincipal
} from './MAANGTemplates';
import { sanitizeResumeData } from '../../utils/sanitizeResume';

export function ResumeTemplate({
  templateId = 'ats-01',
  resumeData: rawResumeData,
  designOverrides = {},
  pageNumber = 1,
  totalPages = 1,
  isOnePage = false
}) {
  if (!rawResumeData) return null;
  const resumeData = sanitizeResumeData(rawResumeData);

  // If template is registered in the 100-template Canva registry, render with DynamicResumeCanvas
  const inRegistry = TEMPLATE_REGISTRY.some(t => t.id === templateId);
  if (inRegistry) {
    return (
      <DynamicResumeCanvas
        resumeData={resumeData}
        templateId={templateId}
        designOverrides={designOverrides}
        pageNumber={pageNumber}
        totalPages={totalPages}
        isOnePage={isOnePage}
      />
    );
  }

  const userColor = resumeData?.preferences?.themeColor;

  // Fallback routes for legacy template IDs
  if (templateId.startsWith('maang-')) {
    return <MAANGTemplateRouter templateId={templateId} resumeData={resumeData} themeColor={userColor} />;
  }
  if (templateId.startsWith('infra-')) {
    return <MAANGTemplateRouter templateId={templateId} resumeData={resumeData} themeColor={userColor || '#0284c7'} />;
  }
  if (templateId.startsWith('lead-')) {
    return <MAANGStaffPrincipal resumeData={resumeData} themeColor={userColor || '#0f172a'} />;
  }
  if (templateId.startsWith('developer-')) {
    return <DeveloperTemplate resumeData={resumeData} themeColor={userColor || '#0284c7'} />;
  }
  if (templateId.startsWith('data-')) {
    return <DataScienceTemplate resumeData={resumeData} themeColor={userColor || '#0284c7'} />;
  }
  if (templateId.startsWith('aiml-')) {
    return <AIMLTemplate resumeData={resumeData} themeColor={userColor || '#7c3aed'} />;
  }
  if (templateId.startsWith('business-')) {
    return <BusinessTemplate resumeData={resumeData} themeColor={userColor || '#0f172a'} />;
  }

  // Default fallback to DynamicResumeCanvas
  return (
    <DynamicResumeCanvas
      resumeData={resumeData}
      templateId="ats-01"
      designOverrides={designOverrides}
      pageNumber={pageNumber}
      totalPages={totalPages}
    />
  );
}
