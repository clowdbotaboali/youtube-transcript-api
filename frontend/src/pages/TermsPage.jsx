import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { SEO_CONFIG } from '../seo/seoCatalog';
import { LANG, tr } from '../utils/lang';

function TermsPage({ lang = LANG.ar, theme = 'light' }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service | Transcripta AI',
    url: `${SEO_CONFIG.SITE_ORIGIN}/terms`,
    description: 'Terms of Service for Transcripta AI digital transcript generation service.'
  };
  return (
    <>
      <SeoMeta
        title={tr(lang, 'الشروط والأحكام | Transcripta AI', 'Terms of Service | Transcripta AI')}
        description={tr(
          lang,
          'الشروط والأحكام الخاصة بخدمة Transcripta AI الرقمية.',
          'Terms of Service for Transcripta AI digital transcript generation service.'
        )}
        path="/terms"
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        structuredData={structuredData}
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'الشروط والأحكام', 'Terms of Service')}
        subtitle={tr(
          lang,
          'تنظم هذه الشروط استخدامك لخدمة Transcripta AI وميزات استخراج النصوص الرقمية.',
          'These terms govern your use of Transcripta AI and its digital transcript generation features.'
        )}
      >
        <CompliancePageLayout.Section title={tr(lang, '1. وصف الخدمة', '1. Service Description')}>
          <p>{tr(
            lang,
            'تقدم Transcripta AI خدمة رقمية لتحويل روابط يوتيوب التي يضيفها المستخدم إلى نص، مع ميزات اختيارية لتحليل النص بالذكاء الاصطناعي.',
            'Transcripta AI provides a digital service that converts user-submitted YouTube video links into text transcripts and offers optional AI-based text analysis features.'
          )}</p>
          <p>{tr(
            lang,
            'الخدمة عبارة عن إتاحة برمجية فقط، ولا تتضمن نقل أو حفظ أو إدارة أموال طرف ثالث.',
            'The service is delivered as software access only and does not involve transfer, custody, or management of third-party funds.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '2. مسؤوليات المستخدم', '2. User Responsibilities')}>
          <p>{tr(
            lang,
            'أنت مسؤول عن الروابط والمراجع التي ترسلها، وعن التزام استخدامك بالقوانين المعمول بها وسياسات المنصات.',
            'You are responsible for the links and content references you submit, and for ensuring your usage complies with applicable law and platform rules.'
          )}</p>
          <p>{tr(
            lang,
            'تتعهد بعدم استخدام الخدمة في أنشطة غير قانونية أو ضارة أو منتهكة لحقوق الآخرين.',
            'You agree not to use the service for unlawful activity, harmful activity, or content that infringes rights of others.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '3. سياسة الاستخدام المقبول', '3. Acceptable Use Policy')}>
          <p>{tr(
            lang,
            'لا يجوز إساءة استخدام الخدمة عبر محاولة وصول غير مصرح، أو تعطيل البنية التحتية، أو تجاوز الحدود، أو توليد أنماط طلبات مسيئة.',
            'You may not misuse the service by attempting unauthorized access, disrupting infrastructure, bypassing usage limits, or generating abusive request patterns.'
          )}</p>
          <p>{tr(
            lang,
            'يجوز لنا تعليق أو تقييد الوصول عند اكتشاف إساءة استخدام أو مخاطر احتيال أو مخالفات للسياسات.',
            'We may suspend or restrict access where misuse, fraud risk, or policy violations are detected.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '4. إخلاء مسؤولية الملكية الفكرية', '4. Intellectual Property Disclaimer')}>
          <p>{tr(
            lang,
            'المستخدم مسؤول عن كيفية استخدام النصوص الناتجة. Transcripta AI لا يمنح حقوق ملكية على محتوى أطراف ثالثة ولا يدّعي ملكية قانونية لمواد الفيديو الخارجية.',
            'Users are responsible for how they use generated transcripts. Transcripta AI does not grant ownership rights to third-party content and does not represent legal ownership of external video materials.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '5. حدود المسؤولية', '5. Limitation of Liability')}>
          <p>{tr(
            lang,
            'تُقدم الخدمة بحسب التوافر. وإلى أقصى حد يسمح به القانون، لا تتحمل Transcripta AI مسؤولية الأضرار غير المباشرة أو العرضية أو الخاصة أو التبعية الناتجة عن استخدام الخدمة.',
            'The service is provided on an "as available" basis. To the maximum extent permitted by law, Transcripta AI shall not be liable for indirect, incidental, special, or consequential damages arising from service usage.'
          )}</p>
          <p>{tr(
            lang,
            'لا نضمن التوافر المستمر دون انقطاع أو الدقة المطلقة في جميع الحالات.',
            'We do not warrant uninterrupted availability or absolute accuracy in all cases.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '6. التواصل', '6. Contact')}>
          <p>{tr(
            lang,
            'للأسئلة القانونية أو المتعلقة بالخدمة، تواصل عبر:',
            'For legal and service questions, contact:'
          )} <strong>hello@transcripta.tech</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default TermsPage;
