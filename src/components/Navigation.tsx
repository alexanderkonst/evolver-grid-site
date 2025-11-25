import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.png";
import headerImage from "@/assets/header-image.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/work", label: "lifehacks", isScroll: false },
    { to: "/library", label: "library", isScroll: false },
    { to: "/contact", label: "contact", isScroll: false },
    { to: "https://buy.stripe.com/4gweVVb2E75r0Wk00p", label: "donate", isScroll: false, isExternal: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center transition-all duration-300 z-10 logo-glow hover:logo-glow-hover"
          >
            <img src={logo} alt="Aleksandr Konstantinov" className="h-16 w-auto" />
          </Link>

          {/* Header Image - Left Aligned after Logo */}
          <div 
            className="hidden md:block absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none ml-4"
          >
            <img src={headerImage} alt="" className="h-12 w-auto opacity-80" style={{ maxWidth: '600px', objectFit: 'contain' }} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 relative z-10">
            {navLinks.map((link) => (
              link.isScroll ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('modules');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {link.label}
                </a>
              ) : link.isExternal ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-foreground"
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              link.isScroll ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('modules');
                    element?.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ) : link.isExternal ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  activeClassName="text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
