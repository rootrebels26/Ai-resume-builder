import React from 'react';
import { TEMPLATE_REGISTRY } from '../../constants/templateRegistry';
import { DynamicResumeCanvas } from './DynamicResumeCanvas';
import { sanitizeResumeData } from '../../utils/sanitizeResume';

// Map legacy and MAANG template brand colors to DynamicResumeCanvas defaults
const LEGACY_TEMPLATE_DEFAULTS = {
  'maang-01': { primaryColor: '#1a73e8', accentColor: '#0284c7', dividerStyle: 'bar' },
  'maang-02': { primaryColor: '#0668E1', accentColor: '#2563eb', dividerStyle: 'line' }, // Meta E5
  'maang-03': { primaryColor: '#ea580c', accentColor: '#f97316', dividerStyle: 'bar' }, // Amazon
  'maang-04': { primaryColor: '#1e293b', accentColor: '#475569', dividerStyle: 'line' }, // Apple
  'maang-05': { primaryColor: '#dc2626', accentColor: '#ef4444', dividerStyle: 'bar' }, // Netflix
  'maang-07': { primaryColor: '#16a34a', accentColor: '#22c55e', dividerStyle: 'line' }, // Nvidia
  'maang-08': { primaryColor: '#635BFF', accentColor: '#4f46e5', dividerStyle: 'bar' }, // Stripe
  'maang-09': { primaryColor: '#0d9488', accentColor: '#14b8a6', dividerStyle: 'bar' }, // OpenAI
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

/**
 * Universal Resume Template Renderer
 * 
 * Routes ALL resume templates through the Canva-grade DynamicResumeCanvas engine.
 * Ensures 100% of Canva Design Studio features work consistently:
 * - Layout switching: Single Column, Two Column, Sidebar Left, Sidebar Right, Header Card.
 * - Typography: All 12 Google Fonts, font size scaling, line spacing.
 * - Color palettes: Theme colors, accent colors, background colors.
 * - Divider and Bullet customizations.
 * - Section reordering and visibility controls.
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

  // Get legacy default styling if applicable
  const legacyDefaults = LEGACY_TEMPLATE_DEFAULTS[templateId] || {};

  // Find in registry or fallback to first registry template
  const effectiveTemplateId = TEMPLATE_REGISTRY.some(t => t.id === templateId)
    ? templateId
    : (templateId.startsWith('maang-') ? 'tech-senior-swe' : (templateId.startsWith('data-') ? 'tech-lead-architect' : 'ats-classic'));

  // Merge legacy brand accents with user design overrides and preferences
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
