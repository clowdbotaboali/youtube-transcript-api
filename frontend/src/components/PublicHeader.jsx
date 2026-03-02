import { FaHome, FaMoon, FaSun } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function PublicHeader({ lang = LANG.ar, currentPath = '/', onLangChange, onToggleTheme, theme = 'light' }) {
  const isArabic = lang === LANG.ar;
  const isDark = theme === 'dark';


  const links = [
    { href: '/pricing', label: tr(lang, 'الأسعار', 'Pricing', 'Tarification') },
    { href: '/privacy-policy', label: tr(lang, 'سياسة الخصوصية', 'Privacy Policy', 'Politique de confidentialite') },
    { href: '/terms', label: tr(lang, 'الشروط', 'Terms', 'Conditions') },
    { href: '/refund-policy', label: tr(lang, 'سياسة الاسترجاع', 'Refund Policy', 'Politique de remboursement') },
    { href: '/contact', label: tr(lang, 'تواصل', 'Contact', 'Contact') }
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 border-b backdrop-blur ${
        isDark ? 'border-slate-800/80 bg-slate-950/90 text-slate-100' : 'border-slate-200/70 bg-white/90 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <a href="/" className="font-black tracking-wide whitespace-nowrap">TRANSCRIPT AI</a>
          <span className={`hidden sm:inline text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {tr(
              lang,
              'خدمة رقمية لاستخراج النص من الفيديو',
              'Digital transcript generation service',
              'Service numerique de generation de transcription'
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentPath !== '/' && (
            <a
              href="/"
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                isDark ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <FaHome />
              <span>{tr(lang, 'الرئيسية', 'Home', 'Accueil')}</span>
            </a>
          )}

          <nav className="flex items-center gap-2 max-w-[46vw] overflow-x-auto scrollbar-thin">
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-1.5 text-sm transition ${
                  currentPath === item.href
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                      : 'bg-cyan-100 text-cyan-800 font-bold'
                    : isDark
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`rounded-xl p-2.5 border transition ${
              isDark
                ? 'border-slate-700 text-amber-300 hover:bg-slate-800'
                : 'border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
            title={tr(lang, 'تبديل الوضع الليلي/النهاري', 'Toggle dark/light mode', 'Basculer mode sombre/clair')}
          >
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
          <select
            value={lang}
            onChange={(event) => onLangChange?.(event.target.value)}
            className={`rounded-xl px-3 py-1.5 border text-sm font-bold transition outline-none ${
              isDark
                ? 'border-slate-700 text-slate-100 hover:bg-slate-800'
                : 'border-slate-300 text-slate-800 hover:bg-slate-100'
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

