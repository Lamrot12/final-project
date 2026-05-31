import { useState, useEffect, useRef } from "react";
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

interface AdvertisementSectionProps {
  smallCards?: boolean;
}

export function AdvertisementSection({ smallCards = false }: AdvertisementSectionProps) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAds, setExpandedAds] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

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

  const toggleExpand = (adId: string) => {
    setExpandedAds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(adId)) {
        newSet.delete(adId);
      } else {
        newSet.add(adId);
      }
      return newSet;
    });
  };

  // Auto-scroll functionality - marquee style
  useEffect(() => {
    if (!scrollContainerRef.current || advertisements.length === 0) return;

    const container = scrollContainerRef.current;
    let scrollPos = 0;
    const scrollSpeed = 1; // pixels per frame

    const animate = () => {
      if (!isPaused) {
        scrollPos += scrollSpeed;
        const scrollWidth = container.scrollWidth / 2; // Since we duplicate content
        const clientWidth = container.clientWidth;

        if (scrollPos >= scrollWidth) {
          scrollPos = 0;
        }

        container.scrollLeft = scrollPos;
      }
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [advertisements, isPaused]);

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

  const displayAds = advertisements;
  // Duplicate ads for seamless marquee loop
  const marqueeAds = [...displayAds, ...displayAds, ...displayAds];

  return (
    <section className={`${smallCards ? 'py-8' : 'py-20'} bg-white`}>
      <div className="container mx-auto px-4">
        {smallCards && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Featured Partners</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Sponsored Businesses</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm">Discover trusted local businesses and services</p>
          </div>
        )}
        {!smallCards && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Featured Partners</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Sponsored Businesses</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Discover trusted local businesses and services recommended by our community</p>
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto pb-4 max-w-6xl mx-auto" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {marqueeAds.map((ad, index) => {
            const { Icon, color } = getIconAndColor(index);
            return (
              <div
                key={ad.ad_id}
                className={`bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group flex-shrink-0 ${
                  smallCards 
                    ? 'p-3 min-w-[180px] max-w-[200px]' 
                    : 'p-5 min-w-[250px] max-w-[300px]'
                }`}
              >
                {ad.advertisement_image ? (
                  <div className={`w-full rounded-2xl overflow-hidden mb-3 ${smallCards ? 'h-20' : 'h-40'}`}>
                    <img
                      src={ad.advertisement_image}
                      alt={ad.ad_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className={`${color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${smallCards ? 'w-10 h-10' : 'w-14 h-14'}`}>
                    <Icon className={smallCards ? 'w-5 h-5' : 'w-7 h-7'} />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {ad.pharmacy_name}
                  </span>
                  {!smallCards && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span className="text-xs font-semibold">4.8</span>
                    </div>
                  )}
                </div>
                <h3 className={`${smallCards ? 'text-sm' : 'text-xl'} font-bold text-slate-900 mb-2 line-clamp-1`}>{ad.ad_title}</h3>
                {!smallCards && (
                  <p className={`text-sm text-slate-600 mb-4 leading-relaxed ${!expandedAds.has(ad.ad_id) ? 'line-clamp-3' : ''}`}>
                    {ad.ad_content}
                  </p>
                )}
                {!smallCards && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => toggleExpand(ad.ad_id)}
                  >
                    {expandedAds.has(ad.ad_id) ? "Show Less" : "Learn More"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {!smallCards && (
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
        )}
      </div>
    </section>
  );
}
