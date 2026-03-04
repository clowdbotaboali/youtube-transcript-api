const SITE_ORIGIN = 'https://transcripta.tech';
const SITE_NAME = 'Transcripta AI';
const TOOL_PATH = '/tool';
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = Object.freeze(['en', 'ar', 'fr']);
const PUBLISHED_AT_ISO = '2026-03-05T00:00:00.000Z';

const LANDING_SLUGS = Object.freeze([
  'youtube-transcript-generator',
  'youtube-video-to-text',
  'extract-youtube-transcript',
  'download-youtube-transcript',
  'youtube-transcript-api',
  'video-to-text-ai',
  'youtube-caption-extractor',
  'youtube-subtitle-to-text',
  'youtube-transcript-free',
  'youtube-video-notes'
]);

const CLUSTER_SLUGS = Object.freeze([
  'youtube-transcripts',
  'video-to-text',
  'ai-video-learning'
]);

const BASE_BLOG_SLUGS = Object.freeze([
  'youtube-transcript-generator',
  'youtube-transcript-downloader',
  'youtube-subtitles-extractor',
  'youtube-transcript-to-text',
  'youtube-video-to-transcript',
  'copy-youtube-transcript',
  'youtube-subtitle-converter',
  'youtube-transcript-ai-summary',
  'youtube-video-text-extraction',
  'convert-youtube-speech-to-text',
  'extract-youtube-captions',
  'get-youtube-video-transcript',
  'download-youtube-captions-text',
  'youtube-closed-captions-to-text',
  'youtube-audio-to-text-online',
  'transcribe-youtube-videos-fast',
  'youtube-transcript-for-notes',
  'youtube-transcript-for-seo',
  'summarize-youtube-transcript',
  'youtube-transcript-for-study',
  'youtube-transcript-for-podcast',
  'translate-youtube-transcript',
  'youtube-transcript-export',
  'youtube-subtitles-to-article',
  'youtube-video-summary-generator',
  'youtube-content-repurposing-text',
  'youtube-transcript-copy-paste',
  'youtube-caption-text-generator',
  'youtube-video-caption-extractor',
  'youtube-transcript-tool-online'
]);

const PLATFORM_SLUGS = Object.freeze(['youtube', 'ted', 'vimeo', 'udemy', 'coursera', 'tiktok']);
const LANGUAGE_SLUGS = Object.freeze(['arabic', 'french', 'spanish', 'german', 'italian', 'portuguese']);
const USECASE_SLUGS = Object.freeze(['students', 'research', 'blogging', 'content-creators', 'marketers']);

const PROGRAMMATIC_BLOG_SLUGS = Object.freeze([
  ...PLATFORM_SLUGS.map((platform) => `how-to-get-transcript-from-${platform}`),
  ...LANGUAGE_SLUGS.map((language) => `video-to-text-${language}`),
  ...USECASE_SLUGS.map((useCase) => `youtube-transcript-for-${useCase}`)
]);

const BLOG_SLUGS = Object.freeze(Array.from(new Set([...BASE_BLOG_SLUGS, ...PROGRAMMATIC_BLOG_SLUGS])));
const BLOG_SLUG_SET = new Set(BLOG_SLUGS);
const LANDING_SLUG_SET = new Set(LANDING_SLUGS);
const CLUSTER_SLUG_SET = new Set(CLUSTER_SLUGS);

export const BLOG_TOPIC_SLUGS = BLOG_SLUGS;
export const BLOG_ARTICLE_PATHS = Object.freeze(
  SUPPORTED_LANGS.flatMap((lang) => BLOG_SLUGS.map((slug) => `/${lang}/blog/${slug}`))
);
export const BLOG_LEGACY_PATHS = Object.freeze(BLOG_SLUGS.map((slug) => `/blog/${slug}`));

const STOP_TOKENS = new Set([
  'how',
  'to',
  'get',
  'from',
  'for',
  'the',
  'a',
  'an',
  'in',
  'on',
  'of',
  'and',
  'online',
  'fast',
  'free'
]);

const PLATFORM_LABELS = {
  en: {
    youtube: 'YouTube',
    ted: 'TED',
    vimeo: 'Vimeo',
    udemy: 'Udemy',
    coursera: 'Coursera',
    tiktok: 'TikTok'
  },
  ar: {
    youtube: 'يوتيوب',
    ted: 'TED',
    vimeo: 'فيميو',
    udemy: 'يوديمي',
    coursera: 'كورسيرا',
    tiktok: 'تيك توك'
  },
  fr: {
    youtube: 'YouTube',
    ted: 'TED',
    vimeo: 'Vimeo',
    udemy: 'Udemy',
    coursera: 'Coursera',
    tiktok: 'TikTok'
  }
};

const LANGUAGE_LABELS = {
  en: {
    arabic: 'Arabic',
    french: 'French',
    spanish: 'Spanish',
    german: 'German',
    italian: 'Italian',
    portuguese: 'Portuguese'
  },
  ar: {
    arabic: 'العربية',
    french: 'الفرنسية',
    spanish: 'الإسبانية',
    german: 'الألمانية',
    italian: 'الإيطالية',
    portuguese: 'البرتغالية'
  },
  fr: {
    arabic: 'arabe',
    french: 'francais',
    spanish: 'espagnol',
    german: 'allemand',
    italian: 'italien',
    portuguese: 'portugais'
  }
};

