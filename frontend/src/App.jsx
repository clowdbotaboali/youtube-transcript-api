import { useEffect, useMemo, useState } from 'react';
import { FaMoon, FaSpinner, FaSun } from 'react-icons/fa';
import VideoInput from './components/VideoInput';
import TranscriptDisplay from './components/TranscriptDisplay';
import ProcessingOptions from './components/ProcessingOptions';
import ResultsDisplay from './components/ResultsDisplay';
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
import { LANG, langBadge, nextLang, tr } from './utils/lang';

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
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [credits, setCredits] = useState(null);
  const [freeLinksRemaining, setFreeLinksRemaining] = useState(FREE_PLAN_REQUESTS);
  const [clientPage, setClientPage] = useState(CLIENT_PAGES.dashboard);
  const [lang, setLang] = useState(() => (hasWindow ? localStorage.getItem('appLang') || LANG.ar : LANG.ar));
  const [theme, setTheme] = useState(() => (hasWindow ? localStorage.getItem('appTheme') || THEME.light : THEME.light));
  const [toasts, setToasts] = useState([]);
  const [currentPath, setCurrentPath] = useState(() => (hasWindow ? window.location.pathname : '/'));

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

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const notify = (type, message) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const refreshAccount = async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        setCredits(null);
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
        return;
      }
      const response = await fetch(`${apiUrl}/api/me`, {
        headers,
        cache: 'no-store'
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setCredits(Number(data.data?.credits || 0));
        setFreeLinksRemaining(
          Number.isFinite(Number(data.data?.freeLinksRemaining))
            ? Number(data.data.freeLinksRemaining)
            : FREE_PLAN_REQUESTS
        );
      } else if (response.status === 401) {
        setCredits(null);
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
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
        setCredits(null);
        setFreeLinksRemaining(FREE_PLAN_REQUESTS);
        setTranscriptData(null);
        setAiResult(null);
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
    setAiResult(null);
    if (typeof data?.creditsLeft === 'number') {
      setCredits(data.creditsLeft);
    }
    if (data?.chargedForNewVideo === true) {
      setFreeLinksRemaining((prev) => Math.max(Number(prev || 0) - 1, 0));
    }
    setClientPage(CLIENT_PAGES.workspace);
  };

  const handleProcess = async (type) => {
    if (!transcriptData) return;
    if (!user) {
      setIsAuthModalOpen(true);
      notify('info', tr(lang, 'يرجى تسجيل الدخول لاستخدام المعالجة بالذكاء الاصطناعي.', 'Please sign in to use AI processing.'));
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
          transcript: transcriptData.transcript,
          type,
          videoId: transcriptData.videoId
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
        notify('error', tr(lang, 'لا توجد نقاط كافية. يرجى شحن الرصيد.', 'No credits left. Please top up.'));
      } else if (response.status === 401) {
        setSession(null);
        supabase.auth.signOut().catch(() => {});
        notify('error', tr(lang, 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.', 'Session expired. Please sign in again.'));
      } else {
        notify('error', tr(lang, `خطأ: ${data.error || 'فشلت المعالجة'}`, `Error: ${data.error || 'Processing failed'}`));
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
        notify('error', tr(lang, 'تعذر حفظ النتيجة.', 'Failed to save result.'));
      }
      return success;
    } catch {
      notify('error', tr(lang, 'فشل الاتصال بالخادم', 'Connection failed'));
      return false;
    }
  };

  const authSuccessHandler = async (nextSession) => {
    setSession(nextSession ?? null);
    setIsAuthModalOpen(false);
    if (nextSession?.user) {
      setClientPage(CLIENT_PAGES.dashboard);
      await refreshAccount();
      notify('success', tr(lang, 'تم تسجيل الدخول بنجاح.', 'Signed in successfully.'));
    }
  };

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
    setTranscriptData(null);
    setAiResult(null);
    setClientPage(CLIENT_PAGES.dashboard);
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

    notify('success', tr(lang, 'تم تسجيل الخروج بنجاح.', 'Signed out successfully.'));

    // Hard refresh to guarantee no in-memory auth state survives.
    if (hasWindow) {
      localStorage.setItem(LOGOUT_MARKER_KEY, '1');
      window.location.replace('/');
    }
  };

  const rootDir = useMemo(() => (lang === LANG.ar ? 'rtl' : 'ltr'), [lang]);

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
              {tr(lang, 'إعدادات المصادقة غير مكتملة', 'Authentication configuration is missing')}
            </h1>
            <p className="text-slate-300 text-sm">
              {tr(
                lang,
                'أضف متغيرات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في بيئة Vercel ثم أعد النشر.',
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
            <span>{tr(lang, 'جاري تجهيز الجلسة...', 'Preparing session...')}</span>
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
          <LandingPage onStart={() => setIsAuthModalOpen(true)} lang={lang} theme={theme} />
          <div className="fixed top-4 right-4 z-50 inline-flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border transition ${
                theme === THEME.dark
                  ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-white/90 border-slate-300 text-slate-900 hover:bg-white'
              }`}
              title={tr(lang, 'تبديل الوضع الليلي/النهاري', 'Toggle dark/light mode', 'Basculer mode sombre/clair')}
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
              title={tr(lang, 'تبديل اللغة', 'Switch language', 'Changer la langue')}
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, 'مساحة استخراج السكريبت', 'Transcript Extraction Workspace')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, 'ضع الرابط، استخرج النص، ثم ابدأ المعالجة أو الدردشة.', 'Paste a URL, extract transcript, then process or chat.')}</p>
            </div>

            {canUseLocalGuide && (
              <div className="mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={toggleLocalGuide}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                >
                  <span>{showLocalGuide ? tr(lang, 'إخفاء', 'Hide') : tr(lang, 'إظهار', 'Show')}</span>
                  <span>{tr(lang, 'دليل الخادم المحلي', 'Local backend guide')}</span>
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
            />

            {transcriptData && (
              <div className="space-y-4 sm:space-y-6">
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
                        transcript={transcriptData.transcript}
                        videoId={transcriptData.videoId}
                        apiUrl={apiUrl}
                        onCreditsChange={setCredits}
                        onRequireTopup={() => setIsPricingModalOpen(true)}
                        lang={lang}
                      />
                    </div>
                  </div>
                </div>

                <ProcessingOptions onProcess={handleProcess} loading={processLoading} lang={lang} />

                {aiResult && (
                  <ResultsDisplay
                    result={aiResult.result}
                    type={aiResult.type}
                    videoId={transcriptData.videoId}
                    videoTitle={transcriptData.videoId}
                    transcript={transcriptData.transcript}
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
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{tr(lang, 'السجل والروابط', 'History & Saved Links')}</h2>
              <p className="text-sm text-slate-600">{tr(lang, 'راجع نتائجك السابقة واختر أي رابط محفوظ للعودة إلى مساحة الاستخراج.', 'Review saved runs and open any saved link back in the extraction workspace.')}</p>
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
              <h2 className="text-xl font-black text-slate-900 mb-3">{tr(lang, 'بيانات الحساب', 'Account Details')}</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">{tr(lang, 'البريد:', 'Email:')}</span> {user?.email || '-'}</p>
                <p><span className="font-bold">{tr(lang, 'الرصيد:', 'Credits:')}</span> {credits ?? '...'}</p>
                <p><span className="font-bold">{tr(lang, 'الخطة المجانية:', 'Free plan:')}</span> {FREE_PLAN_REQUESTS} {tr(lang, 'روابط فقط', 'links only')}</p>
                <p><span className="font-bold">{tr(lang, 'المتبقي من المجانية:', 'Free links remaining:')}</span> {freeLinksRemaining} / {FREE_PLAN_REQUESTS}</p>
                <p><span className="font-bold">{tr(lang, 'تكلفة الرابط:', 'Link cost:')}</span> {CREDIT_COST_PER_SUCCESS} {tr(lang, 'نقطة لكل رابط فيديو جديد', 'credit per new video link')}</p>
                <p><span className="font-bold">{tr(lang, 'الحالة:', 'Session:')}</span> {tr(lang, 'متصل', 'Active')}</p>
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, 'الخطط والأسعار', 'Plans & Pricing')}</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="font-black text-emerald-900">{tr(lang, 'الخطة المجانية', 'Free Plan')}</p>
                  <p className="text-xs text-emerald-800 mt-1">{tr(lang, 'ابدأ مجانًا ثم اشحن عند الحاجة.', 'Start free, then top up when needed.')}</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                  <p className="font-black text-orange-900">{tr(lang, 'الخطة المدفوعة', 'Paid Plan')}</p>
                  <p className="text-xs text-orange-800 mt-1">{tr(lang, 'تبدأ من', 'Starts at')} {PAID_PLAN_CREDITS} {tr(lang, 'نقطة مقابل', 'credits for')} ${PAID_PLAN_PRICE_USD}</p>
                  <p className="text-xs text-orange-800">{tr(lang, 'مع خصومات تلقائية للشحنات الأكبر.', 'With automatic bonus credits on larger top-ups.')}</p>
                </div>
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-3">{tr(lang, 'إجراءات سريعة', 'Quick Actions')}</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
                >
                  {tr(lang, 'طلب شحن', 'Top-up request')}
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
          requireLogin={() => {
            setIsPricingModalOpen(false);
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
