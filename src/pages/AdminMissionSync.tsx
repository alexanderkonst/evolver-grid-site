import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncMissionData, getMissionCounts, SyncResult } from "@/lib/syncMissionData";
import { Loader2, CheckCircle, AlertCircle, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MissionManifest {
  version: string;
  generatedAt: string;
  counts: {
    pillars: number;
    focusAreas: number;
    challenges: number;
    outcomes: number;
    missions: number;
  };
  missionsByPillar: Record<string, number>;
}

export default function AdminMissionSync() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localManifest, setLocalManifest] = useState<MissionManifest | null>(null);
  const [remoteManifest, setRemoteManifest] = useState<MissionManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const navigate = useNavigate();

  const sourceCounts = getMissionCounts();

  useEffect(() => {
    let isMounted = true;

    const loadManifests = async () => {
      try {
        const localRes = await fetch("/mission-manifest.json");
        if (!localRes.ok) {
          throw new Error(`Local manifest fetch failed (${localRes.status})`);
        }
        const localData = (await localRes.json()) as MissionManifest;

        const remoteRes = await fetch(
          "https://raw.githubusercontent.com/alexanderkonst/evolver-grid-site/main/public/mission-manifest.json",
          { cache: "no-store" }
        );
        if (!remoteRes.ok) {
          throw new Error(`Remote manifest fetch failed (${remoteRes.status})`);
        }
        const remoteData = (await remoteRes.json()) as MissionManifest;

        if (isMounted) {
          setLocalManifest(localData);
          setRemoteManifest(remoteData);
          setManifestError(null);
        }
      } catch (err) {
        if (isMounted) {
          setManifestError(err instanceof Error ? err.message : "Failed to load mission manifest");
        }
      }
    };

    loadManifests();

    return () => {
      isMounted = false;
    };
  }, []);

  const manifestMismatch = useMemo(() => {
    if (!localManifest || !remoteManifest) {
      return false;
    }

    const localCounts = localManifest.counts;
    const remoteCounts = remoteManifest.counts;

    const derivedCounts = {
      pillars: sourceCounts.pillars,
      focusAreas: sourceCounts.focusAreas,
      challenges: sourceCounts.challenges,
      outcomes: sourceCounts.outcomes,
      missions: sourceCounts.total,
    };

    const countsMismatch = Object.keys(derivedCounts).some((key) => {
      const localValue = localCounts[key as keyof typeof localCounts];
      const derivedValue = derivedCounts[key as keyof typeof derivedCounts];
      return localValue !== derivedValue;
    });

    const remoteMismatch = Object.keys(remoteCounts).some((key) => {
      const localValue = localCounts[key as keyof typeof localCounts];
      const remoteValue = remoteCounts[key as keyof typeof remoteCounts];
      return localValue !== remoteValue;
    });

    return countsMismatch || remoteMismatch;
  }, [localManifest, remoteManifest, sourceCounts]);

  const syncDisabled = loading || manifestMismatch || !!manifestError;

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const syncResult = await syncMissionData();
      setResult(syncResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mission Discovery Sync</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Source File Counts
            </CardTitle>
            <CardDescription>
              Data from repo files (source of truth)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{sourceCounts.pillars}</div>
                <div className="text-sm text-muted-foreground">Pillars</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{sourceCounts.focusAreas}</div>
                <div className="text-sm text-muted-foreground">Focus Areas</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{sourceCounts.challenges}</div>
                <div className="text-sm text-muted-foreground">Challenges</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{sourceCounts.outcomes}</div>
                <div className="text-sm text-muted-foreground">Outcomes</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{sourceCounts.total}</div>
                <div className="text-sm text-muted-foreground">Missions</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Missions by Pillar:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(sourceCounts.byPillar).map(([pillar, count]) => (
                  <div key={pillar} className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="capitalize">{pillar}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync to Database</CardTitle>
            <CardDescription>
              Replace all existing mission data with source files. This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Delete all existing pillars, focus areas, challenges, outcomes, and missions</li>
                <li>Insert fresh data from source files</li>
                <li>Validate referential integrity before syncing</li>
                <li>Preserve existingProjects arrays exactly as provided</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSync} disabled={syncDisabled} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync All Data to Database"
              )}
            </Button>

            <Card className="bg-muted/40">
              <CardHeader>
                <CardTitle className="text-base">Manifest Check</CardTitle>
                <CardDescription>
                  Confirms the local dataset matches the latest main branch before syncing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {manifestError && (
                  <div className="text-destructive">Manifest error: {manifestError}</div>
                )}
                {!manifestError && !localManifest && (
                  <div className="text-muted-foreground">Loading manifest data...</div>
                )}
                {localManifest && remoteManifest && (
                  <>
                    <div className="flex justify-between">
                      <span>Local manifest version</span>
                      <span className="font-mono">{localManifest.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remote manifest version</span>
                      <span className="font-mono">{remoteManifest.version}</span>
                    </div>
                    {manifestMismatch ? (
                      <div className="text-destructive">
                        Manifest mismatch detected. Update the local data to match main before syncing.
                      </div>
                    ) : (
                      <div className="text-emerald-700">Manifest matches main. Safe to sync.</div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Sync Failed</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="font-medium text-green-700">Sync Completed Successfully!</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold">{result.counts.pillars}</div>
                    <div className="text-xs text-muted-foreground">Pillars</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold">{result.counts.focusAreas}</div>
                    <div className="text-xs text-muted-foreground">Focus Areas</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold">{result.counts.challenges}</div>
                    <div className="text-xs text-muted-foreground">Challenges</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold">{result.counts.outcomes}</div>
                    <div className="text-xs text-muted-foreground">Outcomes</div>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded">
                    <div className="text-lg font-bold">{result.counts.missions}</div>
                    <div className="text-xs text-muted-foreground">Missions</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Missions by Pillar:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(result.missionsByPillar).map(([pillar, count]) => (
                      <div key={pillar} className="flex justify-between p-2 bg-white/50 rounded">
                        <span className="capitalize">{pillar}</span>
                        <span className="font-mono">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
