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
  startRoute?: string; // entry route for the module
  dependencies?: string[]; // module slugs this depends on

  // Landing page data (generated via Module Landing Page Workflow SOP)
  landingData?: ModuleLandingData;
}

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
