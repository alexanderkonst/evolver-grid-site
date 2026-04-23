/**
 * ImproveReviewDrawer — shows the proposed improvement from the Improve button.
 *
 * Desktop: right-side sheet. Mobile: bottom sheet.
 * User accepts → new version saved. User rejects → nothing saved.
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useUniqueBusiness } from "../UniqueBusinessContext";
import { SpecificityBadge } from "./SpecificityBadge";
import { ARTIFACT_LABELS } from "../constants";
import type { RoastQuadrant } from "../types";

const QUADRANT_LABELS: Record<RoastQuadrant, string> = {
  UL: "Soul (does it feel true from the inside?)",
  UR: "Engineering (does it work mechanically?)",
  LL: "Resonance (would the tribe recognize themselves?)",
  LR: "Architecture (does it serve at scale?)",
  "13": "Center (does the whole see what the parts missed?)",
  depth: "Depth (Essence → Significance → Implications balance)",
  "27": "Crystallization (the one irreversible action named?)",
};

export function ImproveReviewDrawer() {
  const { pendingImprovement, acceptImprovement, rejectImprovement, artifacts } = useUniqueBusiness();

  const open = !!pendingImprovement;
  const pending = pendingImprovement;
  const current = pending ? artifacts[pending.artifact_key]?.latest : null;

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && pending) rejectImprovement();
      }}
    >
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        {pending && (
          <>
            <SheetHeader className="space-y-2">
              <SheetTitle className="flex items-center gap-2 text-base">
                ⚡ Improvement proposed
              </SheetTitle>
              <SheetDescription>
                {ARTIFACT_LABELS[pending.artifact_key]}
              </SheetDescription>
              <div className="pt-2">
                <SpecificityBadge
                  score={pending.result.specificity_score}
                  delta={pending.result.specificity_delta}
                />
              </div>
            </SheetHeader>

            <section className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium">What the roast found</h3>
                <ul className="mt-2 space-y-2">
                  {pending.result.roast_findings.map((f, i) => (
                    <li key={i} className="text-sm">
                      <div className="text-xs font-medium text-muted-foreground">
                        {QUADRANT_LABELS[f.quadrant as RoastQuadrant] || f.quadrant}
                      </div>
                      <div>{f.weakness}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {pending.result.what_changed && (
                <div>
                  <h3 className="text-sm font-medium">What changed</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pending.result.what_changed}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">Before</h3>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-xs">
                    {JSON.stringify(current?.content ?? null, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">After</h3>
                  <pre className="mt-1 whitespace-pre-wrap rounded-md border border-emerald-500/40 bg-emerald-50/50 p-3 text-xs dark:bg-emerald-900/10">
                    {JSON.stringify(pending.result.improved_content, null, 2)}
                  </pre>
                </div>
              </div>

              {pending.result.crystallized_action && (
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    Next irreversible action
                  </div>
                  <div className="mt-1 text-sm">{pending.result.crystallized_action}</div>
                </div>
              )}
            </section>

            <div className="mt-8 flex gap-2">
              <Button
                variant="outline"
                onClick={rejectImprovement}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={acceptImprovement}
                className="flex-1 gap-2"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
