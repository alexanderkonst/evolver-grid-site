/**
 * PublicDossier — world-readable Dossier page served at /ubd/:slug.
 *
 * Phase 4 continuation: full render. For now, minimal stub.
 */

import { useParams } from "react-router-dom";

export default function PublicDossier() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Dossier: {slug}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Public Dossier rendering arrives with Phase 4 continuation.
        </p>
      </main>
    </div>
  );
}
