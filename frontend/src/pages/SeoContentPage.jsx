import SeoMeta from '../components/SeoMeta';
import { SEO_CONFIG } from '../seo/seoCatalog';

const PUBLISHED_DATE = new Date('2026-03-05T00:00:00.000Z');

function formatPublishedDate(lang) {
  const locale = lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(PUBLISHED_DATE);
}
function SeoContentPage({ routeInfo, theme = 'light' }) {
  const page = routeInfo || null;
  if (!page) return null;

  const isDark = theme === 'dark';
  const headingColor = isDark ? 'text-slate-100' : 'text-slate-900';
  const textColor = isDark ? 'text-slate-300' : 'text-slate-700';
  const cardClass = isDark ? 'border-slate-700 bg-slate-950' : 'border-slate-200 bg-slate-50';
  const pageClass = isDark
    ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_100%)]'
    : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]';
  const ctaButtonClass = isDark
    ? 'inline-flex items-center rounded-xl px-5 py-2.5 bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 transition'
    : 'inline-flex items-center rounded-xl px-5 py-2.5 bg-slate-900 text-white font-black hover:bg-slate-800 transition';
  const linkClass = isDark
    ? 'font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-2'
    : 'font-semibold text-cyan-700 hover:text-cyan-900 underline underline-offset-2';

  return (
    <>
      <SeoMeta
        title={page.title}
        description={page.metaDescription}
        path={page.pathForMeta}
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots={page.robots}
        ogType={page.ogType}
        alternates={page.alternates}
        publishedTime={page.publishedTime}
        structuredData={page.structuredData}
      />

      <main className={`min-h-screen pt-20 ${pageClass}`} dir={page.dir}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <header className={`rounded-2xl border p-5 sm:p-7 mb-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {page.copy.publishedLabel}: {formatPublishedDate(page.lang)}
            </p>
            <h1 className={`text-3xl sm:text-4xl font-black ${headingColor}`}>{page.h1}</h1>
            <p className={`mt-2 text-sm sm:text-base leading-relaxed ${textColor}`}>{page.metaDescription}</p>
          </header>

          <article className={`rounded-2xl border p-5 sm:p-7 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.introTitle}</h2>
              <div className="space-y-2">
                {page.introParagraphs.map((item) => (
                  <p key={item} className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{item}</p>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.problemTitle}</h2>
              <div className="space-y-2">
                {page.problemParagraphs.map((item) => (
                  <p key={item} className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{item}</p>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.howTitle}</h2>
              <div className="space-y-2">
                {page.howParagraphs.map((item) => (
                  <p key={item} className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{item}</p>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-3 ${headingColor}`}>{page.copy.stepsTitle}</h2>
              <div className="space-y-3">
                {page.steps.map((step) => (
                  <div key={step.title} className={`rounded-xl border p-4 ${cardClass}`}>
                    <h3 className={`text-base sm:text-lg font-extrabold mb-1 ${headingColor}`}>{step.title}</h3>
                    <p className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.benefitsTitle}</h2>
              <ul className={`text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5 ${textColor}`}>
                {page.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.useCasesTitle}</h2>
              <ul className={`text-sm sm:text-base leading-relaxed space-y-2 list-disc pl-5 ${textColor}`}>
                {page.useCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.detailTitle}</h2>
              <div className="space-y-3">
                {page.detailedGuide.map((item) => (
                  <p key={item} className={`text-sm sm:text-base leading-relaxed ${textColor}`}>{item}</p>
                ))}
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.ctaTitle}</h2>
              <p className={`text-sm sm:text-base leading-relaxed mb-4 ${textColor}`}>{page.metaDescription}</p>
              <div className="flex flex-wrap gap-3 items-center">
                <a href={page.toolPath} className={ctaButtonClass}>
                  {page.copy.ctaLabel}
                </a>
                <a href={page.languageHomePath} className={linkClass}>
                  {page.copy.languageHomeText}
                </a>
              </div>
            </section>

            <section className="mb-7">
              <h2 className={`text-xl sm:text-2xl font-black mb-2 ${headingColor}`}>{page.copy.canonicalLandingTitle}</h2>
              <ul className={`space-y-1 text-sm sm:text-base mb-4 ${textColor}`}>
                {page.relatedLandingPages.map((item) => (
                  <li key={item.path}>
                    <a href={item.path} className={linkClass}>{item.label}</a>
                  </li>
                ))}
                <li>
                  <a href={page.toolPath} className={linkClass}>{page.copy.toolLinkText}</a>
                </li>
              </ul>

              <h3 className={`text-base sm:text-lg font-extrabold mb-2 ${headingColor}`}>{page.copy.relatedBlogsTitle}</h3>
              <ul className={`space-y-1 text-sm sm:text-base mb-4 ${textColor}`}>
                {page.relatedArticles.map((item) => (
                  <li key={item.path}>
                    <a href={item.path} className={linkClass}>{item.label}</a>
                  </li>
                ))}
              </ul>

              <h3 className={`text-base sm:text-lg font-extrabold mb-2 ${headingColor}`}>{page.copy.clusterTitle}</h3>
              <ul className={`space-y-1 text-sm sm:text-base ${textColor}`}>
                {page.clusterLinks.map((item) => (
                  <li key={item.path}>
                    <a href={item.path} className={linkClass}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={`text-xl sm:text-2xl font-black mb-3 ${headingColor}`}>{page.copy.faqTitle}</h2>
              <div className="space-y-3">
                {page.faqItems.map((item) => (
                  <div key={item.question} className={`rounded-xl border p-4 ${cardClass}`}>
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

export default SeoContentPage;


