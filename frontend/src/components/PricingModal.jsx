import { useMemo, useState } from 'react';
import { FaBolt, FaCheck, FaCrown, FaLeaf, FaCreditCard } from 'react-icons/fa';
import { cleanText, LANG, tr } from '../utils/lang';

const PRICE_PER_PACK_USD = 19;
const PRICE_PER_PACK_EGP = 890;
const VIDEOS_PER_PACK = 200;
const QUICK_PACKS = [1, 2, 3, 5];
const BONUS_PACKS = new Set([2, 3, 5]);
const BONUS_RATE = 0.1;

function calculateQuote(packCount) {
  const packs = Number(packCount || 0);
  if (!Number.isFinite(packs) || packs < 1 || !Number.isInteger(packs)) {
    return { valid: false, message: 'Invalid pack count' };
  }

  const amountUsd = packs * PRICE_PER_PACK_USD;
  const amountEgp = packs * PRICE_PER_PACK_EGP;
  const baseVideos = packs * VIDEOS_PER_PACK;
  const bonusRate = BONUS_PACKS.has(packs) ? BONUS_RATE : 0;
  const bonusVideos = Math.round(baseVideos * bonusRate);
  const videos = baseVideos + bonusVideos;
  return {
    valid: true,
    packs,
    amountUsd,
    amountEgp,
    amountCents: amountEgp * 100,
    videos,
    baseVideos,
    bonusVideos,
    credits: videos,
    baseCredits: baseVideos,
    bonusRate,
    bonusCredits: bonusVideos
  };
}

