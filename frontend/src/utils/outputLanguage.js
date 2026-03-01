import { LANG } from './lang';

export const DEFAULT_OUTPUT_LANGUAGE = 'ar';

export const OUTPUT_LANGUAGE_OPTIONS = [
  { code: 'ar', native: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', en: 'Arabic', fr: 'Arabe' },
  { code: 'en', native: 'English', en: 'English', fr: 'Anglais' },
  { code: 'fr', native: 'Français', en: 'French', fr: 'Français' },
  { code: 'es', native: 'Español', en: 'Spanish', fr: 'Espagnol' },
  { code: 'de', native: 'Deutsch', en: 'German', fr: 'Allemand' },
  { code: 'it', native: 'Italiano', en: 'Italian', fr: 'Italien' },
  { code: 'pt', native: 'Português', en: 'Portuguese', fr: 'Portugais' },
  { code: 'tr', native: 'Türkçe', en: 'Turkish', fr: 'Turc' },
  { code: 'ru', native: 'Русский', en: 'Russian', fr: 'Russe' },
  { code: 'hi', native: 'हिन्दी', en: 'Hindi', fr: 'Hindi' },
  { code: 'id', native: 'Bahasa Indonesia', en: 'Indonesian', fr: 'Indonésien' },
  { code: 'ur', native: 'اردو', en: 'Urdu', fr: 'Ourdou' },
  { code: 'zh', native: '中文', en: 'Chinese', fr: 'Chinois' },
  { code: 'ja', native: '日本語', en: 'Japanese', fr: 'Japonais' },
  { code: 'ko', native: '한국어', en: 'Korean', fr: 'Coréen' }
];

const OUTPUT_LANGUAGE_INDEX = Object.fromEntries(OUTPUT_LANGUAGE_OPTIONS.map((item) => [item.code, item]));

export function normalizeOutputLanguage(code) {
  const normalized = String(code || '').trim().toLowerCase();
  return OUTPUT_LANGUAGE_INDEX[normalized] ? normalized : DEFAULT_OUTPUT_LANGUAGE;
}

export function getOutputLanguageLabel(code, uiLang = LANG.en) {
  const normalized = normalizeOutputLanguage(code);
  const option = OUTPUT_LANGUAGE_INDEX[normalized];
  if (!option) return 'Arabic';

  if (uiLang === LANG.ar) return option.native;
  if (uiLang === LANG.fr) return option.fr;
  return option.en;
}

