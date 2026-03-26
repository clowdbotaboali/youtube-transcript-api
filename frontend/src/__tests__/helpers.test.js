import { describe, it, expect } from 'vitest';
import {
  normalizeApiUrl,
  isValidApiUrl,
  normalizePathname,
  normalizeUiMessage,
  isLikelyArabic,
  isLikelyEnglish,
  parseInstructionLines,
  buildFallbackVideoBrief,
  paymentRequestStatusLabel,
  paymentRequestStatusClass
} from '../helpers';

// ── normalizeApiUrl ─────────────────────────────────────────────────
describe('normalizeApiUrl', () => {
  it('trims whitespace', () => {
    expect(normalizeApiUrl('  http://localhost:5000  ')).toBe('http://localhost:5000');
  });
  it('removes trailing slashes', () => {
    expect(normalizeApiUrl('http://localhost:5000///')).toBe('http://localhost:5000');
  });
  it('returns empty string for null/undefined', () => {
    expect(normalizeApiUrl(null)).toBe('');
    expect(normalizeApiUrl(undefined)).toBe('');
  });
});

// ── isValidApiUrl ───────────────────────────────────────────────────
describe('isValidApiUrl', () => {
  it('accepts http URLs', () => {
    expect(isValidApiUrl('http://localhost:5000')).toBe(true);
  });
  it('accepts https URLs', () => {
    expect(isValidApiUrl('https://transcripta.tech')).toBe(true);
  });
  it('rejects ftp URLs', () => {
    expect(isValidApiUrl('ftp://example.com')).toBe(false);
  });
  it('rejects random strings', () => {
    expect(isValidApiUrl('not-a-url')).toBe(false);
  });
  it('rejects empty string', () => {
    expect(isValidApiUrl('')).toBe(false);
  });
});

// ── normalizePathname ───────────────────────────────────────────────
describe('normalizePathname', () => {
  it('returns / for empty input', () => {
    expect(normalizePathname('')).toBe('/');
    expect(normalizePathname(null)).toBe('/');
  });
  it('returns / for root', () => {
    expect(normalizePathname('/')).toBe('/');
  });
  it('removes trailing slashes', () => {
    expect(normalizePathname('/pricing/')).toBe('/pricing');
  });
  it('preserves valid paths', () => {
    expect(normalizePathname('/terms')).toBe('/terms');
    expect(normalizePathname('/privacy-policy')).toBe('/privacy-policy');
  });
  it('handles transcripta.tech absolute URLs', () => {
    expect(normalizePathname('https://transcripta.tech/pricing')).toBe('/pricing');
    expect(normalizePathname('https://www.transcripta.tech/terms')).toBe('/terms');
  });
  it('returns / for non-transcripta.tech absolute URLs', () => {
    expect(normalizePathname('https://google.com/search')).toBe('/');
  });
  it('adds leading slash if missing', () => {
    expect(normalizePathname('pricing')).toBe('/pricing');
  });
});

// ── normalizeUiMessage ──────────────────────────────────────────────
describe('normalizeUiMessage', () => {
  it('returns string as-is (trimmed)', () => {
    expect(normalizeUiMessage('hello')).toBe('hello');
  });
  it('converts number to string', () => {
    expect(normalizeUiMessage(42)).toBe('42');
  });
  it('converts boolean to string', () => {
    expect(normalizeUiMessage(true)).toBe('true');
  });
  it('extracts .message from object', () => {
    expect(normalizeUiMessage({ message: 'error occurred' })).toBe('error occurred');
  });
  it('returns empty string for null/undefined', () => {
    expect(normalizeUiMessage(null)).toBe('');
    expect(normalizeUiMessage(undefined)).toBe('');
  });
});

// ── isLikelyArabic / isLikelyEnglish ────────────────────────────────
describe('isLikelyArabic', () => {
  it('detects Arabic text', () => {
    expect(isLikelyArabic('مرحبا بالعالم')).toBe(true);
  });
  it('returns false for English text', () => {
    expect(isLikelyArabic('Hello World')).toBe(false);
  });
  it('returns false for empty', () => {
    expect(isLikelyArabic('')).toBe(false);
  });
});

describe('isLikelyEnglish', () => {
  it('detects English text', () => {
    expect(isLikelyEnglish('Hello World')).toBe(true);
  });
  it('returns false for Arabic text', () => {
    expect(isLikelyEnglish('مرحبا')).toBe(false);
  });
  it('returns false for numbers only', () => {
    expect(isLikelyEnglish('12345')).toBe(false);
  });
});

// ── parseInstructionLines ───────────────────────────────────────────
describe('parseInstructionLines', () => {
  it('parses numbered instruction lines', () => {
    const input = '1. First instruction here\n2. Second instruction here\n3. Third instruction here';
    const result = parseInstructionLines(input);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('First instruction here');
  });
  it('filters out short lines (< 8 chars)', () => {
    const input = '1. Hi\n2. This is a valid long instruction';
    const result = parseInstructionLines(input);
    expect(result.length).toBe(1);
  });
  it('limits to 12 lines max', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `${i + 1}. This is instruction number ${i + 1}`).join('\n');
    const result = parseInstructionLines(lines);
    expect(result.length).toBe(12);
  });
  it('returns empty array for empty input', () => {
    expect(parseInstructionLines('')).toEqual([]);
  });
});

// ── buildFallbackVideoBrief ─────────────────────────────────────────
describe('buildFallbackVideoBrief', () => {
  it('returns Arabic brief for ar lang', () => {
    const result = buildFallbackVideoBrief('My Cool Video', 'ar');
    expect(result).toContain('My Cool Video');
    expect(result).toContain('ملخص سريع');
  });
  it('returns English brief for en lang', () => {
    const result = buildFallbackVideoBrief('My Cool Video', 'en');
    expect(result).toBe('Quick brief: My Cool Video');
  });
  it('returns French brief for fr lang', () => {
    const result = buildFallbackVideoBrief('My Cool Video', 'fr');
    expect(result).toContain('Resume rapide');
  });
  it('truncates long titles at 90 chars', () => {
    const longTitle = 'A'.repeat(100);
    const result = buildFallbackVideoBrief(longTitle, 'en');
    expect(result).toContain('...');
  });
  it('returns empty string for empty title', () => {
    expect(buildFallbackVideoBrief('', 'en')).toBe('');
  });
});

// ── paymentRequestStatusLabel ───────────────────────────────────────
describe('paymentRequestStatusLabel', () => {
  it('returns Approved for approved status in English', () => {
    expect(paymentRequestStatusLabel('approved', 'en')).toBe('Approved');
  });
  it('returns Rejected for rejected status', () => {
    expect(paymentRequestStatusLabel('rejected', 'en')).toBe('Rejected');
  });
  it('returns Pending review for unknown status', () => {
    expect(paymentRequestStatusLabel('unknown', 'en')).toBe('Pending review');
  });
  it('handles case-insensitive input', () => {
    expect(paymentRequestStatusLabel('APPROVED', 'en')).toBe('Approved');
  });
});

// ── paymentRequestStatusClass ───────────────────────────────────────
describe('paymentRequestStatusClass', () => {
  it('returns green classes for approved', () => {
    expect(paymentRequestStatusClass('approved')).toContain('emerald');
  });
  it('returns red classes for rejected', () => {
    expect(paymentRequestStatusClass('rejected')).toContain('red');
  });
  it('returns amber classes for pending/unknown', () => {
    expect(paymentRequestStatusClass('pending')).toContain('amber');
  });
  it('returns slate classes for cancelled', () => {
    expect(paymentRequestStatusClass('cancelled')).toContain('slate');
  });
});
