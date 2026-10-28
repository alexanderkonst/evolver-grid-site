import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GuestSaveCard from "@/components/game/GuestSaveCard";
import ModuleIntro from "@/components/game/ModuleIntro";
import ModuleOutro from "@/components/game/ModuleOutro";
import { COURSE_TITLE } from "@/data/courses/activateYourDormantPotential";
import { ACADEMY_WELCOME_EPISODE, ACADEMY_WELCOME_ID, ACADEMY_WELCOME_MODULE } from "@/data/academyModule";
import { useJourneyVictory } from "@/hooks/useJourneyVictory";
import { youtubeEmbedUrl } from "@/lib/coursePlayer";
import { BODY_STYLE, EYEBROW_STYLE, TITLE_STYLE } from "@/pages/Library";

/**
 * AcademyModule — the one Academy module a guest can play start to finish (issue #186).
 * Design: docs/02-strategy/game_of_being_you.md §14.1, §14.4, WP-7b.
 *
 *   ModuleIntro (one button) → the lesson → ModuleOutro (badge, 1–10, real choice)
 *
 * `ModuleIntro` and `ModuleOutro` are used as they are. A guest's rating and choice are kept in
 * this browser (src/lib/guestModule.ts), so the Outro works signed out; the account is asked for
 * only at «Save», the card under the Outro. A player who has already given the rating goes
 * straight to `onDone` (the rooms).
 */

type Stage = "pending" | "intro" | "lesson" | "outro";

type Props = {
  /** A guest sees «Save your character» under the Outro; a signed-in player does not. */
  guest: boolean;
  /** Where a player who already played it goes: the Academy rooms. */
  onDone: () => void;
};

const AcademyModule = ({ guest, onDone }: Props) => {
  const victory = useJourneyVictory(ACADEMY_WELCOME_ID);
  const [stage, setStage] = useState<Stage>("pending");

  // Decide once, when the saved rating (account or browser) has been read.
  useEffect(() => {
    if (stage !== "pending" || victory.loading) return;
    if (victory.rating !== null) onDone();
    else setStage("intro");
  }, [stage, victory.loading, victory.rating, onDone]);

  if (stage === "pending") return null;

  if (stage === "intro") {
    return (
      <div className="px-4 py-8 sm:py-10">
        <ModuleIntro module={ACADEMY_WELCOME_MODULE} onStart={() => setStage("lesson")} />
        <p className="mt-4 text-center">
          <Link
            to="/game/learn?rooms=1"
            className="text-sm underline underline-offset-4"
            style={{ ...BODY_STYLE, textDecorationColor: "rgba(26,30,58,0.3)" }}
          >
            Browse the Academy rooms
          </Link>
        </p>
      </div>
    );
  }

  if (stage === "lesson") {
    return (
      <div className="p-4 pb-24 sm:p-6 lg:p-10 lg:pb-12 max-w-4xl mx-auto">
        <header className="mb-6 text-center">
          <p className="text-[10.5px] mb-2" style={EYEBROW_STYLE}>
            {COURSE_TITLE} · {ACADEMY_WELCOME_MODULE.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]" style={TITLE_STYLE}>
            {ACADEMY_WELCOME_EPISODE.title}
          </h1>
        </header>
        <div className="w-full aspect-video mb-6">
          <iframe
            src={youtubeEmbedUrl(ACADEMY_WELCOME_EPISODE.youtubeId)}
            title={ACADEMY_WELCOME_EPISODE.title}
            className="h-full w-full rounded-2xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setStage("outro")}
            className="rounded-full px-8 py-3 text-base font-semibold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              background: "linear-gradient(135deg, rgba(244, 212, 114, 0.95) 0%, rgba(212, 175, 55, 0.85) 100%)",
              color: "#0a1628",
              border: "0.5px solid rgba(122, 81, 8, 0.45)",
            }}
          >
            I have watched it →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-10">
      <ModuleOutro module={ACADEMY_WELCOME_MODULE} />
      {guest ? <GuestSaveCard next="/game/learn" /> : null}
    </div>
  );
};

export default AcademyModule;
