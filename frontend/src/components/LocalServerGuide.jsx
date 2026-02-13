import { useEffect, useState } from 'react';

const LOCAL_API_URL = 'http://localhost:5000';

function LocalServerGuide({ apiUrl, onApiUrlChange }) {
  const [activeTab, setActiveTab] = useState('windows');
  const [localStatus, setLocalStatus] = useState('idle');
  const [checking, setChecking] = useState(false);

  const isUsingLocal = apiUrl === LOCAL_API_URL;

  const checkLocalServer = async () => {
    setChecking(true);
    setLocalStatus('idle');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${LOCAL_API_URL}/`, { signal: controller.signal });
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
  }, []);

  const useLocalServer = () => {
    localStorage.setItem('serverUrl', LOCAL_API_URL);
    onApiUrlChange(LOCAL_API_URL);
  };

  const useRemoteServer = () => {
    localStorage.removeItem('serverUrl');
    onApiUrlChange(null);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border-2 border-amber-300">
      <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-4 mb-4">
        <h2 className="text-lg sm:text-xl font-bold mb-2">تنبيه مهم قبل الاستخدام</h2>
        <p className="text-sm sm:text-base">
          بسبب قيود بعض مزودي API حسب المنطقة، شغل الخادم المحلي اولا ثم اختر وضع Local Server.
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
            <li>اترك نافذة الطرفية مفتوحة حتى يظهر: `http://localhost:5000`.</li>
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
        </div>
      )}

      {activeTab === 'android' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
          <p className="font-semibold">خطوات Termux:</p>
          <ol className="list-decimal mr-5 space-y-2">
            <li>ثبت Termux من F-Droid.</li>
            <li>نفذ الاوامر التالية:</li>
          </ol>
          <pre className="bg-white border rounded p-3 overflow-x-auto text-xs sm:text-sm">
pkg update -y
pkg install -y nodejs git
git clone https://github.com/clowdbotaboali/youtube-transcript-api.git
cd youtube-transcript-api/backend
npm install
npm run dev
          </pre>
          <p>
            بعد تشغيل السيرفر داخل نفس الموبايل، استخدم الوضع المحلي ثم اختبر الاتصال.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={checkLocalServer}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm"
        >
          {checking ? 'جاري الفحص...' : 'فحص اتصال localhost:5000'}
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

      <div className="mt-3 text-sm">
        <p>
          الحالة الحالية: <span className="font-semibold">{apiUrl}</span>
        </p>
        <p className="mt-1">
          حالة الخادم المحلي:{' '}
          {localStatus === 'connected' && <span className="text-green-700 font-semibold">متصل</span>}
          {localStatus === 'disconnected' && <span className="text-red-700 font-semibold">غير متصل</span>}
          {localStatus === 'idle' && <span className="text-gray-700">غير مفحوص</span>}
          {' | '}
          الوضع: <span className="font-semibold">{isUsingLocal ? 'Local' : 'Default'}</span>
        </p>
      </div>
    </section>
  );
}

export default LocalServerGuide;
