import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function PharmacyProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Pharmacy Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Abeba Pharmacy</h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                <span>Bole Road, Near Edna Mall, Addis Ababa</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>+251 911 123 456</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>8:00 AM - 9:00 PM</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-muted-foreground ml-2">(4.8 from 120 reviews)</span>
              </div>
            </div>
            <Button size="lg" className="gap-2">
              <MapPin className="w-5 h-5" />
              Get Directions
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground">
                Abeba Pharmacy has been serving the Addis Ababa community for over 15 years. We are committed to providing quality medicines and excellent customer service. Our pharmacists are highly trained and always ready to assist you with your medication needs.
              </p>
            </div>

            {/* Available Medicines */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Available Medicines</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">Amoxicillin 500mg</h3>
                    <p className="text-sm text-muted-foreground">30 tablets</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">Paracetamol 500mg</h3>
                    <p className="text-sm text-muted-foreground">20 tablets</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">Ibuprofen 400mg</h3>
                    <p className="text-sm text-muted-foreground">15 tablets</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold text-foreground">Omeprazole 20mg</h3>
                    <p className="text-sm text-muted-foreground">14 capsules</p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/search">View All Medicines</Link>
              </Button>
            </div>

            {/* Reviews */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-muted-foreground">Excellent service! Found my medicine quickly and the staff was very helpful.</p>
                </div>
                <div className="border-b border-border pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </div>
                  <p className="text-muted-foreground">Good pharmacy with reasonable prices. Would recommend.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Operating Hours */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Operating Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="text-foreground font-medium">8:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="text-foreground font-medium">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="text-foreground font-medium">10:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">+251 911 123 456</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Bole Road, Addis Ababa</span>
                </div>
              </div>
              <Button className="w-full mt-4">Call Now</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
