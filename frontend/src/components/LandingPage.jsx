import {
  FaArrowRight,
  FaBolt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaFileAlt,
  FaGlobe,
  FaHistory,
  FaLink,
  FaPlayCircle,
  FaRobot,
  FaShieldAlt,
  FaTasks
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

function Pill({ children, dark }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold border ${
        dark ? 'bg-slate-900/80 border-slate-700 text-cyan-100' : 'bg-white/80 border-slate-200 text-slate-700'
      }`}
    >
      {children}
    </span>
  );
}

function PainCard({ icon, problem, solution, dark }) {
  return (
    <article
      className={`lp-card reveal-up rounded-2xl border p-5 h-full ${
        dark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">{icon}</div>
      <h3 className={`font-black text-lg mb-2 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{problem}</h3>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{solution}</p>
    </article>
  );
}

function CapabilityCard({ icon, title, desc, dark }) {
  return (
    <article
      className={`lp-card reveal-up rounded-2xl border p-5 ${
        dark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center mb-3">{icon}</div>
      <h3 className={`font-black mb-1 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{desc}</p>
    </article>
  );
}

function StepCard({ step, title, text, dark }) {
  return (
    <article
      className={`lp-card reveal-up rounded-2xl border p-5 ${
        dark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'
      }`}
    >
      <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500 text-white font-black mb-3">{step}</div>
      <h3 className={`font-black mb-1 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
    </article>
  );
}

function LandingPage({ onStart, lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';
  const isArabic = lang === LANG.ar;
  const dir = isArabic ? 'rtl' : 'ltr';
  const t = (ar, en, fr) => tr(lang, ar, en, fr);

  const painPoints = [
    {
      icon: <FaClock />,
      problem: t('بتضيع وقتك في إعادة الفيديو', 'Too much time wasted replaying videos', 'Trop de temps perdu à rejouer les vidéos'),
      solution: t(
        'استخرج النص فورًا بدل إعادة المشاهدة، وارجع لأي نقطة في ثواني.',
        'Extract the transcript instantly and jump to the exact point you need.',
        'Générez la transcription instantanément et accédez directement aux points clés.'
      )
    },
    {
      icon: <FaTasks />,
      problem: t('النقاط المهمة بتضيع وسط الكلام', 'Important insights get buried', 'Les idées importantes se perdent'),
      solution: t(
        'حوّل المحتوى إلى ملخصات وخطوات تنفيذية واضحة بدل ملاحظات مشتتة.',
        'Turn long content into concise summaries and actionable steps.',
        'Transformez le contenu long en résumés clairs et actions concrètes.'
      )
    },
    {
      icon: <FaLink />,
      problem: t('الوصف مليان روابط صعب تتبعها', 'Description links are hard to track', 'Les liens de description sont difficiles à suivre'),
      solution: t(
        'استخرج الروابط والموارد تلقائيًا في قائمة منظمة وجاهزة للاستخدام.',
        'Auto-extract all links and resources into a clean structured list.',
        'Extrayez automatiquement les liens et ressources dans une liste structurée.'
      )
    },
    {
      icon: <FaGlobe />,
      problem: t('اختلاف اللغة يعطل سرعة فريقك', 'Language mismatch slows your team', "La barrière linguistique ralentit l'équipe"),
      solution: t(
        'احصل على مخرجات باللغة اللي تختارها: عربي، إنجليزي، فرنسي وأكثر.',
        'Get outputs in your selected language: Arabic, English, French, and more.',
        'Obtenez des résultats dans la langue choisie : arabe, anglais, français et plus.'
      )
    }
  ];

  const capabilities = [
    {
      icon: <FaFileAlt />,
      title: t('تحويل الرابط إلى نص دقيق', 'Clean URL-to-Text extraction', 'Extraction URL-vers-texte propre'),
      desc: t(
        'يدعم روابط الفيديو العادية وأنواع متعددة من الروابط الصحيحة.',
        'Supports standard YouTube links and valid URL variants.',
        'Prend en charge les liens YouTube standards et leurs variantes valides.'
      )
    },
    {
      icon: <FaRobot />,
      title: t('معالجة ذكية للمحتوى', 'AI-powered content processing', "Traitement de contenu assisté par l'IA"),
      desc: t(
        'ملخصات، خطوات، موارد، وتحليل محتوى قابل للتنفيذ.',
        'Generate summaries, steps, resources, and practical insights.',
        'Générez des résumés, étapes, ressources et insights exploitables.'
      )
    },
    {
      icon: <FaComments />,
      title: t('دردشة سياقية على نفس الفيديو', 'Context-aware chat per video', 'Chat contextuel par vidéo'),
      desc: t(
        'اسأل عن أي نقطة داخل النص وخد إجابة مرتبطة بالمحتوى نفسه.',
        'Ask follow-up questions and get answers grounded in the same transcript.',
        'Posez des questions ciblées et obtenez des réponses liées à la transcription.'
      )
    },
    {
      icon: <FaHistory />,
      title: t('سجل محفوظ وروابط محفوظة', 'Saved history and links', 'Historique et liens sauvegardés'),
      desc: t(
        'كل نتائجك محفوظة لحسابك عشان ترجع لها في أي وقت.',
        'Your extracted outputs stay saved in your account for reuse.',
        'Vos résultats restent enregistrés dans votre compte pour réutilisation.'
      )
    },
    {
      icon: <FaShieldAlt />,
      title: t('لوحة تحكم وإدارة مفاتيح API', 'Admin controls & API key governance', "Contrôle admin et gouvernance des clés API"),
      desc: t(
        'تفعيل المفاتيح الافتراضية من لوحة الأدمن وإدارة الاستخدام بوضوح.',
        'Set default API keys from admin panel and control usage centrally.',
        "Définissez les clés API par défaut depuis l'admin et contrôlez l'usage."
      )
    },
    {
      icon: <FaChartLine />,
      title: t('تجربة أسرع للإنتاج', 'Built for production speed', 'Conçu pour la vitesse de production'),
      desc: t(
        'من اللينك إلى مخرجات منظمة في دقائق، مع تحديثات سجل مرنة.',
        'Move from URL to structured output in minutes with smoother refresh flow.',
        'Passez du lien à un résultat structuré en minutes avec un flux plus fluide.'
      )
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" dir={dir}>
      <div
        className={`absolute inset-0 -z-30 ${
          isDark
            ? 'bg-[linear-gradient(180deg,#020617_0%,#071022_44%,#0f172a_100%)]'
            : 'bg-[linear-gradient(180deg,#f7fafc_0%,#eaf7ff_45%,#f2f3ff_100%)]'
        }`}
      />
      <div className="lp-grid absolute inset-0 -z-20 opacity-30" />
      <div className={`lp-glow absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full -z-10 ${isDark ? 'bg-cyan-500/25' : 'bg-cyan-300/40'}`} />
      <div
        className={`lp-glow absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full -z-10 ${
          isDark ? 'bg-indigo-500/20' : 'bg-indigo-300/35'
        }`}
      />
      <div
        className={`lp-glow absolute bottom-[-140px] left-1/4 w-[420px] h-[420px] rounded-full -z-10 ${
          isDark ? 'bg-amber-400/15' : 'bg-amber-200/35'
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <FaBolt />
            </div>
            <div>
              <div className={`text-base sm:text-lg font-black tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>TRANSCRIPT AI</div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('منصة استخراج وتحليل محتوى يوتيوب', 'YouTube extraction & intelligence platform', "Plateforme d'extraction et d'intelligence YouTube")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink href="/pricing" dark={isDark}>
              {t('الأسعار', 'Pricing', 'Tarification')}
            </NavLink>
            <NavLink href="/contact" dark={isDark}>
              {t('تواصل', 'Contact', 'Contact')}
            </NavLink>
            <NavLink href="/admin" dark={isDark}>
              {t('أدمن', 'Admin', 'Admin')}
            </NavLink>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition font-extrabold shadow-lg shadow-cyan-500/30"
            >
              {t('ابدأ الآن', 'Start now', 'Commencer')}
              <FaArrowRight className={isArabic ? 'rotate-180' : ''} />
            </button>
          </div>
        </header>

        <section className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 sm:gap-8 items-stretch mb-14">
          <div className="reveal-up">
            <div className="flex flex-wrap gap-2 mb-4">
              <Pill dark={isDark}>{t('يوتيوب ← نص', 'YouTube to Text', 'YouTube vers texte')}</Pill>
              <Pill dark={isDark}>{t('مخرجات باللغة المختارة', 'Language-controlled output', 'Sortie contrôlée par langue')}</Pill>
              <Pill dark={isDark}>{t('ملخص + خطوات + موارد', 'Summary + Steps + Resources', 'Résumé + Étapes + Ressources')}</Pill>
            </div>

            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {t(
                'حوّل فوضى الفيديوهات إلى قرارات واضحة وخطوات جاهزة للتنفيذ',
                'Turn video chaos into clear decisions and actionable output',
                'Transformez le chaos vidéo en décisions claires et actions concrètes'
              )}
            </h1>

            <p className={`text-base sm:text-lg mb-6 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {t(
                'لو بتعتمد على فيديوهات يوتيوب للشغل أو التعلم، المنصة دي بتختصر الطريق: تستخرج النص، تنظم الأفكار، وتطلعلك ملخصات وخطوات وروابط قابلة للاستخدام فورًا.',
                'If YouTube drives your workflow, this platform shortens the path: extract transcript, organize insights, and produce usable summaries, steps, and resources.',
                "Si YouTube alimente votre travail, cette plateforme raccourcit le chemin : transcription, organisation des idées et production d'un résultat exploitable."
              )}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={onStart} className="px-6 py-3 rounded-xl bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition">
                {t('أنشئ حسابك مجانًا', 'Create free account', 'Créer un compte gratuit')}
              </button>
              <button
                onClick={onStart}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border font-bold transition ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FaPlayCircle />
                {t('تسجيل الدخول', 'Sign in', 'Se connecter')}
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/85'}`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('قيمة مباشرة', 'Immediate value', 'Valeur immédiate')}</div>
                <div className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('من الرابط إلى نتيجة منظمة', 'From URL to structured output', "Du lien au résultat structuré")}</div>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/85'}`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('مرونة اللغة', 'Language flexibility', 'Flexibilité linguistique')}</div>
                <div className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('نتائج حسب اللغة اللي تختارها', 'Outputs in your selected language', 'Résultats dans votre langue choisie')}</div>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/85'}`}>
                <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('إدارة احترافية', 'Professional management', 'Gestion professionnelle')}</div>
                <div className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('سجل محفوظ + لوحة أدمن', 'Saved history + admin panel', 'Historique sauvegardé + panneau admin')}</div>
              </div>
            </div>
          </div>

          <div className="reveal-up delay-1">
            <div className={`rounded-3xl border p-5 sm:p-6 h-full relative overflow-hidden ${isDark ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white/90'}`}>
              <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} px-3 py-1 text-xs font-bold rounded-br-xl rounded-tl-2xl ${isDark ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-700'}`}>
                {t('مسار القيمة', 'Value Flow', 'Flux de valeur')}
              </div>

              <h2 className={`font-black text-lg mb-4 mt-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {t('قبل المنصة / بعد المنصة', 'Before vs After', 'Avant vs Après')}
              </h2>

              <div className="space-y-3 mb-5">
                <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-sm font-black mb-1 ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{t('قبل', 'Before', 'Avant')}</p>
                  <ul className={`text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>{t('مشاهدة طويلة + ملاحظات مشتتة', 'Long watch time + scattered notes', 'Visionnage long + notes dispersées')}</li>
                    <li>{t('صعوبة الرجوع للمعلومة بسرعة', 'Hard to retrieve info quickly', "Difficile de retrouver l'info rapidement")}</li>
                    <li>{t('خطوات التنفيذ غير واضحة', 'Execution steps unclear', "Étapes d'exécution floues")}</li>
                  </ul>
                </div>

                <div className={`rounded-xl border p-3 ${isDark ? 'border-cyan-700/70 bg-cyan-950/40' : 'border-cyan-200 bg-cyan-50'}`}>
                  <p className={`text-sm font-black mb-1 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>{t('بعد', 'After', 'Après')}</p>
                  <ul className={`text-sm leading-7 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    <li>{t('نص جاهز للبحث والمراجعة', 'Searchable transcript ready instantly', 'Transcription prête et consultable')}</li>
                    <li>{t('ملخصات مركزة وخطوات قابلة للتنفيذ', 'Focused summaries and executable steps', 'Résumés ciblés et étapes actionnables')}</li>
                    <li>{t('روابط وموارد منظمة داخل الحساب', 'Organized links and resources in account', 'Liens et ressources organisés dans le compte')}</li>
                  </ul>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-white'}`}>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('التركيز', 'Focus', 'Concentration')}</div>
                  <div className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('نتائج أوضح', 'Clearer output', 'Résultats plus clairs')}</div>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-white'}`}>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('السرعة', 'Speed', 'Vitesse')}</div>
                  <div className={`font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('تنفيذ أسرع', 'Faster execution', 'Exécution accélérée')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-5">
            <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {t('المشاكل اللي بنحلها فعليًا', 'Problems we solve in real workflows', 'Problèmes résolus dans les vrais workflows')}
            </h2>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {t(
                'مش مجرد أداة استخراج نص. الهدف هو تحويل الفيديو إلى مخرجات تساعدك تاخد قرار وتتحرك.',
                'Not just transcript extraction. The goal is converting video into decisions and action.',
                "Ce n'est pas seulement une extraction de texte. Le but est de transformer la vidéo en décision et action."
              )}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {painPoints.map((item, index) => (
              <PainCard key={`pain-${index}`} icon={item.icon} problem={item.problem} solution={item.solution} dark={isDark} />
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {t('الإمكانيات الأساسية للمنصة', 'Core platform capabilities', 'Capacités principales de la plateforme')}
              </h2>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {t(
                  'بناء متكامل يجمع الاستخراج والمعالجة والسجل في تجربة واحدة.',
                  'A unified stack for extraction, processing, and saved outputs in one experience.',
                  "Un ensemble unifié pour extraction, traitement et sauvegarde dans une seule expérience."
                )}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${isDark ? 'border-slate-700 bg-slate-900/70 text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
              <FaCheckCircle className="text-emerald-500" />
              {t('جاهز للاستخدام اليومي', 'Ready for daily operations', 'Prêt pour les opérations quotidiennes')}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((item, index) => (
              <CapabilityCard key={`cap-${index}`} icon={item.icon} title={item.title} desc={item.desc} dark={isDark} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className={`text-2xl sm:text-3xl font-black mb-5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {t('كيف تبدأ خلال دقائق', 'How to start in minutes', 'Comment démarrer en quelques minutes')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <StepCard
              step="1"
              title={t('سجل دخولك', 'Sign in', 'Connectez-vous')}
              text={t(
                'أنشئ حسابك وادخل مساحة العمل مباشرة.',
                'Create your account and open the workspace.',
                'Créez votre compte puis ouvrez votre espace.'
              )}
              dark={isDark}
            />
            <StepCard
              step="2"
              title={t('ضع رابط الفيديو', 'Paste video URL', "Collez l'URL vidéo")}
              text={t(
                'أضف رابط يوتيوب الصحيح وابدأ الاستخراج.',
                'Submit a valid YouTube link and start extraction.',
                'Soumettez un lien YouTube valide et lancez l’extraction.'
              )}
              dark={isDark}
            />
            <StepCard
              step="3"
              title={t('استلم النتائج واشتغل عليها', 'Use results instantly', 'Exploitez le résultat immédiatement')}
              text={t(
                'راجع النص، فعّل المعالجة الذكية، واحفظ النتائج في السجل.',
                'Review transcript, run AI processing, and save everything in history.',
                'Consultez la transcription, lancez le traitement IA et sauvegardez.'
              )}
              dark={isDark}
            />
          </div>
        </section>

        <section className={`rounded-3xl border p-6 sm:p-8 mb-8 text-center ${isDark ? 'border-cyan-800/80 bg-cyan-950/30' : 'border-cyan-200 bg-cyan-50/80'}`}>
          <h2 className={`text-2xl sm:text-3xl font-black mb-3 ${isDark ? 'text-cyan-100' : 'text-slate-900'}`}>
            {t('جاهز تحول كل فيديو إلى مخرجات تخدم شغلك؟', 'Ready to turn every video into workflow-ready output?', 'Prêt à transformer chaque vidéo en résultat exploitable ?')}
          </h2>
          <p className={`max-w-2xl mx-auto mb-5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t(
              'ابدأ الآن وخلّي النص والملخص والروابط والخطوات في مكان واحد.',
              'Start now and keep transcript, summary, links, and steps in one place.',
              'Commencez maintenant et centralisez transcription, résumé, liens et étapes.'
            )}
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition font-extrabold shadow-lg shadow-cyan-500/25"
          >
            {t('ابدأ مجانًا', 'Start for free', 'Démarrer gratuitement')}
            <FaArrowRight className={isArabic ? 'rotate-180' : ''} />
          </button>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
