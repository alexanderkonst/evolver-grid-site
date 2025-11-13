import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-serif font-bold mb-8">About</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4">Bio</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Add your bio here. This is where you tell your story, share your background, 
                and connect with your audience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4">Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Describe your mission, your "why," and what drives your work.
              </p>
            </section>

            <section className="pt-8">
              <div className="aspect-video w-full max-w-md mx-auto bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Photo placeholder</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
