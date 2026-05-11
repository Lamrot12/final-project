import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ForPharmaciesSection } from "@/components/landing/for-pharmacies-section"
import { AdvertisementSection } from "@/components/landing/advertisement-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { LoginPage } from "@/pages/LoginPage"
import { PatientRegisterPage } from "@/pages/PatientRegisterPage"
import { PharmacyRegisterPage } from "@/pages/PharmacyRegisterPage"
import { MedicineSearchPage } from "@/pages/MedicineSearchPage"
import { MedicineDetailPage } from "@/pages/MedicineDetailPage"
import { PharmacyProfilePage } from "@/pages/PharmacyProfilePage"
import { HelpPage } from "@/pages/HelpPage"
import { AboutPage } from "@/pages/AboutPage"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { SearchPage } from "@/pages/SearchPage"
import { AdminPage } from "@/pages/AdminPage"
import { BinCardPage } from "@/pages/BinCardPage"
import { PharmacyDashboard } from "@/pages/PharmacyDashboard"
import { PatientPage } from "@/pages/PatientPage"
import { TermsPage } from "@/pages/TermsPage"
import { PrivacyPage } from "@/pages/PrivacyPage"
import { ContactPage } from "@/pages/ContactPage"
import AdminDashboard  from "@/pages/AdminDashboard"

function AppLayout() {
  const location = useLocation();
  const hideHeaderFooterRoutes = ['/login', '/register', '/register/pharmacy', '/forgot-password', '/search', '/admin', '/admin/bincard', '/pharmacy/dashboard', '/patient', '/about', '/terms', '/privacy', '/contact'];
  const showHeaderFooter = !hideHeaderFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showHeaderFooter && <Header />}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <FeaturesSection />
              <HowItWorksSection />
              <ForPharmaciesSection />
              <AdvertisementSection />
              <TestimonialsSection />
              <CTASection />
            </>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<PatientRegisterPage />} />
          <Route path="/register/pharmacy" element={<PharmacyRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/admin/bincard" element={<BinCardPage />} />
          <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/medicine/:id" element={<MedicineDetailPage />} />
          <Route path="/pharmacy/:id" element={<PharmacyProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  )
}

export default AppLayout
