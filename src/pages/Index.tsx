import { useState } from "react";
import { Link } from "react-router-dom";
import { modules, getModulesByCategory } from "@/data/modules";
import ModuleTile from "@/components/ModuleTile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const categories = ["All", "AI", "Evolution", "Ventures", "Ceremonies", "Tools", "Apps"];
  const filteredModules = getModulesByCategory(selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6">
            Aleksandr Konstantinov
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Builder of systems, tools, and experiences that bridge technology and human potential.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => {
                const element = document.getElementById('modules');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore My Systems
            </Button>
            <Button 
              size="lg"
              variant="outline"
              asChild
            >
              <Link to="/about">About Me</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="modules" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-center">
            Systems
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <ModuleTile key={module.id} module={module} />
            ))}
          </div>

          {filteredModules.length === 0 && (
            <p className="text-center text-muted-foreground text-lg">
              No modules in this category yet.
            </p>
          )}
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <p className="text-xl text-muted-foreground">
            I design systems that help people think, create, and evolve with clarity.
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link to="/about">Read More About Me</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
