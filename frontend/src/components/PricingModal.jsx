import { useState } from 'react';
import { FaDatabase, FaBolt, FaCheck } from 'react-icons/fa';
import defaultApiUrl from '../config';
import { getAuthHeaders } from '../utils/authHeaders';
import { LANG, tr } from '../utils/lang';

const PLANS = [
  {
    amount: 50,
    price: 5,
    priceCent: 500,
    titleAr: '???? ???????',
    titleEn: 'Starter Pack',
    featuresAr: ['50 ???? ??????', '??? ??? ??????', '???? ??????'],
    featuresEn: ['50 processing credits', 'Email support', 'No expiry'],
    icon: FaDatabase,
    color: 'blue'
  },
  {
    amount: 200,
    price: 15,
    priceCent: 1500,
    titleAr: '???? ????????',
    titleEn: 'Pro Pack',
    featuresAr: ['200 ???? ??????', '??? ??????', '???? ??????', '????? 25%'],
    featuresEn: ['200 processing credits', 'Priority support', 'No expiry', 'Save 25%'],
    icon: FaBolt,
    color: 'orange',
    popular: true
  }
];

const METHODS = [
  { value: 'instapay', ar: '????? ???', en: 'InstaPay' },
  { value: 'vodafone_cash', ar: '??????? ???', en: 'Vodafone Cash' }
];

const PLAN_COLORS = {
  blue: { iconWrap: 'bg-blue-100 text-blue-600', check: 'text-blue-500', border: 'border-blue-500' },
  orange: { iconWrap: 'bg-orange-100 text-orange-600', check: 'text-orange-500', border: 'border-orange-500' }
};

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
    if (!user) {
      requireLogin();
      return;
    }

    setLoadingPlan(plan.amount);
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

      const data = await response.json();
      if (data.success) {
        notify(
          'success',
          tr(
            lang,
            '?? ????? ??? ?????. ???? ??????? ?????? ?????? ??????.',
            'Top-up request submitted. It will be reviewed and approved manually.'
          )
        );
        onClose();
      } else {
        notify('error', tr(lang, `???: ${data.error || '??? ?????'}`, `Error: ${data.error || 'Request failed'}`));
      }
    } catch {
      notify('error', tr(lang, '??? ??????? ???????', 'Connection failed'));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl p-6 md:p-10 relative mt-10 md:mt-0" dir={lang === LANG.ar ? 'rtl' : 'ltr'}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 bg-white rounded-full px-3 py-1 shadow-sm transition"
        >
          X
        </button>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{tr(lang, '??? ??? ??????', 'Top-up Request')}</h2>
          <p className="text-gray-600">
            {tr(
              lang,
              '????? ???? ?????? ??? ????? ??? ?? ??????? ???. ??? ???????? ???? ?????? ??????? ?? ???.',
              'Temporary payment methods: InstaPay or Vodafone Cash. Submit transfer details from here after payment.'
            )}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, '????? ?????', 'Payment method')}</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {lang === LANG.ar ? m.ar : m.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, '??? ??????/???????', 'Sender/wallet number')}</label>
              <input
                value={payerContact}
                onChange={(e) => setPayerContact(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={tr(lang, '???????', 'Optional')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{tr(lang, '???? ???????', 'Transfer reference')}</label>
              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                placeholder={tr(lang, '???????', 'Optional')}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const color = PLAN_COLORS[plan.color] || PLAN_COLORS.blue;
            return (
              <div
                key={plan.amount}
                className={`bg-white rounded-2xl shadow-md p-8 border-2 transition-transform duration-200 hover:-translate-y-1 relative ${
                  plan.popular ? color.border : 'border-transparent hover:border-blue-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                    {tr(lang, '?????? ?????', 'Most Popular')}
                  </span>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{lang === LANG.ar ? plan.titleAr : plan.titleEn}</h3>
                    <p className="text-gray-500 text-sm">
                      {plan.amount} {tr(lang, '????', 'credits')}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${color.iconWrap}`}>
                    <Icon className="text-2xl" />
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 ml-2">{tr(lang, '???? ?????', 'one-time')}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {(lang === LANG.ar ? plan.featuresAr : plan.featuresEn).map((feat) => (
                    <li key={feat} className="flex items-center text-gray-700">
                      <FaCheck className={`${color.check} mr-3 shrink-0`} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleRequest(plan)}
                  disabled={loadingPlan === plan.amount}
                  className={`w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-70 ${
                    plan.popular ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {loadingPlan === plan.amount ? tr(lang, '???? ???????...', 'Submitting...') : tr(lang, '????? ??? ?????', 'Submit top-up request')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PricingModal;