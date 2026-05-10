import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, MapPin, Pill, LogOut, ArrowLeft, Star, Clock, Phone, Navigation, CheckCircle, TrendingUp, MessageCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export function PatientPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [popularMedicines, setPopularMedicines] = useState<any[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch popular medicines
      const medicines = await api.getPopularMedicines(8);
      setPopularMedicines(medicines.map((m: any) => ({
        id: m.medicine_id,
        name: m.brand_name || m.generic_name,
        category: m.category || 'General',
        searches: m.search_count || 0
      })));
      
      // Fetch all pharmacies
      const pharmacies = await api.getAllPharmacies();
      setNearbyPharmacies(pharmacies.map((p: any) => ({
        id: p.pharmacy_id,
        name: p.pharmacy_name,
        address: p.address,
        distance: 'Nearby',
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        isOpen: p.is_open !== false,
        phone: p.contact_phone || '+251 911 000 000',
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop"
      })));
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load pharmacy data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop")' }}>
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      <header className="bg-white/95 border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Patient Portal</h1>
              <p className="text-sm text-slate-500">Find medicines & upload prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowChat(!showChat)}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Medicine Chat
            </Button>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                {isLoggedIn ? (
                  <><LogOut className="w-4 h-4" /> Logout</>
                ) : (
                  <><ArrowLeft className="w-4 h-4" /> Go Back</>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search medicines, pharmacies..."
              className="pl-14 h-16 text-lg border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-lg"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload Prescription</h2>
                  <p className="text-xs text-slate-500">Get quotes from nearby pharmacies</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-primary hover:bg-slate-50 transition-all cursor-pointer">
                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm">{uploadedFile.name}</p>
                    <Button onClick={() => setUploadedFile(null)} variant="outline" size="sm">Remove</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-slate-600 text-sm">Drag & drop your prescription here</p>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload">
                      <Button size="sm">Choose File</Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Nearby Pharmacies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {nearbyPharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="h-40 bg-slate-200 relative overflow-hidden">
                  <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{pharmacy.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{pharmacy.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{pharmacy.rating}</span>
                      <span className="text-slate-400">({pharmacy.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-4 h-4 text-slate-400" />
                      <span>{pharmacy.distance}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {pharmacy.isOpen ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Open Now
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                    <Button size="sm" className="flex-1 gap-1">
                      <Navigation className="w-4 h-4" />
                      Directions
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </div>

          {/* Sidebar - Most Wanted Medicines */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Most Wanted</h2>
                  <p className="text-sm text-slate-500">Popular medicines</p>
                </div>
              </div>
              <div className="space-y-3">
                {popularMedicines.map((medicine, index) => (
                  <div key={medicine.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" :
                      index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white" :
                      index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{medicine.name}</p>
                      <p className="text-xs text-slate-500">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{(medicine.searches / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed right-0 top-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Medicine Chat</h3>
                  <p className="text-xs text-slate-500">Ask about medicines</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 bg-slate-50">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Pill className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-4 mb-145 max-w-[280px] shadow-sm">
                <p className="text-sm text-slate-700">Hello! I'm your medicine assistant. Ask me about any medicine and I'll help you understand its uses, dosage, and side effects.</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about a medicine..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:border-primary focus:outline-none text-sm"
              />
              <Button size="icon" className="bg-primary hover:bg-primary/90 h-12 w-12">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
