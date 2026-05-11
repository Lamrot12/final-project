import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Phone, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

export function MedicineSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Find Your Medicine</h1>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for medicine name..."
                className="pl-12 h-12 text-lg"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2" size="lg">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">Showing results for "Amoxicillin"</p>
        </div>

        <div className="grid gap-4">
          {/* Pharmacy Card 1 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Abeba Pharmacy</h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Bole, Addis Ababa</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Open until 9 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>+251 911 123 456</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                  <span className="text-muted-foreground text-sm">500mg - 30 tablets</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pharmacy/1">View Details</Link>
                </Button>
                <Button size="sm" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          {/* Pharmacy Card 2 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">MediCare Pharmacy</h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Kazanchis, Addis Ababa</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Open until 10 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>+251 911 789 012</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                  <span className="text-muted-foreground text-sm">250mg - 20 capsules</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pharmacy/2">View Details</Link>
                </Button>
                <Button size="sm" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>

          {/* Pharmacy Card 3 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Health Plus Pharmacy</h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Megenagna, Addis Ababa</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Open until 8 PM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>+251 911 345 678</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pharmacy/3">View Details</Link>
                </Button>
                <Button size="sm" className="gap-2" disabled>
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
