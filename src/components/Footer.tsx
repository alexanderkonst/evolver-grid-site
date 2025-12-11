import { Link } from "react-router-dom";
import { Youtube, Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Links & Channels */}
          <nav className="flex flex-wrap justify-center gap-6 items-center">
            <Link
              to="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <a
              href="https://www.youtube.com/@IntegralEvolution"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Youtube className="h-4 w-4" />
              YouTube
            </a>
            <a
              href="https://t.me/ARKHAZM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              ARKHAZM
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aleksandr Konstantinov
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
