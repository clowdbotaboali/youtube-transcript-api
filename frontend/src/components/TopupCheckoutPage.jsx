import { useEffect, useState } from 'react';
import { FaArrowRight, FaBolt, FaUpload } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { formatApiErrorMessage } from '../utils/apiError';
import { cleanText, LANG, tr } from '../utils/lang';

const METHODS = [
  { value: 'instapay', ar: 'إنستا باي', en: 'InstaPay', fr: 'InstaPay' },
  { value: 'vodafone_cash', ar: 'فودافون كاش', en: 'Vodafone Cash', fr: 'Vodafone Cash' }
];

const MAX_PROOF_SIZE = 3 * 1024 * 1024;

function statusBadge(status, lang) {
  const value = String(status || '').toLowerCase();
  if (value === 'approved') return tr(lang, 'مقبول', 'Approved', 'Approuve');
  if (value === 'rejected') return tr(lang, 'مرفوض', 'Rejected', 'Rejete');
  return tr(lang, 'معلّق', 'Pending', 'En attente');
}

function formatEgpAmount(amountCents, lang) {
  const value = Number(amountCents || 0) / 100;
  const locale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  return `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tr(lang, 'ج.م', 'EGP', 'EGP')}`;
}

function formatUsdAmount(amountCents) {
  return `$${(Number(amountCents || 0) / 100).toFixed(2)}`;
}

function isLocalPaymentMethod(method) {
  const normalized = String(method || '').trim().toLowerCase();
  return normalized === 'instapay' || normalized === 'vodafone_cash';
}

