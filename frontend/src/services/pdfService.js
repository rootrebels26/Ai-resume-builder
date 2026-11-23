import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const pdfService = {
  /**
   * Export resume directly to standard A4 PDF.
   * Renders each discrete .resume-a4-page sheet directly to an authentic A4 PDF page.
   * Completely eliminates blank pages, page-break dividers, and outer card shadows.
   */
  async exportToPDF(element, filename = 'resume.pdf') {
    if (!element) {
      throw new Error('Target element for PDF export was not found.');
    }

    // 1. Locate all discrete A4 page sheets
    let pageElements = Array.from(element.querySelectorAll('.resume-a4-page'));
    if (pageElements.length === 0) {
      if (element.classList && element.classList.contains('resume-a4-page')) {
        pageElements = [element];
      } else {
        pageElements = [element];
      }
    }

    // 2. Initialize jsPDF: A4 portrait (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
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

        // High-resolution capture (scale 2 gives crystal-clear 300 DPI text)
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Restore screen styles immediately
        pageEl.style.boxShadow = prevShadow;
        pageEl.style.border = prevBorder;

        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        // Add page in PDF if beyond the first sheet
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Place image precisely covering the 210mm x 297mm A4 page
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
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
