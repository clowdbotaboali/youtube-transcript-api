import { FaBan, FaPauseCircle, FaPlayCircle, FaTrashAlt, FaUsers } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

export default function AdminUsersTab({
  lang,
  users,
  busyAction,
  setUserStatus,
  deleteUser,
  subscriptionTierBadgeClass,
  subscriptionTierLabel,
  userMonthlyQuotaHint,
  accessLabel,
  badgeClass,
  formatDate,
  shortId
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <FaUsers className="text-slate-600" />
        <h2 className="font-black text-slate-900">{tr(lang, 'المستخدمون', 'Users')}</h2>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-slate-50">
            <tr className={lang === LANG.ar ? 'text-right' : 'text-left'}>
              <th className="p-3">{tr(lang, 'البريد', 'Email')}</th>
              <th className="p-3">{tr(lang, 'رصيد الفيديوهات', 'Video Balance', 'Solde videos')}</th>
              <th className="p-3">{tr(lang, 'الخطة / الحصة', 'Plan / Quota', 'Plan / Quota')}</th>
              <th className="p-3">{tr(lang, 'الحالة', 'Status')}</th>
              <th className="p-3">{tr(lang, 'مدفوعات مقبولة', 'Approved Payments')}</th>
              <th className="p-3">{tr(lang, 'مدفوعات معلقة', 'Pending Payments')}</th>
              <th className="p-3">{tr(lang, 'الفيديوهات المدفوعة', 'Paid Videos', 'Videos payees')}</th>
              <th className="p-3">{tr(lang, 'تاريخ الإنشاء', 'Created')}</th>
              <th className="p-3">{tr(lang, 'الإجراءات', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => {
              const accessStatus = item.access?.status || 'active';
              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-3">
                    <div className="font-semibold">{item.email || '-'}</div>
                    <div className="text-xs text-slate-500">{shortId(item.id)}</div>
                    {item.access?.reason ? <div className="text-xs text-orange-600 mt-1">{item.access.reason}</div> : null}
                  </td>
                  <td className="p-3 font-bold">{item.credits}</td>
                  <td className="p-3">
                    <div className="space-y-1">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${subscriptionTierBadgeClass(item.subscription_tier)}`}>
                        {subscriptionTierLabel(item.subscription_tier, lang)}
                      </span>
                      <p className="text-xs text-slate-500">{userMonthlyQuotaHint(item, lang)}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${badgeClass(accessStatus)}`}>
                      {accessLabel(accessStatus, lang)}
                    </span>
                  </td>
                  <td className="p-3">{item.stats?.approvedPayments ?? 0}</td>
                  <td className="p-3">{item.stats?.pendingPayments ?? 0}</td>
                  <td className="p-3">{item.stats?.paidCredits ?? 0}</td>
                  <td className="p-3">{formatDate(item.created_at, lang)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUserStatus(item.id, 'active')}
                        disabled={busyAction === `user:${item.id}:active`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FaPlayCircle />
                        <span>{tr(lang, 'تفعيل', 'Activate')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserStatus(item.id, 'suspended')}
                        disabled={busyAction === `user:${item.id}:suspended`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <FaPauseCircle />
                        <span>{tr(lang, 'تعليق', 'Suspend')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserStatus(item.id, 'blocked')}
                        disabled={busyAction === `user:${item.id}:blocked`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <FaBan />
                        <span>{tr(lang, 'حظر', 'Block')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(item.id)}
                        disabled={busyAction === `delete:${item.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <FaTrashAlt />
                        <span>{tr(lang, 'حذف', 'Delete')}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
