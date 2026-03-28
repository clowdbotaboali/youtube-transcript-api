import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { SEO_CONFIG } from '../seo/seoCatalog';
import { LANG, tr } from '../utils/lang';

function PrivacyPolicyPage({ lang = LANG.ar, theme = 'light' }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | Transcripta AI',
    url: `${SEO_CONFIG.SITE_ORIGIN}/privacy-policy`,
    description: 'Privacy Policy for Transcripta AI, including data handling, cookies, and Google AdSense disclosure.'
  };
  return (
    <>
      <SeoMeta
        title={tr(lang, 'سياسة الخصوصية | Transcripta AI', 'Privacy Policy | Transcripta AI')}
        description={tr(
          lang,
          'سياسة الخصوصية لخدمة Transcripta AI، وتشمل البيانات، ملفات تعريف الارتباط، وإفصاحات Google AdSense.',
          'Privacy Policy for Transcripta AI, including data handling, cookies, and Google AdSense disclosure.'
        )}
        path="/privacy-policy"
        canonicalOrigin={SEO_CONFIG.SITE_ORIGIN}
        robots="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        structuredData={structuredData}
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'سياسة الخصوصية', 'Privacy Policy')}
        subtitle={tr(
          lang,
          'كيف يجمع Transcripta AI المعلومات ويستخدمها ويحميها، وما يتعلق بملفات تعريف الارتباط وإعلانات Google AdSense.',
          'How Transcripta AI collects, uses, and protects information, including cookies and Google AdSense-related disclosures.'
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

        <CompliancePageLayout.Section title={tr(lang, '6. ملفات تعريف الارتباط وتقنيات القياس', '6. Cookies and Similar Technologies')}>
          <p>{tr(
            lang,
            'قد نستخدم ملفات تعريف الارتباط أو التخزين المحلي أو تقنيات مشابهة للحفاظ على تسجيل الدخول، وتذكر التفضيلات، وقياس أداء الصفحات، ومنع إساءة الاستخدام.',
            'We may use cookies, local storage, or similar technologies to keep users signed in, remember preferences, measure page performance, and reduce abuse.'
          )}</p>
          <p>{tr(
            lang,
            'يمكن للمستخدم إدارة ملفات تعريف الارتباط من إعدادات المتصفح، لكن تعطيل بعضها قد يؤثر على أجزاء من الخدمة مثل تسجيل الدخول أو تذكر اللغة والإعدادات.',
            'Users can manage cookies through browser settings, but disabling some cookies may affect parts of the service such as login state, language, or saved preferences.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '7. إفصاح الإعلانات و Google AdSense', '7. Advertising and Google AdSense Disclosure')}>
          <p>{tr(
            lang,
            'قد نعرض إعلانات من جهات خارجية مثل Google AdSense. قد تستخدم Google وشركاؤها ملفات تعريف الارتباط أو معرفات مشابهة لعرض إعلانات وقياس الأداء وتحسين مدى ملاءمة الإعلانات.',
            'We may display ads from third parties such as Google AdSense. Google and its partners may use cookies or similar identifiers to serve ads, measure performance, and improve relevance.'
          )}</p>
          <p>{tr(
            lang,
            'يمكن للمستخدمين مراجعة إعدادات الإعلانات من Google والتحكم في ملفات تعريف الارتباط من خلال المتصفح. وجود ملف ads.txt في الموقع يستخدم فقط لتوضيح البائعين الإعلانيين المصرح لهم ولا يحتوي على بيانات شخصية.',
            'Users can review Google ad settings and control cookies through their browser. The ads.txt file on the site is used only to declare authorized advertising sellers and does not contain personal data.'
          )}</p>
          <p>{tr(
            lang,
            'إذا فُعّلت الإعلانات المخصصة أو غير المخصصة عبر Google، فسيتم التعامل معها وفقًا لسياسات Google المعمول بها ومتطلبات الامتثال المحلية ذات الصلة.',
            'If personalized or non-personalized ads are enabled through Google, they are handled subject to Google policies and any applicable local compliance requirements.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '8. حقوقك ووسيلة التواصل', '8. Your Rights and Contact')}>
          <p>{tr(
            lang,
            'للاستفسارات المتعلقة بالخصوصية أو طلبات التصحيح أو الحذف، تواصل عبر:',
            'For privacy inquiries, correction requests, or deletion requests, contact:'
          )} <strong>hello@transcripta.tech</strong>.</p>
          <p>{tr(
            lang,
            'كما يمكن التواصل معنا عبر support@transcripta.tech إذا كان الطلب متعلقًا بمشكلة تشغيلية أو بخطأ في استخدام الخدمة.',
            'You may also contact support@transcripta.tech if the request is related to an operational issue or a service error.'
          )}</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default PrivacyPolicyPage;
