import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';
import { LANG } from '../utils/lang';

const FALLBACK_LOCALE = LANG.en;

const CATALOG = {
  [LANG.ar]: ar,
  [LANG.en]: en,
  [LANG.fr]: fr
};

function normalizeLocale(lang) {
  if (lang === LANG.ar || lang === LANG.fr || lang === LANG.en) return lang;
  return FALLBACK_LOCALE;
}

function getByPath(source, keyPath) {
  if (!source || typeof source !== 'object') return undefined;
  const path = String(keyPath || '')
    .trim()
    .split('.')
    .filter(Boolean);
  if (!path.length) return undefined;

  let current = source;
  for (const segment of path) {
    if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

export function tLanding(lang, keyPath, fallback = '') {
  const locale = normalizeLocale(lang);
  const localized = getByPath(CATALOG[locale], keyPath);
  if (localized !== undefined) return localized;

  const fallbackValue = getByPath(CATALOG[FALLBACK_LOCALE], keyPath);
  if (fallbackValue !== undefined) return fallbackValue;
  return fallback;
}