const USECASE_LABELS = {
  en: {
    students: 'students',
    research: 'research',
    blogging: 'blogging',
    'content-creators': 'content creators',
    marketers: 'marketers'
  },
  ar: {
    students: 'الطلاب',
    research: 'البحث العلمي',
    blogging: 'التدوين',
    'content-creators': 'صناع المحتوى',
    marketers: 'المسوقين'
  },
  fr: {
    students: 'etudiants',
    research: 'recherche',
    blogging: 'blogging',
    'content-creators': 'createurs de contenu',
    marketers: 'marketeurs'
  }
};

const CLUSTER_COPY = {
  'youtube-transcripts': {
    en: 'YouTube Transcripts',
    ar: 'تفريغ يوتيوب',
    fr: 'Transcriptions YouTube'
  },
  'video-to-text': {
    en: 'Video to Text',
    ar: 'تحويل الفيديو إلى نص',
    fr: 'Video vers texte'
  },
  'ai-video-learning': {
    en: 'AI Video Learning',
    ar: 'التعلم من الفيديو بالذكاء الاصطناعي',
    fr: 'Apprentissage video avec IA'
  }
};

const COPY = {
  en: {
    publishedLabel: 'Published',
    ctaLabel: 'Generate transcript instantly',
    introTitle: 'Introduction',
    problemTitle: 'Section 1: Problem explanation',
    howTitle: 'How it works',
    stepsTitle: 'Section 2: Step-by-step method',
    benefitsTitle: 'Section 3: Benefits of transcripts',
    useCasesTitle: 'Use cases',
    detailTitle: 'Deep practical guide',
    ctaTitle: 'Section 4: Use the tool',
    faqTitle: 'Section 5: FAQ',
    relatedArticlesTitle: 'Related articles',
    relatedLandingTitle: 'Recommended tool pages',
    languageHomeText: 'Back to language homepage',
    toolLinkText: 'Open transcript tool'
  },
  ar: {
    publishedLabel: 'تاريخ النشر',
    ctaLabel: 'Generate transcript instantly',
    introTitle: 'المقدمة',
    problemTitle: 'القسم 1: شرح المشكلة',
    howTitle: 'كيف تعمل الأداة',
    stepsTitle: 'القسم 2: الطريقة خطوة بخطوة',
    benefitsTitle: 'القسم 3: فوائد التفريغ النصي',
    useCasesTitle: 'حالات الاستخدام',
    detailTitle: 'دليل عملي تفصيلي',
    ctaTitle: 'القسم 4: استخدم الأداة',
    faqTitle: 'القسم 5: الأسئلة الشائعة',
    relatedArticlesTitle: 'مقالات مرتبطة',
    relatedLandingTitle: 'صفحات المنتج المقترحة',
    languageHomeText: 'العودة إلى الصفحة الرئيسية باللغة الحالية',
    toolLinkText: 'فتح أداة التفريغ'
  },
  fr: {
    publishedLabel: 'Date de publication',
    ctaLabel: 'Generate transcript instantly',
    introTitle: 'Introduction',
    problemTitle: 'Section 1: Explication du probleme',
    howTitle: 'Comment cela fonctionne',
    stepsTitle: 'Section 2: Methode pas a pas',
    benefitsTitle: 'Section 3: Benefices des transcriptions',
    useCasesTitle: 'Cas d usage',
    detailTitle: 'Guide pratique detaille',
    ctaTitle: 'Section 4: Utiliser l outil',
    faqTitle: 'Section 5: FAQ',
    relatedArticlesTitle: 'Articles associes',
    relatedLandingTitle: 'Pages produit recommandees',
    languageHomeText: 'Retour a la page d accueil de la langue',
    toolLinkText: 'Ouvrir l outil de transcription'
  }
};

function normalizePath(pathname) {
  const raw = String(pathname || '/').trim();
  if (!raw) return '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withSlash === '/') return '/';
  return withSlash.replace(/\/+$/, '');
}

function normalizeLang(value) {
  const candidate = String(value || '').trim().toLowerCase();
  return SUPPORTED_LANGS.includes(candidate) ? candidate : DEFAULT_LANG;
}

function wordsFromSlug(slug) {
  return String(slug || '')
    .split('-')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function toTitleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
    .join(' ')
    .trim();
}

function slugToReadable(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .join(' ');
}

function getPlatformLabel(lang, platformSlug) {
  return PLATFORM_LABELS[lang]?.[platformSlug] || PLATFORM_LABELS.en[platformSlug] || platformSlug;
}

function getLanguageLabel(lang, languageSlug) {
  return LANGUAGE_LABELS[lang]?.[languageSlug] || LANGUAGE_LABELS.en[languageSlug] || languageSlug;
}

