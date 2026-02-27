function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">{title}</h2>
      <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function CompliancePageLayout({ title, subtitle, children, updatedOn = 'February 27, 2026' }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 mb-6">
          <a href="/" className="text-sm text-cyan-700 hover:underline">{'<-'} Back to Home</a>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">{title}</h1>
          <p className="text-slate-600 mt-2">{subtitle}</p>
          <p className="text-xs text-slate-500 mt-3">Last updated: {updatedOn}</p>
        </header>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          {children}
        </article>
      </div>
    </main>
  );
}

CompliancePageLayout.Section = Section;

export default CompliancePageLayout;
