import { Check, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RsvpStatus = "going" | "maybe" | "not_going";

interface RsvpButtonProps {
  currentStatus: RsvpStatus | null;
  onRsvp: (status: RsvpStatus) => void;
  onRemove?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<RsvpStatus, { label: string; icon: typeof Check; activeClass: string }> = {
  going: {
    label: "Going",
    icon: Check,
    activeClass: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500",
  },
  maybe: {
    label: "Maybe",
    icon: HelpCircle,
    activeClass: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
  },
  not_going: {
    label: "Can't Go",
    icon: X,
    activeClass: "bg-[#2c3150] hover:bg-[#1a1d2e] text-white border-[#2c3150]",
  },
};

const RsvpButton = ({
  currentStatus,
  onRsvp,
  onRemove,
  loading = false,
  disabled = false,
}: RsvpButtonProps) => {
  const handleClick = (status: RsvpStatus) => {
    if (currentStatus === status && onRemove) {
      onRemove();
    } else {
      onRsvp(status);
    }
  };

  return (
    <div className="flex gap-2">
      {(Object.keys(STATUS_CONFIG) as RsvpStatus[]).map((status) => {
        const config = STATUS_CONFIG[status];
        const Icon = config.icon;
        const isActive = currentStatus === status;

        return (
          <Button
            key={status}
            variant="outline"
            size="sm"
            disabled={disabled || loading}
            onClick={() => handleClick(status)}
            className={cn(
              "flex-1 gap-1.5 transition-colors",
              isActive && config.activeClass
            )}
          >
            {loading && isActive ? (
              <span className="premium-spinner w-4 h-4" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            {config.label}
          </Button>
        );
      })}
    </div>
  );
};

export default RsvpButton;
