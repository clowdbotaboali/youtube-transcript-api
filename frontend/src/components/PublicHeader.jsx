import { FaMoon, FaSun } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function PublicHeader({
  lang = LANG.ar,
  currentPath = '/',
  onLangChange,
  onToggleTheme,
  theme = 'light',
  isAuthenticated = false
}) {
  const isArabic = lang === LANG.ar;
  const isDark = theme === 'dark';
  const pricingHref = '/#landing-pricing';
  const accountHref = isAuthenticated ? '/' : '/?auth=login';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b backdrop-blur ${
        isDark ? 'border-slate-800/80 bg-slate-950/90 text-slate-100' : 'border-slate-200/70 bg-white/90 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
        <a href="/" className="font-black tracking-wide whitespace-nowrap">
          TRANSCRIPTA AI
        </a>

        <div className="flex items-center gap-2">
          <a
            href={pricingHref}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              currentPath === '/pricing'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-200'
                  : 'bg-cyan-100 text-cyan-800'
                : isDark
                  ? 'text-slate-200 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tr(lang, 'الأسعار', 'Pricing', 'Tarification')}
          </a>

          <a
            href={accountHref}
            className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${
              isDark ? 'border border-slate-700 text-slate-100 hover:bg-slate-800' : 'border border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
          >
            {isAuthenticated
              ? tr(lang, 'لوحة العميل', 'Dashboard', 'Tableau de bord')
              : tr(lang, 'تسجيل دخول', 'Sign in', 'Connexion')}
          </a>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`rounded-xl p-2.5 border transition ${
              isDark ? 'border-slate-700 text-amber-300 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
            title={tr(lang, 'تبديل الوضع', 'Toggle dark/light mode', 'Basculer mode sombre/clair')}
          >
            {isDark ? <FaSun /> : <FaMoon />}
          </button>

          <select
            value={lang}
            onChange={(event) => onLangChange?.(event.target.value)}
            className={`rounded-xl px-3 py-1.5 border text-sm font-bold transition outline-none ${
              isDark ? 'border-slate-700 text-slate-100 hover:bg-slate-800' : 'border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
            title={tr(lang, 'Switch language', 'Switch language', 'Changer la langue')}
          >
            <option value={LANG.en}>EN</option>
            <option value={LANG.ar}>AR</option>
            <option value={LANG.fr}>FR</option>
          </select>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;

