import SeoMeta from '../components/SeoMeta';

function PricingPage() {
  return (
    <>
      <SeoMeta
        title="Pricing | Transcript AI"
        description="Pricing plans for Transcript AI digital transcript generation service."
        path="/pricing"
      />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 mb-6">
            <a href="/" className="text-sm text-cyan-700 hover:underline">{'<-'} Back to Home</a>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">Pricing</h1>
            <p className="text-slate-600 mt-2">
              Transcript AI is a digital transcript generation service. Payments are for service access only.
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-4">
            <article className="rounded-2xl border border-emerald-200 bg-white p-6">
              <p className="inline-flex text-xs font-bold rounded-full px-2 py-1 bg-emerald-100 text-emerald-800 mb-3">Active</p>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Free Plan</h2>
              <p className="text-slate-600 mb-4">5 video links included. Summary and chat on the same extracted video are included without extra charge.</p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>- 5 unique video links</li>
                <li>- Each new link costs 1 credit</li>
                <li>- Same-video summary/chat does not consume extra credits</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-300 bg-white p-6">
              <p className="inline-flex text-xs font-bold rounded-full px-2 py-1 bg-slate-100 text-slate-700 mb-3">Coming Soon</p>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Pro Plan</h2>
              <p className="text-slate-600 mb-4">Paid access tier currently under payment gateway onboarding.</p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>- Expanded request capacity</li>
                <li>- Priority processing queue</li>
                <li>- Launching after payment approval</li>
              </ul>
            </article>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h3 className="text-xl font-black text-slate-900 mb-2">Service and Compliance Notes</h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              This platform provides digital transcript generation access only. No marketplace functionality is offered.
              No user-to-user financial transfer is supported. No third-party funds are held by this service.
              Charges apply solely to transcript generation service access.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

export default PricingPage;
