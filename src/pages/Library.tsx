import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  LibraryItem,
  LibraryCategoryId,
  ExperienceIntent
} from "@/modules/library/libraryContent";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import libraryLogo from "@/assets/library-logo.png";

type LengthFilter = "all" | "5min" | "8min" | "10min" | "15min" | "20min" | "over20";
type IntentChoice = ExperienceIntent | null;
type LengthChoice = "any" | "5min" | "8min" | "10min" | "15min" | "20min" | "over20";

const Library = () => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategoryId | "all">("breathEnergy");
  const [search, setSearch] = useState("");
  const [lengthFilter, setLengthFilter] = useState<LengthFilter>("all");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  
  // Intent advisor state
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [intentChoice, setIntentChoice] = useState<IntentChoice>(null);
  const [intentLengthChoice, setIntentLengthChoice] = useState<LengthChoice>("any");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [advisorSuggestions, setAdvisorSuggestions] = useState<Array<{
    item: LibraryItem;
    explanation: string;
  }> | null>(null);

  const matchesLengthFilter = (item: LibraryItem, filter: LengthFilter | LengthChoice): boolean => {
    if (filter === "all" || filter === "any") return true;
    if (!item.durationMinutes) return true;

    if (filter === "5min") return item.durationMinutes <= 5;
    if (filter === "8min") return item.durationMinutes > 5 && item.durationMinutes <= 8;
    if (filter === "10min") return item.durationMinutes > 8 && item.durationMinutes <= 10;
    if (filter === "15min") return item.durationMinutes > 10 && item.durationMinutes <= 15;
    if (filter === "20min") return item.durationMinutes > 15 && item.durationMinutes <= 20;
    if (filter === "over20") return item.durationMinutes > 20;

    return true;
  };

  const buildAdvisorPrompt = (payload: {
    intent: IntentChoice;
    lengthChoice: LengthChoice;
    items: {
      id: string;
      title: string;
      teacher?: string;
      categoryId: LibraryCategoryId;
      durationMinutes: number | null;
    }[];
  }): string => {
    return `You are helping a user choose a practice from a small curated practice library.

The user has told you:
- Their current intention (what they want right now).
- How much time they have.

You are given a JSON list of candidate practices with:
- id
- title
- teacher
- categoryId (breathEnergy, moneyAbundance, realityWisdom, spiritualGuidance, activations, animalSpirits)
- durationMinutes (may be null).

From this list:
- Choose up to 3 practices that best match the user's intention and time.
- Prefer shorter practices if lengthChoice is "short"; prefer longer or deeper ones if "long".
- Prefer breathwork videos for breathwork / feelBetter intentions, activations for activation / psychic intentions, and wisdom videos for receiveWisdom intentions.

For each chosen practice, output ONE line in the following format:
[title] — [very short explanation of why it's a good match for their intention right now, in 1 short sentence]

Style:
- Be encouraging but concise.
- Do not mention the library, JSON, IDs, or this prompt.
- Do not number the lines; just one suggestion per line.

User intent and choices:
${JSON.stringify({ intent: payload.intent, lengthChoice: payload.lengthChoice }, null, 2)}

Candidate practices:
${JSON.stringify(payload.items, null, 2)}

Now output up to 3 lines, each describing one recommended practice.`.trim();
  };

  const handleGetAdvisorSuggestions = async () => {
    if (!intentChoice) return;
    
    try {
      setAdvisorLoading(true);
      setAdvisorError(null);
      setAdvisorSuggestions(null);

      const matching = LIBRARY_ITEMS.filter(item => {
        const matchesIntent = !item.intents || item.intents.includes(intentChoice);
        const matchesLength = matchesLengthFilter(item, intentLengthChoice);
        return matchesIntent && matchesLength;
      });

      if (matching.length === 0) {
        setAdvisorError("No practices match that combo yet. Try relaxing one of the filters.");
        return;
      }

      const payload = {
        intent: intentChoice,
        lengthChoice: intentLengthChoice,
        items: matching.map(item => ({
          id: item.id,
          title: item.title,
          teacher: item.teacher,
          categoryId: item.categoryId,
          durationMinutes: item.durationMinutes ?? null,
        })),
      };

      const prompt = buildAdvisorPrompt(payload);

      const { data, error } = await supabase.functions.invoke("library-advisor", {
        body: { prompt },
      });

      if (error) {
        if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
          toast.error("Rate limits exceeded, please try again later.");
          setAdvisorError("Rate limits exceeded. Please try again in a moment.");
        } else if (error.message?.includes("402") || error.message?.includes("Payment")) {
          toast.error("Payment required. Please add funds to your workspace.");
          setAdvisorError("Payment required. Please contact support.");
        } else {
          throw error;
        }
        return;
      }

      const responseText = data?.generatedText || "";
      const lines = responseText
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

      // Parse suggestions and match to actual library items
      const matchedSuggestions = lines
        .map(line => {
          // Format: "[title] — [explanation]"
          const separator = line.indexOf("—");
          if (separator === -1) return null;

          const title = line.substring(0, separator).trim();
          const explanation = line.substring(separator + 1).trim();

          // Find matching library item (case-insensitive, fuzzy match)
          const matchedItem = LIBRARY_ITEMS.find(item => 
            item.title.toLowerCase() === title.toLowerCase() ||
            item.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(item.title.toLowerCase())
          );

          if (!matchedItem) return null;

          return { item: matchedItem, explanation };
        })
        .filter((match): match is { item: LibraryItem; explanation: string } => match !== null);

      setAdvisorSuggestions(matchedSuggestions);
    } catch (err) {
      console.error("Advisor error:", err);
      setAdvisorError("Could not generate suggestions. Please try again.");
      toast.error("Failed to generate suggestions");
    } finally {
      setAdvisorLoading(false);
    }
  };

  const intentOptions: { id: ExperienceIntent; label: string }[] = [
    { id: "breathwork", label: "Do a breathwork practice" },
    { id: "activation", label: "Receive an activation" },
    { id: "receiveWisdom", label: "Receive wisdom" },
    { id: "feelBetter", label: "Feel better right now" },
    { id: "psychic", label: "Activate psychic abilities" },
  ];

  const timeOptions: { id: LengthChoice; label: string }[] = [
    { id: "any", label: "Any length" },
    { id: "5min", label: "5 min" },
    { id: "8min", label: "8 min" },
    { id: "10min", label: "10 min" },
    { id: "15min", label: "15 min" },
    { id: "20min", label: "20 min" },
    { id: "over20", label: ">20 min" },
  ];

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
          <div className="flex justify-center mb-6">
            <img 
              src={libraryLogo} 
              alt="Library Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">
            Welcome to the Sacred Library of Transformational Content!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            This is a curation of powerful energy transmissions by beautiful modern day teachers. If you are new to transformational practices, the recommendation is to start with 5 min breathwork sessions. Enjoy transforming!
          </p>

          {/* Help Me Choose Button */}
          <button
            onClick={() => setIsAdvisorOpen(true)}
            className="mt-8 mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs sm:text-sm text-foreground hover:border-primary/50 transition-colors"
          >
            Help me choose a practice
          </button>

          {/* Intent Advisor Panel */}
          {isAdvisorOpen && (
            <div className="mt-4 mb-8 rounded-2xl border border-border bg-card/60 p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-foreground text-sm">
                  What do you want right now?
                </h2>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    setIsAdvisorOpen(false);
                    setAdvisorSuggestions(null);
                    setAdvisorError(null);
                  }}
                >
                  Close
                </button>
              </div>

              {/* Intention choices */}
              <div className="space-y-1">
                <p className="text-foreground/80">Choose your intention:</p>
                <div className="flex flex-wrap gap-2">
                  {intentOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setIntentChoice(option.id)}
                      className={cn(
                        "px-3 py-1 rounded-full border text-xs transition-all",
                        intentChoice === option.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background/50 text-foreground/70 border-border hover:border-primary/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time choices */}
              <div className="space-y-1">
                <p className="text-foreground/80">How much time do you have?</p>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setIntentLengthChoice(option.id)}
                      className={cn(
                        "px-3 py-1 rounded-full border text-xs transition-all",
                        intentLengthChoice === option.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background/50 text-foreground/70 border-border hover:border-primary/50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGetAdvisorSuggestions}
                disabled={advisorLoading || !intentChoice}
                className="mt-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs sm:text-sm text-foreground disabled:opacity-60 hover:bg-card/80 transition-colors"
              >
                {advisorLoading ? "Finding practices..." : "Suggest practices"}
              </button>

              {advisorError && (
                <p className="text-xs text-red-400 mt-2">{advisorError}</p>
              )}

              {advisorSuggestions && advisorSuggestions.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Suggested practices:
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {advisorSuggestions.map(({ item, explanation }, idx) => (
                      <div key={idx} className="flex flex-col">
                        <button
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
                          <div className="p-3 flex flex-col gap-1.5">
                            <div className="text-xs font-semibold text-foreground line-clamp-2">
                              {item.title}
                            </div>
                            {item.teacher && (
                              <div className="text-[10px] text-muted-foreground">
                                {item.teacher}
                              </div>
                            )}
                            {(() => {
                              const durationText =
                                item.durationLabel ??
                                (item.durationMinutes ? `${item.durationMinutes} min` : undefined);
                              return durationText ? (
                                <div className="text-[10px] text-muted-foreground">
                                  {durationText}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </button>
                        <p className="mt-2 text-[11px] text-foreground/70 px-1">
                          {explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
              { id: "5min", label: "5 min" },
              { id: "8min", label: "8 min" },
              { id: "10min", label: "10 min" },
              { id: "15min", label: "15 min" },
              { id: "20min", label: "20 min" },
              { id: "over20", label: ">20 min" },
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
                        <div className="text-xs text-muted-foreground">
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
