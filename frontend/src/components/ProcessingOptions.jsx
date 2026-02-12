import { FaSpinner } from 'react-icons/fa';
import { MdSummarize, MdFormatListNumbered, MdLink, MdSelectAll } from 'react-icons/md';

function ProcessingOptions({ onProcess, loading }) {
  const options = [
    { 
      type: 'summary', 
      label: 'تلخيص فقط', 
      icon: MdSummarize, 
      colors: 'border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-600'
    },
    { 
      type: 'steps', 
      label: 'شرح الخطوات', 
      icon: MdFormatListNumbered, 
      colors: 'border-green-500 hover:bg-green-50 hover:border-green-600 text-green-600'
    },
    { 
      type: 'resources', 
      label: 'استخراج الموارد', 
      icon: MdLink, 
      colors: 'border-purple-500 hover:bg-purple-50 hover:border-purple-600 text-purple-600'
    },
    { 
      type: 'all', 
      label: 'معالجة كاملة', 
      icon: MdSelectAll, 
      colors: 'border-red-500 hover:bg-red-50 hover:border-red-600 text-red-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">خيارات المعالجة بالذكاء الاصطناعي</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map(({ type, label, icon: Icon, colors }) => (
          <button
            key={type}
            onClick={() => onProcess(type)}
            disabled={loading}
            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition duration-200 ${
              loading
                ? 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500'
                : colors
            }`}
          >
            <Icon className="text-2xl" />
            <span className="font-semibold text-gray-800">{label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span>جاري المعالجة بالذكاء الاصطناعي...</span>
        </div>
      )}
    </div>
  );
}

export default ProcessingOptions;
