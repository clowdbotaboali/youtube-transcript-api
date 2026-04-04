import { FaCheck, FaCreditCard, FaImage, FaTimes } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function isLocalPaymentMethod(method) {
  const normalized = String(method || '').trim().toLowerCase();
  return normalized === 'instapay' || normalized === 'vodafone_cash' || normalized === 'paymob_card';
}

function formatPaymentAmount(amountCents, method, lang) {
  const value = Number(amountCents || 0) / 100;
  if (isLocalPaymentMethod(method)) {
    return `${value.toFixed(2)} ${tr(lang, 'ج.م', 'EGP', 'EGP')}`;
  }
  return `$${value.toFixed(2)}`;
}

export default function AdminPaymentsTab({
  lang,
  payments,
  busyAction,
  reviewPayment,
  badgeClass,
  statusLabel,
  shortId
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <FaCreditCard className="text-slate-600" />
        <h2 className="font-black text-slate-900">{tr(lang, 'المدفوعات', 'Payments')}</h2>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-slate-50">
            <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
              <th className="p-3">{tr(lang, 'المستخدم', 'User')}</th>
              <th className="p-3">{tr(lang, 'الوسيلة', 'Method')}</th>
              <th className="p-3">{tr(lang, 'المبلغ', 'Amount')}</th>
              <th className="p-3">{tr(lang, 'الفيديوهات', 'Videos', 'Videos')}</th>
              <th className="p-3">{tr(lang, 'الحالة', 'Status')}</th>
              <th className="p-3">{tr(lang, 'المرجع', 'Reference')}</th>
              <th className="p-3">{tr(lang, 'صورة التحويل', 'Proof')}</th>
              <th className="p-3">{tr(lang, 'الإجراءات', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="p-3">
                  <div className="font-semibold">{shortId(item.user_id)}</div>
                  <div className="text-xs text-slate-500">{item.user_email || '-'}</div>
                </td>
                <td className="p-3">{item.payment_method || '-'}</td>
                <td className="p-3">{formatPaymentAmount(item.amount_cents, item.payment_method, lang)}</td>
                <td className="p-3">{item.credits_added}</td>
                <td className="p-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${badgeClass(item.status)}`}>
                    {statusLabel(item.status, lang)}
                  </span>
                </td>
                <td className="p-3">{item.transfer_reference || '-'}</td>
                <td className="p-3">
                  {item.proof_url ? (
                    <a
                      href={item.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                    >
                      <FaImage />
                      <span>{tr(lang, 'عرض', 'View')}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">-</span>
                  )}
                </td>
                <td className="p-3">
                  {item.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reviewPayment(item.id, 'approved')}
                        disabled={busyAction === `payment:${item.id}:approved`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FaCheck />
                        <span>{tr(lang, 'موافقة', 'Approve')}</span>
                      </button>
                      <button
                        onClick={() => reviewPayment(item.id, 'rejected')}
                        disabled={busyAction === `payment:${item.id}:rejected`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <FaTimes />
                        <span>{tr(lang, 'رفض', 'Reject')}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
