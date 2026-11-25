import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const pdfService = {
  /**
   * Export resume directly to standard A4 PDF.
   * Renders each discrete .resume-a4-page sheet directly to an authentic A4 PDF page.
   * Completely eliminates blank pages, page-break dividers, and outer card shadows.
   */
  async exportToPDF(element, filename = 'resume.pdf', options = {}) {
    if (!element) {
      throw new Error('Target element for PDF export was not found.');
    }

    const format = options.format || 'a4';
    const pdfWidth = format === 'letter' ? 215.9 : 210;
    const pdfHeight = format === 'letter' ? 279.4 : 297;

    // 1. Locate all discrete A4/Letter page sheets
    let pageElements = Array.from(element.querySelectorAll('.resume-a4-page'));
    if (pageElements.length === 0) {
      if (element.classList && element.classList.contains('resume-a4-page')) {
        pageElements = [element];
      } else {
        pageElements = [element];
      }
    }

    // 2. Initialize jsPDF: portrait (A4 or US Letter)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
      compress: true
    });

    try {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        // Temporarily strip screen-only brutalist shadow and card border for pure print aesthetic
        const prevShadow = pageEl.style.boxShadow;
        const prevBorder = pageEl.style.border;
        pageEl.style.boxShadow = 'none';
        pageEl.style.border = 'none';

        // Extract all clickable hyperlinks on this page for active PDF link annotations
        const pageRect = pageEl.getBoundingClientRect();
        const linkNodes = Array.from(pageEl.querySelectorAll('a[href]'));
        const linkAnnotations = linkNodes.map(link => {
          const rect = link.getBoundingClientRect();
          let href = link.getAttribute('href') || link.href;
          if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null;
          if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) {
            href = 'https://' + href;
          }
          if (rect.width <= 0 || rect.height <= 0 || pageRect.width <= 0 || pageRect.height <= 0) return null;
          
          return {
            href,
            x: ((rect.left - pageRect.left) / pageRect.width) * pdfWidth,
            y: ((rect.top - pageRect.top) / pageRect.height) * pdfHeight,
            w: (rect.width / pageRect.width) * pdfWidth,
            h: (rect.height / pageRect.height) * pdfHeight
          };
        }).filter(Boolean);

        // Detect computed background color of the page sheet so dark/colored templates keep exact palette
        const computedBg = window.getComputedStyle(pageEl).backgroundColor;
        const pageBg = (!computedBg || computedBg === 'transparent' || computedBg === 'rgba(0, 0, 0, 0)')
          ? '#ffffff'
          : computedBg;

        // High-resolution capture (scale 2.5 gives crystal-clear 300+ DPI vector-like clarity)
        const canvas = await html2canvas(pageEl, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          backgroundColor: pageBg
        });

        // Restore screen styles immediately
        pageEl.style.boxShadow = prevShadow;
        pageEl.style.border = prevBorder;

        // Use lossless PNG to completely eliminate JPEG compression degradation on fonts and rules
        const imgData = canvas.toDataURL('image/png');

        // Add page in PDF if beyond the first sheet
        if (i > 0) {
          pdf.addPage(format, 'portrait');
        }

        // Place image precisely covering the page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        // Overlay active PDF link annotations so GitHub, LinkedIn, portfolio, and project links are 100% clickable
        linkAnnotations.forEach(link => {
          try {
            pdf.link(link.x, link.y, link.w, link.h, { url: link.href });
          } catch (linkErr) {
            console.warn('Could not register PDF link annotation:', link.href, linkErr);
          }
        });
      }

      pdf.save(filename);
      return true;
    } catch (err) {
      console.error('High-fidelity PDF export failed, falling back to window.print():', err);
      window.print();
      return false;
    }
  },

  /**
   * Trigger native browser print which uses @media print stylesheet
   */
  print() {
    window.print();
  }
};
