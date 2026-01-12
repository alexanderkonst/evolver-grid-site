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
import BoldText from "@/components/BoldText";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const ModuleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const module = getModuleBySlug(slug || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Scroll animations for sections
  const heroAnimation = useScrollAnimation(0.2);
  const descriptionAnimation = useScrollAnimation(0.2);
  const whoForAnimation = useScrollAnimation(0.2);
  const outcomesAnimation = useScrollAnimation(0.2);
  const structureAnimation = useScrollAnimation(0.2);
  const appLinksAnimation = useScrollAnimation(0.2);
  const storyAnimation = useScrollAnimation(0.2);

  if (!module) {
    return (
      <div className="min-h-dvh">
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
    <div className="min-h-dvh">
      <Navigation />
      
      {/* Back Button - Left Aligned */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      {/* Hero Section - Dark Background */}
      <section 
        ref={heroAnimation.ref}
        className={`py-24 px-6 ${heroAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          {/* Central Orb */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-24 h-24 rounded-full orb-pulse"
              style={{
                background: 'radial-gradient(circle, hsl(var(--destiny-gold)) 0%, hsl(var(--destiny-gold-dark)) 30%, transparent 70%)',
                boxShadow: '0 0 60px hsla(var(--destiny-gold), 0.3)'
              }}
            />
          </div>

          <Badge variant="secondary" className="text-sm mb-6">
            <BoldText>{module.category}</BoldText>
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6 text-white">
            <BoldText>{module.title}</BoldText>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/80 leading-relaxed mb-8 max-w-3xl mx-auto">
            {module.tagline}
          </p>
          
          {/* Prominent Price Display for AI Upgrade */}
          {module.slug === "intelligence-boost-for-your-ai-model" && module.price && (
            <div className="mb-6">
              <p className="text-5xl sm:text-6xl font-bold text-white mb-2" style={{ color: 'hsl(var(--destiny-gold))' }}>
                {module.price}
              </p>
              <p className="text-lg text-white/60">One-time payment · Instant access</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <Badge variant="outline" className="text-sm text-white/60 border-white/20">
              <BoldText>{module.status}</BoldText>
            </Badge>
            {module.price && module.slug !== "intelligence-boost-for-your-ai-model" && (
              <Badge variant="outline" className="text-sm text-white/60 border-white/20">
                <BoldText>{module.price}</BoldText>
              </Badge>
            )}
            {module.version && (
              <Badge variant="outline" className="text-sm text-white/60 border-white/20">
                <BoldText>{module.version}</BoldText>
              </Badge>
            )}
          </div>
          
          {module.hero_CTA_link && module.hero_CTA_label && (
            <Button 
              asChild 
              size="lg"
              className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg"
              style={{ 
                backgroundColor: 'hsl(var(--destiny-gold))', 
                color: 'hsl(var(--destiny-dark))',
              }}
            >
              <Link to={module.hero_CTA_link}>
                <BoldText>{module.hero_CTA_label}</BoldText>
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* What This Is - Light Background */}
      <section 
        ref={descriptionAnimation.ref}
        className={`py-24 px-6 ${descriptionAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
            <BoldText>WHAT THIS IS</BoldText>
          </h2>
          <div 
            className="prose prose-lg max-w-none leading-relaxed mx-auto text-foreground/80"
            dangerouslySetInnerHTML={{ __html: module.description }}
          />
        </div>
      </section>

      {/* Who It's For - Dark Background */}
      {module.who_for && module.who_for.length > 0 && (
        <section 
          ref={whoForAnimation.ref}
          className={`py-24 px-6 ${whoForAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
          style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-white">
              <BoldText>WHO IT'S FOR</BoldText>
            </h2>
            <ul className="space-y-4 inline-block text-left">
              {module.who_for.map((item, index) => (
                <li key={index} className="text-lg text-white/70 flex items-start leading-relaxed">
                  <span className="mr-4" style={{ color: 'hsl(var(--destiny-gold))' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Outcomes - Light Background */}
      {module.outcomes && module.outcomes.length > 0 && (
        <section 
          ref={outcomesAnimation.ref}
          className={`py-24 px-6 ${outcomesAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
          style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
              <BoldText>OUTCOMES</BoldText>
            </h2>
            <ul className="space-y-4 inline-block text-left">
              {module.outcomes.map((item, index) => (
                <li key={index} className="text-lg text-foreground/80 flex items-start leading-relaxed">
                  <span className="mr-4" style={{ color: 'hsl(var(--destiny-gold-dark))' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* How It Works / Structure - Dark Background */}
      {module.structure && module.structure.length > 0 && (
        <section 
          ref={structureAnimation.ref}
          className={`py-24 px-6 ${structureAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
          style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-white">
              <BoldText>HOW IT WORKS</BoldText>
            </h2>
            <ol className="space-y-4 inline-block text-left">
              {module.structure.map((item, index) => (
                <li key={index} className="text-lg text-white/70 flex items-start leading-relaxed">
                  <span className="mr-4 font-semibold" style={{ color: 'hsl(var(--destiny-gold))' }}>{index + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Access / App Links - Light Background */}
      {module.app_links && module.app_links.length > 0 && (
        <section 
          ref={appLinksAnimation.ref}
          className={`py-24 px-6 ${appLinksAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
          style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
              <BoldText>ACCESS & APP LINKS</BoldText>
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {module.app_links.map((link, index) => {
                const isExternal = link.url.startsWith('http') || link.url.startsWith('#');
                return (
                  <Button 
                    key={index} 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="min-w-[160px] rounded-full"
                    style={{ 
                      borderColor: 'hsl(var(--destiny-gold-dark))',
                      color: 'hsl(var(--destiny-dark))'
                    }}
                  >
                    {isExternal ? (
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <BoldText>{link.label}</BoldText>
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    ) : (
                      <Link to={link.url}>
                        <BoldText>{link.label}</BoldText>
                      </Link>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Origin Story - Dark Background */}
      {module.story && (
        <section 
          ref={storyAnimation.ref}
          className={`py-24 px-6 ${storyAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
          style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
        >
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-white">
              <BoldText>ORIGIN STORY</BoldText>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed whitespace-pre-line mx-auto max-w-3xl">
              {module.story}
            </p>
          </div>
        </section>
      )}

      {/* Related Modules - Light Background */}
      {relatedModules.length > 0 && (
        <section className="py-24 px-6" style={{ backgroundColor: 'hsl(var(--destiny-light))' }}>
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
              <BoldText>RELATED MODULES</BoldText>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {relatedModules.slice(0, 3).map((relatedModule) => (
                <ModuleTile key={relatedModule.id} module={relatedModule} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SignalChannels />
      <Footer />
    </div>
  );
};

export default ModuleDetail;
