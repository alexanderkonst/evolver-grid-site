import { useState } from "react";
import { Link } from "react-router-dom";
import { modules, getModulesByCategory } from "@/data/modules";
import ModuleTile from "@/components/ModuleTile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SignalChannels from "@/components/SignalChannels";
import SectionDivider from "@/components/SectionDivider";
import TextReveal from "@/components/TextReveal";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import profilePhoto from "@/assets/profile-photo.png";
import BoldText from "@/components/BoldText";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const heroAnimation = useScrollAnimation();
  const modulesAnimation = useScrollAnimation();
  const aboutAnimation = useScrollAnimation();

  const categories = ["ALL", "AI", "GROWTH", "BUSINESS", "CEREMONIES", "TOOLS"];
  const filteredModules = getModulesByCategory(selectedCategory);

  return (
    <div className="min-h-dvh flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section
        ref={heroAnimation.ref}
        className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${heroAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Profile Photo */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-lg border-4 border-[hsl(210,70%,15%)]">
              <img
                src={profilePhoto}
                alt="Aleksandr Konstantinov"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold uppercase">
              <BoldText>Aleksandr Konstantinov</BoldText>
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl max-w-2xl uppercase">
              <BoldText>This page is about you, not about me. Take what you need. Enjoy!</BoldText>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => {
                  const element = document.getElementById('modules');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <BoldText className="uppercase">Explore Transformational Tools</BoldText>
              </Button>
              <Button
                size="lg"
                asChild
              >
                <Link to="/library">
                  <BoldText className="uppercase">Explore the Library of Transformation</BoldText>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Game of Life Card */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div
            onClick={() => window.location.href = '/start'}
            className="rounded-3xl border-2 border-slate-300 bg-slate-50 p-8 sm:p-10 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                <BoldText>PLAY YOUR LIFE AS A GAME</BoldText>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                See yourself as a character, your life as a world, and choose one next move.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Modules Grid */}
      <section
        id="modules"
        ref={modulesAnimation.ref}
        className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${modulesAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-center">
            <BoldText>TRANSFORMATIONAL TOOLS</BoldText>
          </h2>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredModules.map((module, index) => (
              <ModuleTile key={`${module.id}-${selectedCategory}`} module={module} index={index} />
            ))}
          </div>

          {filteredModules.length === 0 && (
            <p className="text-center text-muted-foreground text-lg">
              No modules in this category yet.
            </p>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* Signal Channels */}
      <SignalChannels />

      <Footer />
    </div>
  );
};

export default Index;
