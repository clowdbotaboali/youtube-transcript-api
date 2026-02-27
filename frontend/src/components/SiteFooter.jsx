function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-slate-600">
          (c) {new Date().getFullYear()} Transcript AI. Digital transcript generation service.
        </p>
        <nav className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <a href="/privacy-policy" className="text-slate-700 hover:text-cyan-700 hover:underline">Privacy Policy</a>
          <a href="/terms" className="text-slate-700 hover:text-cyan-700 hover:underline">Terms</a>
          <a href="/refund-policy" className="text-slate-700 hover:text-cyan-700 hover:underline">Refund Policy</a>
          <a href="/contact" className="text-slate-700 hover:text-cyan-700 hover:underline">Contact</a>
          <a href="/pricing" className="text-slate-700 hover:text-cyan-700 hover:underline">Pricing</a>
        </nav>
      </div>
    </footer>
  );
}

export default SiteFooter;
