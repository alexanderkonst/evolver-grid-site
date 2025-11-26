import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  LibraryItem,
  LibraryCategoryId
} from "@/modules/library/libraryContent";
import { cn } from "@/lib/utils";

type LengthFilter = "all" | "short" | "medium" | "long";

const Library = () => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategoryId | "all">("breathEnergy");
  const [search, setSearch] = useState("");
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("all");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const matchesLengthFilter = (item: LibraryItem, filter: LengthFilter): boolean => {
    if (filter === "all") return true;
    if (!item.durationMinutes) return true;

    if (filter === "short") return item.durationMinutes <= 7;
    if (filter === "medium") return item.durationMinutes > 7 && item.durationMinutes <= 15;
    if (filter === "long") return item.durationMinutes > 15;

    return true;
  };

  const filteredItems = LIBRARY_ITEMS.filter(item => {
    const matchesCategory =
      activeCategory === "all" || item.categoryId === activeCategory;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      (item.teacher ?? "").toLowerCase().includes(query);
    const matchesLength = matchesLengthFilter(item, lengthFilter);

    return matchesCategory && matchesSearch && matchesLength;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">
            Practice Library
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Curated practices, activations, and transmissions to support your evolution.
          </p>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-4 py-2 rounded-full border text-xs sm:text-sm whitespace-nowrap transition-all",
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/50 text-foreground/70 border-border hover:border-primary/50"
              )}
            >
              All
            </button>
            {LIBRARY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full border text-xs sm:text-sm whitespace-nowrap transition-all",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/50 text-foreground/70 border-border hover:border-primary/50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by title or guide..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mt-6 w-full max-w-md rounded-full border border-border bg-background/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {/* Length Filter */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
            {[
              { id: "all", label: "All lengths" },
              { id: "short", label: "≤ 7 min" },
              { id: "medium", label: "8–15 min" },
              { id: "long", label: "16+ min" },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setLengthFilter(option.id as LengthFilter)}
                className={cn(
                  "px-3 py-1 rounded-full border transition-all",
                  lengthFilter === option.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/50 text-foreground/70 border-border hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          {filteredItems.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex flex-col rounded-xl border border-border bg-card text-left shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden group"
                >
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="text-sm font-semibold text-foreground line-clamp-2">
                      {item.title}
                    </div>
                    {item.teacher && (
                      <div className="text-xs text-muted-foreground">
                        {item.teacher}
                      </div>
                    )}
                    {(() => {
                      const durationText =
                        item.durationLabel ??
                        (item.durationMinutes ? `${item.durationMinutes} min` : undefined);
                      return durationText ? (
                        <div className="text-xs text-muted-foreground/70">
                          {durationText}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Content for this category is coming soon.
            </p>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="w-full max-w-4xl rounded-2xl bg-card border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-base sm:text-lg font-semibold pr-4 text-foreground">
                {selectedItem.title}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full px-3 py-1 hover:bg-muted"
              >
                Close
              </button>
            </div>
            <div className="w-full aspect-video mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${selectedItem.youtubeId}`}
                title={selectedItem.title}
                className="h-full w-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {selectedItem.teacher && (
              <p className="text-sm text-muted-foreground">
                Guided by {selectedItem.teacher}
              </p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Library;
