import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import VideoInput from './components/VideoInput';
import TranscriptDisplay from './components/TranscriptDisplay';
import ProcessingOptions from './components/ProcessingOptions';
import ResultsDisplay from './components/ResultsDisplay';
import VideoPreviewCard from './components/VideoPreviewCard';
import SavedHistory from './components/SavedHistory';
import Settings from './components/Settings';
import ChatAssistant from './components/ChatAssistant';
import SavedLinks from './components/SavedLinks';
import LocalServerGuide from './components/LocalServerGuide';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import LandingPage from './components/LandingPage';
import TopupCheckoutPage from './components/TopupCheckoutPage';
import ToastStack from './components/ToastStack';
import ClientHeader, { PAGES as CLIENT_PAGES } from './components/ClientHeader';
import ClientDashboard from './components/ClientDashboard';
import SiteFooter from './components/SiteFooter';
import SeoMeta from './components/SeoMeta';
import PublicHeader from './components/PublicHeader';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import { supabase, SUPABASE_CONFIGURED } from './utils/supabase';
import defaultApiUrl from './config';
import { getAuthHeaders } from './utils/authHeaders';
import { formatApiErrorMessage, parseApiError } from './utils/apiError';
import { cleanText, LANG, tr } from './utils/lang';
import {
  DEFAULT_OUTPUT_LANGUAGE,
  getOutputLanguageLabel,
  normalizeOutputLanguage
} from './utils/outputLanguage';

const normalizeApiUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const isValidApiUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const probeApiUrl = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/api/settings/status`, {
    method: 'GET',
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Probe failed: ${response.status}`);
  }
};

const hasWindow = typeof window !== 'undefined';
const STATIC_ROUTES = new Set(['/privacy-policy', '/terms', '/refund-policy', '/contact', '/pricing', '/admin']);
const LOGOUT_MARKER_KEY = 'forceLoggedOut';
const FREE_PLAN_REQUESTS = 5;
const CREDIT_COST_PER_SUCCESS = 1;
const PAID_PLAN_CREDITS = 200;
const PAID_PLAN_PRICE_USD = 19;
const THEME = {
  light: 'light',
  dark: 'dark'
};
const ACCOUNT_SNAPSHOT_KEY_PREFIX = 'account-snapshot:';
const EDGE_AUTH_COOKIE_NAME = 'sb_access_token';

