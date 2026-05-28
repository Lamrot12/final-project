import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Building2, Mail, Lock, Phone, MapPin, FileText, ArrowLeft, CheckCircle, AlertCircle, User, AlertTriangle, Upload, X, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function PharmacyRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    staffEmail: '',
    staffPassword: '',
    confirmPassword: '',
    staffPhone: '',
    pharmacyName: '',
    address: '',
    pharmacyPhone: '',
    pharmacyEmail: '',
    operatingHours: '',
    licenseNumber: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    latitude: '',
    longitude: ''
  });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.1450, 38.7400]); // Default to Addis Ababa, Ethiopia
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);

  const [geocodeTimeout, setGeocodeTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    
    // Geocode address when user types in address field with debouncing
    if (e.target.id === 'address' && e.target.value.length > 3) {
      if (geocodeTimeout) {
        clearTimeout(geocodeTimeout);
      }
      const timeout = setTimeout(() => {
        handleAddressGeocode(e.target.value);
      }, 500); // 500ms debounce
      setGeocodeTimeout(timeout);
    }
  };

  const handleAddressGeocode = async (address: string) => {
    try {
      console.log('Geocoding address:', address);
      // Add Ethiopia and Addis Ababa context for better results
      const searchQuery = address.includes('Ethiopia') ? address : `${address}, Addis Ababa, Ethiopia`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ET`);
      const data = await response.json();
      console.log('Geocoding result:', data);
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        console.log('Setting location to:', latitude, longitude);
        setSelectedLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setFormData(prev => ({ 
          ...prev, 
          latitude: latitude.toString(), 
          longitude: longitude.toString(),
          address: display_name || address
        }));
        setShowMap(true);
      } else {
        console.log('No results found for:', address);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location obtained:', { latitude, longitude });
          setSelectedLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setFormData({ ...formData, latitude: latitude.toString(), longitude: longitude.toString() });
          
          // Reverse geocode to get address
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data.display_name) {
              setFormData(prev => ({ ...prev, address: data.display_name }));
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          }
          
          setShowMap(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location';
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable location services.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please check your device settings.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out.';
          }
          setError(errorMessage + ' Please select it from the map.');
          setShowMap(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setShowMap(true);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      async click(e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        console.log('Map clicked at:', lat, lng);
        setSelectedLocation({ lat, lng });
        setFormData(prev => ({ 
          ...prev, 
          latitude: lat.toString(), 
          longitude: lng.toString() 
        }));
        
        // Reverse geocode to get address
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          console.log('Reverse geocoding result:', data);
          if (data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        }
      }
    });
    return null;
  };

  // Fix for default marker icon
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const handleLicenseDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLicenseDocument(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.staffPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.staffPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!licenseDocument) {
      setError('Please upload a license document');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please select your pharmacy location from the map');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('staffEmail', formData.staffEmail);
      formDataToSend.append('staffPassword', formData.staffPassword);
      formDataToSend.append('staffPhone', formData.staffPhone);
      formDataToSend.append('pharmacyName', formData.pharmacyName);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('pharmacyPhone', formData.pharmacyPhone);
      formDataToSend.append('pharmacyEmail', formData.pharmacyEmail);
      formDataToSend.append('operatingHours', formData.operatingHours);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('licenseIssueDate', formData.licenseIssueDate);
      formDataToSend.append('licenseExpiryDate', formData.licenseExpiryDate);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitude', formData.longitude);
      if (licenseDocument) {
        formDataToSend.append('licenseDocument', licenseDocument);
      }

      const response = await api.registerPharmacy(formDataToSend);

      console.log('Pharmacy registration successful:', response);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-600 mb-4">Your pharmacy registration has been submitted for verification.</p>
          <p className="text-sm text-slate-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* Top Bar with Back Button */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors w-fit">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Close Button (X) */}
        <Link to="/" className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </Link>

        {/* Header Section */}
        <div className="p-6 pb-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Register Your Pharmacy</h1>
          <p className="text-sm text-slate-500 mt-1">Join our network of verified pharmacies</p>
        </div>

        {/* Scrollable Content Area */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Important Terms Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800">
            <div className="flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-amber-900">Important Terms to Remember</h3>
                <ul className="text-xs space-y-1.5 leading-relaxed font-medium">
                  <li className="flex items-start"><span className="mr-1.5 text-amber-600">✓</span> All information provided must be true and valid</li>
                  <li className="flex items-start"><span className="mr-1.5 text-amber-600">✓</span> You are legally responsible for any issues arising from your license</li>
                  <li className="flex items-start"><span className="mr-1.5 text-amber-600">✓</span> Invalid information will result in automatic rejection</li>
                  <li className="flex items-start"><span className="mr-1.5 text-amber-600">✓</span> Free trial period: 3 months, then subscription required</li>
                  <li className="flex items-start"><span className="mr-1.5 text-amber-600">✓</span> Staff email and password will be used to login and check approval status</li>
                  <li className="flex items-start"><span className="mr-1.5 text-amber-600">✓</span> Pharmacy and staff contact information should be different for backup communication</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section: Staff Account Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-semibold text-slate-800">Staff Account Information</h2>
            </div>
            <p className="text-xs text-slate-500">Use these credentials to login and check your application status</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                {/* Staff Email */}
                <div className="space-y-2">
                  <Label htmlFor="staffEmail" className="text-xs font-semibold text-slate-700">Staff Email *</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.staffEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">Use this email to login and receive updates</span>
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="staffPassword" className="text-xs font-semibold text-slate-700">Password *</Label>
                  <Input
                    id="staffPassword"
                    type="password"
                    placeholder="Create a password"
                    value={formData.staffPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                {/* Staff Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="staffPhone" className="text-xs font-semibold text-slate-700">Staff Phone Number *</Label>
                  <Input
                    id="staffPhone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.staffPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">Alternative contact for important updates</span>
                </div>
              </div>
            </div>

            {/* Section: Pharmacy Information */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-slate-600" />
                <h2 className="text-base font-semibold text-slate-800">Pharmacy Information</h2>
              </div>
              <p className="text-xs text-slate-500">Provide accurate pharmacy details for verification</p>

              <div className="space-y-4">
                {/* Pharmacy Name */}
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName" className="text-xs font-semibold text-slate-700">Pharmacy Name *</Label>
                  <Input
                    id="pharmacyName"
                    type="text"
                    placeholder="Enter pharmacy name"
                    value={formData.pharmacyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Pharmacy Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-semibold text-slate-700">Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      type="text"
                      placeholder="Enter full address (map will zoom to location)"
                      value={formData.address}
                      onChange={handleChange}
                      onFocus={() => setShowMap(true)}
                      required
                      className="flex-1 px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <Button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="px-3 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Detect Location
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400">Type address to zoom map, click "Detect Location" to auto-detect, or click map to select location</p>
                </div>

                {/* Location Map - Directly below address */}
                {showMap && (
                  <div className="space-y-2">
                    <div className="h-64 rounded-lg overflow-hidden border border-slate-200">
                      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler />
                        {selectedLocation && (
                          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                        )}
                      </MapContainer>
                    </div>
                    {selectedLocation && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <p><strong>Selected Location:</strong></p>
                        <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
                        <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500">Click on the map to select your pharmacy location</p>
                  </div>
                )}

                {/* Contact info grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pharmacy Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyPhone" className="text-xs font-semibold text-slate-700">Pharmacy Contact Phone *</Label>
                    <Input
                      id="pharmacyPhone"
                      type="tel"
                      placeholder="Pharmacy phone number"
                      value={formData.pharmacyPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <span className="text-[10px] text-slate-400 block">Different from staff phone for backup</span>
                  </div>
                  {/* Pharmacy Email */}
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyEmail" className="text-xs font-semibold text-slate-700">Pharmacy Contact Email *</Label>
                    <Input
                      id="pharmacyEmail"
                      type="email"
                      placeholder="Pharmacy contact email"
                      value={formData.pharmacyEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <span className="text-[10px] text-slate-400 block">Different from staff email for backup</span>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="space-y-2">
                  <Label htmlFor="operatingHours" className="text-xs font-semibold text-slate-700">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    type="text"
                    placeholder="e.g., Mon-Fri: 9AM-9PM, Sat: 10AM-6PM"
                    value={formData.operatingHours}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section: License Information */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <h2 className="text-base font-semibold text-slate-800">License Information</h2>
              </div>
              <p className="text-xs text-slate-500">Legal requirement - Ensure all information is accurate</p>

              <div className="space-y-4">
                {/* License Number */}
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-xs font-semibold text-slate-700">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="Enter pharmacy license number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Issue & Expiry Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseIssueDate" className="text-xs font-semibold text-slate-700">Issue Date</Label>
                    <Input
                      id="licenseIssueDate"
                      type="date"
                      value={formData.licenseIssueDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiryDate" className="text-xs font-semibold text-slate-700">Expiry Date</Label>
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-600"
                    />
                  </div>
                </div>

                {/* License Document Upload */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">License Document *</Label>
                  <div className="relative flex items-center justify-between border border-slate-200 bg-white rounded-lg px-3 py-2 cursor-pointer hover:border-slate-300">
                    <input 
                      type="file" 
                      accept=".jpg,.png,.pdf" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleLicenseDocumentChange}
                    />
                    <span className="text-sm text-slate-500">Choose File</span>
                    <span className="text-xs text-slate-400">{licenseDocument ? licenseDocument.name : 'No file chosen'}</span>
                    <Upload className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">Upload official pharmacy license (JPG, PNG, or PDF, max 5MB)</span>
                </div>
              </div>
            </div>

            {/* Consent / Terms Card */}
            <div className="border border-slate-200 bg-white rounded-xl p-5 space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" required className="w-4 h-4 mt-0.5 accent-primary text-white rounded focus:ring-primary" />
                <div className="text-sm font-semibold text-slate-800">
                  I agree to the terms and conditions
                </div>
              </label>
              <div className="pl-7 space-y-2">
                <p className="text-xs text-slate-500 font-medium">By checking this box, you confirm that:</p>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>All information provided is true and valid to the best of your knowledge</li>
                  <li>You accept full legal responsibility for the license and pharmacy operations</li>
                  <li>You understand that invalid information will lead to automatic rejection</li>
                  <li>You agree to the 3-month free trial period, after which subscription is required</li>
                  <li>You will use the staff email and password to access the system</li>
                </ul>
              </div>
            </div>

            {/* Free Trial Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-blue-800">
              <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-600" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold">Free Trial Information</h4>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  You get 3 months of free access to all features. After the trial period, a subscription is required to continue using the system. You will be notified before your trial ends.
                </p>
              </div>
            </div>

            {/* Submit CTA Button */}
            <Button 
              type="submit" 
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Pharmacy'}
            </Button>

            {/* Links */}
            <div className="text-center space-y-3 pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                Are you a patient?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Register as Patient
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
  );
}
