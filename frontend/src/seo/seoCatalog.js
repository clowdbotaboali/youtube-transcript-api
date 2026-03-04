const SITE_ORIGIN = 'https://transcripta.tech';
const SITE_NAME = 'Transcripta AI';
const TOOL_PATH = '/tool';
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = Object.freeze(['en', 'ar', 'fr']);
const PUBLISHED_AT_ISO = '2026-03-05T00:00:00.000Z';

const TOPICS = Object.freeze([
  {
    id: 'youtube-transcript-generator',
    landingSlug: 'youtube-transcript-generator',
    clusterSlug: 'youtube-transcript-generator',
    keywords: {
      en: 'youtube transcript generator',
      ar: 'مولد تفريغ يوتيوب',
      fr: 'generateur de transcription YouTube'
    },
    labels: {
      en: 'YouTube Transcript Generator',
      ar: 'مولد تفريغ يوتيوب',
      fr: 'Generateur de transcription YouTube'
    },
    angles: ['how-to', 'for-research', 'copy-paste-guide']
  },
  {
    id: 'extract-youtube-transcript',
    landingSlug: 'extract-youtube-transcript',
    clusterSlug: 'extract-youtube-transcript',
    keywords: {
      en: 'extract youtube transcript',
      ar: 'استخراج تفريغ يوتيوب',
      fr: 'extraire la transcription YouTube'
    },
    labels: {
      en: 'Extract YouTube Transcript',
      ar: 'استخراج تفريغ يوتيوب',
      fr: 'Extraction transcription YouTube'
    },
    angles: ['how-to', 'download-guide', 'captions-workflow']
  },
  {
    id: 'youtube-subtitles-extractor',
    landingSlug: 'youtube-subtitles-extractor',
    clusterSlug: 'youtube-subtitles-extractor',
    keywords: {
      en: 'youtube subtitles extractor',
      ar: 'استخراج ترجمات يوتيوب',
      fr: 'extracteur de sous-titres YouTube'
    },
    labels: {
      en: 'YouTube Subtitles Extractor',
      ar: 'استخراج ترجمات يوتيوب',
      fr: 'Extracteur de sous-titres YouTube'
    },
    angles: ['how-to', 'subtitle-to-text-guide', 'article-workflow']
  },
  {
    id: 'youtube-video-to-text',
    landingSlug: 'video-to-text',
    clusterSlug: 'video-to-text',
    keywords: {
      en: 'youtube video to text',
      ar: 'تحويل فيديو يوتيوب إلى نص',
      fr: 'video YouTube vers texte'
    },
    labels: {
      en: 'YouTube Video to Text',
      ar: 'تحويل فيديو يوتيوب إلى نص',
      fr: 'Video YouTube vers texte'
    },
    angles: ['how-to', 'speech-to-text-workflow', 'ai-workflow']
  },
  {
    id: 'youtube-video-notes',
    landingSlug: 'youtube-video-notes',
    clusterSlug: 'youtube-video-notes',
    keywords: {
      en: 'youtube video notes',
      ar: 'ملاحظات من فيديو يوتيوب',
      fr: 'notes de video YouTube'
    },
    labels: {
      en: 'YouTube Video Notes',
      ar: 'ملاحظات من فيديو يوتيوب',
      fr: 'Notes de video YouTube'
    },
    angles: ['for-students', 'for-study', 'for-research']
  },
  {
    id: 'youtube-transcript-ai-summary',
    landingSlug: 'youtube-transcript-ai-summary',
    clusterSlug: 'youtube-transcript-ai-summary',
    keywords: {
      en: 'youtube transcript ai summary',
      ar: 'ملخص ذكاء اصطناعي لتفريغ يوتيوب',
      fr: 'resume IA de transcription YouTube'
    },
    labels: {
      en: 'YouTube Transcript AI Summary',
      ar: 'ملخص ذكاء اصطناعي لتفريغ يوتيوب',
      fr: 'Resume IA de transcription YouTube'
    },
    angles: ['ai-workflow', 'summarize-guide', 'research-brief']
  },
  {
    id: 'youtube-transcript-for-seo',
    landingSlug: 'youtube-transcript-for-seo',
    clusterSlug: 'youtube-transcript-for-seo',
    keywords: {
      en: 'youtube transcript for seo',
      ar: 'تفريغ يوتيوب للسيو',
      fr: 'transcription YouTube pour le SEO'
    },
    labels: {
      en: 'YouTube Transcript for SEO',
      ar: 'تفريغ يوتيوب للسيو',
      fr: 'Transcription YouTube pour le SEO'
    },
    angles: ['for-content-creators', 'copy-paste-guide', 'ai-workflow']
  }
]);