const clearEdgeAuthCookie = () => {
  if (!hasWindow) return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${EDGE_AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
};

const syncEdgeAuthCookie = (session) => {
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

const buildFallbackVideoBrief = (titleValue, langCode) => {
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

const parseInstructionLines = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((line) => cleanText(line || '').trim())
    .map((line) => line.replace(/^\s*(?:\d+[.)-]?|[-*]|\u2022)\s+/, '').trim())
    .filter((line) => line.length >= 8)
    .slice(0, 12);

const isLikelyArabic = (value) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(String(value || ''));
const isLikelyEnglish = (value) => /[A-Za-z]/.test(String(value || '')) && !isLikelyArabic(value);

const readAccountSnapshot = (userId) => {
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

const writeAccountSnapshot = (userId, snapshot) => {
  if (!hasWindow || !userId || !snapshot) return;
  try {
    localStorage.setItem(`${ACCOUNT_SNAPSHOT_KEY_PREFIX}${userId}`, JSON.stringify(snapshot));
  } catch {
    // ignore local cache write failures
  }
};

const clearSupabaseAuthStorage = () => {
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
const normalizeUiMessage = (value) => {
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
const paymentRequestStatusLabel = (status, lang) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'approved') return tr(lang, '\u0645\u0642\u0628\u0648\u0644', 'Approved', 'Approuve');
  if (normalized === 'rejected') return tr(lang, '\u0645\u0631\u0641\u0648\u0636', 'Rejected', 'Rejete');
  if (normalized === 'cancelled') return tr(lang, '\u0645\u0644\u063a\u064a', 'Cancelled', 'Annule');
  if (normalized === 'paid') return tr(lang, '\u0645\u062f\u0641\u0648\u0639', 'Paid', 'Paye');
  return tr(lang, '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629', 'Pending review', 'En attente');
};

const paymentRequestStatusClass = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'approved' || normalized === 'paid') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (normalized === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
  if (normalized === 'cancelled') return 'bg-slate-100 text-slate-700 border border-slate-200';
  return 'bg-amber-100 text-amber-800 border border-amber-200';
};

function App() {
  const [transcriptData, setTranscriptData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLocalGuide, setShowLocalGuide] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [topupQuote, setTopupQuote] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isRefreshingAccount, setIsRefreshingAccount] = useState(false);
  const [freePlanLimit, setFreePlanLimit] = useState(FREE_PLAN_REQUESTS);
  const [freeLinksRemaining, setFreeLinksRemaining] = useState(FREE_PLAN_REQUESTS);
  const [accountAccess, setAccountAccess] = useState({ status: 'active', reason: null });
  const [clientPage, setClientPage] = useState(CLIENT_PAGES.dashboard);
  const [lang, setLang] = useState(() => (hasWindow ? localStorage.getItem('appLang') || LANG.en : LANG.en));
  const [theme, setTheme] = useState(() => (hasWindow ? localStorage.getItem('appTheme') || THEME.light : THEME.light));
  const [outputLang, setOutputLang] = useState(() =>
    normalizeOutputLanguage(hasWindow ? localStorage.getItem('outputLang') || DEFAULT_OUTPUT_LANGUAGE : DEFAULT_OUTPUT_LANGUAGE)
  );
  const [videoBrief, setVideoBrief] = useState('');
  const [videoBriefLoading, setVideoBriefLoading] = useState(false);
  const [localizedDescriptionInstructions, setLocalizedDescriptionInstructions] = useState([]);
  const [localizedDescriptionLoading, setLocalizedDescriptionLoading] = useState(false);
  const [extraContext, setExtraContext] = useState('');
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [recentTopupRequests, setRecentTopupRequests] = useState([]);
  const [recentTopupLoading, setRecentTopupLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [currentPath, setCurrentPath] = useState(() => (hasWindow ? window.location.pathname : '/'));
  const videoBriefCacheRef = useRef(new Map());
  const refreshingAccountRef = useRef(false);

  const canUseLocalGuide =
    import.meta.env.DEV || (hasWindow && new URLSearchParams(window.location.search).get('dev') === '1');

  const user = session?.user ?? null;
  const isStaticRoute = STATIC_ROUTES.has(currentPath);

  useEffect(() => {
    if (!hasWindow) return;
    const handler = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    if (!hasWindow) return;
    const nextTheme = theme === THEME.dark ? THEME.dark : THEME.light;
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('appTheme', nextTheme);
  }, [theme]);

  useEffect(() => {
    if (!hasWindow) return;
    localStorage.setItem('outputLang', normalizeOutputLanguage(outputLang));
  }, [outputLang]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((type, message) => {
    const normalizedMessage = normalizeUiMessage(message);
    if (!normalizedMessage) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message: normalizedMessage }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const accountRestrictionMessage = useMemo(() => {
    if (accountAccess.status === 'active') return '';
    return formatApiErrorMessage({
      payload: {
        error: {
          details: {
            access: {
              status: accountAccess.status,
              reason: accountAccess.reason || null
            }
          }
        }
      },
      status: 403,
      lang,
      fallbackAr: '\u0627\u0644\u062d\u0633\u0627\u0628 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u064b\u0627. \u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645.',
      fallbackEn: 'This account is currently restricted. Contact support.',
      fallbackFr: 'Ce compte est actuellement restreint. Contactez le support.'
    });
  }, [accountAccess.reason, accountAccess.status, lang]);

  const refreshAccount = async () => {
    if (refreshingAccountRef.current) return;
    refreshingAccountRef.current = true;
    setIsRefreshingAccount(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        setCredits(null);
        setFreePlanLimit(FREE_PLAN_REQUESTS);
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
        setAccountAccess({ status: 'active', reason: null });
        return;
      }
      const response = await fetch(`${apiUrl}/api/me`, {
        headers,
        cache: 'no-store'
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        const nextCredits = Number(data.data?.credits || 0);
        const nextFreePlanLimit = Number.isFinite(Number(data.data?.freePlanLimit))
          ? Number(data.data.freePlanLimit)
          : FREE_PLAN_REQUESTS;
        const nextFreeLinks = Number.isFinite(Number(data.data?.freeLinksRemaining))
          ? Number(data.data.freeLinksRemaining)
          : nextFreePlanLimit;
        const nextAccess = {
          status: data.data?.accessStatus || 'active',
          reason: data.data?.accessReason || null
        };
        setCredits(nextCredits);
        setFreePlanLimit(nextFreePlanLimit);
        setFreeLinksRemaining(nextFreeLinks);
        setAccountAccess(nextAccess);
        if (user?.id) {
          writeAccountSnapshot(user.id, {
            credits: nextCredits,
            freePlanLimit: nextFreePlanLimit,
            freeLinksRemaining: nextFreeLinks,
            accessStatus: nextAccess.status,
            accessReason: nextAccess.reason
          });
        }
      } else if (response.status === 403) {
        const parsed = parseApiError(data);
        const access = parsed.details?.access || null;
        setAccountAccess({
          status: access?.status || 'restricted',
          reason: access?.reason || parsed.message || null
        });
      } else if (response.status === 401) {
        setCredits(null);
        setFreePlanLimit(FREE_PLAN_REQUESTS);
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
        setAccountAccess({ status: 'active', reason: null });
      }
    } catch {
      // Keep current credits value to avoid noisy UI resets on transient failures.
    } finally {
      refreshingAccountRef.current = false;
      setIsRefreshingAccount(false);
    }
  };

  const loadRecentTopupRequests = useCallback(async () => {
    if (!user?.id) {
      setRecentTopupRequests([]);
      setRecentTopupLoading(false);
      return;
    }
    setRecentTopupLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        setRecentTopupRequests([]);
        return;
      }
      const response = await fetch(`${apiUrl}/api/billing/my-requests`, {
        headers,
        cache: 'no-store'
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success && Array.isArray(data.data)) {
        setRecentTopupRequests(data.data.slice(0, 8));
      } else if (response.status === 401) {
        setRecentTopupRequests([]);
      }
    } catch {
      // ignore transient errors
    } finally {
      setRecentTopupLoading(false);
    }
  }, [apiUrl, user?.id]);

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      setAuthReady(true);
      return;
    }

    const authSafetyTimer = setTimeout(() => {
      setAuthReady(true);
    }, 4500);

    const savedUrl = normalizeApiUrl(localStorage.getItem('serverUrl'));
    const savedGuideState = localStorage.getItem('showLocalGuide');
    if (canUseLocalGuide && savedGuideState === 'true') setShowLocalGuide(true);
    const forceLoggedOut = localStorage.getItem(LOGOUT_MARKER_KEY) === '1';
    if (forceLoggedOut) {
      localStorage.removeItem(LOGOUT_MARKER_KEY);
      clearEdgeAuthCookie();
      setSession(null);
      setCredits(null);
      setFreePlanLimit(FREE_PLAN_REQUESTS);
      setFreeLinksRemaining(FREE_PLAN_REQUESTS);
    }

    (async () => {
      if (!savedUrl) return;
      if (!isValidApiUrl(savedUrl)) {
        localStorage.removeItem('serverUrl');
        return;
      }
      try {
        await probeApiUrl(savedUrl);
        setApiUrl(savedUrl);
      } catch {
        localStorage.removeItem('serverUrl');
        setApiUrl(defaultApiUrl);
      }
    })();

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (forceLoggedOut) {
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
          setSession(null);
          clearEdgeAuthCookie();
          setCredits(null);
          setFreePlanLimit(FREE_PLAN_REQUESTS);
          setFreeLinksRemaining(FREE_PLAN_REQUESTS);
          setAuthReady(true);
          clearTimeout(authSafetyTimer);
          return;
        }
        setSession(initialSession ?? null);
        syncEdgeAuthCookie(initialSession ?? null);
        setAuthReady(true);
        clearTimeout(authSafetyTimer);
        if (initialSession?.user) {
          await refreshAccount();
        } else {
          setCredits(null);
          setFreePlanLimit(FREE_PLAN_REQUESTS);
          setFreeLinksRemaining(FREE_PLAN_REQUESTS);
          setTopupQuote(null);
        }
      })
      .catch(() => {
        setAuthReady(true);
        clearTimeout(authSafetyTimer);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession ?? null);
      syncEdgeAuthCookie(nextSession ?? null);
      if (nextSession?.user) {
        setIsAuthModalOpen(false);
        await refreshAccount();
      } else {
        setClientPage(CLIENT_PAGES.dashboard);
        setSelectedUrl('');
        setAuthModalMode('login');
        setCredits(null);
        setFreePlanLimit(FREE_PLAN_REQUESTS);
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
        setAccountAccess({ status: 'active', reason: null });
        setTranscriptData(null);
        setAiResult(null);
        setVideoBrief('');
        setVideoBriefLoading(false);
        setLocalizedDescriptionInstructions([]);
        setLocalizedDescriptionLoading(false);
        setExtraContext('');
        setTopupQuote(null);
        setRecentTopupRequests([]);
        setRecentTopupLoading(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    });

    return () => {
      clearTimeout(authSafetyTimer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) {
      refreshAccount();
    }
  }, [apiUrl, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) return;
    const cached = readAccountSnapshot(user.id);
    if (!cached) return;
    if (Number.isFinite(Number(cached.credits))) {
      setCredits(Number(cached.credits));
    }
    if (Number.isFinite(Number(cached.freeLinksRemaining))) {
      setFreeLinksRemaining(Number(cached.freeLinksRemaining));
    }
    if (Number.isFinite(Number(cached.freePlanLimit))) {
      setFreePlanLimit(Number(cached.freePlanLimit));
    }
    if (typeof cached.accessStatus === 'string') {
      setAccountAccess({
        status: cached.accessStatus || 'active',
        reason: cached.accessReason || null
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    refreshAccount();
  }, [clientPage, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (clientPage !== CLIENT_PAGES.account || !user?.id) {
      if (!user?.id) {
        setRecentTopupRequests([]);
        setRecentTopupLoading(false);
      }
      return;
    }
    loadRecentTopupRequests();
  }, [clientPage, loadRecentTopupRequests, user?.id]);

  useEffect(() => {
    if (!hasWindow || !user?.id) return undefined;
    const runRefresh = () => {
      refreshAccount();
    };

    const intervalId = window.setInterval(runRefresh, 45000);
    const onFocus = () => runRefresh();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') runRefresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user?.id, apiUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.id) {
      setIsAuthModalOpen(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hasWindow || !user?.id) return;
    if (currentPath !== '/auth/callback') return;
    const params = new URLSearchParams(window.location.search);
    const requestedNext = String(params.get('next') || '/dashboard').trim();
    const nextPath = requestedNext.startsWith('/') ? requestedNext : '/dashboard';
    window.history.replaceState({}, '', nextPath);
    setCurrentPath(nextPath);
    if (nextPath === '/dashboard') {
      setClientPage(CLIENT_PAGES.dashboard);
    }
  }, [currentPath, user?.id]);

  useEffect(() => {
    if (!hasWindow || user?.id) return;
    const params = new URLSearchParams(window.location.search);
    const authFlag = String(params.get('auth') || '').trim().toLowerCase();
    if (!authFlag) return;
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  }, [user?.id, currentPath]);

  const handleApiUrlChange = (nextApiUrl) => {
    const normalized = normalizeApiUrl(nextApiUrl);
    setApiUrl(normalized || defaultApiUrl);
  };

  const toggleLocalGuide = () => {
    if (!canUseLocalGuide) return;
    setShowLocalGuide((prev) => {
      const next = !prev;
      localStorage.setItem('showLocalGuide', String(next));
      return next;
    });
  };

  const handleLangChange = useCallback((nextLangCode) => {
    const normalized = [LANG.en, LANG.ar, LANG.fr].includes(nextLangCode) ? nextLangCode : LANG.en;
    setLang(normalized);
    if (hasWindow) localStorage.setItem('appLang', normalized);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEME.dark ? THEME.light : THEME.dark));
  };

  const handleTranscriptExtracted = (data) => {
    setTranscriptData(data);
    setSelectedUrl('');
    setAiResult(null);
    setVideoBrief(buildFallbackVideoBrief(data?.videoTitle || data?.videoId, outputLang));
    const initialInstructions = Array.isArray(data?.descriptionInstructions) ? data.descriptionInstructions : [];
    setLocalizedDescriptionInstructions(initialInstructions);
    setLocalizedDescriptionLoading(false);
    setExtraContext('');
    if (typeof data?.creditsLeft === 'number') {
      setCredits(data.creditsLeft);
    }
    if (data?.chargedForNewVideo === true) {
      setFreeLinksRemaining((prev) => Math.max(Number(prev || 0) - 1, 0));
    }
    setClientPage(CLIENT_PAGES.workspace);
  };

  useEffect(() => {
    const videoId = String(transcriptData?.videoId || '').trim();
    const transcript = String(transcriptData?.transcript || '').trim();
    const titleFallback = buildFallbackVideoBrief(transcriptData?.videoTitle || videoId, outputLang);
    if (!user?.id || !videoId || !transcript) {
      setVideoBrief(titleFallback);
      setVideoBriefLoading(false);
      return;
    }

    const normalizedLang = normalizeOutputLanguage(outputLang);
    const cacheKey = `${videoId}:${normalizedLang}`;
    const cached = videoBriefCacheRef.current.get(cacheKey);
    if (cached) {
      setVideoBrief(cached);
      setVideoBriefLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      setVideoBriefLoading(true);
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${apiUrl}/api/ai/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            transcript,
            type: 'video-brief',
            videoId,
            lang: normalizedLang
          }),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data.success && data.result) {
          let subtitle = cleanText(data.result).trim() || titleFallback;

          // If Arabic output was requested but model returned non-Arabic text,
          // retry using only the video title to force a short localized subtitle.
          if (normalizedLang === 'ar' && subtitle && !isLikelyArabic(subtitle)) {
            const titleOnlyText = cleanText(transcriptData?.videoTitle || '').trim();
            if (titleOnlyText) {
              try {
                const retryResponse = await fetch(`${apiUrl}/api/ai/process`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                  },
                  body: JSON.stringify({
                    transcript: `Video title: ${titleOnlyText}`,
                    type: 'video-brief',
                    videoId,
                    lang: normalizedLang
                  }),
                  signal: controller.signal
                });
                const retryData = await retryResponse.json().catch(() => ({}));
                const retrySubtitle = cleanText(retryData?.result).trim();
                if (retryResponse.ok && retryData.success && retrySubtitle && isLikelyArabic(retrySubtitle)) {
                  subtitle = retrySubtitle;
                } else {
                  subtitle = `\u0645\u0644\u062e\u0635 \u0633\u0631\u064a\u0639: \u0646\u0638\u0631\u0629 \u0639\u0644\u0649 ${titleOnlyText}`;
                }
              } catch {
                subtitle = `\u0645\u0644\u062e\u0635 \u0633\u0631\u064a\u0639: \u0646\u0638\u0631\u0629 \u0639\u0644\u0649 ${titleOnlyText}`;
              }
            }
          }

          videoBriefCacheRef.current.set(cacheKey, subtitle || titleFallback);
          setVideoBrief(subtitle || titleFallback);
        } else if (!cancelled) {
          setVideoBrief(titleFallback);
        }
      } catch {
        if (!cancelled) {
          setVideoBrief(titleFallback);
        }
      } finally {
        if (!cancelled) setVideoBriefLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apiUrl, outputLang, transcriptData?.transcript, transcriptData?.videoId, transcriptData?.videoTitle, user?.id]);

  useEffect(() => {
    const videoId = String(transcriptData?.videoId || '').trim();
    const baseInstructions = Array.isArray(transcriptData?.descriptionInstructions)
      ? transcriptData.descriptionInstructions.map((line) => cleanText(line || '').trim()).filter(Boolean).slice(0, 10)
      : [];
    const normalizedLang = normalizeOutputLanguage(outputLang);

    if (!videoId || baseInstructions.length === 0) {
      setLocalizedDescriptionInstructions([]);
      setLocalizedDescriptionLoading(false);
      return;
    }

    if (!user?.id) {
      setLocalizedDescriptionInstructions(baseInstructions);
      setLocalizedDescriptionLoading(false);
      return;
    }

    if (normalizedLang === 'ar' && baseInstructions.every((line) => isLikelyArabic(line))) {
      setLocalizedDescriptionInstructions(baseInstructions);
      setLocalizedDescriptionLoading(false);
      return;
    }

    if (normalizedLang === 'en' && baseInstructions.every((line) => isLikelyEnglish(line))) {
      setLocalizedDescriptionInstructions(baseInstructions);
      setLocalizedDescriptionLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      setLocalizedDescriptionLoading(true);
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${apiUrl}/api/ai/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify({
            transcript: baseInstructions.map((line, idx) => `${idx + 1}. ${line}`).join('\n'),
            type: 'description-instructions',
            videoId,
            lang: normalizedLang
          }),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && data.success && data.result) {
          const parsed = parseInstructionLines(data.result);
          setLocalizedDescriptionInstructions(parsed.length > 0 ? parsed : baseInstructions);
        } else {
          setLocalizedDescriptionInstructions(baseInstructions);
        }
      } catch {
        if (!cancelled) setLocalizedDescriptionInstructions(baseInstructions);
      } finally {
        if (!cancelled) setLocalizedDescriptionLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [apiUrl, outputLang, transcriptData?.descriptionInstructions, transcriptData?.videoId, user?.id]);

  const handleProcess = async (type) => {
    if (!transcriptData) return;
    if (!user) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      notify('info', tr(lang, 'يرجى تسجيل الدخول لاستخدام المعالجة بالذكاء الاصطناعي.', 'Please sign in to use AI processing.'));
      return;
    }
    if (accountAccess.status !== 'active') {
      notify('error', accountRestrictionMessage);
      return;
    }

    setProcessLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          transcript: transcriptForProcessing || transcriptData.transcript,
          type,
          videoId: transcriptData.videoId,
          lang: normalizeOutputLanguage(outputLang)
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setAiResult({
          result: data.result,
          type: data.type
        });
        setCredits(Number(data.creditsLeft ?? credits ?? 0));
      } else if (response.status === 403) {
        const parsed = parseApiError(data);
        notify(
          'error',
          formatApiErrorMessage({
            payload: data,
            status: response.status,
            lang,
            fallbackAr: 'لا يمكن تنفيذ المعالجة حالياً.',
            fallbackEn: 'AI processing is not available right now.',
            fallbackFr: "Le traitement IA n'est pas disponible actuellement."
          })
        );
        if (parsed.code === 'LIMIT_EXCEEDED' && typeof parsed.details?.required === 'number') {
          setIsPricingModalOpen(true);
        }
      } else if (response.status === 401) {
        setSession(null);
        supabase.auth.signOut().catch(() => {});
        notify(
          'error',
          formatApiErrorMessage({
            payload: data,
            status: response.status,
            lang,
            fallbackAr: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
            fallbackEn: 'Session expired. Please sign in again.',
            fallbackFr: 'Session expiree. Veuillez vous reconnecter.'
          })
        );
      } else {
        notify(
          'error',
          formatApiErrorMessage({
            payload: data,
            status: response.status,
            lang,
            fallbackAr: 'فشلت المعالجة.',
            fallbackEn: 'Processing failed.',
            fallbackFr: 'Le traitement a echoue.'
          })
        );
      }
    } catch {
      notify('error', tr(lang, '\u0641\u0634\u0644 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062e\u0627\u062f\u0645', 'Connection failed'));
    } finally {
      setProcessLoading(false);
    }
  };

  const handleSave = async (saveData) => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/history/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(saveData)
      });

      const data = await response.json().catch(() => ({}));
      const success = !!(response.ok && data.success);
      if (!success) {
        notify('error', tr(lang, '\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0627\u0644\u0646\u062a\u064a\u062c\u0629.', 'Failed to save result.'));
      }
      return success;
    } catch {
      notify('error', tr(lang, '\u0641\u0634\u0644 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062e\u0627\u062f\u0645', 'Connection failed'));
      return false;
    }
  };

  const authSuccessHandler = async (nextSession) => {
    setSession(nextSession ?? null);
    setIsAuthModalOpen(false);
    if (nextSession?.user) {
      const hasPendingUrl = Boolean(String(selectedUrl || '').trim());
      setClientPage(hasPendingUrl ? CLIENT_PAGES.workspace : CLIENT_PAGES.dashboard);
      setAuthModalMode('login');
      await refreshAccount();
      notify('success', tr(lang, '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0646\u062c\u0627\u062d.', 'Signed in successfully.'));
    }
  };

  const handleLandingStart = useCallback((options = {}) => {
    const nextMode = options?.mode === 'signup' ? 'signup' : 'login';
    const nextUrl = typeof options?.url === 'string' ? options.url.trim() : '';
    if (nextUrl) setSelectedUrl(nextUrl);
    else setSelectedUrl('');
    setAuthModalMode(nextMode);
    setIsAuthModalOpen(true);
  }, []);

  const handleSavedLinkSelect = (url) => {
    setSelectedUrl(url);
    setClientPage(CLIENT_PAGES.workspace);
  };

  const openTopupPicker = useCallback(() => {
    setTopupQuote(null);
    setIsPricingModalOpen(true);
  }, []);

  const handleTopupProceed = useCallback((nextQuote) => {
    setTopupQuote(nextQuote || null);
    setIsPricingModalOpen(false);
    setClientPage(CLIENT_PAGES.topup);
  }, []);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const nextPassword = String(passwordForm.newPassword || '').trim();
    const confirmPassword = String(passwordForm.confirmPassword || '').trim();

    if (!nextPassword || nextPassword.length < 8) {
      notify('error', tr(lang, 'كلمة المرور لازم تكون 8 أحرف على الأقل.', 'Password must be at least 8 characters.'));
      return;
    }
    if (nextPassword !== confirmPassword) {
      notify('error', tr(lang, 'تأكيد كلمة المرور غير مطابق.', 'Password confirmation does not match.'));
      return;
    }

    setPasswordSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nextPassword });
      if (error) {
        notify('error', cleanText(error.message) || tr(lang, 'فشل تغيير كلمة المرور.', 'Failed to change password.'));
        return;
      }
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      notify('success', tr(lang, 'تم تغيير كلمة المرور بنجاح.', 'Password updated successfully.'));
    } catch {
      notify('error', tr(lang, 'حدث خطأ أثناء تغيير كلمة المرور.', 'Unexpected error while updating password.'));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleLogout = async () => {
    // Force local sign-out immediately in UI and storage.
    clearSupabaseAuthStorage();
    clearEdgeAuthCookie();
    setSession(null);
    setCredits(null);
    setFreePlanLimit(FREE_PLAN_REQUESTS);
    setFreeLinksRemaining(FREE_PLAN_REQUESTS);
    setAccountAccess({ status: 'active', reason: null });
    setTranscriptData(null);
    setAiResult(null);
    setVideoBrief('');
    setVideoBriefLoading(false);
    setExtraContext('');
    setClientPage(CLIENT_PAGES.dashboard);
    setSelectedUrl('');
    setAuthModalMode('login');
    setIsAuthModalOpen(false);
    setIsPricingModalOpen(false);
    setTopupQuote(null);
    setRecentTopupRequests([]);
    setRecentTopupLoading(false);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowSettings(false);

    if (hasWindow) {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Best-effort Supabase sign-out; do not block logout flow on network/client issues.
    try {
      if (supabase?.auth) {
        await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
        await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      }
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {});
    } catch {
      // Intentionally ignored.
    }

    notify('success', tr(lang, '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c \u0628\u0646\u062c\u0627\u062d.', 'Signed out successfully.'));

    // Hard refresh to guarantee no in-memory auth state survives.
    if (hasWindow) {
      localStorage.setItem(LOGOUT_MARKER_KEY, '1');
      window.location.replace('/');
    }
  };

  const rootDir = useMemo(() => (lang === LANG.ar ? 'rtl' : 'ltr'), [lang]);
  const transcriptForProcessing = useMemo(() => {
    const baseTranscript = String(transcriptData?.transcript || '').trim();
    const context = String(extraContext || '').trim();
    if (!baseTranscript) return '';
    if (!context) return baseTranscript;
    return `${baseTranscript}\n\nAdditional links/instructions from user:\n${context}`;
  }, [extraContext, transcriptData?.transcript]);

  const renderStaticRoute = () => {
    if (currentPath === '/privacy-policy') return <PrivacyPolicyPage lang={lang} theme={theme} />;
    if (currentPath === '/terms') return <TermsPage lang={lang} theme={theme} />;
    if (currentPath === '/refund-policy') return <RefundPolicyPage lang={lang} theme={theme} />;
    if (currentPath === '/contact') return <ContactPage lang={lang} theme={theme} />;
    if (currentPath === '/pricing') return <PricingPage lang={lang} theme={theme} />;
    if (currentPath === '/admin') return <AdminPage apiUrl={apiUrl} lang={lang} theme={theme} />;
    return null;
  };

  if (isStaticRoute) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === THEME.dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <PublicHeader
          lang={lang}
          currentPath={currentPath}
          onLangChange={handleLangChange}
          onToggleTheme={toggleTheme}
          theme={theme}
          isAuthenticated={Boolean(user)}
        />
        <div className="flex-1">{renderStaticRoute()}</div>
        <SiteFooter lang={lang} theme={theme} />
      </div>
    );
  }

  if (!SUPABASE_CONFIGURED) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === THEME.dark ? 'bg-slate-950 text-slate-100' : ''}`}>
        <div className="flex-1 bg-slate-950 text-slate-100 flex items-center justify-center px-4" dir={rootDir}>
          <div className="max-w-lg w-full rounded-xl border border-slate-700 bg-slate-900/70 p-6 text-center">
            <h1 className="text-xl font-bold mb-3">
              {tr(lang, '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u063a\u064a\u0631 \u0645\u0643\u062a\u0645\u0644\u0629', 'Authentication configuration is missing')}
            </h1>
            <p className="text-slate-300 text-sm">
              {tr(lang, '\u0623\u0636\u0641 \u0645\u062a\u063a\u064a\u0631\u0627\u062a VITE_SUPABASE_URL \u0648 VITE_SUPABASE_ANON_KEY \u0641\u064a \u0628\u064a\u0626\u0629 Vercel \u062b\u0645 \u0623\u0639\u062f \u0627\u0644\u0646\u0634\u0631.', 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables, then redeploy.')}
            </p>
          </div>
        </div>
        <SiteFooter lang={lang} theme={theme} />
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === THEME.dark ? 'bg-slate-950 text-slate-100' : ''}`} dir={rootDir}>
        <SeoMeta
          title="Preparing Session | Transcripta AI"
          description="Initializing authenticated session for Transcripta AI."
          path="/"
        />
        <div className="flex-1 bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm">
            <FaSpinner className="animate-spin" />
            <span>{tr(lang, '\u062c\u0627\u0631\u064d \u062a\u062c\u0647\u064a\u0632 \u0627\u0644\u062c\u0644\u0633\u0629...', 'Preparing session...')}</span>
          </div>
        </div>
        <SiteFooter lang={lang} theme={theme} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === THEME.dark ? 'bg-slate-950 text-slate-100' : ''}`}>
      <SeoMeta
        title="Transcripta AI | Knowledge Extraction & Execution Engine"
        description="Transform long YouTube videos into structured knowledge, execution plans, and implementation-ready outputs."
        path="/"
      />
        <div className="flex-1">
          <LandingPage
            onStart={handleLandingStart}
            lang={lang}
            theme={theme}
            onLangChange={handleLangChange}
            onToggleTheme={toggleTheme}
            apiUrl={apiUrl}
          />
          <ToastStack items={toasts} onDismiss={dismissToast} />
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onAuthSuccess={authSuccessHandler}
              lang={lang}
              onNotify={notify}
              initialMode={authModalMode}
              apiUrl={apiUrl}
            />
          )}
        </div>
        <SiteFooter lang={lang} theme={theme} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${theme === THEME.dark ? 'bg-slate-950 text-slate-100' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_65%,#ecfeff_100%)]'}`}
      dir={rootDir}
    >
      <SeoMeta
        title="Client Workspace | Transcripta AI"
        description="Authenticated workspace for knowledge extraction, AI processing, and execution-ready outputs from long videos."
        path="/"
      />
      <ToastStack items={toasts} onDismiss={dismissToast} />
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <ClientHeader
          lang={lang}
          theme={theme}
          userEmail={user?.email}
          credits={credits}
          freeLinksRemaining={freeLinksRemaining}
          freePlanRequests={freePlanLimit}
          requestCost={CREDIT_COST_PER_SUCCESS}
          paidPlanCredits={PAID_PLAN_CREDITS}
          paidPlanPrice={PAID_PLAN_PRICE_USD}
          currentPage={clientPage}
          onPageChange={setClientPage}
          onLangChange={handleLangChange}
          onToggleTheme={toggleTheme}
          onRefreshPoints={() => {
            void refreshAccount();
          }}
          refreshBusy={isRefreshingAccount}
          onOpenSettings={canUseLocalGuide ? () => setShowSettings(true) : undefined}
          onOpenPricing={openTopupPicker}
          onLogout={handleLogout}
        />

        {clientPage === CLIENT_PAGES.dashboard && (
          <ClientDashboard
            lang={lang}
            theme={theme}
            credits={credits}
            freeLinksRemaining={freeLinksRemaining}
            userEmail={user?.email}
            onStartExtract={() => setClientPage(CLIENT_PAGES.workspace)}
            onOpenHistory={() => setClientPage(CLIENT_PAGES.history)}
            onOpenTopup={openTopupPicker}
          />
        )}

        {clientPage === CLIENT_PAGES.workspace && (
          <section className="space-y-4 sm:space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, '\u0645\u0633\u0627\u062d\u0629 \u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u0644\u0645\u0639\u0631\u0641\u0629', 'Knowledge Extraction Workspace', 'Espace extraction de connaissance')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, '\u0636\u0639 \u0627\u0644\u0631\u0627\u0628\u0637\u060c \u0627\u0633\u062a\u062e\u0631\u062c \u0627\u0644\u0646\u0635\u060c \u062b\u0645 \u062d\u0648\u0651\u0644 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0625\u0644\u0649 \u062e\u0637\u0648\u0627\u062a \u062a\u0646\u0641\u064a\u0630 \u0623\u0648 \u0627\u0633\u0623\u0644 \u0627\u0644\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0630\u0643\u064a.', 'Paste a URL, extract knowledge, then generate execution-ready output or chat.', 'Collez un lien, extrayez la connaissance, puis generez une sortie executable ou utilisez le chat.')}</p>
            </div>
            {accountRestrictionMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
                {accountRestrictionMessage}
              </div>
            ) : null}
            {canUseLocalGuide && (
              <div className="mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={toggleLocalGuide}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                >
                  <span>{showLocalGuide ? tr(lang, '\u0625\u062e\u0641\u0627\u0621', 'Hide') : tr(lang, '\u0625\u0638\u0647\u0627\u0631', 'Show')}</span>
                  <span>{tr(lang, '\u062f\u0644\u064a\u0644 \u0627\u0644\u062e\u0627\u062f\u0645 \u0627\u0644\u0645\u062d\u0644\u064a', 'Local backend guide')}</span>
                </button>
              </div>
            )}

            {canUseLocalGuide && showLocalGuide && (
              <LocalServerGuide apiUrl={apiUrl} onApiUrlChange={handleApiUrlChange} lang={lang} />
            )}

            <VideoInput
              onTranscriptExtracted={handleTranscriptExtracted}
              loading={extractLoading}
              setLoading={setExtractLoading}
              initialUrl={selectedUrl}
              apiUrl={apiUrl}
              lang={lang}
              outputLang={normalizeOutputLanguage(outputLang)}
              onOutputLangChange={(next) => setOutputLang(normalizeOutputLanguage(next))}
              accessRestrictionMessage={accountRestrictionMessage}
            />

            {transcriptData && (
              <div className="space-y-4 sm:space-y-6">
                <VideoPreviewCard
                  data={transcriptData}
                  localizedSubtitle={videoBrief}
                  localizedSubtitleLoading={videoBriefLoading}
                  localizedDescriptionInstructions={localizedDescriptionInstructions}
                  localizedDescriptionLoading={localizedDescriptionLoading}
                  outputLanguageLabel={getOutputLanguageLabel(outputLang, lang)}
                  lang={lang}
                  extraContext={extraContext}
                  onExtraContextChange={setExtraContext}
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-3 sm:p-4 border-b lg:border-b-0 lg:border-l border-gray-200">
                      <TranscriptDisplay
                        transcript={transcriptData.transcript}
                        videoId={transcriptData.videoId}
                        wordCount={transcriptData.wordCount}
                        lang={lang}
                      />
                    </div>
                    <div className="p-3 sm:p-4 h-[400px] sm:h-[600px] flex flex-col">
                      <ChatAssistant
                        transcript={transcriptForProcessing || transcriptData.transcript}
                        videoId={transcriptData.videoId}
                        apiUrl={apiUrl}
                        onCreditsChange={setCredits}
                        onRequireTopup={openTopupPicker}
                        lang={lang}
                      />
                    </div>
                  </div>
                </div>

                <ProcessingOptions
                  onProcess={handleProcess}
                  loading={processLoading}
                  lang={lang}
                />

                {aiResult && (
                  <ResultsDisplay
                    result={aiResult.result}
                    type={aiResult.type}
                    videoId={transcriptData.videoId}
                    videoTitle={transcriptData.videoTitle || transcriptData.videoId}
                    transcript={transcriptForProcessing || transcriptData.transcript}
                    onSave={handleSave}
                    user={user}
                    lang={lang}
                    onNotify={notify}
                  />
                )}
              </div>
            )}
          </section>
        )}

        {clientPage === CLIENT_PAGES.history && (
          <section className="space-y-4 sm:space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, '\u0627\u0644\u0633\u062c\u0644 \u0648\u0627\u0644\u0631\u0648\u0627\u0628\u0637', 'History & Saved Links')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, '\u0631\u0627\u062c\u0639 \u0646\u062a\u0627\u0626\u062c\u0643 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0648\u0627\u062e\u062a\u0631 \u0623\u064a \u0631\u0627\u0628\u0637 \u0645\u062d\u0641\u0648\u0638 \u0644\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0627\u0633\u062a\u062e\u0631\u0627\u062c.', 'Review saved runs and open any saved link back in the extraction workspace.')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SavedHistory apiUrl={apiUrl} user={user} lang={lang} onNotify={notify} />
              <SavedLinks onSelectLink={handleSavedLinkSelect} apiUrl={apiUrl} user={user} lang={lang} onNotify={notify} />
            </div>
          </section>
        )}

        {clientPage === CLIENT_PAGES.topup && (
          <TopupCheckoutPage
            user={user}
            quote={topupQuote}
            apiUrl={apiUrl}
            lang={lang}
            theme={theme}
            onNotify={notify}
            onBack={() => {
              setClientPage(CLIENT_PAGES.account);
              setIsPricingModalOpen(true);
            }}
            onTopupSubmitted={() => {
              refreshAccount();
              loadRecentTopupRequests();
            }}
          />
        )}

        {clientPage === CLIENT_PAGES.account && (
          <section className="space-y-4 sm:space-y-5">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-black text-slate-900 mb-3">{tr(lang, '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062d\u0633\u0627\u0628', 'Account details')}</h2>
                <div className="space-y-3 text-sm">
                  <p><span className="font-bold">{tr(lang, '\u0627\u0644\u0628\u0631\u064a\u062f:', 'Email:')}</span> {user?.email || '-'}</p>
                  <p><span className="font-bold">{tr(lang, '\u0631\u0635\u064a\u062f \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a:', 'Video balance:')}</span> {credits ?? '...'}</p>
                  <p><span className="font-bold">{tr(lang, '\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629:', 'Free plan:')}</span> {freePlanLimit} {tr(lang, '\u0631\u0648\u0627\u0628\u0637 \u0641\u0642\u0637', 'links only')}</p>
                  <p><span className="font-bold">{tr(lang, '\u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u0627\u0644\u0645\u062a\u0628\u0642\u064a\u0629:', 'Free links remaining:')}</span> {tr(lang, `${freeLinksRemaining} من ${freePlanLimit}`, `${freeLinksRemaining} of ${freePlanLimit}`, `${freeLinksRemaining} sur ${freePlanLimit}`)}</p>
                  <p><span className="font-bold">{tr(lang, '\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0631\u0627\u0628\u0637:', 'Link cost:')}</span> {CREDIT_COST_PER_SUCCESS} {tr(lang, '\u0641\u064a\u062f\u064a\u0648 \u0645\u0646 \u0627\u0644\u0631\u0635\u064a\u062f \u0644\u0643\u0644 \u0631\u0627\u0628\u0637 \u062c\u062f\u064a\u062f', 'video from balance per new video link')}</p>
                  <p><span className="font-bold">{tr(lang, '\u0627\u0644\u062c\u0644\u0633\u0629:', 'Session:')}</span> {tr(lang, '\u0646\u0634\u0637\u0629', 'Active')}</p>
                  {accountAccess.status !== 'active' ? (
                    <p>
                      <span className="font-bold">{tr(lang, '\u062d\u0627\u0644\u0629 \u0627\u0644\u0648\u0635\u0648\u0644:', 'Access status:')}</span>{' '}
                      {accountAccess.status} {accountAccess.reason ? `(${accountAccess.reason})` : ''}
                    </p>
                  ) : null}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, '\u0627\u0644\u062e\u0637\u0637 \u0648\u0627\u0644\u0634\u062d\u0646', 'Plans & top-up')}</h3>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-3">
                  <p className="font-black text-emerald-900 mb-2">{tr(lang, '\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629', 'Free plan')}</p>
                  <p className="text-sm text-emerald-800">{tr(lang, '\u062a\u0634\u0645\u0644 5 \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0634\u0647\u0631\u064a\u064b\u0627\u060c \u0648\u0627\u0644\u062a\u0644\u062e\u064a\u0635 \u0648\u0627\u0644\u0634\u0627\u062a \u0644\u0646\u0641\u0633 \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0628\u062f\u0648\u0646 \u062e\u0635\u0645 \u0625\u0636\u0627\u0641\u064a\u060c', '5 videos monthly, and same-video summary/chat do not consume extra balance.')}</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="font-black text-orange-900 mb-2">{tr(lang, '\u0627\u0644\u0634\u062d\u0646 \u0627\u0644\u0645\u062f\u0641\u0648\u0639', 'Paid top-up')}</p>
                  <p className="text-sm text-orange-800 mb-3">
                    {tr(lang, 'باقة الدفع الرئيسية: $19 = 200 فيديو، مع بونص 10% لباقات 2x و3x و5x. تفاصيل الدفع تظهر في صفحة مخصصة بعد اختيار الباقة.', 'Main paid pack: $19 = 200 videos, with a 10% bonus on 2x, 3x, and 5x packs. Full payment details open on a dedicated page after selecting the pack.')}
                  </p>
                  <button
                    type="button"
                    onClick={openTopupPicker}
                    className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
                  >
                    {tr(lang, '\u0627\u062e\u062a\u0631 \u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a', 'Choose video pack')}
                  </button>
                </div>
              </article>
            </div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, '\u0623\u0645\u0627\u0646 \u0627\u0644\u062d\u0633\u0627\u0628', 'Account security')}</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, '\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629', 'New password')}</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder={tr(lang, '\u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 8 \u0623\u062d\u0631\u0641', 'At least 8 characters')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 'Confirm password')}</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder={tr(lang, '\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 'Re-enter password')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
                  >
                    {passwordSubmitting ? tr(lang, '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u062f\u064a\u062b\u2026', 'Updating...') : tr(lang, '\u062a\u062d\u062f\u064a\u062b \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 'Update password')}
                  </button>
                </form>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, '\u0637\u0648\u0631 \u0646\u062a\u0627\u0626\u062c\u0643 \u0628\u0627\u0644\u0634\u062d\u0646', 'Upgrade your results with top-up')}</h3>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
                  <p className="text-sm text-amber-900 mb-2">
                    {tr(lang, '\u0645\u0639 \u0631\u0635\u064a\u062f \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0623\u0643\u062b\u0631\u060c \u062a\u0633\u062a\u0637\u064a\u0639 \u0645\u0639\u0627\u0644\u062c\u0629 \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0623\u0643\u062b\u0631 \u0628\u062f\u0648\u0646 \u0627\u0646\u0642\u0637\u0627\u0639 \u0648\u0628\u0646\u0627\u0621 \u0645\u0643\u062a\u0628\u0629 \u062a\u0646\u0641\u064a\u0630 \u0623\u0642\u0648\u0649\u060c', 'With more video balance, you can process more videos without interruption and build a stronger execution library.')}
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>{tr(lang, '\u2022 \u0628\u0627\u0642\u0629 \u0648\u0627\u0636\u062d\u0629: $19 = 200 \u0641\u064a\u062f\u064a\u0648', '\u2022 Clear pack: $19 = 200 videos')}</li>
                    <li>{tr(lang, '\u2022 \u0628\u0648\u0646\u0635 10% \u0644\u0628\u0627\u0642\u0627\u062a 2x \u0648 3x \u0648 5x', '\u2022 10% bonus on 2x, 3x, and 5x packs')}</li>
                    <li>{tr(lang, '\u2022 \u062a\u0633\u0639\u064a\u0631 \u0645\u0628\u0646\u064a \u0639\u0644\u0649 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0628\u062f\u0648\u0646 \u062a\u0639\u0642\u064a\u062f \u0648\u062d\u062f\u0627\u062a', '\u2022 Video-based pricing with clear units')}</li>
                    <li>{tr(lang, '\u2022 \u0635\u0641\u062d\u0629 \u062f\u0641\u0639 \u0648\u0627\u0636\u062d\u0629 \u0648\u0645\u0646\u0638\u0645\u0629', '\u2022 Dedicated clear checkout page')}</li>
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3">
                  {canUseLocalGuide && (
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                    >
                      {tr(lang, '\u0641\u062a\u062d \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a', 'Open settings')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 transition"
                  >
                    {tr(lang, '\u062a\u0633\u062c\u064a\u0644 \u062e\u0631\u0648\u062c', 'Sign out')}
                  </button>
                </div>
              </article>
            </div>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-lg font-black text-slate-900">{tr(lang, '\u0637\u0644\u0628\u0627\u062a\u064a \u0627\u0644\u0623\u062e\u064a\u0631\u0629', 'My recent requests', 'Mes demandes recentes')}</h3>
                {recentTopupLoading ? <span className="text-xs text-slate-500">{tr(lang, '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u062f\u064a\u062b\u2026', 'Refreshing...', 'Actualisation...')}</span> : null}
              </div>

              {recentTopupRequests.length === 0 ? (
                <p className="text-sm text-slate-600">
                  {tr(lang, '\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0634\u062d\u0646 \u0628\u0639\u062f\u060c', 'No top-up requests yet.', 'Aucune demande de recharge pour le moment.')}
                </p>
              ) : (
                <div className="max-h-72 overflow-auto space-y-2 pr-1">
                  {recentTopupRequests.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="font-semibold text-slate-900">
                          ${(Number(item.amount_cents || 0) / 100).toFixed(2)} / {item.credits_added} {tr(lang, '\u0641\u064a\u062f\u064a\u0648', 'videos', 'videos')}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-1 ${paymentRequestStatusClass(item.status)}`}>
                          {paymentRequestStatusLabel(item.status, lang)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(item.created_at).toLocaleString(lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}
      </div>

      {isPricingModalOpen && (
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          user={user}
          lang={lang}
          theme={theme}
          onNotify={notify}
          onProceed={handleTopupProceed}
          requireLogin={() => {
            setIsPricingModalOpen(false);
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {canUseLocalGuide && showSettings && <Settings onClose={() => setShowSettings(false)} lang={lang} />}
      <SiteFooter lang={lang} theme={theme} />
    </div>
  );
}

export default App;






