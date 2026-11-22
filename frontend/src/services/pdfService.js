import html2pdf from 'html2pdf.js';

export const pdfService = {
  /**
   * Export the target HTML element directly to A4 PDF using html2pdf.js
   */
  async exportToPDF(element, filename = 'resume.pdf') {
    if (!element) {
      throw new Error('Target element for PDF export was not found.');
    }

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      return true;
    } catch (err) {
      console.error('html2pdf generation failed, falling back to browser print:', err);
      // Fallback to high-fidelity native browser print
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
