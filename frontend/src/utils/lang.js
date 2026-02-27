export const LANG = {
  ar: 'ar',
  en: 'en'
};

export function tr(lang, ar, en) {
  const arText = typeof ar === 'string' ? ar : '';
  const enText = typeof en === 'string' ? en : arText;
  const hasBrokenArabic = /\?{2,}|�/.test(arText);

  if (lang === LANG.ar && !hasBrokenArabic) {
    return arText;
  }

  return enText;
}
