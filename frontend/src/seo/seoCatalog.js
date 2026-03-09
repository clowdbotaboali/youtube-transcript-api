const SITE_ORIGIN = 'https://www.transcripta.tech';
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
    angles: [
      'how-to',
      'for-research',
      'copy-paste-guide',
      'for-students',
      'for-content-creators',
      'ai-workflow',
      'seo-workflow',
      'notes-workflow'
    ]
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
    angles: [
      'how-to',
      'download-guide',
      'captions-workflow',
      'for-research',
      'for-students',
      'copy-paste-guide',
      'ai-workflow',
      'seo-workflow'
    ]
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
    angles: [
      'how-to',
      'subtitle-to-text-guide',
      'article-workflow',
      'for-research',
      'for-content-creators',
      'copy-paste-guide',
      'ai-workflow',
      'seo-workflow'
    ]
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
    angles: [
      'how-to',
      'speech-to-text-workflow',
      'ai-workflow',
      'for-students',
      'for-research',
      'for-content-creators',
      'copy-paste-guide',
      'seo-workflow'
    ]
  },
  {
    id: 'youtube-video-notes',
    landingSlug: 'youtube-video-notes',
    clusterSlug: 'youtube-video-notes',
    keywords: {
      en: 'youtube video notes',
      ar: 'ملاحظات فيديو يوتيوب',
      fr: 'notes video YouTube'
    },
    labels: {
      en: 'YouTube Video Notes',
      ar: 'ملاحظات فيديو يوتيوب',
      fr: 'Notes video YouTube'
    },
    angles: [
      'for-students',
      'for-study',
      'for-research',
      'how-to',
      'for-content-creators',
      'ai-workflow',
      'copy-paste-guide',
      'notes-workflow'
    ]
  },
  {
    id: 'youtube-transcript-ai-summary',
    landingSlug: 'youtube-transcript-ai-summary',
    clusterSlug: 'youtube-transcript-ai-summary',
    keywords: {
      en: 'youtube transcript ai summary',
      ar: 'ملخص ذكاء اصطناعي لتفريغ يوتيوب',
      fr: 'resume IA transcription YouTube'
    },
    labels: {
      en: 'YouTube Transcript AI Summary',
      ar: 'ملخص ذكاء اصطناعي لتفريغ يوتيوب',
      fr: 'Resume IA transcription YouTube'
    },
    angles: [
      'ai-workflow',
      'summarize-guide',
      'research-brief',
      'how-to',
      'for-students',
      'for-research',
      'copy-paste-guide',
      'notes-workflow'
    ]
  },
  {
    id: 'youtube-transcript-for-seo',
    landingSlug: 'youtube-transcript-for-seo',
    clusterSlug: 'youtube-transcript-for-seo',
    keywords: {
      en: 'youtube transcript for seo',
      ar: 'تفريغ يوتيوب للسيو',
      fr: 'transcription YouTube pour SEO'
    },
    labels: {
      en: 'YouTube Transcript for SEO',
      ar: 'تفريغ يوتيوب للسيو',
      fr: 'Transcription YouTube pour SEO'
    },
    angles: [
      'for-content-creators',
      'copy-paste-guide',
      'ai-workflow',
      'how-to',
      'for-research',
      'for-students',
      'seo-workflow',
      'notes-workflow'
    ]
  },
  {
    id: 'youtube-transcript',
    landingSlug: 'youtube-transcript',
    clusterSlug: 'youtube-transcript',
    keywords: {
      en: 'youtube transcript',
      ar: 'نص فيديو يوتيوب',
      fr: 'transcription YouTube'
    },
    labels: {
      en: 'YouTube Transcript',
      ar: 'نص فيديو يوتيوب',
      fr: 'Transcription YouTube'
    },
    angles: [
      'how-to',
      'for-students',
      'for-research',
      'for-content-creators',
      'ai-workflow',
      'copy-paste-guide',
      'seo-workflow',
      'notes-workflow'
    ]
  },
  {
    id: 'video-to-text-ai',
    landingSlug: 'video-to-text-ai',
    clusterSlug: 'video-to-text-ai',
    keywords: {
      en: 'video to text ai',
      ar: 'تحويل الفيديو إلى نص بالذكاء الاصطناعي',
      fr: 'video vers texte IA'
    },
    labels: {
      en: 'Video to Text AI',
      ar: 'تحويل الفيديو إلى نص بالذكاء الاصطناعي',
      fr: 'Video vers texte IA'
    },
    angles: [
      'how-to',
      'for-students',
      'for-research',
      'for-content-creators',
      'ai-workflow',
      'copy-paste-guide',
      'seo-workflow',
      'notes-workflow'
    ]
  },
  {
    id: 'youtube-caption-extractor',
    landingSlug: 'youtube-caption-extractor',
    clusterSlug: 'youtube-caption-extractor',
    keywords: {
      en: 'youtube caption extractor',
      ar: 'استخراج كابتشن يوتيوب',
      fr: 'extracteur de captions YouTube'
    },
    labels: {
      en: 'YouTube Caption Extractor',
      ar: 'استخراج كابتشن يوتيوب',
      fr: 'Extracteur de captions YouTube'
    },
    angles: [
      'how-to',
      'for-students',
      'for-research',
      'for-content-creators',
      'ai-workflow',
      'copy-paste-guide',
      'seo-workflow',
      'notes-workflow'
    ]
  },
  {
    id: 'extract-video-transcript',
    landingSlug: 'extract-video-transcript',
    clusterSlug: 'extract-video-transcript',
    keywords: {
      en: 'extract video transcript',
      ar: 'استخراج النص من الفيديو',
      fr: 'extraire la transcription video'
    },
    labels: {
      en: 'Extract Video Transcript',
      ar: 'استخراج النص من الفيديو',
      fr: 'Extraire la transcription video'
    },
    angles: [
      'how-to',
      'for-students',
      'for-research',
      'for-content-creators',
      'ai-workflow',
      'copy-paste-guide',
      'seo-workflow',
      'notes-workflow'
    ]
  }
]);

