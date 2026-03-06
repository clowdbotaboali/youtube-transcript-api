import { tr } from '../utils/lang';
import { paymentRequestStatusLabel, paymentRequestStatusClass } from '../helpers';
import { LANG } from '../utils/lang';

export default function AccountSection({
  lang,
  theme,
  user,
  credits,
  freeLinksRemaining,
  freePlanLimit,
  accountAccess,
  recentTopupRequests,
  recentTopupLoading,
  passwordForm,
  passwordSubmitting,
  onPasswordFormChange,
  onPasswordSubmit,
  onOpenTopupPicker,
  onOpenSettings,
  onLogout,
  canUseLocalGuide,
  CREDIT_COST_PER_SUCCESS
}) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-black text-slate-900 mb-3">{tr(lang, '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062d\u0633\u0627\u0628', 'Account details')}</h2>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold">{tr(lang, '\u0627\u0644\u0628\u0631\u064a\u062f:', 'Email:')}</span> {user?.email || '-'}</p>
            <p><span className="font-bold">{tr(lang, '\u0631\u0635\u064a\u062f \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a:', 'Video balance:')}</span> {credits ?? '...'}</p>
            <p><span className="font-bold">{tr(lang, '\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629:', 'Free plan:')}</span> {freePlanLimit} {tr(lang, '\u0631\u0648\u0627\u0628\u0637 \u0641\u0642\u0637', 'links only')}</p>
            <p><span className="font-bold">{tr(lang, '\u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u0627\u0644\u0645\u062a\u0628\u0642\u064a\u0629:', 'Free links remaining:')}</span> {tr(lang, `${freeLinksRemaining} من ${freePlanLimit}`, `${freeLinksRemaining} of ${freePlanLimit}`, `${freeLinksRemaining} sur ${freePlanLimit}`)}</p>
            <p><span className="font-bold">{tr(lang, '\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0631\u0627\u0628\u0637:', 'Link cost:')}</span> {CREDIT_COST_PER_SUCCESS} {tr(lang, '\u0641\u064a\u062f\u064a\u0648 \u0645\u0646 \u0627\u0644\u0631\u0635\u064a\u062f \u0644\u0643\u0644 \u0631\u0627\u0628\u0637 \u062c\u062f\u064a\u062f', 'video from balance per new video link')}</p>
            <p><span className="font-bold">{tr(lang, '\u0627\u0644\u062c\u0644\u0633\u0629:', 'Session:')}</span> {tr(lang, '\u0646\u0634\u0637\u0629', 'Active')}</p>
            {accountAccess.status !== 'active' ? (
              <p>
                <span className="font-bold">{tr(lang, '\u062d\u0627\u0644\u0629 \u0627\u0644\u0648\u0635\u0648\u0644:', 'Access status:')}</span>{' '}
                {accountAccess.status} {accountAccess.reason ? `(${accountAccess.reason})` : ''}
              </p>
            ) : null}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, '\u0627\u0644\u062e\u0637\u0637 \u0648\u0627\u0644\u0634\u062d\u0646', 'Plans & top-up')}</h3>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-3">
            <p className="font-black text-emerald-900 mb-2">{tr(lang, '\u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629', 'Free plan')}</p>
            <p className="text-sm text-emerald-800">{tr(lang, '\u062a\u0634\u0645\u0644 5 \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0634\u0647\u0631\u064a\u064b\u0627\u060c \u0648\u0627\u0644\u062a\u0644\u062e\u064a\u0635 \u0648\u0627\u0644\u0634\u0627\u062a \u0644\u0646\u0641\u0633 \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0628\u062f\u0648\u0646 \u062e\u0635\u0645 \u0625\u0636\u0627\u0641\u064a\u060c', '5 videos monthly, and same-video summary/chat do not consume extra balance.')}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-black text-orange-900 mb-2">{tr(lang, '\u0627\u0644\u0634\u062d\u0646 \u0627\u0644\u0645\u062f\u0641\u0648\u0639', 'Paid top-up')}</p>
            <p className="text-sm text-orange-800 mb-3">
              {tr(lang, 'باقة الدفع الرئيسية: $19 = 200 فيديو، مع بونص 10% لباقات 2x و3x و5x. تفاصيل الدفع تظهر في صفحة مخصصة بعد اختيار الباقة.', 'Main paid pack: $19 = 200 videos, with a 10% bonus on 2x, 3x, and 5x packs. Full payment details open on a dedicated page after selecting the pack.')}
            </p>
            <button
              type="button"
              onClick={onOpenTopupPicker}
              className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
            >
              {tr(lang, '\u0627\u062e\u062a\u0631 \u0628\u0627\u0642\u0629 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a', 'Choose video pack')}
            </button>
          </div>
        </article>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, '\u0623\u0645\u0627\u0646 \u0627\u0644\u062d\u0633\u0627\u0628', 'Account security')}</h3>
          <form onSubmit={onPasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, '\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629', 'New password')}</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => onPasswordFormChange((prev) => ({ ...prev, newPassword: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={tr(lang, '\u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 8 \u0623\u062d\u0631\u0641', 'At least 8 characters')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">{tr(lang, '\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 'Confirm password')}</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => onPasswordFormChange((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={tr(lang, '\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 'Re-enter password')}
              />
            </div>
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {passwordSubmitting ? tr(lang, '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u062f\u064a\u062b\u2026', 'Updating...') : tr(lang, '\u062a\u062d\u062f\u064a\u062b \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', 'Update password')}
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-black text-slate-900 mb-3">{tr(lang, '\u0637\u0648\u0631 \u0646\u062a\u0627\u0626\u062c\u0643 \u0628\u0627\u0644\u0634\u062d\u0646', 'Upgrade your results with top-up')}</h3>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <p className="text-sm text-amber-900 mb-2">
              {tr(lang, '\u0645\u0639 \u0631\u0635\u064a\u062f \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0623\u0643\u062b\u0631\u060c \u062a\u0633\u062a\u0637\u064a\u0639 \u0645\u0639\u0627\u0644\u062c\u0629 \u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0623\u0643\u062b\u0631 \u0628\u062f\u0648\u0646 \u0627\u0646\u0642\u0637\u0627\u0639 \u0648\u0628\u0646\u0627\u0621 \u0645\u0643\u062a\u0628\u0629 \u062a\u0646\u0641\u064a\u0630 \u0623\u0642\u0648\u0649\u060c', 'With more video balance, you can process more videos without interruption and build a stronger execution library.')}
            </p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>{tr(lang, '\u2022 \u0628\u0627\u0642\u0629 \u0648\u0627\u0636\u062d\u0629: $19 = 200 \u0641\u064a\u062f\u064a\u0648', '\u2022 Clear pack: $19 = 200 videos')}</li>
              <li>{tr(lang, '\u2022 \u0628\u0648\u0646\u0635 10% \u0644\u0628\u0627\u0642\u0627\u062a 2x \u0648 3x \u0648 5x', '\u2022 10% bonus on 2x, 3x, and 5x packs')}</li>
              <li>{tr(lang, '\u2022 \u062a\u0633\u0639\u064a\u0631 \u0645\u0628\u0646\u064a \u0639\u0644\u0649 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0628\u062f\u0648\u0646 \u062a\u0639\u0642\u064a\u062f \u0648\u062d\u062f\u0627\u062a', '\u2022 Video-based pricing with clear units')}</li>
              <li>{tr(lang, '\u2022 \u0635\u0641\u062d\u0629 \u062f\u0641\u0639 \u0648\u0627\u0636\u062d\u0629 \u0648\u0645\u0646\u0638\u0645\u0629', '\u2022 Dedicated clear checkout page')}</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            {canUseLocalGuide && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
              >
                {tr(lang, '\u0641\u062a\u062d \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a', 'Open settings')}
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 transition"
            >
              {tr(lang, '\u062a\u0633\u062c\u064a\u0644 \u062e\u0631\u0648\u062c', 'Sign out')}
            </button>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-black text-slate-900">{tr(lang, '\u0637\u0644\u0628\u0627\u062a\u064a \u0627\u0644\u0623\u062e\u064a\u0631\u0629', 'My recent requests', 'Mes demandes recentes')}</h3>
          {recentTopupLoading ? <span className="text-xs text-slate-500">{tr(lang, '\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u062f\u064a\u062b\u2026', 'Refreshing...', 'Actualisation...')}</span> : null}
        </div>

        {recentTopupRequests.length === 0 ? (
          <p className="text-sm text-slate-600">
            {tr(lang, '\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0634\u062d\u0646 \u0628\u0639\u062f\u060c', 'No top-up requests yet.', 'Aucune demande de recharge pour le moment.')}
          </p>
        ) : (
          <div className="max-h-72 overflow-auto space-y-2 pr-1">
            {recentTopupRequests.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-900">
                    ${(Number(item.amount_cents || 0) / 100).toFixed(2)} / {item.credits_added} {tr(lang, '\u0641\u064a\u062f\u064a\u0648', 'videos', 'videos')}
                  </span>
                  <span className={`text-xs rounded-full px-2 py-1 ${paymentRequestStatusClass(item.status)}`}>
                    {paymentRequestStatusLabel(item.status, lang)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.created_at).toLocaleString(lang === LANG.ar ? 'ar-EG' : lang === LANG.fr ? 'fr-FR' : 'en-US')}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
