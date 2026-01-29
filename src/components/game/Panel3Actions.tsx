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
      ? "sm:sticky sm:bottom-0 sm:rounded-t-xl sm:border sm:border-[#a4a3d0]/20"
      : "";

  return (
    <>
      <div className="hidden sm:flex items-center gap-2">
        {hasSecondary && (
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 font-semibold"
            onClick={secondaryAction}
          >
            {secondaryLabel}
          </Button>
        )}
        <Button className="h-12 rounded-xl px-6 font-semibold" onClick={primaryAction}>
          {primaryIcon && <span className="mr-2 inline-flex">{primaryIcon}</span>}
          {primaryLabel}
        </Button>
      </div>

      <div
        className={cn(
          "sm:hidden fixed bottom-0 left-0 right-0 border-t border-[#a4a3d0]/20 bg-white/95 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-lg",
          stickyClass
        )}
      >
        <div className="flex flex-col gap-2">
          <Button className="w-full h-12 rounded-xl px-6 font-semibold" onClick={primaryAction}>
            {primaryIcon && <span className="mr-2 inline-flex">{primaryIcon}</span>}
            {primaryLabel}
          </Button>
          {hasSecondary && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl px-6 font-semibold"
              onClick={secondaryAction}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default Panel3Actions;
