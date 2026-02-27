import { useEffect, useState } from 'react';
import { FaCog, FaGem } from 'react-icons/fa';
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

function App() {
  const [transcriptData, setTranscriptData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLocalGuide, setShowLocalGuide] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [credits, setCredits] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('appLang') || LANG.ar);

  useEffect(() => {
    const savedUrl = normalizeApiUrl(localStorage.getItem('serverUrl'));
    const savedGuideState = localStorage.getItem('showLocalGuide');
    if (savedGuideState === 'true') setShowLocalGuide(true);

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCredits(session?.user?.user_metadata?.credits ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCredits(session?.user?.user_metadata?.credits ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleApiUrlChange = (nextApiUrl) => {
    const normalized = normalizeApiUrl(nextApiUrl);
    setApiUrl(normalized || defaultApiUrl);
  };

  const toggleLocalGuide = () => {
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

      const data = await response.json();
      if (data.success) {
        setAiResult({
          result: data.result,
          type: data.type
        });
        setCredits(data.creditsLeft);
      } else if (response.status === 403) {
        alert(tr(lang, 'لا يوجد رصيد كافٍ. اشحن رصيدك.', 'No credits left. Please top up.'));
      } else if (response.status === 401) {
        setIsAuthModalOpen(true);
      } else {
        alert(tr(lang, `خطأ: ${data.error || 'فشلت المعالجة'}`, `Error: ${data.error || 'Processing failed'}`));
      }
    } catch {
      alert(tr(lang, 'فشل الاتصال بالخادم', 'Connection failed'));
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

      const data = await response.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

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
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={(nextUser) => {
              setUser(nextUser);
              setIsAuthModalOpen(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
          </div>

          <div className="hidden sm:block w-32" />
        </header>

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

        {showLocalGuide && <LocalServerGuide apiUrl={apiUrl} onApiUrlChange={handleApiUrlChange} lang={lang} />}

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
                  <ChatAssistant
                    transcript={transcriptData.transcript}
                    apiUrl={apiUrl}
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
              />
            )}
          </div>
        )}

        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SavedHistory key={aiResult?.result || user?.id} apiUrl={apiUrl} user={user} />
            <SavedLinks onSelectLink={setSelectedUrl} apiUrl={apiUrl} lang={lang} />
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(nextUser) => {
            setUser(nextUser);
            setIsAuthModalOpen(false);
          }}
        />
      )}

      {isPricingModalOpen && (
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          user={user}
          apiUrl={apiUrl}
          lang={lang}
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
