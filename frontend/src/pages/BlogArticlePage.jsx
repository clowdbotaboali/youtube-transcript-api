/* eslint-disable react-refresh/only-export-components */
import SeoMeta from '../components/SeoMeta';
import { LANG } from '../utils/lang';

const SITE_ORIGIN = 'https://transcripta.tech';
const DEFAULT_BLOG_LANG = LANG.en;
const BLOG_LANGS = [LANG.en, LANG.ar, LANG.fr];
const PUBLISHED_AT_ISO = '2026-03-04T00:00:00.000Z';

const TOPICS = [
  {
    slug: 'youtube-transcript-generator',
    keyword: {
      en: 'youtube transcript generator',
      ar: 'مولد تفريغ يوتيوب',
      fr: 'generateur de transcription YouTube'
    }
  },
  {
    slug: 'youtube-transcript-downloader',
    keyword: {
      en: 'youtube transcript downloader',
      ar: 'تنزيل تفريغ يوتيوب',
      fr: 'telechargement de transcription YouTube'
    }
  },
  {
    slug: 'youtube-subtitles-extractor',
    keyword: {
      en: 'youtube subtitles extractor',
      ar: 'استخراج ترجمات يوتيوب',
      fr: 'extracteur de sous-titres YouTube'
    }
  },
  {
    slug: 'youtube-transcript-to-text',
    keyword: {
      en: 'youtube transcript to text',
      ar: 'تحويل تفريغ يوتيوب الى نص',
      fr: 'transcription YouTube en texte'
    }
  },
  {
    slug: 'youtube-video-to-transcript',
    keyword: {
      en: 'youtube video to transcript',
      ar: 'فيديو يوتيوب الى تفريغ نصي',
      fr: 'video YouTube vers transcription'
    }
  },
  {
    slug: 'copy-youtube-transcript',
    keyword: {
      en: 'copy youtube transcript',
      ar: 'نسخ تفريغ يوتيوب',
      fr: 'copier la transcription YouTube'
    }
  },
  {
    slug: 'youtube-subtitle-converter',
    keyword: {
      en: 'youtube subtitle converter',
      ar: 'محول ترجمات يوتيوب',
      fr: 'convertisseur de sous-titres YouTube'
    }
  },
  {
    slug: 'youtube-transcript-ai-summary',
    keyword: {
      en: 'youtube transcript ai summary',
      ar: 'ملخص ذكاء اصطناعي لتفريغ يوتيوب',
      fr: 'resume IA de transcription YouTube'
    }
  },
  {
    slug: 'youtube-video-text-extraction',
    keyword: {
      en: 'youtube video text extraction',
      ar: 'استخراج نص فيديو يوتيوب',
      fr: 'extraction de texte video YouTube'
    }
  },
  {
    slug: 'convert-youtube-speech-to-text',
    keyword: {
      en: 'convert youtube speech to text',
      ar: 'تحويل كلام يوتيوب الى نص',
      fr: 'convertir la parole YouTube en texte'
    }
  },
  {
    slug: 'extract-youtube-captions',
    keyword: {
      en: 'extract youtube captions',
      ar: 'استخراج الكابتشن من يوتيوب',
      fr: 'extraire les captions YouTube'
    }
  },
  {
    slug: 'get-youtube-video-transcript',
    keyword: {
      en: 'get youtube video transcript',
      ar: 'الحصول على تفريغ فيديو يوتيوب',
      fr: 'obtenir la transcription d une video YouTube'
    }
  },
  {
    slug: 'download-youtube-captions-text',
    keyword: {
      en: 'download youtube captions text',
      ar: 'تنزيل نص الكابتشن من يوتيوب',
      fr: 'telecharger le texte des captions YouTube'
    }
  },
  {
    slug: 'youtube-closed-captions-to-text',
    keyword: {
      en: 'youtube closed captions to text',
      ar: 'تحويل الترجمة المغلقة في يوتيوب الى نص',
      fr: 'sous-titres fermes YouTube en texte'
    }
  },
  {
    slug: 'youtube-audio-to-text-online',
    keyword: {
      en: 'youtube audio to text online',
      ar: 'تحويل صوت يوتيوب الى نص اونلاين',
      fr: 'audio YouTube en texte en ligne'
    }
  },
  {
    slug: 'transcribe-youtube-videos-fast',
    keyword: {
      en: 'transcribe youtube videos fast',
      ar: 'تفريغ فيديوهات يوتيوب بسرعة',
      fr: 'transcrire des videos YouTube rapidement'
    }
  },
  {
    slug: 'youtube-transcript-for-notes',
    keyword: {
      en: 'youtube transcript for notes',
      ar: 'تفريغ يوتيوب للملاحظات',
      fr: 'transcription YouTube pour les notes'
    }
  },
  {
    slug: 'youtube-transcript-for-seo',
    keyword: {
      en: 'youtube transcript for seo',
      ar: 'تفريغ يوتيوب لتحسين السيو',
      fr: 'transcription YouTube pour le SEO'
    }
  },
  {
    slug: 'summarize-youtube-transcript',
    keyword: {
      en: 'summarize youtube transcript',
      ar: 'تلخيص تفريغ يوتيوب',
      fr: 'resumer une transcription YouTube'
    }
  },
  {
    slug: 'youtube-transcript-for-study',
    keyword: {
      en: 'youtube transcript for study',
      ar: 'تفريغ يوتيوب للدراسة',
      fr: 'transcription YouTube pour etudier'
    }
  },
  {
    slug: 'youtube-transcript-for-podcast',
    keyword: {
      en: 'youtube transcript for podcast',
      ar: 'تفريغ يوتيوب للبودكاست',
      fr: 'transcription YouTube pour podcast'
    }
  },
  {
    slug: 'translate-youtube-transcript',
    keyword: {
      en: 'translate youtube transcript',
      ar: 'ترجمة تفريغ يوتيوب',
      fr: 'traduire une transcription YouTube'
    }
  },
  {
    slug: 'youtube-transcript-export',
    keyword: {
      en: 'youtube transcript export',
      ar: 'تصدير تفريغ يوتيوب',
      fr: 'export de transcription YouTube'
    }
  },
  {
    slug: 'youtube-subtitles-to-article',
    keyword: {
      en: 'youtube subtitles to article',
      ar: 'تحويل ترجمات يوتيوب الى مقال',
      fr: 'sous-titres YouTube en article'
    }
  },
  {
    slug: 'youtube-video-summary-generator',
    keyword: {
      en: 'youtube video summary generator',
      ar: 'مولد ملخص فيديو يوتيوب',
      fr: 'generateur de resume video YouTube'
    }
  },
  {
    slug: 'youtube-content-repurposing-text',
    keyword: {
      en: 'youtube content repurposing text',
      ar: 'اعادة توظيف محتوى يوتيوب كنص',
      fr: 'reutilisation de contenu YouTube en texte'
    }
  },
  {
    slug: 'youtube-transcript-copy-paste',
    keyword: {
      en: 'youtube transcript copy paste',
      ar: 'نسخ ولصق تفريغ يوتيوب',
      fr: 'copier coller transcription YouTube'
    }
  },
  {
    slug: 'youtube-caption-text-generator',
    keyword: {
      en: 'youtube caption text generator',
      ar: 'مولد نص كابتشن يوتيوب',
      fr: 'generateur de texte de captions YouTube'
    }
  },
  {
    slug: 'youtube-video-caption-extractor',
    keyword: {
      en: 'youtube video caption extractor',
      ar: 'استخراج كابتشن فيديو يوتيوب',
      fr: 'extracteur de captions video YouTube'
    }
  },
  {
    slug: 'youtube-transcript-tool-online',
    keyword: {
      en: 'youtube transcript tool online',
      ar: 'اداة تفريغ يوتيوب اونلاين',
      fr: 'outil de transcription YouTube en ligne'
    }
  }
];

