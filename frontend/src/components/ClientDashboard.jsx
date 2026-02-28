import { FaBolt, FaHistory, FaMagic } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function ActionCard({ title, text, cta, onClick, tone, icon, theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <article className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-b ${tone}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-900/60 text-slate-100' : 'bg-white/70 text-slate-800'}`}>
        {icon}
      </div>
      <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-sm mb-5 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{text}</p>
      <button
        type="button"
        onClick={onClick}
        className={`rounded-xl px-4 py-2 font-bold transition ${isDark ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
      >
        {cta}
      </button>
    </article>
  );
}

function ClientDashboard({
  lang = LANG.ar,
  theme = 'light',
  credits,
  freeLinksRemaining = 5,
  userEmail,
  onStartExtract,
  onOpenHistory,
  onOpenTopup
}) {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className={`rounded-2xl border p-5 sm:p-7 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <p className={`text-xs uppercase tracking-[0.15em] mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
          {tr(lang, 'نظرة سريعة', 'Quick Snapshot')}
        </p>
        <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {tr(lang, 'مرحبًا في مساحة العميل الخاصة بك', 'Welcome to your client workspace')}
        </h2>
        <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
          {tr(
            lang,
            'الخطة المجانية: 5 روابط فيديو فقط. بعد استخراج الفيديو يمكنك التلخيص والدردشة عليه بدون خصم إضافي.',
            'Free plan: 5 video links only. After extraction, summary and chat on that same video do not consume extra credits.'
          )}
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className={`${isDark ? 'bg-cyan-950 text-cyan-200 border-cyan-800' : 'bg-cyan-50 text-cyan-800 border-cyan-200'} rounded-full border px-3 py-1.5`}>
            {tr(lang, 'الحساب', 'Account')}: {userEmail || '-'}
          </span>
          <span className={`${isDark ? 'bg-amber-950 text-amber-200 border-amber-800' : 'bg-amber-50 text-amber-800 border-amber-200'} rounded-full border px-3 py-1.5`}>
            {tr(lang, 'الرصيد الحالي', 'Current credits')}: {credits ?? '...'}
          </span>
          <span className={`${isDark ? 'bg-emerald-950 text-emerald-200 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'} rounded-full border px-3 py-1.5`}>
            {tr(lang, 'المتبقي من المجانية', 'Free links remaining')}: {freeLinksRemaining} / 5
          </span>
          <span className={`${isDark ? 'bg-orange-950 text-orange-200 border-orange-800' : 'bg-orange-50 text-orange-800 border-orange-200'} rounded-full border px-3 py-1.5`}>
            {tr(lang, 'الشحن المدفوع', 'Paid top-up')}: {tr(lang, 'يبدأ من', 'starts at')} 200 {tr(lang, 'نقطة', 'credits')} / $5
          </span>
          <span className={`${isDark ? 'bg-rose-950 text-rose-200 border-rose-800' : 'bg-rose-50 text-rose-800 border-rose-200'} rounded-full border px-3 py-1.5`}>
            {tr(lang, 'خصومات تلقائية للشحنات الأكبر', 'Bonus credits for larger top-ups')}
          </span>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <ActionCard
          theme={theme}
          title={tr(lang, 'ابدأ استخراج جديد', 'Start New Extraction')}
          text={tr(lang, 'أدخل رابط يوتيوب وابدأ المعالجة الذكية خطوة بخطوة.', 'Add a YouTube link and run AI processing in a focused flow.')}
          cta={tr(lang, 'اذهب لمساحة الاستخراج', 'Go to Workspace')}
          onClick={onStartExtract}
          tone={isDark ? 'from-cyan-950 to-blue-950 border-cyan-900' : 'from-cyan-100 to-blue-100 border-cyan-200'}
          icon={<FaMagic />}
        />
        <ActionCard
          theme={theme}
          title={tr(lang, 'راجع السجل المحفوظ', 'Review Saved History')}
          text={tr(lang, 'ارجع للنتائج السابقة أو اختر رابطًا محفوظًا فورًا.', 'Open previous results or pick a saved link instantly.')}
          cta={tr(lang, 'فتح السجل', 'Open History')}
          onClick={onOpenHistory}
          tone={isDark ? 'from-violet-950 to-fuchsia-950 border-violet-900' : 'from-violet-100 to-fuchsia-100 border-violet-200'}
          icon={<FaHistory />}
        />
        <ActionCard
          theme={theme}
          title={tr(lang, 'إدارة الرصيد', 'Manage Credits')}
          text={tr(lang, 'الشحن يبدأ من 5$ = 200 كريديت، ويمكن زيادة المبلغ بمضاعفات 5$ مع خصومات تلقائية.', 'Top-up starts at $5 = 200 credits, with automatic bonus credits on larger amounts.')}
          cta={tr(lang, 'شحن الرصيد', 'Top up credits')}
          onClick={onOpenTopup}
          tone={isDark ? 'from-amber-950 to-orange-950 border-amber-900' : 'from-amber-100 to-orange-100 border-amber-200'}
          icon={<FaBolt />}
        />
      </section>
    </div>
  );
}

export default ClientDashboard;
