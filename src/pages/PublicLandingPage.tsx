/**
 * PublicLandingPage — world-readable Landing Page served at /ubl/:slugWithVersion.
 *
 * Pattern: /ubl/{slug}-v{n}
 * Phase 4 continuation: full render. For now, minimal stub.
 */

import { useParams } from "react-router-dom";

export default function PublicLandingPage() {
  const { slugWithVersion } = useParams<{ slugWithVersion: string }>();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Landing Page: {slugWithVersion}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Public Landing Page rendering arrives with Phase 4 continuation.
        </p>
      </main>
    </div>
  );
}
