import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoPopoverProps {
  content: ReactNode;
  /** Optional custom trigger label for accessibility. */
  label?: string;
  className?: string;
  /** Where to anchor the popup. */
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * Info icon that opens on BOTH hover (desktop) and click (mobile + accessibility).
 *
 * Sasha 2026-05-16 dogfood: tooltips were hover-only, which broke for users
 * on touch devices or those who like clicking. Popover gives us controlled
 * open state we can drive from both interactions.
 */
export const InfoPopover = ({
  content,
  label = "What is this?",
  className,
  side = "top",
}: InfoPopoverProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => {
            e.preventDefault();
            setOpen((prev) => !prev);
          }}
          className={cn(
            "shrink-0 rounded-full p-1 text-[#0a1628]/60 transition hover:text-[#0a1628]/90",
            className,
          )}
        >
          <Info size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="liquid-glass-strong eq-text-halo max-w-xs rounded-2xl px-4 py-3 text-sm font-medium text-[#0a1628]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};

export default InfoPopover;
