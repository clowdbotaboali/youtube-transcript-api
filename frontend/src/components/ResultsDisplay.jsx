import { useState, useEffect } from 'react';
import { FaCopy, FaDownload, FaSave, FaCheck, FaTasks } from 'react-icons/fa';
import TodoList from './TodoList';
import { extractTodos, loadTodoState } from '../utils/todoExtractor';

function ResultsDisplay({ result, type, videoId, videoTitle, transcript, onSave }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTodo, setShowTodo] = useState(true);
  const [todos, setTodos] = useState([]);

  // استخراج المهام من النتيجة
  useEffect(() => {
    if (result && (type === 'steps' || type === 'all')) {
      // محاولة تحميل الحالة المحفوظة أولاً
      const savedState = loadTodoState(videoId);
      if (savedState && savedState.length > 0) {
        setTodos(savedState);
      } else {
        // استخراج المهام من النص
        const extractedTodos = extractTodos(result);
        setTodos(extractedTodos);
      }
    }
  }, [result, type, videoId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-result-${type}-${videoId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSave = async () => {
    const success = await onSave({
      videoId,
      videoTitle: videoTitle || videoId,
      transcript,
      processingType: type,
      result
    });
    
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const typeLabels = {
    summary: 'التلخيص',
    steps: 'شرح الخطوات',
    resources: 'استخراج الموارد',
    all: 'المعالجة الكاملة'
  };

  // تحديد إذا كان يجب عرض Todo List
  const shouldShowTodo = (type === 'steps' || type === 'all') && todos.length > 0;

  return (
    <div className="space-y-6">
      {/* Todo List على الجنب */}
      {shouldShowTodo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* النتيجة الأصلية */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  نتيجة {typeLabels[type] || 'المعالجة'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTodo(!showTodo)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition lg:hidden"
                  >
                    <FaTasks />
                    <span>{showTodo ? 'إخفاء المهام' : 'عرض المهام'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <FaDownload />
                    <span>تحميل</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    {saved ? <FaCheck /> : <FaSave />}
                    <span>{saved ? 'تم الحفظ' : 'حفظ'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 max-h-[700px] overflow-y-auto prose prose-slate max-w-none">
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-right">
                  {result}
                </div>
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className={`lg:col-span-1 ${showTodo ? '' : 'hidden lg:block'}`}>
            <div className="sticky top-4">
              <TodoList 
                todos={todos} 
                videoId={videoId}
                videoTitle={videoTitle}
              />
            </div>
          </div>
        </div>
      )}

      {/* عرض عادي لو مافيش Todo */}
      {!shouldShowTodo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              نتيجة {typeLabels[type] || 'المعالجة'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <FaDownload />
                <span>تحميل</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {saved ? <FaCheck /> : <FaSave />}
                <span>{saved ? 'تم الحفظ' : 'حفظ'}</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto prose prose-slate max-w-none">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-right">
              {result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
