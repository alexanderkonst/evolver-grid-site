export type ModuleCategory = 
  | "AI" 
  | "Evolution" 
  | "Ventures" 
  | "Ceremonies" 
  | "Tools" 
  | "Apps" 
  | "Other";

export type ModuleStatus = "Live" | "Beta" | "Coming Soon";

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
}
