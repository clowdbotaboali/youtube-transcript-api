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
const PAID_PLAN_PRICE_USD = 5;
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
  if (lang === 'ar') return `Ù…Ù„Ø®Øµ Ø³Ø±ÙŠØ¹: ${compact}`;
  if (lang === 'fr') return `RÃ©sumÃ© rapide: ${compact}`;
  if (lang === 'es') return `Resumen breve: ${compact}`;
  if (lang === 'de') return `Kurzzusammenfassung: ${compact}`;
  if (lang === 'it') return `Sintesi rapida: ${compact}`;
  if (lang === 'pt') return `Resumo rÃ¡pido: ${compact}`;
  if (lang === 'tr') return `Kisa ozet: ${compact}`;
  if (lang === 'ru') return `ÐšÑ€Ð°Ñ‚ÐºÐ¾Ðµ Ñ€ÐµÐ·ÑŽÐ¼Ðµ: ${compact}`;
  if (lang === 'hi') return `à¤¸à¤‚à¤•à¥à¤·à¤¿à¤ªà¥à¤¤ à¤¸à¤¾à¤°: ${compact}`;
  if (lang === 'id') return `Ringkasan singkat: ${compact}`;
  if (lang === 'ur') return `Ø®Ù„Ø§ØµÛ Ù…Ø®ØªØµØ±: ${compact}`;
  if (lang === 'zh') return `ç®€è¦æ‘˜è¦ï¼š${compact}`;
  if (lang === 'ja') return `è¦ç´„: ${compact}`;
  if (lang === 'ko') return `ìš”ì•½: ${compact}`;
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
  const [toasts, setToasts] = useState([]);
  const [currentPath, setCurrentPath] = useState(() => (hasWindow ? window.location.pathname : '/'));
  const videoBriefCacheRef = useRef(new Map());

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
      fallbackAr: 'Ø§Ù„Ø­Ø³Ø§Ø¨ ØºÙŠØ± Ù…ØªØ§Ø­ Ø­Ø§Ù„ÙŠÙ‹Ø§. ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¯Ø¹Ù….',
      fallbackEn: 'This account is currently restricted. Contact support.',
      fallbackFr: 'Ce compte est actuellement restreint. Contactez le support.'
    });
  }, [accountAccess.reason, accountAccess.status, lang]);

  const refreshAccount = async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        setCredits(null);
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
        const nextFreeLinks = Number.isFinite(Number(data.data?.freeLinksRemaining))
          ? Number(data.data.freeLinksRemaining)
          : FREE_PLAN_REQUESTS;
        const nextAccess = {
          status: data.data?.accessStatus || 'active',
          reason: data.data?.accessReason || null
        };
        setCredits(nextCredits);
        setFreeLinksRemaining(nextFreeLinks);
        setAccountAccess(nextAccess);
        if (user?.id) {
          writeAccountSnapshot(user.id, {
            credits: nextCredits,
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
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
        setAccountAccess({ status: 'active', reason: null });
      }
    } catch {
      // Keep current credits value to avoid noisy UI resets on transient failures.
    }
  };

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
          const subtitle = cleanText(data.result).trim() || titleFallback;
          videoBriefCacheRef.current.set(cacheKey, subtitle);
          setVideoBrief(subtitle);
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
      notify('info', tr(lang, 'ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ.', 'Please sign in to use AI processing.'));
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
            fallbackAr: 'Ù„Ø§ ÙŠÙ…ÙƒÙ† ØªÙ†ÙÙŠØ° Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.',
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
            fallbackAr: 'Ø§Ù†ØªÙ‡Øª Ø§Ù„Ø¬Ù„Ø³Ø©. ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.',
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
            fallbackAr: 'ÙØ´Ù„Øª Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©.',
            fallbackEn: 'Processing failed.',
            fallbackFr: 'Le traitement a echoue.'
          })
        );
      }
    } catch {
      notify('error', tr(lang, 'ÙØ´Ù„ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…', 'Connection failed'));
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
        notify('error', tr(lang, 'Ã˜ÂªÃ˜Â¹Ã˜Â°Ã˜Â± Ã˜Â­Ã™ÂÃ˜Â¸ Ã˜Â§Ã™â€žÃ™â€ Ã˜ÂªÃ™Å Ã˜Â¬Ã˜Â©.', 'Failed to save result.'));
      }
      return success;
    } catch {
      notify('error', tr(lang, 'Ã™ÂÃ˜Â´Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â§Ã˜ÂªÃ˜ÂµÃ˜Â§Ã™â€ž Ã˜Â¨Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â§Ã˜Â¯Ã™â€¦', 'Connection failed'));
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
      notify('success', tr(lang, 'Ã˜ÂªÃ™â€¦ Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â®Ã™Ë†Ã™â€ž Ã˜Â¨Ã™â€ Ã˜Â¬Ã˜Â§Ã˜Â­.', 'Signed in successfully.'));
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
      notify('error', tr(lang, 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù„Ø§Ø²Ù… ØªÙƒÙˆÙ† 8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.', 'Password must be at least 8 characters.'));
      return;
    }
    if (nextPassword !== confirmPassword) {
      notify('error', tr(lang, 'ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…Ø·Ø§Ø¨Ù‚.', 'Password confirmation does not match.'));
      return;
    }

    setPasswordSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nextPassword });
      if (error) {
        notify('error', cleanText(error.message) || tr(lang, 'ÙØ´Ù„ ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.', 'Failed to change password.'));
        return;
      }
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      notify('success', tr(lang, 'ØªÙ… ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­.', 'Password updated successfully.'));
    } catch {
      notify('error', tr(lang, 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.', 'Unexpected error while updating password.'));
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

    notify('success', tr(lang, 'Ã˜ÂªÃ™â€¦ Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â±Ã™Ë†Ã˜Â¬ Ã˜Â¨Ã™â€ Ã˜Â¬Ã˜Â§Ã˜Â­.', 'Signed out successfully.'));

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
              {tr(lang, 'Ã˜Â¥Ã˜Â¹Ã˜Â¯Ã˜Â§Ã˜Â¯Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂµÃ˜Â§Ã˜Â¯Ã™â€šÃ˜Â© Ã˜ÂºÃ™Å Ã˜Â± Ã™â€¦Ã™Æ’Ã˜ÂªÃ™â€¦Ã™â€žÃ˜Â©', 'Authentication configuration is missing')}
            </h1>
            <p className="text-slate-300 text-sm">
              {tr(
                lang,
                'Ã˜Â£Ã˜Â¶Ã™Â Ã™â€¦Ã˜ÂªÃ˜ÂºÃ™Å Ã˜Â±Ã˜Â§Ã˜Âª VITE_SUPABASE_URL Ã™Ë† VITE_SUPABASE_ANON_KEY Ã™ÂÃ™Å  Ã˜Â¨Ã™Å Ã˜Â¦Ã˜Â© Vercel Ã˜Â«Ã™â€¦ Ã˜Â£Ã˜Â¹Ã˜Â¯ Ã˜Â§Ã™â€žÃ™â€ Ã˜Â´Ã˜Â±.',
                'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables, then redeploy.'
              )}
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
          title="Preparing Session | Transcript AI"
          description="Initializing authenticated session for Transcript AI."
          path="/"
        />
        <div className="flex-1 bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm">
            <FaSpinner className="animate-spin" />
            <span>{tr(lang, 'Ã˜Â¬Ã˜Â§Ã˜Â±Ã™Å  Ã˜ÂªÃ˜Â¬Ã™â€¡Ã™Å Ã˜Â² Ã˜Â§Ã™â€žÃ˜Â¬Ã™â€žÃ˜Â³Ã˜Â©...', 'Preparing session...')}</span>
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
          title="Transcript AI | YouTube Transcript Generation Service"
          description="Transcript AI is a digital service that converts YouTube links into text transcripts and provides optional AI text analysis."
          path="/"
        />
        <div className="flex-1">
          <LandingPage
            onStart={handleLandingStart}
            lang={lang}
            theme={theme}
            onLangChange={handleLangChange}
            onToggleTheme={toggleTheme}
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
        title="Client Workspace | Transcript AI"
        description="Authenticated workspace for transcript extraction, AI text processing, and saved transcript history."
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
          freePlanRequests={FREE_PLAN_REQUESTS}
          requestCost={CREDIT_COST_PER_SUCCESS}
          paidPlanCredits={PAID_PLAN_CREDITS}
          paidPlanPrice={PAID_PLAN_PRICE_USD}
          currentPage={clientPage}
          onPageChange={setClientPage}
          onLangChange={handleLangChange}
          onToggleTheme={toggleTheme}
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, 'Ã™â€¦Ã˜Â³Ã˜Â§Ã˜Â­Ã˜Â© Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â±Ã˜Â§Ã˜Â¬ Ã˜Â§Ã™â€žÃ˜Â³Ã™Æ’Ã˜Â±Ã™Å Ã˜Â¨Ã˜Âª', 'Transcript Extraction Workspace')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, 'Ã˜Â¶Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â§Ã˜Â¨Ã˜Â·Ã˜Å’ Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â±Ã˜Â¬ Ã˜Â§Ã™â€žÃ™â€ Ã˜ÂµÃ˜Å’ Ã˜Â«Ã™â€¦ Ã˜Â§Ã˜Â¨Ã˜Â¯Ã˜Â£ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â© Ã˜Â£Ã™Ë† Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â±Ã˜Â¯Ã˜Â´Ã˜Â©.', 'Paste a URL, extract transcript, then process or chat.')}</p>
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
                  <span>{showLocalGuide ? tr(lang, 'Ã˜Â¥Ã˜Â®Ã™ÂÃ˜Â§Ã˜Â¡', 'Hide') : tr(lang, 'Ã˜Â¥Ã˜Â¸Ã™â€¡Ã˜Â§Ã˜Â±', 'Show')}</span>
                  <span>{tr(lang, 'Ã˜Â¯Ã™â€žÃ™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â§Ã˜Â¯Ã™â€¦ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â­Ã™â€žÃ™Å ', 'Local backend guide')}</span>
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, 'Ã˜Â§Ã™â€žÃ˜Â³Ã˜Â¬Ã™â€ž Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â±Ã™Ë†Ã˜Â§Ã˜Â¨Ã˜Â·', 'History & Saved Links')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, 'Ã˜Â±Ã˜Â§Ã˜Â¬Ã˜Â¹ Ã™â€ Ã˜ÂªÃ˜Â§Ã˜Â¦Ã˜Â¬Ã™Æ’ Ã˜Â§Ã™â€žÃ˜Â³Ã˜Â§Ã˜Â¨Ã™â€šÃ˜Â© Ã™Ë†Ã˜Â§Ã˜Â®Ã˜ÂªÃ˜Â± Ã˜Â£Ã™Å  Ã˜Â±Ã˜Â§Ã˜Â¨Ã˜Â· Ã™â€¦Ã˜Â­Ã™ÂÃ™Ë†Ã˜Â¸ Ã™â€žÃ™â€žÃ˜Â¹Ã™Ë†Ã˜Â¯Ã˜Â© Ã˜Â¥Ã™â€žÃ™â€° Ã™â€¦Ã˜Â³Ã˜Â§Ã˜Â­Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â±Ã˜Â§Ã˜Â¬.', 'Review saved runs and open any saved link back in the extraction workspace.')}</p>
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
            }}
          />
        )}

        {clientPage === CLIENT_PAGES.account && (
          <section className="space-y-4 sm:space-y-5">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-xl font-black text-slate-900 mb-3">{tr(lang, 'بيانات الحساب', 'Account details')}</h2>
                <div className="space-y-3 text-sm">
                  <p><span className="font-bold">{tr(lang, 'البريد:', 'Email:')}</span> {user?.email || '-'}</p>
                  <p><span className="font-bold">{tr(lang, 'الرصيد:', 'Credits:')}</span> {credits ?? '...'}</p>
                  <p><span className="font-bold">{tr(lang, 'الخطة المجانية:', 'Free plan:')}</span> {FREE_PLAN_REQUESTS} {tr(lang, 'روابط فقط', 'links only')}</p>
                  <p><span className="font-bold">{tr(lang, 'المتبقي من المجانية:', 'Free links remaining:')}</span> {freeLinksRemaining} / {FREE_PLAN_REQUESTS}</p>
                  <p><span className="font-bold">{tr(lang, 'تكلفة الرابط:', 'Link cost:')}</span> {CREDIT_COST_PER_SUCCESS} {tr(lang, 'نقطة لكل رابط فيديو جديد', 'credit per new video link')}</p>
                  <p><span className="font-bold">{tr(lang, 'الحالة:', 'Session:')}</span> {tr(lang, 'متصل', 'Active')}</p>
                  {accountAccess.status !== 'active' ? (
                    <p>
                      <span className="font-bold">{tr(lang, 'حالة الوصول:', 'Access status:')}</span>{' '}
                      {accountAccess.status} {accountAccess.reason ? `(${accountAccess.reason})` : ''}
                    </p>
                  ) : null}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, 'الخطط والشحن', 'Plans & top-up')}</h3>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-3">
                  <p className="font-black text-emerald-900 mb-2">{tr(lang, 'الخطة المجانية', 'Free plan')}</p>
                  <p className="text-sm text-emerald-800">{tr(lang, '5 روابط فيديو كبداية، ونفس الفيديو تقدر تعمل له تلخيص وشات بدون خصم إضافي.', '5 video links included, and same-video summary/chat do not consume extra credits.')}</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="font-black text-orange-900 mb-2">{tr(lang, 'الشحن المدفوع', 'Paid top-up')}</p>
                  <p className="text-sm text-orange-800 mb-3">
                    {tr(lang, 'يبدأ من 5$ = 200 كريديت. التفاصيل الكاملة تفتح في صفحة مستقلة بعد اختيار المبلغ.', 'Starts at $5 = 200 credits. Full payment details open on a dedicated page after choosing the amount.')}
                  </p>
                  <button
                    type="button"
                    onClick={openTopupPicker}
                    className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
                  >
                    {tr(lang, 'اختيار مبلغ الشحن', 'Choose top-up amount')}
                  </button>
                </div>
              </article>
            </div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, 'أمان الحساب', 'Account security')}</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, 'كلمة المرور الجديدة', 'New password')}</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder={tr(lang, '8 أحرف على الأقل', 'At least 8 characters')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, 'تأكيد كلمة المرور', 'Confirm password')}</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder={tr(lang, 'أعد إدخال كلمة المرور', 'Re-enter password')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
                  >
                    {passwordSubmitting ? tr(lang, 'جارٍ التحديث...', 'Updating...') : tr(lang, 'تحديث كلمة المرور', 'Update password')}
                  </button>
                </form>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, 'إجراءات سريعة', 'Quick actions')}</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openTopupPicker}
                    className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
                  >
                    {tr(lang, 'فتح صفحة الشحن', 'Open top-up flow')}
                  </button>
                  {canUseLocalGuide && (
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                    >
                      {tr(lang, 'فتح الإعدادات', 'Open settings')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 transition"
                  >
                    {tr(lang, 'تسجيل خروج', 'Sign out')}
                  </button>
                </div>
              </article>
            </div>
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






