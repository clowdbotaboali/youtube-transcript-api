import { cleanText } from './lang';

function stringifyJsonValue(value, depth = 0) {
  if (depth > 4 || value === null || value === undefined) return [];

  if (typeof value === 'string') {
    const normalized = cleanText(value).trim();
    return normalized ? [normalized] : [];
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => stringifyJsonValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    const lines = [];
    for (const [key, val] of Object.entries(value)) {
      const inner = stringifyJsonValue(val, depth + 1);
      if (inner.length === 0) continue;
      const heading = key
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      lines.push(`## ${heading}`);
      lines.push(...inner.map((item) => `- ${item}`));
    }
    return lines;
  }

  return [];
}

function tryNormalizeJson(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (!(text.startsWith('{') || text.startsWith('['))) return text;

  try {
    const parsed = JSON.parse(text);
    const lines = stringifyJsonValue(parsed);
    return lines.length > 0 ? lines.join('\n') : text;
  } catch {
    return text;
  }
}

export function normalizeAiText(raw) {
  let text = cleanText(raw || '');
  text = text.replace(/```(?:json|markdown|md|html|text)?/gi, '');
  text = text.replace(/```/g, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '- ');
  text = text.replace(/<\/?[^>]+>/g, '');
  text = text.replace(/\\n/g, '\n');
  text = tryNormalizeJson(text);
  text = text.replace(/[ \t]+\n/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

export function buildAiBlocks(raw) {
  const text = normalizeAiText(raw);
  if (!text) return [];

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];
  let list = null;

  const flushList = () => {
    if (!list || list.items.length === 0) return;
    blocks.push(list);
    list = null;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    const numberedMatch = line.match(/^(\d+)[.)-]\s+(.+)$/);
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    const isHeadingLine = /:$/.test(line) && line.length <= 120 && !numberedMatch && !bulletMatch;

    if (headingMatch || isHeadingLine) {
      flushList();
      blocks.push({ type: 'heading', text: (headingMatch ? headingMatch[1] : line.replace(/:$/, '')).trim() });
      continue;
    }

    if (numberedMatch) {
      const value = numberedMatch[2].trim();
      if (!list || list.type !== 'ordered') {
        flushList();
        list = { type: 'ordered', items: [] };
      }
      if (value) list.items.push(value);
      continue;
    }

    if (bulletMatch) {
      const value = bulletMatch[1].trim();
      if (!list || list.type !== 'unordered') {
        flushList();
        list = { type: 'unordered', items: [] };
      }
      if (value) list.items.push(value);
      continue;
    }

    flushList();
    blocks.push({ type: 'paragraph', text: line });
  }

  flushList();
  return blocks;
}

