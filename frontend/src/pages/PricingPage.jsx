import SeoMeta from '../components/SeoMeta';
import { LANG, tr } from '../utils/lang';
import { SEO_CONFIG } from '../seo/seoCatalog';

function PricingPage({ lang = LANG.ar, theme = 'light' }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing | Transcripta AI',
    url: `${SEO_CONFIG.SITE_ORIGIN}/pricing`,
    description: 'Pricing for transcript extraction, summaries, notes, and actionable outputs.'
  };
  const isDark = theme === 'dark';

  return (
    <>
      <SeoMeta
        title={tr(lang, 'الأسعار | Transcripta AI', 'Pricing | Transcripta AI', 'Tarification | Transcripta AI')}
        description={tr(
          lang,
          'خطط Transcripta AI لتحويل الفيديوهات الطويلة إلى معرفة منظمة ومخرجات قابلة للتطبيق.',
          'Pricing for turning long videos into structured knowledge and actionable outputs.',
          'Tarification pour transformer les longues videos en connaissance structuree et sorties exploitables.'
        )}
        path="/pricing"
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        structuredData={structuredData}
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
                'Transcripta AI منصة لاستخراج المعرفة وتحويلها إلى خطوات قابلة للتطبيق من الفيديوهات الطويلة. التسعير مبني على عدد الفيديوهات بوضوح.',
                'Transcripta AI is a knowledge extraction and implementation platform for long videos. Pricing is clearly video-based.',
                'Transcripta AI est une plateforme dextraction de connaissance et dimplementation pour longues videos. La tarification est clairement basee sur les videos.'
              )}
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-4">
            <article className={`rounded-2xl border p-6 ${isDark ? 'border-emerald-700/60 bg-slate-900' : 'border-emerald-200 bg-white'}`}>
              <p className="inline-flex text-xs font-bold rounded-full px-2 py-1 bg-emerald-100 text-emerald-800 mb-3">
                {tr(lang, 'مجانية', 'Free', 'Gratuit')}
              </p>
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'الخطة المجانية', 'Free Plan', 'Plan gratuit')}
              </h2>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {tr(
                  lang,
                  '5 فيديوهات شهريًا لاختبار كامل دورة الاستخراج والمعالجة.',
                  '5 videos monthly to run the full extraction and processing workflow.',
                  '5 videos par mois pour executer le flux complet extraction + traitement.'
                )}
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <li>{tr(lang, '- استخراج النص الكامل من الفيديو', '- Full transcript extraction', '- Extraction complete du transcript')}</li>
                <li>{tr(lang, '- تلخيص + ملاحظات + خطة تطبيق', '- Summary + notes + implementation plan', '- Resume + notes + plan dimplementation')}</li>
                <li>{tr(lang, '- شات على نفس الفيديو بدون خصم إضافي', '- Chat on same video with no extra usage', '- Chat sur la meme video sans cout supplementaire')}</li>
                <li>{tr(lang, '- كل رابط فيديو جديد = 1 فيديو من الرصيد', '- Each new video link uses 1 video from balance', '- Chaque nouveau lien video consomme 1 video du solde')}</li>
              </ul>
            </article>

            <article className={`rounded-2xl border p-6 ${isDark ? 'border-orange-700/60 bg-slate-900' : 'border-orange-300 bg-white'}`}>
              <p className="inline-flex text-xs font-bold rounded-full px-2 py-1 bg-orange-100 text-orange-700 mb-3">
                {tr(lang, 'المدفوعة', 'Paid', 'Payant')}
              </p>
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {tr(lang, 'باقة الفيديوهات', 'Video Pack', 'Pack videos')}
              </h2>
              <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} mb-4`}>
                {tr(
                  lang,
                  'الباقة الأساسية: $19 مقابل 200 فيديو كامل المعالجة، مع بونص 10% عند شراء 2x أو 3x أو 5x.',
                  'Core pack: $19 for 200 fully processed videos, with a 10% bonus on 2x, 3x, and 5x purchases.',
                  'Pack principal: 19 $ pour 200 videos completement traitees, avec bonus 10 % sur 2x, 3x et 5x.'
                )}
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <li>{tr(lang, '- بونص 10% تلقائي عند اختيار 2x أو 3x أو 5x', '- Automatic 10% bonus on 2x, 3x, and 5x', '- Bonus automatique de 10 % sur 2x, 3x et 5x')}</li>
                <li>{tr(lang, '- يمكن شراء أكثر من باقة حسب الحاجة', '- Buy multiple packs when needed', '- Achetez plusieurs packs selon le besoin')}</li>
                <li>{tr(lang, '- تتبّع حالة طلب الدفع من لوحة العميل', '- Track payment request status inside dashboard', '- Suivi des demandes de paiement dans le tableau client')}</li>
                <li>{tr(lang, '- الدفع عبر InstaPay أو Vodafone Cash', '- Payments via InstaPay or Vodafone Cash', '- Paiement via InstaPay ou Vodafone Cash')}</li>
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
                'المنصة تقدم وصولًا لخدمة رقمية لاستخراج المعرفة من روابط يوتيوب العامة. لا توجد تحويلات مالية بين المستخدمين، ولا تحتفظ المنصة بأموال طرف ثالث. الرسوم تخص الوصول للخدمة فقط.',
                'The platform provides access to a digital service for extracting structured knowledge from public YouTube links. No user-to-user fund transfer is supported, and no third-party funds are held. Charges apply to service access only.',
                'La plateforme fournit un acces a un service numerique dextraction de connaissance structuree depuis des liens YouTube publics. Aucun transfert financier entre utilisateurs et aucun fonds tiers detenus. Les frais couvrent uniquement l acces au service.'
              )}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

export default PricingPage;
