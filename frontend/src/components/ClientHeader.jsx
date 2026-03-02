import {
  FaBolt,
  FaCog,
  FaGem,
  FaHistory,
  FaHome,
  FaMagic,
  FaMoon,
  FaSignOutAlt,
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
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-cyan-300 text-slate-950 shadow-sm' : 'text-slate-100 hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ExternalTab({ href, label }) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-sm rounded-xl border border-white/25 text-slate-100 bg-white/5 hover:bg-white/15 transition whitespace-nowrap"
    >
      {label}
    </a>
  );
}

function MetricCard({ label, value, subtext, tone }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <p className="text-[11px] uppercase tracking-[0.12em] opacity-80">{label}</p>
      <p className="text-lg font-black leading-tight mt-0.5">{value}</p>
      {subtext ? <p className="text-[11px] opacity-80 mt-1">{subtext}</p> : null}
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
  onOpenSettings,
  onOpenPricing,
  onLogout
}) {
  const isDark = theme === 'dark';

  const legalTabs = [
    { href: '/pricing', label: tr(lang, 'الأسعار', 'Pricing', 'Tarification') },
    { href: '/privacy-policy', label: tr(lang, 'سياسة الخصوصية', 'Privacy Policy', 'Politique de confidentialite') },
    { href: '/terms', label: tr(lang, 'الشروط', 'Terms', 'Conditions') },
    { href: '/refund-policy', label: tr(lang, 'سياسة الاسترجاع', 'Refund Policy', 'Politique de remboursement') },
    { href: '/contact', label: tr(lang, 'تواصل', 'Contact', 'Contact') }
  ];

  return (
    <header className="sticky top-0 z-30 rounded-3xl border border-slate-700/80 bg-[linear-gradient(160deg,#071229_0%,#0f1d3a_60%,#18274b_100%)] text-slate-100 p-4 sm:p-5 mb-4 sm:mb-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_12%_12%,#22d3ee_0%,transparent_45%),radial-gradient(circle_at_88%_22%,#6366f1_0%,transparent_40%)]" />

      <div className="relative">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <p className="text-xs text-cyan-300 uppercase tracking-[0.18em] mb-1">Client Zone</p>
            <h1 className="text-xl sm:text-2xl font-black">{tr(lang, 'لوحة العميل', 'Client Dashboard', 'Espace Client')}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 break-all">{userEmail || '-'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <button
              type="button"
              onClick={onOpenPricing}
              className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
            >
              {tr(lang, 'اشحن', 'Top up', 'Recharger')}
            </button>

            {typeof onOpenSettings === 'function' && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 transition"
              >
                <FaCog />
                <span>{tr(lang, 'الإعدادات', 'Settings', 'Parametres')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition border border-red-400/20"
            >
              <FaSignOutAlt />
              <span>{tr(lang, 'خروج', 'Logout', 'Deconnexion')}</span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-1.5 shrink-0">
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
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {legalTabs.map((item) => (
            <ExternalTab key={item.href} href={item.href} label={item.label} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-4">
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
          />

          <MetricCard
            label={tr(lang, 'الخطة المجانية', 'Free Plan', 'Plan gratuit')}
            value={`${freeLinksRemaining} / ${freePlanRequests}`}
            subtext={tr(lang, 'روابط متبقية هذا الشهر', 'Links remaining this period', 'Liens restants pour cette periode')}
            tone="border-emerald-300/30 bg-emerald-500/15 text-emerald-100"
          />

          <MetricCard
            label={tr(lang, 'تكلفة الرابط', 'Per-link cost', 'Cout par lien')}
            value={`${requestCost} ${tr(lang, 'نقطة', 'credit', 'credit')}`}
            subtext={tr(lang, 'يُخصم فقط عند رابط فيديو جديد', 'Charged only for new video links', 'Facture uniquement pour nouveaux liens video')}
            tone="border-cyan-300/30 bg-cyan-500/15 text-cyan-100"
          />

          <MetricCard
            label={tr(lang, 'الشحن المدفوع', 'Paid top-up', 'Recharge payante')}
            value={`$${paidPlanPrice} = ${paidPlanCredits}`}
            subtext={tr(lang, 'خصومات تلقائية للشحنات الأكبر', 'Automatic bonus credits on larger top-ups', 'Bonus automatiques sur montants eleves')}
            tone="border-violet-300/30 bg-violet-500/15 text-violet-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
