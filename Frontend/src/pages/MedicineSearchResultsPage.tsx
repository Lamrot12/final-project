import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ArrowLeft, Clock, Phone, Navigation, Pill, X } from "lucide-react";
import { api } from "@/lib/api";

export function MedicineSearchResultsPage() {
  const { medicine } = useParams<{ medicine: string }>();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!medicine) return;
      
      try {
        setLoading(true);
        const results = await api.searchPharmaciesByMedicine(medicine);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching pharmacies:', err);
        setError('Failed to search pharmacies');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [medicine]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/patient">
              <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
                <p className="text-sm text-slate-500">Pharmacies with "{medicine}"</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search medicines to find pharmacies..."
              defaultValue={medicine}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  navigate(`/search/${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
              className="w-full pl-14 pr-14 h-16 text-lg border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-lg"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500">Searching pharmacies...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No pharmacies found</h3>
            <p className="text-slate-500">No pharmacies have "{medicine}" in stock</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-600">{searchResults.length} pharmacy{searchResults.length !== 1 ? 'ies' : ''} found with "{medicine}"</p>
            </div>
            
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.pharmacy_id} className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{result.pharmacy_name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {result.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {result.is_open ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Open Now
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{result.medicine.brand_name || result.medicine.generic_name}</p>
                          <p className="text-sm text-slate-500">{result.medicine.generic_name !== result.medicine.brand_name ? result.medicine.generic_name : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{result.medicine.quantity}</p>
                          <p className="text-xs text-slate-500">in stock</p>
                        </div>
                      </div>
                      {result.medicine.expiry_date && (
                        <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                          Expires: {new Date(result.medicine.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {result.contact_phone && (
                        <Button variant="outline" className="flex-1 gap-2">
                          <Phone className="w-4 h-4" />
                          Call
                        </Button>
                      )}
                      <Button className="flex-1 gap-2">
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
