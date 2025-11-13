import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const ContactNew = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple form handling - in production, this would connect to a backend
    setSubmitted(true);
    toast.success("Message sent! I'll get back to you soon.");
  };

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

          {!submitted ? (
            <div className="space-y-8">
              {/* Email Form */}
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project or inquiry..."
                    rows={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full h-12">
                  Send Message
                </Button>
              </form>

              {/* Alternative Contact */}
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Or reach out directly:</p>
                <Button asChild size="lg" variant="outline">
                  <a href="https://t.me/integralevolution" target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-5 w-5" />
                    t.me/integralevolution
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
              <h2 className="text-2xl font-serif font-semibold">Thank you!</h2>
              <p className="text-lg text-muted-foreground">
                Your message has been received. I'll get back to you soon.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactNew;