const ANGLE_LABELS = {
  en: {
    'how-to': 'how to',
    'for-research': 'for research',
    'copy-paste-guide': 'copy paste guide',
    'download-guide': 'download guide',
    'captions-workflow': 'captions workflow',
    'subtitle-to-text-guide': 'subtitle to text guide',
    'article-workflow': 'article workflow',
    'speech-to-text-workflow': 'speech to text workflow',
    'ai-workflow': 'ai workflow',
    'for-students': 'for students',
    'for-study': 'for study',
    'research-brief': 'research brief',
    'for-content-creators': 'for content creators'
  },
  ar: {
    'how-to': 'دليل عملي',
    'for-research': 'للبحث',
    'copy-paste-guide': 'دليل النسخ واللصق',
    'download-guide': 'دليل التنزيل',
    'captions-workflow': 'سير عمل الكابتشن',
    'subtitle-to-text-guide': 'دليل تحويل الترجمة إلى نص',
    'article-workflow': 'سير عمل تحويل الفيديو إلى مقال',
    'speech-to-text-workflow': 'سير عمل تحويل الكلام إلى نص',
    'ai-workflow': 'سير عمل الذكاء الاصطناعي',
    'for-students': 'للطلاب',
    'for-study': 'للدراسة',
    'research-brief': 'ملخص بحثي',
    'for-content-creators': 'لصناع المحتوى'
  },
  fr: {
    'how-to': 'guide pratique',
    'for-research': 'pour la recherche',
    'copy-paste-guide': 'guide copier coller',
    'download-guide': 'guide de telechargement',
    'captions-workflow': 'workflow captions',
    'subtitle-to-text-guide': 'guide sous-titres vers texte',
    'article-workflow': 'workflow video vers article',
    'speech-to-text-workflow': 'workflow parole vers texte',
    'ai-workflow': 'workflow IA',
    'for-students': 'pour etudiants',
    'for-study': 'pour etudes',
    'research-brief': 'brief recherche',
    'for-content-creators': 'pour createurs de contenu'
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
    detailTitle: 'Practical guide',
    ctaTitle: 'Section 4: Use the tool',
    faqTitle: 'Section 5: FAQ',
    relatedBlogsTitle: 'Related blog guides',
    canonicalLandingTitle: 'Canonical landing page',
    clusterTitle: 'Topic cluster page',
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
    detailTitle: 'دليل عملي',
    ctaTitle: 'القسم 4: استخدم الأداة',
    faqTitle: 'القسم 5: الأسئلة الشائعة',
    relatedBlogsTitle: 'مقالات مرتبطة',
    canonicalLandingTitle: 'الصفحة الأساسية للموضوع',
    clusterTitle: 'صفحة الكلاستر',
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
    detailTitle: 'Guide pratique',
    ctaTitle: 'Section 4: Utiliser l outil',
    faqTitle: 'Section 5: FAQ',
    relatedBlogsTitle: 'Articles lies',
    canonicalLandingTitle: 'Page principale canonique',
    clusterTitle: 'Page cluster du sujet',
    languageHomeText: 'Retour a la page d accueil de la langue',
    toolLinkText: 'Ouvrir l outil de transcription'
  }
};

const BLOG_DEFINITIONS = TOPICS.flatMap((topic) =>
  topic.angles.map((angle) => ({
    topicId: topic.id,
    angle,
    slug: `${topic.landingSlug}-${angle}`
  }))
);

const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));
const TOPIC_BY_LANDING_SLUG = new Map(TOPICS.map((topic) => [topic.landingSlug, topic]));
const TOPIC_BY_CLUSTER_SLUG = new Map(TOPICS.map((topic) => [topic.clusterSlug, topic]));
const BLOG_BY_SLUG = new Map(BLOG_DEFINITIONS.map((blog) => [blog.slug, blog]));

const LANDING_SLUGS = Object.freeze(TOPICS.map((topic) => topic.landingSlug));
const CLUSTER_SLUGS = Object.freeze(TOPICS.map((topic) => topic.clusterSlug));
const BLOG_SLUGS = Object.freeze(BLOG_DEFINITIONS.map((blog) => blog.slug));

