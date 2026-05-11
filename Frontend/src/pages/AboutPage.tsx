import { Pill, Target, Users, Award, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About PharmaLink</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Bridging the gap between patients and pharmacies through digital innovation
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Mission */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-muted-foreground text-center leading-relaxed">
            PharmaLink is dedicated to improving access to essential medicines in Ethiopia by connecting patients with nearby pharmacies through intelligent digital solutions. We believe that everyone deserves timely access to the medications they need, and we're working to make that a reality through technology.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              Making medicines accessible to everyone, everywhere in Addis Ababa
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Community</h3>
            <p className="text-sm text-muted-foreground">
              Building a connected healthcare ecosystem for patients and pharmacies
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Quality</h3>
            <p className="text-sm text-muted-foreground">
              Ensuring accurate information and reliable pharmacy partnerships
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Care</h3>
            <p className="text-sm text-muted-foreground">
              Putting patient health and safety at the center of everything we do
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Our Story</h2>
          <div className="bg-card border border-border rounded-xl p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              PharmaLink was born from a simple observation: too many patients in Addis Ababa struggle to find the medicines they need, even when those medicines are available in nearby pharmacies. The traditional process of visiting multiple pharmacies, calling ahead, or relying on word-of-mouth is inefficient, time-consuming, and often leads to delayed treatment.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our team of developers and healthcare enthusiasts came together to solve this problem using modern technology. By combining AI-powered prescription recognition, real-time inventory management, and location-based services, we've created a platform that connects patients with pharmacies in a smarter, faster way.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, PharmaLink serves as a bridge between the digital and physical worlds of healthcare, empowering patients with information and helping pharmacies reach more customers. We're proud to contribute to Ethiopia's digital transformation in healthcare.
            </p>
          </div>
        </div>

        {/* Team */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            A passionate team of developers, designers, and healthcare advocates working together to improve medicine access in Ethiopia.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">TA</span>
              </div>
              <h3 className="font-bold text-foreground">Tarik</h3>
              <p className="text-sm text-muted-foreground">Lead Developer</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">BD</span>
              </div>
              <h3 className="font-bold text-foreground">Bestegaw</h3>
              <p className="text-sm text-muted-foreground">Project Advisor</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">AA</span>
              </div>
              <h3 className="font-bold text-foreground">Andargachew</h3>
              <p className="text-sm text-muted-foreground">Coordinator</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
          <p className="mb-6 opacity-90">
            Whether you're a patient looking for medicines or a pharmacy wanting to expand your reach, PharmaLink is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </Link>
            <Link to="/register/pharmacy">
              <button className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Register Pharmacy
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
