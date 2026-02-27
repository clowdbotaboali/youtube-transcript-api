import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';

function RefundPolicyPage() {
  return (
    <>
      <SeoMeta
        title="Refund Policy | Transcript AI"
        description="Refund policy for Transcript AI digital transcript generation service."
        path="/refund-policy"
      />
      <CompliancePageLayout
        title="Refund Policy"
        subtitle="Refund eligibility for digital transcript generation services."
      >
        <CompliancePageLayout.Section title="1. Refund Eligibility">
          <p>Refund requests are accepted within <strong>24 hours</strong> from the related charge when transcript generation fails and no usable output is delivered.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="2. Non-Refundable Cases">
          <p>No refund is provided once transcript delivery is successful and accessible in the user account.</p>
          <p>No refund is provided for completed digital service usage after successful output generation.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="3. Refund Request Process">
          <p>Send your request to <strong>billing@transcriptai-eg.com</strong> with:</p>
          <p>- Account email<br />- Payment reference<br />- Date/time of charge<br />- Brief issue summary</p>
          <p>Verified eligible requests are processed to the original payment method where technically available.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default RefundPolicyPage;
