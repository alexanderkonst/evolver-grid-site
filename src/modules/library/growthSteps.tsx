import { Play, BookOpen, GraduationCap, Rocket, Crown } from "lucide-react";
import type { ReactNode } from "react";

export type GrowthStepContent =
  | "videos"
  | "article-link"
  | "article-27"
  | "locked"
  | "cta";

export type GrowthStep = {
  id: string;
  number: number;
  title: string;
  shortLabel: string;
  description: string;
  locked: boolean;
  lockedHint?: string;
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
    shortLabel: "Foundational Course",
    description:
      "Curated breathwork, activations, wisdom, and spiritual practices from embodied modern guides.",
    locked: false,
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
    locked: false,
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
    locked: true,
    lockedHint: "Unlocks after the foundational course and a Productize Yourself Session.",
    icon: <GraduationCap className="w-5 h-5" />,
    neonColor: "from-violet-400 to-violet-300",
    neonColorRgb: "167, 139, 250",
    content: "locked",
  },
  {
    id: "27-perspectives",
    number: 4,
    title: "Read the 27 perspectives article",
    shortLabel: "27 Perspectives",
    description:
      "The full ontological framework: 4 quadrants × 3 depths × recursive seeing = 27 dimensions of reality.",
    locked: false,
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
    locked: true,
    lockedHint: "Unlocks after the Founder Academy.",
    icon: <Crown className="w-5 h-5" />,
    neonColor: "from-rose-400 to-rose-300",
    neonColorRgb: "251, 113, 133",
    content: "locked",
  },
  {
    id: "work-1-on-1",
    number: 6,
    title: "Work with me 1:1",
    shortLabel: "Work With Me 1:1",
    description:
      "Direct transmission. Personal guidance through the full phase-shift sequence.",
    locked: false,
    icon: <Rocket className="w-5 h-5" />,
    neonColor: "from-fuchsia-400 to-fuchsia-300",
    neonColorRgb: "232, 121, 249",
    content: "cta",
    linkTo: "/ignite",
  },
];

export const findStep = (stepId: string | undefined): GrowthStep | undefined =>
  GROWTH_STEPS.find((s) => s.id === stepId);
