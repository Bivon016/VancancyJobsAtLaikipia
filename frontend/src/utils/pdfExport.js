
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const HEADER_COLOR = [27, 67, 50];
const ACCENT_COLOR = [212, 160, 23];

export function generateListPdf({
  title,
  subtitle,
  columns,
  rows,
  filename,
}) {

  let orientation = "portrait";
  let format = "a4";

  if (columns.length > 6) {
    orientation = "landscape";
  }

  if (columns.length > 10) {
    format = "a3";
  }

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format,
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Laikipia County Public Service Board", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "County Government of Laikipia — Recruitment Portal",
    14,
    20
  );

  doc.setTextColor(...HEADER_COLOR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 14, 40);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 48);
  }

  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.8);
  doc.line(14, 52, pageWidth - 14, 52);

  // ==========================
  // Dynamic column widths
  // ==========================
const columnStyles = {};

columns.forEach((column, index) => {
  columnStyles[index] = {
    cellWidth: "auto",
  };
});

  // ==========================
  // Table
  // ==========================

  autoTable(doc, {

    startY: 58,

    head: [
      columns.map(c => c.header)
    ],

    body: rows.map(row =>
      columns.map(c => row[c.key] ?? "—")
    ),

    theme: "grid",

    margin: {
      left: 8,
      right: 8,
      bottom: 14
    },

    styles: {

      fontSize:
        columns.length > 12
          ? 6
          : columns.length > 8
          ? 6.8
          : 7.8,

      cellPadding: 2.5,

      overflow: "linebreak",

      valign: "middle",

      lineWidth: 0.15,

      minCellHeight: 8,

      textColor: 40

    },

    headStyles: {

      fillColor: HEADER_COLOR,

      textColor: [255,255,255],

      fontStyle: "bold",

      halign: "center",

      valign: "middle",

      fontSize: 8

    },

    alternateRowStyles: {

      fillColor: [248,249,250]

    },

    rowPageBreak: "avoid",

    showHead: "everyPage",

    columnStyles,

  });

  // ==========================
  // Footer
  // ==========================

  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {

    doc.setPage(i);

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
      `Generated ${new Date().toLocaleString("en-KE")} • Page ${i} of ${pageCount}`,
      8,
      doc.internal.pageSize.getHeight() - 6
    );

  }

  const safeName =
    filename ||
    `${title.replace(/\s+/g, "_")}.pdf`;

  return {

    doc,

    blob: doc.output("blob"),

    filename: safeName,

  };

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
