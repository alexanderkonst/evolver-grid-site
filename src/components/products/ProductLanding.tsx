import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GOLD_TEXT_STYLE, igniteLogo } from "@/lib/landingDesign";
import { cn } from "@/lib/utils";
import "./productLanding.css";

/** Ignite's editorial page grammar, shared by the public product pages. */
export const ProductLanding = ({ children }: { children: ReactNode }) => (
  <main className="product-landing relative min-h-dvh font-sans">
    <div className="relative max-w-2xl mx-auto px-4 md:px-6 py-16 space-y-12">
      {children}
    </div>
  </main>
);

export const ProductEyebrow = ({ children, heading = false, className }: {
  children: ReactNode;
  heading?: boolean;
  className?: string;
}) => {
  const Tag = heading ? "h2" : "p";
  return (
    <Tag className={cn("product-eyebrow bg-clip-text text-transparent", className)} style={GOLD_TEXT_STYLE}>
      {children}
    </Tag>
  );
};

export const ProductHero = ({ eyebrow, title, subtitle, children }: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) => {
  const { t } = useTranslation();
  return (
    <header className="text-center space-y-6 pt-4 pb-2">
      <img src={igniteLogo} alt={t("ignite.logoAlt")} width={140} height={140}
        className="w-[140px] h-auto mx-auto opacity-80" />
      <ProductEyebrow>{eyebrow}</ProductEyebrow>
      <h1 className="product-title product-hero-title">{title}</h1>
      <p className="product-body text-base sm:text-lg italic max-w-md mx-auto">{subtitle}</p>
      {children}
    </header>
  );
};

export const ProductCta = ({ href, children, external = false, breathe = false }: {
  href: string;
  children: ReactNode;
  external?: boolean;
  breathe?: boolean;
}) => {
  const className = cn(
    "product-cta group liquid-glass-dark inline-flex items-center justify-center gap-2 rounded-full",
    "px-6 sm:px-7 py-3.5 max-w-full min-h-12 text-sm sm:text-base font-semibold",
    "transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]",
    breathe && "cta-breath",
  );
  const content = <>
    <span className="uppercase tracking-[0.12em] text-[0.88em]">{children}</span>
    <ArrowRight className="w-4 h-4 shrink-0 ml-0.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
  </>;
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
    : <Link to={href} className={className}>{content}</Link>;
};

export const ProductList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5 text-left">
    {items.map(item => (
      <li key={item} className="flex items-baseline gap-2.5">
        <span className="text-sm bg-clip-text text-transparent shrink-0" style={GOLD_TEXT_STYLE} aria-hidden="true">→</span>
        <span className="product-body text-base">{item}</span>
      </li>
    ))}
  </ul>
);
