import { Pill, Mail, Phone, MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";

export function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
              <Pill className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Help & Support</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help topics..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* FAQ Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">How do I search for medicines?</h3>
                <p className="text-muted-foreground text-sm">
                  Simply type the medicine name in the search bar on the home page. You can also upload a prescription image for automatic medicine recognition.
                </p>
              </div>
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">How do I register my pharmacy?</h3>
                <p className="text-muted-foreground text-sm">
                  Click on "Register" and select "Pharmacy". You'll need to provide your pharmacy details, license information, and upload your EFDA license document.
                </p>
              </div>
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">Is the service free for patients?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Patients can search for medicines and locate pharmacies completely free of charge.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">How accurate is the prescription recognition?</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI system provides an initial recognition that you can verify and correct before searching. This ensures accuracy while saving you time.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Us</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">support@pharmalink.et</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+251 911 000 000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Live Chat</h3>
                    <p className="text-muted-foreground">Available 8 AM - 8 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-primary hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="block text-primary hover:underline">
                  Terms of Service
                </Link>
                <Link to="/about" className="block text-primary hover:underline">
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
