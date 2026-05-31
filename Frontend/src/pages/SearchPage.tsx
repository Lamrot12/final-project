import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Pill, MapPin, Clock, Phone, Navigation, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { AdvertisementSection } from "@/components/landing/advertisement-section";

export function SearchPage() {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fromOCR, setFromOCR] = useState(false);

  useEffect(() => {
    getUserLocation();
    // Check if coming from OCR results
    if (location.state?.fromOCR) {
      setFromOCR(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (query) {
      searchPharmacies(query);
    }
  }, [query, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const searchPharmacies = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const results = await api.searchPharmaciesByMedicine(searchTerm, userLocation?.lat, userLocation?.lng);
      setPharmacies(results);
    } catch (err) {
      console.error('Error searching pharmacies:', err);
      setError('Failed to search pharmacies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleBack = () => {
    if (fromOCR) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Background Image like landing page */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <img
          src="/images/hero-pharmacy.jpg"
          alt="Modern pharmacy"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Simple Header like Privacy/Terms pages */}
      <div className="bg-white border-b border-border px-6 py-4 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">{fromOCR ? 'Back to Results' : 'Back to Home'}</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">PharmaLink</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Search Section */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-2">Find Your Medicine</h1>
          <p className="text-muted-foreground mb-4">Search across pharmacies near you</p>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search for medicine name, brand, or generic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300"
            />
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 shadow-lg" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Searching pharmacies...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {query ? `Showing results for "${query}"` : 'Enter a medicine name to search pharmacies'}
              </p>
            </div>

            {pharmacies.length === 0 && query && (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No pharmacies found stocking "{query}"</p>
                <p className="text-muted-foreground text-sm mt-2">Try a different search term</p>
              </div>
            )}

            {pharmacies.length > 0 && (
              <div className="grid gap-6">
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.pharmacy_id} className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-2">
                    {/* Pharmacy Image */}
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                        <Pill className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{pharmacy.pharmacy_name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                              <MapPin className="w-5 h-5 flex-shrink-0 text-primary" />
                              <span className="line-clamp-1">{pharmacy.address}</span>
                            </div>
                            {pharmacy.distance && (
                              <div className="text-lg font-bold text-primary mb-2">
                                {pharmacy.distance.toFixed(2)} km
                              </div>
                            )}
                          </div>
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 ${pharmacy.is_open !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {pharmacy.medicine?.quantity > 0 ? (
                            <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                              In Stock ({pharmacy.medicine.quantity})
                            </span>
                          ) : (
                            <span className="bg-gradient-to-r from-red-100 to-red-50 text-red-800 px-4 py-2 rounded-full text-sm font-semibold border border-red-200">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <div className="mt-auto space-y-3">
                          <Button 
                            size="sm" 
                            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                            disabled={!pharmacy.medicine?.quantity || pharmacy.medicine.quantity <= 0}
                            onClick={() => {
                              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address)}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Navigation className="w-4 h-4" />
                            Get Directions
                          </Button>
                          {pharmacy.contact_phone && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-2"
                              onClick={() => {
                                alert(`Pharmacy Phone: ${pharmacy.contact_phone}`);
                                window.open(`tel:${pharmacy.contact_phone}`, '_self');
                              }}
                            >
                              <Phone className="w-4 h-4" />
                              Call Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Advertisement Section with smaller cards */}
      <div className="mt-12 relative z-10">
        <AdvertisementSection smallCards={true} />
      </div>
    </div>
  );
}
