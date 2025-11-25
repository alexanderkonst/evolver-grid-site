import { useState } from "react";
import { modules, getModulesByCategory } from "@/data/modules";
import ModuleTile from "@/components/ModuleTile";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import BoldText from "@/components/BoldText";

const Work = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  const categories = ["ALL", "AI", "GROWTH", "BUSINESS", "CEREMONIES", "TOOLS", "APPS"];
  const filteredModules = getModulesByCategory(selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-12 text-center">
            <span className="font-bold">LIFEH</span><span className="font-normal">ACKS</span>
          </h1>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                <BoldText>{category}</BoldText>
              </Button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
      </main>

      <Footer />
    </div>
  );
};

export default Work;
