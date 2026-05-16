import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InlineEditableText } from "./InlineEditableText";

interface MoonFocusInputProps {
  value: string | null;
  loading: boolean;
  onSave: (text: string | null) => Promise<void> | void;
}

/**
 * Box 6 subtitle — Moon Focus.
 *
 * Per Sasha's mega-prompt §12 + Sasha-approved info-icon copy:
 *   "1–3 words for this moon cycle's intent."
 */
export const MoonFocusInput = ({
  value,
  loading,
  onSave,
}: MoonFocusInputProps) => {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-md bg-white/40 px-3 py-2">
      <span className="text-xs uppercase tracking-wider text-[#0a1628]/90">
        Focus:
      </span>
      <div className="flex-1">
        <InlineEditableText
          value={value}
          size="body"
          disabled={loading}
          emptyPlaceholder="set →"
          onSave={onSave}
        />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            asChild
            className="shrink-0 text-[#0a1628]/85 hover:text-[#0a1628]/95"
          >
            <button type="button" aria-label="What is this?">
              <Info size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            1–3 words for this moon cycle's intent.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MoonFocusInput;
