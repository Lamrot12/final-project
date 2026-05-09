import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Pill } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-black">PharmaLink</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-black   font-bold hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-primary  hover:text-primary transition-colors font-bold"
            >
              How it Works
            </a>
              <a
              href="#for-patients"
              className="text-black hover:text-primary transition-colors font-bold"
            >
              For Patients
            </a>
            <a
              href="#for-pharmacies"
              className="text-primary  hover:text-primary transition-colors font-bold"
            >
              For Pharmacies
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/patient">Patient Portal</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="px-6" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <a
              href="#features"
              className="block text-foreground py-2"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block text-foreground py-2"
              onClick={() => setIsOpen(false)}
            >
              How it Works
            </a>
            <a
              href="#for-pharmacies"
              className="block text-foreground py-2"
              onClick={() => setIsOpen(false)}
            >
              For Pharmacies
            </a>
            <div className="pt-4 space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
