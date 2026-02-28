import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { LANG, tr } from '../utils/lang';

function PrivacyPolicyPage({ lang = LANG.ar, theme = 'light' }) {
  return (
    <>
      <SeoMeta
        title={tr(lang, 'سياسة الخصوصية | Transcript AI', 'Privacy Policy | Transcript AI')}
        description={tr(
          lang,
          'سياسة الخصوصية لخدمة Transcript AI الرقمية لاستخراج النصوص.',
          'Privacy Policy for Transcript AI digital transcript generation service.'
        )}
        path="/privacy-policy"
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'سياسة الخصوصية', 'Privacy Policy')}
        subtitle={tr(
          lang,
          'كيف يجمع Transcript AI المعلومات ويستخدمها ويحميها ضمن خدمة استخراج النصوص الرقمية.',
          'How Transcript AI collects, uses, and protects information for its digital transcript generation service.'
        )}
      >
        <CompliancePageLayout.Section title={tr(lang, '1. المعلومات التي نجمعها', '1. Information We Collect')}>
          <p>{tr(
            lang,
            'نجمع البيانات اللازمة لتشغيل الخدمة، مثل روابط فيديوهات يوتيوب التي يضيفها المستخدم، وبريد الحساب الإلكتروني للمصادقة والدعم، وسجلات الاستخدام التقنية مثل وقت الطلب وحالة الاستجابة ومؤشرات استخدام الميزات.',
            'We collect information that is necessary to provide our service, including YouTube video URLs submitted by users, account email addresses for authentication and support, and technical usage logs such as request time, service response status, and feature usage metrics.'
          )}</p>
          <p>{tr(
            lang,
            'لا نقوم بجمع أو تخزين ملفات الفيديو من يوتيوب. الخدمة تتعامل فقط مع روابط الفيديو والنص الناتج.',
            'We do not collect or store YouTube video files. Our service processes video references (URLs) and generated text output only.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '2. كيف نستخدم المعلومات', '2. How We Use Information')}>
          <p>{tr(
            lang,
            'نستخدم البيانات المدخلة لتوليد النصوص، وتمكين الدخول للحساب، وتقديم الدعم الفني، والحفاظ على استقرار الخدمة وتحسين الأداء.',
            'We use submitted data to generate text transcripts, enable account access, provide customer support, maintain service reliability, and improve system performance.'
          )}</p>
          <p>{tr(
            lang,
            'تُستخدم سجلات الاستخدام للمراقبة التشغيلية ومنع إساءة الاستخدام والتحقق المرتبط بالفوترة الخاصة بالوصول للخدمة.',
            'Usage logs are used for operational monitoring, abuse prevention, and billing-related validation for service access.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '3. مشاركة البيانات وبيعها', '3. Data Sharing and Sale of Data')}>
          <p>{tr(
            lang,
            'لا نقوم ببيع البيانات الشخصية، ولا نشارك المعلومات الشخصية لأغراض الوساطة الإعلانية.',
            'We do not sell personal data. We do not share personal information for advertising brokerage.'
          )}</p>
          <p>{tr(
            lang,
            'قد تتم معالجة البيانات عبر مزودي بنية تحتية موثوقين فقط لغرض الاستضافة والمصادقة وعمليات الدفع اللازمة لتقديم الخدمة.',
            'Data may be processed by trusted infrastructure providers strictly for hosting, authentication, and payment processing operations required to deliver the service.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '4. مدة الاحتفاظ بالبيانات', '4. Data Retention')}>
          <p>{tr(
            lang,
            'يتم الاحتفاظ ببيانات الحساب وسجلات الاستخدام فقط للمدة اللازمة لتشغيل الحساب وضمان سلامة الخدمة والالتزامات القانونية ومعالجة النزاعات.',
            'Account data and service usage logs are retained only as long as required for account operation, service integrity, legal obligations, and dispute handling.'
          )}</p>
          <p>{tr(
            lang,
            'قد يتم الاحتفاظ بسجل النصوص الناتجة داخل تاريخ المستخدم حتى يحذفها المستخدم أو تُزال وفق سياسات الاحتفاظ الداخلية.',
            'Generated transcript-related records may be retained in user history until deleted by the user or removed according to internal retention schedules.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '5. الأمان', '5. Security')}>
          <p>{tr(
            lang,
            'نطبق إجراءات إدارية وتقنية معقولة تجاريًا لحماية بيانات الحساب والخدمة من الوصول غير المصرح أو التعديل أو سوء الاستخدام.',
            'We implement commercially reasonable administrative and technical safeguards to protect account information and service data against unauthorized access, alteration, or misuse.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '6. حقوقك ووسيلة التواصل', '6. Your Rights and Contact')}>
          <p>{tr(
            lang,
            'للاستفسارات المتعلقة بالخصوصية أو طلبات التصحيح أو الحذف، تواصل عبر:',
            'For privacy inquiries, correction requests, or deletion requests, contact:'
          )} <strong>compliance@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default PrivacyPolicyPage;
