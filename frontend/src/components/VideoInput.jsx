import { useEffect, useState } from 'react';
import { FaSpinner, FaYoutube } from 'react-icons/fa';
import { getAuthHeaders } from '../utils/authHeaders';
import { formatApiErrorMessage } from '../utils/apiError';
import { LANG, tr } from '../utils/lang';

function VideoInput({
  onTranscriptExtracted,
  loading,
  setLoading,
  initialUrl,
  onUrlChange,
  apiUrl,
  lang = LANG.ar,
  accessRestrictionMessage = ''
}) {
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
      setError(tr(lang, 'يرجى إدخال رابط فيديو يوتيوب', 'Please enter a YouTube URL', 'Veuillez saisir un lien YouTube'));
      return;
    }
    if (accessRestrictionMessage) {
      setError(String(accessRestrictionMessage));
      return;
    }

    setLoading(true);
    let settled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    const failSafeId = setTimeout(() => {
      if (!settled) {
        setError(
          tr(
            lang,
            'انتهت المهلة. تأكد من تسجيل الدخول ثم حاول مرة أخرى.',
            'Request timed out. Please re-login and try again.',
            'Delai depasse. Reconnectez-vous puis reessayez.'
          )
        );
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
        setError(
          formatApiErrorMessage({
            payload: data,
            status: response.status,
            lang,
            fallbackAr: 'حدث خطأ أثناء استخراج النص.',
            fallbackEn: 'Transcript extraction failed.',
            fallbackFr: "Echec de l'extraction de la transcription."
          })
        );
        return;
      }

      if (data.success) {
        if (isLowQualityTranscript(data.transcript, data.wordCount)) {
          setError(
            tr(
              lang,
              'تم العثور على نص قصير أو غير مفيد. جرّب فيديو أوضح.',
              'Low-quality transcript detected. Try another video.',
              'Transcription faible detectee. Essayez une autre video.'
            )
          );
          return;
        }
        onTranscriptExtracted(data);
        setUrl('');
      } else {
        setError(
          formatApiErrorMessage({
            payload: data,
            status: response.status,
            lang,
            fallbackAr: 'حدث خطأ أثناء استخراج النص.',
            fallbackEn: 'Transcript extraction failed.',
            fallbackFr: "Echec de l'extraction de la transcription."
          })
        );
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        setError(
          tr(
            lang,
            'انتهت مهلة الاستخراج. جرّب مرة أخرى.',
            'Extraction timed out. Please try again.',
            "Delai d'extraction depasse. Reessayez."
          )
        );
      } else {
        setError(tr(lang, 'فشل الاتصال بالخادم', 'Connection failed', 'Echec de connexion'));
      }
    } finally {
      settled = true;
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
        <h2 className="text-2xl font-bold text-gray-800">
          {tr(lang, 'استخراج السكريبت من يوتيوب', 'Extract transcript from YouTube', 'Extraire la transcription YouTube')}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={url}
            onChange={handleChange}
            placeholder={tr(lang, 'أدخل رابط الفيديو هنا...', 'Paste YouTube URL here...', 'Collez le lien video ici...')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading || Boolean(accessRestrictionMessage)}
          />
        </div>

        {accessRestrictionMessage ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{String(accessRestrictionMessage)}</p>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">{String(error)}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || Boolean(accessRestrictionMessage)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>{tr(lang, 'جارٍ الاستخراج...', 'Extracting...', 'Extraction en cours...')}</span>
            </>
          ) : (
            <span>{tr(lang, 'استخراج النص', 'Extract transcript', 'Extraire la transcription')}</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default VideoInput;
