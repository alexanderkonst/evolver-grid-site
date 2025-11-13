import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ModuleTile from "@/components/ModuleTile";
import { modules } from "@/data/modules";
import { Button } from "@/components/ui/button";

const About = () => {
  // Get featured modules (first 4)
  const featuredModules = modules.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          {/* Hero */}
          <div className="mb-16 text-center">
            <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-6">
              About Aleksandr Konstantinov
            </h1>
            <p className="text-xl text-muted-foreground">
              Working at the intersection of intelligence, systems design, and human evolution
            </p>
          </div>
          
          {/* Bio Section */}
          <div className="prose prose-lg prose-invert max-w-none space-y-6 mb-16">
            <p className="text-xl leading-relaxed">
              I work at the intersection of intelligence, systems design, and human evolution.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
              My focus is helping founders, leaders, and creators activate their genius, build coherent ventures, and navigate their next level of impact. I combine strategic clarity with deep inner work, using a mix of structured frameworks, intuitive sensing, and AI-enhanced thinking.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
              Over the past decade I've built systems, tools, and developmental maps that make transformation faster, clearer, and more grounded. My work integrates business, psychology, consciousness studies, and technology into practical methods people can use immediately.
            </p>

            <p className="text-lg leading-relaxed font-semibold mt-8">
              I'm the creator of:
            </p>

            <ul className="space-y-2 text-lg text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-3 text-accent">•</span>
                <span><strong className="text-foreground">AI UPGRADE</strong> — a protocol for high-level AI collaboration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">•</span>
                <span><strong className="text-foreground">Destiny Pack</strong> — a system for clarifying identity, genius, and offers</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">•</span>
                <span><strong className="text-foreground">Heartcraft</strong> — a level-based awakening game</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">•</span>
                <span><strong className="text-foreground">Integral Mystery School</strong> — a developmental container for leadership</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-accent">•</span>
                <span><strong className="text-foreground">New Earth Superapp Prototype</strong> — modular tools for purpose and collaboration</span>
              </li>
            </ul>

            <p className="text-lg leading-relaxed text-muted-foreground mt-8">
              My background spans MIT entrepreneurship, holistic development, integrative coaching, and system architecture. What ties it all together is one through-line:
            </p>

            <p className="text-xl leading-relaxed font-semibold">
              I help people and ventures become more coherent versions of themselves.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground mt-8">
              If my work resonates, explore the systems on the home page or reach out directly.
            </p>
          </div>

          {/* Core Areas of Work */}
          <section className="mb-16 pb-16 border-b border-border">
            <h2 className="text-3xl font-serif font-semibold mb-8">Core Areas of Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-serif font-semibold mb-2">AI Systems & Protocols</h3>
                <p className="text-muted-foreground">High-level collaboration frameworks for enhanced intelligence</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-serif font-semibold mb-2">Developmental Maps & Tools</h3>
                <p className="text-muted-foreground">Systems for clarity, growth, and transformation</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-serif font-semibold mb-2">Venture Architecture</h3>
                <p className="text-muted-foreground">Strategic design for coherent, sustainable ventures</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-serif font-semibold mb-2">Transformational Containers</h3>
                <p className="text-muted-foreground">Structured spaces for leadership and evolution</p>
              </div>
            </div>
          </section>

          {/* Featured Systems */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif font-semibold mb-8 text-center">Featured Systems</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {featuredModules.map((module) => (
                <ModuleTile key={module.id} module={module} />
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" asChild>
                <Link to="/work">Explore All Systems</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
