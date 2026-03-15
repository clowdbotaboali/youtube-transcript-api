import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { SEO_CONFIG } from '../seo/seoCatalog';
import { LANG, tr } from '../utils/lang';

function AboutPage({ lang = LANG.ar, theme = 'light' }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About | Transcripta AI',
    url: `${SEO_CONFIG.SITE_ORIGIN}/about`,
    description: 'About Transcripta AI and how the platform helps teams extract knowledge from video.'
  };

  return (
    <>
      <SeoMeta
        title={tr(lang, 'من نحن | Transcripta AI', 'About | Transcripta AI')}
        description={tr(
          lang,
          'تعرف على Transcripta AI وكيف نحول الفيديوهات الطويلة إلى معرفة قابلة للتنفيذ.',
          'Learn how Transcripta AI turns long videos into actionable knowledge.'
        )}
        path="/about"
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        structuredData={structuredData}
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'من نحن', 'About')}
        subtitle={tr(
          lang,
          'Transcripta AI منصة لاستخراج المعرفة والتنفيذ من الفيديوهات الطويلة.',
          'Transcripta AI is a knowledge extraction and execution platform for long videos.'
        )}
      >
        <CompliancePageLayout.Section title={tr(lang, 'المهمة', 'Mission')}>
          <p>{tr(
            lang,
            'نساعد الفرق على تحويل الفيديو إلى معرفة منظمة وخطط تنفيذ واضحة في دقائق، بدلاً من ضياع المعلومات داخل مقاطع طويلة.',
            'We help teams turn video into structured knowledge and clear execution plans in minutes.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'ماذا نقدم', 'What We Provide')}>
          <p>{tr(
            lang,
            'المنصة تستخرج النص الكامل من فيديو يوتيوب، ثم تقدم ملخصات، ملاحظات، وخطط تنفيذ قابلة للاستخدام الفوري.',
            'The platform extracts full YouTube transcripts and delivers summaries, notes, and execution-ready outputs.'
          )}</p>
          <p>{tr(
            lang,
            'نعمل على إبقاء تدفق المعرفة واضحًا: من الرابط إلى نص قابل للبحث، ثم إلى قرارات ومهام.',
            'Our workflow keeps knowledge clear: link → searchable text → decisions and tasks.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'الشفافية والامتثال', 'Transparency and Compliance')}>
          <p>{tr(
            lang,
            'نلتزم بسياسات الخصوصية، ونوفر صفحات واضحة للشروط والاسترجاع والتواصل، مع دعم مخصص للفوترة والاستفسارات القانونية.',
            'We maintain clear privacy, terms, refund, and contact pages with dedicated billing and legal support.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'التواصل', 'Contact')}>
          <p>{tr(
            lang,
            'للاستفسارات العامة والدعم: ',
            'For general questions and support: '
          )}<strong>hello@transcripta.tech</strong></p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default AboutPage;
