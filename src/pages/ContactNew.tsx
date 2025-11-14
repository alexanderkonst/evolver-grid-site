import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const ContactNew = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 py-32">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-4">
              Let's Connect
            </h1>
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <a href="https://t.me/integralevolution" target="_blank" rel="noopener noreferrer">
                <Mail className="mr-2 h-5 w-5" />
                t.me/integralevolution
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactNew;
