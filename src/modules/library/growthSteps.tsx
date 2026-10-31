import { Play, BookOpen, GraduationCap, Rocket, Crown } from "lucide-react";
import type { ReactNode } from "react";
import {
  closedLine,
  emptyPlaceSave,
  placeState,
  type PlaceInput,
  type PlaceRule,
  type PlaceSave,
  type PlaceStateName,
} from "@/lib/placeState";

export type GrowthStepContent =
  | "videos"
  | "article-link"
  | "article-27"
  | "closed"
  | "cta";

export type GrowthStep = {
  id: string;
  number: number;
  title: string;
  shortLabel: string;
  description: string;
  /**
   * When the room opens and what it says while closed (§14.3, Academy rooms). Absent =
   * always open. The events these rooms wait on have no record in the save yet, so
   * they stay closed until a module writes one.
   */
  rule?: PlaceRule;
  icon: ReactNode;
  neonColor: string;
  neonColorRgb: string;
  content: GrowthStepContent;
  linkTo?: string;
};

export const GROWTH_STEPS: GrowthStep[] = [
  {
    id: "foundational-videos",
    number: 1,
    title: "Watch the foundational course",
    shortLabel: "Transformational Library",
    description:
      "Curated breathwork, activations, wisdom, and spiritual practices from embodied modern guides.",
    icon: <Play className="w-5 h-5" />,
    neonColor: "from-cyan-400 to-cyan-300",
    neonColorRgb: "0, 200, 255",
    content: "videos",
  },
  {
    id: "scientific-materialism-antidote",
    number: 2,
    title: "Read the scientific materialism antidote",
    shortLabel: "Materialism Antidote",
    description:
      "The article that dissolves the dominant paradigm and reveals what's underneath.",
    icon: <BookOpen className="w-5 h-5" />,
    neonColor: "from-emerald-400 to-emerald-300",
    neonColorRgb: "52, 211, 153",
    content: "article-link",
  },
  {
    id: "founder-academy",
    number: 3,
    title: "Do the founder academy modules",
    shortLabel: "Founder Academy",
    description:
      "Structured modules to build your unique business from your zone of genius.",
    rule: {
      opens: "productize-session",
      closed: {
        event: "you have watched the foundational course and done a Private Founder-Market Fit Session",
        inside: "structured modules to build your unique business from your zone of genius",
      },
    },
    icon: <GraduationCap className="w-5 h-5" />,
    neonColor: "from-violet-400 to-violet-300",
    neonColorRgb: "167, 139, 250",
    content: "closed",
  },
  {
    id: "27-perspectives",
    number: 4,
    title: "Read the 27 perspectives article",
    shortLabel: "27 Perspectives",
    description:
      "The full ontological framework: 4 quadrants × 3 depths × recursive seeing = 27 dimensions of reality.",
    icon: <BookOpen className="w-5 h-5" />,
    neonColor: "from-amber-400 to-amber-300",
    neonColorRgb: "251, 191, 36",
    content: "article-27",
    linkTo: "/27",
  },
  {
    id: "integral-mystery-school",
    number: 5,
    title: "Do the integral mystery school",
    shortLabel: "Mystery School",
    description:
      "Deep immersion into the living architecture of consciousness and creation.",
    rule: {
      opens: "founder-academy",
      closed: {
        event: "you have finished the Founder Academy",
        inside: "deep immersion into the living architecture of consciousness and creation",
      },
    },
    icon: <Crown className="w-5 h-5" />,
    neonColor: "from-rose-400 to-rose-300",
    neonColorRgb: "251, 113, 133",
    content: "closed",
  },
  {
    id: "work-1-on-1",
    number: 6,
    title: "Work with me 1:1",
    shortLabel: "Work With Me 1:1",
    description:
      "Direct transmission. Personal guidance through the full phase-shift sequence.",
    icon: <Rocket className="w-5 h-5" />,
    neonColor: "from-fuchsia-400 to-fuchsia-300",
    neonColorRgb: "232, 121, 249",
    content: "cta",
    linkTo: "/ignite",
  },
];

export const findStep = (stepId: string | undefined): GrowthStep | undefined =>
  GROWTH_STEPS.find((s) => s.id === stepId);

/** A room, as `placeState` reads it. Rooms without a rule are always open. */
export const growthStepPlace = (step: GrowthStep): PlaceInput => ({
  line: step.description,
  rule: step.rule ?? {},
});

export const growthStepState = (step: GrowthStep, save: PlaceSave = emptyPlaceSave()): PlaceStateName =>
  placeState(growthStepPlace(step), save);

/** «Opens when <real event>. Inside: <result>.» for a closed room; empty otherwise. */
export const growthStepClosedLine = (step: GrowthStep): string => closedLine(growthStepPlace(step));
