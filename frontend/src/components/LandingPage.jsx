import { FaArrowRight, FaComments, FaFileAlt, FaHistory, FaPlayCircle, FaRobot } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function Pill({ children, theme = 'light' }) {
  const isDark = theme === 'dark';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
        isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200' : 'bg-white/80 border-slate-200 text-slate-800'
      }`}
    >
      {children}
    </span>
  );
}

function Feature({ icon, title, text, theme = 'light' }) {
  const isDark = theme === 'dark';
  return (
    <article className={`rounded-2xl border p-4 sm:p-5 shadow-sm ${isDark ? 'border-slate-700 bg-slate-900/85' : 'border-slate-200 bg-white/85'}`}>
      <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3">{icon}</div>
      <h3 className={`font-black mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
    </article>
  );
}

function LandingPage({ onStart, lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen relative overflow-hidden" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
      <div className={`absolute inset-0 -z-20 ${isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_45%,#131d33_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_45%,#eef2ff_100%)]'}`} />
      <div className={`absolute -top-20 -left-16 w-72 h-72 rounded-full blur-3xl -z-10 ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-300/35'}`} />
      <div className={`absolute top-1/3 -right-20 w-72 h-72 rounded-full blur-3xl -z-10 ${isDark ? 'bg-fuchsia-500/20' : 'bg-fuchsia-300/25'}`} />
      <div className={`absolute bottom-[-80px] left-1/4 w-72 h-72 rounded-full blur-3xl -z-10 ${isDark ? 'bg-amber-400/15' : 'bg-amber-200/40'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-10">
          <div className={`text-base sm:text-lg font-black tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>TRANSCRIPT AI</div>
          <div className="flex items-center gap-2">
            <a
              href="/pricing"
              className={`px-3 py-2 text-sm rounded-xl border transition ${
                isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              {tr(lang, 'الأسعار', 'Pricing', 'Tarification')}
            </a>
            <a
              href="/contact"
              className={`px-3 py-2 text-sm rounded-xl border transition ${
                isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              {tr(lang, 'تواصل', 'Contact', 'Contact')}
            </a>
            <a
              href="/admin"
              className={`px-3 py-2 text-sm rounded-xl border transition ${
                isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-white'
              }`}
            >
              {tr(lang, 'أدمن', 'Admin', 'Admin')}
            </a>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-bold"
            >
              {tr(lang, 'ابدأ الآن', 'Start now', 'Commencer')}
              <FaArrowRight className={lang === LANG.ar ? 'rotate-180' : ''} />
            </button>
          </div>
        </header>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 sm:gap-8 items-center mb-12 sm:mb-16">
          <div className="reveal-up">
            <div className="flex flex-wrap gap-2 mb-4">
              <Pill theme={theme}>{tr(lang, 'استخراج النص', 'Transcript Generation', 'Generation de transcription')}</Pill>
              <Pill theme={theme}>{tr(lang, 'تحليل نصي', 'Text Analysis', 'Analyse de texte')}</Pill>
              <Pill theme={theme}>{tr(lang, 'دردشة سياقية', 'Context Chat', 'Chat contextuel')}</Pill>
            </div>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {tr(
                lang,
                'خدمة رقمية لتحويل روابط يوتيوب إلى نص',
                'Digital Service for YouTube Transcript Generation',
                'Service numerique pour convertir les liens YouTube en texte'
              )}
            </h1>
            <p className={`text-base sm:text-lg mb-7 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {tr(
                lang,
                'الخدمة مخصصة لتوليد النصوص من الروابط التي يضيفها المستخدم، مع ميزات تحليل نصي اختيارية.',
                'This service provides transcript output from user-submitted YouTube links, with optional text analysis tools.',
                'Ce service genere des transcriptions a partir des liens YouTube soumis par l utilisateur avec des outils d analyse optionnels.'
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStart}
                className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-extrabold hover:bg-cyan-600 transition"
              >
                {tr(lang, 'أنشئ حسابك', 'Create account', 'Creer un compte')}
              </button>
              <button
                onClick={onStart}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-bold transition ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FaPlayCircle />
                {tr(lang, 'تسجيل الدخول', 'Sign in', 'Se connecter')}
              </button>
            </div>
          </div>

          <div className="reveal-up delay-1">
            <div className={`rounded-3xl border p-5 sm:p-6 shadow-xl ${isDark ? 'border-slate-700 bg-slate-900/90' : 'border-slate-200 bg-white/90'}`}>
              <h2 className={`font-black text-lg mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'كيف تعمل المنصة؟', 'How It Works', 'Comment ca marche')}
              </h2>
              <div className="space-y-3">
                <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>1. {tr(lang, 'سجل دخولك', 'Sign in', 'Se connecter')}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {tr(lang, 'أنشئ حسابًا أو سجل الدخول.', 'Create an account or sign in.', 'Creer un compte ou se connecter.')}
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>2. {tr(lang, 'أضف رابط يوتيوب', 'Submit YouTube URL', 'Envoyer le lien YouTube')}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {tr(lang, 'أدخل الرابط في صفحة الاستخراج.', 'Submit the URL in the extraction workspace.', "Ajoutez l URL dans l espace d extraction.")}
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>3. {tr(lang, 'استلم المخرجات النصية', 'Receive Text Output', 'Recevoir la sortie texte')}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {tr(lang, 'احصل على النص وخيارات التحليل النصي.', 'Get transcript output and optional text analysis.', 'Recevez la transcription et les options d analyse.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Feature
            theme={theme}
            icon={<FaFileAlt />}
            title={tr(lang, 'تحويل الرابط إلى نص', 'URL to Text', 'URL vers texte')}
            text={tr(lang, 'تحويل روابط الفيديو إلى نص قابل للقراءة.', 'Convert video links into readable text output.', 'Convertir les liens video en texte lisible.')}
          />
          <Feature
            theme={theme}
            icon={<FaRobot />}
            title={tr(lang, 'تحليل نصي اختياري', 'Optional Analysis', 'Analyse optionnelle')}
            text={tr(lang, 'أدوات تلخيص وتنظيم النص للاستخدام العملي.', 'Summarize and structure transcript content for practical use.', 'Resumer et structurer le contenu pour un usage pratique.')}
          />
          <Feature
            theme={theme}
            icon={<FaComments />}
            title={tr(lang, 'مساعدة بالدردشة', 'Chat Assistance', 'Assistance chat')}
            text={tr(lang, 'ناقش محتوى النص داخل نفس جلسة العمل.', 'Discuss transcript content within your session.', 'Discutez du contenu dans la meme session.')}
          />
          <Feature
            theme={theme}
            icon={<FaHistory />}
            title={tr(lang, 'سجل استخدام', 'Usage History', 'Historique d utilisation')}
            text={tr(lang, 'احتفظ بنتائجك ضمن حسابك.', 'Keep your generated outputs in account history.', 'Conservez vos resultats dans votre compte.')}
          />
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
