import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';

function PrivacyPolicyPage() {
  return (
    <>
      <SeoMeta
        title="Privacy Policy | Transcript AI"
        description="Privacy Policy for Transcript AI digital transcript generation service."
        path="/privacy-policy"
      />
      <CompliancePageLayout
        title="Privacy Policy"
        subtitle="How Transcript AI collects, uses, and protects information for its digital transcript generation service."
      >
        <CompliancePageLayout.Section title="1. Information We Collect">
          <p>We collect information that is necessary to provide our service, including YouTube video URLs submitted by users, account email addresses for authentication and support, and technical usage logs such as request time, service response status, and feature usage metrics.</p>
          <p>We do not collect or store YouTube video files. Our service processes video references (URLs) and generated text output only.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="2. How We Use Information">
          <p>We use submitted data to generate text transcripts, enable account access, provide customer support, maintain service reliability, and improve system performance.</p>
          <p>Usage logs are used for operational monitoring, abuse prevention, and billing-related validation for service access.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="3. Data Sharing and Sale of Data">
          <p>We do not sell personal data. We do not share personal information for advertising brokerage.</p>
          <p>Data may be processed by trusted infrastructure providers strictly for hosting, authentication, and payment processing operations required to deliver the service.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="4. Data Retention">
          <p>Account data and service usage logs are retained only as long as required for account operation, service integrity, legal obligations, and dispute handling.</p>
          <p>Generated transcript-related records may be retained in user history until deleted by the user or removed according to internal retention schedules.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="5. Security">
          <p>We implement commercially reasonable administrative and technical safeguards to protect account information and service data against unauthorized access, alteration, or misuse.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="6. Your Rights and Contact">
          <p>For privacy inquiries, correction requests, or deletion requests, contact: <strong>compliance@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default PrivacyPolicyPage;
