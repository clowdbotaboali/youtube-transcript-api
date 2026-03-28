import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

function normalizeNewlines(value) {
  return String(value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function collapseTranscriptSpacing(value) {
  return normalizeNewlines(value)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isTimestampLine(line) {
  const normalized = String(line || '').trim();
  if (!normalized) return false;
  return /^\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3}\s*-->\s*\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3}(?:\s+.*)?$/i.test(normalized);
}

function isSrtIndexLine(line) {
  return /^\d+$/.test(String(line || '').trim());
}

function isVttHeaderLine(line) {
  return /^(WEBVTT|Kind:|Language:)/i.test(String(line || '').trim());
}

function stripTranscriptMarkup(line) {
  return String(line || '')
    .replace(/<\d{2}:\d{2}(?::\d{2})?[.,]\d{1,3}>/g, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/\{\\an\d\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTimedTranscript(content) {
  const lines = normalizeNewlines(content).split('\n');
  const cleaned = [];
  let inNoteBlock = false;

  for (const rawLine of lines) {
    const line = String(rawLine || '');
    const trimmed = line.trim();

    if (!trimmed) {
      if (inNoteBlock) inNoteBlock = false;
      if (cleaned.length > 0 && cleaned[cleaned.length - 1] !== '') {
        cleaned.push('');
      }
      continue;
    }

    if (/^NOTE(?:\s|$)/i.test(trimmed)) {
      inNoteBlock = true;
      continue;
    }

    if (inNoteBlock) {
      continue;
    }

    if (isVttHeaderLine(trimmed) || isTimestampLine(trimmed) || isSrtIndexLine(trimmed)) {
      continue;
    }

    const textLine = stripTranscriptMarkup(trimmed);
    if (!textLine) continue;
    cleaned.push(textLine);
  }

  return collapseTranscriptSpacing(cleaned.join('\n'));
}

export function inferTranscriptFileKind(fileName = '', fileType = '') {
  const normalizedName = String(fileName || '').trim().toLowerCase();
  const normalizedType = String(fileType || '').trim().toLowerCase();

  if (normalizedName.endsWith('.srt') || normalizedType.includes('subrip')) return 'srt';
  if (normalizedName.endsWith('.vtt') || normalizedType.includes('vtt')) return 'vtt';
  if (normalizedName.endsWith('.pdf') || normalizedType.includes('pdf')) return 'pdf';
  if (
    normalizedName.endsWith('.docx') ||
    normalizedType.includes('officedocument.wordprocessingml.document')
  ) {
    return 'docx';
  }
  return 'txt';
}

export function extractTranscriptTitleFromFilename(fileName = '') {
  const normalized = String(fileName || '').trim();
  if (!normalized) return '';
  const withoutExt = normalized.replace(/\.[^.]+$/, '');
  return withoutExt.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseTranscriptUploadContent(content, { fileName = '', fileType = '' } = {}) {
  const kind = inferTranscriptFileKind(fileName, fileType);
  const raw = normalizeNewlines(content).trim();
  const transcript = kind === 'srt' || kind === 'vtt' ? parseTimedTranscript(raw) : collapseTranscriptSpacing(raw);

  return {
    kind,
    title: extractTranscriptTitleFromFilename(fileName),
    transcript
  };
}

function readPdfTextItems(items = []) {
  const lineMap = new Map();

  for (const item of items) {
    if (!item || typeof item.str !== 'string') continue;
    const text = item.str.trim();
    if (!text) continue;

    const transform = Array.isArray(item.transform) ? item.transform : [];
    const y = Math.round(Number(transform[5] || 0));
    const x = Number(transform[4] || 0);
    const bucket = lineMap.get(y) || [];
    bucket.push({ x, text });
    lineMap.set(y, bucket);
  }

  const lines = Array.from(lineMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([, entries]) =>
      entries
        .sort((a, b) => a.x - b.x)
        .map((entry) => entry.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);

  return collapseTranscriptSpacing(lines.join('\n'));
}

let pdfJsPromise = null;

async function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((module) => {
      const pdfjs = module?.default || module;
      if (pdfjs?.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      }
      return pdfjs;
    });
  }
  return pdfJsPromise;
}

async function parsePdfUploadFile(file) {
  const pdfjs = await loadPdfJs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false
  });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = readPdfTextItems(Array.isArray(content?.items) ? content.items : []);
    if (pageText) {
      pages.push(pageText);
    }
  }

  return collapseTranscriptSpacing(pages.join('\n\n'));
}

async function parseDocxUploadFile(file) {
  const mammothModule = await import('mammoth/mammoth.browser.js');
  const mammoth = mammothModule?.default || mammothModule;
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer()
  });
  return collapseTranscriptSpacing(result?.value || '');
}

export async function parseTranscriptUploadFile(file) {
  const fileName = String(file?.name || '').trim();
  const fileType = String(file?.type || '').trim();
  const kind = inferTranscriptFileKind(fileName, fileType);
  const title = extractTranscriptTitleFromFilename(fileName);

  if (!file) {
    return { kind: 'txt', title: '', transcript: '' };
  }

  if (kind === 'pdf') {
    return {
      kind,
      title,
      transcript: await parsePdfUploadFile(file)
    };
  }

  if (kind === 'docx') {
    return {
      kind,
      title,
      transcript: await parseDocxUploadFile(file)
    };
  }

  return parseTranscriptUploadContent(await file.text(), { fileName, fileType });
}
