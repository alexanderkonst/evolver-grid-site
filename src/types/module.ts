import type { VillagePlaceKey } from "@/data/villagePlaces";

// Legacy categories (used by old Index.tsx landing page modules)
export type LegacyModuleCategory =
  | "AI"
  | "Growth"
  | "Business"
  | "Ceremonies"
  | "Tools"
  | "Apps"
  | "Other";

// Space-based categories (canonical taxonomy v2.2)
export type SpaceCategory =
  | "ME"
  | "LEARN"
  | "MEET"
  | "COLLABORATE"
  | "BUILD"
  | "BUY_SELL"
  | "Special"
  | "Standalone";

// Union of both for backward compatibility
export type ModuleCategory = LegacyModuleCategory | SpaceCategory;

export type ModuleStatus = "Live" | "Beta" | "Coming Soon";

export type VersionStage =
  | "Concept"
  | "Prototype"
  | "PoC"
  | "Alpha"
  | "MVP"
  | "Commercial";

/** Course level and category, shown as chips on the educational app store (panel 3 of the Learn space). */
export type CourseLevel = "Fundamental" | "Intermediate" | "Advanced";
export type CourseCategory = "General";

export interface ModuleLink {
  label: string;
  url: string;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  category: ModuleCategory;
  tagline: string;
  status: ModuleStatus;
  hero_CTA_label?: string;
  hero_CTA_link?: string;
  description: string;
  who_for?: string[];
  outcomes?: string[];
  structure?: string[];
  story?: string;
  app_links?: ModuleLink[];
  related_modules?: string[]; // Array of module slugs
  thumbnail_image?: string;
  price?: string;
  version?: string;

  // Space-aware fields (taxonomy v2.2)
  space?: SpaceCategory;
  versionNumber?: string; // e.g. "0.9", "1.0"
  versionStage?: VersionStage;
  /** Academy courses only: the level chip on the store tile. */
  courseLevel?: CourseLevel;
  /** Academy courses only: the category chip on the store tile. */
  courseCategory?: CourseCategory;
  startRoute?: string; // entry route for the module
  dependencies?: string[]; // module slugs this depends on

  // Landing page data (generated via Module Landing Page Workflow SOP)
  landingData?: ModuleLandingData;

  // Partner fields (Module 2 · L2). Plan: docs/02-strategy/modular_collaboration/launch_plan.md.
  // Nothing renders these yet; defaults are applied by the helpers in src/data/modules.ts.
  /** "evolver" for ours, the partner's name otherwise. Default: "evolver". */
  owner?: string;
  /** Who receives the revenue for this module. */
  payee?: string;
  /** The partner's own page for the module. */
  externalUrl?: string;
  /** Query param that carries our referral id on `externalUrl`. Default: "ref". */
  referralParam?: string;
  /** How deep the connection goes; 0 = link with referral id (connector.md §4). */
  integrationLevel?: IntegrationLevel;
  /** "internal" = built by us, "partner" = brought in by a partner. Default: "internal". */
  source?: ModuleSource;
  /** The village place that shows the module (course → academy, product → market, session → mastermind). */
  place?: VillagePlaceKey;
}

export type IntegrationLevel = 0 | 1 | 2 | 3 | 4;

export type ModuleSource = "internal" | "partner";

/**
 * Marketing-grade landing page content for a module.
 * Generated via docs/04-workflows/module_landing_page_workflow.md
 * Rendered by ModuleLandingTemplate component.
 */
export interface ModuleLandingData {
  // Hero
  forAudience: string;
  headline: string;
  subheadline: string;
  ctaButtonText: string;
  ctaButtonLink: string;

  // For Whom
  forWhom: string[];

  // Pain Section
  painSectionHeader: string;
  painBullets: string[];

  // Solution Section
  solutionSectionHeader: string;
  solutionSteps: Array<{ verb: string; description: string }>;

  // Outcomes
  outcomes: string[];

  // How It Works
  howItWorks: Array<{ step: string; description: string; time?: string }>;

  // Story / Origin
  story: string;

  // Final CTA
  finalCtaHeadline: string;
  finalCtaSubheadline: string;

  // Core Message (for meta/SEO/internal reference)
  coreMessage?: {
    belief: string;
    oneLiner: string;
    resonanceHook: string;
  };
}
