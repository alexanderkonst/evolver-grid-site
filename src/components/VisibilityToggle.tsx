import { Globe, Lock, Users } from "lucide-react";
import clsx from "clsx";

export type VisibilityValue = "private" | "community" | "public";

interface VisibilityToggleProps {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{
  value: VisibilityValue;
  label: string;
  Icon: typeof Lock;
}> = [
  { value: "private", label: "Me", Icon: Lock },
  { value: "community", label: "Community", Icon: Users },
  { value: "public", label: "Public", Icon: Globe },
];

const VisibilityToggle = ({ value, onChange, disabled }: VisibilityToggleProps) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
      {OPTIONS.map(({ value: optionValue, label, Icon }) => {
        const isActive = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            className={clsx(
              "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium transition",
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700",
              disabled ? "cursor-not-allowed opacity-60 hover:text-slate-500" : "cursor-pointer"
            )}
            onClick={() => {
              if (!disabled && optionValue !== value) {
                onChange(optionValue);
              }
            }}
            disabled={disabled}
            aria-pressed={isActive}
            title={label}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default VisibilityToggle;
