import { useState, useEffect } from 'react';
import { FaYoutube, FaSpinner } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';
import { getAuthHeaders } from '../utils/authHeaders';

function VideoInput({ onTranscriptExtracted, loading, setLoading, initialUrl, onUrlChange, apiUrl, lang = LANG.ar }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isLowQualityTranscript = (text = '', wordCount = 0) => {
    const normalized = String(text || '')
      .replace(/\[[^\]]*]/g, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = normalized ? normalized.split(/\s+/).filter(Boolean) : [];
    const unique = new Set(words.map((w) => w.toLowerCase())).size;
    const count = Number(wordCount) || words.length;
    return count < 20 || unique < 10;
  };

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError(tr(lang, 'يرجى إدخال رابط فيديو يوتيوب', 'Please enter a YouTube URL'));
      return;
    }

    setLoading(true);
    let isSettled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    const failSafeId = setTimeout(() => {
      if (!isSettled) {
        setError(tr(lang, 'انتهت المهلة. تأكد من تسجيل الدخول ثم حاول مرة أخرى.', 'Request timed out. Please re-login and try again.'));
        setLoading(false);
      }
    }, 60000);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/transcript/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ url: url.trim() }),
        signal: controller.signal
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error || raw || tr(lang, 'حدث خطأ أثناء استخراج النص', 'Transcript extraction failed'));
        return;
      }

      if (data.success) {
        if (isLowQualityTranscript(data.transcript, data.wordCount)) {
          setError(tr(lang, 'تم العثور على نص قصير أو غير مفيد. جرّب فيديو أوضح.', 'Low-quality transcript detected. Try another video.'));
          return;
        }
        onTranscriptExtracted(data);
        setUrl('');
      } else {
        setError(data.error || tr(lang, 'حدث خطأ أثناء استخراج النص', 'Transcript extraction failed'));
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        setError(tr(lang, 'انتهت مهلة الاستخراج. جرّب مرة أخرى.', 'Extraction timed out. Please try again.'));
      } else {
        setError(tr(lang, 'فشل الاتصال بالخادم', 'Connection failed'));
      }
    } finally {
      isSettled = true;
      clearTimeout(timeoutId);
      clearTimeout(failSafeId);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
    if (onUrlChange) onUrlChange(e.target.value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-4">
        <FaYoutube className="text-red-600 text-3xl" />
        <h2 className="text-2xl font-bold text-gray-800">{tr(lang, 'استخراج السكريبت من يوتيوب', 'Extract transcript from YouTube')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={url}
            onChange={handleChange}
            placeholder={tr(lang, 'أدخل رابط الفيديو هنا...', 'Paste YouTube URL here...')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>{tr(lang, 'جارٍ الاستخراج...', 'Extracting...')}</span>
            </>
          ) : (
            <span>{tr(lang, 'استخراج النص', 'Extract transcript')}</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default VideoInput;
