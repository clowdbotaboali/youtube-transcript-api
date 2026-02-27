import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';

function TermsPage() {
  return (
    <>
      <SeoMeta
        title="Terms of Service | Transcript AI"
        description="Terms of Service for Transcript AI digital transcript generation service."
        path="/terms"
      />
      <CompliancePageLayout
        title="Terms of Service"
        subtitle="These terms govern your use of Transcript AI and its digital transcript generation features."
      >
        <CompliancePageLayout.Section title="1. Service Description">
          <p>Transcript AI provides a digital service that converts user-submitted YouTube video links into text transcripts and offers optional AI-based text analysis features.</p>
          <p>The service is delivered as software access only and does not involve transfer, custody, or management of third-party funds.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="2. User Responsibilities">
          <p>You are responsible for the links and content references you submit, and for ensuring your usage complies with applicable law and platform rules.</p>
          <p>You agree not to use the service for unlawful activity, harmful activity, or content that infringes rights of others.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="3. Acceptable Use Policy">
          <p>You may not misuse the service by attempting unauthorized access, disrupting infrastructure, bypassing usage limits, or generating abusive request patterns.</p>
          <p>We may suspend or restrict access where misuse, fraud risk, or policy violations are detected.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="4. Intellectual Property Disclaimer">
          <p>Users are responsible for how they use generated transcripts. Transcript AI does not grant ownership rights to third-party content and does not represent legal ownership of external video materials.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="5. Limitation of Liability">
          <p>The service is provided on an "as available" basis. To the maximum extent permitted by law, Transcript AI shall not be liable for indirect, incidental, special, or consequential damages arising from service usage.</p>
          <p>We do not warrant uninterrupted availability or absolute accuracy in all cases.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="6. Contact">
          <p>For legal and service questions, contact: <strong>compliance@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default TermsPage;
