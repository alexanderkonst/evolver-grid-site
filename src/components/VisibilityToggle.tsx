import { Globe, Lock, Users, ChevronDown, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type VisibilityValue = "private" | "community" | "public";

interface VisibilityToggleProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{
  value: VisibilityValue;
  label: string;
  description: string;
  Icon: typeof Lock;
}> = [
    { value: "private", label: "Only me", description: "Only you can see this", Icon: Lock },
    { value: "community", label: "My community", description: "Visible to your community", Icon: Users },
    { value: "public", label: "Everyone", description: "Visible to all users", Icon: Globe },
  ];

const VisibilityToggle = ({ value, onChange, disabled }: VisibilityToggleProps) => {
  const [open, setOpen] = useState(false);
  const currentOption = OPTIONS.find(opt => opt.value === value) || OPTIONS[0];
  const CurrentIcon = currentOption.Icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-7 px-2 text-xs gap-1 text-[#2c3150]/60 hover:text-[#2c3150] hover:bg-[#a4a3d0]/20"
        >
          <CurrentIcon className="w-3 h-3" />
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <div className="text-xs text-[#2c3150]/60 px-2 py-1.5 font-medium">
          Who can see this?
        </div>
        <div className="space-y-0.5">
          {OPTIONS.map(({ value: optionValue, label, Icon }) => {
            const isSelected = value === optionValue;
            return (
              <button
                key={optionValue}
                type="button"
                className={`
                  w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors
                  ${isSelected
                    ? "bg-[#a4a3d0]/20 text-[#2c3150]"
                    : "text-[rgba(44,49,80,0.7)] hover:bg-[#a4a3d0]/10 hover:text-[#2c3150]"
                  }
                `}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">{label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2c3150]/60" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VisibilityToggle;
