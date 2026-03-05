import { useEffect, useMemo, useState } from 'react';
import SeoMeta from '../components/SeoMeta';
import { SEO_CONFIG } from '../seo/seoCatalog';

function toTranscriptParagraphs(value) {
  const text = String(value || '').replace(/\r\n/g, '\n').trim();
  if (!text) return [];

  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sentences.length >= 3) {
    const blocks = [];
    for (let i = 0; i < sentences.length; i += 3) {
      blocks.push(sentences.slice(i, i + 3).join(' '));
      if (blocks.length >= 90) break;
    }
    return blocks;
  }

  const words = text.replace(/\s+/g, ' ').split(' ').filter(Boolean);
  if (words.length <= 90) return [words.join(' ')];

  const blocks = [];
  for (let i = 0; i < words.length; i += 75) {
    blocks.push(words.slice(i, i + 75).join(' '));
    if (blocks.length >= 90) break;
  }
  return blocks;
}

function TranscriptSeoPage({ slug, apiUrl, theme = 'light' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');
      setPage(null);
      try {
        const response = await fetch(`${apiUrl}/api/public/transcript/${encodeURIComponent(slug)}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || !data?.success || !data?.data) {
          setError('Transcript page not found.');
          return;
        }
        setPage(data.data);
      } catch (err) {
        if (!active || err?.name === 'AbortError') return;
        setError('Failed to load transcript page.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [apiUrl, slug]);

  const isDark = theme === 'dark';
  const containerClass = isDark
    ? 'bg-[linear-gradient(180deg,#020617_0%,#111827_100%)] text-slate-100'
    : 'bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] text-slate-900';
  const cardClass = isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white';
  const subtleTextClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const linkClass = isDark
    ? 'text-cyan-300 hover:text-cyan-200 underline underline-offset-2'
    : 'text-cyan-700 hover:text-cyan-900 underline underline-offset-2';
  const ctaClass = isDark
    ? 'inline-flex rounded-xl px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition'
    : 'inline-flex rounded-xl px-5 py-2.5 bg-slate-900 text-white font-bold hover:bg-slate-800 transition';

  const transcriptParagraphs = useMemo(
    () => toTranscriptParagraphs(page?.transcript || ''),
    [page?.transcript]
  );

  if (loading) {
    return (
      <main className={`min-h-screen pt-20 ${containerClass}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className={`rounded-2xl border p-6 ${cardClass}`}>
            <p className={subtleTextClass}>Loading transcript page...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <>
        <SeoMeta
          title="Transcript Page Not Found | Transcripta AI"
          description="The transcript page you requested is not available."
          path={`/transcript/${slug}`}
          canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
          robots="noindex, nofollow"
        />
        <main className={`min-h-screen pt-20 ${containerClass}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className={`rounded-2xl border p-6 ${cardClass}`}>
              <h1 className="text-2xl font-black mb-2">Transcript Page Not Found</h1>
              <p className={subtleTextClass}>{error || 'This transcript page is not available.'}</p>
              <a href="/tool" className={`mt-4 ${ctaClass}`}>Go To Main Tool</a>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SeoMeta
        title={page.seoTitle}
        description={page.description}
        keywords={Array.isArray(page.keywords) ? page.keywords.join(', ') : ''}
        path={page.path || `/transcript/${slug}`}
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots={page.robots || 'index, follow'}
        ogType="article"
        publishedTime={page.publishedAt}
        structuredData={page.structuredData}
      />
      <main className={`min-h-screen pt-20 ${containerClass}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <header className={`rounded-2xl border p-6 sm:p-8 ${cardClass}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${subtleTextClass}`}>{page.category}</p>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">{page.h1Title}</h1>
            <p className={`mt-3 text-sm sm:text-base leading-relaxed ${subtleTextClass}`}>{page.description}</p>
            {page.youtubeUrl ? (
              <a href={page.youtubeUrl} rel="noopener noreferrer" className={`mt-3 inline-block text-sm ${linkClass}`}>
                View original YouTube video
              </a>
            ) : null}
          </header>

          <section className={`rounded-2xl border p-6 sm:p-7 ${cardClass}`}>
            <h2 className="text-2xl font-black mb-3">AI Summary</h2>
            <p className={`leading-relaxed ${subtleTextClass}`}>{page.summary}</p>
          </section>

          <section className={`rounded-2xl border p-6 sm:p-7 ${cardClass}`}>
            <h2 className="text-2xl font-black mb-3">Key Takeaways</h2>
            <ul className={`list-disc pl-5 space-y-2 ${subtleTextClass}`}>
              {(Array.isArray(page.keyTakeaways) ? page.keyTakeaways : []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={`rounded-2xl border p-6 sm:p-7 ${cardClass}`}>
            <h2 className="text-2xl font-black mb-3">Full Transcript</h2>
            <div className="space-y-4">
              {transcriptParagraphs.map((paragraph, index) => (
                <p key={`${page.slug}-paragraph-${index}`} className={`leading-relaxed ${subtleTextClass}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className={`rounded-2xl border p-6 sm:p-7 ${cardClass}`}>
            <h2 className="text-2xl font-black mb-3">Related Transcript Pages</h2>
            <ul className="space-y-2">
              {(Array.isArray(page.relatedPages) ? page.relatedPages : []).map((item) => (
                <li key={item.slug}>
                  <a href={item.path} className={linkClass}>{item.title}</a>
                </li>
              ))}
            </ul>
          </section>

          <section className={`rounded-2xl border p-6 sm:p-7 ${isDark ? 'border-cyan-400/30 bg-cyan-950/30' : 'border-cyan-200 bg-cyan-50'}`}>
            <h2 className="text-2xl font-black mb-2">Extract Your Own Transcript</h2>
            <p className={subtleTextClass}>Turn any YouTube video into a transcript, summary, and actionable insights in seconds.</p>
            <a href={page?.cta?.href || '/tool'} className={`mt-4 ${ctaClass}`}>
              {page?.cta?.label || 'Open Transcripta AI'}
            </a>
          </section>
        </div>
      </main>
    </>
  );
}

export default TranscriptSeoPage;