const LANDING_SLUG_SET = new Set(LANDING_SLUGS);
const CLUSTER_SLUG_SET = new Set(CLUSTER_SLUGS);
const BLOG_SLUG_SET = new Set(BLOG_SLUGS);

export const BLOG_TOPIC_SLUGS = BLOG_SLUGS;
export const BLOG_ARTICLE_PATHS = Object.freeze(
  SUPPORTED_LANGS.flatMap((lang) => BLOG_SLUGS.map((slug) => `/${lang}/blog/${slug}`))
);
export const BLOG_LEGACY_PATHS = Object.freeze(BLOG_SLUGS.map((slug) => `/blog/${slug}`));

const MERGE_REDIRECT_GROUPS = Object.freeze({
  'youtube-transcript-generator': [
    'youtube-transcript-tool-online',
    'get-youtube-video-transcript',
    'youtube-video-to-transcript',
    'copy-youtube-transcript',
    'youtube-transcript-copy-paste',
    'youtube-transcript-free'
  ],
  'extract-youtube-transcript': [
    'download-youtube-transcript',
    'youtube-transcript-downloader',
    'extract-youtube-captions',
    'download-youtube-captions-text',
    'youtube-caption-extractor',
    'youtube-video-caption-extractor'
  ],
  'youtube-subtitles-extractor': [
    'youtube-subtitle-to-text',
    'youtube-closed-captions-to-text',
    'youtube-caption-text-generator',
    'youtube-subtitles-to-article'
  ],
  'video-to-text': [
    'youtube-video-to-text',
    'youtube-transcript-to-text',
    'youtube-video-text-extraction',
    'convert-youtube-speech-to-text',
    'youtube-audio-to-text-online',
    'video-to-text-ai',
    'video-to-text-arabic',
    'video-to-text-french',
    'video-to-text-spanish',
    'video-to-text-german',
    'video-to-text-italian',
    'video-to-text-portuguese'
  ],
  'youtube-video-notes': [
    'youtube-transcript-for-notes',
    'youtube-transcript-for-study',
    'youtube-transcript-for-students'
  ],
  'youtube-transcript-ai-summary': [
    'summarize-youtube-transcript',
    'youtube-video-summary-generator'
  ],
  'youtube-transcript-for-seo': [
    'youtube-content-repurposing-text',
    'youtube-transcript-for-blogging',
    'youtube-transcript-for-marketers'
  ]
});

const OUT_OF_SCOPE_BLOG_SLUGS = Object.freeze([
  'how-to-get-transcript-from-vimeo',
  'how-to-get-transcript-from-ted',
  'how-to-get-transcript-from-udemy',
  'how-to-get-transcript-from-coursera',
  'how-to-get-transcript-from-tiktok'
]);

function normalizePath(pathname) {
  const raw = String(pathname || '/').trim();
  if (!raw) return '/';
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  if (withLeading === '/') return '/';
  return withLeading.replace(/\/+$/, '');
}

function normalizeLang(value) {
  const candidate = String(value || '').trim().toLowerCase();
  return SUPPORTED_LANGS.includes(candidate) ? candidate : DEFAULT_LANG;
}

function toTitleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
    .join(' ')
    .trim();
}

function topicLabel(lang, topic) {
  return topic.labels?.[lang] || topic.labels?.en || toTitleCase(topic.landingSlug.replace(/-/g, ' '));
}

function angleLabel(lang, angle) {
  return ANGLE_LABELS[lang]?.[angle] || ANGLE_LABELS.en?.[angle] || angle.replace(/-/g, ' ');
}

function keywordForRoute(lang, routeType, topic, blogDef = null) {
  if (routeType === 'blog' && blogDef) {
    const base = topic.keywords?.[lang] || topic.keywords?.en || topicLabel(lang, topic);
    return `${base} ${angleLabel(lang, blogDef.angle)}`;
  }
  return topic.keywords?.[lang] || topic.keywords?.en || topicLabel(lang, topic);
}

function routePath(routeType, lang, slug) {
  if (routeType === 'blog') return `/${lang}/blog/${slug}`;
  if (routeType === 'cluster') return `/${lang}/cluster/${slug}`;
  return `/${lang}/${slug}`;
}

