import { FaRocket, FaFileAlt, FaRobot, FaComments, FaHistory, FaArrowRight } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function LandingPage({ onStart, lang = LANG.ar }) {
  const features = [
    {
      icon: FaFileAlt,
      title: tr(lang, 'استخراج السكريبت', 'Transcript Extraction'),
      text: tr(lang, 'استخرج سكريبت فيديوهات يوتيوب بسرعة ودقة.', 'Extract accurate transcripts from YouTube videos in seconds.')
    },
    {
      icon: FaRobot,
      title: tr(lang, 'معالجة بالذكاء الاصطناعي', 'AI Processing'),
      text: tr(lang, 'تلخيص، خطوات عملية، واستخراج موارد.', 'Generate summaries, structured steps, and resource lists.')
    },
    {
      icon: FaComments,
      title: tr(lang, 'دردشة سياقية', 'Context Chat'),
      text: tr(lang, 'اسأل عن محتوى الفيديو مباشرة من النص.', 'Ask questions about the transcript and get contextual answers.')
    },
    {
      icon: FaHistory,
      title: tr(lang, 'سجل محفوظ', 'Saved Workspace'),
      text: tr(lang, 'احفظ النتائج وارجع لها في أي وقت.', 'Store your transcript runs and return to them anytime.')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.20),transparent_40%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-14">
        <header className="flex items-center justify-between mb-16">
          <div className="text-xl font-black tracking-wide">TRANSCRIPT AI</div>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition"
          >
            {tr(lang, 'ابدأ مجانًا', 'Start Free')}
            <FaArrowRight />
          </button>
        </header>

        <section className="grid md:grid-cols-2 gap-10 items-center mb-20">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-300 mb-4">
              <FaRocket />
              {tr(lang, 'سير عمل صناع المحتوى', 'Creator Workflow')}
            </p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
              {tr(lang, 'حوّل أي فيديو يوتيوب إلى معرفة قابلة للتنفيذ', 'Turn Any YouTube Video Into Actionable Knowledge')}
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              {tr(
                lang,
                'استخرج النص، عالجه بالذكاء الاصطناعي، دردش مع المحتوى، واحفظ كل شيء داخل مساحة عمل واحدة.',
                'Extract transcript, process with AI, chat with context, and save everything in one focused workspace.'
              )}
            </p>
            <button
              onClick={onStart}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold transition"
            >
              {tr(lang, 'أنشئ حسابك', 'Create Account')}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 backdrop-blur">
            <div className="space-y-3">
              <div className="h-12 rounded-lg bg-slate-800 animate-pulse" />
              <div className="h-24 rounded-lg bg-slate-800/80" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-lg bg-sky-500/15 border border-sky-500/30" />
                <div className="h-16 rounded-lg bg-orange-500/15 border border-orange-500/30" />
              </div>
              <div className="h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30" />
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-black mb-8">{tr(lang, 'كل الأدوات في مسار واحد', 'Everything You Need In One Flow')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center mb-3">
                  {feature.icon({})}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-300">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
          <h2 className="text-3xl font-black mb-3">{tr(lang, 'جاهز تبدأ؟', 'Ready to start?')}</h2>
          <p className="text-slate-300 mb-6">
            {tr(lang, 'سجّل الدخول وافتح مساحة عملك الخاصة.', 'Sign in and unlock your private transcript workspace.')}
          </p>
          <button
            onClick={onStart}
            className="px-7 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition"
          >
            {tr(lang, 'سجّل الدخول الآن', 'Sign In Now')}
          </button>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
