import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Store, Briefcase, Sparkles, Star, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Advertisement {
  ad_id: string;
  ad_title: string;
  ad_content: string;
  advertisement_image: string;
  pharmacy_name: string;
  end_date: string;
}

export function AdvertisementSection() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/advertisements/active/public");
      setAdvertisements(response.data);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon and color based on index
  const getIconAndColor = (index: number) => {
    const icons = [Building2, Store, Briefcase];
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
    ];
    return {
      Icon: icons[index % icons.length],
      color: colors[index % colors.length],
    };
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </section>
    );
  }

  // Show static ads if no active advertisements
  const defaultAds = [
    {
      ad_id: "1",
      ad_title: "MediLab Diagnostics",
      pharmacy_name: "Healthcare",
      ad_content: "Advanced lab testing services with fast results. Trusted by 50+ clinics.",
      advertisement_image: "",
      end_date: "",
    },
    {
      ad_id: "2",
      ad_title: "FreshGrocery Market",
      pharmacy_name: "Retail",
      ad_content: "Quality groceries delivered to your doorstep. Same-day delivery available.",
      advertisement_image: "",
      end_date: "",
    },
    {
      ad_id: "3",
      ad_title: "BizConsult Pro",
      pharmacy_name: "Business Services",
      ad_content: "Expert consulting for growing businesses. 10+ years of experience.",
      advertisement_image: "",
      end_date: "",
    },
  ];

  const displayAds = advertisements.length > 0 ? advertisements : defaultAds;

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
          {displayAds.map((ad, index) => {
            const { Icon, color } = getIconAndColor(index);
            return (
              <div
                key={ad.ad_id}
                className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                {ad.advertisement_image ? (
                  <div className="w-full h-40 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={ad.advertisement_image}
                      alt={ad.ad_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {ad.pharmacy_name}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-xs font-semibold">4.8</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{ad.ad_title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{ad.ad_content}</p>
                <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground transition-colors">
                  Learn More
                </Button>
              </div>
            );
          })}
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
