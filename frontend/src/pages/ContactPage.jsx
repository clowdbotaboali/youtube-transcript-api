import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { LANG, tr } from '../utils/lang';

function ContactPage({ lang = LANG.ar, theme = 'light' }) {
  return (
    <>
      <SeoMeta
        title={tr(lang, 'تواصل معنا | Transcript AI', 'Contact | Transcript AI')}
        description={tr(
          lang,
          'معلومات التواصل الخاصة بخدمة Transcript AI في مصر.',
          'Contact information for Transcript AI service operations in Egypt.'
        )}
        path="/contact"
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'تواصل', 'Contact')}
        subtitle={tr(lang, 'بيانات الدعم والتواصل القانوني لخدمة Transcript AI.', 'Support and compliance contact details for Transcript AI.')}
      >
        <CompliancePageLayout.Section title={tr(lang, 'التواصل الرئيسي', 'Business Contact')}>
          <p><strong>{tr(lang, 'البريد الإلكتروني:', 'Email:')}</strong> support@transcriptai-eg.com</p>
          <p><strong>{tr(lang, 'دولة التشغيل:', 'Country of Operation:')}</strong> {tr(lang, 'مصر', 'Egypt')}</p>
          <p><strong>{tr(lang, 'زمن الرد:', 'Support Response Time:')}</strong> {tr(lang, 'خلال 24 ساعة عمل', 'Within 24 business hours')}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'دعم الفوترة والاسترجاع', 'Billing and Refund Support')}>
          <p>{tr(lang, 'للاستفسارات المتعلقة بالفوترة أو الاسترجاع، تواصل عبر:', 'For billing or refund-related inquiries, contact:')} <strong>billing@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'الامتثال والشؤون القانونية', 'Compliance and Legal')}>
          <p>{tr(lang, 'للاستفسارات القانونية أو الامتثال، تواصل عبر:', 'For legal or compliance matters, contact:')} <strong>compliance@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default ContactPage;
