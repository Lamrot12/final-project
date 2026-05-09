import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Building2, Mail, Lock, Phone, MapPin, FileText, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export function PharmacyRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pharmacyName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // First register the user
      const userResponse = await api.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.pharmacyName,
        phone: formData.phone,
        user_type: 'pharmacy'
      });

      console.log('User registration successful:', userResponse);
      
      // Then register the pharmacy (this would need a separate endpoint, for now we'll use the same)
      // In a real app, you'd create a pharmacy record with the pharmacy details
      setSuccess(true);
      
      // Redirect to login after 2 seconds
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h2>
          <p className="text-muted-foreground mb-4">Your pharmacy account has been created successfully.</p>
          <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar with Back Button */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">PharmaLink</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-4xl">
          {/* Register Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Pill className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Register Your Pharmacy</h1>
              <p className="text-muted-foreground">Join our network of pharmacies</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pharmacyName"
                      type="text"
                      placeholder="Pharmacy name"
                      className="pl-12 h-12 border-2 focus:border-primary"
                      value={formData.pharmacyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="EFDA license number"
                      className="pl-12 h-12 border-2 focus:border-primary"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Pharmacy email"
                    className="pl-12 h-12 border-2 focus:border-primary"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Contact phone number"
                    className="pl-12 h-12 border-2 focus:border-primary"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Pharmacy address"
                    className="pl-12 h-12 border-2 focus:border-primary"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-12 h-12 border-2 focus:border-primary"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-12 h-12 border-2 focus:border-primary"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-border mt-1 w-4 h-4" />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button type="submit" className="w-full h-12 text-lg" size="lg" disabled={loading}>
                {loading ? 'Registering...' : 'Register Pharmacy'}
              </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-border">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Are you a patient?{" "}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Register as Patient
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