const TOPIC_BY_SLUG = new Map(TOPICS.map((topic) => [topic.slug, topic]));

export const BLOG_TOPIC_SLUGS = Object.freeze(TOPICS.map((topic) => topic.slug));
export const BLOG_ARTICLE_PATHS = Object.freeze(
  BLOG_LANGS.flatMap((lang) => BLOG_TOPIC_SLUGS.map((slug) => `/${lang}/blog/${slug}`))
);
export const BLOG_LEGACY_PATHS = Object.freeze(BLOG_TOPIC_SLUGS.map((slug) => `/blog/${slug}`));

function normalizePath(value) {
  const raw = String(value || '/').trim();
  if (!raw) return '/';
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  if (normalized === '/') return '/';
  return normalized.replace(/\/+$/, '');
}

function toTitleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function blogLangFromValue(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === LANG.ar || normalized === LANG.fr) return normalized;
  return LANG.en;
}

function getLanguageHomePath(lang) {
  return `/${blogLangFromValue(lang)}/`;
}

function getRelatedTopics(index, count = 3) {
  const related = [];
  for (let offset = 1; offset < TOPICS.length && related.length < count; offset += 1) {
    related.push(TOPICS[(index + offset) % TOPICS.length]);
  }
  return related;
}

function copyForLang(lang) {
  if (lang === LANG.ar) {
    return {
      title: (keyword) => `${keyword}: دليل سريع لاستخراج النص من يوتيوب | Transcripta AI`,
      h1: (keyword) => `${keyword} بسهولة وبدقة`,
      subtitle:
        'نفس البنية العملية في كل مقال: فهم المشكلة، خطوات التنفيذ، الفوائد، ثم البدء الفوري من الاداة.',
      publishedLabel: 'تاريخ النشر',
      introTitle: 'المقدمة',
      introText: (keyword) =>
        `لو كنت تبحث عن ${keyword} فالفكرة بسيطة: حول محتوى الفيديو الطويل الى نص واضح وقابل للنسخ والبحث في دقائق بدل المشاهدة المتكررة.`,
      problemTitle: 'Section 1: شرح المشكلة',
      problemText:
        'الاستخراج اليدوي يستهلك وقتا كبيرا ويزيد احتمال فقدان نقاط مهمة. التنقل داخل الفيديو بشكل مستمر يجعل العمل ابطأ ويصعب على الفريق الرجوع الى المعلومة بسرعة.',
      methodTitle: 'Section 2: الطريقة خطوة بخطوة',
      steps: [
        {
          title: 'Step 1: انسخ رابط فيديو يوتيوب',
          text: 'افتح الفيديو المطلوب ثم انسخ الرابط بالكامل.'
        },
        {
          title: 'Step 2: افتح اداة استخراج النص',
          text: 'ادخل الى صفحة الاداة ثم الصق الرابط.'
        },
        {
          title: 'Step 3: استخرج التفريغ النصي',
          text: 'شغل الاستخراج واحصل على النص الجاهز للنسخ والاستخدام.'
        }
      ],
      benefitsTitle: 'Section 3: فوائد التفريغ النصي',
      benefits: [
        'تحويل الفيديو الى نص قابل للبحث السريع.',
        'توفير وقت المراجعة والكتابة اليدوية.',
        'اعادة استخدام المحتوى في ملخصات ومقالات وتقارير.',
        'تسهيل مشاركة المعرفة داخل الفريق.'
      ],
      useToolTitle: 'Section 4: استخدم الاداة',
      useToolText: 'ابدأ مباشرة عبر رابط الاداة ثم ارجع لهذا الدليل للمقارنة بين النتائج.',
      languageHomeText: 'الرجوع الى الصفحة الرئيسية باللغة الحالية',
      relatedTitle: 'مقالات مرتبطة',
      faqTitle: 'Section 5: الاسئلة الشائعة',
      faq: (keyword) => [
        {
          question: `ما هو ${keyword}؟`,
          answer: 'هو اسلوب لاستخراج الكلام من فيديو يوتيوب وتحويله الى نص قابل للنسخ.'
        },
        {
          question: 'هل يمكنني نسخ النص الناتج؟',
          answer: 'نعم، يمكنك نسخ النص واستخدامه في البحث او الكتابة او الدراسة.'
        },
        {
          question: 'هل الدقة ثابتة في كل الفيديوهات؟',
          answer: 'تعتمد الدقة على جودة الترجمة المتاحة في الفيديو الاصلي.'
        }
      ]
    };
  }

  if (lang === LANG.fr) {
    return {
      title: (keyword) => `${toTitleCase(keyword)}: guide rapide de transcription YouTube | Transcripta AI`,
      h1: (keyword) => `${toTitleCase(keyword)} en quelques minutes`,
      subtitle:
        'Chaque article suit la meme structure: contexte, probleme, etapes, benefices, puis action immediate.',
      publishedLabel: 'Date de publication',
      introTitle: 'Introduction',
      introText: (keyword) =>
        `Si vous ciblez ${keyword}, l objectif est clair: transformer une video longue en texte exploitable rapidement, sans travail manuel repetitif.`,
      problemTitle: 'Section 1: Explication du probleme',
      problemText:
        'L extraction manuelle est lente et peu fiable. Revenir en arriere dans la video fait perdre du temps et complique la reutilisation des informations importantes.',
      methodTitle: 'Section 2: Methode pas a pas',
      steps: [
        {
          title: 'Step 1: Copier l URL de la video YouTube',
          text: 'Ouvrez la video cible et copiez le lien complet.'
        },
        {
          title: 'Step 2: Ouvrir l outil de transcription',
          text: 'Accedez a la page outil puis collez le lien.'
        },
        {
          title: 'Step 3: Extraire la transcription',
          text: 'Lancez l extraction pour obtenir le texte reutilisable.'
        }
      ],
      benefitsTitle: 'Section 3: Benefices des transcriptions',
      benefits: [
        'Recherche rapide dans un texte au lieu de naviguer dans la video.',
        'Gain de temps pour les equipes contenu et formation.',
        'Reutilisation simple en notes, articles et briefs.',
        'Meilleure circulation de la connaissance.'
      ],
      useToolTitle: 'Section 4: Utiliser l outil',
      useToolText: 'Utilisez le lien outil pour lancer une extraction immediate sur votre prochaine video.',
      languageHomeText: 'Retour a la page d accueil dans cette langue',
      relatedTitle: 'Guides associes',
      faqTitle: 'Section 5: FAQ',
      faq: (keyword) => [
        {
          question: `Qu est-ce que ${keyword} ?`,
          answer: 'C est une methode pour extraire la parole dune video YouTube et la convertir en texte.'
        },
        {
          question: 'Puis-je copier la transcription ?',
          answer: 'Oui, le texte genere peut etre copie et reutilise facilement.'
        },
        {
          question: 'La precision est-elle toujours identique ?',
          answer: 'La precision depend principalement de la qualite des sous-titres de la video source.'
        }
      ]
    };
  }

  return {
    title: (keyword) => `${toTitleCase(keyword)}: Fast YouTube Transcript Guide | Transcripta AI`,
    h1: (keyword) => `${toTitleCase(keyword)} in 3 Practical Steps`,
    subtitle:
      'Every article follows the same structure for consistency: context, problem, workflow, benefits, and action.',
    publishedLabel: 'Published',
    introTitle: 'Introduction',
    introText: (keyword) =>
      `If you are searching for ${keyword}, the goal is simple: turn long YouTube videos into searchable text without manual copy-paste.`,
    problemTitle: 'Section 1: Problem Explanation',
    problemText:
      'Manual transcript extraction is slow and inconsistent. Replaying and pausing videos wastes time and makes it harder to reuse key ideas across teams.',
    methodTitle: 'Section 2: Step-by-Step Method',
    steps: [
      {
        title: 'Step 1: Copy the YouTube video URL',
        text: 'Open the target video and copy the full URL.'
      },
      {
        title: 'Step 2: Open the transcript tool',
        text: 'Go to the tool page and paste your URL.'
      },
      {
        title: 'Step 3: Extract the transcript',
        text: 'Run extraction and get clean text ready for reuse.'
      }
    ],
    benefitsTitle: 'Section 3: Benefits of Transcripts',
    benefits: [
      'Search key ideas instantly inside text output.',
      'Save hours compared to manual video review.',
      'Reuse content in summaries, notes, and articles.',
      'Improve team collaboration with shareable text.'
    ],
    useToolTitle: 'Section 4: Use the Tool',
    useToolText: 'Start now from the tool page to generate transcript text instantly.',
    languageHomeText: 'Back to the language homepage',
    relatedTitle: 'Related articles',
    faqTitle: 'Section 5: FAQ',
    faq: (keyword) => [
      {
        question: `What is ${keyword}?`,
        answer: 'It is a method to extract spoken content from YouTube videos as text.'
      },
      {
        question: 'Can I copy the generated transcript?',
        answer: 'Yes. The output can be copied and reused in your workflow.'
      },
      {
        question: 'Is transcript quality always the same?',
        answer: 'Quality depends on the subtitle data available in the source video.'
      }
    ]
  };
}

