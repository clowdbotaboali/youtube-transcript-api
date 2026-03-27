import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import SavedHistory from './components/SavedHistory';
import Settings from './components/Settings';
import SavedLinks from './components/SavedLinks';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import LandingPage from './components/LandingPage';
import TopupCheckoutPage from './components/TopupCheckoutPage';
import ToastStack from './components/ToastStack';
import ClientHeader, { PAGES as CLIENT_PAGES } from './components/ClientHeader';
import ClientDashboard from './components/ClientDashboard';
import SiteFooter from './components/SiteFooter';
import AccountSection from './components/AccountSection';
import WorkspaceSection from './components/WorkspaceSection';
import SeoMeta from './components/SeoMeta';
import PublicHeader from './components/PublicHeader';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import InsightsIndexPage from './pages/InsightsIndexPage';
import InsightArticlePage from './pages/InsightArticlePage';
import BlogArticlePage, { getBlogRouteInfo } from './pages/BlogArticlePage';
import TranscriptSeoPage from './pages/TranscriptSeoPage';
import { SEO_CONFIG, getSoftwareApplicationSchema } from './seo/seoCatalog';
import { supabase, SUPABASE_CONFIGURED } from './utils/supabase';
import defaultApiUrl from './config';
import { getAuthHeaders } from './utils/authHeaders';
import { formatApiErrorMessage, parseApiError } from './utils/apiError';
import { cleanText, LANG, tr } from './utils/lang';
import {
  DEFAULT_OUTPUT_LANGUAGE,
  normalizeOutputLanguage
} from './utils/outputLanguage';
import {
  FREE_PLAN_REQUESTS, CREDIT_COST_PER_SUCCESS, PAID_PLAN_CREDITS,
  PAID_PLAN_PRICE_USD, THEME, LOGOUT_MARKER_KEY
} from './constants';
import {
  normalizeApiUrl, isValidApiUrl, probeApiUrl, normalizePathname,
  clearEdgeAuthCookie, syncEdgeAuthCookie, readAccountSnapshot,
  writeAccountSnapshot, clearSupabaseAuthStorage, normalizeUiMessage,
  isLikelyArabic, isLikelyEnglish, parseInstructionLines,
  buildFallbackVideoBrief
} from './helpers';

const hasWindow = typeof window !== 'undefined';
const STATIC_ROUTES = new Set([
  '/privacy-policy',
  '/terms',
  '/refund-policy',
  '/contact',
  '/pricing',
  '/admin',
  '/about',
  '/insights'
]);

const getLangFromPath = (pathValue) => {
  const match = normalizePathname(pathValue).match(/^\/(en|ar|fr)(?:\/|$)/i);
  if (!match) return null;
  const next = String(match[1] || '').toLowerCase();
  if (next === LANG.ar || next === LANG.fr) return next;
  return LANG.en;
};

const getTranscriptSlugFromPath = (pathValue) => {
  const match = normalizePathname(pathValue).match(/^\/transcript\/([a-z0-9-]+)$/i);
  if (!match) return '';
  return String(match[1] || '').trim().toLowerCase();
};

const getInsightSlugFromPath = (pathValue) => {
  const match = normalizePathname(pathValue).match(/^\/insights\/([a-z0-9-]+)$/i);
  if (!match) return '';
  return String(match[1] || '').trim().toLowerCase();
};

