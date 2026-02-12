import API_URL from './config';;
import { FaCog } from 'react-icons/fa';
import VideoInput from './components/VideoInput';
import TranscriptDisplay from './components/TranscriptDisplay';
import ProcessingOptions from './components/ProcessingOptions';
import ResultsDisplay from './components/ResultsDisplay';
import SavedHistory from './components/SavedHistory';
import Settings from './components/Settings';
import ChatAssistant from './components/ChatAssistant';
import SavedLinks from './components/SavedLinks';

function App() {
  const [transcriptData, setTranscriptData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');

  const handleTranscriptExtracted = (data) => {
    setTranscriptData(data);
    setAiResult(null);
  };

  const handleProcess = async (type) => {
    if (!transcriptData) return;

    setProcessLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai/process`, {
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
      const response = await fetch(`${API_URL}/api/history/save`, {
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
      <div className="max-w-[95%] mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-lg transition"
          >
            <FaCog />
            <span>الإعدادات</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              استخراج ومعالجة نصوص YouTube
            </h1>
            <p className="text-gray-600 text-sm">
              استخرج النصوص من فيديوهات YouTube وعالجها بالذكاء الاصطناعي
            </p>
          </div>
          
          <div className="w-24"></div>
        </header>

        <VideoInput
          onTranscriptExtracted={handleTranscriptExtracted}
          loading={extractLoading}
          setLoading={setExtractLoading}
          initialUrl={selectedUrl}
        />

        {transcriptData && (
          <div className="mt-6">
            <div className="bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-4 border-l border-gray-200">
                  <TranscriptDisplay
                    transcript={transcriptData.transcript}
                    videoId={transcriptData.videoId}
                    wordCount={transcriptData.wordCount}
                  />
                </div>
                <div className="p-4 h-[600px] flex flex-col">
                  <ChatAssistant
                    transcript={transcriptData.transcript}
                    videoId={transcriptData.videoId}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <ProcessingOptions
                onProcess={handleProcess}
                loading={processLoading}
              />
            </div>

            {aiResult && (
              <div className="mt-6">
                <ResultsDisplay
                  result={aiResult.result}
                  type={aiResult.type}
                  videoId={transcriptData.videoId}
                  videoTitle={transcriptData.videoId}
                  transcript={transcriptData.transcript}
                  onSave={handleSave}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SavedHistory key={aiResult?.result} />
            <SavedLinks onSelectLink={setSelectedUrl} />
          </div>
        </div>

        <footer className="text-center mt-6 text-gray-600 text-sm">
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
