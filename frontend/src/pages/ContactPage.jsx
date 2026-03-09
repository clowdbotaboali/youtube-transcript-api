import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { SEO_CONFIG } from '../seo/seoCatalog';
import { LANG, tr } from '../utils/lang';

function ContactPage({ lang = LANG.ar, theme = 'light' }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact | Transcripta AI',
    url: `${SEO_CONFIG.SITE_ORIGIN}/contact`,
    description: 'Contact information for support, billing, and compliance questions.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Transcripta AI',
      email: 'support@transcripta.tech'
    }
  };
  return (
    <>
      <SeoMeta
        title={tr(lang, 'تواصل معنا | Transcripta AI', 'Contact | Transcripta AI')}
        description={tr(
          lang,
          'معلومات التواصل الخاصة بخدمة Transcripta AI في مصر.',
          'Contact information for Transcripta AI service operations in Egypt.'
        )}
        path="/contact"
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        structuredData={structuredData}
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'تواصل', 'Contact')}
        subtitle={tr(lang, 'بيانات الدعم والتواصل القانوني لخدمة Transcripta AI.', 'Support and compliance contact details for Transcripta AI.')}
      >
        <CompliancePageLayout.Section title={tr(lang, 'التواصل الرئيسي', 'Business Contact')}>
          <p><strong>{tr(lang, 'البريد الإلكتروني:', 'Email:')}</strong> support@transcripta.tech</p>
          <p><strong>{tr(lang, 'دولة التشغيل:', 'Country of Operation:')}</strong> {tr(lang, 'مصر', 'Egypt')}</p>
          <p><strong>{tr(lang, 'زمن الرد:', 'Support Response Time:')}</strong> {tr(lang, 'خلال 24 ساعة عمل', 'Within 24 business hours')}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'دعم الفوترة والاسترجاع', 'Billing and Refund Support')}>
          <p>{tr(lang, 'للاستفسارات المتعلقة بالفوترة أو الاسترجاع، تواصل عبر:', 'For billing or refund-related inquiries, contact:')} <strong>hello@transcripta.tech</strong>.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'الامتثال والشؤون القانونية', 'Compliance and Legal')}>
          <p>{tr(lang, 'للاستفسارات القانونية أو الامتثال، تواصل عبر:', 'For legal or compliance matters, contact:')} <strong>hello@transcripta.tech</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default ContactPage;
