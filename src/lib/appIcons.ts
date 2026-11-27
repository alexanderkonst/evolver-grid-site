/**
 * App icons v6 (issue #559): five apps x four themes, files in public/apps/icons/
 * (copies of docs/assets/infographics/apps/v6/, the kit spec is apps/<id>.card.yaml).
 * The icon follows the active skin from SkinContext: lunar (the default), lapis, aurum, grayscale;
 * any other skin falls back to lunar.
 */
import { ACTIVATE_YOUR_DORMANT_POTENTIAL } from "@/data/courses/activateYourDormantPotential";
import { CONSCIOUSNESS_MEETS_SCIENCE } from "@/data/courses/consciousnessMeetsScience";
import { ACTIVATION_OF_INNER_VISION } from "@/data/courses/activationOfInnerVision";

export const APP_ICON_IDS = ["potential", "crossing", "vision", "nature", "my-ai"] as const;
export type AppIconId = (typeof APP_ICON_IDS)[number];

export const APP_ICON_THEMES = ["lunar", "lapis", "aurum", "grayscale"] as const;
export type AppIconTheme = (typeof APP_ICON_THEMES)[number];

const FALLBACK_THEME: AppIconTheme = "lunar";

/** The icon theme for a skin slug: its own icon when it has one, lunar otherwise. */
export const appIconTheme = (skin: string | null | undefined): AppIconTheme =>
  (APP_ICON_THEMES as readonly string[]).includes(skin ?? "") ? (skin as AppIconTheme) : FALLBACK_THEME;

/** URL of one icon: size 128 or 1024. */
export const appIconSrc = (app: AppIconId, skin: string | null | undefined, size: 128 | 1024): string =>
  `/apps/icons/${app}-${appIconTheme(skin)}${size === 128 ? "@128" : ""}.png`;

/** The captions of the five apps (docs/assets/infographics/apps/<id>.card.yaml), unchanged by v6. */
export const APP_ICON_CAPTIONS: Record<AppIconId, string> = {
  potential: "Accelerates The Unfolding of Your Potential",
  crossing: "Reconciles Consciousness with Science",
  vision: "Activates Your Inner Vision",
  nature: "Aligns You With Natural Rhythms",
  "my-ai": "Sets Up My AI",
};

/** Which app a course is: Activate Your Dormant Potential = Potential, Consciousness Meets Science = Crossing,
 *  Activation of Inner Vision = Vision. Courses with no app (Founder Academy, ...) have no icon. */
const APP_BY_COURSE_SLUG: Record<string, AppIconId> = {
  [ACTIVATE_YOUR_DORMANT_POTENTIAL.slug]: "potential",
  [CONSCIOUSNESS_MEETS_SCIENCE.slug]: "crossing",
  [ACTIVATION_OF_INNER_VISION.slug]: "vision",
};

export const appIconForCourse = (slug: string | undefined): AppIconId | undefined =>
  slug ? APP_BY_COURSE_SLUG[slug] : undefined;
