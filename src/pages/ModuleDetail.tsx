import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { getModuleBySlug, getRelatedModules } from "@/data/modules";
import Navigation from "@/components/Navigation";
import ModuleTile from "@/components/ModuleTile";
import SignalChannels from "@/components/SignalChannels";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";

const ModuleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const module = getModuleBySlug(slug || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!module) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-serif font-bold mb-4">Module Not Found</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedModules = getRelatedModules(module.id, module.related_modules);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button - Centered */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </div>

          {/* Hero Section - Centered */}
          <div className="mb-16 space-y-6 text-center">
            <Badge variant="secondary" className="text-sm">
              {module.category}
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl font-serif font-bold leading-tight">
              {module.title}
            </h1>
            
            <p className="text-2xl sm:text-3xl text-muted-foreground leading-relaxed">
              {module.tagline}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="text-sm">
                {module.status}
              </Badge>
            </div>
            
            {module.hero_CTA_link && module.hero_CTA_label && (
              <div className="pt-4">
                <Button asChild size="lg">
                  <a href={module.hero_CTA_link} target="_blank" rel="noopener noreferrer">
                    {module.hero_CTA_label}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* What This Is - Centered */}
          <section className="mb-16 pb-16 border-b border-border text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-6">What This Is</h2>
            <div 
              className="prose prose-invert prose-lg max-w-none leading-relaxed mx-auto"
              dangerouslySetInnerHTML={{ __html: module.description }}
            />
          </section>

          {/* Who It's For - Centered */}
          {module.who_for && module.who_for.length > 0 && (
            <section className="mb-16 pb-16 border-b border-border text-center">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-6">Who It's For</h2>
              <ul className="space-y-4 inline-block text-left">
                {module.who_for.map((item, index) => (
                  <li key={index} className="text-lg sm:text-xl text-foreground flex items-start leading-relaxed">
                    <span className="mr-4 text-accent">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Outcomes - Centered */}
          {module.outcomes && module.outcomes.length > 0 && (
            <section className="mb-16 pb-16 border-b border-border text-center">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-6">Outcomes</h2>
              <ul className="space-y-4 inline-block text-left">
                {module.outcomes.map((item, index) => (
                  <li key={index} className="text-lg sm:text-xl text-foreground flex items-start leading-relaxed">
                    <span className="mr-4 text-accent">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* How It Works / Structure - Centered */}
          {module.structure && module.structure.length > 0 && (
            <section className="mb-16 pb-16 border-b border-border text-center">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-6">How It Works</h2>
              <ol className="space-y-4 inline-block text-left">
                {module.structure.map((item, index) => (
                  <li key={index} className="text-lg sm:text-xl text-foreground flex items-start leading-relaxed">
                    <span className="mr-4 font-semibold text-accent">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Access / App Links - Centered */}
          {module.app_links && module.app_links.length > 0 && (
            <section className="mb-16 pb-16 border-b border-border text-center">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-6">Access & App Links</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {module.app_links.map((link, index) => (
                  <Button key={index} asChild variant="outline" size="lg" className="min-w-[160px]">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}

          {/* Origin Story - Centered */}
          {module.story && (
            <section className="mb-16 pb-16 border-b border-border text-center">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-6">Origin Story</h2>
              <p className="text-lg sm:text-xl text-foreground leading-relaxed whitespace-pre-line mx-auto max-w-3xl">
                {module.story}
              </p>
            </section>
          )}

          {/* Related Modules */}
          {relatedModules.length > 0 && (
            <section className="mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold mb-8">Related Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {relatedModules.slice(0, 3).map((relatedModule) => (
                  <ModuleTile key={relatedModule.id} module={relatedModule} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <SignalChannels />
      <Footer />
    </div>
  );
};

export default ModuleDetail;
