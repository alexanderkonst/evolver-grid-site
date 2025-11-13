import Navigation from "@/components/Navigation";

const Library = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-serif font-bold mb-8">Library</h1>
          <p className="text-lg text-muted-foreground">
            This section is reserved for future content. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Library;
