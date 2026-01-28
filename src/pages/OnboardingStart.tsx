import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import OnboardingFlow from "@/modules/onboarding/OnboardingFlow";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

const OnboardingStart = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [initialStep, setInitialStep] = useState<number | null>(null);
  const [hasZog, setHasZog] = useState(false);
  const [hasQol, setHasQol] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const id = await getOrCreateGameProfileId();
        if (!isMounted) return;
        setProfileId(id);

        const { data: profileData, error } = await supabase
          .from("game_profiles")
          .select("onboarding_step, last_zog_snapshot_id, last_qol_snapshot_id")
          .eq("id", id)
          .maybeSingle();

        if (error) {
        } else if (profileData) {
          setInitialStep(profileData.onboarding_step ?? 0);
          setHasZog(!!profileData.last_zog_snapshot_id);
          setHasQol(!!profileData.last_qol_snapshot_id);
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !profileId) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

  return (
    <OnboardingFlow
      profileId={profileId}
      initialStep={initialStep}
      hasZog={hasZog}
      hasQol={hasQol}
      onComplete={() => navigate("/game")}
    />
  );
};

export default OnboardingStart;
