import { useState, useEffect } from 'react';
import { FaKey, FaSave, FaTimes, FaCog, FaExclamationTriangle } from 'react-icons/fa';

function Settings({ onClose }) {
  const [groqApiKey, setGroqApiKey] = useState('');
  const [transcriptApiKey, setTranscriptApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedGroqKey = localStorage.getItem('groqApiKey') || '';
    const savedTranscriptKey = localStorage.getItem('transcriptApiKey') || '';
    setGroqApiKey(savedGroqKey);
    setTranscriptApiKey(savedTranscriptKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('groqApiKey', groqApiKey);
    localStorage.setItem('transcriptApiKey', transcriptApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col my-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <FaCog className="text-blue-600 text-xl sm:text-2xl" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">الإعدادات</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Groq API Key */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                <FaKey className="text-blue-600" />
                <span>Groq API Key (مطلوب)</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">
                للحصول على مفتاح مجاني:{' '}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  console.groq.com
                </a>
              </p>
              <input
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* TranscriptAPI Key */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                <FaKey className="text-green-600" />
                <span>TranscriptAPI.com Key (اختياري)</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">
                للحصول على 100 كريديت مجاني:{' '}
                <a
                  href="https://www.transcriptapi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  transcriptapi.com
                </a>
              </p>
              <input
                type="password"
                value={transcriptApiKey}
                onChange={(e) => setTranscriptApiKey(e.target.value)}
                placeholder="sk_..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 بدون هذا المفتاح، يعتمد النظام على youtube-transcript المجاني
              </p>
            </div>

            {/* Security Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  <strong>ملاحظة أمنية:</strong> المفاتيح تُحفظ في المتصفح فقط (localStorage) ولن تُرسل لأي مكان غير خوادم Groq و TranscriptAPI.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <FaSave />
                <span>تم الحفظ ✓</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>حفظ الإعدادات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
