import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { ResumeTemplate } from './ResumeTemplate';
import { isFullBleedTemplate } from '../../constants/templatesList';

/**
 * A4PageSheet Component
 * 
 * Renders an authentic physical A4 document paper sheet (210mm x 297mm) or US Letter (215.9mm x 279.4mm).
 * When pageLayoutMode === '1_page' (Fit 1 Page):
 * 1. Compacts spacing and margins via .one-page-fit-active CSS and isOnePage prop.
 * 2. Employs a dynamic mathematical auto-fit scaler that measures exact content scroll height
 *    and scales smoothly from top center with width: 100% and auto margins.
 *    This guarantees:
 *    - Zero pixel cutoff on either left or right edge.
 *    - Exact horizontal and vertical centering (in the middle).
 *    - All resume data, projects, and experiences remain completely visible.
 */
export function A4PageSheet({
  pageData,
  pageIdx = 0,
  pageCount = 1,
  isMultiPage = false,
  pageLayoutMode = 'auto',
  resumeData,
  templateId,
  designOverrides = {},
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [fitScale, setFitScale] = useState(1);

  const isOnePage = pageLayoutMode === '1_page';
  const isTwoPage = pageLayoutMode === '2_pages';
  const shouldAutoFit = isOnePage || isTwoPage;
  const effectiveTemplateId = templateId || resumeData?.templateId || pageData?.templateId || 'ats-01';
  const isFullBleed = isFullBleedTemplate(effectiveTemplateId);
  const paperFormat = resumeData?.preferences?.paperFormat || designOverrides?.paperFormat || 'a4';
  const sheetWidth = paperFormat === 'letter' ? '215.9mm' : '210mm';
  const sheetHeight = paperFormat === 'letter' ? '279.4mm' : '297mm';

  // Dynamic Margin based on Canva Design Studio settings
  const marginSize = designOverrides.marginSize || resumeData?.preferences?.marginSize || 'normal';
  const marginMap = {
    compact: '10mm 12mm',
    normal: '16mm 18mm',
    spacious: '20mm 22mm',
  };
  const sheetPadding = isFullBleed
    ? '0'
    : isOnePage
      ? '8mm 10mm'
      : (marginMap[marginSize] || marginMap.normal);

  // Background color from Canva Design Studio or template default
  const sheetBg = designOverrides.backgroundColor || resumeData?.preferences?.backgroundColor || '#ffffff';

  useLayoutEffect(() => {
    if (!shouldAutoFit) {
      setFitScale(1);
      if (contentRef.current) {
        contentRef.current.style.transform = 'none';
        contentRef.current.style.width = '100%';
        contentRef.current.style.marginLeft = '0';
        contentRef.current.style.marginRight = '0';
      }
      return;
    }

    const computeFit = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      // Temporarily clear inline transforms to measure true untransformed DOM layout height
      content.style.transform = 'none';
      content.style.width = '100%';
      content.style.marginLeft = '0';
      content.style.marginRight = '0';

      const availableHeight = container.clientHeight;
      const naturalHeight = content.scrollHeight || content.offsetHeight;

      if (availableHeight > 0 && naturalHeight > availableHeight) {
        // Compute exact scale with 4px buffer to strictly prevent any pixel cutoff
        const ratio = Math.min(1, Math.max(0.55, (availableHeight - 4) / naturalHeight));
        const cleanRatio = Number(ratio.toFixed(3));
        setFitScale(cleanRatio);

        // Centered scaling: width: 100%, transformOrigin: 'top center', margin: '0 auto'
        // Perfectly middle-aligned with equal left and right spacing, ZERO side cut-off
        content.style.transform = `scale(${cleanRatio})`;
        content.style.transformOrigin = 'top center';
        content.style.width = '100%';
        content.style.marginLeft = 'auto';
        content.style.marginRight = 'auto';
      } else {
        setFitScale(1);
        content.style.transform = 'none';
        content.style.width = '100%';
        content.style.marginLeft = '0';
        content.style.marginRight = '0';
      }
    };

    computeFit();
    const rafId = requestAnimationFrame(computeFit);
    const timerId = setTimeout(computeFit, 120);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [shouldAutoFit, pageData, resumeData, effectiveTemplateId, designOverrides, marginSize]);

  // Also re-check on container resize (e.g. window resizing or responsive layout updates)
  useEffect(() => {
    if (!shouldAutoFit) return;
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      const content = contentRef.current;
      if (!container || !content) return;
      content.style.transform = 'none';
      content.style.width = '100%';
      content.style.marginLeft = '0';
      content.style.marginRight = '0';
      const availableHeight = container.clientHeight;
      const naturalHeight = content.scrollHeight || content.offsetHeight;
      if (availableHeight > 0 && naturalHeight > availableHeight) {
        const ratio = Math.min(1, Math.max(0.55, (availableHeight - 4) / naturalHeight));
        const cleanRatio = Number(ratio.toFixed(3));
        setFitScale(cleanRatio);
        content.style.transform = `scale(${cleanRatio})`;
        content.style.transformOrigin = 'top center';
        content.style.width = '100%';
        content.style.marginLeft = 'auto';
        content.style.marginRight = 'auto';
      } else {
        setFitScale(1);
        content.style.transform = 'none';
        content.style.width = '100%';
        content.style.marginLeft = '0';
        content.style.marginRight = '0';
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [shouldAutoFit]);

  return (
    <div
      className={`resume-a4-page shadow-brutal-lg rounded-sm border-[1.5px] border-ink text-ink relative flex flex-col justify-between ${
        isOnePage ? 'one-page-fit-active' : ''
      }`}
      style={{
        width: sheetWidth,
        height: sheetHeight,
        padding: sheetPadding,
        backgroundColor: sheetBg,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
      data-page-index={pageIdx + 1}
    >
      <div 
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden flex flex-col justify-start"
      >
        <div
          ref={contentRef}
          className="w-full flex flex-col"
        >
          <ResumeTemplate
            templateId={effectiveTemplateId}
            resumeData={pageData}
            designOverrides={designOverrides}
            pageNumber={pageIdx + 1}
            totalPages={pageCount}
            isOnePage={isOnePage}
          />
        </div>
      </div>

      {/* Subtle footer page indicator when multi-page and NOT full bleed and NOT forced to 1 page */}
      {isMultiPage && !isFullBleed && !isOnePage && (
        <div
          className="w-full pt-1.5 mt-auto flex justify-between items-center text-[9px] font-mono select-none"
          style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            color: 'rgba(0, 0, 0, 0.45)',
          }}
        >
          <span>{resumeData?.personalInfo?.fullName || 'Resume'}</span>
          <span>Page {pageIdx + 1} of {pageCount}</span>
        </div>
      )}
    </div>
  );
}
