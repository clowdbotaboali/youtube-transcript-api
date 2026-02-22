import { useState } from 'react';
import { FaSave, FaTimes, FaCog, FaShieldAlt } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function Settings({ onClose, lang = LANG.ar }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.removeItem('groqApiKey');
    localStorage.removeItem('transcriptApiKey');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col my-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-2">
            <FaCog className="text-blue-600 text-xl sm:text-2xl" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{tr(lang, 'الإعدادات', 'Settings')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-2">{tr(lang, 'إدارة الإعدادات عبر الخادم', 'Cloud-managed configuration')}</h3>
              <p className="text-blue-700">
                {tr(
                  lang,
                  'مفاتيح API تُدار بشكل آمن من الخادم. لا حاجة لإدخالها يدويًا داخل المتصفح.',
                  'API keys are managed securely by the backend. No manual API key input is required in the browser.'
                )}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FaShieldAlt className="text-yellow-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  {tr(
                    lang,
                    'ملاحظة أمان: لا يتم عرض أي مفاتيح أو توكنات عبر مسارات الإعدادات.',
                    'Security note: tokens and keys are not exposed by settings endpoints anymore.'
                  )}
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
            <FaSave />
            <span>{saved ? tr(lang, 'تم الحفظ', 'Saved') : tr(lang, 'حفظ الإعدادات', 'Save settings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
