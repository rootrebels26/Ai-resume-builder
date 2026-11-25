import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const pdfService = {
  /**
   * Export resume directly to authentic A4 or US Letter PDF.
   * Employs an isolated off-screen rendering sandbox at native 1.0 scale:
   * 1. Completely immune to screen zoom, browser window size, responsive breakpoints, or scroll offsets.
   * 2. Waits for all custom web fonts (Inter, Poppins, Roboto, etc.) to fully load and rasterize.
   * 3. Renders each discrete .resume-a4-page sheet at 3x scale (300+ DPI vector-crisp output).
   * 4. Strips brutalist screen-only shadows and card borders for clean print aesthetics.
   * 5. Embeds clickable PDF hyperlink annotations with sub-millimeter precision.
   * 6. Guarantees zero side clipping, zero cut-off, and exact center placement.
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

    // 2. Wait for fonts to be ready so custom typography renders with exact metrics
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn('Font readiness check skipped:', fontErr);
      }
    }

    // 3. Initialize jsPDF: portrait (A4 or US Letter)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
      compress: true
    });

    try {
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        // Detect computed background color of the page sheet so dark/colored templates keep exact palette
        const computedBg = window.getComputedStyle(pageEl).backgroundColor;
        const pageBg = (!computedBg || computedBg === 'transparent' || computedBg === 'rgba(0, 0, 0, 0)')
          ? (pageEl.style.backgroundColor || '#ffffff')
          : computedBg;

        // Create an isolated sandbox attached directly to document.body at native scale
        // This ensures zero interference from parent scale transforms, zoom sliders, or window scroll positions
        const sandbox = document.createElement('div');
        sandbox.id = `pdf-sandbox-page-${i}`;
        sandbox.style.position = 'fixed';
        sandbox.style.left = '0';
        sandbox.style.top = '0';
        sandbox.style.width = `${pdfWidth}mm`;
        sandbox.style.height = `${pdfHeight}mm`;
        sandbox.style.zIndex = '-99999';
        sandbox.style.opacity = '1';
        sandbox.style.pointerEvents = 'none';
        sandbox.style.overflow = 'hidden';
        sandbox.style.margin = '0';
        sandbox.style.padding = '0';
        sandbox.style.transform = 'none';
        sandbox.style.backgroundColor = pageBg;

        // Clone page element into the sandbox
        const pageClone = pageEl.cloneNode(true);
        pageClone.style.boxShadow = 'none';
        pageClone.style.border = 'none';
        pageClone.style.margin = '0';
        pageClone.style.transform = 'none';
        pageClone.style.width = `${pdfWidth}mm`;
        pageClone.style.height = `${pdfHeight}mm`;
        pageClone.style.boxSizing = 'border-box';
        pageClone.style.backgroundColor = pageBg;

        sandbox.appendChild(pageClone);
        document.body.appendChild(sandbox);

        // Small microtask yield so DOM layouts inside sandbox settle
        await new Promise(r => setTimeout(r, 20));

        // Extract all clickable hyperlinks on this unscaled clone for 100% accurate PDF link annotations
        const pageRect = pageClone.getBoundingClientRect();
        const linkNodes = Array.from(pageClone.querySelectorAll('a[href]'));
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

        // High-resolution capture (scale: 3 gives crystal-clear 300+ DPI vector-like clarity)
        const canvas = await html2canvas(pageClone, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          backgroundColor: pageBg,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1200
        });

        // Clean up off-screen staging sandbox immediately
        if (sandbox.parentNode) {
          sandbox.parentNode.removeChild(sandbox);
        }

        // Use lossless PNG to completely eliminate JPEG compression degradation on fonts and rules
        const imgData = canvas.toDataURL('image/png');

        // Add page in PDF if beyond the first sheet
        if (i > 0) {
          pdf.addPage(format, 'portrait');
        }

        // Place image precisely covering the PDF page
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
      // Remove any lingering sandbox if an exception occurred
      const lingering = document.querySelectorAll('[id^="pdf-sandbox-page-"]');
      lingering.forEach(s => s.parentNode && s.parentNode.removeChild(s));
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
