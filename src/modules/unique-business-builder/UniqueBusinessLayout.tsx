/**
 * UniqueBusinessLayout — shell for the v2.0 module.
 *
 * Focus mode: on artifact routes, chrome is minimal (breadcrumb + progress only).
 * On Canvas Overview and Dossier, more nav is shown.
 */

import { Outlet, useLocation, Link } from "react-router-dom";
import { UniqueBusinessProvider, useUniqueBusiness } from "./UniqueBusinessContext";
import { UBB_ROOT, ARTIFACT_LABELS } from "./constants";
import { ArrowLeft } from "lucide-react";
import { ImproveReviewDrawer } from "./components/ImproveReviewDrawer";

function Shell() {
  const location = useLocation();
  const { lockedCount } = useUniqueBusiness();

  const isOverview = location.pathname === UBB_ROOT || location.pathname === `${UBB_ROOT}/`;
  const isDossier = location.pathname === `${UBB_ROOT}/dossier`;
  const isFocusMode = !isOverview && !isDossier;

  // Breadcrumb label from the current URL segment
  const slug = location.pathname.replace(`${UBB_ROOT}/`, "").replace(`${UBB_ROOT}`, "");
  const pageLabel = slugToLabel(slug);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {isFocusMode && (
              <Link
                to={UBB_ROOT}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Canvas
              </Link>
            )}
            <div className="text-sm font-medium">
              {isOverview ? "Unique Business Builder" : pageLabel}
            </div>
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            {lockedCount} / 18 locked
          </div>
        </div>
        <ProgressBar locked={lockedCount} total={18} />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <ImproveReviewDrawer />
    </div>
  );
}

function ProgressBar({ locked, total }: { locked: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (locked / total) * 100));
  return (
    <div className="h-0.5 w-full bg-muted">
      <div
        className="h-full bg-primary transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function slugToLabel(slug: string): string {
  if (!slug) return "Canvas";
  // Direct matches
  const direct: Record<string, string> = {
    uniqueness: ARTIFACT_LABELS.uniqueness,
    myth: ARTIFACT_LABELS.myth,
    tribe: ARTIFACT_LABELS.tribe,
    pain: ARTIFACT_LABELS.pain,
    promise: ARTIFACT_LABELS.promise,
    "lead-magnet": ARTIFACT_LABELS.lead_magnet,
    "value-ladder": ARTIFACT_LABELS.value_ladder,
    session: "1st Session",
    marketing: "Marketing",
    distribution: "Distribution",
    communications: "Communications",
    "landing-page": "Landing Page",
    dossier: "Dossier",
  };
  return direct[slug] || slug;
}

export default function UniqueBusinessLayout() {
  return (
    <UniqueBusinessProvider>
      <Shell />
    </UniqueBusinessProvider>
  );
}
