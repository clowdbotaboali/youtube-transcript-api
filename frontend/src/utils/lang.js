export const LANG = {
  ar: 'ar',
  en: 'en'
};

export function tr(lang, ar, en) {
  return lang === LANG.ar ? ar : en;
}
