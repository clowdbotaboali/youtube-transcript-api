import {
  FaArrowRight,
  FaCheckCircle,
  FaComments,
  FaFileAlt,
  FaHistory,
  FaLock,
  FaPlayCircle,
  FaRobot,
  FaRocket
} from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function LandingPage({ onStart, lang = LANG.ar }) {
  const features = [
    {
      icon: FaFileAlt,
      title: tr(lang, 'استخراج السكريبت فورًا', 'Instant Transcript'),
      text: tr(lang, 'استخرج نص الفيديو بدقة وبسرعة في مساحة عمل واحدة.', 'Extract accurate video text quickly in one focused workspace.'),
      tone: 'from-cyan-500/20 to-blue-500/10 border-cyan-200/30'
    },
    {
      icon: FaRobot,
      title: tr(lang, 'معالجة ذكية عملية', 'Actionable AI'),
      text: tr(lang, 'تلخيصات، خطوات تنفيذ، واستخراج موارد قابلة للتطبيق.', 'Generate summaries, steps, and practical resource lists.'),
      tone: 'from-orange-500/20 to-amber-500/10 border-orange-200/30'
    },
    {
      icon: FaComments,
      title: tr(lang, 'شات مبني على السياق', 'Context Chat'),
      text: tr(lang, 'اسأل عن محتوى الفيديو وتحصل على إجابات مرتبطة بالنص.', 'Ask about the video and get answers grounded in the transcript.'),
      tone: 'from-emerald-500/20 to-lime-500/10 border-emerald-200/30'
    },
    {
      icon: FaHistory,
      title: tr(lang, 'سجل محفوظ دائمًا', 'Saved Runs'),
      text: tr(lang, 'ارجع لنتائجك السابقة وكمّل من آخر نقطة بسهولة.', 'Return to previous runs and continue without losing context.'),
      tone: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-200/30'
    }
  ];

  const steps = [
    tr(lang, 'أضف رابط يوتيوب بعد تسجيل الدخول', 'Add a YouTube URL after sign-in'),
    tr(lang, 'استخرج النص الأصلي بنقرة واحدة', 'Extract the raw transcript in one click'),
    tr(lang, 'نفّذ التحليل أو الدردشة واحفظ النتيجة', 'Run AI/chat and save the output')
  ];

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(145deg,#020617_0%,#0b1226_40%,#13192f_100%)]" />
      <div className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full bg-cyan-500/20 blur-3xl animate-pulse -z-10" />
      <div className="absolute top-1/4 -right-28 w-[380px] h-[380px] rounded-full bg-orange-500/20 blur-3xl animate-pulse -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold tracking-wide">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
            TRANSCRIPT AI
          </div>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200 font-bold transition"
          >
            {tr(lang, 'ابدأ الآن', 'Start Now')}
            <FaArrowRight className={lang === LANG.ar ? 'rotate-180' : ''} />
          </button>
        </header>

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 items-stretch mb-12 sm:mb-16">
          <div className="reveal-up">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-cyan-100 text-xs sm:text-sm mb-4">
              <FaRocket />
              {tr(lang, 'من الفيديو إلى معرفة قابلة للتنفيذ', 'From Video to Actionable Knowledge')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 text-balance">
              {tr(lang, 'حوّل أي فيديو يوتيوب إلى مساحة إنتاج حقيقية', 'Turn Any YouTube Video Into a Real Productivity Workspace')}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-7">
              {tr(
                lang,
                'استخرج النص، حلّله بالذكاء الاصطناعي، دردش مع المحتوى، واحتفظ بكل النتائج داخل حسابك.',
                'Extract transcript, process it with AI, chat with context, and keep every result inside your account.'
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStart}
                className="px-6 py-3 rounded-xl bg-orange-400 text-slate-950 hover:bg-orange-300 font-extrabold transition"
              >
                {tr(lang, 'أنشئ حسابك', 'Create Account')}
              </button>
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-200">
                <FaLock className="text-cyan-300" />
                <span className="text-sm">{tr(lang, 'البيانات محفوظة لكل مستخدم', 'Per-user secure workspace')}</span>
              </div>
            </div>
          </div>

          <div className="reveal-up delay-1">
            <div className="h-full rounded-3xl bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] border border-white/10 p-5 sm:p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">{tr(lang, 'تجربة العمل', 'Workflow Preview')}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                  {tr(lang, 'جاهز', 'Live')}
                </span>
              </div>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={step} className="rounded-xl bg-slate-950/70 border border-slate-700 p-3 flex items-start gap-3">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-cyan-300 text-slate-950 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-base text-slate-200">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3">
                  <div className="text-2xl font-black">AI</div>
                  <div className="text-xs text-slate-300">{tr(lang, 'تلخيص + خطوات', 'Summary + Steps')}</div>
                </div>
                <div className="rounded-xl border border-orange-300/20 bg-orange-400/10 p-3">
                  <div className="text-2xl font-black">Chat</div>
                  <div className="text-xs text-slate-300">{tr(lang, 'سياق كامل', 'Transcript-aware')}</div>
                </div>
              </div>
              <button
                onClick={onStart}
                className="mt-5 w-full rounded-xl px-4 py-3 bg-cyan-300 text-slate-950 font-extrabold hover:bg-cyan-200 transition inline-flex items-center justify-center gap-2"
              >
                <FaPlayCircle />
                {tr(lang, 'ابدأ التجربة', 'Launch Workspace')}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-black mb-5">{tr(lang, 'ما الذي تحصل عليه؟', 'What You Get')}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className={`reveal-up delay-${Math.min(idx + 1, 3)} rounded-2xl border bg-gradient-to-b ${feature.tone} p-4 sm:p-5`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-center text-cyan-200 mb-3">
                    <Icon />
                  </div>
                  <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black mb-3">
              {tr(lang, 'جاهز تبدأ بشكل احترافي؟', 'Ready to Work Faster With Better Outputs?')}
            </h3>
            <p className="text-slate-300 mb-6">
              {tr(lang, 'سجّل الدخول الآن وابدأ استخراج النصوص والتحليل الذكي مباشرة.', 'Sign in now and start transcript extraction and AI processing immediately.')}
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
            >
              <FaCheckCircle />
              {tr(lang, 'تسجيل / إنشاء حساب', 'Sign In / Create Account')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
