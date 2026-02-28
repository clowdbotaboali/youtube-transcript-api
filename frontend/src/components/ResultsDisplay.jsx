import { useMemo, useState } from 'react';
import { FaCopy, FaDownload, FaSave, FaCheck, FaTasks } from 'react-icons/fa';
import TodoList from './TodoList';
import { extractTodos, loadTodoState } from '../utils/todoExtractor';
import { LANG, tr } from '../utils/lang';
import { downloadTextAsPdf } from '../utils/pdf';

function ResultsDisplay({ result, type, videoId, videoTitle, transcript, onSave, user, lang = LANG.ar, onNotify }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTodo, setShowTodo] = useState(true);

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, message);
  };

  const todos = useMemo(() => {
    if (!result || (type !== 'steps' && type !== 'all')) return [];
    const savedState = loadTodoState(videoId);
    if (savedState && savedState.length > 0) return savedState;
    return extractTodos(result);
  }, [result, type, videoId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const label = typeLabels[type] || tr(lang, 'مخرجات الذكاء الاصطناعي', 'AI output', 'Sortie IA');
    downloadTextAsPdf({
      filename: `ai-result-${type}-${videoId || Date.now()}.pdf`,
      title: `${tr(lang, 'النتيجة', 'Result', 'Resultat')}: ${label}`,
      metadata: [
        `${tr(lang, 'معرف الفيديو', 'Video ID', 'ID video')}: ${videoId || '-'}`,
        `${tr(lang, 'نوع المعالجة', 'Processing type', 'Type de traitement')}: ${type || '-'}`
      ],
      body: result
    });
  };

  const handleSave = async () => {
    if (!user) {
      notify('info', tr(lang, 'يرجى تسجيل الدخول أولًا.', 'Please sign in first.'));
      return;
    }

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
    summary: tr(lang, 'تلخيص', 'Summary'),
    steps: tr(lang, 'خطوات', 'Steps'),
    resources: tr(lang, 'موارد', 'Resources'),
    all: tr(lang, 'تحليل كامل', 'Full analysis')
  };

  const shouldShowTodo = (type === 'steps' || type === 'all') && todos.length > 0;

  return (
    <div className="space-y-6">
      {shouldShowTodo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{tr(lang, 'النتيجة:', 'Result:')} {typeLabels[type] || tr(lang, 'مخرجات الذكاء الاصطناعي', 'AI output')}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTodo(!showTodo)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition lg:hidden"
                  >
                    <FaTasks />
                    <span>{showTodo ? tr(lang, 'إخفاء المهام', 'Hide tasks') : tr(lang, 'إظهار المهام', 'Show tasks')}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                    <span>{copied ? tr(lang, 'تم النسخ', 'Copied') : tr(lang, 'نسخ', 'Copy')}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <FaDownload />
                    <span>{tr(lang, 'تحميل PDF', 'Download PDF', 'Telecharger PDF')}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    {saved ? <FaCheck /> : <FaSave />}
                    <span>{saved ? tr(lang, 'تم الحفظ', 'Saved') : tr(lang, 'حفظ', 'Save')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-h-none overflow-visible md:max-h-[700px] md:overflow-y-auto overflow-x-hidden prose prose-slate max-w-none">
                <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed text-right">
                  {result}
                </div>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-1 ${showTodo ? '' : 'hidden lg:block'}`}>
            <div className="sticky top-4">
              <TodoList
                key={`${videoId}-${type}-${result.length}`}
                todos={todos}
                videoId={videoId}
                videoTitle={videoTitle}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}

      {!shouldShowTodo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{tr(lang, 'النتيجة:', 'Result:')} {typeLabels[type] || tr(lang, 'مخرجات الذكاء الاصطناعي', 'AI output')}</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                <span>{copied ? tr(lang, 'تم النسخ', 'Copied') : tr(lang, 'نسخ', 'Copy')}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <FaDownload />
                <span>{tr(lang, 'تحميل PDF', 'Download PDF', 'Telecharger PDF')}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {saved ? <FaCheck /> : <FaSave />}
                <span>{saved ? tr(lang, 'تم الحفظ', 'Saved') : tr(lang, 'حفظ', 'Save')}</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-h-none overflow-visible md:max-h-[600px] md:overflow-y-auto overflow-x-hidden prose prose-slate max-w-none">
            <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed text-right">
              {result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
