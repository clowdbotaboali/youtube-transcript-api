import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';
import { LANG, tr } from '../utils/lang';

function RefundPolicyPage({ lang = LANG.ar, theme = 'light' }) {
  return (
    <>
      <SeoMeta
        title={tr(lang, 'سياسة الاسترجاع | Transcripta AI', 'Refund Policy | Transcripta AI')}
        description={tr(
          lang,
          'سياسة الاسترجاع لخدمة Transcripta AI الرقمية.',
          'Refund policy for Transcripta AI digital transcript generation service.'
        )}
        path="/refund-policy"
      />
      <CompliancePageLayout
        lang={lang}
        theme={theme}
        title={tr(lang, 'سياسة الاسترجاع', 'Refund Policy')}
        subtitle={tr(
          lang,
          'شروط الاستحقاق لطلبات الاسترجاع في خدمة استخراج النصوص الرقمية.',
          'Refund eligibility for digital transcript generation services.'
        )}
      >
        <CompliancePageLayout.Section title={tr(lang, '1. حالات الاستحقاق', '1. Refund Eligibility')}>
          <p>{tr(
            lang,
            'يُقبل طلب الاسترجاع خلال مدة لا تتجاوز 24 ساعة من عملية الدفع المرتبطة، في حالة فشل استخراج النص وعدم تسليم ناتج صالح للاستخدام.',
            'Refund requests are accepted within 24 hours from the related charge when transcript generation fails and no usable output is delivered.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '2. الحالات غير القابلة للاسترجاع', '2. Non-Refundable Cases')}>
          <p>{tr(
            lang,
            'لا يتم رد المبلغ بعد نجاح تسليم النص وإتاحته داخل حساب المستخدم.',
            'No refund is provided once transcript delivery is successful and accessible in the user account.'
          )}</p>
          <p>{tr(
            lang,
            'لا يتم رد المبلغ في حالة اكتمال الاستفادة من الخدمة الرقمية بعد توليد ناتج ناجح.',
            'No refund is provided for completed digital service usage after successful output generation.'
          )}</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title={tr(lang, '3. طريقة تقديم الطلب', '3. Refund Request Process')}>
          <p>{tr(
            lang,
            'أرسل طلبك إلى',
            'Send your request to'
          )} <strong>hello@transcripta.tech</strong> {tr(lang, 'مرفقًا بالبيانات التالية:', 'with:')}</p>
          <p>{tr(
            lang,
            '- بريد الحساب الإلكتروني\n- مرجع عملية الدفع\n- تاريخ ووقت الخصم\n- وصف مختصر للمشكلة',
            '- Account email\n- Payment reference\n- Date/time of charge\n- Brief issue summary'
          )}</p>
          <p>{tr(
            lang,
            'تُنفذ الطلبات المستحقة بعد التحقق، وتُعاد عبر وسيلة الدفع الأصلية متى كان ذلك متاحًا تقنيًا.',
            'Verified eligible requests are processed to the original payment method where technically available.'
          )}</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default RefundPolicyPage;
