import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface SectionDividerProps {
  className?: string;
}

const SectionDivider = ({ className = "" }: SectionDividerProps) => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <div ref={ref} className={`w-full py-8 ${className}`}>
      <div className="container mx-auto max-w-4xl">
        <div className="relative h-px bg-border/30 overflow-hidden">
          <div
            className={`absolute inset-0 bg-accent/60 transition-transform duration-1000 ease-out ${
              isVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default SectionDivider;