function PricingModal({
  isOpen,
  onClose,
  user,
  requireLogin,
  lang = LANG.ar,
  theme = 'light',
  onNotify,
  onProceed
}) {
  const [packCount, setPackCount] = useState(1);
  const [isProcessingPaymob, setIsProcessingPaymob] = useState(false);
  const quote = useMemo(() => calculateQuote(packCount), [packCount]);
  const isDark = theme === 'dark';

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, cleanText(message));
  };

  if (!isOpen) return null;

  const handleContinueLocal = () => {
    if (!user) {
      requireLogin?.();
      return;
    }

    if (!quote.valid) {
      notify(
        'error',
        tr(
          lang,
          'اختر عدد باقات صحيح (1 أو أكثر).',
          'Choose a valid pack count (1 or more).',
          'Choisissez un nombre de packs valide (1 ou plus).'
        )
      );
      return;
    }

    onProceed?.(quote);
  };

  const handleContinueGlobal = async () => {
    if (!user) {
      requireLogin?.();
      return;
    }
    if (!quote.valid) return;

    try {
      setIsProcessingPaymob(true);
      const res = await fetch('/api/paymob/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packCount: quote.packs })
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        const errorMsg = typeof data.error === 'object' ? data.error?.message : data.error;
        notify('error', errorMsg || tr(lang, 'حدث خطأ في تجهيز الدفع', 'Error preparing payment', 'Erreur de preparation du paiement'));
      }
    } catch {
      notify('error', tr(lang, 'فشل الاتصال بالخادم', 'Server connection failed', 'Echec de connexion au serveur'));
    } finally {
      setIsProcessingPaymob(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 overflow-y-auto p-3 sm:p-4">
      <div className="min-h-full flex items-start justify-center">
        <div
          className={`rounded-2xl shadow-xl w-full max-w-4xl p-4 sm:p-6 md:p-8 relative my-2 sm:my-6 ${
            isDark ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-gray-50 text-slate-900'
          }`}
          dir={lang === LANG.ar ? 'rtl' : 'ltr'}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 ${lang === LANG.ar ? 'left-4' : 'right-4'} rounded-full px-3 py-1 shadow-sm transition ${
              isDark ? 'text-slate-300 hover:text-white bg-slate-800' : 'text-gray-500 hover:text-gray-900 bg-white'
            }`}
          >
            X
          </button>

          <div className="text-center max-w-3xl mx-auto mb-7">
            <h2 className={`text-3xl font-extrabold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              {tr(lang, 'خطط الفيديوهات', 'Video Plans', 'Packs videos')}
            </h2>
            <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
              {tr(
                lang,
                'ترانسكريبتا منصة لاستخراج المعرفة وتحويلها إلى خطوات قابلة للتطبيق. التسعير مبني بوضوح على عدد الفيديوهات.',
                'Transcripta is a knowledge extraction and implementation platform. Pricing is clear and video-based.',
                'Transcripta est une plateforme dextraction de connaissance et dimplementation. La tarification est claire et basee sur les videos.'
              )}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <article className={`rounded-2xl border p-5 ${isDark ? 'border-emerald-800 bg-emerald-950/25' : 'border-emerald-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {tr(lang, 'الخطة المجانية', 'Free Plan', 'Plan gratuit')}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 bg-emerald-100 text-emerald-800">
                  <FaLeaf /> {tr(lang, 'نشطة', 'Active', 'Actif')}
                </span>
              </div>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600" />
                  {tr(lang, '5 فيديوهات شهريًا', '5 videos monthly', '5 videos par mois')}
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600" />
                  {tr(lang, 'كل فيديو جديد = 1 فيديو من الرصيد', 'Each new video uses 1 video from balance', 'Chaque nouvelle video consomme 1 video du solde')}
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600" />
                  {tr(lang, 'نفس الفيديو: ملخص وشات بدون خصم إضافي', 'Same-video summary/chat has no extra charge', 'Resume/chat meme video sans cout supplementaire')}
                </li>
              </ul>
            </article>

            <article className={`rounded-2xl border p-5 ${isDark ? 'border-amber-800 bg-amber-950/25' : 'border-amber-300 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {tr(lang, 'الباقة المدفوعة', 'Paid Pack', 'Pack payant')}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 bg-amber-100 text-amber-800">
                  <FaCrown /> {tr(lang, '200 فيديو', '200 videos', '200 videos')}
                </span>
              </div>

              <label className="block text-sm font-semibold mb-2">
                {tr(lang, 'عدد الباقات', 'Number of packs', 'Nombre de packs')}
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={packCount}
                onChange={(e) => setPackCount(Number(e.target.value || 0))}
                className={`w-full border rounded-xl px-3 py-2 mb-3 ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
              />

              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_PACKS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPackCount(count)}
                    className={`rounded-full px-3 py-1 text-xs border ${
                      Number(packCount) === count
                        ? 'bg-slate-900 text-white border-slate-900'
                        : isDark
                          ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                          : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {count}x
                  </button>
                ))}
              </div>

              <p className={`text-xs mb-3 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                {tr(lang, 'بونص 10% تلقائي للباقات: 2x و3x و5x', '10% bonus on packs: 2x, 3x, and 5x', 'Bonus 10 % sur les packs : 2x, 3x et 5x')}
              </p>

              {!quote.valid ? (
                <p className="text-sm text-red-500">
                  {tr(lang, 'العدد غير صالح. اختر 1 أو أكثر.', 'Invalid count. Choose 1 or more.', 'Nombre invalide. Choisissez 1 ou plus.')}
                </p>
              ) : (
                <div className={`rounded-xl border p-3 text-sm ${isDark ? 'border-amber-800 bg-amber-950/35 text-amber-100' : 'border-amber-200 bg-amber-50 text-slate-800'}`}>
                  <p className="font-bold text-base mb-1">
                    {tr(lang, 'الإجمالي:', 'Total:', 'Total:')} {quote.videos} {tr(lang, 'فيديو', 'videos', 'videos')}
                  </p>
                  <p>{tr(lang, 'الأساسي:', 'Base:', 'Base:')} {quote.baseVideos} {tr(lang, 'فيديو', 'videos', 'videos')}</p>
                  {quote.bonusVideos > 0 ? (
                    <p>
                      {tr(lang, 'البونص:', 'Bonus:', 'Bonus:')} +{quote.bonusVideos} {tr(lang, 'فيديو', 'videos', 'videos')} ({Math.round(quote.bonusRate * 100)}%)
                    </p>
                  ) : null}
                  <p>{tr(lang, 'السعر لكل باقة:', 'Price per pack:', 'Prix par pack:')} ${PRICE_PER_PACK_USD}</p>
                  <p>{tr(lang, 'عدد الباقات:', 'Packs:', 'Packs:')} {quote.packs}</p>
                  <p>{tr(lang, 'السعر الكلي:', 'Total price:', 'Prix total:')} ${quote.amountUsd}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleContinueLocal}
                  disabled={!quote.valid || isProcessingPaymob}
                  className="flex-1 rounded-xl py-3 bg-orange-600 text-white font-bold hover:bg-orange-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <FaBolt />
                  <span>{tr(lang, 'متابعة الدفع المحلي', 'Continue to Local Payment', 'Paiement Local')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleContinueGlobal}
                  disabled={!quote.valid || isProcessingPaymob}
                  className="flex-1 rounded-xl py-3 bg-slate-800 text-white font-bold hover:bg-slate-900 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <FaCreditCard />
                  <span>{isProcessingPaymob ? tr(lang, 'جاري التحويل...', 'Redirecting...', 'Redirection...') : tr(lang, 'الدفع بالبطاقة (دولي)', 'Pay with Card (Global)', 'Payer par Carte (Global)')}</span>
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
