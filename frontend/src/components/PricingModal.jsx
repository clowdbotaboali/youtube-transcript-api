import { useState } from 'react';
import { FaBolt, FaCheck, FaCrown, FaLeaf } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { LANG, tr } from '../utils/lang';

const METHODS = [
  { value: 'instapay', ar: 'إنستا باي', en: 'InstaPay', fr: 'InstaPay' },
  { value: 'vodafone_cash', ar: 'فودافون كاش', en: 'Vodafone Cash', fr: 'Vodafone Cash' }
];

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

function calculateQuote(amountUsd) {
  const amount = Number(amountUsd || 0);
  if (!Number.isFinite(amount)) {
    return { valid: false, message: 'Invalid amount' };
  }
  if (amount < 5 || amount % 5 !== 0) {
    return { valid: false, message: 'Amount must be multiple of $5' };
  }

  const packs = amount / 5;
  const baseCredits = packs * 200;
  let bonusRate = 0;
  if (packs >= 20) bonusRate = 0.25;
  else if (packs >= 10) bonusRate = 0.18;
  else if (packs >= 4) bonusRate = 0.1;
  else if (packs >= 2) bonusRate = 0.05;

  const credits = Math.round(baseCredits * (1 + bonusRate));
  return {
    valid: true,
    amountUsd: amount,
    amountCents: amount * 100,
    packs,
    baseCredits,
    bonusRate,
    bonusCredits: credits - baseCredits,
    credits
  };
}

