import { FaArrowRight, FaComments, FaFileAlt, FaHistory, FaPlayCircle, FaRobot } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white/80 border border-slate-200">{children}</span>;
}

function Feature({ icon, title, text }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/85 p-4 sm:p-5 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-black text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </article>
  );
}

function LandingPage({ onStart, lang = LANG.ar }) {
  return (
    <div className="min-h-screen relative overflow-hidden" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_45%,#eef2ff_100%)]" />
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-cyan-300/35 blur-3xl -z-10" />
      <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-fuchsia-300/25 blur-3xl -z-10" />
      <div className="absolute bottom-[-80px] left-1/4 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-10">
          <div className="text-base sm:text-lg font-black tracking-wide text-slate-900">TRANSCRIPT AI</div>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-bold"
          >
            {tr(lang, 'ابدأ الآن', 'Start now')}
            <FaArrowRight className={lang === LANG.ar ? 'rotate-180' : ''} />
          </button>
        </header>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 sm:gap-8 items-center mb-12 sm:mb-16">
          <div className="reveal-up">
            <div className="flex flex-wrap gap-2 mb-4">
              <Pill>{tr(lang, 'استخراج السكريبت', 'Transcript Extraction')}</Pill>
              <Pill>{tr(lang, 'تحليل بالذكاء الاصطناعي', 'AI Analysis')}</Pill>
              <Pill>{tr(lang, 'دردشة سياقية', 'Context Chat')}</Pill>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900 mb-4">
              {tr(lang, 'من رابط يوتيوب إلى نتائج جاهزة للتنفيذ', 'From YouTube Link to Action-Ready Output')}
            </h1>
            <p className="text-slate-700 text-base sm:text-lg mb-7 max-w-2xl">
              {tr(
                lang,
                'بعد تسجيل الدخول، ضع الرابط في مساحة الاستخراج واحصل على النص، التلخيص، الخطوات، والردود الذكية في تجربة واحدة.',
                'After sign-in, paste a link in the extraction workspace and get transcript, summaries, steps, and smart answers in one flow.'
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStart}
                className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-extrabold hover:bg-cyan-600 transition"
              >
                {tr(lang, 'أنشئ حسابك', 'Create account')}
              </button>
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold hover:bg-slate-50 transition"
              >
                <FaPlayCircle />
                {tr(lang, 'تسجيل الدخول', 'Sign in')}
              </button>
            </div>
          </div>

          <div className="reveal-up delay-1">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 sm:p-6 shadow-xl">
              <h2 className="font-black text-lg text-slate-900 mb-4">{tr(lang, 'كيف تعمل المنصة؟', 'How it Works')}</h2>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-bold text-slate-800">1. {tr(lang, 'سجّل دخولك', 'Sign in')}</p>
                  <p className="text-sm text-slate-600">{tr(lang, 'افتح مساحة العميل الخاصة بك.', 'Open your private client area.')}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-bold text-slate-800">2. {tr(lang, 'استخرج النص', 'Extract transcript')}</p>
                  <p className="text-sm text-slate-600">{tr(lang, 'أدخل رابط يوتيوب واحصل على السكريبت.', 'Paste a YouTube URL and fetch transcript.')}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-bold text-slate-800">3. {tr(lang, 'حلّل وناقش', 'Process and discuss')}</p>
                  <p className="text-sm text-slate-600">{tr(lang, 'شغّل المعالجة أو اسأل الشات مباشرة.', 'Run AI processing or chat instantly.')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Feature
            icon={<FaFileAlt />}
            title={tr(lang, 'سكربت دقيق', 'Accurate Transcript')}
            text={tr(lang, 'آلية استخراج محسنة مع fallback متدرج.', 'Improved extraction pipeline with robust fallback.')}
          />
          <Feature
            icon={<FaRobot />}
            title={tr(lang, 'تحليل عملي', 'Actionable AI')}
            text={tr(lang, 'تلخيصات وخطوات وموارد قابلة للتطبيق مباشرة.', 'Summaries, steps, and resources you can apply immediately.')}
          />
          <Feature
            icon={<FaComments />}
            title={tr(lang, 'شات ذكي', 'Smart Chat')}
            text={tr(lang, 'نقاش مبني على محتوى الفيديو نفسه.', 'Conversation grounded in transcript context.')}
          />
          <Feature
            icon={<FaHistory />}
            title={tr(lang, 'سجل دائم', 'Persistent History')}
            text={tr(lang, 'راجع النتائج لاحقًا من صفحة السجل.', 'Revisit your runs later in the history page.')}
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-8 text-center shadow-lg">
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3">
            {tr(lang, 'جاهز تبدأ نسخة الإنتاج؟', 'Ready for the Production Experience?')}
          </h3>
          <p className="text-slate-600 mb-6">
            {tr(lang, 'ابدأ الآن، وبعد الدخول ستظهر لك لوحة العميل وصفحة الاستخراج بشكل منفصل.', 'Start now. After sign-in, you will get a dedicated client dashboard and a separate extraction workspace.')}
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-extrabold transition"
          >
            {tr(lang, 'ابدأ مجانًا', 'Start Free')}
            <FaArrowRight className={lang === LANG.ar ? 'rotate-180' : ''} />
          </button>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
