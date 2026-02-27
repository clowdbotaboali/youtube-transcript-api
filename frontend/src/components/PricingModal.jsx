import { useState } from 'react';
import { FaCheck, FaCrown, FaLeaf } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { LANG, tr } from '../utils/lang';

const PLANS = [
  {
    id: 'free',
    amount: 5,
    price: 0,
    priceCent: 0,
    titleAr: 'الخطة المجانية',
    titleEn: 'Free Plan',
    featuresAr: ['5 روابط فيديو مجانًا كبداية', 'كل رابط جديد = 1 نقطة', 'التلخيص والشات لنفس الفيديو بدون خصم إضافي'],
    featuresEn: ['5 free video links to start', 'Each new video link = 1 credit', 'Summary/chat on same video has no extra charge'],
    selectable: false,
    icon: FaLeaf,
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'paid_200',
    amount: 200,
    price: 5,
    priceCent: 500,
    titleAr: 'الخطة المدفوعة',
    titleEn: 'Paid Plan',
    featuresAr: ['200 كريديت', 'كل رابط فيديو جديد = 1 كريديت', 'دفعة واحدة'],
    featuresEn: ['200 credits', 'Each new video link = 1 credit', 'One-time payment'],
    selectable: true,
    icon: FaCrown,
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-800'
  }
];

const METHODS = [
  { value: 'instapay', ar: 'إنستا باي', en: 'InstaPay' },
  { value: 'vodafone_cash', ar: 'فودافون كاش', en: 'Vodafone Cash' }
];

function PricingModal({ isOpen, onClose, user, apiUrl = defaultApiUrl, requireLogin, lang = LANG.ar, onNotify }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [method, setMethod] = useState('instapay');
  const [payerContact, setPayerContact] = useState('');
  const [transferReference, setTransferReference] = useState('');

  if (!isOpen) return null;

  const notify = (type, message) => {
    if (typeof onNotify === 'function') onNotify(type, message);
  };

  const handleRequest = async (plan) => {
    if (!plan.selectable) return;
    if (!user) {
      requireLogin();
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`${apiUrl}/api/billing/create-topup-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          credits: plan.amount,
          amountCents: plan.priceCent,
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
            'تم إرسال طلب الشحن بنجاح. سيتم مراجعته واعتماده يدويًا.',
            'Top-up request submitted. It will be reviewed and approved manually.'
          )
        );
        onClose();
      } else {
        notify('error', tr(lang, `خطأ: ${data.error || 'فشل الطلب'}`, `Error: ${data.error || 'Request failed'}`));
      }
    } catch {
      notify('error', tr(lang, 'فشل الاتصال بالخادم', 'Connection failed'));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl p-6 md:p-10 relative mt-10 md:mt-0" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
        <button
          onClick={onClose}
          className={`absolute top-4 ${lang === LANG.ar ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-900 bg-white rounded-full px-3 py-1 shadow-sm transition`}
        >
          X
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{tr(lang, 'الخطط والشحن', 'Plans & Top-up')}</h2>
          <p className="text-gray-600 mb-2">
            {tr(lang, 'الخطة المجانية: 5 روابط فيديو فقط.', 'Free plan: 5 video links only.')}
          </p>
          <p className="text-gray-600 mb-2">
            {tr(lang, 'الخطة المدفوعة الحالية: 200 كريديت مقابل 5 دولار.', 'Current paid plan: 200 credits for $5.')}
          </p>
          <p className="text-gray-600">
            {tr(lang, 'سياسة الاستهلاك: كل رابط فيديو جديد يخصم كريديت واحد. التلخيص والشات لنفس الفيديو بدون خصم.', 'Consumption policy: each new video link costs 1 credit. Summary and chat on the same video are free.')}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'وسيلة الدفع', 'Payment method')}</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {lang === LANG.ar ? m.ar : m.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'رقم المُرسل أو المحفظة', 'Sender/wallet number')}</label>
              <input
                value={payerContact}
                onChange={(e) => setPayerContact(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={tr(lang, 'اختياري', 'Optional')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, 'مرجع التحويل', 'Transfer reference')}</label>
              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={tr(lang, 'اختياري', 'Optional')}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.id;
            return (
              <div key={plan.id} className={`bg-white rounded-2xl shadow-md p-6 border-2 ${plan.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{lang === LANG.ar ? plan.titleAr : plan.titleEn}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${plan.badge}`}>
                    {plan.selectable ? tr(lang, 'مدفوعة', 'Paid') : tr(lang, 'مجانية', 'Free')}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-gray-900">{plan.selectable ? `$${plan.price}` : '$0'}</div>
                    <div className="text-sm text-gray-500">
                      {plan.amount > 0 ? `${plan.amount} ${tr(lang, 'كريديت', 'credits')}` : tr(lang, 'استخدام مبدئي', 'starter usage')}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-5">
                  {(lang === LANG.ar ? plan.featuresAr : plan.featuresEn).map((feat) => (
                    <li key={feat} className="flex items-center text-sm text-gray-700">
                      <FaCheck className="text-emerald-500 mr-2 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.selectable ? (
                  <button
                    onClick={() => handleRequest(plan)}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition disabled:opacity-70"
                  >
                    {isLoading ? tr(lang, 'جاري الإرسال...', 'Submitting...') : tr(lang, 'إرسال طلب الشحن', 'Submit top-up request')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl font-bold text-slate-700 bg-slate-100 border border-slate-200"
                    disabled
                  >
                    {tr(lang, 'الخطة الأساسية', 'Base plan')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
