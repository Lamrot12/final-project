import { Camera, Search, MapPin, Check } from "lucide-react";

const steps = [
  { number: "01", icon: Camera, title: "Scan" },
  { number: "02", icon: Search, title: "Search" },
  { number: "03", icon: MapPin, title: "Locate" },
  { number: "04", icon: Check, title: "Collect" },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">Four simple steps</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-background border-2 border-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-muted/30 mb-2">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
