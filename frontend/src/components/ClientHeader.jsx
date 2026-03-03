import {
  FaBolt,
  FaCog,
  FaGem,
  FaHistory,
  FaHome,
  FaMagic,
  FaMoon,
  FaSignOutAlt,
  FaSyncAlt,
  FaSun,
  FaUserCircle
} from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

const PAGES = {
  dashboard: 'dashboard',
  workspace: 'workspace',
  history: 'history',
  account: 'account',
  topup: 'topup'
};

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border transition ${
        active
          ? 'bg-cyan-300 text-slate-950 border-cyan-200 shadow-[0_10px_24px_-14px_rgba(34,211,238,0.9)]'
          : 'text-slate-100 border-white/10 hover:bg-white/10 hover:border-white/25'
      }`}
    >
      <span className={`${active ? 'text-slate-900' : 'text-slate-200 group-hover:text-white'} transition`}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricCard({ label, value, subtext, tone, icon, progress = null }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border px-3.5 py-3 ${tone}`}>
      <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/8 blur-2xl" />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.12em] opacity-80">{label}</p>
        {icon ? <span className="text-sm opacity-90">{icon}</span> : null}
      </div>
      <p className="relative text-lg font-black leading-tight mt-1">{value}</p>
      {subtext ? <p className="text-[11px] opacity-80 mt-1">{subtext}</p> : null}
      {typeof progress === 'number' ? (
        <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full bg-white/70 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function ClientHeader({
  lang = LANG.ar,
  theme = 'light',
  userEmail,
  credits,
  freeLinksRemaining = 5,
  freePlanRequests = 5,
  requestCost = 1,
  paidPlanCredits = 200,
  paidPlanPrice = 5,
  currentPage,
  onPageChange,
  onLangChange,
  onToggleTheme,
  onRefreshPoints,
  refreshBusy = false,
  onOpenSettings,
  onOpenPricing,
  onLogout
}) {
  const isDark = theme === 'dark';
  const safeFreePlanRequests = Math.max(Number(freePlanRequests || 0), 0);
  const safeFreeLinksRemaining = Math.max(Number(freeLinksRemaining || 0), 0);
  const freeProgress = safeFreePlanRequests > 0
    ? Math.round((Math.min(safeFreeLinksRemaining, safeFreePlanRequests) / safeFreePlanRequests) * 100)
    : 0;

  const freePlanText = tr(
    lang,
    `${freeLinksRemaining} من ${freePlanRequests}`,
    `${freeLinksRemaining} of ${freePlanRequests}`,
    `${freeLinksRemaining} sur ${freePlanRequests}`
  );

  return (
    <header className="relative z-10 rounded-3xl border border-slate-700/70 bg-[linear-gradient(145deg,#061329_0%,#0c2a46_50%,#1c2555_100%)] text-slate-100 p-4 sm:p-5 mb-4 sm:mb-6 overflow-hidden shadow-[0_20px_60px_-35px_rgba(2,6,23,0.95)]">
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_8%_10%,#22d3ee_0%,transparent_40%),radial-gradient(circle_at_85%_18%,#60a5fa_0%,transparent_35%),radial-gradient(circle_at_55%_95%,#6366f1_0%,transparent_35%)]" />
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      <div className="relative space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto] gap-4 items-start">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-cyan-200">Client Zone</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">{tr(lang, 'لوحة العميل', 'Client Dashboard', 'Espace Client')}</h1>
              <p className="text-xs sm:text-sm text-slate-200/90 mt-1 break-all">{userEmail || '-'}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200">
              <FaBolt className="text-cyan-300" />
              <span>{tr(lang, 'مساحة العمل الذكية جاهزة للاستخدام', 'Smart workspace is ready', 'Espace intelligent pret a l utilisation')}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-1.5">
              <button
                type="button"
                onClick={onOpenPricing}
                className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
              >
                {tr(lang, 'اشحن', 'Top up', 'Recharger')}
              </button>
              <button
                type="button"
                onClick={onRefreshPoints}
                disabled={refreshBusy}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 transition border border-emerald-300/20 disabled:opacity-70"
              >
                <FaSyncAlt className={refreshBusy ? 'animate-spin' : ''} />
                <span>{tr(lang, 'تحديث النقاط', 'Refresh points', 'Actualiser points')}</span>
              </button>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-1.5 shrink-0">
              {typeof onOpenSettings === 'function' && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-slate-100 hover:bg-white/15 transition"
                  title={tr(lang, 'الإعدادات', 'Settings', 'Parametres')}
                >
                  <FaCog />
                </button>
              )}
              <button
                type="button"
                onClick={onToggleTheme}
                className={`w-9 h-9 rounded-lg inline-flex items-center justify-center transition ${
                  isDark ? 'text-amber-200 hover:bg-white/15' : 'text-white hover:bg-white/15'
                }`}
                title={tr(lang, 'تبديل الوضع الليلي/النهاري', 'Toggle dark/light mode', 'Basculer mode sombre/clair')}
              >
                {isDark ? <FaSun /> : <FaMoon />}
              </button>
              <select
                value={lang}
                onChange={(event) => onLangChange?.(event.target.value)}
                className="h-9 rounded-lg px-2.5 bg-white/10 hover:bg-white/20 transition font-semibold border border-white/20 outline-none text-slate-100"
                title={tr(lang, 'Switch language', 'Switch language', 'Changer la langue')}
              >
                <option value={LANG.en} className="text-slate-900 bg-white">EN</option>
                <option value={LANG.ar} className="text-slate-900 bg-white">AR</option>
                <option value={LANG.fr} className="text-slate-900 bg-white">FR</option>
              </select>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 h-9 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition border border-red-400/20"
                title={tr(lang, 'خروج', 'Logout', 'Deconnexion')}
              >
                <FaSignOutAlt />
                <span className="text-xs font-semibold">{tr(lang, 'خروج', 'Logout', 'Deconnexion')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          <MetricCard
            label={tr(lang, 'الرصيد', 'Credits', 'Credits')}
            value={
              <span className="inline-flex items-center gap-2">
                <FaGem className="text-amber-300" />
                <span>{credits ?? '...'}</span>
              </span>
            }
            subtext={tr(lang, 'الرصيد الحالي المتاح للاستخدام', 'Current available credit balance', 'Solde actuel disponible')}
            tone="border-amber-300/40 bg-amber-500/15 text-amber-100"
            icon={<FaGem className="text-amber-200" />}
          />

          <MetricCard
            label={tr(lang, 'الخطة المجانية', 'Free Plan', 'Plan gratuit')}
            value={freePlanText}
            subtext={tr(lang, 'روابط متبقية هذا الشهر', 'Links remaining this period', 'Liens restants pour cette periode')}
            tone="border-emerald-300/30 bg-emerald-500/15 text-emerald-100"
            icon={<FaMagic className="text-emerald-200" />}
            progress={freeProgress}
          />

          <MetricCard
            label={tr(lang, 'تكلفة الرابط', 'Per-link cost', 'Cout par lien')}
            value={`${requestCost} ${tr(lang, 'نقطة', 'credit', 'credit')}`}
            subtext={tr(lang, 'يُخصم فقط عند رابط فيديو جديد', 'Charged only for new video links', 'Facture uniquement pour nouveaux liens video')}
            tone="border-cyan-300/30 bg-cyan-500/15 text-cyan-100"
            icon={<FaBolt className="text-cyan-200" />}
          />

          <MetricCard
            label={tr(lang, 'الشحن المدفوع', 'Paid top-up', 'Recharge payante')}
            value={`$${paidPlanPrice} = ${paidPlanCredits}`}
            subtext={tr(lang, 'خصومات تلقائية للشحنات الأكبر', 'Automatic bonus credits on larger top-ups', 'Bonus automatiques sur montants eleves')}
            tone="border-violet-300/30 bg-violet-500/15 text-violet-100"
            icon={<FaGem className="text-violet-200" />}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/25 p-2 flex flex-wrap gap-2">
          <NavButton
            active={currentPage === PAGES.dashboard}
            onClick={() => onPageChange(PAGES.dashboard)}
            icon={<FaHome />}
            label={tr(lang, 'الرئيسية', 'Overview', 'Accueil')}
          />
          <NavButton
            active={currentPage === PAGES.workspace}
            onClick={() => onPageChange(PAGES.workspace)}
            icon={<FaMagic />}
            label={tr(lang, 'الاستخراج والمعالجة', 'Extract & Process', 'Extraction et traitement')}
          />
          <NavButton
            active={currentPage === PAGES.history}
            onClick={() => onPageChange(PAGES.history)}
            icon={<FaHistory />}
            label={tr(lang, 'السجل والروابط', 'History & Links', 'Historique et liens')}
          />
          <NavButton
            active={currentPage === PAGES.account || currentPage === PAGES.topup}
            onClick={() => onPageChange(PAGES.account)}
            icon={<FaUserCircle />}
            label={tr(lang, 'حسابي', 'My Account', 'Mon compte')}
          />
        </div>
      </div>
    </header>
  );
}

export { PAGES };
export default ClientHeader;
