import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";

export function ContactPage() {
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
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">PharmaLink</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Fill out the form below or reach us directly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">info@pharmalink.et</p>
              <p className="text-sm text-muted-foreground">support@pharmalink.et</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground">+251 911 123 456</p>
              <p className="text-sm text-muted-foreground">+251 911 234 567</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Address</h3>
              <p className="text-sm text-muted-foreground">
                Bole Subcity<br />
                Addis Ababa, Ethiopia
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-foreground mb-6">Send us a message</h2>
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary focus:outline-none min-h-[150px] resize-none"
                  />
                </div>

                <Button type="submit" className="w-full h-12 gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
