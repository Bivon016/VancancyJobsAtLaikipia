import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const HEADER_COLOR = [27, 67, 50];
const ACCENT_COLOR = [212, 160, 23];

export function generateListPdf({
  title,
  subtitle,
  columns,
  rows,
  filename,
}) {
  const doc = new jsPDF({ orientation: rows.length > 20 ? 'landscape' : 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Laikipia County Public Service Board', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('County Government of Laikipia — Recruitment Portal', 14, 20);

  doc.setTextColor(...HEADER_COLOR);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 40);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 48);
  }

  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.8);
  doc.line(14, 52, pageWidth - 14, 52);

  autoTable(doc, {
    startY: 58,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? '—'))),
    headStyles: {
      fillColor: HEADER_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated ${new Date().toLocaleString('en-KE')} — Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  const safeName = filename || `${title.replace(/\s+/g, '_')}.pdf`;
  return { doc, blob: doc.output('blob'), filename: safeName };
}

export function downloadPdf(pdfResult) {
  const url = URL.createObjectURL(pdfResult.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = pdfResult.filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function openPdfInNewTab(pdfResult) {
  const url = URL.createObjectURL(pdfResult.blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