function buildArticle(lang, topic, index) {
  const safeLang = blogLangFromValue(lang);
  const locale = copyForLang(safeLang);
  const keyword = topic.keyword[safeLang] || topic.keyword[DEFAULT_BLOG_LANG];
  const related = getRelatedTopics(index, 3);
  const path = `/${safeLang}/blog/${topic.slug}`;
  const faqItems = locale.faq(keyword);

  return {
    lang: safeLang,
    slug: topic.slug,
    path,
    canonicalPath: path,
    legacyAlias: `/blog/${topic.slug}`,
    languageHomePath: getLanguageHomePath(safeLang),
    title: locale.title(keyword),
    metaDescription: locale.introText(keyword),
    h1: locale.h1(keyword),
    subtitle: locale.subtitle,
    publishedLabel: locale.publishedLabel,
    introTitle: locale.introTitle,
    introText: locale.introText(keyword),
    problemTitle: locale.problemTitle,
    problemText: locale.problemText,
    methodTitle: locale.methodTitle,
    steps: locale.steps,
    benefitsTitle: locale.benefitsTitle,
    benefits: locale.benefits,
    useToolTitle: locale.useToolTitle,
    useToolText: locale.useToolText,
    languageHomeText: locale.languageHomeText,
    relatedTitle: locale.relatedTitle,
    related,
    faqTitle: locale.faqTitle,
    faqItems,
    faqSchema: {
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
    }
  };
}

