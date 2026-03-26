import { describe, it, expect } from 'vitest';
import { LANG, cleanText, tr, nextLang, langBadge } from '../utils/lang';

// ── LANG constants ──────────────────────────────────────────────────
describe('LANG', () => {
  it('has ar, en, fr keys', () => {
    expect(LANG.ar).toBe('ar');
    expect(LANG.en).toBe('en');
    expect(LANG.fr).toBe('fr');
  });
});

// ── cleanText ───────────────────────────────────────────────────────
describe('cleanText', () => {
  it('trims whitespace', () => {
    expect(cleanText('  hello  ')).toBe('hello');
  });

  it('returns empty string for null/undefined', () => {
    expect(cleanText(null)).toBe('');
    expect(cleanText(undefined)).toBe('');
  });

  it('returns fallback for empty input', () => {
    expect(cleanText('', 'fallback')).toBe('fallback');
  });

  it('passes through clean text unchanged', () => {
    expect(cleanText('Hello World')).toBe('Hello World');
  });

  it('passes through Arabic text', () => {
    expect(cleanText('مرحبا بالعالم')).toBe('مرحبا بالعالم');
  });

  it('handles numeric input', () => {
    expect(cleanText(123)).toBe('123');
  });
});

// ── tr (translate) ──────────────────────────────────────────────────
describe('tr', () => {
  it('returns Arabic text for ar lang', () => {
    expect(tr(LANG.ar, 'عربي', 'English', 'Français')).toBe('عربي');
  });

  it('returns English text for en lang', () => {
    expect(tr(LANG.en, 'عربي', 'English', 'Français')).toBe('English');
  });

  it('returns French text for fr lang', () => {
    expect(tr(LANG.fr, 'عربي', 'English', 'Français')).toBe('Français');
  });

  it('falls back to English for ar lang when Arabic is empty', () => {
    expect(tr(LANG.ar, '', 'English')).toBe('English');
  });

  it('falls back to Arabic for en lang when English is empty', () => {
    expect(tr(LANG.en, 'عربي', '')).toBe('عربي');
  });

  it('uses French lookup for missing French translations', () => {
    const result = tr(LANG.fr, 'عربي', 'Pricing');
    // Should try to find French translation from FR_MAP
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── nextLang ────────────────────────────────────────────────────────
describe('nextLang', () => {
  it('cycles ar -> en', () => {
    expect(nextLang(LANG.ar)).toBe(LANG.en);
  });

  it('cycles en -> fr', () => {
    expect(nextLang(LANG.en)).toBe(LANG.fr);
  });

  it('cycles fr -> ar', () => {
    expect(nextLang(LANG.fr)).toBe(LANG.ar);
  });

  it('returns en for unknown lang', () => {
    expect(nextLang('xx')).toBe(LANG.en);
  });
});

// ── langBadge ───────────────────────────────────────────────────────
describe('langBadge', () => {
  it('returns AR for Arabic', () => {
    expect(langBadge(LANG.ar)).toBe('AR');
  });

  it('returns EN for English', () => {
    expect(langBadge(LANG.en)).toBe('EN');
  });

  it('returns FR for French', () => {
    expect(langBadge(LANG.fr)).toBe('FR');
  });

  it('returns EN for unknown', () => {
    expect(langBadge('xx')).toBe('EN');
  });
});
