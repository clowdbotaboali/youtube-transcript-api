import { LANG, tr } from '../utils/lang';

function SiteFooter({ lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';
  return (
    <footer className={`mt-10 border-t ${isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/90'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          (c) {new Date().getFullYear()} Transcripta AI.{' '}
          {tr(
            lang,
            'منصة لاستخراج المعرفة وتحويلها إلى خطوات قابلة للتطبيق من الفيديوهات الطويلة',
            'Knowledge extraction and implementation platform for long videos',
            'Plateforme dextraction de connaissance et dimplementation pour videos longues'
          )}
        </p>
        <nav className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <a href="/privacy-policy" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'سياسة الخصوصية', 'Privacy Policy', 'Politique de confidentialite')}
          </a>
          <a href="/terms" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'الشروط', 'Terms', 'Conditions')}
          </a>
          <a href="/refund-policy" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'سياسة الاسترجاع', 'Refund Policy', 'Politique de remboursement')}
          </a>
          <a href="/contact" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'تواصل', 'Contact', 'Contact')}
          </a>
          <a href="/pricing" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'الأسعار', 'Pricing', 'Tarification')}
          </a>
          <a href="/about" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'من نحن', 'About', 'A propos')}
          </a>
          <a href="/insights" className={isDark ? 'text-slate-300 hover:text-cyan-300 hover:underline' : 'text-slate-700 hover:text-cyan-700 hover:underline'}>
            {tr(lang, 'مكتبة المعرفة', 'Insights', 'Insights')}
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default SiteFooter;
