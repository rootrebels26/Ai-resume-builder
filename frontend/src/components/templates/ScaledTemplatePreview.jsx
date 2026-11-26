import React, { useRef, useState, useEffect } from 'react';
import { ResumeTemplate } from './ResumeTemplate';
import { INITIAL_RESUME_DATA } from '../../constants/initialResumeData';
import { isFullBleedTemplate } from '../../constants/templatesList';
import { getPreviewAvatarForTemplate } from '../../utils/previewAvatar';

const A4_WIDTH_PX = 793.7;
const A4_HEIGHT_PX = 1122.5;

/**
 * Single-Source-of-Truth Scaled A4 Preview
 * Renders the exact real ResumeTemplate (DynamicResumeCanvas) at true A4 dimensions
 * and scales it uniformly to fit its container without reflowing or altering margins.
 */
export function ScaledTemplatePreview({
  template,
  resumeData,
  accentColor,
  className = '',
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(Number((w / A4_WIDTH_PX).toFixed(4)));
      }
    };

    updateScale();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateScale);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const primary = accentColor || template?.palette?.primary || template?.colors?.primary || template?.accentColor || '#0f172a';
  const accent = accentColor || template?.palette?.accent || template?.palette?.secondary || template?.colors?.accent || template?.accentColor || '#3b82f6';
  const baseData = resumeData || INITIAL_RESUME_DATA;
  const previewPhoto = baseData?.personalInfo?.photo || getPreviewAvatarForTemplate(template);
  const effectivePreviewData = previewPhoto
    ? {
        ...baseData,
        personalInfo: {
          ...(baseData.personalInfo || {}),
          photo: previewPhoto,
        },
      }
    : baseData;
  const bg = template?.palette?.bg || template?.palette?.background || '#ffffff';

  const payload = resumeData
    ? { ...resumeData, preferences: {} }
    : { ...INITIAL_RESUME_DATA, preferences: {} };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[210/297] overflow-hidden bg-white select-none ${className}`}
    >
      <div
        style={{
          width: `${A4_WIDTH_PX}px`,
          minHeight: `${A4_HEIGHT_PX}px`,
          padding: isFullBleedTemplate(template?.id) ? '0' : '12mm 14mm',
          boxSizing: 'border-box',
          backgroundColor: bg,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <ResumeTemplate
          templateId={template?.id || 'ats-classic'}
          resumeData={effectivePreviewData}
          designOverrides={{
            layout: template?.layout || 'single-column',
            primaryColor: primary,
            accentColor: accent,
            backgroundColor: bg,
            textColor: template?.palette?.text || '#1e293b',
            fontFamily: template?.typography?.bodyFont || template?.fontFamily || 'Inter, sans-serif',
            headingFont: template?.typography?.headingFont || template?.fontFamily || 'Inter, sans-serif',
            dividerStyle: template?.dividerStyle || 'line',
            bulletStyle: template?.bulletStyle || 'disc',
          }}
        />
      </div>
    </div>
  );
}
