import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GripVertical, ArrowUp, ArrowDown, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Intelligence {
  id: string;
  name: string;
  description: string;
}

const INTELLIGENCES: Intelligence[] = [
  { id: "verbal", name: "Verbal / Linguistic", description: "You think and express through words, writing, and language." },
  { id: "interpersonal", name: "Interpersonal", description: "You understand people, emotions, and social dynamics." },
  { id: "intrapersonal", name: "Intrapersonal", description: "You deeply sense your inner world, motives, and patterns." },
  { id: "systemic", name: "Systemic / Strategic", description: "You see patterns, systems, and long-range implications." },
  { id: "creative", name: "Creative / Imaginal", description: "You generate original ideas, images, and playful possibilities." },
  { id: "somatic", name: "Somatic / Kinesthetic", description: "You process and express through movement and the body." },
  { id: "analytical", name: "Analytical / Logical", description: "You break things down and reason clearly." },
  { id: "spatial", name: "Spatial / Visual", description: "You think in images, shapes, and visual relationships." },
  { id: "emotional", name: "Emotional", description: "You feel into atmospheres, moods, and emotional states." },
  { id: "practical", name: "Practical / Operational", description: "You naturally organize, execute, and make things work." },
  { id: "spiritual", name: "Spiritual", description: "You ask deep questions about what matters most and seek ultimate meaning." },
  { id: "moral", name: "Moral / Ethical", description: "You discern the right thing to do in this moment, in this situation." },
];

const MultipleIntelligences = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [ranking, setRanking] = useState<Intelligence[]>(INTELLIGENCES);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= ranking.length) return;
    const newRanking = [...ranking];
    const [removed] = newRanking.splice(fromIndex, 1);
    newRanking.splice(toIndex, 0, removed);
    setRanking(newRanking);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveItem(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Please log in to save your results.", variant: "destructive" });
      navigate("/auth?redirect=/intelligences" + (returnTo ? `?return=${returnTo}` : ""));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderedIntelligenceNames = ranking.map((i) => i.name);

      // Save to multiple_intelligences_results table (for CharacterSnapshot)
      const { error: miError } = await supabase
        .from("multiple_intelligences_results")
        .upsert({
          user_id: user.id,
          ordered_intelligences: orderedIntelligenceNames,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (miError) {
        console.error("Error saving to multiple_intelligences_results:", miError);
      }

      // Save to legacy table for backwards compatibility
      await supabase.from("multiple_intelligences_assessments").insert({
        name: user.email || "User",
        email: user.email || "",
        ranking: ranking.map((i, idx) => ({ rank: idx + 1, id: i.id, name: i.name })),
      });

      // Update game_profiles to mark MI completed
      const { data: profile } = await supabase
        .from("game_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("game_profiles")
          .update({ multiple_intelligences_completed: true })
          .eq("id", profile.id);
      }

      // Update wizard progress if returning to genius offer
      if (returnTo === "genius-offer") {
        await supabase
          .from("genius_offer_wizard_progress")
          .upsert({
            user_id: user.id,
            multiple_intelligences_completed: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <ScrollToTop />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif">
              <BoldText>SAVED</BoldText>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your Multiple Intelligences ranking has been saved.
            </p>
            <div className="p-4 bg-secondary/30 rounded-xl text-left">
              <p className="text-sm font-semibold mb-2">Your Top 3:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                {ranking.slice(0, 3).map((i) => (
                  <li key={i.id}>{i.name}</li>
                ))}
              </ol>
            </div>

            {returnTo === "genius-offer" ? (
              <Button
                size="lg"
                onClick={() => navigate("/genius-offer-intake?from=mi")}
                className="w-full"
              >
                <BoldText>CONTINUE TO GENIUS OFFER CREATION</BoldText>
              </Button>
            ) : (
              <Link to="/">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Back Button */}
      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-serif mb-4">
            <BoldText>MULTIPLE INTELLIGENCES</BoldText>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">Quick Self-Assessment</p>
          <p className="text-muted-foreground mb-8">
            A 2–3 minute drag-and-drop test to see which intelligences feel most natural to you.
          </p>
          {!showAssessment && (
            <Button size="lg" onClick={() => setShowAssessment(true)}>
              <BoldText>START THE ASSESSMENT</BoldText>
            </Button>
          )}
        </div>
      </section>

      {/* Assessment */}
      {showAssessment && (
        <section className="pb-20 px-4">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
            {/* Instructions */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Reorder these from <strong>most &quot;you&quot;</strong> at the top to <strong>least &quot;you&quot;</strong> at the bottom.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Think about: how much you love using it, how naturally it comes, and how often you solve problems this way.
              </p>
            </div>

            {/* Ranking List */}
            <div className="space-y-2">
              {ranking.map((intelligence, index) => (
                <div
                  key={intelligence.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${draggedIndex === index
                      ? "border-accent bg-accent/10 scale-[1.02]"
                      : "border-border bg-card/60 hover:border-accent/50"
                    }`}
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{intelligence.name}</p>
                    <p className="text-xs text-muted-foreground">{intelligence.description}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === ranking.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!user && (
              <p className="text-sm text-center text-muted-foreground">
                You&apos;ll need to log in to save your results.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              <BoldText>{isSubmitting ? "SAVING..." : "SAVE MY RANKING"}</BoldText>
            </Button>
          </form>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default MultipleIntelligences;