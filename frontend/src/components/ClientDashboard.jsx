import { FaBolt, FaChartLine, FaHistory, FaMagic } from 'react-icons/fa';
import { LANG, tr } from '../utils/lang';

function ActionCard({ title, text, cta, onClick, tone, icon }) {
  return (
    <article className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-b ${tone}`}>
      <div className="w-11 h-11 rounded-xl bg-white/70 text-slate-800 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-700 mb-5 leading-relaxed">{text}</p>
      <button
        type="button"
        onClick={onClick}
        className="rounded-xl px-4 py-2 bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
      >
        {cta}
      </button>
    </article>
  );
}

function ClientDashboard({ lang = LANG.ar, credits, userEmail, onStartExtract, onOpenHistory, onOpenTopup }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.15em] text-cyan-700 mb-2">{tr(lang, 'نظرة سريعة', 'Quick Snapshot')}</p>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          {tr(lang, 'مرحبًا في مساحة العميل الخاصة بك', 'Welcome to your client workspace')}
        </h2>
        <p className="text-slate-600 mb-4">{tr(lang, 'كل أدواتك الآن مفصولة بوضوح: استخراج، سجل، وحساب.', 'Your tools are now clearly separated: extraction, history, and account.')}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1.5">{tr(lang, 'الحساب', 'Account')}: {userEmail || '-'}</span>
          <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5">{tr(lang, 'الرصيد', 'Credits')}: {credits ?? '...'}</span>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <ActionCard
          title={tr(lang, 'ابدأ استخراج جديد', 'Start New Extraction')}
          text={tr(lang, 'أدخل رابط يوتيوب وابدأ المعالجة الذكية خطوة بخطوة.', 'Add a YouTube link and run AI processing in a focused flow.')}
          cta={tr(lang, 'اذهب لمساحة الاستخراج', 'Go to Workspace')}
          onClick={onStartExtract}
          tone="from-cyan-100 to-blue-100 border-cyan-200"
          icon={<FaMagic />}
        />
        <ActionCard
          title={tr(lang, 'راجع السجل المحفوظ', 'Review Saved History')}
          text={tr(lang, 'ارجع للنتائج السابقة أو اختر رابطًا محفوظًا فورًا.', 'Open previous results or pick a saved link instantly.')}
          cta={tr(lang, 'فتح السجل', 'Open History')}
          onClick={onOpenHistory}
          tone="from-violet-100 to-fuchsia-100 border-violet-200"
          icon={<FaHistory />}
        />
        <ActionCard
          title={tr(lang, 'إدارة الرصيد', 'Manage Credits')}
          text={tr(lang, 'أرسل طلب شحن عبر إنستا باي أو فودافون كاش.', 'Submit a top-up request via InstaPay or Vodafone Cash.')}
          cta={tr(lang, 'شحن الرصيد', 'Top up credits')}
          onClick={onOpenTopup}
          tone="from-amber-100 to-orange-100 border-amber-200"
          icon={<FaBolt />}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2">
          <FaChartLine className="text-cyan-700" />
          <h3 className="font-black text-slate-900">{tr(lang, 'حالة التجربة', 'Experience Status')}</h3>
        </div>
        <p className="text-sm text-slate-600">
          {tr(
            lang,
            'تمت إعادة هيكلة الواجهة إلى صفحات مخصصة: صفحة عميل، صفحة استخراج، وصفحة سجل/روابط لتجربة أوضح.',
            'The interface is now split into dedicated pages: client dashboard, extraction workspace, and history/links for clearer UX.'
          )}
        </p>
      </section>
    </div>
  );
}

export default ClientDashboard;