function getUsecaseLabel(lang, usecaseSlug) {
  return USECASE_LABELS[lang]?.[usecaseSlug] || USECASE_LABELS.en[usecaseSlug] || usecaseSlug;
}

function getClusterLabel(lang, clusterSlug) {
  return CLUSTER_COPY[clusterSlug]?.[lang] || CLUSTER_COPY[clusterSlug]?.en || toTitleCase(slugToReadable(clusterSlug));
}
function detectProgrammaticKeyword(lang, slug) {
  const platformMatch = slug.match(/^how-to-get-transcript-from-([a-z0-9-]+)$/);
  if (platformMatch) {
    const platform = getPlatformLabel(lang, platformMatch[1]);
    if (lang === 'ar') return `كيفية استخراج تفريغ من ${platform}`;
    if (lang === 'fr') return `comment obtenir une transcription depuis ${platform}`;
    return `how to get transcript from ${platform}`;
  }

  const languageMatch = slug.match(/^video-to-text-([a-z0-9-]+)$/);
  if (languageMatch) {
    const languageName = getLanguageLabel(lang, languageMatch[1]);
    if (lang === 'ar') return `تحويل الفيديو إلى نص ${languageName}`;
    if (lang === 'fr') return `video vers texte ${languageName}`;
    return `video to text ${languageName}`;
  }

  const usecaseMatch = slug.match(/^youtube-transcript-for-([a-z0-9-]+)$/);
  if (usecaseMatch) {
    const usecase = getUsecaseLabel(lang, usecaseMatch[1]);
    if (lang === 'ar') return `تفريغ يوتيوب من أجل ${usecase}`;
    if (lang === 'fr') return `transcription YouTube pour ${usecase}`;
    return `youtube transcript for ${usecase}`;
  }

  return '';
}

function keywordForSlug(lang, slug) {
  const programmatic = detectProgrammaticKeyword(lang, slug);
  if (programmatic) return programmatic;
  const raw = slugToReadable(slug);
  if (lang === 'ar') return `${raw} أداة`;
  if (lang === 'fr') return `${raw} outil`;
  return raw;
}

function metaTitleForRoute(lang, routeType, keyword) {
  if (routeType === 'landing') {
    if (lang === 'ar') return `${keyword} | أداة سريعة ومجانية | ${SITE_NAME}`;
    if (lang === 'fr') return `${toTitleCase(keyword)} | Outil rapide et gratuit | ${SITE_NAME}`;
    return `${toTitleCase(keyword)} | Fast Free Tool | ${SITE_NAME}`;
  }

  if (routeType === 'cluster') {
    if (lang === 'ar') return `${keyword} | مركز مقالات SEO | ${SITE_NAME}`;
    if (lang === 'fr') return `${toTitleCase(keyword)} | Hub SEO | ${SITE_NAME}`;
    return `${toTitleCase(keyword)} | SEO Hub | ${SITE_NAME}`;
  }

  if (lang === 'ar') return `${keyword} | دليل عملي كامل | ${SITE_NAME}`;
  if (lang === 'fr') return `${toTitleCase(keyword)} | Guide pratique complet | ${SITE_NAME}`;
  return `${toTitleCase(keyword)} | Complete Practical Guide | ${SITE_NAME}`;
}

function metaDescriptionForRoute(lang, routeType, keyword) {
  if (lang === 'ar') {
    if (routeType === 'cluster') {
      return `مركز محتوى ${keyword} يربط بين الأدلة والأدوات والمقالات العملية لتحسين الظهور في نتائج البحث.`;
    }
    if (routeType === 'landing') {
      return `استخدم ${keyword} لتحويل فيديوهات يوتيوب إلى نص قابل للنسخ والبحث في ثوانٍ مع خطوات واضحة ونتائج فورية.`;
    }
    return `دليل شامل حول ${keyword} مع شرح المشكلة، خطوات التنفيذ، الفوائد، الأسئلة الشائعة، وروابط داخلية قوية.`;
  }

  if (lang === 'fr') {
    if (routeType === 'cluster') {
      return `Hub SEO ${keyword} reliant des guides, pages produit et articles pour une meilleure indexation organique.`;
    }
    if (routeType === 'landing') {
      return `Utilisez ${keyword} pour transformer des videos en texte exploitable en quelques secondes.`;
    }
    return `Guide complet sur ${keyword} avec methode pas a pas, avantages, FAQ et maillage interne solide.`;
  }

  if (routeType === 'cluster') {
    return `SEO hub for ${keyword} linking high-intent pages and programmatic guides for better indexing and topical authority.`;
  }
  if (routeType === 'landing') {
    return `Use ${keyword} to convert long videos into searchable text, summaries, and practical outputs in seconds.`;
  }
  return `Complete guide for ${keyword} with practical steps, transcript benefits, FAQ schema, and strong internal links.`;
}

