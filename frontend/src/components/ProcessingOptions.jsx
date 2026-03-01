import { FaBroom, FaGraduationCap, FaLayerGroup, FaLightbulb, FaListOl, FaSpinner, FaStickyNote, FaToolbox } from 'react-icons/fa';
import { MdCampaign, MdSummarize } from 'react-icons/md';
import { LANG, tr } from '../utils/lang';

function ProcessingOptions({ onProcess, loading, lang = LANG.ar }) {
  const options = [
    {
      type: 'summary',
      label: tr(lang, 'ملخص شامل', 'Summary', 'Resume'),
      description: tr(
        lang,
        'نظرة تنفيذية سريعة: ماذا قيل؟ ولماذا يهم؟',
        'Executive overview of the transcript.',
        'Vue d ensemble executive de la transcription.'
      ),
      icon: MdSummarize,
      colors: 'border-blue-500 hover:bg-blue-50 hover:border-blue-600 text-blue-600'
    },
    {
      type: 'key-insights',
      label: tr(lang, 'أهم الأفكار', 'Key Insights', 'Idees cle'),
      description: tr(
        lang,
        'استخراج الاستنتاجات المؤثرة مع تفسير فائدتها.',
        'Main takeaways with practical implications.',
        'Points essentiels avec implications pratiques.'
      ),
      icon: FaLightbulb,
      colors: 'border-amber-500 hover:bg-amber-50 hover:border-amber-600 text-amber-600'
    },
    {
      type: 'clean-transcript',
      label: tr(lang, 'تنظيف النص', 'Clean Transcript', 'Nettoyage du texte'),
      description: tr(
        lang,
        'إزالة التكرار والحشو وتحويله لصياغة مقروءة.',
        'Remove filler words and repetitions.',
        'Supprime les repetitions et le bruit.'
      ),
      icon: FaBroom,
      colors: 'border-slate-500 hover:bg-slate-50 hover:border-slate-600 text-slate-600'
    },
    {
      type: 'proper-notes',
      label: tr(lang, 'ملاحظات مرتبة', 'Proper Notes', 'Notes structurees'),
      description: tr(
        lang,
        'تحويل المحتوى إلى ملاحظات منظمة بعناوين واضحة.',
        'Structured notes with clear headings.',
        'Notes organisees avec titres clairs.'
      ),
      icon: FaStickyNote,
      colors: 'border-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 text-emerald-600'
    },
    {
      type: 'steps',
      label: tr(lang, 'خطة تنفيذ', 'Action Steps', 'Plan d action'),
      description: tr(
        lang,
        'خطوات عملية مرتبة + المتطلبات قبل التنفيذ.',
        'Actionable sequence with prerequisites.',
        'Etapes actionnables avec prerequis.'
      ),
      icon: FaListOl,
      colors: 'border-green-500 hover:bg-green-50 hover:border-green-600 text-green-600'
    },
    {
      type: 'resources',
      label: tr(lang, 'أدوات ومصادر', 'Resources', 'Ressources'),
      description: tr(
        lang,
        'كل الأدوات والروابط والمراجع المذكورة داخل الفيديو.',
        'Tools, links, and references from the video.',
        'Outils, liens et references mentionnes.'
      ),
      icon: FaToolbox,
      colors: 'border-purple-500 hover:bg-purple-50 hover:border-purple-600 text-purple-600'
    },
    {
      type: 'study-kit',
      label: tr(lang, 'حزمة دراسة', 'Study Kit', 'Pack etude'),
      description: tr(
        lang,
        'أهداف تعلم + مراجعة سريعة + أسئلة تدريبية.',
        'Learning objectives, notes, and quiz items.',
        'Objectifs, notes et quiz.'
      ),
      icon: FaGraduationCap,
      colors: 'border-cyan-500 hover:bg-cyan-50 hover:border-cyan-600 text-cyan-600'
    },
    {
      type: 'content-kit',
      label: tr(lang, 'حزمة محتوى', 'Content Kit', 'Pack contenu'),
      description: tr(
        lang,
        'أفكار بوستات وسكربتات قصيرة وعناوين مناسبة للنشر.',
        'Social hooks, short scripts, and content outline.',
        'Accroches, scripts courts et plan de contenu.'
      ),
      icon: MdCampaign,
      colors: 'border-rose-500 hover:bg-rose-50 hover:border-rose-600 text-rose-600'
    },
    {
      type: 'all',
      label: tr(lang, 'تحليل متكامل', 'Comprehensive Analysis', 'Analyse complete'),
      description: tr(
        lang,
        'باقة كاملة تجمع الملخص والأفكار والخطوات والموارد.',
        'Full package: summary, insights, steps, resources.',
        'Pack complet: resume, insights, etapes et ressources.'
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
            'اختر مخرجًا عمليًا واضحًا بدل الرد العام، وكل خيار له هدف مختلف.',
            'Choose outcome-focused processing modes instead of generic output.',
            'Choisissez un mode orienté resultat plutot qu une sortie generale.'
          )}
        </p>
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
