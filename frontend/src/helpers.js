import { cleanText, tr } from './utils/lang';
import { normalizeOutputLanguage } from './utils/outputLanguage';
import { EDGE_AUTH_COOKIE_NAME, ACCOUNT_SNAPSHOT_KEY_PREFIX } from './constants';

const hasWindow = typeof window !== 'undefined';

// ── URL helpers ─────────────────────────────────────────────────────
export const normalizeApiUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

export const isValidApiUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const probeApiUrl = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/api/settings/status`, {
    method: 'GET',
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Probe failed: ${response.status}`);
  }
};

export const normalizePathname = (value) => {
  const raw = String(value || '/').trim();
  if (!raw) return '/';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withLeadingSlash === '/') return '/';
  return withLeadingSlash.replace(/\/+$/, '');
};

// ── Cookie helpers ──────────────────────────────────────────────────
export const clearEdgeAuthCookie = () => {
  if (!hasWindow) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${EDGE_AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
};

export const syncEdgeAuthCookie = (session) => {
  if (!hasWindow) return;
  const token = String(session?.access_token || '').trim();
  if (!token) {
    clearEdgeAuthCookie();
    return;
  }
  const maxAge = Math.max(Number(session?.expires_in || 3600), 60);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${EDGE_AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

// ── Account snapshot (localStorage cache) ───────────────────────────
export const readAccountSnapshot = (userId) => {
  if (!hasWindow || !userId) return null;
  try {
    const raw = localStorage.getItem(`${ACCOUNT_SNAPSHOT_KEY_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeAccountSnapshot = (userId, snapshot) => {
  if (!hasWindow || !userId || !snapshot) return;
  try {
    localStorage.setItem(`${ACCOUNT_SNAPSHOT_KEY_PREFIX}${userId}`, JSON.stringify(snapshot));
  } catch {
    // ignore local cache write failures
  }
};

// ── Auth storage cleanup ────────────────────────────────────────────
export const clearSupabaseAuthStorage = () => {
  if (!hasWindow) return;
  const storages = [window.localStorage, window.sessionStorage];

  for (const storage of storages) {
    if (!storage) continue;
    const keysToRemove = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) continue;
      if (key.startsWith('sb-') || key === 'supabase.auth.token' || key.toLowerCase().includes('supabase')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key));
  }
};

// ── UI message normalization ────────────────────────────────────────
export const normalizeUiMessage = (value) => {
  if (typeof value === 'string') return cleanText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return cleanText(String(value));
  if (value && typeof value === 'object') {
    if (typeof value.message === 'string') return cleanText(value.message);
    try {
      return cleanText(JSON.stringify(value));
    } catch {
      return '';
    }
  }
  return '';
};

// ── Text / language detection helpers ───────────────────────────────
export const isLikelyArabic = (value) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(String(value || ''));
export const isLikelyEnglish = (value) => /[A-Za-z]/.test(String(value || '')) && !isLikelyArabic(value);

export const parseInstructionLines = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((line) => cleanText(line || '').trim())
    .map((line) => line.replace(/^\s*(?:\d+[.)-]?|[-*]|\u2022)\s+/, '').trim())
    .filter((line) => line.length >= 8)
    .slice(0, 12);

export const buildFallbackVideoBrief = (titleValue, langCode) => {
  const title = cleanText(titleValue || '').trim();
  if (!title) return '';
  const compact = title.length > 90 ? `${title.slice(0, 87).trim()}...` : title;
  const lang = normalizeOutputLanguage(langCode);
  if (lang === 'ar') return `\u0645\u0644\u062e\u0635 \u0633\u0631\u064a\u0639: \u0646\u0638\u0631\u0629 \u0639\u0644\u0649 ${compact}`;
  if (lang === 'fr') return `Resume rapide: ${compact}`;
  if (lang === 'es') return `Resumen breve: ${compact}`;
  if (lang === 'de') return `Kurzzusammenfassung: ${compact}`;
  if (lang === 'it') return `Sintesi rapida: ${compact}`;
  if (lang === 'pt') return `Resumo rapido: ${compact}`;
  if (lang === 'tr') return `Kisa ozet: ${compact}`;
  if (lang === 'ru') return `Kratkoe rezyume: ${compact}`;
  if (lang === 'hi') return `Sankshipt saar: ${compact}`;
  if (lang === 'id') return `Ringkasan singkat: ${compact}`;
  if (lang === 'ur') return `Khulasa mukhtasar: ${compact}`;
  if (lang === 'zh') return `Jianyao zhaiyao: ${compact}`;
  if (lang === 'ja') return `Yoyaku: ${compact}`;
  if (lang === 'ko') return `Yoyak: ${compact}`;
  return `Quick brief: ${compact}`;
};

// ── Payment request labels ──────────────────────────────────────────
export const paymentRequestStatusLabel = (status, lang) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'approved') return tr(lang, '\u0645\u0642\u0628\u0648\u0644', 'Approved', 'Approuve');
  if (normalized === 'rejected') return tr(lang, '\u0645\u0631\u0641\u0648\u0636', 'Rejected', 'Rejete');
  if (normalized === 'cancelled') return tr(lang, '\u0645\u0644\u063a\u064a', 'Cancelled', 'Annule');
  if (normalized === 'paid') return tr(lang, '\u0645\u062f\u0641\u0648\u0639', 'Paid', 'Paye');
  return tr(lang, '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629', 'Pending review', 'En attente');
};

export const paymentRequestStatusClass = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'approved' || normalized === 'paid') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (normalized === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
  if (normalized === 'cancelled') return 'bg-slate-100 text-slate-700 border border-slate-200';
  return 'bg-amber-100 text-amber-800 border border-amber-200';
};
