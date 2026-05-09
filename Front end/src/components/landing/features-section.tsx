import { Camera, MapPin, Bell, Shield } from "lucide-react";

const features = [
  { icon: Camera, title: "AI Scanner", color: "bg-primary" },
  { icon: MapPin, title: "Live Location", color: "bg-accent" },
  { icon: Bell, title: "Stock Alerts", color: "bg-emerald-500" },
  { icon: Shield, title: "Verified", color: "bg-violet-500" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Feature Icons Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
            </div>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large Feature Card */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden h-[400px] group">
            <img
              src="/images/prescription-scan.jpg"
              alt="Prescription scanning"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                Scan & Find
              </h3>
              <p className="text-white/80 text-lg">
                Point your camera at any prescription
              </p>
            </div>
          </div>

          {/* Tall Feature Card */}
          <div className="relative rounded-3xl overflow-hidden h-[400px] group">
            <img
              src="/images/pharmacy-location.jpg"
              alt="Find pharmacies"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Nearby Pharmacies
              </h3>
              <p className="text-white/80">Live stock availability</p>
            </div>
          </div>

          {/* Medicine Card */}
          <div className="relative rounded-3xl overflow-hidden h-[300px] group">
            <img
              src="/images/medicine-delivery.jpg"
              alt="Medicine"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-bold text-white">
                10,000+ Medicines
              </h3>
            </div>
          </div>

          {/* Stats Card */}
          <div className="lg:col-span-2 rounded-3xl bg-primary p-8 h-[300px] flex items-center">
            <div className="grid grid-cols-3 gap-8 w-full text-center">
              <div>
                <div className="text-5xl font-bold text-primary-foreground mb-2">
                  24/7
                </div>
                <div className="text-primary-foreground/80">Support</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground mb-2">
                  2min
                </div>
                <div className="text-primary-foreground/80">Avg Search</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground mb-2">
                  Free
                </div>
                <div className="text-primary-foreground/80">For Patients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