function introParagraphs(lang, keyword, routeType) {
  if (lang === 'ar') {
    return [
      `صفحة ${keyword} موجهة لمن يريد استخراج النص من الفيديو بسرعة وبدون خطوات معقدة. الفكرة الأساسية هي تحويل الكلام داخل الفيديو إلى نص منظم يمكن نسخه والبحث فيه مباشرة.`,
      routeType === 'cluster'
        ? 'في هذا المركز ستجد روابط منظمة لأهم الأدلة والصفحات العملية حتى تصل للمحتوى المناسب بسرعة وتبني مسار تعلم أو إنتاج متكامل.'
        : 'نحافظ على نفس تجربة المنتج الحالية، لكن نضيف محتوى بحثي منظم يساعد Google على فهم الصفحة وربطها بنيّة الباحث الصحيحة.'
    ];
  }

  if (lang === 'fr') {
    return [
      `La page ${keyword} cible les recherches a forte intention. Elle aide a convertir une video longue en texte clair, reutilisable et consultable rapidement.`,
      routeType === 'cluster'
        ? 'Ce hub organise les meilleurs contenus par theme pour renforcer le maillage interne et l autorite semantique.'
        : 'Le design reste identique au produit, tandis que la structure SEO est renforcee pour l indexation organique.'
    ];
  }

  return [
    `The ${keyword} page is built for high-intent visitors who want fast transcript extraction and clear, reusable text output.`,
    routeType === 'cluster'
      ? 'This hub organizes related guides and landing pages into one topical node to strengthen internal authority.'
      : 'The product UI stays unchanged while the page structure is optimized for indexing, crawling depth, and user intent.'
  ];
}

function problemParagraphs(lang) {
  if (lang === 'ar') {
    return [
      'الاستخراج اليدوي من الفيديو مرهق: توقف وتشغيل مستمر، فقدان للنقاط المهمة، وصعوبة كبيرة في مشاركة المعلومات داخل الفريق.',
      'عند غياب النص، يصبح من الصعب تحويل المحتوى إلى ملخصات أو مقالات أو ملاحظات دراسة، وهذا يقلل الاستفادة الحقيقية من الفيديو.'
    ];
  }
  if (lang === 'fr') {
    return [
      'L extraction manuelle est lente: pause, retour arriere, copie fragmentee et perte de contexte important.',
      'Sans texte propre, il devient difficile de reutiliser le contenu pour la formation, le blogging ou la recherche.'
    ];
  }
  return [
    'Manual extraction is inefficient: repeated pausing, timestamp hunting, and fragmented copy-paste behavior that breaks context.',
    'Without reliable transcript text, teams struggle to summarize, repurpose, and operationalize video knowledge at scale.'
  ];
}

function howItWorksParagraphs(lang, keyword) {
  if (lang === 'ar') {
    return [
      `آلية ${keyword} بسيطة: تلصق رابط الفيديو، تنفذ الاستخراج، ثم تحصل على نص جاهز للاستخدام في الدراسة أو صناعة المحتوى أو البحث.`,
      'بعد استخراج النص، يمكن تنفيذ معالجة ذكية: تلخيص، تنظيم أفكار، وصياغة مخرجات عملية مع قابلية نسخ ومشاركة مباشرة.'
    ];
  }
  if (lang === 'fr') {
    return [
      `Le flux ${keyword} est simple: coller l URL, lancer l extraction, puis reutiliser le texte immediatement.`,
      'Une fois la transcription disponible, vous pouvez resumer, structurer et transformer la video en livrables actionnables.'
    ];
  }
  return [
    `The ${keyword} workflow is straightforward: paste the video URL, run extraction, then use structured text instantly.`,
    'Once transcript text is available, you can summarize, reorganize, and convert ideas into outputs for execution.'
  ];
}

function methodSteps(lang) {
  if (lang === 'ar') {
    return [
      {
        title: 'Step 1: انسخ رابط الفيديو',
        text: 'افتح الفيديو المطلوب ثم انسخ الرابط الكامل من المتصفح.'
      },
      {
        title: 'Step 2: افتح أداة التفريغ',
        text: 'ادخل إلى صفحة الأداة والصق الرابط في حقل الإدخال.'
      },
      {
        title: 'Step 3: استخرج النص فوراً',
        text: 'شغّل الاستخراج واحصل على النص الجاهز للنسخ والبحث وإعادة الاستخدام.'
      }
    ];
  }
  if (lang === 'fr') {
    return [
      {
        title: 'Step 1: Copier le lien video',
        text: 'Ouvrez la video cible puis copiez son URL complete.'
      },
      {
        title: 'Step 2: Ouvrir l outil',
        text: 'Accedez a la page outil et collez le lien.'
      },
      {
        title: 'Step 3: Extraire la transcription',
        text: 'Lancez l extraction pour recuperer un texte reutilisable immediatement.'
      }
    ];
  }
  return [
    {
      title: 'Step 1: Copy the video URL',
      text: 'Open the target video and copy the full link.'
    },
    {
      title: 'Step 2: Open the transcript tool',
      text: 'Visit the tool page and paste the URL into the input field.'
    },
    {
      title: 'Step 3: Extract transcript text',
      text: 'Run extraction and get text that is searchable, shareable, and reusable.'
    }
  ];
}