function PricingModal({
  isOpen,
  onClose,
  user,
  apiUrl = defaultApiUrl,
  requireLogin,
  lang = LANG.ar,
  theme = 'light',
  onNotify
}) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('instapay');
  const [payerContact, setPayerContact] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [amountUsd, setAmountUsd] = useState(5);

  const isDark = theme === 'dark';

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, message);
  };

  const quote = calculateQuote(amountUsd);

  if (!isOpen) return null;

  const handleSubmitTopup = async () => {
    if (!user) {
      requireLogin();
      return;
    }
    if (!quote.valid) {
      notify(
        'error',
        tr(
          lang,
          'المبلغ يجب أن يكون مضاعفات 5 دولار (5، 10، 15...)',
          'Amount must be in $5 increments (5, 10, 15...)',
          'Le montant doit etre par tranches de 5 $ (5, 10, 15...)'
        )
      );
      return;
    }

    setLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/billing/create-topup-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          amountCents: quote.amountCents,
          method,
          payerContact: payerContact.trim() || null,
          transferReference: transferReference.trim() || null
        })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        notify(
          'success',
          tr(
            lang,
            `تم إرسال الطلب بنجاح: ${data.quote?.credits ?? quote.credits} كريديت مقابل $${quote.amountUsd}.`,
            `Top-up request submitted: ${data.quote?.credits ?? quote.credits} credits for $${quote.amountUsd}.`,
            `Demande envoyee: ${data.quote?.credits ?? quote.credits} credits pour $${quote.amountUsd}.`
          )
        );
        onClose();
      } else {
        notify(
          'error',
          tr(
            lang,
            `خطأ: ${data.error || 'فشل إرسال الطلب'}`,
            `Error: ${data.error || 'Request failed'}`,
            `Erreur: ${data.error || 'Echec de la demande'}`
          )
        );
      }
    } catch {
      notify('error', tr(lang, 'فشل الاتصال بالخادم.', 'Connection failed.', 'Echec de connexion.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 overflow-y-auto">
      <div
        className={`rounded-2xl shadow-xl w-full max-w-5xl p-6 md:p-8 relative mt-10 md:mt-0 ${
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
            {tr(lang, 'الخطط والشحن', 'Plans & Top-up', 'Plans et recharge')}
          </h2>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
            {tr(
              lang,
              'الخطة المجانية: 5 روابط فيديو فقط. التلخيص والشات لنفس الفيديو بدون خصم إضافي.',
              'Free plan: 5 video links only. Summary and chat on the same video are free.',
              'Plan gratuit: 5 liens video uniquement. Resume et chat sur la meme video sans cout supplementaire.'
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
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
                {tr(lang, '5 روابط فيديو كبداية', '5 video links included', '5 liens video inclus')}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-emerald-600" />
                {tr(lang, 'كل رابط جديد = 1 كريديت', 'Each new video link costs 1 credit', 'Chaque nouveau lien coute 1 credit')}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-emerald-600" />
                {tr(lang, 'التلخيص والشات لنفس الفيديو بدون خصم', 'Same-video summary/chat has no extra charge', 'Resume/chat de la meme video sans cout supplementaire')}
              </li>
            </ul>
          </article>

          <article className={`rounded-2xl border p-5 ${isDark ? 'border-amber-800 bg-amber-950/25' : 'border-amber-300 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'الشحن المدفوع', 'Paid Top-up', 'Recharge payante')}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 bg-amber-100 text-amber-800">
                <FaCrown /> {tr(lang, 'مرن', 'Flexible', 'Flexible')}
              </span>
            </div>

            <label className="block text-sm font-semibold mb-2">
              {tr(lang, 'المبلغ بالدولار (مضاعفات 5)', 'Amount in USD ($5 increments)', 'Montant en USD (tranches de 5 $)')}
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={amountUsd}
              onChange={(e) => setAmountUsd(Number(e.target.value || 0))}
              className={`w-full border rounded-lg px-3 py-2 mb-3 ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white'}`}
            />

            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setAmountUsd(amount)}
                  className={`rounded-full px-3 py-1 text-xs border ${
                    Number(amountUsd) === amount
                      ? 'bg-slate-900 text-white border-slate-900'
                      : isDark
                        ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                        : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {!quote.valid ? (
              <p className="text-sm text-red-500">
                {tr(lang, 'المبلغ غير صالح. اختر 5$ أو مضاعفاتها.', 'Invalid amount. Choose $5 or its multiples.', 'Montant invalide. Choisissez 5 $ ou ses multiples.')}
              </p>
            ) : (
              <div className={`rounded-xl border p-3 text-sm ${isDark ? 'border-amber-800 bg-amber-950/35 text-amber-100' : 'border-amber-200 bg-amber-50 text-slate-800'}`}>
                <p className="font-bold text-base mb-1">
                  {tr(lang, 'الإجمالي:', 'Total:', 'Total:')} {quote.credits} {tr(lang, 'كريديت', 'credits', 'credits')}
                </p>
                <p>{tr(lang, 'الأساسي:', 'Base:', 'Base:')} {quote.baseCredits} {tr(lang, 'كريديت', 'credits', 'credits')}</p>
                <p>{tr(lang, 'المكافأة:', 'Bonus:', 'Bonus:')} {quote.bonusCredits} {tr(lang, 'كريديت', 'credits', 'credits')} ({Math.round(quote.bonusRate * 100)}%)</p>
                <p>{tr(lang, 'السعر:', 'Price:', 'Prix:')} ${quote.amountUsd}</p>
              </div>
            )}
          </article>
        </div>

        <div className={`rounded-xl border p-4 mb-6 ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'}`}>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'وسيلة الدفع', 'Payment method', 'Methode de paiement')}</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}>
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {lang === LANG.ar ? m.ar : lang === LANG.fr ? m.fr : m.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'رقم المُرسل/المحفظة', 'Sender/wallet number', 'Numero expediteur/portefeuille')}</label>
              <input
                value={payerContact}
                onChange={(e) => setPayerContact(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}
                placeholder={tr(lang, 'اختياري', 'Optional', 'Optionnel')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'مرجع التحويل', 'Transfer reference', 'Reference de transfert')}</label>
              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}
                placeholder={tr(lang, 'اختياري', 'Optional', 'Optionnel')}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitTopup}
          disabled={loading || !quote.valid}
          className="w-full rounded-xl py-3 bg-orange-600 text-white font-bold hover:bg-orange-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <FaBolt />
          <span>
            {loading
              ? tr(lang, 'جارٍ إرسال الطلب...', 'Submitting request...', 'Envoi de la demande...')
              : tr(lang, 'إرسال طلب الشحن', 'Submit top-up request', 'Envoyer la demande')}
          </span>
        </button>
      </div>
    </div>
  );
}

export default PricingModal;
