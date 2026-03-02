import SeoMeta from '../components/SeoMeta';
import { LANG, tr } from '../utils/lang';

function PricingPage({ lang = LANG.ar, theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <>
      <SeoMeta
        title={tr(lang, 'الأسعار | Transcripta AI', 'Pricing | Transcripta AI', 'Tarification | Transcripta AI')}
        description={tr(
          lang,
          'خطط وأسعار خدمة Transcripta AI الرقمية.',
          'Pricing plans for Transcripta AI digital transcript generation service.',
          'Plans tarifaires du service numerique Transcripta AI.'
        )}
        path="/pricing"
      />

      <main
        className={`min-h-screen pt-20 ${
          isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0b1224_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]'
        }`}
        dir={lang === LANG.ar ? 'rtl' : 'ltr'}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <header className={`rounded-2xl border p-6 sm:p-8 mb-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h1 className={`text-3xl sm:text-4xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {tr(lang, 'الأسعار', 'Pricing', 'Tarification')}
            </h1>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mt-2`}>
              {tr(
                lang,
                'Transcripta AI خدمة رقمية لاستخراج النصوص. المدفوعات للوصول إلى الخدمة فقط.',
                'Transcripta AI is a digital transcript generation service. Payments are for service access only.',
                'Transcripta AI est un service numerique de generation de transcriptions. Les paiements sont uniquement pour l acces au service.'
              )}
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-4">
            <article className={`rounded-2xl border p-6 ${isDark ? 'border-emerald-700/60 bg-slate-900' : 'border-emerald-200 bg-white'}`}>
              <p className="inline-flex text-xs font-bold rounded-full px-2 py-1 bg-emerald-100 text-emerald-800 mb-3">
                {tr(lang, 'نشطة', 'Active', 'Actif')}
              </p>
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'الخطة المجانية', 'Free Plan', 'Plan gratuit')}
              </h2>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {tr(
                  lang,
                  'تشمل 5 روابط فيديو. التلخيص والشات لنفس الفيديو بعد استخراجه بدون تكلفة إضافية.',
                  'Includes 5 video links. Summary and chat on the same extracted video are included with no extra charge.',
                  'Inclut 5 liens video. Le resume et le chat sur la meme video n ont pas de cout supplementaire.'
                )}
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <li>{tr(lang, '- 5 روابط فيديو فريدة', '- 5 unique video links', '- 5 liens video uniques')}</li>
                <li>{tr(lang, '- كل رابط جديد = 1 كريديت', '- Each new link costs 1 credit', '- Chaque nouveau lien coute 1 credit')}</li>
                <li>{tr(lang, '- تلخيص/شات نفس الفيديو بلا خصم إضافي', '- Same-video summary/chat has no extra charge', '- Resume/chat de la meme video sans cout supplementaire')}</li>
              </ul>
            </article>

            <article className={`rounded-2xl border p-6 ${isDark ? 'border-orange-700/60 bg-slate-900' : 'border-orange-300 bg-white'}`}>
              <p className="inline-flex text-xs font-bold rounded-full px-2 py-1 bg-orange-100 text-orange-700 mb-3">
                {tr(lang, 'نشطة', 'Active', 'Actif')}
              </p>
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'الشحن المدفوع', 'Paid Top-up', 'Recharge payante')}
              </h2>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {tr(
                  lang,
                  'مبلغ مرن بمضاعفات 5$ عبر إنستا باي أو فودافون كاش.',
                  'Flexible amount in $5 increments using InstaPay or Vodafone Cash.',
                  'Montant flexible par tranches de 5 $ via InstaPay ou Vodafone Cash.'
                )}
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <li>{tr(lang, '- يبدأ من 200 كريديت مقابل 5$', '- Starts at 200 credits for $5', '- Commence a 200 credits pour 5 $')}</li>
                <li>{tr(lang, '- الشحنات الأكبر تحصل على كريديت إضافي تلقائيًا', '- Higher amounts receive bonus credits automatically', '- Les montants eleves recoivent des credits bonus automatiquement')}</li>
                <li>{tr(lang, '- مراجعة واعتماد يدوي لطلبات الدفع', '- Manual review and approval flow', '- Revue et approbation manuelles des paiements')}</li>
              </ul>
            </article>
          </section>

          <section className={`mt-6 rounded-2xl border p-5 sm:p-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {tr(lang, 'ملاحظات الخدمة والامتثال', 'Service and Compliance Notes', 'Notes de service et conformite')}
            </h3>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'} text-sm sm:text-base leading-relaxed`}>
              {tr(
                lang,
                'هذه المنصة توفر وصولًا لخدمة استخراج النصوص الرقمية فقط. لا توجد وظائف سوق أو وسيط. لا يتم دعم تحويل أموال بين المستخدمين، ولا تحتفظ الخدمة بأموال طرف ثالث. الرسوم تخص الوصول للخدمة فقط.',
                'This platform provides digital transcript generation access only. No marketplace functionality is offered. No user-to-user financial transfer is supported. No third-party funds are held by this service. Charges apply solely to transcript generation service access.',
                'Cette plateforme fournit uniquement un acces au service numerique de generation de transcriptions. Aucun marche ni transfert financier entre utilisateurs. Aucun fonds tiers n est detenu. Les frais couvrent uniquement l acces au service.'
              )}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

export default PricingPage;
