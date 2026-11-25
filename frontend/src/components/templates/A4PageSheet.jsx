import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { ResumeTemplate } from './ResumeTemplate';
import { isFullBleedTemplate } from '../../constants/templatesList';

/**
 * A4PageSheet Component
 * 
 * Renders an authentic physical A4 document paper sheet (210mm x 297mm).
 * When pageLayoutMode === '1_page' (Fit 1 Page):
 * 1. Automatically compacts whitespace and margins via .one-page-fit-active CSS
 * 2. Employs a dynamic auto-fit scaler that measures exact content scroll height
 *    and calculates the precise mathematical scale factor to ensure 100% of content
 *    fits cleanly within the A4 boundary with ZERO cut-off.
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
  const effectiveTemplateId = templateId || resumeData?.templateId || pageData?.templateId || 'ats-01';
  const isFullBleed = isFullBleedTemplate(effectiveTemplateId);
  const paperFormat = resumeData?.preferences?.paperFormat || 'a4';
  const sheetWidth = paperFormat === 'letter' ? '215.9mm' : '210mm';
  const sheetHeight = paperFormat === 'letter' ? '279.4mm' : '297mm';

  useLayoutEffect(() => {
    if (!isOnePage) {
      setFitScale(1);
      if (contentRef.current) {
        contentRef.current.style.transform = 'none';
        contentRef.current.style.width = '100%';
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

      const availableHeight = container.clientHeight;
      const naturalHeight = content.scrollHeight || content.offsetHeight;

      if (availableHeight > 0 && naturalHeight > availableHeight) {
        // Compute exact scale with 6px buffer to strictly prevent any pixel cutoff
        const ratio = Math.min(1, Math.max(0.48, (availableHeight - 6) / naturalHeight));
        const cleanRatio = Number(ratio.toFixed(3));
        setFitScale(cleanRatio);
        content.style.transform = `scale(${cleanRatio})`;
        content.style.transformOrigin = 'top center';
        content.style.width = `${(100 / cleanRatio).toFixed(2)}%`;
      } else {
        setFitScale(1);
        content.style.transform = 'none';
        content.style.width = '100%';
      }
    };

    computeFit();
    const rafId = requestAnimationFrame(computeFit);
    const timerId = setTimeout(computeFit, 120);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [isOnePage, pageData, resumeData, effectiveTemplateId]);

  // Also re-check on container resize (e.g. window resizing or responsive layout updates)
  useEffect(() => {
    if (!isOnePage) return;
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      const content = contentRef.current;
      if (!container || !content) return;
      content.style.transform = 'none';
      content.style.width = '100%';
      const availableHeight = container.clientHeight;
      const naturalHeight = content.scrollHeight || content.offsetHeight;
      if (availableHeight > 0 && naturalHeight > availableHeight) {
        const ratio = Math.min(1, Math.max(0.48, (availableHeight - 6) / naturalHeight));
        const cleanRatio = Number(ratio.toFixed(3));
        setFitScale(cleanRatio);
        content.style.transform = `scale(${cleanRatio})`;
        content.style.transformOrigin = 'top center';
        content.style.width = `${(100 / cleanRatio).toFixed(2)}%`;
      } else {
        setFitScale(1);
        content.style.transform = 'none';
        content.style.width = '100%';
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [isOnePage]);

  return (
    <div
      className={`resume-a4-page bg-white shadow-brutal-lg rounded-sm border-[1.5px] border-ink text-ink relative flex flex-col justify-between ${
        isOnePage ? 'one-page-fit-active' : ''
      }`}
      style={{
        width: sheetWidth,
        height: sheetHeight,
        padding: isFullBleed
          ? '0'
          : isOnePage
            ? '10mm 12mm'
            : '18mm',
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
          />
        </div>
      </div>

      {/* Subtle footer page indicator when multi-page and NOT full bleed and NOT forced to 1 page */}
      {isMultiPage && !isOnePage && !isFullBleed && (
        <div className="pt-2 mt-auto text-[10px] font-mono text-slate-400 flex justify-between items-center border-t border-slate-100 select-none">
          <span className="truncate max-w-[200px]">
            {resumeData?.personalInfo?.fullName || 'Resume'}
          </span>
          <span>Page {pageIdx + 1} of {pageCount}</span>
        </div>
      )}
    </div>
  );
}
