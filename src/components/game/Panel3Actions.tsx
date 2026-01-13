import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Panel3ActionsProps {
  primaryLabel: string;
  primaryAction: () => void;
  primaryIcon?: ReactNode;
  secondaryLabel?: string;
  secondaryAction?: () => void;
  variant?: "default" | "sticky";
}

const Panel3Actions = ({
  primaryLabel,
  primaryAction,
  primaryIcon,
  secondaryLabel,
  secondaryAction,
  variant = "default",
}: Panel3ActionsProps) => {
  const hasSecondary = Boolean(secondaryLabel && secondaryAction);
  const stickyClass =
    variant === "sticky"
      ? "sm:sticky sm:bottom-0 sm:rounded-t-xl sm:border sm:border-slate-200"
      : "";

  return (
    <>
      <div className="hidden sm:flex items-center gap-2">
        {hasSecondary && (
          <Button variant="outline" size="sm" onClick={secondaryAction}>
            {secondaryLabel}
          </Button>
        )}
        <Button size="sm" onClick={primaryAction}>
          {primaryIcon && <span className="mr-2 inline-flex">{primaryIcon}</span>}
          {primaryLabel}
        </Button>
      </div>

      <div
        className={cn(
          "sm:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-lg",
          stickyClass
        )}
      >
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={primaryAction}>
            {primaryIcon && <span className="mr-2 inline-flex">{primaryIcon}</span>}
            {primaryLabel}
          </Button>
          {hasSecondary && (
            <Button variant="outline" className="w-full" onClick={secondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default Panel3Actions;
