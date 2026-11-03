import mcGlowStar from "@/assets/mc-glow-star.png";
import type { ModuleStepId } from "@/data/journeyModules";

/**
 * The artifact registry: one transformational artifact per module (module form §12.5b,
 * docs/templates/module-form.md).
 *
 * The share card (`ArtifactShareCard`) reads everything it needs from here, so a module's
 * card is a matter of adding one entry. A module with no entry has no card: `getModuleArtifact`
 * returns undefined and the Final screen shows nothing extra. Sasha supplies the artifacts
 * module by module; do not invent one here.
 *
 * In-game, not on-chain.
 */

export type ArtifactLang = "en" | "ru" | "es";

export type ModuleArtifact = {
  /** Journey module id (`JourneyModuleDef.id`). */
  moduleId: ModuleStepId;
  /** The artifact's name in each launch language. */
  name: Record<ArtifactLang, string>;
  /** The artifact image (imported asset URL). */
  image: string;
  /** The module's Final scene, in full colour (§12.5a): the same image the Landing shows in greyscale. */
  scene: string;
};

export const MODULE_ARTIFACTS: ModuleArtifact[] = [
  {
    moduleId: "find-top-talent",
    name: {
      en: "Star of Uniqueness",
      ru: "Звезда уникальности",
      es: "Estrella de la Unicidad",
    },
    image: mcGlowStar,
    scene: "/images/modules/top-talent-courtyard.webp",
  },
];

export const getModuleArtifact = (moduleId: string | undefined): ModuleArtifact | undefined =>
  moduleId ? MODULE_ARTIFACTS.find((a) => a.moduleId === moduleId) : undefined;

/** The artifact's name for a UI language (`ru-RU` and the like included); English otherwise. */
export const artifactName = (artifact: ModuleArtifact, language?: string): string => {
  const base = (language ?? "en").toLowerCase().split("-")[0] as ArtifactLang;
  return artifact.name[base] ?? artifact.name.en;
};
