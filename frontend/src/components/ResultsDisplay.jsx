import { useMemo, useState } from 'react';
import { FaCheck, FaCopy, FaDownload, FaSave, FaTasks } from 'react-icons/fa';
import TodoList from './TodoList';
import { extractTodos, loadTodoState } from '../utils/todoExtractor';
import { LANG, tr } from '../utils/lang';
import { downloadTextAsPdf } from '../utils/pdf';
import { buildAiBlocks, normalizeAiText } from '../utils/aiText';
import { getBaseProcessingType } from '../utils/processingType';

function ResultBlocks({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === 'heading') {
          return (
            <h4 key={key} className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-200 pb-1">
              {block.text}
            </h4>
          );
        }
        if (block.type === 'ordered') {
          return (
            <ol key={key} className="list-decimal ps-6 space-y-1 text-slate-800">
              {block.items.map((item, idx) => (
                <li key={`${key}-${idx}`} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === 'unordered') {
          return (
            <ul key={key} className="list-disc ps-6 space-y-1 text-slate-800">
              {block.items.map((item, idx) => (
                <li key={`${key}-${idx}`} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={key} className="text-slate-800 leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function ResultsDisplay({ result, type, videoId, videoTitle, transcript, onSave, user, lang = LANG.ar, onNotify }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTodo, setShowTodo] = useState(true);

  const notify = (kind, message) => {
    if (typeof onNotify === 'function') onNotify(kind, message);
  };

  const rawType = String(type || '').trim().toLowerCase();
  const baseType = getBaseProcessingType(rawType);
  const summaryMode = rawType.includes('summary:study-review')
    ? 'study-review'
    : rawType.includes('summary:lecture')
      ? 'lecture'
      : '';
  const normalizedResult = useMemo(() => normalizeAiText(result), [result]);
  const resultBlocks = useMemo(() => buildAiBlocks(normalizedResult), [normalizedResult]);

  const todos = useMemo(() => {
    if (!normalizedResult || baseType !== 'steps') return [];
    const savedState = loadTodoState(videoId);
    if (savedState && savedState.length > 0) return savedState;
    return extractTodos(normalizedResult);
  }, [normalizedResult, baseType, videoId]);

  const typeLabels = {
    'summary:lecture': tr(lang, '\u0645\u0644\u062e\u0635 \u0627\u0644\u0645\u062d\u0627\u0636\u0631\u0629', 'Lecture Summary', 'Resume du cours'),
    'summary:study-review': tr(lang, '\u0645\u0631\u0627\u062c\u0639\u0629 \u062f\u0631\u0627\u0633\u064a\u0629', 'Study Review', "Revision d'etude"),
    summary: tr(lang, 'ملخص شامل', 'Summary', 'Résumé'),
    'key-insights': tr(lang, 'أهم الأفكار', 'Key Insights', 'Idées clés'),
    'clean-transcript': tr(lang, 'تنظيف النص', 'Clean Transcript', 'Transcription nettoyée'),
    'proper-notes': tr(lang, 'ملاحظات مرتبة', 'Proper Notes', 'Notes structurées'),
    steps: tr(lang, 'خطوات', 'Steps', 'Étapes'),
    resources: tr(lang, 'موارد', 'Resources', 'Ressources'),
    'study-kit': tr(lang, 'حزمة دراسة', 'Study Kit', "Pack d'étude"),
    'content-kit': tr(lang, 'حزمة محتوى', 'Content Kit', 'Pack contenu'),
    all: tr(lang, 'برومبت تنفيذ احترافي', 'Implementation Prompt', "Prompt d'implementation")
  };

  const shouldShowTodo = baseType === 'steps' && todos.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(normalizedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const label = typeLabels[baseType] || tr(lang, 'مخرجات الذكاء الاصطناعي', 'AI Output', 'Sortie IA');
    downloadTextAsPdf({
      filename: `ai-result-${baseType || 'analysis'}-${videoId || Date.now()}.pdf`,
      title: `${tr(lang, 'النتيجة', 'Result', 'Résultat')}: ${label}`,
      metadata: [
        `${tr(lang, 'معرف الفيديو', 'Video ID', 'ID vidéo')}: ${videoId || '-'}`,
        `${tr(lang, 'نوع المعالجة', 'Processing type', 'Type de traitement')}: ${baseType || '-'}`
      ],
      body: normalizedResult
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
      processingType: rawType || baseType,
      result: normalizedResult
    });

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const titleLabel =
    (summaryMode === 'lecture' ? typeLabels['summary:lecture'] : null) ||
    (summaryMode === 'study-review' ? typeLabels['summary:study-review'] : null) ||
    typeLabels[rawType] ||
    typeLabels[baseType] ||
    tr(lang, '\u0645\u062e\u0631\u062c\u0627\u062a \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a', 'AI Output', 'Sortie IA');

  return (
    <div className="space-y-6">
      {shouldShowTodo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h3 className="text-xl font-black text-slate-900">
                  {tr(lang, 'النتيجة:', 'Result:', 'Résultat:')} {titleLabel}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowTodo((prev) => !prev)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition lg:hidden"
                  >
                    <FaTasks />
                    <span>
                      {showTodo
                        ? tr(lang, 'إخفاء المهام', 'Hide tasks', 'Masquer les tâches')
                        : tr(lang, 'إظهار المهام', 'Show tasks', 'Afficher les tâches')}
                    </span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                    <span>{copied ? tr(lang, 'تم النسخ', 'Copied', 'Copié') : tr(lang, 'نسخ', 'Copy', 'Copier')}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <FaDownload />
                    <span>{tr(lang, 'تحميل PDF', 'Download PDF', 'Télécharger PDF')}</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    {saved ? <FaCheck /> : <FaSave />}
                    <span>{saved ? tr(lang, 'تم الحفظ', 'Saved', 'Enregistré') : tr(lang, 'حفظ', 'Save', 'Enregistrer')}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 max-h-none overflow-visible overflow-x-hidden">
                <ResultBlocks blocks={resultBlocks} />
              </div>
            </div>
          </div>

          <div className={`lg:col-span-1 ${showTodo ? '' : 'hidden lg:block'}`}>
            <div className="sticky top-4">
              <TodoList key={`${videoId}-${baseType}-${normalizedResult.length}`} todos={todos} videoId={videoId} videoTitle={videoTitle} lang={lang} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="text-xl font-black text-slate-900">
              {tr(lang, 'النتيجة:', 'Result:', 'Résultat:')} {titleLabel}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                <span>{copied ? tr(lang, 'تم النسخ', 'Copied', 'Copié') : tr(lang, 'نسخ', 'Copy', 'Copier')}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <FaDownload />
                <span>{tr(lang, 'تحميل PDF', 'Download PDF', 'Télécharger PDF')}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {saved ? <FaCheck /> : <FaSave />}
                <span>{saved ? tr(lang, 'تم الحفظ', 'Saved', 'Enregistré') : tr(lang, 'حفظ', 'Save', 'Enregistrer')}</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6 max-h-none overflow-visible overflow-x-hidden">
            <ResultBlocks blocks={resultBlocks} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;