function makeAlternates(routeType, slug) {
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

function introParagraphs(lang, topicLabelValue, keyword, routeType) {
  if (lang === 'ar') {
    return [
      `صفحة ${topicLabelValue} تستهدف الباحثين عن ${keyword} مع تجربة عملية واضحة لاستخراج النص من الفيديو بسرعة.`,
      routeType === 'cluster'
        ? 'هذه الصفحة تعمل كمركز موضوعي يجمع صفحة المنتج الأساسية وروابط الأدلة المرتبطة بنفس النية البحثية.'
        : 'المحتوى هنا منظم بنيةً ومصمم لدعم الفهم السريع لمحركات البحث وللزائر في نفس الوقت.'
    ];
  }

  if (lang === 'fr') {
    return [
      `La page ${topicLabelValue} cible lintention ${keyword} avec une structure claire et orientee execution.`,
      routeType === 'cluster'
        ? 'Cette page agit comme hub thematique reliant la page produit canonique et les guides associes.'
        : 'Le contenu est optimise pour l indexation SEO tout en gardant une experience produit stable.'
    ];
  }

  return [
    `${topicLabelValue} targets the search intent around ${keyword} with a practical and conversion-focused structure.`,
    routeType === 'cluster'
      ? 'This page serves as a topical hub connecting the canonical landing page and supporting blog guides.'
      : 'The content is structured for indexing depth while preserving the original product experience.'
  ];
}

function problemParagraphs(lang) {
  if (lang === 'ar') {
    return [
      'الاستخراج اليدوي يستهلك وقتًا كبيرًا ويجعل إعادة الاستخدام صعبة، خصوصًا عند العمل على عدة فيديوهات.',
      'بدون نص واضح وقابل للبحث، يقل العائد من الفيديو في الدراسة، البحث، التسويق، وصناعة المحتوى.'
    ];
  }
  if (lang === 'fr') {
    return [
      'L extraction manuelle est lente et fragmentee, ce qui complique la reutilisation de la connaissance.',
      'Sans texte searchable, la valeur des videos reste limitee pour la recherche et la production de contenu.'
    ];
  }
  return [
    'Manual extraction is slow, repetitive, and error-prone when teams process multiple long videos.',
    'Without clean transcript text, knowledge reuse for research, content, and operations becomes inefficient.'
  ];
}

function howParagraphs(lang, keyword) {
  if (lang === 'ar') {
    return [
      `العمل في ${keyword} يبدأ بنسخ الرابط ثم استخراج النص ثم تحويله إلى مخرجات قابلة للتنفيذ.`,
      'بعد الحصول على النص، يمكنك بناء ملخصات، ملاحظات، أو مسارات عمل مباشرة بدون إعادة مشاهدة الفيديو كاملًا.'
    ];
  }
  if (lang === 'fr') {
    return [
      `Le flux ${keyword} commence par le lien video, puis extraction du texte, puis reutilisation directe.`,
      'Une transcription propre facilite la synthese, la recherche interne et la production de contenus secondaires.'
    ];
  }
  return [
    `The ${keyword} flow starts with a video URL, then transcript extraction, then structured reuse of the output.`,
    'Once text is available, teams can summarize, annotate, and execute without replaying full timelines.'
  ];
}

function methodSteps(lang) {
  if (lang === 'ar') {
    return [
      { title: 'Step 1: انسخ رابط الفيديو', text: 'افتح فيديو يوتيوب المستهدف وانسخ الرابط الكامل.' },
      { title: 'Step 2: افتح أداة التفريغ', text: 'ادخل صفحة الأداة والصق الرابط داخل الحقل.' },
      { title: 'Step 3: استخرج النص', text: 'شغّل الاستخراج واحصل على نص جاهز للنسخ والبحث والتحليل.' }
    ];
  }
  if (lang === 'fr') {
    return [
      { title: 'Step 1: Copier le lien video', text: 'Ouvrez la video cible puis copiez son URL complete.' },
      { title: 'Step 2: Ouvrir l outil', text: 'Accedez a l outil et collez le lien.' },
      { title: 'Step 3: Extraire le texte', text: 'Lancez l extraction pour recuperer un texte reutilisable.' }
    ];
  }
  return [
    { title: 'Step 1: Copy the video URL', text: 'Open the target YouTube video and copy the full URL.' },
    { title: 'Step 2: Open the transcript tool', text: 'Go to the tool page and paste your URL.' },
    { title: 'Step 3: Extract transcript text', text: 'Run extraction and get output ready for reuse.' }
  ];
}

function benefitItems(lang) {
  if (lang === 'ar') {
    return [
      'بحث أسرع داخل النص بدلاً من التنقل في الفيديو.',
      'تسريع إعداد الملخصات والملاحظات والتقارير.',
      'إعادة توظيف المحتوى في قنوات متعددة.',
      'تحسين مشاركة المعرفة داخل الفريق.'
    ];
  }
  if (lang === 'fr') {
    return [
      'Recherche instantanee dans le texte plutot que dans la timeline video.',
      'Preparation plus rapide de syntheses et de notes.',
      'Reutilisation du contenu sur plusieurs canaux.',
      'Meilleure circulation de la connaissance en equipe.'
    ];
  }
  return [
    'Faster discovery via searchable text instead of timeline scanning.',
    'Quicker production of summaries, notes, and briefs.',
    'Repurposing support across multiple channels.',
    'Better knowledge sharing across teams.'
  ];
}

function caseStudiesList(lang) {
  if (lang === 'ar') {
    return [
      'الطلاب: تحويل الفيديو إلى نقاط مراجعة واضحة.',
      'الباحثون: استخراج الأفكار والاقتباسات بسرعة.',
      'صناع المحتوى: تحويل الفيديو إلى محتوى نصي قابل للنشر.',
      'فرق التسويق: بناء رسائل محتوى من النص المستخرج.'
    ];
  }
  if (lang === 'fr') {
    return [
      'Etudiants: transformer la video en notes de revision.',
      'Chercheurs: extraire idees et citations rapidement.',
      'Createurs: convertir la video en contenu textuel.',
      'Marketing: structurer des messages a partir du transcript.'
    ];
  }
  return [
    'Students: convert videos into structured notes.',
    'Researchers: extract quotes and insights quickly.',
    'Creators: turn videos into publishable text assets.',
    'Marketing teams: derive messaging from transcript output.'
  ];
}

function detailedGuideParagraphs(lang, topicLabelValue, keyword) {
  if (lang === 'ar') {
    return [
      `في سيناريو ${topicLabelValue}، الهدف ليس فقط الحصول على النص بل بناء تدفق عمل واضح من الاستخراج إلى التنفيذ.`,
      `ابدأ دائمًا بتحديد هدفك من ${keyword}: دراسة، بحث، نشر، أو تلخيص. تحديد الهدف يحدد شكل المخرجات المطلوبة.`,
      'قسّم النص إلى فقرات دلالية قصيرة، ثم أضف عناوين داخلية تسهّل الرجوع لأي فكرة في ثوانٍ.',
      'بعد ذلك، حوّل الفقرات إلى نقاط قابلة للتنفيذ: ماذا ستفعل؟ من المسؤول؟ وما النتيجة المتوقعة؟',
      'هذه المنهجية ترفع جودة المحتوى وتقلل تكرار العمل اليدوي في كل دورة إنتاج جديدة.'
    ];
  }
  if (lang === 'fr') {
    return [
      `Avec ${topicLabelValue}, l objectif est de passer de l extraction a l execution avec une methode stable.`,
      `Definissez dabord lintention ${keyword}: etude, recherche, publication ou synthese.`,
      'Segmentez ensuite le transcript en blocs semantiques courts avec des titres explicites.',
      'Transformez chaque bloc en action concrete avec responsable, delai et resultat attendu.',
      'Ce cadre reduit fortement le travail manuel repetitif et augmente la valeur SEO du contenu.'
    ];
  }
  return [
    `With ${topicLabelValue}, the objective is not just extraction, but a repeatable path from transcript to execution.`,
    `Define the outcome for ${keyword} first: study notes, research brief, publication draft, or AI workflow.`,
    'Segment transcript output into semantic blocks with clear headings and lightweight metadata.',
    'Convert blocks into actions with owners, deadlines, and expected outcomes to operationalize knowledge.',
    'This framework reduces repetitive manual work and increases long-term SEO value through structured content.'
  ];
}

function faqItems(lang, keyword) {
  if (lang === 'ar') {
    return [
      { question: `ما هو ${keyword}؟`, answer: 'هو مسار عملي لاستخراج الكلام من فيديو يوتيوب وتحويله إلى نص قابل للاستخدام.' },
      { question: 'هل يمكن نسخ النص الناتج؟', answer: 'نعم، يمكن نسخ النص واستخدامه في الدراسة أو البحث أو المحتوى.' },
      { question: 'هل كل الصفحات مرتبطة بالأداة؟', answer: 'نعم، كل صفحة تحتوي رابط مباشر إلى /tool.' }
    ];
  }
  if (lang === 'fr') {
    return [
      { question: `Quest-ce que ${keyword} ?`, answer: 'Cest un workflow pour extraire la parole video et la convertir en texte exploitable.' },
      { question: 'Puis-je copier le transcript genere ?', answer: 'Oui, le texte peut etre copie et reutilise directement.' },
      { question: 'Toutes les pages pointent-elles vers l outil ?', answer: 'Oui, chaque page inclut un lien direct vers /tool.' }
    ];
  }
  return [
    { question: `What is ${keyword}?`, answer: 'It is a workflow to extract spoken video content into reusable text.' },
    { question: 'Can I copy the generated transcript?', answer: 'Yes, transcript output is fully copyable and reusable.' },
    { question: 'Do all pages link to the tool?', answer: 'Yes, every page includes a direct link to /tool.' }
  ];
}

function buildFaqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
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

function buildRedirectRules() {
  const rules = [];
  const seen = new Set();

  const push = (source, destination) => {
    const src = normalizePath(source);
    const dest = normalizePath(destination);
    if (!src || !dest || src === dest) return;
    const key = `${src}->${dest}`;
    if (seen.has(key)) return;
    seen.add(key);
    rules.push({ source: src, destination: dest, permanent: true });
  };

  Object.entries(MERGE_REDIRECT_GROUPS).forEach(([canonicalSlug, oldSlugs]) => {
    oldSlugs.forEach((oldSlug) => {
      SUPPORTED_LANGS.forEach((lang) => {
        push(`/${lang}/${oldSlug}`, `/${lang}/${canonicalSlug}`);
        push(`/${lang}/blog/${oldSlug}`, `/${lang}/${canonicalSlug}`);
      });
      push(`/${oldSlug}`, `/en/${canonicalSlug}`);
      push(`/blog/${oldSlug}`, `/en/${canonicalSlug}`);
    });
  });

  OUT_OF_SCOPE_BLOG_SLUGS.forEach((slug) => {
    SUPPORTED_LANGS.forEach((lang) => {
      push(`/${lang}/blog/${slug}`, '/en/youtube-transcript-generator');
      push(`/${lang}/${slug}`, '/en/youtube-transcript-generator');
    });
    push(`/blog/${slug}`, '/en/youtube-transcript-generator');
    push(`/${slug}`, '/en/youtube-transcript-generator');
  });

  SUPPORTED_LANGS.forEach((lang) => {
    push(`/${lang}/youtube-transcripts`, `/${lang}/cluster/youtube-transcript-generator`);
    push(`/${lang}/ai-video-learning`, `/${lang}/cluster/youtube-transcript-ai-summary`);
  });
  push('/youtube-transcripts', '/en/cluster/youtube-transcript-generator');
  push('/ai-video-learning', '/en/cluster/youtube-transcript-ai-summary');

  return rules;
}

export const REDIRECT_RULES = Object.freeze(buildRedirectRules());
const REDIRECT_PATH_MAP = new Map(REDIRECT_RULES.map((rule) => [rule.source, rule.destination]));

function resolveRedirectPath(pathname) {
  let current = normalizePath(pathname);
  const seen = new Set();
  while (REDIRECT_PATH_MAP.has(current) && !seen.has(current)) {
    seen.add(current);
    current = REDIRECT_PATH_MAP.get(current);
  }
  return current;
}

function blogsForTopic(topicId) {
  return BLOG_DEFINITIONS.filter((blog) => blog.topicId === topicId);
}

function blogLabel(lang, topic, angle) {
  const base = topicLabel(lang, topic);
  const suffix = angleLabel(lang, angle);
  if (lang === 'ar') return `${base} - ${suffix}`;
  if (lang === 'fr') return `${base} - ${suffix}`;
  return `${base} - ${toTitleCase(suffix)}`;
}

function pickRelatedBlogDefs(topicId, currentBlogSlug = null, limit = 4) {
  const fromSameTopic = blogsForTopic(topicId).filter((blog) => blog.slug !== currentBlogSlug);
  const picks = [...fromSameTopic];

  if (picks.length < 3) {
    const fromOtherTopics = BLOG_DEFINITIONS.filter(
      (blog) => blog.topicId !== topicId && blog.slug !== currentBlogSlug
    );
    for (const blog of fromOtherTopics) {
      if (picks.find((item) => item.slug === blog.slug)) continue;
      picks.push(blog);
      if (picks.length >= 3) break;
    }
  }

  return picks.slice(0, Math.max(3, Math.min(limit, 5)));
}

function buildRouteInfo({ routeType, lang, slug, requestedPath = null, useLegacyAlias = false }) {
  const safeLang = normalizeLang(lang);

  let topic = null;
  let blogDef = null;

  if (routeType === 'landing') {
    topic = TOPIC_BY_LANDING_SLUG.get(slug) || null;
  } else if (routeType === 'cluster') {
    topic = TOPIC_BY_CLUSTER_SLUG.get(slug) || null;
  } else {
    blogDef = BLOG_BY_SLUG.get(slug) || null;
    topic = blogDef ? TOPIC_BY_ID.get(blogDef.topicId) || null : null;
  }

  if (!topic) return null;

  const copy = COPY[safeLang] || COPY.en;
  const keyword = keywordForRoute(safeLang, routeType, topic, blogDef);
  const canonicalPath = routePath(routeType, safeLang, slug);
  const primaryLandingPath = routePath('landing', safeLang, topic.landingSlug);
  const primaryClusterPath = routePath('cluster', safeLang, topic.clusterSlug);
  const relatedBlogDefs = pickRelatedBlogDefs(topic.id, blogDef?.slug || null, 4);
  const faq = faqItems(safeLang, keyword);

  const relatedArticles = relatedBlogDefs.map((blog) => {
    const relatedTopic = TOPIC_BY_ID.get(blog.topicId);
    return {
      slug: blog.slug,
      path: routePath('blog', safeLang, blog.slug),
      label: blogLabel(safeLang, relatedTopic, blog.angle)
    };
  });

  const relatedLandingPages = [
    {
      slug: topic.landingSlug,
      path: primaryLandingPath,
      label: topicLabel(safeLang, topic)
    }
  ];

  const clusterLinks = [
    {
      slug: topic.clusterSlug,
      path: primaryClusterPath,
      label: `${topicLabel(safeLang, topic)} Hub`
    }
  ];

  const structuredData = [buildFaqSchema(faq)];
  if (routeType === 'landing') {
    structuredData.push(getSoftwareApplicationSchema(canonicalPath));
  }

  const h1 = routeType === 'cluster'
    ? `${topicLabel(safeLang, topic)} SEO Hub`
    : blogDef
      ? blogLabel(safeLang, topic, blogDef.angle)
      : topicLabel(safeLang, topic);

  const metaTitle = routeType === 'cluster'
    ? `${topicLabel(safeLang, topic)} Hub | ${SITE_NAME}`
    : `${toTitleCase(keyword)} | ${SITE_NAME}`;

  const metaDescription =
    safeLang === 'ar'
      ? `دليل ${keyword} مع شرح عملي وروابط داخلية تقودك مباشرة إلى الأداة وصفحات الموضوع المرتبطة.`
      : safeLang === 'fr'
        ? `Guide ${keyword} avec structure pratique, maillage interne et acces direct a l outil.`
        : `Practical guide for ${keyword} with clear structure, internal linking, and direct access to the tool.`;

  return {
    type: routeType,
    lang: safeLang,
    slug,
    dir: safeLang === 'ar' ? 'rtl' : 'ltr',
    title: metaTitle,
    metaDescription,
    h1,
    keyword,
    requestedPath: requestedPath || canonicalPath,
    canonicalPath,
    canonicalLandingPath: primaryLandingPath,
    primaryClusterPath,
    pathForMeta: canonicalPath,
    alternates: makeAlternates(routeType, slug),
    publishedTime: PUBLISHED_AT_ISO,
    copy,
    introParagraphs: introParagraphs(safeLang, topicLabel(safeLang, topic), keyword, routeType),
    problemParagraphs: problemParagraphs(safeLang),
    howParagraphs: howParagraphs(safeLang, keyword),
    steps: methodSteps(safeLang),
    benefits: benefitItems(safeLang),
    useCases: caseStudiesList(safeLang),
    detailedGuide: detailedGuideParagraphs(safeLang, topicLabel(safeLang, topic), keyword),
    faqItems: faq,
    relatedArticles,
    relatedLandingPages,
    clusterLinks,
    toolPath: TOOL_PATH,
    languageHomePath: `/${safeLang}/`,
    structuredData,
    ogType: routeType === 'cluster' ? 'website' : 'article',
    robots: 'index, follow',
    isLegacyAlias: useLegacyAlias,
    topicId: topic.id
  };
}

export function getSeoRouteInfo(pathname) {
  const originalPath = normalizePath(pathname);
  const resolvedPath = resolveRedirectPath(originalPath);
  const useLegacyAlias = resolvedPath !== originalPath;

  const localizedBlogMatch = resolvedPath.match(/^\/(en|ar|fr)\/blog\/([a-z0-9-]+)$/i);
  if (localizedBlogMatch) {
    const lang = normalizeLang(localizedBlogMatch[1]);
    const slug = String(localizedBlogMatch[2] || '').toLowerCase();
    if (!BLOG_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'blog', lang, slug, requestedPath: originalPath, useLegacyAlias });
  }

  const legacyBlogMatch = resolvedPath.match(/^\/blog\/([a-z0-9-]+)$/i);
  if (legacyBlogMatch) {
    const slug = String(legacyBlogMatch[1] || '').toLowerCase();
    if (!BLOG_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'blog', lang: DEFAULT_LANG, slug, requestedPath: originalPath, useLegacyAlias: true });
  }

  const localizedClusterMatch = resolvedPath.match(/^\/(en|ar|fr)\/cluster\/([a-z0-9-]+)$/i);
  if (localizedClusterMatch) {
    const lang = normalizeLang(localizedClusterMatch[1]);
    const slug = String(localizedClusterMatch[2] || '').toLowerCase();
    if (!CLUSTER_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'cluster', lang, slug, requestedPath: originalPath, useLegacyAlias });
  }

  const legacyClusterMatch = resolvedPath.match(/^\/cluster\/([a-z0-9-]+)$/i);
  if (legacyClusterMatch) {
    const slug = String(legacyClusterMatch[1] || '').toLowerCase();
    if (!CLUSTER_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'cluster', lang: DEFAULT_LANG, slug, requestedPath: originalPath, useLegacyAlias: true });
  }

  const localizedLandingMatch = resolvedPath.match(/^\/(en|ar|fr)\/([a-z0-9-]+)$/i);
  if (localizedLandingMatch) {
    const lang = normalizeLang(localizedLandingMatch[1]);
    const slug = String(localizedLandingMatch[2] || '').toLowerCase();
    if (!LANDING_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'landing', lang, slug, requestedPath: originalPath, useLegacyAlias });
  }

  const legacyLandingMatch = resolvedPath.match(/^\/([a-z0-9-]+)$/i);
  if (legacyLandingMatch) {
    const slug = String(legacyLandingMatch[1] || '').toLowerCase();
    if (!LANDING_SLUG_SET.has(slug)) return null;
    return buildRouteInfo({ routeType: 'landing', lang: DEFAULT_LANG, slug, requestedPath: originalPath, useLegacyAlias: true });
  }

  return null;
}

