import {
  FaBroom,
  FaGraduationCap,
  FaLayerGroup,
  FaLightbulb,
  FaListOl,
  FaSpinner,
  FaStickyNote,
  FaToolbox
} from 'react-icons/fa';
import { MdCampaign, MdSummarize } from 'react-icons/md';
import { LANG, tr } from '../utils/lang';
import {
  DEFAULT_OUTPUT_LANGUAGE,
  getOutputLanguageLabel,
  normalizeOutputLanguage,
  OUTPUT_LANGUAGE_OPTIONS
} from '../utils/outputLanguage';

function ProcessingOptions({
  onProcess,
  loading,
  lang = LANG.ar,
  outputLang = DEFAULT_OUTPUT_LANGUAGE,
  onOutputLangChange
}) {
  const selectedOutputLang = normalizeOutputLanguage(outputLang);

  const options = [
    {
      type: 'summary',
      label: tr(lang, 'ملخص شامل', 'Summary', 'Résumé'),
      description: tr(
        lang,
        'نظرة تنفيذية مركزة: فكرة الفيديو، لمن يفيد، والخلاصة النهائية.',
        'Executive overview: core idea, audience, and final takeaway.',
        "Vue d'ensemble executive : idee centrale, public cible et conclusion."
      ),
      icon: MdSummarize,
      colors: 'border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-600'
    },
    {
      type: 'key-insights',
      label: tr(lang, 'أهم الأفكار', 'Key Insights', 'Idées clés'),
      description: tr(
        lang,
        'أهم الاستنتاجات العملية مع سبب الأهمية والتطبيق المباشر.',
        'Top takeaways with practical implication for each point.',
        "Principaux enseignements avec implication pratique."
      ),
      icon: FaLightbulb,
      colors: 'border-amber-500 hover:bg-amber-50 hover:border-amber-600 text-amber-600'
    },
    {
      type: 'clean-transcript',
      label: tr(lang, 'تنظيف النص', 'Clean Transcript', 'Transcription nettoyée'),
      description: tr(
        lang,
        'تنسيق النص كنسخة نظيفة بدون حشو أو تكرار أو ضوضاء.',
        'Rewrite transcript into clean readable text without filler.',
        'Reecriture propre sans repetitions ni bruit.'
      ),
      icon: FaBroom,
      colors: 'border-slate-500 hover:bg-slate-50 hover:border-slate-600 text-slate-600'
    },
    {
      type: 'proper-notes',
      label: tr(lang, 'ملاحظات مرتبة', 'Proper Notes', 'Notes structurées'),
      description: tr(
        lang,
        'ملخص دراسي منظم بعناوين فرعية ونقاط واضحة.',
        'Structured study notes with clean sectioning.',
        'Notes structurees avec sections claires.'
      ),
      icon: FaStickyNote,
      colors: 'border-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 text-emerald-600'
    },
    {
      type: 'steps',
      label: tr(lang, 'خطة تنفيذ', 'Action Steps', "Plan d'action"),
      description: tr(
        lang,
        'خطوات تنفيذ عملية مرتبة مع النتيجة المتوقعة لكل خطوة.',
        'Ordered action plan with expected outcome per step.',
        'Plan d actions ordonne avec resultat attendu.'
      ),
      icon: FaListOl,
      colors: 'border-green-500 hover:bg-green-50 hover:border-green-600 text-green-600'
    },
    {
      type: 'resources',
      label: tr(lang, 'أدوات وموارد', 'Resources', 'Ressources'),
      description: tr(
        lang,
        'استخراج الأدوات والمنصات والروابط والمراجع المذكورة.',
        'Extract all tools, links, references, and platforms.',
        'Extraction des outils, liens et references.'
      ),
      icon: FaToolbox,
      colors: 'border-purple-500 hover:bg-purple-50 hover:border-purple-600 text-purple-600'
    },
    {
      type: 'study-kit',
      label: tr(lang, 'حزمة دراسة', 'Study Kit', "Pack d'étude"),
      description: tr(
        lang,
        'أهداف تعلم + نقاط مراجعة + أسئلة تدريبية سريعة.',
        'Learning objectives, revision notes, and quick quiz.',
        'Objectifs, revision rapide et quiz.'
      ),
      icon: FaGraduationCap,
      colors: 'border-cyan-500 hover:bg-cyan-50 hover:border-cyan-600 text-cyan-600'
    },
    {
      type: 'content-kit',
      label: tr(lang, 'حزمة محتوى', 'Content Kit', 'Pack contenu'),
      description: tr(
        lang,
        'زوايا نشر جاهزة: hooks + أفكار قصيرة + هيكل محتوى.',
        'Creator pack: hooks, short scripts, and content outline.',
        'Pack createur : hooks, scripts courts et plan contenu.'
      ),
      icon: MdCampaign,
      colors: 'border-rose-500 hover:bg-rose-50 hover:border-rose-600 text-rose-600'
    },
    {
      type: 'all',
      label: tr(lang, 'تحليل متكامل', 'Comprehensive Analysis', 'Analyse complète'),
      description: tr(
        lang,
        'ملف شامل يجمع الملخص والأفكار والخطوات والموارد.',
        'Full package: summary, insights, steps, and resources.',
        'Pack complet : resume, insights, etapes et ressources.'
      ),
      icon: FaLayerGroup,
      colors: 'border-indigo-500 hover:bg-indigo-50 hover:border-indigo-600 text-indigo-600'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="mb-4 sm:mb-5">
        <h3 className="text-xl font-black text-slate-900">
          {tr(lang, 'خيارات المعالجة بالذكاء الاصطناعي', 'AI Processing Options', 'Options de traitement IA')}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {tr(
            lang,
            'اختر نوع المخرجات ثم اللغة التي تريد استخراج الملخصات بها.',
            'Choose output type, then choose the language of generated summaries.',
            'Choisissez le type de sortie puis la langue des resultats.'
          )}
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <label htmlFor="output-lang" className="block text-sm font-bold text-slate-800 mb-2">
          {tr(lang, 'لغة استخراج الملخصات', 'Summary Output Language', 'Langue de sortie des résumés')}
        </label>
        <select
          id="output-lang"
          value={selectedOutputLang}
          onChange={(event) => onOutputLangChange?.(event.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
        >
          {OUTPUT_LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {getOutputLanguageLabel(option.code, lang)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.type}
            onClick={() => onProcess(option.type)}
            disabled={loading}
            className={`rounded-xl border-2 p-3 text-start transition duration-200 ${
              loading ? 'bg-gray-100 border-gray-300 cursor-not-allowed text-gray-500' : option.colors
            }`}
          >
            <div className="flex items-start gap-3">
              {option.icon({ className: 'text-xl mt-0.5 flex-shrink-0' })}
              <div className="min-w-0">
                <div className="font-bold text-slate-900">{option.label}</div>
                <p className="text-xs mt-1 text-slate-600 leading-relaxed">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span>{tr(lang, 'جارٍ تنفيذ المعالجة...', 'Processing...', 'Traitement en cours...')}</span>
        </div>
      )}
    </div>
  );
}

export default ProcessingOptions;

