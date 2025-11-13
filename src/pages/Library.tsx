import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Library = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-8">
            Library
          </h1>
          
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-xl text-muted-foreground">
              Articles, videos, and tools coming soon.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Library;