function benefitItems(lang) {
  if (lang === 'ar') {
    return [
      'البحث السريع داخل النص بدلاً من مراجعة الفيديو بالكامل.',
      'توفير وقت كبير في المراجعة والتحرير وإنتاج المحتوى.',
      'تحويل الفيديو إلى ملاحظات دراسة قابلة للمشاركة.',
      'دعم فرق المحتوى والتسويق بمرجع نصي موحد.',
      'تسهيل التلخيص، الاقتباس، وإعادة التوظيف.',
      'تحسين قابلية الأرشفة والرجوع للمعلومة.'
    ];
  }
  if (lang === 'fr') {
    return [
      'Recherche instantanee dans le texte plutot que dans la timeline video.',
      'Gain de temps pour revision, redaction et documentation.',
      'Transformation des videos en notes exploitables.',
      'Reference commune pour les equipes contenu et marketing.',
      'Reutilisation facile en articles, scripts et supports.',
      'Meilleure conservation des connaissances.'
    ];
  }
  return [
    'Instant text search instead of timeline scrolling.',
    'Significant time savings for review and production.',
    'Reusable notes for learning and execution.',
    'Shared reference layer for teams.',
    'Easy repurposing into articles and briefs.',
    'Higher information retention over time.'
  ];
}

function caseItems(lang) {
  if (lang === 'ar') {
    return [
      'الطلاب: تحويل المحاضرات إلى نقاط مراجعة سريعة.',
      'الباحثون: جمع الاقتباسات والمفاهيم من فيديوهات متعددة.',
      'صناع المحتوى: إعادة إنتاج الفيديو كمقال أو سكربت.',
      'المسوقون: استخراج رسائل القيمة من مقابلات ومنتجات.',
      'فرق الدعم: بناء قاعدة معرفة من فيديوهات الشرح.',
      'المديرون: مراجعة محتوى تدريبي بسرعة مع قرارات أسرع.'
    ];
  }
  if (lang === 'fr') {
    return [
      'Etudiants: transformer les cours en notes revisees.',
      'Chercheurs: collecter idees et citations avec precision.',
      'Createurs: reutiliser la video en article ou script.',
      'Marketeurs: extraire messages cles et objections clients.',
      'Support: construire une base de connaissance searchable.',
      'Managers: analyser rapidement les contenus de formation.'
    ];
  }
  return [
    'Students: convert lectures into revision notes.',
    'Researchers: extract quotes and concepts faster.',
    'Creators: repurpose video into blogs and scripts.',
    'Marketers: pull messaging angles and proof points.',
    'Support teams: build searchable knowledge bases.',
    'Managers: review long training videos quickly.'
  ];
}
function buildLongGuideParagraphs(lang, keyword) {
  const phasesByLang = {
    en: [
      'capture spoken context accurately',
      'clean transcript blocks into usable structure',
      'map intent, entities, and action points',
      'repurpose content across channels',
      'apply quality checks before publishing',
      'measure impact and iterate the workflow'
    ],
    ar: [
      'التقاط الكلام بدقة مع الحفاظ على السياق',
      'تنظيف النص وتقسيمه لوحدات سهلة القراءة',
      'استخراج النوايا والأفكار القابلة للتنفيذ',
      'إعادة توظيف المحتوى في قنوات مختلفة',
      'مراجعة الجودة قبل النشر أو المشاركة',
      'قياس الأثر وتحسين سير العمل باستمرار'
    ],
    fr: [
      'capturer le contexte oral avec precision',
      'nettoyer la transcription pour un usage direct',
      'identifier intentions, entites et actions',
      'reutiliser le contenu sur plusieurs canaux',
      'controler la qualite avant diffusion',
      'mesurer les resultats et iterer le process'
    ]
  };

  const phases = phasesByLang[lang] || phasesByLang.en;
  const paragraphs = [];

  phases.forEach((phase, index) => {
    if (lang === 'ar') {
      paragraphs.push(
        `المرحلة ${index + 1} في مسار ${keyword} تبدأ بـ ${phase}. الهدف ليس فقط استخراج الكلمات، بل بناء نص واضح يمكن الرجوع إليه لاحقاً بدون فقدان المعنى. عندما يصبح النص منظمًا، تقدر تكتشف التفاصيل بسرعة وتشاركها مع الفريق بشكل عملي.`
      );
      paragraphs.push(
        `في نفس المرحلة، اعتمد على بنية ثابتة: عنوان الفكرة، نقاط داعمة، وخلاصة قابلة للتنفيذ. هذا الأسلوب يحول الفيديو الطويل إلى وحدات معرفة قصيرة، ويجعل المراجعة أسرع بكثير من المشاهدة المتكررة. النتيجة النهائية هي سير عمل مستقر يمكن تكراره يومياً.`
      );
      paragraphs.push(
        `كلما تطورت هذه المرحلة، تزيد قيمة الصفحة في محركات البحث لأن المحتوى يصبح أعمق وأكثر ارتباطًا بنيّة المستخدم. لهذا نربط بين الدليل، صفحة الأداة، وصفحات المنتج الأخرى بروابط داخلية واضحة. هذا الربط يحسن الفهم الدلالي ويعزز فرص الظهور العضوي.`
      );
      return;
    }

    if (lang === 'fr') {
      paragraphs.push(
        `L etape ${index + 1} du flux ${keyword} consiste a ${phase}. L objectif n est pas seulement de recuperer des mots, mais de produire un texte fiable qui garde le sens original. Ce niveau de clarte facilite la recherche d informations et la reutilisation dans des livrables concrets.`
      );
      paragraphs.push(
        `Dans cette etape, une structure stable est essentielle: idee principale, preuves, puis action recommandee. Cette methode transforme une video longue en blocs exploitables et reduit fortement le temps de revision. Elle permet aussi de standardiser la qualite entre plusieurs membres d equipe.`
      );
      paragraphs.push(
        `Plus cette etape est bien executee, plus la page gagne en autorite SEO. Le maillage interne entre guide, outil principal et pages produit cree un contexte semantique solide pour Google. Le resultat est un contenu mieux indexe, plus utile et plus durable dans le temps.`
      );
      return;
    }

    paragraphs.push(
      `Stage ${index + 1} of a ${keyword} workflow is to ${phase}. The goal is not only extracting raw words, but preserving context with clean structure so the transcript remains reliable under repeated use. This enables faster discovery, cleaner summaries, and stronger decision quality across editorial, learning, and research workflows.`
    );
    paragraphs.push(
      `At this stage, use a repeatable frame: core idea, supporting evidence, and next action. That frame transforms long-form video into operational knowledge blocks instead of passive media. Teams can onboard faster, compare multiple sources consistently, and turn transcript text into assets without rebuilding context each time.`
    );
    paragraphs.push(
      `When this stage is implemented well, SEO value compounds. Internal links connect intent pages, tool pages, and supporting guides into one topical graph. Search engines understand relevance more clearly, while visitors move naturally to deeper content. This is how programmatic SEO scales without breaking user experience or design consistency.`
    );
  });

  return paragraphs;
}

