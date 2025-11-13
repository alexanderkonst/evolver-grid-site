import { modules } from "@/data/modules";
import ModuleTile from "@/components/ModuleTile";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6">
            Alexander Constantinov
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Builder of systems, tools, and experiences that bridge technology and human potential.
          </p>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-center">
            Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleTile key={module.id} module={module} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
