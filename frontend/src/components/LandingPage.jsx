import { useMemo, useState } from 'react';
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaMoon,
  FaPlayCircle,
  FaQuestionCircle,
  FaQuoteLeft,
  FaSpinner,
  FaSun
} from 'react-icons/fa';
import { LANG } from '../utils/lang';
import { tLanding } from '../i18n';

const GUEST_TOKEN_STORAGE_KEY = 'transcriptai_guest_token_v1';
const GUEST_TRANSCRIPT_PREVIEW_LIMIT = 720;

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

const readApiErrorMessage = (payload, fallback) => {
  const message = payload?.error?.message || payload?.message || payload?.error || '';
  return String(message || fallback || '').trim() || String(fallback || '');
};

const buildGuestToken = () => {
  if (typeof window === 'undefined') return '';
  const existing = String(localStorage.getItem(GUEST_TOKEN_STORAGE_KEY) || '').trim();
  if (/^[A-Za-z0-9_-]{24,120}$/.test(existing)) return existing;
  const randomPart = () => Math.random().toString(36).slice(2, 14);
  const next = `gst_${randomPart()}${randomPart()}${Date.now().toString(36)}`;
  localStorage.setItem(GUEST_TOKEN_STORAGE_KEY, next);
  return next;
};

const buildSummaryPreview = (transcript) => {
  const cleaned = String(transcript || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const sentences = cleaned.split(/(?<=[.!?؟])\s+/).filter(Boolean).slice(0, 3).join(' ');
  return sentences.length > 280 ? `${sentences.slice(0, 277).trim()}...` : sentences;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

function LandingPage({
  onStart,
  onLangChange,
  onToggleTheme,
  lang = LANG.en,
  theme = 'light',
  apiUrl = ''
}) {
  const isDark = theme === 'dark';
  const isArabic = lang === LANG.ar;
  const dir = isArabic ? 'rtl' : 'ltr';

  const [heroUrl, setHeroUrl] = useState('');
  const [heroError, setHeroError] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestResult, setGuestResult] = useState(null);

  const t = (key, fallback = '') => tLanding(lang, key, fallback);

  const heroQuickPoints = asArray(t('hero.quickPoints'));
  const whatYouGetItems = asArray(t('whatYouGet.items'));
  const trustItems = asArray(t('trust.items'));
  const socialStats = asArray(t('socialProof.stats'));
  const testimonials = asArray(t('socialProof.testimonials'));
  const pricingFreeFeatures = asArray(t('pricing.free.features'));
  const pricingProFeatures = asArray(t('pricing.pro.features'));
  const faqItems = asArray(t('faq.items'));

  const summaryPreview = useMemo(() => buildSummaryPreview(guestResult?.transcript || ''), [guestResult?.transcript]);
  const transcriptPreview = useMemo(() => {
    const content = String(guestResult?.transcript || '').trim();
    if (!content) return '';
    return content.length > GUEST_TRANSCRIPT_PREVIEW_LIMIT
      ? `${content.slice(0, GUEST_TRANSCRIPT_PREVIEW_LIMIT).trim()}...`
      : content;
  }, [guestResult?.transcript]);

  const scrollToPricing = () => {
    if (typeof window === 'undefined') return;
    const target = window.document.getElementById('landing-pricing');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSignIn = () => onStart?.({ mode: 'login' });

  const openSignup = () =>
    onStart?.({
      mode: 'signup',
      url: String(guestResult?.sourceUrl || heroUrl || '').trim()
    });

  const runGuestExtraction = async () => {
    const nextUrl = String(heroUrl || '').trim();
    if (!nextUrl) {
      setHeroError(t('hero.errors.empty'));
      return;
    }
    if (!isLikelyYoutubeUrl(nextUrl)) {
      setHeroError(t('hero.errors.invalid'));
      return;
    }
    if (!apiUrl) {
      setHeroError(t('guest.failed'));
      return;
    }

    setHeroError('');
    setGuestLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/public/transcript/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: nextUrl,
          guestToken: buildGuestToken(),
          lang
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) {
        const code = String(payload?.error?.code || '').trim();
        if (code === 'GUEST_LIMIT_REACHED') {
          setHeroError(t('guest.quotaReached'));
          return;
        }
        setHeroError(readApiErrorMessage(payload, t('guest.failed')));
        return;
      }

      setGuestResult({
        videoId: payload.videoId || '',
        videoTitle: payload.videoTitle || payload.videoId || '',
        transcript: payload.transcript || '',
        wordCount: Number(payload.wordCount || 0),
        sourceUrl: nextUrl
      });
    } catch {
      setHeroError(t('guest.failed'));
    } finally {
      setGuestLoading(false);
    }
  };

  const cardSurface = isDark ? 'border-slate-700 bg-slate-900/75' : 'border-slate-200 bg-white/95';

  return (
    <div className="min-h-screen relative overflow-hidden" dir={dir}>
      <div
        className={`absolute inset-0 -z-30 ${
          isDark
            ? 'bg-[linear-gradient(180deg,#020617_0%,#081226_55%,#0f172a_100%)]'
            : 'bg-[linear-gradient(180deg,#f8fbff_0%,#ebf4ff_50%,#eef2ff_100%)]'
        }`}
      />
      <div className="lp-grid absolute inset-0 -z-20 opacity-25" />
      <div className={`lp-glow absolute -top-24 -left-20 w-[340px] h-[340px] rounded-full -z-10 ${isDark ? 'bg-cyan-500/25' : 'bg-cyan-300/40'}`} />
      <div className={`lp-glow absolute top-1/3 -right-20 w-[320px] h-[320px] rounded-full -z-10 ${isDark ? 'bg-blue-500/20' : 'bg-indigo-300/35'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="inline-flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-cyan-500 text-white inline-flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <FaBolt />
            </span>
            <span className="min-w-0">
              <span className={`block font-black text-base sm:text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('brand.name')}</span>
              <span className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('brand.tagline')}</span>
            </span>
          </a>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={scrollToPricing}
              className={`px-3 py-2 text-sm rounded-xl border font-semibold transition ${
                isDark
                  ? 'border-slate-700 text-slate-100 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-800 hover:bg-white'
              }`}
            >
              {t('nav.pricing')}
            </button>

            <button
              type="button"
              onClick={openSignIn}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition ${
                isDark
                  ? 'border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10'
                  : 'border-cyan-300 text-cyan-800 hover:bg-cyan-50'
              }`}
            >
              <FaPlayCircle />
              {t('nav.signIn')}
            </button>

            <button
              type="button"
              onClick={() => onToggleTheme?.()}
              className={`w-10 h-10 rounded-xl inline-flex items-center justify-center border transition ${
                isDark
                  ? 'border-slate-700 text-amber-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-800 hover:bg-white'
              }`}
              title={t('nav.themeToggle')}
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>

            <select
              value={lang}
              onChange={(event) => onLangChange?.(event.target.value)}
              className={`h-10 rounded-xl px-2.5 border text-sm font-bold outline-none transition ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-slate-300 bg-white text-slate-900'
              }`}
              title={t('nav.language')}
            >
              <option value={LANG.en}>EN</option>
              <option value={LANG.ar}>AR</option>
              <option value={LANG.fr}>FR</option>
            </select>
          </div>
        </header>

        <section className="mb-10">
          <div className={`reveal-up rounded-3xl border p-5 sm:p-7 lg:p-9 shadow-xl shadow-slate-900/5 ${cardSurface}`}>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className={`text-xs sm:text-sm font-bold uppercase tracking-[0.18em] mb-3 ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>
                  {t('hero.kicker')}
                </p>
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.16] mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t('hero.headline')}
                </h1>
                <p className={`text-base sm:text-lg leading-relaxed mb-5 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('hero.subheadline')}
                </p>
                <ul className={`space-y-2 text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {heroQuickPoints.map((item, idx) => (
                    <li key={`hero-point-${idx}`} className="flex items-start gap-2">
                      <FaCheckCircle className="mt-1 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`reveal-up delay-1 rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-slate-700 bg-slate-950/55' : 'border-slate-200 bg-slate-50/95'}`}>
                <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {t('hero.inputLabel')}
                </label>
                <input
                  type="text"
                  value={heroUrl}
                  onChange={(event) => setHeroUrl(event.target.value)}
                  placeholder={t('hero.inputPlaceholder')}
                  className={`w-full h-12 rounded-xl border px-4 outline-none transition shadow-sm ${
                    isDark
                      ? 'border-slate-600 bg-slate-950 text-slate-100 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20'
                  }`}
                  dir="ltr"
                />

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={runGuestExtraction}
                    disabled={guestLoading}
                    className="h-11 w-full rounded-xl bg-cyan-500 text-white font-extrabold hover:bg-cyan-600 transform-gpu transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {guestLoading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        {t('guest.loading')}
                      </span>
                    ) : (
                      t('hero.primaryCta')
                    )}
                  </button>

                  <p className={`text-xs text-center font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('hero.trustLine')}</p>
                  <p className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('hero.helper')}</p>
                  {guestLoading ? <p className={`text-xs text-center ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>{t('hero.loadingHint')}</p> : null}
                </div>

                {heroError ? (
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2">
                    {heroError}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {guestResult ? (
          <section className="mb-10 reveal-up delay-1">
            <div className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-cyan-700/70 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50/85'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${isDark ? 'bg-cyan-500/20 text-cyan-100' : 'bg-cyan-100 text-cyan-800'}`}>
                  {t('guest.resultBadge')}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('guest.wordCount')}: <strong>{guestResult.wordCount || 0}</strong>
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <article className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                  <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('guest.videoTitle')}</h3>
                  <p className={`font-black text-base sm:text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{guestResult.videoTitle || '-'}</p>
                </article>

                <article className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                  <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('guest.summaryPreview')}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{summaryPreview || '-'}</p>
                </article>
              </div>

              <article className={`mt-4 rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('guest.transcriptPreview')}</h3>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{transcriptPreview || '-'}</p>
              </article>

              <div className={`mt-4 rounded-xl border p-4 ${isDark ? 'border-amber-600/70 bg-amber-900/20' : 'border-amber-200 bg-amber-50'}`}>
                <p className={`text-sm mb-3 ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>{t('guest.signupPrompt')}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openSignup}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transform-gpu transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
                  >
                    {t('guest.createAccount')}
                    <FaArrowRight className={isArabic ? 'rotate-180' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={openSignIn}
                    className={`px-4 py-2 rounded-xl border font-semibold transition ${
                      isDark
                        ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-800 hover:bg-white'
                    }`}
                  >
                    {t('guest.haveAccount')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('whatYouGet.title')}</h2>
          <p className={`mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('whatYouGet.subtitle')}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {whatYouGetItems.map((item, idx) => (
              <article
                key={`benefit-${idx}`}
                className={`lp-card rounded-2xl border p-5 ${isDark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 inline-flex items-center justify-center mb-3">
                  <FaCheckCircle />
                </div>
                <h3 className={`font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item?.title || ''}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item?.text || ''}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('trust.title')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {trustItems.map((item, idx) => (
              <article
                key={`trust-${idx}`}
                className={`lp-card rounded-2xl border p-5 ${isDark ? 'border-slate-700/90 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}
              >
                <h3 className={`font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{item?.title || ''}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item?.text || ''}</p>
              </article>
            ))}
          </div>

          <div className={`mt-6 rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-cyan-700/70 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50/80'}`}>
            <h3 className={`text-xl sm:text-2xl font-black mb-4 ${isDark ? 'text-cyan-100' : 'text-slate-900'}`}>{t('socialProof.title')}</h3>

            <div className="grid gap-3 sm:grid-cols-3 mb-5">
              {socialStats.map((item, idx) => (
                <article
                  key={`social-stat-${idx}`}
                  data-stat-id={item?.id || `stat-${idx}`}
                  className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}
                >
                  <p className={`text-xl sm:text-2xl font-black ${isDark ? 'text-cyan-100' : 'text-cyan-700'}`}>{item?.value || ''}</p>
                  {item?.label ? <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.label}</p> : null}
                </article>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {testimonials.map((item, idx) => (
                <article
                  key={`testimonial-${idx}`}
                  className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white/90'}`}
                >
                  <FaQuoteLeft className={`${isDark ? 'text-cyan-300' : 'text-cyan-700'} mb-2`} />
                  <p className={`text-sm leading-relaxed mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item?.quote || ''}</p>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item?.role || ''}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="landing-pricing" className="mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('pricing.title')}</h2>
          <p className={`mb-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('pricing.subtitle')}</p>

          <div className="grid gap-4 lg:grid-cols-2 items-stretch">
            <article className={`rounded-2xl border p-6 h-full flex flex-col ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
                {t('pricing.free.badge')}
              </span>
              <p className={`mt-3 text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('pricing.free.limit')}</p>
              <ul className={`mt-4 space-y-2 text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {pricingFreeFeatures.map((feature, idx) => (
                  <li key={`free-feature-${idx}`} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={openSignup}
                className={`mt-5 w-full h-11 rounded-xl border font-bold transition ${
                  isDark
                    ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-800 hover:bg-slate-50'
                }`}
              >
                {t('pricing.free.button')}
              </button>
            </article>

            <article className={`rounded-2xl border p-6 relative overflow-hidden h-full flex flex-col ${isDark ? 'border-cyan-500/70 bg-slate-900/85 shadow-xl shadow-cyan-500/10' : 'border-cyan-300 bg-cyan-50/75 shadow-lg shadow-cyan-100/60'}`}>
              <div className={`absolute inset-x-0 top-0 h-1 ${isDark ? 'bg-cyan-400/80' : 'bg-cyan-500'}`} />
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${isDark ? 'bg-cyan-500/20 text-cyan-100' : 'bg-cyan-100 text-cyan-800'}`}>
                  {t('pricing.pro.badge')}
                </span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${isDark ? 'bg-amber-500/20 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
                  {t('pricing.pro.popularBadge')}
                </span>
              </div>

              <p className={`mt-3 text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('pricing.pro.limit')}</p>
              <p className={`mt-2 text-3xl sm:text-4xl font-black ${isDark ? 'text-cyan-100' : 'text-cyan-800'}`}>{t('pricing.pro.price')}</p>
              <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${isDark ? 'bg-amber-500/20 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
                {t('pricing.pro.promo')}
              </p>
              <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('pricing.pro.valueSummary')}</p>

              <ul className={`mt-4 space-y-2 text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {pricingProFeatures.map((feature, idx) => (
                  <li key={`pro-feature-${idx}`} className="flex items-start gap-2">
                    <FaCheckCircle className="mt-0.5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={openSignup}
                className="mt-5 w-full h-11 rounded-xl bg-cyan-500 text-white font-extrabold hover:bg-cyan-600 transform-gpu transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                {t('pricing.pro.button')}
              </button>
            </article>
          </div>
        </section>

        <section className="mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('faq.title')}</h2>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details
                key={`faq-${idx}`}
                className={`rounded-xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900/70 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
              >
                <summary className="cursor-pointer font-bold flex items-center gap-2">
                  <FaQuestionCircle className={`${isDark ? 'text-cyan-300' : 'text-cyan-700'}`} />
                  <span>{item?.q || ''}</span>
                </summary>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item?.a || ''}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={`rounded-3xl border p-6 sm:p-8 text-center ${isDark ? 'border-cyan-800/80 bg-cyan-950/25' : 'border-cyan-200 bg-cyan-50/80'}`}>
          <h2 className={`text-2xl sm:text-3xl font-black mb-3 ${isDark ? 'text-cyan-100' : 'text-slate-900'}`}>{t('finalCta.headline')}</h2>
          <button
            type="button"
            onClick={openSignup}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transform-gpu transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30 font-extrabold"
          >
            {t('finalCta.button')}
            <FaArrowRight className={isArabic ? 'rotate-180' : ''} />
          </button>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
