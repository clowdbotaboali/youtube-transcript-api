import SeoMeta from '../components/SeoMeta';
import CompliancePageLayout from '../components/CompliancePageLayout';

function ContactPage() {
  return (
    <>
      <SeoMeta
        title="Contact | Transcript AI"
        description="Contact information for Transcript AI service operations in Egypt."
        path="/contact"
      />
      <CompliancePageLayout
        title="Contact"
        subtitle="Support and compliance contact details for Transcript AI."
      >
        <CompliancePageLayout.Section title="Business Contact">
          <p><strong>Email:</strong> support@transcriptai-eg.com</p>
          <p><strong>Country of Operation:</strong> Egypt</p>
          <p><strong>Support Response Time:</strong> Within 24 business hours</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="Billing and Refund Support">
          <p>For billing or refund-related inquiries, contact: <strong>billing@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>

        <CompliancePageLayout.Section title="Compliance and Legal">
          <p>For legal or compliance matters, contact: <strong>compliance@transcriptai-eg.com</strong>.</p>
        </CompliancePageLayout.Section>
      </CompliancePageLayout>
    </>
  );
}

export default ContactPage;
