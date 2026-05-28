import { Link } from "react-router-dom";
import { Pill, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold">PharmaLink</span>
                <p className="text-sm text-slate-400 mt-1">Your medicine, delivered</p>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6">
              Connecting patients with pharmacies in Addis Ababa through intelligent digital solutions. Find medicines, upload prescriptions, and get them delivered to your doorstep.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@pharmalink.et</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+251 911 123 456</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors text-slate-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-primary transition-colors text-slate-400">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-primary transition-colors text-slate-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#for-pharmacies" className="hover:text-primary transition-colors text-slate-400">
                  For Pharmacies
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors text-slate-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors text-slate-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors text-slate-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} PharmaLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
