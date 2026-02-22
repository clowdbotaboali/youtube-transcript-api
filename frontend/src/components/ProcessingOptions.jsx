import { FaSpinner } from 'react-icons/fa';
import { MdSummarize, MdFormatListNumbered, MdLink, MdSelectAll } from 'react-icons/md';
import { LANG, tr } from '../utils/lang';

function ProcessingOptions({ onProcess, loading, lang = LANG.ar }) {
  const options = [
    {
      type: 'summary',
      label: tr(lang, 'تلخيص فقط', 'Summary only'),
      icon: MdSummarize,
      colors: 'border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-600'
    },
    {
      type: 'steps',
      label: tr(lang, 'استخراج الخطوات', 'Extract steps'),
      icon: MdFormatListNumbered,
      colors: 'border-green-500 hover:bg-green-50 hover:border-green-600 text-green-600'
    },
    {
      type: 'resources',
      label: tr(lang, 'استخراج الموارد', 'Extract resources'),
      icon: MdLink,
      colors: 'border-purple-500 hover:bg-purple-50 hover:border-purple-600 text-purple-600'
    },
    {
      type: 'all',
      label: tr(lang, 'معالجة كاملة', 'Full processing'),
      icon: MdSelectAll,
      colors: 'border-red-500 hover:bg-red-50 hover:border-red-600 text-red-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{tr(lang, 'خيارات المعالجة بالذكاء الاصطناعي', 'AI processing options')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => onProcess(option.type)}
            disabled={loading}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition duration-200 ${
              loading ? 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500' : option.colors
            }`}
          >
            {option.icon({ className: 'text-2xl' })}
            <span className="font-semibold text-gray-800">{option.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span>{tr(lang, 'جارٍ تنفيذ المعالجة...', 'Processing...')}</span>
        </div>
      )}
    </div>
  );
}

export default ProcessingOptions;
