import { useEffect, useMemo, useState } from 'react';
import { FaBolt, FaCheck, FaCrown, FaLeaf, FaUpload } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { LANG, tr } from '../utils/lang';

const METHODS = [
  { value: 'instapay', ar: 'إنستا باي', en: 'InstaPay', fr: 'InstaPay' },
  { value: 'vodafone_cash', ar: 'فودافون كاش', en: 'Vodafone Cash', fr: 'Vodafone Cash' }
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
  if (value === 'approved') return tr(lang, 'مقبول', 'Approved', 'Approuve');
  if (value === 'rejected') return tr(lang, 'مرفوض', 'Rejected', 'Rejete');
  return tr(lang, 'معلّق', 'Pending', 'En attente');
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
    if (typeof onNotify === 'function') onNotify(type, message);
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
        setBillingConfig(configData.data || null);
      }
      if (requestsResponse.ok && requestsData.success) {
        setMyRequests(Array.isArray(requestsData.data) ? requestsData.data : []);
      }
    } catch {
      notify('error', tr(lang, 'تعذر تحميل بيانات الدفع.', 'Failed to load billing data.', 'Echec du chargement des donnees de paiement.'));
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
      notify('error', tr(lang, 'صيغة الصورة غير مدعومة (PNG/JPEG/WEBP).', 'Unsupported image type (PNG/JPEG/WEBP).', 'Format d image non pris en charge (PNG/JPEG/WEBP).'));
      event.target.value = '';
      return;
    }
    if (file.size > MAX_PROOF_SIZE) {
      notify('error', tr(lang, 'حجم الصورة أكبر من 3MB.', 'Image is larger than 3MB.', 'L image depasse 3 Mo.'));
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
          'المبلغ يجب أن يكون مضاعفات 5 دولار (5، 10، 15...)',
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
          'ارفع صورة إثبات التحويل قبل إرسال الطلب.',
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
            `تم إرسال طلب الشحن بنجاح (${data.quote?.credits ?? quote.credits} كريديت).`,
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

  const requestLocale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  const selectedMethodData = METHODS.find((item) => item.value === method) || METHODS[0];
  const methodName = lang === LANG.ar ? selectedMethodData.ar : lang === LANG.fr ? selectedMethodData.fr : selectedMethodData.en;

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
                {tr(lang, 'كل رابط فيديو جديد = 1 كريديت', 'Each new video link costs 1 credit', 'Chaque nouveau lien coute 1 credit')}
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-emerald-600" />
                {tr(lang, 'نفس الفيديو: تلخيص وشات بدون خصم إضافي', 'Same-video summary/chat has no extra charge', 'Resume/chat sur la meme video sans cout supplementaire')}
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
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-black text-base">{tr(lang, 'بيانات الدفع ورفع الإثبات', 'Payment details & proof upload', 'Details de paiement et preuve')}</h3>
            {loadingContext ? <span className="text-xs opacity-70">{tr(lang, 'جارٍ التحديث...', 'Refreshing...', 'Actualisation...')}</span> : null}
          </div>

          <div className={`rounded-lg border p-3 mb-4 ${isDark ? 'border-cyan-800 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50'}`}>
            <p className="text-sm font-semibold mb-2">
              {tr(lang, 'بيانات الاستقبال الحالية', 'Current receiver info', 'Infos de reception actuelles')}
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <p><span className="font-bold">{tr(lang, 'اسم الحساب:', 'Account name:', 'Nom du compte:')}</span> {billingConfig?.accountName || '-'}</p>
              <p><span className="font-bold">{tr(lang, 'طريقة الدفع:', 'Method:', 'Methode:')}</span> {methodName}</p>
              <p><span className="font-bold">InstaPay:</span> {billingConfig?.instapayHandle || '-'}</p>
              <p><span className="font-bold">Vodafone Cash:</span> {billingConfig?.vodafoneCashNumber || '-'}</p>
              <p className="md:col-span-2"><span className="font-bold">{tr(lang, 'الدعم:', 'Support:', 'Support:')}</span> {billingConfig?.supportContact || '-'}</p>
              <p className="md:col-span-2 text-xs opacity-90">
                {lang === LANG.ar
                  ? billingConfig?.instructionsAr
                  : lang === LANG.fr
                    ? billingConfig?.instructionsFr
                    : billingConfig?.instructionsEn}
              </p>
            </div>
          </div>

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
                placeholder={tr(lang, 'مطلوب لتسريع المراجعة', 'Recommended for faster approval', 'Recommande pour validation rapide')}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'ملاحظة إضافية', 'Additional note', 'Note supplementaire')}</label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'رفع صورة التحويل (إجباري)', 'Upload transfer proof (required)', 'Telecharger preuve de transfert (obligatoire)')}</label>
              <label className={`w-full h-[92px] border-2 border-dashed rounded-lg flex items-center justify-center gap-2 cursor-pointer ${isDark ? 'border-slate-600 bg-slate-900/60 text-slate-200' : 'border-slate-300 bg-slate-50 text-slate-700'}`}>
                <FaUpload />
                <span className="text-sm">{proofFileName || tr(lang, 'اختر صورة', 'Choose image', 'Choisir une image')}</span>
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
              ? tr(lang, 'جارٍ إرسال الطلب...', 'Submitting request...', 'Envoi de la demande...')
              : tr(lang, 'إرسال طلب الشحن', 'Submit top-up request', 'Envoyer la demande')}
          </span>
        </button>

        <div className={`rounded-xl border p-4 mt-6 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
          <h4 className="font-black text-sm mb-3">{tr(lang, 'طلباتي الأخيرة', 'My recent requests', 'Mes demandes recentes')}</h4>
          {myRequests.length === 0 ? (
            <p className="text-sm opacity-70">{tr(lang, 'لا توجد طلبات شحن بعد.', 'No top-up requests yet.', 'Aucune demande de recharge pour le moment.')}</p>
          ) : (
            <div className="max-h-56 overflow-auto space-y-2 pr-1">
              {myRequests.slice(0, 10).map((item) => (
                <div key={item.id} className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold">${(Number(item.amount_cents || 0) / 100).toFixed(2)} / {item.credits_added} {tr(lang, 'كريديت', 'credits', 'credits')}</span>
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
                      {tr(lang, 'عرض صورة التحويل', 'View transfer proof', 'Voir la preuve de transfert')}
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
