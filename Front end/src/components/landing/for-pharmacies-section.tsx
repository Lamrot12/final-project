import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Package, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Users, label: "More Customers" },
  { icon: Package, label: "Smart Inventory" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Zap, label: "Instant Updates" },
];

export function ForPharmaciesSection() {
  return (
    <section id="for-pharmacies" className="py-16 bg-slate-900 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-medium mb-3 block text-sm">
              For Pharmacies
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Grow Your Business
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <benefit.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{benefit.label}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="px-6"
              asChild
            >
              <Link to="/register/pharmacy">
                Register Pharmacy
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative h-[350px] rounded-2xl overflow-hidden">
            <img
              src="/images/pharmacist.jpg"
              alt="Pharmacist using PharmaLink"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
