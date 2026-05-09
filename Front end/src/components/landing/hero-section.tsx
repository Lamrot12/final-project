import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img
          src="/images/hero-pharmacy.jpg"
          alt="Modern pharmacy"
          className="w-3/4 h-3/4 object-contain"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now available in Addis Ababa
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
            Find Your
            <span className="text-primary block">Medicine</span>
            Instantly
          </h1>

          <p className="text-l text-muted-foreground mb-10 max-w-lg text-black font-bold italic">
            Scan prescriptions. Locate pharmacies. Get your medicine faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-16 pt-8 border-t border-border/50">
            <div>
              <div className="text-4xl font-bold text-foreground">500+</div>
              <div className="text-muted-foreground">Pharmacies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground">50K+</div>
              <div className="text-muted-foreground">Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground">99%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating App Mockup */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[600px]">
        <img
          src="/images/app-mockup.jpg"
          alt="PharmaLink App"
          className="w-full h-full object-contain"
        />
      </div>
    </section>
  );
}
