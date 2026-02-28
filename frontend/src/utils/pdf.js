import { jsPDF } from 'jspdf';

function ensurePdfFilename(filename) {
  if (!filename) return `export-${Date.now()}.pdf`;
  return filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
}

function writeLinesWithPaging(doc, lines, startY, margin, lineHeight) {
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = startY;

  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  return y;
}

export function downloadTextAsPdf({
  filename,
  title = 'Transcript AI Export',
  body = '',
  metadata = []
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  let cursorY = writeLinesWithPaging(doc, doc.splitTextToSize(title, contentWidth), margin, margin, 20);

  if (metadata.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    cursorY += 6;
    const metaLines = metadata
      .filter(Boolean)
      .flatMap((line) => doc.splitTextToSize(String(line), contentWidth));
    cursorY = writeLinesWithPaging(doc, metaLines, cursorY, margin, 15);
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, cursorY + 8, margin + contentWidth, cursorY + 8);
  cursorY += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const contentLines = doc.splitTextToSize(String(body || ''), contentWidth);
  writeLinesWithPaging(doc, contentLines, cursorY, margin, 16);

  doc.save(ensurePdfFilename(filename));
}