const ANGLE_LABELS = {
  en: {
    'how-to': 'How To',
    'for-research': 'For Research',
    'copy-paste-guide': 'Copy Paste Guide',
    'download-guide': 'Download Guide',
    'captions-workflow': 'Captions Workflow',
    'subtitle-to-text-guide': 'Subtitle To Text Guide',
    'article-workflow': 'Article Workflow',
    'speech-to-text-workflow': 'Speech To Text Workflow',
    'ai-workflow': 'AI Workflow',
    'for-students': 'For Students',
    'for-study': 'For Study',
    'research-brief': 'Research Brief',
    'for-content-creators': 'For Content Creators',
    'summarize-guide': 'Summarize Guide',
    'seo-workflow': 'SEO Workflow',
    'notes-workflow': 'Notes Workflow'
  },
  ar: {
    'how-to': 'دليل عملي',
    'for-research': 'للبحث',
    'copy-paste-guide': 'دليل النسخ واللصق',
    'download-guide': 'دليل التنزيل',
    'captions-workflow': 'سير عمل الكابتشن',
    'subtitle-to-text-guide': 'تحويل الترجمة إلى نص',
    'article-workflow': 'تحويل الفيديو إلى مقال',
    'speech-to-text-workflow': 'تحويل الكلام إلى نص',
    'ai-workflow': 'سير عمل الذكاء الاصطناعي',
    'for-students': 'للطلاب',
    'for-study': 'للدراسة',
    'research-brief': 'ملخص بحثي',
    'for-content-creators': 'لصناع المحتوى',
    'summarize-guide': 'دليل التلخيص',
    'seo-workflow': 'سير عمل السيو',
    'notes-workflow': 'سير عمل الملاحظات'
  },
  fr: {
    'how-to': 'Guide Pratique',
    'for-research': 'Pour la Recherche',
    'copy-paste-guide': 'Guide Copier Coller',
    'download-guide': 'Guide de Telechargement',
    'captions-workflow': 'Workflow Captions',
    'subtitle-to-text-guide': 'Sous-titres vers Texte',
    'article-workflow': 'Video vers Article',
    'speech-to-text-workflow': 'Parole vers Texte',
    'ai-workflow': 'Workflow IA',
    'for-students': 'Pour Etudiants',
    'for-study': 'Pour Etudes',
    'research-brief': 'Brief Recherche',
    'for-content-creators': 'Pour Createurs',
    'summarize-guide': 'Guide de Resume',
    'seo-workflow': 'Workflow SEO',
    'notes-workflow': 'Workflow Notes'
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

const MIN_WORD_TARGET_BY_ROUTE = Object.freeze({
  landing: 950,
  blog: 1250,
  cluster: 850
});

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
    'video-to-text-arabic',
    'video-to-text-french',
    'video-to-text-spanish',
    'video-to-text-german',
    'video-to-text-italian',
    'video-to-text-portuguese'
  ],
  'youtube-video-notes': [
    'youtube-transcript-for-notes',
    'youtube-transcript-for-study'
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

function collapseSpaces(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value) {
  return collapseSpaces(String(value || '').replace(/-/g, ' '))
    .split(' ')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ''))
    .join(' ');
}

function countWords(value) {
  const normalized = collapseSpaces(value);
  if (!normalized) return 0;
  return normalized.split(' ').filter(Boolean).length;
}

function truncateAtWord(value, maxLength) {
  const normalized = collapseSpaces(value);
  if (!normalized || normalized.length <= maxLength) return normalized;
  const sliced = normalized.slice(0, Math.max(0, maxLength - 1));
  const safeCut = sliced.slice(0, Math.max(0, sliced.lastIndexOf(' ')));
  const candidate = safeCut || sliced;
  return collapseSpaces(`${candidate}.`);
}

function fitLength(value, minLength, maxLength, lang) {
  const tails = {
    en: 'Use Transcripta AI for fast extraction, clear text, and practical outputs.',
    ar: 'يوفر لك Transcripta AI استخراجًا سريعًا ونصًا واضحًا ومخرجات عملية.',
    fr: 'Transcripta AI fournit extraction rapide, texte clair et resultats pratiques.'
  };

  let output = collapseSpaces(value);
  if (output.length > maxLength) output = truncateAtWord(output, maxLength);

  const tail = tails[lang] || tails.en;
  while (output.length < minLength) {
    output = collapseSpaces(`${output} ${tail}`);
    if (output.length > maxLength) {
      output = truncateAtWord(output, maxLength);
      break;
    }
  }

  return output;
}

function topicLabel(lang, topic) {
  return topic.labels?.[lang] || topic.labels?.en || toTitleCase(topic.landingSlug);
}

function angleLabel(lang, angle) {
  return ANGLE_LABELS[lang]?.[angle] || ANGLE_LABELS.en?.[angle] || toTitleCase(angle);
}

