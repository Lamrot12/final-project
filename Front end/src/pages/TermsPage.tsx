import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export function TermsPage() {
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
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">PharmaLink</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using PharmaLink, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>
                PharmaLink is a digital platform that connects patients with pharmacies in Addis Ababa, Ethiopia. 
                Our services include medicine search, prescription upload, pharmacy location services, and delivery coordination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. User Responsibilities</h2>
              <p>
                Users are responsible for maintaining the confidentiality of their account information and for all activities 
                that occur under their account. Users must not use the service for any illegal or unauthorized purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Pharmacy Responsibilities</h2>
              <p>
                Pharmacies registered on PharmaLink must maintain accurate inventory information, fulfill orders in a timely manner, 
                and comply with all applicable laws and regulations regarding the sale and distribution of medicines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Medical Disclaimer</h2>
              <p>
                PharmaLink is not a substitute for professional medical advice. Always consult with a qualified healthcare provider 
                before making any medical decisions. The information provided on our platform is for informational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Privacy Policy</h2>
              <p>
                Your use of PharmaLink is also governed by our Privacy Policy, which can be found{" "}
                <Link to="/privacy" className="text-primary hover:underline">here</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
              <p>
                PharmaLink shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                arising out of your access to or use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service after modifications constitutes 
                acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:info@pharmalink.et" className="text-primary hover:underline">info@pharmalink.et</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