const getHomeAlternates = () => [
  { hreflang: 'en', href: `${SEO_CONFIG.SITE_ORIGIN}/en` },
  { hreflang: 'ar', href: `${SEO_CONFIG.SITE_ORIGIN}/ar` },
  { hreflang: 'fr', href: `${SEO_CONFIG.SITE_ORIGIN}/fr` },
  { hreflang: 'x-default', href: `${SEO_CONFIG.SITE_ORIGIN}/en` }
];



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
  const [lang, setLang] = useState(() => {
    if (!hasWindow) return LANG.en;
    return getLangFromPath(window.location.pathname) || localStorage.getItem('appLang') || LANG.en;
  });
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
  const [currentPath, setCurrentPath] = useState(() => (hasWindow ? normalizePathname(window.location.pathname) : '/'));
  const videoBriefCacheRef = useRef(new Map());
  const refreshingAccountRef = useRef(false);

  const canUseLocalGuide =
    import.meta.env.DEV || (hasWindow && new URLSearchParams(window.location.search).get('dev') === '1');

  const user = session?.user ?? null;
  const blogRouteInfo = useMemo(() => getBlogRouteInfo(currentPath), [currentPath]);
  const transcriptSeoSlug = useMemo(() => getTranscriptSlugFromPath(currentPath), [currentPath]);
  const insightSlug = useMemo(() => getInsightSlugFromPath(currentPath), [currentPath]);
  const isStaticRoute = STATIC_ROUTES.has(currentPath) || Boolean(blogRouteInfo) || Boolean(transcriptSeoSlug) || Boolean(insightSlug);
  const isLocalizedHome = /^\/(en|ar|fr)$/i.test(currentPath);
  const isHomePath = currentPath === '/' || isLocalizedHome;
  const isToolPath = currentPath === '/tool';
  const toolRobots = isToolPath ? 'noindex, follow' : '';
  const schemaPath = currentPath === '/tool'
    ? '/tool'
    : isHomePath
      ? currentPath
      : transcriptSeoSlug
        ? `/transcript/${transcriptSeoSlug}`
        : '/';
  const rootAlternates = useMemo(() => (isHomePath ? getHomeAlternates() : []), [isHomePath]);
  const softwareSchema = useMemo(() => {
    if (currentPath !== '/tool' && !isHomePath) return null;
    return getSoftwareApplicationSchema(schemaPath);
  }, [currentPath, isHomePath, schemaPath]);

  useEffect(() => {
    if (!hasWindow) return;
    const handler = () => setCurrentPath(normalizePathname(window.location.pathname));
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    const routeLang = getLangFromPath(currentPath);
    if (!routeLang || routeLang === lang) return;
    setLang(routeLang);
    if (hasWindow) localStorage.setItem('appLang', routeLang);
  }, [currentPath, lang]);

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
    const normalizedNextPath = normalizePathname(nextPath);
    window.history.replaceState({}, '', normalizedNextPath);
    setCurrentPath(normalizedNextPath);
    if (normalizedNextPath === '/dashboard') {
      setClientPage(CLIENT_PAGES.dashboard);
    }
  }, [currentPath, user?.id]);

  useEffect(() => {
    if (!hasWindow || !user?.id) return;
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    if (params.has('order') && success) {
      if (success === 'true') {
        notify('success', tr(lang, 'تم الدفع بنجاح! تم تحديث رصيد الفيديوهات الخاص بك.', 'Payment successful! Your video balance was updated.', 'Paiement reussi ! Votre solde de videos a ete mis a jour.'));
        refreshAccount();
      } else if (success === 'false') {
        notify('error', tr(lang, 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.', 'Payment failed. Please try again.', 'Le paiement a echoue. Veuillez reessayer.'));
      }
      window.history.replaceState({}, '', currentPath);
    }
  }, [currentPath, lang, notify, user?.id]);

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
    if (currentPath === '/about') return <AboutPage lang={lang} theme={theme} />;
    if (currentPath === '/insights') return <InsightsIndexPage lang={lang} theme={theme} />;
    if (blogRouteInfo) return <BlogArticlePage routeInfo={blogRouteInfo} theme={theme} />;
    if (transcriptSeoSlug) return <TranscriptSeoPage slug={transcriptSeoSlug} apiUrl={apiUrl} theme={theme} />;
    if (insightSlug) return <InsightArticlePage slug={insightSlug} lang={lang} theme={theme} />;
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
          path={schemaPath}
          alternates={rootAlternates}
          canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
          robots={toolRobots}
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
          path={schemaPath}
          alternates={rootAlternates}
          canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
          structuredData={softwareSchema}
          robots={toolRobots}
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
        path={schemaPath}
        alternates={rootAlternates}
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        structuredData={softwareSchema}
        robots={toolRobots}
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
          <WorkspaceSection
            lang={lang}
            apiUrl={apiUrl}
            outputLang={outputLang}
            onOutputLangChange={(next) => setOutputLang(normalizeOutputLanguage(next))}
            accountRestrictionMessage={accountRestrictionMessage}
            canUseLocalGuide={canUseLocalGuide}
            showLocalGuide={showLocalGuide}
            onToggleLocalGuide={toggleLocalGuide}
            onApiUrlChange={handleApiUrlChange}
            extractLoading={extractLoading}
            setExtractLoading={setExtractLoading}
            selectedUrl={selectedUrl}
            onTranscriptExtracted={handleTranscriptExtracted}
            transcriptData={transcriptData}
            transcriptForProcessing={transcriptForProcessing}
            videoBrief={videoBrief}
            videoBriefLoading={videoBriefLoading}
            localizedDescriptionInstructions={localizedDescriptionInstructions}
            localizedDescriptionLoading={localizedDescriptionLoading}
            extraContext={extraContext}
            onExtraContextChange={setExtraContext}
            onCreditsChange={setCredits}
            onRequireTopup={openTopupPicker}
            processLoading={processLoading}
            onProcess={handleProcess}
            aiResult={aiResult}
            onSave={handleSave}
            user={user}
            onNotify={notify}
          />
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
          <AccountSection
            lang={lang}
            theme={theme}
            user={user}
            credits={credits}
            freeLinksRemaining={freeLinksRemaining}
            freePlanLimit={freePlanLimit}
            accountAccess={accountAccess}
            recentTopupRequests={recentTopupRequests}
            recentTopupLoading={recentTopupLoading}
            passwordForm={passwordForm}
            passwordSubmitting={passwordSubmitting}
            onPasswordFormChange={setPasswordForm}
            onPasswordSubmit={handlePasswordChange}
            onOpenTopupPicker={openTopupPicker}
            onOpenSettings={() => setShowSettings(true)}
            onLogout={handleLogout}
            canUseLocalGuide={canUseLocalGuide}
            CREDIT_COST_PER_SUCCESS={CREDIT_COST_PER_SUCCESS}
          />
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






