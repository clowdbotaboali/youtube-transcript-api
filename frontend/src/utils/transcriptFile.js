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

