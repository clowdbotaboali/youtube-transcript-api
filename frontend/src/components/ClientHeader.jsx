import { FaCog, FaGem, FaHistory, FaHome, FaMagic, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

const PAGES = {
  dashboard: 'dashboard',
  workspace: 'workspace',
  history: 'history',
  account: 'account'
};

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-cyan-300 text-slate-950' : 'text-slate-200 hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ClientHeader({
  lang = LANG.ar,
  userEmail,
  credits,
  freePlanRequests = 5,
  requestCost = 1,
  paidPlanCredits = 200,
  paidPlanPrice = 5,
  currentPage,
  onPageChange,
  onToggleLang,
  onOpenSettings,
  onOpenPricing,
  onLogout
}) {
  return (
    <header className="rounded-2xl border border-slate-700/80 bg-[linear-gradient(160deg,#0b1224_0%,#111b34_70%,#1a2140_100%)] text-slate-100 p-4 sm:p-5 mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-cyan-300 uppercase tracking-[0.18em] mb-1">Client Zone</p>
          <h1 className="text-xl sm:text-2xl font-black">{tr(lang, 'لوحة العميل', 'Client Dashboard')}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">{userEmail || '-'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-amber-300/40 bg-amber-500/15 px-3 py-2 text-amber-100">
            <div className="inline-flex items-center gap-2">
              <FaGem />
              <span className="font-black text-lg">{credits ?? '...'}</span>
              <span className="text-sm">{tr(lang, 'نقطة', 'credits')}</span>
            </div>
            <p className="text-[11px] opacity-90 mt-1">
              {tr(lang, 'كل رابط فيديو جديد =', 'Each new video link =')} {requestCost} {tr(lang, 'نقطة', 'credit')}
            </p>
            <p className="text-[11px] opacity-90">
              {tr(lang, 'الخطة المجانية:', 'Free plan:')} {freePlanRequests} {tr(lang, 'روابط فقط', 'links only')}
            </p>
            <p className="text-[11px] opacity-90">
              {paidPlanCredits} {tr(lang, 'نقطة', 'credits')} = ${paidPlanPrice}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPricing}
            className="rounded-xl px-4 py-2 bg-orange-400 text-slate-950 font-extrabold hover:bg-orange-300 transition"
          >
            {tr(lang, 'اشحن', 'Top up')}
          </button>
          <button
            type="button"
            onClick={onToggleLang}
            className="rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 transition font-semibold"
          >
            {lang === LANG.ar ? 'EN' : 'AR'}
          </button>
          {typeof onOpenSettings === 'function' && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20 transition"
            >
              <FaCog />
              <span>{tr(lang, 'الإعدادات', 'Settings')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition border border-red-400/20"
          >
            <FaSignOutAlt />
            <span>{tr(lang, 'خروج', 'Logout')}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <NavButton
          active={currentPage === PAGES.dashboard}
          onClick={() => onPageChange(PAGES.dashboard)}
          icon={<FaHome />}
          label={tr(lang, 'الرئيسية', 'Overview')}
        />
        <NavButton
          active={currentPage === PAGES.workspace}
          onClick={() => onPageChange(PAGES.workspace)}
          icon={<FaMagic />}
          label={tr(lang, 'الاستخراج والمعالجة', 'Extract & Process')}
        />
        <NavButton
          active={currentPage === PAGES.history}
          onClick={() => onPageChange(PAGES.history)}
          icon={<FaHistory />}
          label={tr(lang, 'السجل والروابط', 'History & Links')}
        />
        <NavButton
          active={currentPage === PAGES.account}
          onClick={() => onPageChange(PAGES.account)}
          icon={<FaUserCircle />}
          label={tr(lang, 'حسابي', 'My Account')}
        />
      </div>
    </header>
  );
}

export { PAGES };
export default ClientHeader;
