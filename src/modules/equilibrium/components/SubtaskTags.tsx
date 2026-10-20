import { cn } from "@/lib/utils";
import type { SubtaskKind, SubtaskTags as SubtaskTagsValue } from "../types";

const KIND_LABEL: Record<SubtaskKind, string> = {
  research: "Research",
  build: "Build",
  outreach: "Outreach",
  ops: "Ops",
};

const TAG_CLASS =
  "inline-flex items-center rounded-full border border-[#0a1628]/15 bg-[#0a1628]/5 px-2 py-0.5 text-[11px] leading-none text-[#0a1628]/75";

/**
 * Small type + cost tags for a subtask (issue #91, Polsia mechanic #4).
 * Render on subtask rows and next to the promote-to-Do-Now action so the
 * cost is visible before the click. Renders nothing for an untagged subtask.
 */
export const SubtaskTags = ({
  effort,
  kind,
  className,
}: Partial<SubtaskTagsValue> & { className?: string }) => {
  if (!effort && !kind) return null;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1", className)}>
      {kind && <span className={TAG_CLASS}>{KIND_LABEL[kind] ?? kind}</span>}
      {effort && <span className={TAG_CLASS}>{effort}</span>}
    </span>
  );
};

export default SubtaskTags;