function buildFaqItems(lang, keyword) {
  if (lang === 'ar') {
    return [
      {
        question: `ما هي أداة ${keyword}؟`,
        answer: 'هي أداة لاستخراج الكلام من الفيديو وتحويله إلى نص منظم قابل للنسخ والبحث.'
      },
      {
        question: 'هل يمكنني نسخ النص الناتج؟',
        answer: 'نعم، يمكنك نسخ النص وإعادة استخدامه في الدراسة أو المحتوى أو التقارير.'
      },
      {
        question: 'هل الدقة ثابتة في كل الفيديوهات؟',
        answer: 'الدقة تعتمد على جودة الترجمة أو النص المتاح داخل الفيديو الأصلي.'
      },
      {
        question: 'هل الصفحة مرتبطة مباشرة بالأداة؟',
        answer: 'نعم، كل صفحة تحتوي زر مباشر للانتقال إلى الأداة الرئيسية.'
      }
    ];
  }

  if (lang === 'fr') {
    return [
      {
        question: `Qu est-ce que ${keyword} ?`,
        answer: 'C est un outil qui extrait la parole video et la convertit en texte reutilisable.'
      },
      {
        question: 'Puis-je copier la transcription ?',
        answer: 'Oui, la transcription peut etre copiee puis reutilisee dans votre workflow.'
      },
      {
        question: 'La precision est-elle toujours identique ?',
        answer: 'La precision depend de la qualite des sous-titres et de la source video.'
      },
      {
        question: 'Y a-t-il un lien direct vers l outil ?',
        answer: 'Oui, chaque page inclut un CTA vers la page outil principale.'
      }
    ];
  }

  return [
    {
      question: `What is ${keyword}?`,
      answer: 'It is a tool-focused workflow to extract spoken video content as reusable text.'
    },
    {
      question: 'Can I copy the generated transcript?',
      answer: 'Yes. The transcript output can be copied and reused immediately.'
    },
    {
      question: 'Is transcript accuracy always the same?',
      answer: 'Accuracy depends on source subtitle quality and audio clarity.'
    },
    {
      question: 'Does each page link to the tool?',
      answer: 'Yes. Every page includes a direct CTA to the main transcript tool.'
    }
  ];
}

