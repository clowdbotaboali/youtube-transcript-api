import { useEffect, useMemo, useState } from 'react';
import { FaCog, FaGem, FaSpinner } from 'react-icons/fa';
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
import { supabase } from './utils/supabase';
import defaultApiUrl from './config';
import { getAuthHeaders } from './utils/authHeaders';
import { LANG, tr } from './utils/lang';

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
  const [lang, setLang] = useState(() => localStorage.getItem('appLang') || LANG.ar);
  const [toasts, setToasts] = useState([]);

  const canUseLocalGuide =
    import.meta.env.DEV || (hasWindow && new URLSearchParams(window.location.search).get('dev') === '1');

  const user = session?.user ?? null;

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
        return;
      }
      const response = await fetch(`${apiUrl}/api/me`, {
        headers,
        cache: 'no-store'
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        setCredits(Number(data.data?.credits || 0));
      } else if (response.status === 401) {
        setCredits(null);
      }
    } catch {
      // Keep current credits value to avoid noisy UI resets on transient failures.
    }
  };

  useEffect(() => {
    const authSafetyTimer = setTimeout(() => {
      setAuthReady(true);
    }, 4500);

    const savedUrl = normalizeApiUrl(localStorage.getItem('serverUrl'));
    const savedGuideState = localStorage.getItem('showLocalGuide');
    if (canUseLocalGuide && savedGuideState === 'true') setShowLocalGuide(true);

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
        setSession(initialSession ?? null);
        setAuthReady(true);
        clearTimeout(authSafetyTimer);
        if (initialSession?.user) {
          await refreshAccount();
        } else {
          setCredits(null);
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
        await refreshAccount();
      } else {
        setCredits(null);
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
    const next = lang === LANG.ar ? LANG.en : LANG.ar;
    setLang(next);
    localStorage.setItem('appLang', next);
  };

  const handleTranscriptExtracted = (data) => {
    setTranscriptData(data);
    setAiResult(null);
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
          type
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
        setIsAuthModalOpen(true);
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
      await refreshAccount();
      notify('success', tr(lang, 'تم تسجيل الدخول بنجاح.', 'Signed in successfully.'));
    }
  };

  const rootDir = useMemo(() => (lang === LANG.ar ? 'rtl' : 'ltr'), [lang]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center" dir={rootDir}>
        <div className="flex items-center gap-2 text-sm">
          <FaSpinner className="animate-spin" />
          <span>{tr(lang, 'جاري تجهيز الجلسة...', 'Preparing session...')}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onStart={() => setIsAuthModalOpen(true)} lang={lang} />
        <button
          onClick={toggleLang}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-sm font-semibold"
        >
          {lang === LANG.ar ? 'EN' : 'AR'}
        </button>
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
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir={rootDir}>
      <ToastStack items={toasts} onDismiss={dismissToast} />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 bg-white p-4 rounded-lg shadow-sm gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-lg transition"
            >
              <FaCog />
              <span className="hidden sm:inline">{tr(lang, 'الإعدادات', 'Settings')}</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <FaGem />
              <span className="font-bold">{credits ?? '...'}</span>
              <span className="text-sm">{tr(lang, 'نقطة', 'credits')}</span>
            </div>
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm sm:text-base font-bold"
            >
              {tr(lang, 'اشحن', 'Top up')}
            </button>
            <button
              onClick={toggleLang}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm"
            >
              {lang === LANG.ar ? 'EN' : 'AR'}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg transition text-sm border border-transparent hover:border-red-100"
            >
              {tr(lang, 'خروج', 'Logout')}
            </button>
          </div>

          <div className="text-center order-first sm:order-none">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{tr(lang, 'مساحة العمل', 'Transcript Workspace')}</h1>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              {tr(lang, 'استخرج النص، عالجه بالذكاء الاصطناعي، دردش، واحفظ النتائج.', 'Extract, process with AI, chat, and save your workflow.')}
            </p>
            {user?.email && <p className="text-[11px] text-gray-500 mt-1">{user.email}</p>}
          </div>

          <div className="hidden sm:block w-32" />
        </header>

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
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-3 sm:p-4 border-b lg:border-b-0 lg:border-l border-gray-200">
                  <TranscriptDisplay
                    transcript={transcriptData.transcript}
                    videoId={transcriptData.videoId}
                    wordCount={transcriptData.wordCount}
                  />
                </div>
                <div className="p-3 sm:p-4 h-[400px] sm:h-[600px] flex flex-col">
                  <ChatAssistant transcript={transcriptData.transcript} apiUrl={apiUrl} />
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

        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SavedHistory key={aiResult?.result || user?.id} apiUrl={apiUrl} user={user} />
            <SavedLinks onSelectLink={setSelectedUrl} apiUrl={apiUrl} lang={lang} onNotify={notify} />
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={authSuccessHandler}
          lang={lang}
          onNotify={notify}
        />
      )}

      {isPricingModalOpen && (
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          user={user}
          apiUrl={apiUrl}
          lang={lang}
          onNotify={notify}
          requireLogin={() => {
            setIsPricingModalOpen(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {showSettings && <Settings onClose={() => setShowSettings(false)} lang={lang} />}
    </div>
  );
}

export default App;
