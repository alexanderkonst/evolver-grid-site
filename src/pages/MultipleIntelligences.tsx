import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowUp, ArrowDown, Check } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import BackButton from "@/components/BackButton";

interface Intelligence {
  id: string;
  name: string;
  descriptionKey: string;
}

const INTELLIGENCES: Intelligence[] = [
  { id: "verbal", name: "Verbal / Linguistic", descriptionKey: "multipleIntel.intel.verbal.description" },
  { id: "intrapersonal", name: "Intrapersonal", descriptionKey: "multipleIntel.intel.intrapersonal.description" },
  { id: "systemic", name: "Systemic / Strategic", descriptionKey: "multipleIntel.intel.systemic.description" },
  { id: "creative", name: "Creative / Imaginal", descriptionKey: "multipleIntel.intel.creative.description" },
  { id: "somatic", name: "Somatic / Kinesthetic", descriptionKey: "multipleIntel.intel.somatic.description" },
  { id: "analytical", name: "Analytical / Logical", descriptionKey: "multipleIntel.intel.analytical.description" },
  { id: "spatial", name: "Spatial / Visual", descriptionKey: "multipleIntel.intel.spatial.description" },
  { id: "emotional", name: "Emotional", descriptionKey: "multipleIntel.intel.emotional.description" },
  { id: "practical", name: "Practical / Operational", descriptionKey: "multipleIntel.intel.practical.description" },
  { id: "spiritual", name: "Spiritual", descriptionKey: "multipleIntel.intel.spiritual.description" },
  { id: "moral", name: "Moral / Ethical", descriptionKey: "multipleIntel.intel.moral.description" },
];

const MultipleIntelligences = () => {
  const { t } = useTranslation();
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
      toast({ title: t('multipleIntel.toast.loginRequired'), variant: "destructive" });
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
      toast({ title: t('multipleIntel.toast.error'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <Navigation />
        <ScrollToTop />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif">
              <BoldText>{t('multipleIntel.success.title')}</BoldText>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('multipleIntel.success.body')}
            </p>
            <div className="p-4 bg-secondary/30 rounded-xl text-left">
              <p className="text-sm font-semibold mb-2">{t('multipleIntel.success.top3Label')}</p>
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
                <BoldText>{t('multipleIntel.success.continueGeniusOffer')}</BoldText>
              </Button>
            ) : (
              <BackButton
                to="/game"
                label={t('multipleIntel.success.backToGame')}
                className="mt-4"
              />
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Back Button */}
      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <BackButton
            to="/"
            label={<BoldText>{t('multipleIntel.back')}</BoldText>}
            className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
          />
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-serif mb-4">
            <BoldText>{t('multipleIntel.hero.title')}</BoldText>
          </h1>
          <p className="text-xl text-muted-foreground mb-2">{t('multipleIntel.hero.subtitle')}</p>
          <p className="text-muted-foreground mb-8">
            {t('multipleIntel.hero.description')}
          </p>
          {!showAssessment && (
            <Button size="lg" onClick={() => setShowAssessment(true)}>
              <BoldText>{t('multipleIntel.hero.startCta')}</BoldText>
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
                {t('multipleIntel.instructions.before')}<strong>{t('multipleIntel.instructions.mostYou')}</strong>{t('multipleIntel.instructions.middle')}<strong>{t('multipleIntel.instructions.leastYou')}</strong>{t('multipleIntel.instructions.after')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('multipleIntel.instructions.hint')}
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
                    <p className="text-xs text-muted-foreground">{t(intelligence.descriptionKey)}</p>
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
                {t('multipleIntel.loginNote')}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              <BoldText>{isSubmitting ? t('multipleIntel.submit.saving') : t('multipleIntel.submit.save')}</BoldText>
            </Button>
          </form>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default MultipleIntelligences;
