import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-5xl font-serif font-bold mb-12">About</h1>
          
          <div className="prose prose-lg prose-invert max-w-none space-y-6">
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
        </div>
      </div>
    </div>
  );
};

export default About;