function buildFaqSchema(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export function getSoftwareApplicationSchema(path = '/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Transcripta AI',
    applicationCategory: 'AIApplication',
    operatingSystem: 'Web',
    url: `${SITE_ORIGIN}${normalizePath(path)}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };
}

function tokenize(slug) {
  return wordsFromSlug(slug).filter((token) => token && !STOP_TOKENS.has(token));
}

function similarityScore(sourceSlug, targetSlug) {
  const sourceTokens = new Set(tokenize(sourceSlug));
  const targetTokens = new Set(tokenize(targetSlug));
  if (!sourceTokens.size || !targetTokens.size) return 0;

  let intersection = 0;
  sourceTokens.forEach((token) => {
    if (targetTokens.has(token)) intersection += 1;
  });

  const union = sourceTokens.size + targetTokens.size - intersection;
  const firstSource = wordsFromSlug(sourceSlug)[0] || '';
  const firstTarget = wordsFromSlug(targetSlug)[0] || '';
  const firstTokenBonus = firstSource && firstSource === firstTarget ? 1.5 : 0;
  return intersection * 4 + intersection / Math.max(union, 1) + firstTokenBonus;
}

function pickRelatedArticleSlugs(slug, limit = 8) {
  const scored = BLOG_SLUGS.filter((item) => item !== slug).map((item) => ({
    slug: item,
    score: similarityScore(slug, item)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.slug.localeCompare(b.slug);
  });

  const selected = scored.slice(0, Math.max(limit, 5)).map((item) => item.slug);
  return selected.slice(0, limit);
}

function pickLandingSlugsForRoute(slug) {
  const tokens = new Set(wordsFromSlug(slug));
  const picks = [];
  const push = (value) => {
    if (LANDING_SLUG_SET.has(value) && !picks.includes(value)) picks.push(value);
  };

  if (tokens.has('api')) push('youtube-transcript-api');
  if (tokens.has('download')) push('download-youtube-transcript');
  if (tokens.has('caption') || tokens.has('captions')) push('youtube-caption-extractor');
  if (tokens.has('subtitle') || tokens.has('subtitles')) push('youtube-subtitle-to-text');
  if (tokens.has('notes') || tokens.has('students') || tokens.has('research')) push('youtube-video-notes');
  if (tokens.has('ai') || tokens.has('summary')) push('video-to-text-ai');
  if (tokens.has('video') || tokens.has('text')) push('youtube-video-to-text');
  if (tokens.has('free')) push('youtube-transcript-free');
  if (tokens.has('extract')) push('extract-youtube-transcript');

  push('youtube-transcript-generator');
  push('youtube-video-to-text');

  return picks.slice(0, 2);
}

function routePath(routeType, lang, slug) {
  if (routeType === 'blog') return `/${lang}/blog/${slug}`;
  return `/${lang}/${slug}`;
}

function routeAlternates(routeType, slug) {
  const alternates = SUPPORTED_LANGS.map((lang) => ({
    hreflang: lang,
    href: `${SITE_ORIGIN}${routePath(routeType, lang, slug)}`
  }));
  alternates.push({
    hreflang: 'x-default',
    href: `${SITE_ORIGIN}${routePath(routeType, DEFAULT_LANG, slug)}`
  });
  return alternates;
}

function routeDisplayPath(routeType, lang, slug, useLegacyAlias) {
  if (!useLegacyAlias) return routePath(routeType, lang, slug);
  if (routeType === 'blog') return `/blog/${slug}`;
  return `/${slug}`;
}

function clusterForSlug(slug) {
  const tokens = new Set(wordsFromSlug(slug));
  if (tokens.has('summary') || tokens.has('learning') || tokens.has('study') || tokens.has('research')) {
    return 'ai-video-learning';
  }
  if (tokens.has('video') || tokens.has('text') || tokens.has('speech') || tokens.has('language')) {
    return 'video-to-text';
  }
  return 'youtube-transcripts';
}

function titleForH1(lang, routeType, keyword) {
  if (routeType === 'cluster') return keyword;
  if (lang === 'ar') return `${keyword} في خطوات عملية واضحة`;
  if (lang === 'fr') return `${toTitleCase(keyword)} en etapes pratiques`;
  return `${toTitleCase(keyword)} in Practical Steps`;
}

function makeLinkObjects(lang, routeType, slugs) {
  return slugs.map((slug) => ({
    slug,
    path: routePath(routeType, lang, slug),
    label: routeType === 'cluster' ? getClusterLabel(lang, slug) : keywordForSlug(lang, slug)
  }));
}
function buildRouteInfo({
  routeType,
  lang,
  slug,
  useLegacyAlias = false
}) {
  const safeLang = normalizeLang(lang);
  const copy = COPY[safeLang] || COPY.en;
  const keyword = routeType === 'cluster' ? getClusterLabel(safeLang, slug) : keywordForSlug(safeLang, slug);
  const canonicalPath = routePath(routeType, safeLang, slug);
  const requestedPath = routeDisplayPath(routeType, safeLang, slug, useLegacyAlias);
  const relatedArticleSlugs = routeType === 'cluster'
    ? BLOG_SLUGS.filter((item) => clusterForSlug(item) === slug).slice(0, 18)
    : pickRelatedArticleSlugs(slug, routeType === 'blog' ? 8 : 6);
  const relatedLandingSlugs = routeType === 'cluster'
    ? LANDING_SLUGS.slice(0, 3)
    : pickLandingSlugsForRoute(slug);
  const faqItems = buildFaqItems(safeLang, keyword);

  const structuredData = [buildFaqSchema(faqItems)];
  if (routeType === 'landing') {
    structuredData.push(getSoftwareApplicationSchema(canonicalPath));
  }

  return {
    type: routeType,
    lang: safeLang,
    slug,
    dir: safeLang === 'ar' ? 'rtl' : 'ltr',
    title: metaTitleForRoute(safeLang, routeType, keyword),
    metaDescription: metaDescriptionForRoute(safeLang, routeType, keyword),
    h1: titleForH1(safeLang, routeType, keyword),
    keyword,
    requestedPath,
    canonicalPath,
    pathForMeta: canonicalPath,
    alternates: routeAlternates(routeType, slug),
    publishedTime: PUBLISHED_AT_ISO,
    copy,
    introParagraphs: introParagraphs(safeLang, keyword, routeType),
    problemParagraphs: routeType === 'cluster' ? introParagraphs(safeLang, keyword, routeType) : problemParagraphs(safeLang),
    howParagraphs: howItWorksParagraphs(safeLang, keyword),
    steps: methodSteps(safeLang),
    benefits: benefitItems(safeLang),
    useCases: caseItems(safeLang),
    detailedGuide: routeType === 'blog' ? buildLongGuideParagraphs(safeLang, keyword) : buildLongGuideParagraphs(safeLang, keyword).slice(0, 6),
    faqItems,
    relatedArticles: makeLinkObjects(safeLang, 'blog', relatedArticleSlugs),
    relatedLandingPages: makeLinkObjects(safeLang, 'landing', relatedLandingSlugs),
    clusterLinks: makeLinkObjects(safeLang, 'cluster', CLUSTER_SLUGS),
    toolPath: TOOL_PATH,
    languageHomePath: `/${safeLang}/`,
    structuredData,
    ogType: routeType === 'cluster' ? 'website' : 'article',
    robots: 'index, follow'
  };
}

export function getSeoRouteInfo(pathname) {
  const path = normalizePath(pathname);

  const localizedBlogMatch = path.match(/^\/(en|ar|fr)\/blog\/([a-z0-9-]+)$/i);
  if (localizedBlogMatch) {
    const lang = normalizeLang(localizedBlogMatch[1]);
    const slug = String(localizedBlogMatch[2] || '').toLowerCase();
    if (!BLOG_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'blog', lang, slug });
  }

  const legacyBlogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/i);
  if (legacyBlogMatch) {
    const slug = String(legacyBlogMatch[1] || '').toLowerCase();
    if (!BLOG_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'blog', lang: DEFAULT_LANG, slug, useLegacyAlias: true });
  }

  const localizedFlatMatch = path.match(/^\/(en|ar|fr)\/([a-z0-9-]+)$/i);
  if (localizedFlatMatch) {
    const lang = normalizeLang(localizedFlatMatch[1]);
    const slug = String(localizedFlatMatch[2] || '').toLowerCase();
    if (LANDING_SLUG_SET.has(slug)) {
      return buildRouteInfo({ routeType: 'landing', lang, slug });
    }
    if (CLUSTER_SLUG_SET.has(slug)) {
      return buildRouteInfo({ routeType: 'cluster', lang, slug });
    }
  }

  const legacyFlatMatch = path.match(/^\/([a-z0-9-]+)$/i);
  if (legacyFlatMatch) {
    const slug = String(legacyFlatMatch[1] || '').toLowerCase();
    if (LANDING_SLUG_SET.has(slug)) {
      return buildRouteInfo({ routeType: 'landing', lang: DEFAULT_LANG, slug, useLegacyAlias: true });
    }
    if (CLUSTER_SLUG_SET.has(slug)) {
      return buildRouteInfo({ routeType: 'cluster', lang: DEFAULT_LANG, slug, useLegacyAlias: true });
    }
  }

  return null;
}

export function getBlogRouteInfo(pathname) {
  return getSeoRouteInfo(pathname);
}

export function getAllCanonicalSeoPaths() {
  const blogPaths = SUPPORTED_LANGS.flatMap((lang) => BLOG_SLUGS.map((slug) => routePath('blog', lang, slug)));
  const landingPaths = SUPPORTED_LANGS.flatMap((lang) => LANDING_SLUGS.map((slug) => routePath('landing', lang, slug)));
  const clusterPaths = SUPPORTED_LANGS.flatMap((lang) => CLUSTER_SLUGS.map((slug) => routePath('cluster', lang, slug)));
  return [...blogPaths, ...landingPaths, ...clusterPaths];
}

export function getSitemapEntries() {
  const entries = [];

  SUPPORTED_LANGS.forEach((lang) => {
    BLOG_SLUGS.forEach((slug) => {
      entries.push({
        path: routePath('blog', lang, slug),
        changefreq: 'weekly',
        priority: '0.78'
      });
    });

    LANDING_SLUGS.forEach((slug) => {
      entries.push({
        path: routePath('landing', lang, slug),
        changefreq: 'weekly',
        priority: '0.86'
      });
    });

    CLUSTER_SLUGS.forEach((slug) => {
      entries.push({
        path: routePath('cluster', lang, slug),
        changefreq: 'weekly',
        priority: '0.82'
      });
    });
  });

  return entries;
}

export const SEO_CONFIG = Object.freeze({
  SITE_ORIGIN,
  SITE_NAME,
  TOOL_PATH,
  DEFAULT_LANG,
  SUPPORTED_LANGS,
  PUBLISHED_AT_ISO,
  LANDING_SLUGS,
  CLUSTER_SLUGS,
  BLOG_SLUGS
});
