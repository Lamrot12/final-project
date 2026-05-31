import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, CheckCircle, AlertCircle, TrendingUp, Shield, Sparkles } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface Drug {
  name: string;
  drug_name?: string;
  confidence?: number;
}

interface OCRResponse {
  extracted_text?: string;
  predicted_label?: string;
  confidence_score?: number;
  normalized_drugs?: Drug[];
  raw_text?: string;
}

export function OCRResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ocrData, setOcrData] = useState<OCRResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get OCR data from location state
    if (location.state?.ocrData) {
      setOcrData(location.state.ocrData);
    }
    setLoading(false);
  }, [location]);

  const handleMedicineClick = (medicineName: string) => {
    navigate(`/search/${encodeURIComponent(medicineName)}`, { state: { fromOCR: true, ocrData } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!ocrData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No OCR data found</p>
            <Button asChild className="mt-4">
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle both string array and object array for normalized_drugs
  const normalizedDrugs = ocrData.normalized_drugs || [];
  const drugs = normalizedDrugs.map((drug: any) => 
    typeof drug === 'string' ? { name: drug } : drug
  );
  
  const extractedText = ocrData.extracted_text || ocrData.raw_text || '';
  const predictedLabel = ocrData.predicted_label || '';
  const confidenceScore = ocrData.confidence_score || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/patient" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Prescription Analysis Results</h1>
          <p className="text-muted-foreground">
            {drugs.length > 0
              ? `Found ${drugs.length} medicine(s) in your prescription`
              : extractedText ? 'Text extracted from prescription' : 'No medicines detected in the prescription'}
          </p>
        </div>

        {drugs.length > 0 ? (
          <div className="space-y-6">
            {/* Overall Analysis Summary */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Pill className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Prescription Analysis Complete</h2>
                    <p className="text-muted-foreground">
                      {drugs.length} medicine(s) detected and ready for search
                    </p>
                  </div>
                </div>
                {confidenceScore > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Overall Confidence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${Math.round(confidenceScore * 100)}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-primary">{Math.round(confidenceScore * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Individual Drug Cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {drugs.map((drug, index) => (
                <div
                  key={index}
                  onClick={() => handleMedicineClick(drug.name || drug.drug_name || '')}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer group hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-all group-hover:from-primary/10" />
                  
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <Pill className="w-10 h-10 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                      {drug.name || drug.drug_name || 'Unknown Medicine'}
                    </h3>
                    
                    {drug.confidence && (
                      <div className="w-full mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-semibold text-muted-foreground">Confidence Score</span>
                          </div>
                          <span className="text-sm font-bold text-primary">{Math.round(drug.confidence * 100)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all relative" 
                            style={{ width: `${Math.round(drug.confidence * 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            {drug.confidence >= 0.8 ? 'High Confidence' : drug.confidence >= 0.5 ? 'Medium Confidence' : 'Low Confidence'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto pt-3 border-t border-border w-full">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="font-medium">Click to search pharmacies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : extractedText ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center">
                  <Pill className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Extracted Text</h3>
                  {predictedLabel && (
                    <p className="text-sm text-muted-foreground">Classification: {predictedLabel}</p>
                  )}
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-6">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{extractedText}</p>
              </div>
              {confidenceScore > 0 && (
                <div className="mt-6 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Confidence: {Math.round(confidenceScore * 100)}%</p>
                </div>
              )}
            </div>
            <div className="text-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/search">Search for Medicines</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-muted/50 to-muted/30 border border-border rounded-xl">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-foreground text-2xl font-bold mb-2">No Medicines Detected</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Could not extract medicine information from the image. Try uploading a clearer image or search manually.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/search">Search Manually</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
