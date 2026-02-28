import { LANG, tr } from '../utils/lang';

function Section({ title, children, theme = 'light' }) {
  const isDark = theme === 'dark';
  return (
    <section className="mb-6">
      <h2 className={`text-xl sm:text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h2>
      <div className={`text-sm sm:text-base leading-relaxed space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{children}</div>
    </section>
  );
}

function CompliancePageLayout({
  title,
  subtitle,
  children,
  updatedOnAr = '28 فبراير 2026',
  updatedOnEn = 'February 28, 2026',
  updatedOnFr = '28 fevrier 2026',
  lang = LANG.ar,
  theme = 'light'
}) {
  const isDark = theme === 'dark';
  const updatedOn = lang === LANG.ar ? updatedOnAr : lang === LANG.fr ? updatedOnFr : updatedOnEn;

  return (
    <main
      className={`min-h-screen pt-20 ${
        isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]'
      }`}
      dir={lang === LANG.ar ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className={`rounded-2xl border p-5 sm:p-7 mb-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h1 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h1>
          <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{subtitle}</p>
          <p className={`text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {tr(lang, 'آخر تحديث:', 'Last updated:', 'Derniere mise a jour:')} {updatedOn}
          </p>
        </header>
        <article className={`rounded-2xl border p-5 sm:p-7 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          {children}
        </article>
      </div>
    </main>
  );
}

CompliancePageLayout.Section = Section;

export default CompliancePageLayout;
