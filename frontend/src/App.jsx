import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaMoon, FaSpinner, FaSun } from 'react-icons/fa';
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
import { cleanText, LANG, langBadge, nextLang, tr } from './utils/lang';
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

const buildFallbackVideoBrief = (titleValue, langCode) => {
  const title = cleanText(titleValue || '').trim();
  if (!title) return '';
  const compact = title.length > 90 ? `${title.slice(0, 87).trim()}...` : title;
  const lang = normalizeOutputLanguage(langCode);
  if (lang === 'ar') return `ملخص سريع: ${compact}`;
  if (lang === 'fr') return `Résumé rapide: ${compact}`;
  if (lang === 'es') return `Resumen breve: ${compact}`;
  if (lang === 'de') return `Kurzzusammenfassung: ${compact}`;
  if (lang === 'it') return `Sintesi rapida: ${compact}`;
  if (lang === 'pt') return `Resumo rápido: ${compact}`;
  if (lang === 'tr') return `Kisa ozet: ${compact}`;
  if (lang === 'ru') return `Краткое резюме: ${compact}`;
  if (lang === 'hi') return `संक्षिप्त सार: ${compact}`;
  if (lang === 'id') return `Ringkasan singkat: ${compact}`;
  if (lang === 'ur') return `خلاصہ مختصر: ${compact}`;
  if (lang === 'zh') return `简要摘要：${compact}`;
  if (lang === 'ja') return `要約: ${compact}`;
  if (lang === 'ko') return `요약: ${compact}`;
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
      fallbackAr: 'الحساب غير متاح حاليًا. تواصل مع الدعم.',
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
          setCredits(null);
          setAuthReady(true);
          clearTimeout(authSafetyTimer);
          return;
        }
        setSession(initialSession ?? null);
        setAuthReady(true);
        clearTimeout(authSafetyTimer);
        if (initialSession?.user) {
          await refreshAccount();
        } else {
          setCredits(null);
          setFreeLinksRemaining(FREE_PLAN_REQUESTS);
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

  const toggleLang = () => {
    const next = nextLang(lang);
    setLang(next);
    if (hasWindow) localStorage.setItem('appLang', next);
  };

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

    if (!user?.id || normalizedLang === 'en') {
      setLocalizedDescriptionInstructions(baseInstructions);
      setLocalizedDescriptionLoading(false);
      return;
    }

    if (normalizedLang === 'ar' && baseInstructions.every((line) => isLikelyArabic(line))) {
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
      notify('error', tr(lang, 'فشل الاتصال بالخادم', 'Connection failed'));
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
        notify('error', tr(lang, 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù†ØªÙŠØ¬Ø©.', 'Failed to save result.'));
      }
      return success;
    } catch {
      notify('error', tr(lang, 'ÙØ´Ù„ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù…', 'Connection failed'));
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
      notify('success', tr(lang, 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­.', 'Signed in successfully.'));
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

  const handleLogout = async () => {
    // Force local sign-out immediately in UI and storage.
    clearSupabaseAuthStorage();
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
    } catch {
      // Intentionally ignored.
    }

    notify('success', tr(lang, 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­.', 'Signed out successfully.'));

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
          onToggleLang={toggleLang}
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
              {tr(lang, 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© ØºÙŠØ± Ù…ÙƒØªÙ…Ù„Ø©', 'Authentication configuration is missing')}
            </h1>
            <p className="text-slate-300 text-sm">
              {tr(
                lang,
                'Ø£Ø¶Ù Ù…ØªØºÙŠØ±Ø§Øª VITE_SUPABASE_URL Ùˆ VITE_SUPABASE_ANON_KEY ÙÙŠ Ø¨ÙŠØ¦Ø© Vercel Ø«Ù… Ø£Ø¹Ø¯ Ø§Ù„Ù†Ø´Ø±.',
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
            <span>{tr(lang, 'Ø¬Ø§Ø±ÙŠ ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø¬Ù„Ø³Ø©...', 'Preparing session...')}</span>
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
          <LandingPage onStart={handleLandingStart} lang={lang} theme={theme} />
          <div className="fixed top-4 right-4 z-50 inline-flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border transition ${
                theme === THEME.dark
                  ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-white/90 border-slate-300 text-slate-900 hover:bg-white'
              }`}
              title={tr(lang, 'ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù„ÙŠÙ„ÙŠ/Ø§Ù„Ù†Ù‡Ø§Ø±ÙŠ', 'Toggle dark/light mode', 'Basculer mode sombre/clair')}
            >
              {theme === THEME.dark ? <FaSun /> : <FaMoon />}
            </button>
            <button
              onClick={toggleLang}
              className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition ${
                theme === THEME.dark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800'
                  : 'bg-white/90 border-slate-300 text-slate-900 hover:bg-white'
              }`}
              title={tr(lang, 'ØªØ¨Ø¯ÙŠÙ„ Ø§Ù„Ù„ØºØ©', 'Switch language', 'Changer la langue')}
            >
              {langBadge(nextLang(lang))}
            </button>
          </div>
          <ToastStack items={toasts} onDismiss={dismissToast} />
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onAuthSuccess={authSuccessHandler}
              lang={lang}
              onNotify={notify}
              initialMode={authModalMode}
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
          onToggleLang={toggleLang}
          onToggleTheme={toggleTheme}
          onOpenSettings={canUseLocalGuide ? () => setShowSettings(true) : undefined}
          onOpenPricing={() => setIsPricingModalOpen(true)}
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
            onOpenTopup={() => setIsPricingModalOpen(true)}
          />
        )}

        {clientPage === CLIENT_PAGES.workspace && (
          <section className="space-y-4 sm:space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, 'Ù…Ø³Ø§Ø­Ø© Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø³ÙƒØ±ÙŠØ¨Øª', 'Transcript Extraction Workspace')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, 'Ø¶Ø¹ Ø§Ù„Ø±Ø§Ø¨Ø·ØŒ Ø§Ø³ØªØ®Ø±Ø¬ Ø§Ù„Ù†ØµØŒ Ø«Ù… Ø§Ø¨Ø¯Ø£ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø£Ùˆ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©.', 'Paste a URL, extract transcript, then process or chat.')}</p>
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
                  <span>{showLocalGuide ? tr(lang, 'Ø¥Ø®ÙØ§Ø¡', 'Hide') : tr(lang, 'Ø¥Ø¸Ù‡Ø§Ø±', 'Show')}</span>
                  <span>{tr(lang, 'Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø®Ø§Ø¯Ù… Ø§Ù„Ù…Ø­Ù„ÙŠ', 'Local backend guide')}</span>
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
                        onRequireTopup={() => setIsPricingModalOpen(true)}
                        lang={lang}
                      />
                    </div>
                  </div>
                </div>

                <ProcessingOptions
                  onProcess={handleProcess}
                  loading={processLoading}
                  lang={lang}
                  outputLang={outputLang}
                  onOutputLangChange={(next) => setOutputLang(normalizeOutputLanguage(next))}
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, 'Ø§Ù„Ø³Ø¬Ù„ ÙˆØ§Ù„Ø±ÙˆØ§Ø¨Ø·', 'History & Saved Links')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, 'Ø±Ø§Ø¬Ø¹ Ù†ØªØ§Ø¦Ø¬Ùƒ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© ÙˆØ§Ø®ØªØ± Ø£ÙŠ Ø±Ø§Ø¨Ø· Ù…Ø­ÙÙˆØ¸ Ù„Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø§Ø³ØªØ®Ø±Ø§Ø¬.', 'Review saved runs and open any saved link back in the extraction workspace.')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SavedHistory apiUrl={apiUrl} user={user} lang={lang} onNotify={notify} />
              <SavedLinks onSelectLink={handleSavedLinkSelect} apiUrl={apiUrl} user={user} lang={lang} onNotify={notify} />
            </div>
          </section>
        )}

        {clientPage === CLIENT_PAGES.account && (
          <section className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-black text-slate-900 mb-3">{tr(lang, 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨', 'Account Details')}</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">{tr(lang, 'Ø§Ù„Ø¨Ø±ÙŠØ¯:', 'Email:')}</span> {user?.email || '-'}</p>
                <p><span className="font-bold">{tr(lang, 'Ø§Ù„Ø±ØµÙŠØ¯:', 'Credits:')}</span> {credits ?? '...'}</p>
                <p><span className="font-bold">{tr(lang, 'Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©:', 'Free plan:')}</span> {FREE_PLAN_REQUESTS} {tr(lang, 'Ø±ÙˆØ§Ø¨Ø· ÙÙ‚Ø·', 'links only')}</p>
                <p><span className="font-bold">{tr(lang, 'Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ Ù…Ù† Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©:', 'Free links remaining:')}</span> {freeLinksRemaining} / {FREE_PLAN_REQUESTS}</p>
                <p><span className="font-bold">{tr(lang, 'ØªÙƒÙ„ÙØ© Ø§Ù„Ø±Ø§Ø¨Ø·:', 'Link cost:')}</span> {CREDIT_COST_PER_SUCCESS} {tr(lang, 'Ù†Ù‚Ø·Ø© Ù„ÙƒÙ„ Ø±Ø§Ø¨Ø· ÙÙŠØ¯ÙŠÙˆ Ø¬Ø¯ÙŠØ¯', 'credit per new video link')}</p>
                <p><span className="font-bold">{tr(lang, 'Ø§Ù„Ø­Ø§Ù„Ø©:', 'Session:')}</span> {tr(lang, 'Ù…ØªØµÙ„', 'Active')}</p>
                {accountAccess.status !== 'active' ? (
                  <p>
                    <span className="font-bold">{tr(lang, 'Ø­Ø§Ù„Ø© Ø§Ù„ÙˆØµÙˆÙ„:', 'Access status:')}</span>{' '}
                    {accountAccess.status} {accountAccess.reason ? `(${accountAccess.reason})` : ''}
                  </p>
                ) : null}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, 'Ø§Ù„Ø®Ø·Ø· ÙˆØ§Ù„Ø£Ø³Ø¹Ø§Ø±', 'Plans & Pricing')}</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="font-black text-emerald-900">{tr(lang, 'Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©', 'Free Plan')}</p>
                  <p className="text-xs text-emerald-800 mt-1">{tr(lang, 'Ø§Ø¨Ø¯Ø£ Ù…Ø¬Ø§Ù†Ù‹Ø§ Ø«Ù… Ø§Ø´Ø­Ù† Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©.', 'Start free, then top up when needed.')}</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                  <p className="font-black text-orange-900">{tr(lang, 'Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø©', 'Paid Plan')}</p>
                  <p className="text-xs text-orange-800 mt-1">{tr(lang, 'ØªØ¨Ø¯Ø£ Ù…Ù†', 'Starts at')} {PAID_PLAN_CREDITS} {tr(lang, 'Ù†Ù‚Ø·Ø© Ù…Ù‚Ø§Ø¨Ù„', 'credits for')} ${PAID_PLAN_PRICE_USD}</p>
                  <p className="text-xs text-orange-800">{tr(lang, 'Ù…Ø¹ Ø®ØµÙˆÙ…Ø§Øª ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù„Ù„Ø´Ø­Ù†Ø§Øª Ø§Ù„Ø£ÙƒØ¨Ø±.', 'With automatic bonus credits on larger top-ups.')}</p>
                </div>
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-3">{tr(lang, 'Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø³Ø±ÙŠØ¹Ø©', 'Quick Actions')}</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
                >
                  {tr(lang, 'Ø·Ù„Ø¨ Ø´Ø­Ù†', 'Top-up request')}
                </button>
                {canUseLocalGuide && (
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                  >
                    {tr(lang, 'ÙØªØ­ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª', 'Open settings')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 transition"
                >
                  {tr(lang, 'ØªØ³Ø¬ÙŠÙ„ Ø®Ø±ÙˆØ¬', 'Sign out')}
                </button>
              </div>
            </article>
          </section>
        )}
      </div>

      {isPricingModalOpen && (
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          user={user}
          apiUrl={apiUrl}
          lang={lang}
          theme={theme}
          onNotify={notify}
          onTopupSubmitted={() => {
            refreshAccount();
          }}
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



