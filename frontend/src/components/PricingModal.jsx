import { useEffect, useMemo, useState } from 'react';
import { FaBolt, FaCheck, FaCrown, FaLeaf, FaUpload } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { formatApiErrorMessage } from '../utils/apiError';
import { cleanText, LANG, tr } from '../utils/lang';

const METHODS = [
  { value: 'instapay', ar: '\u0625\u0646\u0633\u062A\u0627 \u0628\u0627\u064A', en: 'InstaPay', fr: 'InstaPay' },
  { value: 'vodafone_cash', ar: '\u0641\u0648\u062F\u0627\u0641\u0648\u0646 \u0643\u0627\u0634', en: 'Vodafone Cash', fr: 'Vodafone Cash' }
];

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];
const MAX_PROOF_SIZE = 3 * 1024 * 1024;

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

function statusBadge(status, lang) {
  const value = String(status || '').toLowerCase();
  if (value === 'approved') return tr(lang, 'Ù…Ù‚Ø¨ÙˆÙ„', 'Approved', 'Approuve');
  if (value === 'rejected') return tr(lang, 'Ù…Ø±ÙÙˆØ¶', 'Rejected', 'Rejete');
  return tr(lang, 'Ù…Ø¹Ù„Ù‘Ù‚', 'Pending', 'En attente');
}

