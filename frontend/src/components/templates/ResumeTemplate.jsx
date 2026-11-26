import React from 'react';
import { TEMPLATE_REGISTRY } from '../../constants/templateRegistry';
import { DynamicResumeCanvas } from './DynamicResumeCanvas';
import { sanitizeResumeData } from '../../utils/sanitizeResume';

// Map legacy template IDs to closest surviving TEMPLATE_REGISTRY IDs
const LEGACY_TEMPLATE_MAP = {
  'ats-01': 'ats-classic',
  'ats-02': 'ats-executive',
  'ats-03': 'ats-minimal',
  'modern-01': 'tech-frontend-ui',
  'modern-02': 'biz-product-manager',
  'modern-07': 'cre-ui-ux',
  'modern-08': 'tech-fullstack-js',
  'minimalist-01': 'ats-minimal',
  'developer-01': 'tech-senior-swe',
  'developer-02': 'tech-backend-api',
  'data-01': 'data-analyst-bi',
  'data-02': 'data-scientist-core',
  'aiml-01': 'data-ml-engineer',
  'aiml-02': 'data-ai-researcher',
  'business-01': 'biz-strategy-lead',
  'business-02': 'biz-operations-exec',
  'executive-01': 'ats-executive',
  'student-01': 'stu-cs-fresher',
  'creative-01': 'cre-ui-ux',
};

const LEGACY_TEMPLATE_DEFAULTS = {
  'maang-01': { primaryColor: '#1a73e8', accentColor: '#0284c7', dividerStyle: 'bar' },
  'maang-02': { primaryColor: '#0668E1', accentColor: '#2563eb', dividerStyle: 'line' },
  'maang-03': { primaryColor: '#ea580c', accentColor: '#f97316', dividerStyle: 'bar' },
  'maang-04': { primaryColor: '#1e293b', accentColor: '#475569', dividerStyle: 'line' },
  'maang-05': { primaryColor: '#dc2626', accentColor: '#ef4444', dividerStyle: 'bar' },
  'maang-07': { primaryColor: '#16a34a', accentColor: '#22c55e', dividerStyle: 'line' },
  'maang-08': { primaryColor: '#635BFF', accentColor: '#4f46e5', dividerStyle: 'bar' },
  'maang-09': { primaryColor: '#0d9488', accentColor: '#14b8a6', dividerStyle: 'bar' },
  'maang-10': { primaryColor: '#1a73e8', accentColor: '#0284c7', dividerStyle: 'line' },
  'maang-11': { primaryColor: '#0668E1', accentColor: '#2563eb', dividerStyle: 'bar' },
  'maang-15': { primaryColor: '#0f172a', accentColor: '#3b82f6', dividerStyle: 'double' },
  'maang-16': { primaryColor: '#0f172a', accentColor: '#3b82f6', dividerStyle: 'double' },
  'developer-01': { primaryColor: '#0284c7', accentColor: '#0369a1', dividerStyle: 'bar' },
  'developer-02': { primaryColor: '#0f172a', accentColor: '#0284c7', dividerStyle: 'line' },
  'data-01': { primaryColor: '#0891b2', accentColor: '#06b6d4', dividerStyle: 'bar' },
  'data-02': { primaryColor: '#0e7490', accentColor: '#0891b2', dividerStyle: 'line' },
  'aiml-01': { primaryColor: '#7c3aed', accentColor: '#6d28d9', dividerStyle: 'bar' },
  'aiml-02': { primaryColor: '#6b21a8', accentColor: '#7c3aed', dividerStyle: 'line' },
  'business-01': { primaryColor: '#1e3a8a', accentColor: '#2563eb', dividerStyle: 'line' },
  'business-02': { primaryColor: '#0f172a', accentColor: '#1e3a8a', dividerStyle: 'double' },
};

export function resolveTemplateId(templateId = 'ats-classic') {
  if (!templateId) return TEMPLATE_REGISTRY[0]?.id || 'ats-classic';
  if (TEMPLATE_REGISTRY.some(t => t.id === templateId)) return templateId;
  if (LEGACY_TEMPLATE_MAP[templateId] && TEMPLATE_REGISTRY.some(t => t.id === LEGACY_TEMPLATE_MAP[templateId])) {
    return LEGACY_TEMPLATE_MAP[templateId];
  }
  if (templateId.startsWith('maang-') || templateId.startsWith('developer-') || templateId.startsWith('infra-') || templateId.startsWith('lead-')) {
    return 'tech-senior-swe';
  }
  if (templateId.startsWith('data-') || templateId.startsWith('aiml-')) return 'data-scientist-core';
  if (templateId.startsWith('modern-')) return 'tech-frontend-ui';
  if (templateId.startsWith('creative-')) return 'cre-ui-ux';
  if (templateId.startsWith('student-')) return 'stu-cs-fresher';
  if (templateId.startsWith('business-') || templateId.startsWith('executive-')) return 'biz-product-manager';
  return TEMPLATE_REGISTRY[0]?.id || 'ats-classic';
}

/**
 * Universal Resume Template Renderer (Single Source of Truth)
 */
export function ResumeTemplate({
  templateId = 'ats-classic',
  resumeData: rawResumeData,
  designOverrides = {},
  pageNumber = 1,
  totalPages = 1,
  isOnePage = false,
}) {
  if (!rawResumeData) return null;
  const resumeData = sanitizeResumeData(rawResumeData);

  const legacyDefaults = LEGACY_TEMPLATE_DEFAULTS[templateId] || {};
  const effectiveTemplateId = resolveTemplateId(templateId);

  const mergedOverrides = {
    ...legacyDefaults,
    ...designOverrides,
    primaryColor: designOverrides.primaryColor || resumeData?.preferences?.primaryColor || resumeData?.preferences?.themeColor || legacyDefaults.primaryColor,
    accentColor: designOverrides.accentColor || resumeData?.preferences?.accentColor || legacyDefaults.accentColor,
    layout: designOverrides.layout || resumeData?.preferences?.layout,
  };

  return (
    <DynamicResumeCanvas
      resumeData={resumeData}
      templateId={effectiveTemplateId}
      designOverrides={mergedOverrides}
      pageNumber={pageNumber}
      totalPages={totalPages}
      isOnePage={isOnePage}
    />
  );
}
