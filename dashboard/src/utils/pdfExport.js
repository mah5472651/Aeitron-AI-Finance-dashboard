import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportInvoiceToPDF(elementId, filename) {
  await document.fonts.ready;

  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();   // 210mm
  const pageH = pdf.internal.pageSize.getHeight();  // 297mm

  const imgData = canvas.toDataURL('image/png');
  const imgW = pageW;
  const imgH = (canvas.height * pageW) / canvas.width;

  if (imgH <= pageH) {
    // Content fits naturally on one page
    pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
  } else {
    // Scale down proportionally to force single page
    const ratio   = pageH / imgH;
    const scaledW = imgW * ratio;
    const xOffset = (pageW - scaledW) / 2; // center horizontally on the page
    pdf.addImage(imgData, 'PNG', xOffset, 0, scaledW, pageH);
  }

  pdf.save(filename);
}

export function buildPDFFilename(invoiceNumber, clientName) {
  const safeName = (clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  return `${invoiceNumber}_${safeName}.pdf`;
}
