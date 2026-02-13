import { useState, useEffect } from 'react';
import { FaCog } from 'react-icons/fa';
import VideoInput from './components/VideoInput';
import TranscriptDisplay from './components/TranscriptDisplay';
import ProcessingOptions from './components/ProcessingOptions';
import ResultsDisplay from './components/ResultsDisplay';
import SavedHistory from './components/SavedHistory';
import Settings from './components/Settings';
import ChatAssistant from './components/ChatAssistant';
import SavedLinks from './components/SavedLinks';
import defaultApiUrl from './config';

function App() {
  const [transcriptData, setTranscriptData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);

  useEffect(() => {
    const savedUrl = localStorage.getItem('serverUrl');
    if (savedUrl) {
      setApiUrl(savedUrl);
    }
  }, []);

  const handleTranscriptExtracted = (data) => {
    setTranscriptData(data);
    setAiResult(null);
  };

  const handleProcess = async (type) => {
    if (!transcriptData) return;

    setProcessLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      } else {
        alert('حدث خطأ: ' + (data.error || 'فشل في معالجة النص'));
      }
    } catch (error) {
      alert('فشل الاتصال بالخادم');
    } finally {
      setProcessLoading(false);
    }
  };

  const handleSave = async (saveData) => {
    try {
      const response = await fetch(`${apiUrl}/api/history/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      const data = await response.json();
      if (data.success) {
        return true;
      } else {
        alert('فشل في حفظ البيانات');
        return false;
      }
    } catch (error) {
      alert('فشل الاتصال بالخادم');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header - Mobile Responsive */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 bg-white p-4 rounded-lg shadow-sm gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-gray-100 text-gray-700 rounded-lg transition bg-gray-50"
          >
            <FaCog />
            <span>الإعدادات</span>
          </button>
          
          <div className="text-center order-first sm:order-none">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              استخراج ومعالجة نصوص YouTube
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
              استخرج النصوص من فيديوهات YouTube وعالجها بالذكاء الاصطناعي
            </p>
          </div>
          
          <div className="hidden sm:block w-24"></div>
        </header>

        <VideoInput
          onTranscriptExtracted={handleTranscriptExtracted}
          loading={extractLoading}
          setLoading={setExtractLoading}
          initialUrl={selectedUrl}
        />

        {transcriptData && (
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Transcript & Chat - Mobile Responsive */}
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
                    videoId={transcriptData.videoId}
                    apiUrl={apiUrl}
                  />
                </div>
              </div>
            </div>

            <ProcessingOptions
              onProcess={handleProcess}
              loading={processLoading}
            />

            {aiResult && (
              <ResultsDisplay
                result={aiResult.result}
                type={aiResult.type}
                videoId={transcriptData.videoId}
                videoTitle={transcriptData.videoId}
                transcript={transcriptData.transcript}
                onSave={handleSave}
                apiUrl={apiUrl}
              />
            )}
          </div>
        )}

        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SavedHistory key={aiResult?.result} apiUrl={apiUrl} />
            <SavedLinks onSelectLink={setSelectedUrl} apiUrl={apiUrl} />
          </div>
        </div>

        <footer className="text-center mt-6 text-gray-600 text-xs sm:text-sm">
          <p>مشروع استخراج نصوص YouTube - للاستخدام الشخصي</p>
        </footer>
      </div>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
