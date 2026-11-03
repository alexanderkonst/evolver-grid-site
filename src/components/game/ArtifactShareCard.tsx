import { forwardRef } from "react";
import type { ModuleArtifact } from "@/data/moduleArtifacts";
import "./ArtifactShareCard.css";

/**
 * ArtifactShareCard: the one frame for every module's share card (module form §12.5b, §11).
 *
 *   the module's Final scene in colour · the artifact · the player's one result line · the game name
 *
 * Same frame in every module, a different artifact. It takes the registry entry, so the card
 * never knows which module it serves. Never on the card: level, scores, counts, prices (§11).
 *
 * Built to be captured as an image (html2canvas): plain <img> elements and flat colours, no
 * gradients, no filters, no backdrop blur. The scene is shown in full colour on purpose: the
 * Landing shows the same image in greyscale, and the Final colours it (§12.5a).
 */

type Props = {
  artifact: ModuleArtifact;
  /** The artifact's name in the reader's language. */
  artifactName: string;
  /** The player's one result line, in their own words. */
  resultLine: string;
  /** The game's name in the reader's language. */
  gameName: string;
};

const ArtifactShareCard = forwardRef<HTMLDivElement, Props>(
  ({ artifact, artifactName, resultLine, gameName }, ref) => (
    <div className="asc" ref={ref} data-module={artifact.moduleId}>
      {/* crossOrigin keeps the canvas export clean if the scene is ever served from a CDN */}
      <img className="asc__scene" src={artifact.scene} alt="" crossOrigin="anonymous" />
      <div className="asc__veil" aria-hidden="true" />
      <div className="asc__body">
        <img className="asc__artifact" src={artifact.image} alt={artifactName} />
        <p className="asc__artifact-name">{artifactName}</p>
        <p className="asc__result">{resultLine}</p>
      </div>
      <p className="asc__game">{gameName}</p>
    </div>
  ),
);
ArtifactShareCard.displayName = "ArtifactShareCard";

export default ArtifactShareCard;
