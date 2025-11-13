import { Module } from "@/types/module";

export const modules: Module[] = [
  {
    id: "1",
    title: "Example Module",
    slug: "example-module",
    category: "AI",
    tagline: "A placeholder module to demonstrate the system",
    status: "Coming Soon",
    description: "This is an example module. Replace with your actual modules.",
    who_for: ["Developers", "Designers"],
    outcomes: ["Learn the system", "Build modules"],
    structure: ["Step 1: Review", "Step 2: Customize", "Step 3: Deploy"],
    story: "This module was created as a template to show how the modular system works.",
  },
];

export const getModuleBySlug = (slug: string): Module | undefined => {
  return modules.find((module) => module.slug === slug);
};

export const getModulesByCategory = (category: string): Module[] => {
  if (category === "All") return modules;
  return modules.filter((module) => module.category === category);
};

export const getRelatedModules = (moduleId: string, relatedSlugs?: string[]): Module[] => {
  if (!relatedSlugs) return [];
  return modules.filter((module) => relatedSlugs.includes(module.slug) && module.id !== moduleId);
};
