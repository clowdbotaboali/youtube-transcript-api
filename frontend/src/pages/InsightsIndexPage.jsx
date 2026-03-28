import SeoMeta from '../components/SeoMeta';
import { SEO_CONFIG } from '../seo/seoCatalog';
import { LANG, tr } from '../utils/lang';
import INSIGHTS, { mapInsightForLang } from '../content/insights';

function formatDate(lang, iso) {
  const locale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  const date = new Date(iso || Date.now());
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function InsightsIndexPage({ lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';
  const cards = INSIGHTS.map((item) => mapInsightForLang(item, lang));

  return (
    <>
      <SeoMeta
        title={tr(lang, 'مكتبة المعرفة | Transcripta AI', 'Insights | Transcripta AI')}
        description={tr(
          lang,
          'مقالات عملية لفهم التفريغ النصي وتحويل الفيديو إلى معرفة قابلة للتطبيق.',
          'Practical articles on transcript workflows and turning video into actionable knowledge.'
        )}
        path="/insights"
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />

      <main className={`min-h-screen pt-20 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <header className={`rounded-2xl border p-6 sm:p-8 mb-6 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">{tr(lang, 'مكتبة المعرفة', 'Insights')}</h1>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {tr(
                lang,
                'محتوى عملي يشرح كيف تستفيد من التفريغ النصي داخل فرق العمل والتسويق والدراسة.',
                'Practical content on using transcripts across teams, marketing, and learning.'
              )}
            </p>
          </header>

          <section className="grid gap-4">
            {cards.map((item) => (
              <article key={item.slug} className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(lang, item.publishedAt)}</p>
                <h2 className="text-xl sm:text-2xl font-black mb-2">{item.title}</h2>
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4`}>{item.summary}</p>
                <a href={`/insights/${item.slug}`} className="inline-flex items-center gap-2 text-cyan-600 font-bold hover:underline">
                  {tr(lang, 'اقرأ المقال', 'Read article')}
                </a>
              </article>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

export default InsightsIndexPage;
