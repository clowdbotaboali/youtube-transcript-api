import { useMemo, useState } from 'react';
import { FaCheck, FaCopy, FaDownload, FaSave, FaTasks } from 'react-icons/fa';
import TodoList from './TodoList';
import { extractTodos, loadTodoState } from '../utils/todoExtractor';
import { LANG, tr } from '../utils/lang';
import { downloadTextAsPdf } from '../utils/pdf';

function ResultsDisplay({ result, type, videoId, videoTitle, transcript, onSave, user, lang = LANG.ar, onNotify }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTodo, setShowTodo] = useState(true);

  const notify = (kind, message) => {
    if (typeof onNotify === 'function') onNotify(kind, message);
  };

  const todos = useMemo(() => {
    if (!result || (type !== 'steps' && type !== 'all')) return [];
    const savedState = loadTodoState(videoId);
    if (savedState && savedState.length > 0) return savedState;
    return extractTodos(result);
  }, [result, type, videoId]);

  const typeLabels = {
    summary: tr(lang, 'تلخيص', 'Summary', 'Resume'),
    'key-insights': tr(lang, 'أهم الأفكار', 'Key Insights', 'Idees cle'),
    'clean-transcript': tr(lang, 'تنظيف النص', 'Clean Transcript', 'Texte nettoye'),
    'proper-notes': tr(lang, 'ملاحظات مرتبة', 'Proper Notes', 'Notes structurees'),
    steps: tr(lang, 'خطوات', 'Steps', 'Etapes'),
    resources: tr(lang, 'موارد', 'Resources', 'Ressources'),
    'study-kit': tr(lang, 'حزمة دراسة', 'Study Kit', 'Pack etude'),
    'content-kit': tr(lang, 'حزمة محتوى', 'Content Kit', 'Pack contenu'),
    all: tr(lang, 'تحليل كامل', 'Comprehensive Analysis', 'Analyse complete')
  };

  const shouldShowTodo = (type === 'steps' || type === 'all') && todos.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const label = typeLabels[type] || tr(lang, 'مخرجات الذكاء الاصطناعي', 'AI Output', 'Sortie IA');
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
      notify('info', tr(lang, 'يرجى تسجيل الدخول أولًا.', 'Please sign in first.', 'Veuillez vous connecter.'));
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

  const titleLabel = typeLabels[type] || tr(lang, 'مخرجات الذكاء الاصطناعي', 'AI Output', 'Sortie IA');

  return (
    <div className="space-y-6">
      {shouldShowTodo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-gray-800">
                  {tr(lang, 'النتيجة:', 'Result:', 'Resultat:')} {titleLabel}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowTodo((prev) => !prev)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition lg:hidden"
                  >
                    <FaTasks />
                    <span>
                      {showTodo
                        ? tr(lang, 'إخفاء المهام', 'Hide tasks', 'Masquer les taches')
                        : tr(lang, 'إظهار المهام', 'Show tasks', 'Afficher les taches')}
                    </span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                    <span>{copied ? tr(lang, 'تم النسخ', 'Copied', 'Copie') : tr(lang, 'نسخ', 'Copy', 'Copier')}</span>
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
                    <span>{saved ? tr(lang, 'تم الحفظ', 'Saved', 'Enregistre') : tr(lang, 'حفظ', 'Save', 'Enregistrer')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-h-none overflow-visible md:max-h-[700px] md:overflow-y-auto overflow-x-hidden prose prose-slate max-w-none">
                <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed text-right">{result}</div>
              </div>
            </div>
          </div>

          <div className={`lg:col-span-1 ${showTodo ? '' : 'hidden lg:block'}`}>
            <div className="sticky top-4">
              <TodoList key={`${videoId}-${type}-${result.length}`} todos={todos} videoId={videoId} videoTitle={videoTitle} lang={lang} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-gray-800">
              {tr(lang, 'النتيجة:', 'Result:', 'Resultat:')} {titleLabel}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                <span>{copied ? tr(lang, 'تم النسخ', 'Copied', 'Copie') : tr(lang, 'نسخ', 'Copy', 'Copier')}</span>
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
                <span>{saved ? tr(lang, 'تم الحفظ', 'Saved', 'Enregistre') : tr(lang, 'حفظ', 'Save', 'Enregistrer')}</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 max-h-none overflow-visible md:max-h-[600px] md:overflow-y-auto overflow-x-hidden prose prose-slate max-w-none">
            <div className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed text-right">{result}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;
