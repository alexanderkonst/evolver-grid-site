import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center px-4">
        <Button asChild size="lg" className="text-lg">
          <a href="https://t.me/integralevolution" target="_blank" rel="noopener noreferrer">
            t.me/integralevolution
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Contact;