export function getBlogRouteInfo(pathname) {
  return getSeoRouteInfo(pathname);
}

export function getAllCanonicalSeoPaths() {
  const landingPaths = SUPPORTED_LANGS.flatMap((lang) => LANDING_SLUGS.map((slug) => routePath('landing', lang, slug)));
  const blogPaths = SUPPORTED_LANGS.flatMap((lang) => BLOG_SLUGS.map((slug) => routePath('blog', lang, slug)));
  const clusterPaths = SUPPORTED_LANGS.flatMap((lang) => CLUSTER_SLUGS.map((slug) => routePath('cluster', lang, slug)));
  return [...landingPaths, ...blogPaths, ...clusterPaths];
}

export function getSitemapEntries() {
  const entries = [];

  SUPPORTED_LANGS.forEach((lang) => {
    LANDING_SLUGS.forEach((slug) => {
      entries.push({
        path: routePath('landing', lang, slug),
        changefreq: 'weekly',
        priority: '0.9'
      });
    });

    BLOG_SLUGS.forEach((slug) => {
      entries.push({
        path: routePath('blog', lang, slug),
        changefreq: 'weekly',
        priority: '0.8'
      });
    });

    CLUSTER_SLUGS.forEach((slug) => {
      entries.push({
        path: routePath('cluster', lang, slug),
        changefreq: 'weekly',
        priority: '0.75'
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
  TOPICS,
  LANDING_SLUGS,
  CLUSTER_SLUGS,
  BLOG_SLUGS,
  BLOG_COUNT_PER_TOPIC: 3
});
