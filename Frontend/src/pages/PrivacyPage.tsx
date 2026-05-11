import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">PharmaLink</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>
                PharmaLink collects information you provide directly, including: name, email address, phone number, 
                pharmacy information, prescription images, and location data when using our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to: provide and improve our services, process orders, communicate with you, 
                verify pharmacy credentials, and ensure compliance with healthcare regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share information with: pharmacies to fulfill orders, 
                healthcare providers as necessary for prescription processing, and as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information, including encryption, 
                secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Prescription Privacy</h2>
              <p>
                Prescription information is handled with the highest level of privacy and is only shared with authorized 
                pharmacies and healthcare providers. All prescription data is encrypted and stored securely.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
              <p>
                You have the right to: access your personal information, correct inaccurate information, delete your account 
                and associated data, and opt-out of marketing communications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
              <p>
                We use cookies and similar technologies to improve user experience, analyze usage patterns, and personalize content. 
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Third-Party Services</h2>
              <p>
                Our service may include links to third-party websites or services. We are not responsible for the privacy 
                practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of significant changes by posting 
                the new policy on our website and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Information</h2>
              <p>
                For questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:info@pharmalink.et" className="text-primary hover:underline">info@pharmalink.et</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
