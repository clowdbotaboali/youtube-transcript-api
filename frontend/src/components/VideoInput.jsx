import { useState, useEffect } from 'react';
import { FaYoutube, FaSpinner } from 'react-icons/fa';

function VideoInput({ onTranscriptExtracted, loading, setLoading, initialUrl, onUrlChange, apiUrl }) {
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
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('يرجى إدخال رابط فيديو YouTube');
      return;
    }

    setLoading(true);
    
    try {
      const transcriptApiKey = localStorage.getItem('transcriptApiKey') || '';
      
      const response = await fetch(`${apiUrl}/api/transcript/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Transcript-API-Key': transcriptApiKey
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (data.success) {
        if (isLowQualityTranscript(data.transcript, data.wordCount)) {
          setError('تم العثور على نص قصير/غير مفيد (مثل [Music]). جرّب فيديو آخر يحتوي شرحًا كلاميًا واضحًا.');
          return;
        }
        onTranscriptExtracted(data);
        setUrl('');
      } else {
        setError(data.error || 'حدث خطأ أثناء استخراج النص');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم. تأكد من تشغيل Backend');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
    if (onUrlChange) {
      onUrlChange(e.target.value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaYoutube className="text-red-600 text-3xl" />
        <h2 className="text-2xl font-bold text-gray-800">استخراج النص من فيديو YouTube</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={url}
            onChange={handleChange}
            placeholder="أدخل رابط فيديو YouTube هنا..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold mb-1">{error}</p>
            <p className="text-sm">💡 جرب فيديوهات من قنوات كبيرة أو فيديوهات تعليمية - عادة تحتوي على نصوص</p>
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
              <span>جاري الاستخراج...</span>
            </>
          ) : (
            <span>استخراج النص</span>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p className="mb-1">✅ الفيديوهات التي تعمل:</p>
        <ul className="list-disc list-inside space-y-1 mr-2">
          <li>فيديوهات عليها زر CC (Closed Captions)</li>
          <li>فيديوهات من قنوات كبيرة (TED, Khan Academy, إلخ)</li>
          <li>فيديوهات تعليمية ومحاضرات</li>
        </ul>
      </div>
    </div>
  );
}

export default VideoInput;
