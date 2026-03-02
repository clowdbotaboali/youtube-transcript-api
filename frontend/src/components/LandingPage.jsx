import { useState } from 'react';
import {
  FaArrowRight,
  FaBookOpen,
  FaBolt,
  FaCheckCircle,
  FaComments,
  FaFileAlt,
  FaGraduationCap,
  FaMoon,
  FaPlayCircle,
  FaRobot,
  FaSun,
  FaUserTie
} from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function NavLink({ href, children, dark }) {
  return (
    <a
      href={href}
      className={`px-3 py-2 text-sm rounded-xl border transition ${
        dark
          ? 'border-slate-700/80 text-slate-200 hover:bg-slate-800/70'
          : 'border-slate-300/80 text-slate-700 hover:bg-white/80'
      }`}
    >
      {children}
    </a>
  );
}

function AudienceCard({ icon, title, points, dark }) {
  return (
    <article className={`lp-card rounded-2xl border p-5 ${dark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}>
      <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3">{icon}</div>
      <h3 className={`font-black mb-2 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <ul className={`text-sm leading-7 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        {points.map((item, idx) => (
          <li key={`${title}-${idx}`} className="flex items-start gap-2">
            <FaCheckCircle className="mt-1 text-emerald-500 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function FeatureCard({ icon, title, text, dark }) {
  return (
    <article className={`lp-card rounded-2xl border p-5 ${dark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}>
      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">{icon}</div>
      <h3 className={`font-black mb-1 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
    </article>
  );
}

const isLikelyYoutubeUrl = (value) => {
  const input = String(value || '').trim();
  if (!input) return false;
  if (/youtu\.be|youtube\.com/i.test(input)) return true;
  try {
    const parsed = new URL(input);
    return /youtu\.be|youtube\.com/i.test(parsed.hostname);
  } catch {
    return false;
  }
};

function LandingPage({
  onStart,
  onLangChange,
  onToggleTheme,
  lang = LANG.en,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const isArabic = lang === LANG.ar;
  const [heroUrl, setHeroUrl] = useState('');
  const [heroError, setHeroError] = useState('');
  const dir = isArabic ? 'rtl' : 'ltr';
  const t = (ar, en, fr) => tr(lang, ar, en, fr);

  const painPoints = [
    t('مقاطع طويلة وصعب ترجع لأهم النقاط.', 'Long videos are hard to scan and revisit.', 'Les videos longues sont difficiles a parcourir et revoir.'),
    t('المحتوى متفرق بين نص وملخص وخطوات.', 'Context is scattered between transcript, summary, and steps.', 'Le contexte est disperse entre transcription, resume et etapes.'),
    t('تحتاج مخرجات بلغة مناسبة للجمهور.', 'You need outputs in the language your audience uses.', 'Vous avez besoin de sorties dans la langue de votre audience.')
  ];

  const audienceItems = [
    {
      icon: <FaGraduationCap />,
      title: t('طلاب ومحاضرات', 'Students and lecture notes', 'Etudiants et notes de cours'),
      points: [
        t('تلخيص سريع للمحاضرات الطويلة', 'Fast summary for long lectures', 'Resume rapide des cours longs'),
        t('استخراج الخطوات والواجبات', 'Extract steps and assignments', 'Extraire les etapes et devoirs'),
        t('الرجوع للنقاط المهمة بسهولة', 'Revisit key points quickly', 'Revenir vite aux points importants')
      ]
    },
    {
      icon: <FaBookOpen />,
      title: t('صنّاع الكورسات', 'Course creators', 'Createurs de cours'),
      points: [
        t('تحويل الفيديو لمحتوى نصي جاهز', 'Turn videos into ready text content', 'Convertir la video en contenu texte pret'),
        t('تنظيم الشرح إلى أجزاء واضحة', 'Organize teaching into clear sections', 'Organiser le contenu en sections claires'),
        t('تجهيز ملخصات ومراجع للطلاب', 'Prepare summaries and references', 'Preparer resumes et references')
      ]
    },
    {
      icon: <FaUserTie />,
      title: t('فرق العمل والباحثين', 'Teams and researchers', 'Equipes et chercheurs'),
      points: [
        t('تجميع المعرفة من فيديوهات متعددة', 'Capture knowledge from multiple videos', 'Capturer le savoir de plusieurs videos'),
        t('تحويل المحتوى لقرارات تنفيذية', 'Convert content into action items', 'Transformer le contenu en actions'),
        t('حفظ النتائج للرجوع لاحقًا', 'Save outputs for later use', 'Sauvegarder les resultats')
      ]
    }
  ];

  const features = [
    {
      icon: <FaFileAlt />,
      title: t('استخراج نص الفيديو', 'Transcript extraction', 'Extraction de transcription'),
      text: t(
        'حوّل رابط يوتيوب إلى نص قابل للبحث والمراجعة.',
        'Convert a YouTube link into searchable text.',
        'Transformez un lien YouTube en texte consultable.'
      )
    },
    {
      icon: <FaRobot />,
      title: t('ملخصات وخطوات', 'Summaries and action steps', 'Resumes et etapes actionnables'),
      text: t(
        'استخرج أهم الأفكار والخطوات التنفيذية بسرعة.',
        'Generate key insights and next-step actions quickly.',
        'Generez idees cles et prochaines etapes rapidement.'
      )
    },
    {
      icon: <FaComments />,
      title: t('دردشة على نفس المحتوى', 'Chat on top of the same transcript', 'Chat base sur la meme transcription'),
      text: t(
        'اسأل عن الفيديو واحصل على إجابات من نفس النص.',
        'Ask follow-up questions grounded in the same transcript.',
        'Posez des questions basees sur la meme transcription.'
      )
    }
  ];

  const handleStartFromHero = (event) => {
    event.preventDefault();
    const nextUrl = heroUrl.trim();
    if (!nextUrl) {
      setHeroError(t('ضع رابط يوتيوب أولاً.', 'Please paste a YouTube link first.', 'Collez un lien YouTube avant de continuer.'));
      return;
    }
    if (!isLikelyYoutubeUrl(nextUrl)) {
      setHeroError(
        t(
          'الرابط لا يبدو رابط يوتيوب صالح.',
          'This does not look like a valid YouTube URL.',
          "Ce lien ne ressemble pas a une URL YouTube valide."
        )
      );
      return;
    }
    setHeroError('');
    if (typeof onStart === 'function') {
      onStart({ mode: 'signup', url: nextUrl });
    }
  };

  const openLogin = () => {
    if (typeof onStart === 'function') onStart({ mode: 'login' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" dir={dir}>
      <div
        className={`absolute inset-0 -z-30 ${
          isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#081329_48%,#0f172a_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eaf7ff_48%,#eef2ff_100%)]'
        }`}
      />
      <div className="lp-grid absolute inset-0 -z-20 opacity-25" />
      <div className={`lp-glow absolute -top-28 -left-24 w-[380px] h-[380px] rounded-full -z-10 ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-300/35'}`} />
      <div className={`lp-glow absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full -z-10 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-300/30'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <FaBolt />
            </div>
            <div>
              <p className={`font-black text-base sm:text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>TRANSCRIPT AI</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('ملخصات محاضرات وكورسات من يوتيوب', 'Lecture and course summaries from YouTube', 'Resumes de cours depuis YouTube')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div
              className={`inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 ${
                isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-300 bg-white/90'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleTheme?.()}
                className={`w-9 h-9 rounded-lg inline-flex items-center justify-center transition ${
                  isDark ? 'text-amber-200 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'
                }`}
                title={t('تبديل الوضع', 'Toggle theme', 'Basculer le theme')}
              >
                {isDark ? <FaSun /> : <FaMoon />}
              </button>
              <select
                value={lang}
                onChange={(event) => onLangChange?.(event.target.value)}
                className={`h-9 rounded-lg px-2.5 border text-sm font-bold outline-none transition ${
                  isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
                }`}
                title={t('تبديل اللغة', 'Switch language', 'Changer de langue')}
              >
                <option value={LANG.en}>EN</option>
                <option value={LANG.ar}>AR</option>
                <option value={LANG.fr}>FR</option>
              </select>
            </div>

            <NavLink href="/pricing" dark={isDark}>
              {t('الأسعار', 'Pricing', 'Tarification')}
            </NavLink>
            <NavLink href="/contact" dark={isDark}>
              {t('تواصل', 'Contact', 'Contact')}
            </NavLink>
            <button
              onClick={openLogin}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition ${
                isDark ? 'border-slate-700 text-slate-100 hover:bg-slate-800' : 'border-slate-300 text-slate-900 hover:bg-white'
              }`}
            >
              <FaPlayCircle />
              {t('تسجيل دخول', 'Sign in', 'Connexion')}
            </button>
          </div>
        </header>

        <section className="mb-12">
          <div className={`reveal-up rounded-3xl border p-6 sm:p-8 lg:p-10 ${isDark ? 'border-slate-700 bg-slate-900/75' : 'border-slate-200 bg-white/90'}`}>
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 items-start">
              <div>
                <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t(
                    'حول فيديوهات يوتيوب إلى ملخصات مفهومة في دقائق',
                    'Turn YouTube videos into clear summaries in minutes',
                    'Transformez les videos YouTube en resumes clairs en quelques minutes'
                  )}
                </h1>
                <p className={`text-base sm:text-lg mb-6 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t(
                    'للمحاضرات، الكورسات، والمحتوى التعليمي: نص + ملخص + خطوات عملية في مكان واحد.',
                    'For lectures, courses, and educational content: transcript, summary, and practical steps in one place.',
                    'Pour les cours et contenus educatifs : transcription, resume et etapes pratiques au meme endroit.'
                  )}
                </p>

                <form onSubmit={handleStartFromHero} className={`rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-white'}`}>
                  <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {t('ضع رابط يوتيوب وابدأ', 'Paste a YouTube URL and start', 'Collez un lien YouTube et commencez')}
                  </label>
                  <div className="grid sm:grid-cols-[1fr_auto] gap-3">
                    <input
                      type="text"
                      value={heroUrl}
                      onChange={(e) => setHeroUrl(e.target.value)}
                      placeholder={t('https://www.youtube.com/watch?v=...', 'https://www.youtube.com/watch?v=...', 'https://www.youtube.com/watch?v=...')}
                      className={`w-full h-12 rounded-xl border px-4 outline-none transition ${
                        isDark
                          ? 'border-slate-600 bg-slate-950 text-slate-100 focus:border-cyan-500'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-500'
                      }`}
                      dir="ltr"
                    />
                    <button
                      type="submit"
                      className="h-12 px-5 rounded-xl bg-cyan-500 text-white font-black hover:bg-cyan-600 transition inline-flex items-center justify-center gap-2"
                    >
                      {t('استخراج السكريبت', 'Extract Transcript', 'Extraire la transcription')}
                      <FaArrowRight className={isArabic ? 'rotate-180' : ''} />
                    </button>
                  </div>
                  <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t(
                      'عند الضغط هتروح التسجيل مباشرة، والاستخراج يتم بعد تسجيل الدخول.',
                      'You will be redirected to sign up first. Extraction is available after login.',
                      "Vous serez dirige vers l'inscription d'abord. L'extraction est active apres connexion."
                    )}
                  </p>
                  {heroError ? (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">{heroError}</div>
                  ) : null}
                </form>
              </div>

              <div className={`reveal-up delay-1 rounded-2xl border p-5 ${isDark ? 'border-slate-700 bg-slate-950/45' : 'border-slate-200 bg-slate-50/80'}`}>
                <p className={`text-xs font-bold tracking-wider uppercase mb-3 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {t('مشاكل بنحلها', 'Problems we solve', 'Problemes resolus')}
                </p>
                <ul className={`space-y-3 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {painPoints.map((item, idx) => (
                    <li key={`pain-${idx}`} className="flex items-start gap-2">
                      <FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className={`text-2xl sm:text-3xl font-black mb-5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('مين محتاج المنصة دي؟', 'Who needs this platform?', 'Qui a besoin de cette plateforme ?')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {audienceItems.map((item, idx) => (
              <AudienceCard key={`aud-${idx}`} icon={item.icon} title={item.title} points={item.points} dark={isDark} />
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className={`text-2xl sm:text-3xl font-black mb-5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('إيه اللي هتاخده مباشرة؟', 'What do you get immediately?', 'Que recevez-vous immediatement ?')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((item, idx) => (
              <FeatureCard key={`feature-${idx}`} icon={item.icon} title={item.title} text={item.text} dark={isDark} />
            ))}
          </div>
        </section>

        <section className={`rounded-3xl border p-6 sm:p-8 text-center ${isDark ? 'border-cyan-800/80 bg-cyan-950/30' : 'border-cyan-200 bg-cyan-50/80'}`}>
          <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isDark ? 'text-cyan-100' : 'text-slate-900'}`}>
            {t('ابدأ من أول فيديو دلوقتي', 'Start with your first video now', 'Commencez avec votre premiere video')}
          </h2>
          <p className={`max-w-2xl mx-auto mb-5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t(
              'انسخ الرابط، سجل حسابك، وخد نص وملخص وخطوات جاهزة.',
              'Paste the link, sign up, and get transcript, summary, and action steps.',
              'Collez le lien, inscrivez-vous et obtenez transcription, resume et etapes.'
            )}
          </p>
          <button
            onClick={() => onStart?.({ mode: 'signup' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition font-extrabold shadow-lg shadow-cyan-500/25"
          >
            {t('إنشاء حساب', 'Create account', 'Creer un compte')}
            <FaArrowRight className={isArabic ? 'rotate-180' : ''} />
          </button>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
