import { describe, it, expect } from 'vitest';
import {
  normalizeOutputLanguage,
  getOutputLanguageLabel,
  DEFAULT_OUTPUT_LANGUAGE,
  OUTPUT_LANGUAGE_OPTIONS
} from '../utils/outputLanguage';

// ── normalizeOutputLanguage ─────────────────────────────────────────
describe('normalizeOutputLanguage', () => {
  it('returns valid language codes unchanged', () => {
    expect(normalizeOutputLanguage('ar')).toBe('ar');
    expect(normalizeOutputLanguage('en')).toBe('en');
    expect(normalizeOutputLanguage('fr')).toBe('fr');
    expect(normalizeOutputLanguage('es')).toBe('es');
    expect(normalizeOutputLanguage('de')).toBe('de');
    expect(normalizeOutputLanguage('zh')).toBe('zh');
    expect(normalizeOutputLanguage('ja')).toBe('ja');
    expect(normalizeOutputLanguage('ko')).toBe('ko');
  });

  it('handles uppercase input', () => {
    expect(normalizeOutputLanguage('AR')).toBe('ar');
    expect(normalizeOutputLanguage('EN')).toBe('en');
  });

  it('returns default for invalid codes', () => {
    expect(normalizeOutputLanguage('xx')).toBe(DEFAULT_OUTPUT_LANGUAGE);
    expect(normalizeOutputLanguage('invalid')).toBe(DEFAULT_OUTPUT_LANGUAGE);
  });

  it('returns default for empty/null input', () => {
    expect(normalizeOutputLanguage('')).toBe(DEFAULT_OUTPUT_LANGUAGE);
    expect(normalizeOutputLanguage(null)).toBe(DEFAULT_OUTPUT_LANGUAGE);
    expect(normalizeOutputLanguage(undefined)).toBe(DEFAULT_OUTPUT_LANGUAGE);
  });

  it('trims whitespace', () => {
    expect(normalizeOutputLanguage('  en  ')).toBe('en');
  });
});

// ── getOutputLanguageLabel ──────────────────────────────────────────
describe('getOutputLanguageLabel', () => {
  it('returns English label by default', () => {
    expect(getOutputLanguageLabel('en', 'en')).toBe('English');
    expect(getOutputLanguageLabel('fr', 'en')).toBe('French');
  });

  it('returns native label for Arabic UI', () => {
    expect(getOutputLanguageLabel('ar', 'ar')).toBe('العربية');
    expect(getOutputLanguageLabel('en', 'ar')).toBe('English');
  });

  it('returns French label for French UI', () => {
    expect(getOutputLanguageLabel('en', 'fr')).toBe('Anglais');
    expect(getOutputLanguageLabel('fr', 'fr')).toBe('Français');
  });

  it('falls back to Arabic for invalid code', () => {
    expect(getOutputLanguageLabel('invalid', 'en')).toBe('Arabic');
  });
});

// ── OUTPUT_LANGUAGE_OPTIONS ─────────────────────────────────────────
describe('OUTPUT_LANGUAGE_OPTIONS', () => {
  it('has 15 language options', () => {
    expect(OUTPUT_LANGUAGE_OPTIONS.length).toBe(15);
  });

  it('each option has required fields', () => {
    for (const option of OUTPUT_LANGUAGE_OPTIONS) {
      expect(option).toHaveProperty('code');
      expect(option).toHaveProperty('native');
      expect(option).toHaveProperty('en');
      expect(option).toHaveProperty('fr');
    }
  });

  it('includes Arabic, English, and French', () => {
    const codes = OUTPUT_LANGUAGE_OPTIONS.map(o => o.code);
    expect(codes).toContain('ar');
    expect(codes).toContain('en');
    expect(codes).toContain('fr');
  });
});
