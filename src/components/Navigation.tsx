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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftLinks = [
    { to: "/work", label: "Lifehacks", isScroll: false, isExternal: false },
    { to: "/library", label: "Library", isScroll: false, isExternal: false },
  ];

  const rightLinks = [
    { to: "/contact", label: "Contact", isScroll: false, isExternal: false },
    { to: "https://buy.stripe.com/4gweVVb2E75r0Wk00p", label: "Donate", isScroll: false, isExternal: true },
  ];

  const allLinks = [...leftLinks, ...rightLinks];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* Left Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 z-10">
            {leftLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-accent after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                activeClassName="text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Centered Logo and Header Image */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            {/* Header Image - Behind with Parallax */}
            <img 
              src={headerImage} 
              alt="" 
              className="h-14 w-auto opacity-80 transition-transform duration-150"
              style={{ 
                maxWidth: '720px', 
                objectFit: 'contain',
                transform: `translateY(${scrollY * 0.1}px)`
              }}
            />
            {/* Logo - On Top with Glow */}
            <Link 
              to="/" 
              className="absolute flex items-center transition-all duration-300 hover:scale-110 drop-shadow-[0_0_15px_rgba(33,84,153,0.4)] hover:drop-shadow-[0_0_20px_rgba(33,84,153,0.6)] z-10"
            >
              <img src={logo} alt="Aleksandr Konstantinov" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Right Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 z-10">
            {rightLinks.map((link) => (
              link.isExternal ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-accent after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-accent after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
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
            {allLinks.map((link) => (
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
