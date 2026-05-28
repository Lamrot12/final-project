import { Button } from "@/components/ui/button";
import { Pill, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";

export function MedicineDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/search" className="text-primary hover:underline">
            ← Back to Search Results
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medicine Header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Amoxicillin</h1>
                  <p className="text-lg text-muted-foreground">Amoxicillin Trihydrate 500mg</p>
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Pill className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Available at 12 pharmacies
                </span>
              </div>

              <p className="text-muted-foreground">
                Amoxicillin is a penicillin antibiotic used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria.
              </p>
            </div>

            {/* Usage Instructions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Usage Instructions</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Take this medication by mouth with or without food as directed by your doctor</li>
                <li>• Usually taken every 8 or 12 hours</li>
                <li>• Finish the full prescribed course even if symptoms disappear</li>
                <li>• Do not skip doses or stop early unless directed by your doctor</li>
              </ul>
            </div>

            {/* Side Effects */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-foreground">Side Effects</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Common Side Effects</h3>
                  <p className="text-muted-foreground">Nausea, vomiting, diarrhea, stomach pain</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Serious Side Effects</h3>
                  <p className="text-muted-foreground">Severe allergic reactions, liver problems, unusual bleeding</p>
                </div>
              </div>
            </div>

            {/* Contraindications */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-foreground">Contraindications</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Do not use if allergic to penicillin or cephalosporin antibiotics</li>
                <li>• Inform your doctor if you have kidney disease or mononucleosis</li>
                <li>• May interact with certain medications like probenecid</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available Pharmacies */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Available At</h2>
              <div className="space-y-4">
                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold text-foreground">Abeba Pharmacy</h3>
                  <p className="text-sm text-muted-foreground mb-2">Bole, Addis Ababa</p>
                  <p className="text-sm text-primary font-medium">500mg - 30 tablets</p>
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link to="/pharmacy/1">View Pharmacy</Link>
                  </Button>
                </div>
                <div className="border-b border-border pb-4">
                  <h3 className="font-semibold text-foreground">MediCare Pharmacy</h3>
                  <p className="text-sm text-muted-foreground mb-2">Kazanchis, Addis Ababa</p>
                  <p className="text-sm text-primary font-medium">250mg - 20 capsules</p>
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link to="/pharmacy/2">View Pharmacy</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Medical Disclaimer</h3>
                  <p className="text-sm text-yellow-800">
                    This information is for educational purposes only. Always consult a healthcare professional before taking any medication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
