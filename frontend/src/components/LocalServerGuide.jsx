import { useEffect, useState } from 'react';

const LOCAL_API_URL = 'http://localhost:5000';
const WINDOWS_NGROK_COMMANDS = [
  {
    id: 'ngrok-install',
    label: '1) تثبيت ngrok (مرة واحدة)',
    command: 'winget install Ngrok.Ngrok'
  },
  {
    id: 'ngrok-token',
    label: '2) ربط حساب ngrok (مرة واحدة)',
    command: 'ngrok config add-authtoken <YOUR_NGROK_TOKEN>'
  },
  {
    id: 'ngrok-start',
    label: '3) فتح نفق HTTPS للباك المحلي',
    command: 'ngrok http 5000'
  }
];

const ANDROID_COMMANDS = [
  { id: 'a1', command: 'pkg update -y' },
  { id: 'a2', command: 'pkg install -y nodejs git' },
  { id: 'a3', command: 'git clone https://github.com/clowdbotaboali/youtube-transcript-api.git' },
  { id: 'a4', command: 'cd youtube-transcript-api/backend' },
  { id: 'a5', command: 'npm install' },
  { id: 'a6', command: 'npm run dev' }
];

function LocalServerGuide({ apiUrl, onApiUrlChange }) {
  const [activeTab, setActiveTab] = useState('windows');
  const [localStatus, setLocalStatus] = useState('idle');
  const [checking, setChecking] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [serverUrlInput, setServerUrlInput] = useState(
    localStorage.getItem('serverUrl') || LOCAL_API_URL
  );

  const isSecurePage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const normalizedInput = serverUrlInput.trim().replace(/\/+$/, '');
  const isMixedContentBlocked = isSecurePage && normalizedInput.startsWith('http://');
  const isUsingCustomServer = !!localStorage.getItem('serverUrl');

  const checkLocalServer = async () => {
    const testUrl = normalizedInput || LOCAL_API_URL;
    if (!testUrl) return;

    setChecking(true);
    setLocalStatus('idle');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${testUrl}/`, { signal: controller.signal });
      if (response.ok) {
        setLocalStatus('connected');
      } else {
        setLocalStatus('disconnected');
      }
    } catch (error) {
      setLocalStatus('disconnected');
    } finally {
      clearTimeout(timeout);
      setChecking(false);
    }
  };

  useEffect(() => {
    checkLocalServer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const useLocalServer = () => {
    const urlToUse = normalizedInput || LOCAL_API_URL;
    if (isSecurePage && urlToUse.startsWith('http://')) {
      setLocalStatus('disconnected');
      return;
    }
    localStorage.setItem('serverUrl', urlToUse);
    onApiUrlChange(urlToUse);
  };

  const useRemoteServer = () => {
    localStorage.removeItem('serverUrl');
    setServerUrlInput(LOCAL_API_URL);
    onApiUrlChange(null);
  };

  const copyCommand = async (id, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1200);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1200);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-4 border border-gray-200">
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 mb-4">
        <p className="text-sm sm:text-base">
          اذا واجهت رفض من مزود الخدمة حسب المنطقة، فعل الخادم المحلي ثم اختر Local Server.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('windows')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === 'windows'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          كمبيوتر (Windows)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('android')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === 'android'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          موبايل (Android / Termux)
        </button>
      </div>

      {activeTab === 'windows' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
          <p className="font-semibold">خطوات سريعة:</p>
          <ol className="list-decimal mr-5 space-y-2">
            <li>حمل ملف التشغيل المحلي للباك اند.</li>
            <li>افتح الملف `start-backend.cmd` على جهازك.</li>
            <li>اترك نافذة الطرفية مفتوحة حتى يظهر: http://localhost:5000.</li>
            <li>اضغط فحص الاتصال ثم فعل Local Server.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <a
              href="/start-backend.cmd"
              download
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              تحميل start-backend.cmd
            </a>
          </div>
          <div className="mt-3 border-t pt-3">
            <p className="font-semibold mb-2">لو الواجهة مفتوحة على Vercel (HTTPS)</p>
            <ol className="list-decimal mr-5 space-y-2 mb-3">
              <li>نفذ أوامر ngrok التالية بالترتيب (مرة واحدة للتثبيت والربط).</li>
              <li>بعد تشغيل النفق انسخ رابط `Forwarding` الذي يبدأ بـ `https://`.</li>
              <li>الصق الرابط في خانة رابط الخادم بالأسفل ثم اضغط تفعيل Local Server.</li>
            </ol>
            <div className="space-y-2">
              {WINDOWS_NGROK_COMMANDS.map((item) => (
                <div key={item.id}>
                  <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white border rounded px-3 py-2 text-xs sm:text-sm overflow-x-auto">
                      {item.command}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyCommand(item.id, item.command)}
                      className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold"
                    >
                      {copiedId === item.id ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'android' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
          <p className="font-semibold">خطوات Termux:</p>
          <ol className="list-decimal mr-5 space-y-2">
            <li>ثبت Termux من F-Droid.</li>
            <li>نفذ الأوامر التالية بالترتيب. كل أمر له زر نسخ مستقل:</li>
          </ol>
          <div className="space-y-2">
            {ANDROID_COMMANDS.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <code className="flex-1 bg-white border rounded px-3 py-2 text-xs sm:text-sm overflow-x-auto">
                  {item.command}
                </code>
                <button
                  type="button"
                  onClick={() => copyCommand(item.id, item.command)}
                  className="px-3 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold"
                >
                  {copiedId === item.id ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
            ))}
          </div>
          <p>
            بعد تشغيل السيرفر داخل نفس الموبايل، استخدم الوضع المحلي ثم اختبر الاتصال.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={serverUrlInput}
          onChange={(e) => setServerUrlInput(e.target.value)}
          placeholder="رابط الخادم (مثال: https://xxxx.ngrok-free.app)"
          className="flex-1 min-w-[240px] px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={checkLocalServer}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm"
        >
          {checking ? 'جاري الفحص...' : 'فحص الاتصال'}
        </button>
        <button
          type="button"
          onClick={useLocalServer}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
        >
          تفعيل Local Server
        </button>
        <button
          type="button"
          onClick={useRemoteServer}
          className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold text-sm"
        >
          العودة للوضع الافتراضي
        </button>
      </div>

      {isMixedContentBlocked && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          الصفحة تعمل عبر HTTPS، لذلك لا يمكن استخدام رابط HTTP مثل localhost مباشرة.
          استخدم رابط HTTPS (مثل ngrok) ثم اضغط تفعيل Local Server.
        </div>
      )}

      <div className="mt-3 text-sm text-gray-700">
        <p>
          الحالة الحالية: <span className="font-semibold">{apiUrl}</span>
        </p>
        <p className="mt-1">
          حالة الخادم المحلي:{' '}
          {localStatus === 'connected' && <span className="text-green-700 font-semibold">متصل</span>}
          {localStatus === 'disconnected' && <span className="text-red-700 font-semibold">غير متصل</span>}
          {localStatus === 'idle' && <span className="text-gray-700">غير مفحوص</span>}
          {' | '}
          الوضع: <span className="font-semibold">{isUsingCustomServer ? 'Custom/Local' : 'Default'}</span>
        </p>
      </div>
    </section>
  );
}

export default LocalServerGuide;