export function getBlogRouteInfo(pathname) {
  const path = normalizePath(pathname);
  const localizedMatch = path.match(/^\/(en|ar|fr)\/blog\/([a-z0-9-]+)$/i);
  if (localizedMatch) {
    const lang = blogLangFromValue(localizedMatch[1]);
    const slug = String(localizedMatch[2] || '').trim().toLowerCase();
    const topic = TOPIC_BY_SLUG.get(slug);
    if (!topic) return null;
    const index = TOPICS.findIndex((item) => item.slug === slug);
    return {
      ...buildArticle(lang, topic, index),
      requestedPath: path,
      isLegacyAlias: false
    };
  }

  const legacyMatch = path.match(/^\/blog\/([a-z0-9-]+)$/i);
  if (legacyMatch) {
    const slug = String(legacyMatch[1] || '').trim().toLowerCase();
    const topic = TOPIC_BY_SLUG.get(slug);
    if (!topic) return null;
    const index = TOPICS.findIndex((item) => item.slug === slug);
    return {
      ...buildArticle(DEFAULT_BLOG_LANG, topic, index),
      requestedPath: path,
      isLegacyAlias: true
    };
  }

  return null;
}

function hreflangAlternatesForSlug(slug) {
  const alternates = BLOG_LANGS.map((lang) => ({
    hreflang: lang,
    href: `${SITE_ORIGIN}/${lang}/blog/${slug}`
  }));
  alternates.push({
    hreflang: 'x-default',
    href: `${SITE_ORIGIN}/${DEFAULT_BLOG_LANG}/blog/${slug}`
  });
  return alternates;
}

