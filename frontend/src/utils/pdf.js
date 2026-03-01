import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function ensurePdfFilename(filename) {
  if (!filename) return `export-${Date.now()}.pdf`;
  return filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
}

function decodeHtmlEntities(value) {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

function cleanRichText(value) {
  const raw = String(value ?? '');
  const withBreaks = raw
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<\s*p[^>]*>/gi, '')
    .replace(/<\s*\/?li[^>]*>/gi, '\n- ')
    .replace(/<[^>]*>/g, '');
  return decodeHtmlEntities(withBreaks).replace(/\r\n/g, '\n').replace(/\u00A0/g, ' ').trim();
}

function detectRtl(text) {
  return /[\u0590-\u08FF]/.test(text);
}

function waitForFonts() {
  if (typeof document === 'undefined' || !document.fonts || !document.fonts.ready) return Promise.resolve();
  return document.fonts.ready.catch(() => undefined);
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

function legacyPdfExport({ filename, title, body, metadata }) {
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

function renderContainer({ title, metadata, body }) {
  const cleanedTitle = cleanRichText(title || 'Transcript AI Export');
  const cleanedMeta = (metadata || []).map((item) => cleanRichText(item)).filter(Boolean);
  const cleanedBody = cleanRichText(body || '');
  const fullText = [cleanedTitle, ...cleanedMeta, cleanedBody].join('\n');
  const rtl = detectRtl(fullText);

  const wrapper = document.createElement('div');
  wrapper.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-100000px';
  wrapper.style.top = '0';
  wrapper.style.width = '840px';
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#0f172a';
  wrapper.style.padding = '40px';
  wrapper.style.boxSizing = 'border-box';
  wrapper.style.fontFamily =
    '"Noto Sans Arabic","Noto Naskh Arabic","Noto Sans","Segoe UI","Arial Unicode MS","Tahoma","Arial","Microsoft YaHei","Meiryo","Malgun Gothic",sans-serif';
  wrapper.style.direction = rtl ? 'rtl' : 'ltr';
  wrapper.style.textAlign = rtl ? 'right' : 'left';
  wrapper.style.lineHeight = '1.7';
  wrapper.style.wordBreak = 'break-word';
  wrapper.style.unicodeBidi = 'plaintext';

  const titleEl = document.createElement('h1');
  titleEl.textContent = cleanedTitle;
  titleEl.style.fontSize = '28px';
  titleEl.style.margin = '0 0 14px';
  titleEl.style.fontWeight = '800';
  wrapper.appendChild(titleEl);

  if (cleanedMeta.length > 0) {
    const metaBox = document.createElement('div');
    metaBox.style.fontSize = '16px';
    metaBox.style.color = '#334155';
    metaBox.style.marginBottom = '14px';
    metaBox.style.whiteSpace = 'pre-wrap';
    metaBox.textContent = cleanedMeta.join('\n');
    wrapper.appendChild(metaBox);
  }

  const divider = document.createElement('div');
  divider.style.height = '1px';
  divider.style.background = '#cbd5e1';
  divider.style.margin = '0 0 16px';
  wrapper.appendChild(divider);

  const bodyEl = document.createElement('div');
  bodyEl.style.fontSize = '18px';
  bodyEl.style.whiteSpace = 'pre-wrap';
  bodyEl.style.unicodeBidi = 'plaintext';
  bodyEl.textContent = cleanedBody;
  wrapper.appendChild(bodyEl);

  document.body.appendChild(wrapper);
  return wrapper;
}

function canvasToMultipagePdf(canvas, filename) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 24;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const pagePixelHeight = Math.max(1, Math.floor((usableHeight * canvas.width) / usableWidth));

  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < canvas.height) {
    const sliceHeight = Math.min(pagePixelHeight, canvas.height - offsetY);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext('2d');
    if (!ctx) break;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    const renderHeight = (sliceHeight * usableWidth) / canvas.width;
    if (pageIndex > 0) doc.addPage();
    doc.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, usableWidth, renderHeight, undefined, 'FAST');

    offsetY += sliceHeight;
    pageIndex += 1;
  }

  doc.save(ensurePdfFilename(filename));
}

export async function downloadTextAsPdf({
  filename,
  title = 'Transcript AI Export',
  body = '',
  metadata = []
}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    legacyPdfExport({ filename, title, body, metadata });
    return;
  }

  try {
    await waitForFonts();
    const container = renderContainer({ title, metadata, body });
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: Math.max(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      logging: false
    });
    container.remove();
    canvasToMultipagePdf(canvas, filename);
  } catch (error) {
    console.error('PDF export fallback:', error);
    legacyPdfExport({ filename, title, body, metadata });
  }
}