function keywordForRoute(lang, routeType, topic, blogDef = null) {
  const base = topic.keywords?.[lang] || topic.keywords?.en || topicLabel(lang, topic);
  if (routeType !== 'blog' || !blogDef) return base;
  return collapseSpaces(`${base} ${angleLabel(lang, blogDef.angle)}`);
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

const LANDING_TITLE_OVERRIDES_EN = Object.freeze({
  'youtube-transcript-generator': 'YouTube Transcript Generator (Free)',
  'extract-youtube-transcript': 'Extract YouTube Transcript Instantly',
  'youtube-subtitles-extractor': 'YouTube Subtitles Extractor Online',
  'video-to-text': 'Convert YouTube Video to Text Fast',
  'youtube-video-notes': 'Turn YouTube Videos Into Smart Notes',
  'youtube-transcript-ai-summary': 'AI Summary From YouTube Transcript',
  'youtube-transcript-for-seo': 'YouTube Transcript for SEO Workflows',
  'youtube-transcript': 'Get YouTube Transcript in Seconds',
  'video-to-text-ai': 'Video to Text AI for YouTube Content',
  'youtube-caption-extractor': 'YouTube Caption Extractor (Free)',
  'extract-video-transcript': 'Extract Video Transcript Online Fast'
});

function buildMetaTitle(lang, routeType, topic, keyword, blogDef = null) {
  if (lang === 'en') {
    const suffix = ' | Transcripta AI';
    let main = '';

    if (routeType === 'landing') {
      main = LANDING_TITLE_OVERRIDES_EN[topic.landingSlug] || `${toTitleCase(keyword)} Tool`;
    } else if (routeType === 'cluster') {
      main = `${topicLabel('en', topic)} Hub & Guides`;
    } else {
      main = `${toTitleCase(keyword)} Guide`;
      if (blogDef) main = `${topicLabel('en', topic)} ${angleLabel('en', blogDef.angle)}`;
    }

    const maxMain = 60 - suffix.length;
    const minMain = 50 - suffix.length;
    let safeMain = collapseSpaces(main);
    if (safeMain.length > maxMain) safeMain = truncateAtWord(safeMain, maxMain);
    while (safeMain.length < minMain) {
      safeMain = collapseSpaces(`${safeMain} Free`);
      if (safeMain.length > maxMain) {
        safeMain = truncateAtWord(safeMain, maxMain);
        break;
      }
    }
    return `${safeMain}${suffix}`;
  }

  if (lang === 'ar') {
    const main = routeType === 'cluster'
      ? `${topicLabel(lang, topic)} - مركز الأدلة`
      : routeType === 'blog' && blogDef
        ? `${topicLabel(lang, topic)} - ${angleLabel(lang, blogDef.angle)}`
        : topicLabel(lang, topic);
    return fitLength(`${main} | ${SITE_NAME}`, 36, 70, lang);
  }

  const main = routeType === 'cluster'
    ? `${topicLabel(lang, topic)} - Hub`
    : routeType === 'blog' && blogDef
      ? `${topicLabel(lang, topic)} - ${angleLabel(lang, blogDef.angle)}`
      : topicLabel(lang, topic);
  return fitLength(`${main} | ${SITE_NAME}`, 36, 70, lang);
}

function buildMetaDescription(lang, routeType, topic, keyword, blogDef = null) {
  if (lang === 'ar') {
    const angleText = routeType === 'blog' && blogDef ? ` ضمن سيناريو ${angleLabel(lang, blogDef.angle)}` : '';
    return fitLength(
      `دليل ${keyword}${angleText} يشرح استخراج النص من الفيديو خطوة بخطوة، مع روابط داخلية إلى أداة التفريغ وصفحات الموضوع والكلاستر لتسريع الدراسة والبحث وصناعة المحتوى.`,
      140,
      160,
      lang
    );
  }

  if (lang === 'fr') {
    const angleText = routeType === 'blog' && blogDef ? ` pour ${angleLabel(lang, blogDef.angle)}` : '';
    return fitLength(
      `Guide ${keyword}${angleText} avec methode claire pour extraire, structurer et reutiliser le texte video, plus maillage interne vers l outil, les pages landing et le cluster.`,
      140,
      160,
      lang
    );
  }

  if (routeType === 'landing') {
    return fitLength(
      `Extract ${keyword} instantly with Transcripta AI. Convert videos into searchable text, summaries, notes, and reusable content with a fast, practical workflow.`,
      140,
      160,
      lang
    );
  }

  if (routeType === 'cluster') {
    return fitLength(
      `${topicLabel(lang, topic)} hub with deep guides, practical workflows, and internal links to landing pages, related articles, and the main transcript tool for fast execution.`,
      140,
      160,
      lang
    );
  }

  const angleText = blogDef ? ` for ${angleLabel(lang, blogDef.angle).toLowerCase()}` : '';
  return fitLength(
    `Learn ${keyword}${angleText} using a step-by-step process to extract, clean, and reuse transcript text for notes, research, and publishing with Transcripta AI.`,
    140,
    160,
    lang
  );
}

function fillTokens(template, values) {
  let output = template;
  Object.entries(values).forEach(([key, value]) => {
    output = output.replaceAll(`{${key}}`, String(value || ''));
  });
  return collapseSpaces(output);
}

const EXPANSION_TEMPLATES = Object.freeze({
  en: [
    'When teams optimize {keyword}, they remove rewatch loops and move faster from raw video to searchable text. This improves execution speed, reduces context switching, and creates a reusable knowledge layer for recurring tasks.',
    'A strong {topic} workflow starts with predictable structure: source URL, extraction pass, cleanup rules, and final output blocks. That structure makes quality measurable and keeps results consistent across different editors and projects.',
    'For practical adoption, map each transcript section to one operational action. Use short headings, owner notes, and expected outcomes so {keyword} does not stay informational only and becomes directly executable.',
    'In production, {topic} performs best when your team standardizes naming conventions and publishing templates. Consistent formatting helps search engines understand hierarchy and helps users scan content in seconds.',
    'If you use {topic} for SEO, combine transcript blocks with intent-driven headings and concise FAQs. This pattern increases topical coverage while preserving clarity, which is critical for long-form pages and internal linking.',
    'A reliable {keyword} process should include quick QA checks: timestamp validity, duplicate sentence removal, and headline consistency. These checks raise trust and reduce friction before sharing outputs across channels.',
    'For cross-team usage, align transcript outputs with research, content, and growth workflows. The same extracted text can feed briefs, social snippets, study notes, and technical documentation without repeating manual work.',
    'As page depth grows, maintain clean navigation between landing pages, cluster hubs, and blog guides. This internal graph helps crawlers discover pages efficiently and helps visitors continue along the right intent path.'
  ],
  ar: [
    'عند تحسين مسار {keyword}، تتوقف دوامة إعادة مشاهدة الفيديو ويتحول العمل مباشرة إلى نص قابل للبحث. هذا يرفع سرعة التنفيذ ويقلل التشتت ويحوّل المعرفة إلى أصل قابل لإعادة الاستخدام.',
    'أفضل تطبيق لـ {topic} يبدأ ببنية واضحة: رابط المصدر، خطوة الاستخراج، قواعد التنظيف، ثم إخراج منظم. هذه البنية تجعل الجودة قابلة للقياس وتحافظ على ثبات النتائج عبر الفريق.',
    'لتحويل المحتوى إلى نتيجة عملية، اربط كل فقرة مستخرجة بإجراء واضح ومسؤول وتاريخ تنفيذ. بهذه الطريقة لا يبقى {keyword} مجرد معلومات، بل يصبح خطة قابلة للتطبيق.',
    'في بيئة الإنتاج، ينجح {topic} أكثر عند توحيد أسماء الملفات وقوالب النشر. التنسيق الثابت يساعد محركات البحث على فهم البنية، ويساعد المستخدم على الوصول للمعلومة بسرعة.',
    'للاستفادة من {topic} في السيو، استخدم عناوين مبنية على نية البحث مع أسئلة شائعة قصيرة وواضحة. هذا يوسع التغطية الموضوعية ويحافظ على جودة القراءة في الصفحات الطويلة.',
    'أي سير عمل قوي لـ {keyword} يحتاج فحص جودة سريع: إزالة التكرار، مراجعة العناوين، وضبط الفقرات. هذه الخطوات ترفع الثقة وتقلل الأخطاء قبل إعادة الاستخدام.',
    'عند دمج النص المستخرج مع فرق البحث وصناعة المحتوى والتسويق، تحصل على تدفق موحد لإنتاج الملخصات والملاحظات والأفكار القابلة للنشر بدون مجهود يدوي متكرر.',
    'كلما زاد عمق الصفحات، احرص على روابط داخلية منظمة بين صفحات الهبوط والكلاستر والمقالات. هذا يساعد الأرشفة، ويرفع جودة التنقل، ويقود المستخدم للمسار المناسب.'
  ],
  fr: [
    'En optimisant {keyword}, vous eliminez les relectures video repetitives et passez plus vite du media brut au texte searchable. Ce gain accelere l execution et cree une base de connaissance reutilisable.',
    'Un workflow {topic} solide commence par une structure stable: URL source, extraction, nettoyage, puis blocs de sortie. Cette logique rend la qualite mesurable et maintient la coherence entre projets.',
    'Pour un usage operationnel, reliez chaque section de transcript a une action concrete avec responsable et resultat attendu. Ainsi, {keyword} devient un moteur d execution et pas seulement un contenu passif.',
    'En production, {topic} fonctionne mieux avec des conventions de nommage et des templates editoriaux clairs. Cette regularite facilite la lecture utilisateur et la comprehension algorithmique des pages.',
    'Pour le SEO, combinez {topic} avec des titres bases sur l intention et une FAQ concise. Ce schema augmente la couverture semantique tout en gardant une experience lisible.',
    'Un flux fiable de {keyword} doit inclure des controles rapides: suppression des doublons, verification des titres, et nettoyage des paragraphes. Ces controles augmentent la confiance avant diffusion.',
    'Le meme texte extrait peut alimenter recherche, notes, briefs et contenu marketing. Cette reutilisation transverse reduit fortement le travail manuel et accelere la publication multi-canal.',
    'Avec des pages plus profondes, gardez un maillage interne net entre landing, cluster et guides blog. Ce graphe interne aide Google a explorer vite et aide les visiteurs a poursuivre leur intention.'
  ]
});

function introParagraphs(lang, topicName, keyword, routeType) {
  const base = {
    en: [
      '{topic} helps you execute {keyword} quickly, turning long videos into clean text that can be searched, quoted, and reused across multiple workflows.',
      'This page follows an intent-first structure built for both users and Google, so every section explains exactly how to move from video URL to execution-ready output.',
      routeType === 'cluster'
        ? 'As a cluster hub, this page connects core landing pages and related guides to strengthen topical authority and improve crawl depth for {keyword}.'
        : 'You will find practical steps, use cases, and internal links to related resources that make {keyword} easier to implement in production.'
    ],
    ar: [
      'صفحة {topic} تشرح تنفيذ {keyword} بسرعة وتحويل الفيديوهات الطويلة إلى نص نظيف قابل للبحث والاقتباس وإعادة الاستخدام في أكثر من سيناريو.',
      'المحتوى هنا مبني على نية البحث، بحيث يفهم الزائر ومحرك البحث نفس التسلسل العملي من رابط الفيديو حتى المخرجات الجاهزة للتنفيذ.',
      routeType === 'cluster'
        ? 'كصفحة كلاستر، هذا الدليل يربط الصفحات الأساسية والمقالات المرتبطة لبناء سلطة موضوعية أقوى وتحسين التغطية على كلمات {keyword}.'
        : 'ستجد خطوات عملية وروابط داخلية واستخدامات واضحة تساعدك على تطبيق {keyword} بجودة إنتاجية حقيقية.'
    ],
    fr: [
      '{topic} vous permet dexecuter {keyword} rapidement en transformant des videos longues en texte propre, searchable et reutilisable.',
      'La structure de cette page suit lintention de recherche pour guider utilisateur et moteur de recherche du lien video jusqua la sortie exploitable.',
      routeType === 'cluster'
        ? 'En tant que hub cluster, cette page relie les pages piliers et les guides associes pour renforcer lautorite thematique autour de {keyword}.'
        : 'Vous trouverez des etapes pratiques, des cas dusage et un maillage interne clair pour deployer {keyword} en conditions reelles.'
    ]
  };

  return (base[lang] || base.en).map((template) =>
    fillTokens(template, { topic: topicName, keyword })
  );
}

function problemParagraphs(lang, topicName, keyword) {
  const base = {
    en: [
      'Manual transcript extraction wastes time because users jump between playback, pause points, and note-taking windows without consistent formatting.',
      'Without structured text, teams cannot scale research, summarization, or publishing workflows, so knowledge stays trapped inside timelines.',
      '{topic} addresses this by turning {keyword} into a repeatable process that reduces friction and improves output quality at each step.'
    ],
    ar: [
      'الاستخراج اليدوي يستهلك وقتًا كبيرًا بسبب التنقل بين تشغيل الفيديو والتوقف والكتابة بدون تنسيق ثابت أو منهجية واضحة.',
      'عند غياب النص المنظم، لا تستطيع الفرق توسيع البحث أو التلخيص أو النشر، فتظل المعرفة محبوسة داخل خط الفيديو الزمني.',
      '{topic} يحل هذه المشكلة عبر تحويل {keyword} إلى عملية متكررة تقلل الاحتكاك وترفع جودة الناتج في كل مرحلة.'
    ],
    fr: [
      'Lextraction manuelle prend beaucoup de temps avec des allers-retours constants entre lecture, pause et prise de notes.',
      'Sans texte structure, les equipes ne peuvent pas industrialiser recherche, synthese et publication; la connaissance reste dans la timeline.',
      '{topic} transforme {keyword} en processus reproductible qui reduit la friction et augmente la qualite des resultats.'
    ]
  };

  return (base[lang] || base.en).map((template) =>
    fillTokens(template, { topic: topicName, keyword })
  );
}

function howParagraphs(lang, topicName, keyword, angleName) {
  const base = {
    en: [
      'Start with the video URL, run extraction, then shape transcript sections into practical blocks for notes, summaries, SEO, or publishing.',
      'In {topic}, each output block maps to a use case, so {keyword} stays aligned with real goals instead of producing generic text only.',
      'When needed, adapt tone and depth for {angle} while keeping the same extraction backbone to maintain speed and consistency.'
    ],
    ar: [
      'ابدأ برابط الفيديو، ثم شغّل الاستخراج، ثم حول الأقسام النصية إلى وحدات عملية للملاحظات والتلخيص والسيو والنشر.',
      'داخل {topic} يتم ربط كل جزء نصي بهدف واضح، لذلك يبقى {keyword} موجّهًا للتنفيذ وليس مجرد نص عام.',
      'يمكنك تخصيص الأسلوب والعمق حسب سيناريو {angle} مع الحفاظ على نفس هيكل الاستخراج السريع والمتسق.'
    ],
    fr: [
      'Commencez par lURL video, lancez lextraction, puis convertissez les sections en blocs exploitables pour notes, resumes et publication.',
      'Avec {topic}, chaque bloc de sortie correspond a un objectif concret afin que {keyword} reste oriente execution.',
      'Vous pouvez ajuster ton et profondeur pour le scenario {angle} tout en conservant le meme backbone dextraction.'
    ]
  };

  return (base[lang] || base.en).map((template) =>
    fillTokens(template, { topic: topicName, keyword, angle: angleName })
  );
}

function methodSteps(lang) {
  if (lang === 'ar') {
    return [
      {
        title: 'Step 1: انسخ رابط الفيديو',
        text: 'افتح الفيديو المطلوب، انسخ الرابط الكامل، وحدد هدفك النهائي من النص: ملاحظات، تلخيص، بحث، أو إعادة توظيف للمحتوى.'
      },
      {
        title: 'Step 2: افتح أداة التفريغ',
        text: 'ادخل إلى /tool والصق الرابط في الحقل، ثم ابدأ عملية الاستخراج لتحويل الكلام إلى نص منظم وقابل للبحث.'
      },
      {
        title: 'Step 3: استخرج النص ونظمه',
        text: 'راجع النص بسرعة، أزل التكرار، أضف عناوين واضحة، ثم استخدم المخرجات في سيناريو عملي جاهز للتنفيذ.'
      }
    ];
  }

  if (lang === 'fr') {
    return [
      {
        title: 'Step 1: Copier le lien video',
        text: 'Ouvrez la video cible, copiez son URL complete, puis definissez le resultat attendu: notes, resume, recherche ou publication.'
      },
      {
        title: 'Step 2: Ouvrir l outil',
        text: 'Accedez a /tool, collez le lien et lancez lextraction afin de convertir la parole en texte structure et searchable.'
      },
      {
        title: 'Step 3: Extraire et organiser',
        text: 'Revisez rapidement la sortie, nettoyez les doublons, ajoutez des titres clairs puis reutilisez le texte dans un flux concret.'
      }
    ];
  }

  return [
    {
      title: 'Step 1: Copy the video URL',
      text: 'Open the target video, copy the full URL, and define the final output you need: notes, summary, research brief, or publish-ready draft.'
    },
    {
      title: 'Step 2: Open the transcript tool',
      text: 'Go to /tool, paste the URL, and run extraction to convert spoken content into structured text that is searchable and easy to reuse.'
    },
    {
      title: 'Step 3: Extract and refine output',
      text: 'Clean duplicates, add clear headings, and organize transcript blocks into a practical format your team can execute immediately.'
    }
  ];
}

function benefitItems(lang) {
  if (lang === 'ar') {
    return [
      'الوصول السريع للمعلومات عبر نص قابل للبحث بدل التنقل اليدوي في الفيديو.',
      'تسريع إعداد الملخصات والملاحظات والتقارير والمحتوى القابل للنشر.',
      'رفع كفاءة فرق البحث والمحتوى والتسويق عبر تدفق عمل موحد.',
      'تقليل الوقت الضائع في إعادة مشاهدة المقاطع الطويلة بشكل متكرر.',
      'تحسين جودة التنظيم الداخلي للأفكار والعناوين والكلمات المفتاحية.',
      'بناء أصول معرفية قابلة لإعادة الاستخدام في مشاريع مستقبلية.'
    ];
  }
  if (lang === 'fr') {
    return [
      'Acces rapide a linformation via texte searchable au lieu de navigation timeline.',
      'Production acceleree de resumes, notes et contenus publiables.',
      'Workflow unifie pour equipes recherche, contenu et marketing.',
      'Reduction des relectures videos repetitives et chronophages.',
      'Meilleure qualite de structuration editoriale et semantique.',
      'Creation dactifs de connaissance reutilisables a long terme.'
    ];
  }
  return [
    'Faster discovery through searchable text instead of timeline scanning.',
    'Accelerated production of summaries, notes, and publishable content.',
    'Unified workflow across research, content, and growth teams.',
    'Less time wasted replaying long videos repeatedly.',
    'Higher quality structure for headings, sections, and key phrases.',
    'Reusable knowledge assets for future projects and campaigns.'
  ];
}

function scenarioItems(lang) {
  if (lang === 'ar') {
    return [
      'الطلاب: تحويل المحاضرات الطويلة إلى نقاط مذاكرة منظمة.',
      'الباحثون: استخراج اقتباسات وأفكار رئيسية بسرعة عالية.',
      'صناع المحتوى: تحويل الفيديو إلى نصوص جاهزة لإعادة النشر.',
      'فرق السيو: بناء مقالات مبنية على نية البحث من النص المستخرج.',
      'فرق التسويق: إنتاج رسائل ومحتوى حملات من فيديو واحد.',
      'فرق التشغيل: توثيق المعرفة وتحويلها إلى إجراءات قابلة للتطبيق.'
    ];
  }
  if (lang === 'fr') {
    return [
      'Etudiants: convertir cours videos en notes de revision claires.',
      'Chercheurs: extraire citations et idees principales rapidement.',
      'Createurs: transformer video en contenus textuels reutilisables.',
      'Equipes SEO: produire des articles bases sur lintention recherche.',
      'Marketing: generer messages et assets a partir dun seul media.',
      'Operations: documenter la connaissance et la transformer en actions.'
    ];
  }
  return [
    'Students: convert long lectures into structured revision notes.',
    'Researchers: extract key insights and quotes in minutes.',
    'Creators: repurpose videos into publish-ready text assets.',
    'SEO teams: build intent-aligned articles from transcript blocks.',
    'Marketing teams: generate campaign messaging from one source video.',
    'Operations teams: document knowledge and turn it into execution steps.'
  ];
}

function detailedGuideParagraphs(lang, topicName, keyword, angleName, routeType) {
  const base = {
    en: [
      'In a production setup, {topic} works best when transcript output is segmented into semantic blocks that match user intent and business goals.',
      'Begin by defining why you need {keyword}: revision notes, SEO brief, content repurposing, or decision support for teams.',
      'After extraction, clean sentence noise, remove duplicates, and normalize headings so readers and search engines can parse sections quickly.',
      'For {angle}, assign each transcript block to an actionable task with owner, deadline, and expected outcome to maximize practical value.',
      'Keep internal links contextual: connect this page to the tool, the canonical landing page, related guides, and relevant cluster hubs.',
      routeType === 'cluster'
        ? 'Because this is a cluster page, it should continuously surface top-performing guides and landing pages to reinforce topical authority over time.'
        : 'This page should be revisited and improved as query patterns evolve, ensuring metadata, headings, and examples remain aligned with search intent.'
    ],
    ar: [
      'في بيئة الإنتاج، ينجح {topic} عندما يتم تقسيم النص المستخرج إلى وحدات دلالية مرتبطة بهدف المستخدم ونتيجة العمل المطلوبة.',
      'ابدأ بتحديد سبب استخدام {keyword}: ملاحظات دراسة، مسودة سيو، إعادة توظيف محتوى، أو دعم قرار داخل الفريق.',
      'بعد الاستخراج، نظّف التكرار واضبط الفقرات والعناوين حتى تصبح القراءة أسرع لمحرك البحث وللزائر في نفس الوقت.',
      'في سيناريو {angle}، اربط كل كتلة نصية بمهمة تنفيذية لها مسؤول وزمن ونتيجة متوقعة لزيادة القيمة العملية.',
      'احرص أن تكون الروابط الداخلية مرتبطة بالسياق: الأداة، صفحة الهبوط الأساسية، الأدلة ذات الصلة، وصفحة الكلاستر.',
      routeType === 'cluster'
        ? 'بما أن هذه صفحة كلاستر، يجب تحديثها دوريًا بأفضل الصفحات والمقالات الداعمة لتعزيز السلطة الموضوعية بشكل مستمر.'
        : 'يُفضل مراجعة الصفحة دوريًا حسب تغيّر نية البحث حتى تظل العناوين والميتا والمحتوى متوافقة مع الاستهداف الفعلي.'
    ],
    fr: [
      'En production, {topic} performe mieux lorsque la sortie transcript est segmentee en blocs semantiques alignes avec lintention utilisateur.',
      'Commencez par clarifier pourquoi vous avez besoin de {keyword}: notes, brief SEO, repurposing ou aide a la decision.',
      'Apres extraction, nettoyez le bruit, supprimez doublons et normalisez les titres pour faciliter lecture humaine et comprehension algorithmique.',
      'Pour le scenario {angle}, reliez chaque bloc de texte a une action concrete avec responsable, delai et resultat attendu.',
      'Gardez un maillage interne contextuel entre loutil, la landing canonique, les guides lies et la page cluster.',
      routeType === 'cluster'
        ? 'Comme il sagit dun cluster hub, cette page doit remonter regulierement les ressources prioritaires pour renforcer lautorite thematique.'
        : 'Revisez cette page regulierement selon les signaux de requete pour maintenir le bon alignement entre contenu et intention.'
    ]
  };

  return (base[lang] || base.en).map((template) =>
    fillTokens(template, { topic: topicName, keyword, angle: angleName })
  );
}

function faqItems(lang, keyword, topicName) {
  if (lang === 'ar') {
    return [
      { question: `ما هو ${keyword}؟`, answer: `هو مسار عملي يتيح لك استخراج النص من الفيديو وتنظيمه بسرعة عبر ${topicName}.` },
      { question: 'هل يمكن نسخ النص الناتج وإعادة استخدامه؟', answer: 'نعم، الناتج قابل للنسخ والبحث وإعادة التوظيف في الدراسة والبحث وصناعة المحتوى.' },
      { question: 'هل كل الصفحات مرتبطة بالأداة؟', answer: 'نعم، كل صفحة تحتوي رابطًا مباشرًا إلى /tool بالإضافة إلى روابط داخلية داعمة.' },
      { question: 'هل هذا مناسب للسيو؟', answer: 'نعم، تنظيم النص في عناوين وفقرات واضحة يدعم الأرشفة ويوسع التغطية على نية البحث.' }
    ];
  }

  if (lang === 'fr') {
    return [
      { question: `Quest-ce que ${keyword} ?`, answer: `Cest un workflow pour extraire et structurer rapidement le texte video avec ${topicName}.` },
      { question: 'Puis-je copier et reutiliser le transcript ?', answer: 'Oui, la sortie est searchable, copiable et reutilisable pour etude, recherche et contenu.' },
      { question: 'Chaque page pointe vers loutil principal ?', answer: 'Oui, chaque page inclut un lien direct vers /tool plus un maillage interne pertinent.' },
      { question: 'Est-ce utile pour le SEO ?', answer: 'Oui, une structure claire de titres et paragraphes aide indexation et couverture semantique.' }
    ];
  }

  return [
    { question: `What is ${keyword}?`, answer: `It is a practical workflow for extracting and structuring video text with ${topicName}.` },
    { question: 'Can I copy and reuse the transcript output?', answer: 'Yes. The output is searchable, copyable, and reusable for research, study, and content workflows.' },
    { question: 'Do all pages link to the main tool?', answer: 'Yes. Every page includes a direct /tool link plus contextual internal links.' },
    { question: 'Is this helpful for SEO?', answer: 'Yes. Clear heading hierarchy and structured text improve indexability and topical coverage.' }
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

  LANDING_SLUGS.forEach((slug) => {
    push(`/${slug}`, `/en/${slug}`);
  });

  BLOG_SLUGS.forEach((slug) => {
    push(`/blog/${slug}`, `/en/blog/${slug}`);
  });

  CLUSTER_SLUGS.forEach((slug) => {
    push(`/cluster/${slug}`, `/en/cluster/${slug}`);
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
  return `${base} - ${angleLabel(lang, angle)}`;
}

function pickRelatedBlogDefs(topicId, currentBlogSlug = null, options = {}) {
  const min = Number.isFinite(Number(options.min)) ? Number(options.min) : 3;
  const max = Number.isFinite(Number(options.max)) ? Number(options.max) : 5;

  const fromSameTopic = blogsForTopic(topicId).filter((blog) => blog.slug !== currentBlogSlug);
  const picks = [...fromSameTopic];

  if (picks.length < min) {
    const fromOtherTopics = BLOG_DEFINITIONS.filter(
      (blog) => blog.topicId !== topicId && blog.slug !== currentBlogSlug
    );
    for (const blog of fromOtherTopics) {
      if (picks.find((item) => item.slug === blog.slug)) continue;
      picks.push(blog);
      if (picks.length >= min) break;
    }
  }

  return picks.slice(0, Math.max(min, max));
}

function pickRelatedLandingPages(topicId, lang, max = 3) {
  const otherTopics = TOPICS.filter((topic) => topic.id !== topicId).slice(0, max);
  return otherTopics.map((topic) => ({
    slug: topic.landingSlug,
    path: routePath('landing', lang, topic.landingSlug),
    label: topicLabel(lang, topic)
  }));
}

function pickClusterLinks(routeType, topicId, lang, topic) {
  if (routeType !== 'cluster') {
    return [
      {
        slug: topic.clusterSlug,
        path: routePath('cluster', lang, topic.clusterSlug),
        label: `${topicLabel(lang, topic)} Hub`
      }
    ];
  }

  return TOPICS.filter((item) => item.id !== topicId)
    .slice(0, 3)
    .map((item) => ({
      slug: item.clusterSlug,
      path: routePath('cluster', lang, item.clusterSlug),
      label: `${topicLabel(lang, item)} Hub`
    }));
}

function buildContentWordCount(content) {
  let total = 0;
  content.introParagraphs.forEach((item) => (total += countWords(item)));
  content.problemParagraphs.forEach((item) => (total += countWords(item)));
  content.howParagraphs.forEach((item) => (total += countWords(item)));
  content.steps.forEach((item) => {
    total += countWords(item.title);
    total += countWords(item.text);
  });
  content.benefits.forEach((item) => (total += countWords(item)));
  content.useCases.forEach((item) => (total += countWords(item)));
  content.detailedGuide.forEach((item) => (total += countWords(item)));
  content.faqItems.forEach((item) => {
    total += countWords(item.question);
    total += countWords(item.answer);
  });
  return total;
}

function generateExpansionParagraphs(lang, topicName, keyword, neededWords) {
  const templates = EXPANSION_TEMPLATES[lang] || EXPANSION_TEMPLATES.en;
  const output = [];
  let index = 0;
  let total = 0;

  while (total < neededWords && index < 24) {
    const template = templates[index % templates.length];
    const text = fillTokens(template, { topic: topicName, keyword });
    output.push(text);
    total += countWords(text);
    index += 1;
  }

  return output;
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
  const topicName = topicLabel(safeLang, topic);
  const angleName = blogDef ? angleLabel(safeLang, blogDef.angle) : angleLabel(safeLang, 'how-to');
  const keyword = keywordForRoute(safeLang, routeType, topic, blogDef);
  const canonicalPath = routePath(routeType, safeLang, slug);
  const primaryLandingPath = routePath('landing', safeLang, topic.landingSlug);
  const primaryClusterPath = routePath('cluster', safeLang, topic.clusterSlug);
  const faq = faqItems(safeLang, keyword, topicName);

  const linkConfig = routeType === 'cluster'
    ? { min: 10, max: 15 }
    : routeType === 'landing'
      ? { min: 4, max: 5 }
      : { min: 3, max: 5 };

  const relatedBlogDefs = pickRelatedBlogDefs(topic.id, blogDef?.slug || null, linkConfig);
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
    },
    ...pickRelatedLandingPages(topic.id, safeLang, 2)
  ];

  const clusterLinks = pickClusterLinks(routeType, topic.id, safeLang, topic);

  const content = {
    introParagraphs: introParagraphs(safeLang, topicName, keyword, routeType),
    problemParagraphs: problemParagraphs(safeLang, topicName, keyword),
    howParagraphs: howParagraphs(safeLang, topicName, keyword, angleName),
    steps: methodSteps(safeLang),
    benefits: benefitItems(safeLang),
    useCases: scenarioItems(safeLang),
    detailedGuide: detailedGuideParagraphs(safeLang, topicName, keyword, angleName, routeType),
    faqItems: faq
  };

  const targetWords = MIN_WORD_TARGET_BY_ROUTE[routeType] || 900;
  const currentWords = buildContentWordCount(content);
  if (currentWords < targetWords) {
    const extraWords = targetWords - currentWords;
    content.detailedGuide.push(
      ...generateExpansionParagraphs(safeLang, topicName, keyword, extraWords)
    );
  }

  const structuredData = [buildFaqSchema(faq)];
  if (routeType === 'landing') {
    structuredData.push(getSoftwareApplicationSchema(canonicalPath));
  }

  const h1 = routeType === 'cluster'
    ? `${topicName} SEO Hub`
    : blogDef
      ? blogLabel(safeLang, topic, blogDef.angle)
      : topicName;

  return {
    type: routeType,
    lang: safeLang,
    slug,
    dir: safeLang === 'ar' ? 'rtl' : 'ltr',
    title: buildMetaTitle(safeLang, routeType, topic, keyword, blogDef),
    metaDescription: buildMetaDescription(safeLang, routeType, topic, keyword, blogDef),
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
    introParagraphs: content.introParagraphs,
    problemParagraphs: content.problemParagraphs,
    howParagraphs: content.howParagraphs,
    steps: content.steps,
    benefits: content.benefits,
    useCases: content.useCases,
    detailedGuide: content.detailedGuide,
    faqItems: content.faqItems,
    relatedArticles,
    relatedLandingPages,
    clusterLinks,
    toolPath: TOOL_PATH,
    languageHomePath: `/${safeLang}/`,
    structuredData,
    ogType: routeType === 'cluster' ? 'website' : 'article',
    robots: 'index, follow',
    isLegacyAlias: useLegacyAlias,
    topicId: topic.id,
    estimatedWords: buildContentWordCount(content)
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
  const landingPaths = SUPPORTED_LANGS.flatMap((lang) =>
    LANDING_SLUGS.map((slug) => routePath('landing', lang, slug))
  );
  const blogPaths = SUPPORTED_LANGS.flatMap((lang) =>
    BLOG_SLUGS.map((slug) => routePath('blog', lang, slug))
  );
  const clusterPaths = SUPPORTED_LANGS.flatMap((lang) =>
    CLUSTER_SLUGS.map((slug) => routePath('cluster', lang, slug))
  );
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
  BLOG_COUNT_PER_TOPIC: BLOG_DEFINITIONS.length / TOPICS.length
});
