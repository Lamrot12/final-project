import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, MapPin, Pill, LogOut, ArrowLeft, Star, Clock, Phone, Navigation, CheckCircle, TrendingUp, MessageCircle, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export function PatientPage() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [popularMedicines, setPopularMedicines] = useState<any[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<any[]>([]);
  const [searchPharmacies, setSearchPharmacies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showPhoneNumbers, setShowPhoneNumbers] = useState<Set<string>>(new Set());
  const [processingPrescription, setProcessingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchData();
    }
  }, [userLocation]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchPharmaciesByMedicine(searchQuery);
    } else {
      setSearchPharmacies([]);
    }
  }, [searchQuery, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enter your location manually.');
          setShowLocationInput(true);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser. Please enter your location manually.');
      setShowLocationInput(true);
    }
  };

  const handleManualLocationSearch = async () => {
    if (!manualLocation.trim()) {
      setLocationError('Please enter a location');
      return;
    }

    try {
      const searchQuery = `${manualLocation}, Addis Ababa, Ethiopia`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ET`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setLocationError(null);
        setShowLocationInput(false);
      } else {
        setLocationError('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error geocoding manual location:', error);
      setLocationError('Failed to find location. Please try again.');
    }
  };

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
        searches: m.total_sold || 0
      })));
      
      // Fetch nearby pharmacies if location is available, otherwise fetch all
      let pharmacies;
      if (userLocation) {
        pharmacies = await api.getNearbyPharmacies(userLocation.lat, userLocation.lng, 10); // 10km radius
      } else {
        pharmacies = await api.getAllPharmacies();
      }
      
      const approvedPharmacies = pharmacies.filter((p: any) => p.is_verified === true);
      setNearbyPharmacies(approvedPharmacies.map((p: any) => ({
        id: p.pharmacy_id,
        name: p.pharmacy_name,
        address: p.address,
        distance: p.distance ? `${p.distance.toFixed(1)} km` : 'Nearby',
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        isOpen: p.is_open !== false,
        phone: p.contact_phone || '+251 911 000 000',
        image: p.pharmacy_image || "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop"
      })));
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load pharmacy data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setProcessingPrescription(true);
    setPrescriptionError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/ocr/process-prescription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process prescription');
      }

      const data = await response.json();
      
      // Navigate to OCR results page with the full response data
      navigate('/ocr-results', { state: { ocrData: data } });
    } catch (err) {
      console.error('Error processing prescription:', err);
      setPrescriptionError('Failed to process prescription. Please try again or search manually.');
    } finally {
      setProcessingPrescription(false);
    }
  };

  const searchPharmaciesByMedicine = async (medicine: string) => {
    setSearchLoading(true);
    try {
      const results = await api.searchPharmaciesByMedicine(medicine, userLocation?.lat, userLocation?.lng);
      setSearchPharmacies(results);
    } catch (err) {
      console.error('Error searching pharmacies by medicine:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop")' }}>
      <div className="min-h-screen bg-white/90 backdrop-blur-sm">
      <header className="bg-white/95 border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-10 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Patient Portal</h1>
              <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Find medicines & upload prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/medicine-chat">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Medicine Chat</span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="gap-2 text-xs sm:text-sm px-2 sm:px-4">
                {isLoggedIn ? (
                  <><LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span></>
                ) : (
                  <><ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Go Back</span></>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="relative group">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search medicines to find pharmacies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="pl-12 sm:pl-14 h-12 sm:h-16 text-base sm:text-lg border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">Upload Prescription</h2>
                  <p className="text-xs text-slate-500">Get quotes from nearby pharmacies</p>
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 text-center hover:border-primary hover:bg-slate-50 transition-all cursor-pointer min-h-[200px] sm:min-h-[240px] flex flex-col items-center justify-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0] && !processingPrescription) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
              >
                {processingPrescription ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto animate-pulse">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">Processing prescription...</p>
                    <p className="text-xs sm:text-sm text-slate-500">Extracting medicines with AI</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-3 sm:space-y-4 w-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm sm:text-base truncate px-4">{uploadedFile.name}</p>
                    {prescriptionError && (
                      <p className="text-xs sm:text-sm text-red-600 px-4">{prescriptionError}</p>
                    )}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setPrescriptionError(null);
                        setSearchQuery('');
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs sm:text-sm px-4 sm:px-6"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 w-full px-4">
                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 mx-auto" />
                    <p className="text-slate-600 text-sm sm:text-base">Drag & drop your prescription here</p>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={(e) => {
                        if (e.target.files?.[0] && !processingPrescription) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }} 
                      className="hidden" 
                      id="file-upload" 
                      disabled={processingPrescription} 
                    />
                    <label htmlFor="file-upload">
                      <Button 
                        size="sm" 
                        disabled={processingPrescription} 
                        className="text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-5"
                        asChild
                      >
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
              {prescriptionError && !uploadedFile && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-600">{prescriptionError}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {searchQuery ? `Pharmacies stocking "${searchQuery}"` : 'Nearby Pharmacies'}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setShowLocationInput(!showLocationInput);
                  if (!showLocationInput) {
                    getUserLocation();
                  }
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <MapPin className="w-4 h-4" />
                {userLocation ? 'Update Location' : 'Use My Location'}
              </Button>
              {locationError && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{locationError}</p>
              )}
            </div>
          </div>

          {showLocationInput && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your location (e.g., Bole, Kazanchis, Meskel Square)"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualLocationSearch();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleManualLocationSearch} className="gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Enter a neighborhood or landmark in Addis Ababa</p>
            </div>
          )}
          
          {searchLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Searching pharmacies...</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(searchQuery ? searchPharmacies : nearbyPharmacies).map((pharmacy) => (
              <div key={pharmacy.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="h-32 sm:h-40 bg-slate-200 relative overflow-hidden">
                  <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {pharmacy.distance && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {pharmacy.distance}
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{pharmacy.name}</h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-2">
                    <MapPin className="w-3 sm:w-4 h-3 sm:h-4" />
                    <span className="truncate">{pharmacy.address}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 sm:w-4 h-3 sm:h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{pharmacy.rating}</span>
                      <span className="text-slate-400">({pharmacy.reviews})</span>
                    </div>
                    {searchQuery && pharmacy.has_medicine && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        In Stock
                      </span>
                    )}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 text-xs sm:text-sm"
                      onClick={() => {
                        const newSet = new Set(showPhoneNumbers);
                        if (newSet.has(pharmacy.id)) {
                          newSet.delete(pharmacy.id);
                        } else {
                          newSet.add(pharmacy.id);
                        }
                        setShowPhoneNumbers(newSet);
                      }}
                    >
                      <Phone className="w-3 sm:w-4 h-3 sm:h-4" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1 text-xs sm:text-sm"
                      onClick={() => {
                        if (userLocation && pharmacy.latitude && pharmacy.longitude) {
                          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pharmacy.latitude},${pharmacy.longitude}`;
                          window.open(url, '_blank');
                        } else {
                          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address)}`;
                          window.open(url, '_blank');
                        }
                      }}
                    >
                      <Navigation className="w-3 sm:w-4 h-3 sm:h-4" />
                      Directions
                    </Button>
                  </div>
                  {showPhoneNumbers.has(pharmacy.id) && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-slate-500">{pharmacy.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {searchQuery && searchPharmacies.length === 0 && !searchLoading && (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No pharmacies found stocking "{searchQuery}"</p>
              <p className="text-muted-foreground text-sm mt-2">Try a different search term</p>
            </div>
          )}
        </div>
          </div>

          {/* Sidebar - Most Wanted Medicines */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-6 sticky top-20 lg:top-24">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Most Wanted</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Popular medicines</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {popularMedicines.map((medicine, index) => (
                  <div key={medicine.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${
                      index === 0 ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" :
                      index === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white" :
                      index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm">{medicine.name}</p>
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
        <div className="fixed right-0 top-0 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col h-screen sm:h-auto">
          <div className="p-3 sm:p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Medicine Chat</h3>
                  <p className="text-xs text-slate-500">Ask about medicines</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
                className="hover:bg-slate-100"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-3 sm:p-4 space-y-4 bg-slate-50">
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