function TopupCheckoutPage({
  user,
  quote,
  apiUrl = defaultApiUrl,
  lang = LANG.ar,
  theme = 'light',
  onNotify,
  onBack,
  onTopupSubmitted
}) {
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);
  const [method, setMethod] = useState('instapay');
  const [payerContact, setPayerContact] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [userNote, setUserNote] = useState('');
  const [proofImageDataUrl, setProofImageDataUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [billingConfig, setBillingConfig] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  const isDark = theme === 'dark';

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, cleanText(message));
  };

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
      notify('error', tr(lang, 'تعذر تحميل بيانات الدفع.', 'Failed to load billing data.', 'Echec du chargement des donnees de paiement.'));
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    loadBillingContext();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      notify('error', tr(lang, 'يرجى تسجيل الدخول أولاً.', 'Please sign in first.', 'Veuillez vous connecter d abord.'));
      return;
    }

    if (!quote?.valid) {
      notify('error', tr(lang, 'الرجاء اختيار باقة فيديو صحيحة أولاً.', 'Please select a valid video pack first.', 'Veuillez d abord choisir un pack videos valide.'));
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
            `تم إرسال طلب الشحن بنجاح (${data.quote?.videos ?? quote.videos} فيديو).`,
            `Top-up request submitted (${data.quote?.videos ?? quote.videos} videos).`,
            `Demande envoyee (${data.quote?.videos ?? quote.videos} videos).`
          )
        );
        resetFormAfterSubmit();
        await loadBillingContext();
        onTopupSubmitted?.(data);
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
      notify('error', tr(lang, 'فشل الاتصال بالخادم.', 'Connection failed.', 'Echec de connexion.'));
    } finally {
      setLoading(false);
    }
  };

  const requestLocale = lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US';
  const selectedMethodData = METHODS.find((item) => item.value === method) || METHODS[0];
  const methodName = cleanText(
    lang === LANG.ar ? selectedMethodData.ar : lang === LANG.fr ? selectedMethodData.fr : selectedMethodData.en
  );
  const baseVideos = Math.max(Number(quote?.baseVideos ?? quote?.baseCredits ?? quote?.videos ?? 0), 0);
  const bonusVideos = Math.max(Number(quote?.bonusVideos ?? quote?.bonusCredits ?? 0), 0);
  const bonusPercent = Number(quote?.bonusRate || 0) > 0 ? Math.round(Number(quote.bonusRate) * 100) : 0;
  const quoteAmountCents = Number(quote?.amountCents || 0);
  const quotePriceLabel = isLocalPaymentMethod(method) ? formatEgpAmount(quoteAmountCents, lang) : formatUsdAmount(quoteAmountCents);

  if (!quote?.valid) {
    return (
      <section className={`rounded-2xl border p-5 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <p className="font-semibold text-red-500 mb-3">
          {tr(lang, 'لا توجد باقة فيديو صالحة. اختر الباقة أولاً.', 'No valid video pack selected.', 'Aucun pack videos valide selectionne.')}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
        >
          {tr(lang, 'الرجوع لاختيار الباقة', 'Back to pack selection', 'Retour au choix du pack')}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className={`rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {tr(lang, 'تفاصيل الدفع ورفع الإثبات', 'Payment details & proof upload', 'Details de paiement et preuve')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {tr(lang, 'هذه الصفحة لإتمام طلب الدفع بعد اختيار باقة الفيديو.', 'This page finalizes your selected video pack.', 'Cette page finalise votre pack videos selectionne.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-slate-300 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
          >
            <FaArrowRight className={lang === LANG.ar ? '' : 'rotate-180'} />
            <span>{tr(lang, 'تغيير الباقة', 'Change pack', 'Changer le pack')}</span>
          </button>
        </div>

        <div className={`rounded-xl border p-4 ${isDark ? 'border-amber-800 bg-amber-950/35 text-amber-100' : 'border-amber-200 bg-amber-50 text-slate-800'}`}>
          <p className="font-bold text-base mb-1">
            {tr(lang, 'الإجمالي:', 'Total:', 'Total:')} {quote.videos} {tr(lang, 'فيديو', 'videos', 'videos')}
          </p>
          <p>{tr(lang, 'الأساسي:', 'Base:', 'Base:')} {baseVideos} {tr(lang, 'فيديو', 'videos', 'videos')}</p>
          {bonusVideos > 0 ? (
            <p>
              {tr(lang, 'البونص:', 'Bonus:', 'Bonus:')} +{bonusVideos} {tr(lang, 'فيديو', 'videos', 'videos')}
              {bonusPercent > 0 ? ` (${bonusPercent}%)` : ''}
            </p>
          ) : null}
          <p>{tr(lang, 'عدد الباقات:', 'Packs:', 'Packs:')} {quote.packs}</p>
          <p>{tr(lang, 'السعر:', 'Price:', 'Prix:')} {quotePriceLabel}</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 sm:p-5 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-black text-base">{tr(lang, 'بيانات الدفع ورفع الإثبات', 'Payment details & proof upload', 'Details de paiement et preuve')}</h3>
          {loadingContext ? <span className="text-xs opacity-70">{tr(lang, 'جارٍ التحديث...', 'Refreshing...', 'Actualisation...')}</span> : null}
        </div>

        <div className={`rounded-lg border p-3 mb-4 ${isDark ? 'border-cyan-800 bg-cyan-950/20' : 'border-cyan-200 bg-cyan-50'}`}>
          <p className="text-sm font-semibold mb-2">
            {tr(lang, 'بيانات الاستقبال الحالية', 'Current receiver info', 'Infos de reception actuelles')}
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <p><span className="font-bold">{tr(lang, 'اسم الحساب:', 'Account name:', 'Nom du compte:')}</span> {cleanText(billingConfig?.accountName, '-')}</p>
            <p><span className="font-bold">{tr(lang, 'طريقة الدفع:', 'Method:', 'Methode:')}</span> {methodName}</p>
            <p><span className="font-bold">InstaPay:</span> {cleanText(billingConfig?.instapayHandle, '-')}</p>
            <p><span className="font-bold">Vodafone Cash:</span> {cleanText(billingConfig?.vodafoneCashNumber, '-')}</p>
            <p className="md:col-span-2"><span className="font-bold">{tr(lang, 'الدعم:', 'Support:', 'Support:')}</span> {cleanText(billingConfig?.supportContact, '-')}</p>
            <p className="md:col-span-2 text-xs opacity-90">
              {cleanText(
                lang === LANG.ar
                  ? billingConfig?.instructionsAr
                  : lang === LANG.fr
                    ? billingConfig?.instructionsFr
                    : billingConfig?.instructionsEn
              )}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">{tr(lang, 'وسيلة الدفع', 'Payment method', 'Methode de paiement')}</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={`w-full border rounded-lg px-3 py-2 ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : ''}`}>
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {cleanText(lang === LANG.ar ? m.ar : lang === LANG.fr ? m.fr : m.en)}
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

        <button
          type="button"
          onClick={handleSubmitTopup}
          disabled={loading}
          className="w-full mt-4 rounded-xl py-3 bg-orange-600 text-white font-bold hover:bg-orange-700 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <FaBolt />
          <span>
            {loading
              ? tr(lang, 'جارٍ إرسال الطلب...', 'Submitting request...', 'Envoi de la demande...')
              : tr(lang, 'إرسال طلب الشحن', 'Submit top-up request', 'Envoyer la demande')}
          </span>
        </button>
      </div>

      <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <h4 className="font-black text-sm mb-3">{tr(lang, 'طلباتي الأخيرة', 'My recent requests', 'Mes demandes recentes')}</h4>
        {myRequests.length === 0 ? (
          <p className="text-sm opacity-70">{tr(lang, 'لا توجد طلبات شحن بعد.', 'No top-up requests yet.', 'Aucune demande de recharge pour le moment.')}</p>
        ) : (
          <div className="max-h-56 overflow-auto space-y-2 pr-1">
            {myRequests.slice(0, 10).map((item) => (
              <div key={item.id} className={`rounded-lg border p-3 ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">
                    {isLocalPaymentMethod(item.payment_method) ? formatEgpAmount(item.amount_cents, lang) : formatUsdAmount(item.amount_cents)} / {item.credits_added} {tr(lang, 'فيديو', 'videos', 'videos')}
                  </span>
                  <span
                    className={`text-xs rounded-full px-2 py-1 ${
                      item.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {statusBadge(item.status, lang)}
                  </span>
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
    </section>
  );
}

export default TopupCheckoutPage;