function formatPublishedDate(lang) {
  if (lang === LANG.ar) return '4 مارس 2026';
  if (lang === LANG.fr) return '4 mars 2026';
  return 'March 4, 2026';
}

function BlogArticlePage({ routeInfo, theme = 'light' }) {
  const article = routeInfo || null;
  if (!article) return null;

  const isDark = theme === 'dark';
  const headingColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const textColor = isDark ? 'text-slate-300' : 'text-slate-700';
  const stepCardClass = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';
  const linkClass = isDark
    ? 'font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2'
    : 'font-semibold text-cyan-700 hover:text-cyan-900 underline underline-offset-2';
  const ctaButtonClass = isDark
    ? 'inline-flex items-center rounded-xl px-5 py-2.5 bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 transition'
    : 'inline-flex items-center rounded-xl px-5 py-2.5 bg-slate-900 text-white font-black hover:bg-slate-800 transition';
  const pageDir = article.lang === LANG.ar ? 'rtl' : 'ltr';
  const alternates = hreflangAlternatesForSlug(article.slug);

  return (
    <>
      <SeoMeta
        title={article.title}
        description={article.metaDescription}
        path={article.canonicalPath}
        canonicalOrigin={SITE_ORIGIN}
        robots="index, follow"
        ogType="article"
        publishedTime={PUBLISHED_AT_ISO}
        alternates={alternates}
        structuredData={article.faqSchema}
      />

      <main
        className={`min-h-screen pt-20 ${
          isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]'
        }`}
        dir={pageDir}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <header className={`rounded-2xl border p-5 sm:p-7 mb-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {article.publishedLabel}: {formatPublishedDate(article.lang)}
            </p>
            <h1 className={`text-3xl sm:text-4xl font-black ${headingColor}`}>{article.h1}</h1>
            <p className={`mt-2 text-sm sm:text-base leading-relaxed ${textColor}`}>{article.subtitle}</p>
          </header>

          <article className={`rounded-2xl border p-5 sm:p-7 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{article.introTitle}</h2>
              <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{article.introText}</p>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{article.problemTitle}</h2>
              <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{article.problemText}</p>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-3 ${headingColor}`}>{article.methodTitle}</h2>
              <div className="space-y-3">
                {article.steps.map((step) => (
                  <div key={step.title} className={`rounded-xl border p-4 ${stepCardClass}`}>
                    <h3 className={`text-base sm:text-lg font-extrabold mb-1 ${headingColor}`}>{step.title}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{article.benefitsTitle}</h2>
              <ul className={`text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5 ${textColor}`}>
                {article.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{article.useToolTitle}</h2>
              <p className={`text-sm sm:text-base leading-relaxed mb-4 ${textColor}`}>{article.useToolText}</p>
              <div className="flex flex-wrap gap-3 items-center">
                <a href="/tool" className={ctaButtonClass}>
                  Generate transcript instantly
                </a>
                <a href={article.languageHomePath} className={linkClass}>
                  {article.languageHomeText}
                </a>
              </div>
              <div className="mt-5">
                <h3 className={`text-base sm:text-lg font-extrabold mb-2 ${headingColor}`}>{article.relatedTitle}</h3>
                <ul className={`space-y-1 text-sm sm:text-base ${textColor}`}>
                  {article.related.map((topic) => (
                    <li key={topic.slug}>
                      <a href={`/${article.lang}/blog/${topic.slug}`} className={linkClass}>
                        {topic.keyword[article.lang] || topic.keyword[DEFAULT_BLOG_LANG]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className={`text-xl sm:text-2xl font-black mb-3 ${headingColor}`}>{article.faqTitle}</h2>
              <div className="space-y-3">
                {article.faqItems.map((item) => (
                  <div key={item.question} className={`rounded-xl border p-4 ${stepCardClass}`}>
                    <h3 className={`text-base sm:text-lg font-extrabold mb-1 ${headingColor}`}>{item.question}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

export default BlogArticlePage;
