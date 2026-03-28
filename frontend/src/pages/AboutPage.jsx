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
    description: 'About Transcripta AI, our mission, team focus, and how the platform helps users turn long videos into actionable knowledge.'
  };

  return (
    <>
      <SeoMeta
        title={tr(lang, 'من نحن | Transcripta AI', 'About | Transcripta AI')}
        description={tr(
          lang,
          'تعرّف على Transcripta AI، مهمتنا، وكيف نحول الفيديوهات الطويلة إلى معرفة منظمة قابلة للتطبيق.',
          'Learn about Transcripta AI, our mission, and how we turn long videos into actionable knowledge.'
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
          'Transcripta AI منصة لتحويل الفيديوهات الطويلة إلى نصوص واضحة وملاحظات منظمة وخطط تطبيق عملية.',
          'Transcripta AI turns long videos into searchable transcripts, structured notes, and practical implementation plans.'
        )}
      >
        <CompliancePageLayout.Section title={tr(lang, 'المهمة', 'Mission')}>
          <p>{tr(
            lang,
            'مهمتنا هي تقليل الوقت الضائع في إعادة مشاهدة الفيديوهات الطويلة، وتحويلها إلى معرفة منظمة يمكن الرجوع إليها والعمل بها بسرعة.',
            'Our mission is to reduce the time lost in rewatching long videos and turn them into structured knowledge teams can use quickly.'
          )}</p>
          <p>{tr(
            lang,
            'نركز على الوضوح العملي: نص قابل للبحث، ملخص مركز، ومخرجات تساعد المستخدم على اتخاذ قرار أو البدء في التطبيق مباشرة.',
            'We focus on practical clarity: searchable text, a concise summary, and outputs that help users decide and start implementation immediately.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'ماذا نقدم', 'What We Provide')}>
          <p>{tr(
            lang,
            'تستخرج المنصة النص الكامل من روابط يوتيوب العامة، ثم تنظمه في ملخصات وملاحظات وخطط تطبيق تساعد على الاستفادة من المحتوى بدل استهلاكه فقط.',
            'The platform extracts full transcripts from public YouTube links, then organizes them into summaries, notes, and implementation plans that are ready to use.'
          )}</p>
          <p>{tr(
            lang,
            'نحافظ على سير واضح للمعلومة: رابط الفيديو، ثم نص قابل للبحث، ثم مخرجات مفيدة للدراسة أو البحث أو التخطيط أو إعادة الاستخدام.',
            'Our workflow stays clear from end to end: video link, searchable transcript, then outputs useful for study, research, planning, and content reuse.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'الفريق', 'Team')}>
          <p>{tr(
            lang,
            'يعمل على Transcripta AI فريق صغير يركز على جودة استخراج النص، وتجربة المستخدم، ودعم العملاء، وتحسين طرق تحويل الفيديو إلى معرفة عملية.',
            'Transcripta AI is maintained by a focused small team working across transcript quality, product experience, customer support, and practical AI workflows.'
          )}</p>
          <p>{tr(
            lang,
            'نهتم ببناء منتج واضح وموثوق، لذلك نراجع تجربة المستخدم والسياسات العامة وصفحات الدعم باستمرار حتى تكون الخدمة مفهومة وقابلة للاعتماد.',
            'We care about building a clear and dependable product, so we continuously review the user experience, public policies, and support materials.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'لمن صممت الخدمة', 'Who We Build For')}>
          <p>{tr(
            lang,
            'الخدمة مناسبة للمتعلمين، والباحثين، وصناع المحتوى، والفرق الصغيرة التي تريد استخراج الأفكار الرئيسية من الفيديوهات الطويلة بسرعة.',
            'The service is designed for learners, researchers, content teams, and small operators who need the key ideas from long videos quickly.'
          )}</p>
          <p>{tr(
            lang,
            'بدلاً من إعادة المشاهدة مرارًا، يمكن للمستخدم الوصول إلى نقاط أوضح وملاحظات أفضل وخطوات تالية محددة.',
            'Instead of repeated viewing, users get clearer takeaways, better notes, and more concrete next steps.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'الشفافية والامتثال', 'Transparency and Compliance')}>
          <p>{tr(
            lang,
            'نلتزم بالشفافية في طريقة تشغيل الخدمة، ونعرض صفحات واضحة للخصوصية والشروط والاسترجاع والتواصل، مع معلومات دعم مخصصة للفوترة والامتثال.',
            'We maintain clear privacy, terms, refund, and contact pages, along with dedicated support information for billing and compliance.'
          )}</p>
          <p>{tr(
            lang,
            'كما نوضح للمستخدمين كيف نتعامل مع البيانات، وما الذي يتم تخزينه، وكيف يمكن التواصل معنا عند وجود أي استفسار متعلق بالخدمة أو الخصوصية.',
            'We also explain how data is handled, what may be stored, and how users can contact us about service or privacy questions.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, 'التواصل', 'Contact')}>
          <p>{tr(
            lang,
            'للاستفسارات العامة والدعم: ',
            'For general questions and support: '
          )}<strong>hello@transcripta.tech</strong></p>
          <p>{tr(
            lang,
            'للدعم التشغيلي وخدمة العملاء: ',
            'For operations and customer support: '
          )}<strong>support@transcripta.tech</strong></p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default AboutPage;
