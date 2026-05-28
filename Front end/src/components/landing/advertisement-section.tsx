import { Button } from "@/components/ui/button";
import { Building2, Store, Briefcase, Sparkles, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const advertisements = [
  {
    id: 1,
    business: "MediLab Diagnostics",
    category: "Healthcare",
    description: "Advanced lab testing services with fast results. Trusted by 50+ clinics.",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
    rating: 4.8,
    location: "Bole, Addis Ababa",
  },
  {
    id: 2,
    business: "FreshGrocery Market",
    category: "Retail",
    description: "Quality groceries delivered to your doorstep. Same-day delivery available.",
    icon: Store,
    color: "bg-green-100 text-green-600",
    rating: 4.6,
    location: "Kazanchis, Addis Ababa",
  },
  {
    id: 3,
    business: "BizConsult Pro",
    category: "Business Services",
    description: "Expert consulting for growing businesses. 10+ years of experience.",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
    rating: 4.9,
    location: "Megenagna, Addis Ababa",
  },
];

export function AdvertisementSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Featured Partners</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Sponsored Businesses</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Discover trusted local businesses and services recommended by our community</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {advertisements.map((ad) => (
            <div
              key={ad.id}
              className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`${ad.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <ad.icon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{ad.category}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span className="text-xs font-semibold">{ad.rating}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{ad.business}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{ad.description}</p>
              <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
                <MapPin className="w-3 h-3" />
                <span>{ad.location}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground transition-colors">
                Visit Business
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-slate-100 px-6 py-3 rounded-2xl">
            <p className="text-sm text-slate-600">
              Want to advertise your business?{" "}
              <Link to="/contact" className="text-primary font-semibold hover:underline ml-1">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