function PricingModal({
  isOpen,
  onClose,
  user,
  apiUrl = defaultApiUrl,
  requireLogin,
  lang = LANG.ar,
  theme = 'light',
  onNotify,
  onTopupSubmitted
}) {
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [method, setMethod] = useState('instapay');
  const [payerContact, setPayerContact] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [amountUsd, setAmountUsd] = useState(5);
  const [userNote, setUserNote] = useState('');
  const [proofImageDataUrl, setProofImageDataUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [billingConfig, setBillingConfig] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  const isDark = theme === 'dark';

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, cleanText(message));
  };

  const quote = useMemo(() => calculateQuote(amountUsd), [amountUsd]);

  const loadBillingContext = async () => {
    if (!user) return;
    setLoadingContext(true);
    try {
      const authHeaders = await getAuthHeaders();
      const [configResponse, requestsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/billing/config`, { headers: authHeaders }),
        fetch(`${apiUrl}/api/billing/my-requests`, { headers: authHeaders })
      ]);

      const configData = await configResponse.json().catch(() => ({}));
      const requestsData = await requestsResponse.json().catch(() => ({}));

      if (configResponse.ok && configData.success) {
        const incoming = configData.data || null;
        setBillingConfig(
          incoming
            ? {
                ...incoming,
                accountName: cleanText(incoming.accountName),
                instapayHandle: cleanText(incoming.instapayHandle),
                vodafoneCashNumber: cleanText(incoming.vodafoneCashNumber),
                supportContact: cleanText(incoming.supportContact),
                instructionsAr: cleanText(incoming.instructionsAr),
                instructionsEn: cleanText(incoming.instructionsEn),
                instructionsFr: cleanText(incoming.instructionsFr)
              }
            : null
        );
      }
      if (requestsResponse.ok && requestsData.success) {
        setMyRequests(Array.isArray(requestsData.data) ? requestsData.data : []);
      }
    } catch {
      notify('error', tr(lang, 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯ÙØ¹.', 'Failed to load billing data.', 'Echec du chargement des donnees de paiement.'));
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !user) return;
    loadBillingContext();
  }, [isOpen, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleProofChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProofImageDataUrl('');
      setProofFileName('');
      return;
    }
    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      notify('error', tr(lang, 'ØµÙŠØºØ© Ø§Ù„ØµÙˆØ±Ø© ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…Ø© (PNG/JPEG/WEBP).', 'Unsupported image type (PNG/JPEG/WEBP).', 'Format d image non pris en charge (PNG/JPEG/WEBP).'));
      event.target.value = '';
      return;
    }
    if (file.size > MAX_PROOF_SIZE) {
      notify('error', tr(lang, 'Ø­Ø¬Ù… Ø§Ù„ØµÙˆØ±Ø© Ø£ÙƒØ¨Ø± Ù…Ù† 3MB.', 'Image is larger than 3MB.', 'L image depasse 3 Mo.'));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImageDataUrl(String(reader.result || ''));
      setProofFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const resetFormAfterSubmit = () => {
    setPayerContact('');
    setTransferReference('');
    setUserNote('');
    setProofImageDataUrl('');
    setProofFileName('');
  };

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
          'Ø§Ù„Ù…Ø¨Ù„Øº ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ù…Ø¶Ø§Ø¹ÙØ§Øª 5 Ø¯ÙˆÙ„Ø§Ø± (5ØŒ 10ØŒ 15...)',
          'Amount must be in $5 increments (5, 10, 15...)',
          'Le montant doit etre par tranches de 5 $ (5, 10, 15...)'
        )
      );
      return;
    }
    if (!proofImageDataUrl) {
      notify(
        'error',
        tr(
          lang,
          'Ø§Ø±ÙØ¹ ØµÙˆØ±Ø© Ø¥Ø«Ø¨Ø§Øª Ø§Ù„ØªØ­ÙˆÙŠÙ„ Ù‚Ø¨Ù„ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨.',
          'Upload transfer proof before submitting.',
          'Telechargez la preuve du transfert avant d envoyer.'
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
          transferReference: transferReference.trim() || null,
          userNote: userNote.trim() || null,
          proofImageDataUrl
        })
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        notify(
          'success',
          tr(
            lang,
            `ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø´Ø­Ù† Ø¨Ù†Ø¬Ø§Ø­ (${data.quote?.credits ?? quote.credits} ÙƒØ±ÙŠØ¯ÙŠØª).`,
            `Top-up request submitted (${data.quote?.credits ?? quote.credits} credits).`,
            `Demande envoyee (${data.quote?.credits ?? quote.credits} credits).`
          )
        );
        resetFormAfterSubmit();
        await loadBillingContext();
        if (typeof onTopupSubmitted === 'function') onTopupSubmitted(data);
      } else {
        notify(
          'error',
          formatApiErrorMessage({
            payload: data,
            status: response.status,
            lang,
            fallbackAr: 'فشل إرسال طلب الشحن.',
            fallbackEn: 'Top-up request failed.',
            fallbackFr: 'La demande de recharge a echoue.'
          })
        );
      }
    } catch {
      notify('error', tr(lang, 'ÙØ´Ù„ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ø§Ù„Ø®Ø§Ø¯Ù….', 'Connection failed.', 'Echec de connexion.'));
    } finally {
      setLoading(false);
    }
  };

  const requestLocale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  const selectedMethodData = METHODS.find((item) => item.value === method) || METHODS[0];
  const methodName = cleanText(
    lang === LANG.ar ? selectedMethodData.ar : lang === LANG.fr ? selectedMethodData.fr : selectedMethodData.en
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto p-2 sm:p-4">
      <div className="min-h-full flex items-start justify-center">
        <div
          className={`rounded-2xl shadow-xl w-full max-w-6xl p-4 sm:p-6 md:p-8 relative my-2 sm:my-6 max-h-[94vh] overflow-y-auto ${
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
            {tr(lang, 'Ø§Ù„Ø®Ø·Ø· ÙˆØ§Ù„Ø´Ø­Ù†', 'Plans & Top-up', 'Plans et recharge')}
          </h2>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
            {tr(
              lang,
              'Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©: 5 Ø±ÙˆØ§Ø¨Ø· ÙÙŠØ¯ÙŠÙˆ ÙÙ‚Ø·. Ø§Ù„ØªÙ„Ø®ÙŠØµ ÙˆØ§Ù„Ø´Ø§Øª Ù„Ù†ÙØ³ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø¨Ø¯ÙˆÙ† Ø®ØµÙ… Ø¥Ø¶Ø§ÙÙŠ.',
              'Free plan: 5 video links only. Summary and chat on the same video are free.',
              'Plan gratuit: 5 liens video uniquement. Resume et chat sur la meme video sans cout supplementaire.'
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <article className={`rounded-2xl border p-5 ${isDark ? 'border-emerald-800 bg-emerald-950/25' : 'border-emerald-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©', 'Free Plan', 'Plan gratuit')}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 bg-emerald-100 text-emerald-800">
                <FaLeaf /> {tr(lang, 'Ù†Ø´Ø·Ø©', 'Active', 'Actif')}
              </span>
            </div>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <li className="flex items-center gap-2">
                <FaCheck className="text-emerald-600" />
                {tr(lang, '5 Ø±ÙˆØ§Ø¨Ø· ÙÙŠØ¯ÙŠÙˆ ÙƒØ¨Ø¯Ø§ÙŠØ©', '5 video links included', '5 liens video inclus')}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-emerald-600" />
                {tr(lang, 'ÙƒÙ„ Ø±Ø§Ø¨Ø· ÙÙŠØ¯ÙŠÙˆ Ø¬Ø¯ÙŠØ¯ = 1 ÙƒØ±ÙŠØ¯ÙŠØª', 'Each new video link costs 1 credit', 'Chaque nouveau lien coute 1 credit')}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-emerald-600" />
                {tr(lang, 'Ù†ÙØ³ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ: ØªÙ„Ø®ÙŠØµ ÙˆØ´Ø§Øª Ø¨Ø¯ÙˆÙ† Ø®ØµÙ… Ø¥Ø¶Ø§ÙÙŠ', 'Same-video summary/chat has no extra charge', 'Resume/chat sur la meme video sans cout supplementaire')}
              </li>
            </ul>
          </article>

          <article className={`rounded-2xl border p-5 ${isDark ? 'border-amber-800 bg-amber-950/25' : 'border-amber-300 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'Ø§Ù„Ø´Ø­Ù† Ø§Ù„Ù…Ø¯ÙÙˆØ¹', 'Paid Top-up', 'Recharge payante')}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1 bg-amber-100 text-amber-800">
                <FaCrown /> {tr(lang, 'Ù…Ø±Ù†', 'Flexible', 'Flexible')}
              </span>
            </div>

            <label className="block text-sm font-semibold mb-2">
              {tr(lang, 'Ø§Ù„Ù…Ø¨Ù„Øº Ø¨Ø§Ù„Ø¯ÙˆÙ„Ø§Ø± (Ù…Ø¶Ø§Ø¹ÙØ§Øª 5)', 'Amount in USD ($5 increments)', 'Montant en USD (tranches de 5 $)')}
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
                {tr(lang, 'Ø§Ù„Ù…Ø¨Ù„Øº ØºÙŠØ± ØµØ§Ù„Ø­. Ø§Ø®ØªØ± 5$ Ø£Ùˆ Ù…Ø¶Ø§Ø¹ÙØ§ØªÙ‡Ø§.', 'Invalid amount. Choose $5 or its multiples.', 'Montant invalide. Choisissez 5 $ ou ses multiples.')}
              </p>
            ) : (
              <div className={`rounded-xl border p-3 text-sm ${isDark ? 'border-amber-800 bg-amber-950/35 text-amber-100' : 'border-amber-200 bg-amber-50 text-slate-800'}`}>
                <p className="font-bold text-base mb-1">
                  {tr(lang, 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ:', 'Total:', 'Total:')} {quote.credits} {tr(lang, 'ÙƒØ±ÙŠØ¯ÙŠØª', 'credits', 'credits')}
                </p>
                <p>{tr(lang, 'Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ:', 'Base:', 'Base:')} {quote.baseCredits} {tr(lang, 'ÙƒØ±ÙŠØ¯ÙŠØª', 'credits', 'credits')}</p>
                <p>{tr(lang, 'Ø§Ù„Ù…ÙƒØ§ÙØ£Ø©:', 'Bonus:', 'Bonus:')} {quote.bonusCredits} {tr(lang, 'ÙƒØ±ÙŠØ¯ÙŠØª', 'credits', 'credits')} ({Math.round(quote.bonusRate * 100)}%)</p>
                <p>{tr(lang, 'Ø§Ù„Ø³Ø¹Ø±:', 'Price:', 'Prix:')} ${quote.amountUsd}</p>
              </div>
            )}
          </article>
        </div>

        <div className={`rounded-xl border p-4 mb-6 ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-black text-base">{tr(lang, 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¯ÙØ¹ ÙˆØ±ÙØ¹ Ø§Ù„Ø¥Ø«Ø¨Ø§Øª', 'Payment details & proof upload', 'Details de paiement et preuve')}</h3>
            {loadingContext ? <span className="text-xs opacity-70">{tr(lang, 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ø¯ÙŠØ«...', 'Refreshing...', 'Actualisation...')}</span> : null}
          </div>

          <div className={`rounded-lg border p-3 mb-4 ${isDark ? 'border-cyan-800 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50'}`}>
            <p className="text-sm font-semibold mb-2">
              {tr(lang, 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø­Ø§Ù„ÙŠØ©', 'Current receiver info', 'Infos de reception actuelles')}
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <p><span className="font-bold">{tr(lang, 'Ø§Ø³Ù… Ø§Ù„Ø­Ø³Ø§Ø¨:', 'Account name:', 'Nom du compte:')}</span> {cleanText(billingConfig?.accountName, '-')}</p>
              <p><span className="font-bold">{tr(lang, 'Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¯ÙØ¹:', 'Method:', 'Methode:')}</span> {methodName}</p>
              <p><span className="font-bold">InstaPay:</span> {cleanText(billingConfig?.instapayHandle, '-')}</p>
              <p><span className="font-bold">Vodafone Cash:</span> {cleanText(billingConfig?.vodafoneCashNumber, '-')}</p>
              <p className="md:col-span-2"><span className="font-bold">{tr(lang, 'Ø§Ù„Ø¯Ø¹Ù…:', 'Support:', 'Support:')}</span> {cleanText(billingConfig?.supportContact, '-')}</p>
              <p className="md:col-span-2 text-xs opacity-90">
                {cleanText(lang === LANG.ar
                  ? billingConfig?.instructionsAr
                  : lang === LANG.fr
                    ? billingConfig?.instructionsFr
                    : billingConfig?.instructionsEn)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'ÙˆØ³ÙŠÙ„Ø© Ø§Ù„Ø¯ÙØ¹', 'Payment method', 'Methode de paiement')}</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}>
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {cleanText(lang === LANG.ar ? m.ar : lang === LANG.fr ? m.fr : m.en)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ø±Ù‚Ù… Ø§Ù„Ù…ÙØ±Ø³Ù„/Ø§Ù„Ù…Ø­ÙØ¸Ø©', 'Sender/wallet number', 'Numero expediteur/portefeuille')}</label>
              <input
                value={payerContact}
                onChange={(e) => setPayerContact(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}
                placeholder={tr(lang, 'Ø§Ø®ØªÙŠØ§Ø±ÙŠ', 'Optional', 'Optionnel')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ù…Ø±Ø¬Ø¹ Ø§Ù„ØªØ­ÙˆÙŠÙ„', 'Transfer reference', 'Reference de transfert')}</label>
              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}
                placeholder={tr(lang, 'Ù…Ø·Ù„ÙˆØ¨ Ù„ØªØ³Ø±ÙŠØ¹ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©', 'Recommended for faster approval', 'Recommande pour validation rapide')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ù…Ù„Ø§Ø­Ø¸Ø© Ø¥Ø¶Ø§ÙÙŠØ©', 'Additional note', 'Note supplementaire')}</label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'Ø±ÙØ¹ ØµÙˆØ±Ø© Ø§Ù„ØªØ­ÙˆÙŠÙ„ (Ø¥Ø¬Ø¨Ø§Ø±ÙŠ)', 'Upload transfer proof (required)', 'Telecharger preuve de transfert (obligatoire)')}</label>
              <label className={`w-full h-[92px] border-2 border-dashed rounded-lg flex items-center justify-center gap-2 cursor-pointer ${isDark ? 'border-slate-600 bg-slate-900/60 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-700'}`}>
                <FaUpload />
                <span className="text-sm">{proofFileName || tr(lang, 'Ø§Ø®ØªØ± ØµÙˆØ±Ø©', 'Choose image', 'Choisir une image')}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleProofChange} />
              </label>
              {proofImageDataUrl ? (
                <div className="mt-2">
                  <img src={proofImageDataUrl} alt="transfer-proof-preview" className="h-24 rounded border border-slate-300 object-cover" />
                </div>
              ) : null}
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
              ? tr(lang, 'Ø¬Ø§Ø±Ù Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨...', 'Submitting request...', 'Envoi de la demande...')
              : tr(lang, 'Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø´Ø­Ù†', 'Submit top-up request', 'Envoyer la demande')}
          </span>
        </button>

        <div className={`rounded-xl border p-4 mt-6 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
          <h4 className="font-black text-sm mb-3">{tr(lang, 'Ø·Ù„Ø¨Ø§ØªÙŠ Ø§Ù„Ø£Ø®ÙŠØ±Ø©', 'My recent requests', 'Mes demandes recentes')}</h4>
          {myRequests.length === 0 ? (
            <p className="text-sm opacity-70">{tr(lang, 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø´Ø­Ù† Ø¨Ø¹Ø¯.', 'No top-up requests yet.', 'Aucune demande de recharge pour le moment.')}</p>
          ) : (
            <div className="max-h-56 overflow-auto space-y-2 pr-1">
              {myRequests.slice(0, 10).map((item) => (
                <div key={item.id} className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">${(Number(item.amount_cents || 0) / 100).toFixed(2)} / {item.credits_added} {tr(lang, 'ÙƒØ±ÙŠØ¯ÙŠØª', 'credits', 'credits')}</span>
                    <span className={`text-xs rounded-full px-2 py-1 ${
                      item.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>{statusBadge(item.status, lang)}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">{new Date(item.created_at).toLocaleString(requestLocale)}</p>
                  {item?.proof_url ? (
                    <a
                      href={item.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-1 inline-block"
                    >
                      {tr(lang, 'Ø¹Ø±Ø¶ ØµÙˆØ±Ø© Ø§Ù„ØªØ­ÙˆÙŠÙ„', 'View transfer proof', 'Voir la preuve de transfert')}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default PricingModal;

