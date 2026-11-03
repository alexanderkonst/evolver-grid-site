import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import ColouringImage, { useColouringArrival } from "@/components/game/ColouringImage";
import { StarOfUniqueness } from "@/components/game/artifactImages";
import "./ColouringImage.css";

/**
 * FirstArtifactHero — the head of the Top Talent Final screen (issue #313, module-form §12.5a).
 *
 * The Landing's courtyard comes to full colour behind it, once, and the player receives their
 * first artifact on it: the Star of Uniqueness, with its label. `children` sit above the star,
 * on the image: that is where the Final screen's headline block belongs (issue #312).
 *
 * In-game artifact, no minting. Ownership in the House reads from the save (`houseArtifacts`).
 */
const FirstArtifactHero = ({ children }: { children?: ReactNode }) => {
  const { t } = useTranslation();
  const done = useColouringArrival("top-talent-reveal");
  const label = t("appleseed.firstArtifact");

  return (
    <section className={`cb-hero${done ? " cb--done" : ""}`} aria-label={label} data-testid="first-artifact-hero">
      <ColouringImage mode="arrive" done={done} />
      <div className="cb-hero__body">
        {children}
        <figure className="cb-artifact">
          <StarOfUniqueness className="cb-artifact__star" alt={t("characterSheet.artifacts.starOfUniqueness.name")} />
          <figcaption className="cb-artifact__label">{label}</figcaption>
        </figure>
      </div>
    </section>
  );
};

export default FirstArtifactHero;
