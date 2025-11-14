import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import logo from "@/assets/logo.png";
import headerImage from "@/assets/header-image.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/work", label: "Lifehacks", isScroll: false },
    { to: "/about", label: "About", isScroll: false },
    { to: "/contact", label: "Contact", isScroll: false },
    { to: "/library", label: "Library", isScroll: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Aleksandr Konstantinov" className="h-10 w-auto" />
          </Link>

          {/* Header Image - Centered */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <img src={headerImage} alt="" className="h-12 w-auto opacity-90" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.isScroll ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('modules');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
