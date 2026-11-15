import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratedPdfResult {
  blob: Blob;
  file: File;
  fileName: string;
  pdf: jsPDF;
}

/**
 * Renders the receipt off-screen at standard A4 2x resolution and produces a PDF Blob and File.
 * Useful for downloading or directly passing to Web Share API (Bluetooth, Quick Share, AirDrop, etc.).
 */
export const generatePdfBlob = async (
  elementId: string,
  fileName: string = 'document.pdf',
  onStatusUpdate?: (status: string) => void
): Promise<GeneratedPdfResult | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  onStatusUpdate?.('Preparing high-resolution PDF...');

  // Clone element into a dedicated off-screen container at standard A4 width (794px = 210mm @ 96DPI)
  // This guarantees perfect capture even on small phone screens or when tab is hidden!
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'temp-pdf-clone';
  clone.style.position = 'fixed';
  clone.style.top = '-99999px';
  clone.style.left = '0';
  clone.style.width = '794px';
  clone.style.minHeight = '1123px';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.background = '#ffffff';
  clone.style.zIndex = '-99999';

  document.body.appendChild(clone);

  try {
    // Wait briefly for any images/fonts in clone to settle
    await new Promise((res) => setTimeout(res, 200));

    const canvas = await html2canvas(clone, {
      scale: 2, // 2x sharp resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    return { blob, file, fileName, pdf };
  } catch (error) {
    console.error('Failed to generate PDF via html2canvas:', error);
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
    return null;
  }
};

export const exportToPdf = async (
  elementId: string,
  fileName: string = 'document.pdf',
  onStatusUpdate?: (status: string) => void
): Promise<boolean> => {
  const result = await generatePdfBlob(elementId, fileName, onStatusUpdate);
  if (!result) {
    return false;
  }
  result.pdf.save(fileName);
  onStatusUpdate?.('PDF downloaded successfully!');
  return true;
};

export const triggerPrint = () => {
  window.print();
};
