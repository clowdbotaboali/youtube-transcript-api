import SeoMeta from '../components/SeoMeta';
import { SEO_CONFIG } from '../seo/seoCatalog';
import { LANG, tr } from '../utils/lang';
import { getInsightBySlug, mapInsightForLang } from '../content/insights';

function formatDate(lang, iso) {
  const locale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  const date = new Date(iso || Date.now());
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function InsightArticlePage({ slug = '', lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';
  const base = getInsightBySlug(slug);
  const article = base ? mapInsightForLang(base, lang) : null;

  if (!article) {
    return (
      <>
        <SeoMeta
          title={tr(lang, 'المقال غير موجود | Transcripta AI', 'Article not found | Transcripta AI')}
          description={tr(lang, 'المقال المطلوب غير متاح.', 'The requested article is not available.')}
          path={`/insights/${slug}`}
          canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
          robots="noindex, nofollow"
        />
        <main className={`min-h-screen pt-20 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className={`rounded-2xl border p-6 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <h1 className="text-2xl font-black mb-2">{tr(lang, 'المقال غير موجود', 'Article not found')}</h1>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tr(lang, 'رجاءً ارجع لصفحة المقالات.', 'Return to the insights page.')}</p>
              <a href="/insights" className="inline-flex items-center gap-2 mt-4 text-cyan-600 font-bold hover:underline">
                {tr(lang, 'العودة للمكتبة', 'Back to insights')}
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Transcripta AI'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Transcripta AI'
    },
    mainEntityOfPage: `${SEO_CONFIG.SITE_ORIGIN}/insights/${article.slug}`
  };

  return (
    <>
      <SeoMeta
        title={`${article.title} | Transcripta AI`}
        description={article.summary}
        path={`/insights/${article.slug}`}
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        structuredData={structuredData}
      />

      <main className={`min-h-screen pt-20 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className={`rounded-2xl border p-6 sm:p-8 mb-6 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(lang, article.publishedAt)}</p>
            <h1 className="text-3xl sm:text-4xl font-black mb-3">{article.title}</h1>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{article.summary}</p>
          </header>

          <article className={`rounded-2xl border p-6 sm:p-7 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            {article.sections.map((section) => (
              <section key={section.title} className="mb-6 last:mb-0">
                <h2 className="text-xl sm:text-2xl font-black mb-2">{section.title}</h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.title}-${index}`} className={`${isDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <div className="mt-6">
            <a href="/insights" className="inline-flex items-center gap-2 text-cyan-600 font-bold hover:underline">
              {tr(lang, 'العودة للمكتبة', 'Back to insights')}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

export default InsightArticlePage;
