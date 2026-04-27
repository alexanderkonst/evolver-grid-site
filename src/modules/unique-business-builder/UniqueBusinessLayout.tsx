/**
 * UniqueBusinessLayout — UBB v2.0 module shell.
 *
 * Day 52 (Sasha 2026-04-26): UBB now lives inside GameShellV2 (BUILD
 * space). The shell owns chrome: pane 1 (SPACES rail), pane 2 (the 6
 * phase-group navigation: Canvas · Session · Marketing · Distribution
 * · Communications · Landing Page), and the outer background.
 *
 * This layout's only responsibility is:
 *   1. Provide UniqueBusinessContext (canvas state, drawer state,
 *      Improve calls, Generate calls).
 *   2. Render the active artifact screen via <Outlet />.
 *   3. Mount <ImproveReviewDrawer /> so it portals correctly when
 *      opened from any artifact screen.
 *
 * Stripped (now owned by GameShell):
 *   - Sticky header + breadcrumb
 *   - Progress bar (locked / 18)
 *   - <main className="max-w-6xl"> wrapper
 *   - "Back to Canvas" link
 */

import { Outlet } from "react-router-dom";
import { UniqueBusinessProvider } from "./UniqueBusinessContext";
import { ImproveReviewDrawer } from "./components/ImproveReviewDrawer";

export default function UniqueBusinessLayout() {
  return (
    <UniqueBusinessProvider>
      {/* Day 52 (Sasha 2026-04-26): GameShellV2's <main> only provides
          pt-4 — no horizontal padding. Without this wrapper the artifact
          screens bleed to the cream-wash edges of pane 3. px-6 desktop
          comfort, py-4 keeps the hero off the shell's pt-4. Inner screens
          set their own max-width (CanvasOverview: full-width grid;
          GenericArtifactScreen: max-w-2xl; Compound: max-w-4xl). */}
      <div className="px-6 py-4">
        <Outlet />
      </div>
      <ImproveReviewDrawer />
    </UniqueBusinessProvider>
  );
}
