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
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const sourceCounts = getMissionCounts();

  const loadManifests = async () => {
    const fetchManifest = async (url: string, label: string) => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`${label} summary fetch failed (${res.status})`);
      }
      return (await res.json()) as MissionManifest;
    };

    const localData = await fetchManifest("/mission-manifest.json", "Local");
    const remoteUrl =
      import.meta.env.VITE_MISSION_MANIFEST_URL ||
      "https://raw.githubusercontent.com/alexanderkonst/evolver-grid-site/main/public/mission-manifest.json";

    let remoteData: MissionManifest;
    try {
      remoteData = await fetchManifest(remoteUrl, "Main");
    } catch (err) {
      const fallbackUrl = `${window.location.origin}/mission-manifest.json`;
      if (!import.meta.env.VITE_MISSION_MANIFEST_URL && fallbackUrl !== remoteUrl) {
        remoteData = await fetchManifest(fallbackUrl, "Site");
      } else {
        throw err;
      }
    }

    setLocalManifest(localData);
    setRemoteManifest(remoteData);
    setManifestError(null);
    return { local: localData, remote: remoteData };
  };

  useEffect(() => {
    let isMounted = true;

    const safeLoad = async () => {
      try {
        await loadManifests();
      } catch (err) {
        if (isMounted) {
          setManifestError(err instanceof Error ? err.message : "Failed to load mission summary");
        }
      }
    };

    safeLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  const computeMismatch = (local: MissionManifest, remote: MissionManifest) => {
    const localCounts = local.counts;
    const remoteCounts = remote.counts;

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
  };

  const manifestMismatch = useMemo(() => {
    if (!localManifest || !remoteManifest) {
      return false;
    }
    return computeMismatch(localManifest, remoteManifest);
  }, [localManifest, remoteManifest, sourceCounts]);

  const syncDisabled = loading;

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const manifests = await loadManifests();
      if (manifests && computeMismatch(manifests.local, manifests.remote)) {
        throw new Error("Safety check failed. Update the mission summary and try again.");
      }
      const syncResult = await syncMissionData();
      setResult(syncResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText("npm run update:mission-manifest");
      setCopyStatus("Copied.");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      setCopyStatus("Copy failed.");
    }
  };

  const handleDownloadManifest = () => {
    const now = new Date();
    const manifest = {
      version: now.toISOString().slice(0, 10),
      generatedAt: now.toISOString(),
      counts: {
        pillars: sourceCounts.pillars,
        focusAreas: sourceCounts.focusAreas,
        challenges: sourceCounts.challenges,
        outcomes: sourceCounts.outcomes,
        missions: sourceCounts.total,
      },
      missionsByPillar: sourceCounts.byPillar,
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mission-manifest.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadStatus("Downloaded.");
    setTimeout(() => setDownloadStatus(null), 2000);
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
            <CardTitle className="text-base">How to update missions</CardTitle>
            <CardDescription>
              One place to follow the full update flow. Use these steps every time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Edit mission files in <span className="font-mono">src/modules/mission-discovery/data/</span>.</li>
              <li>Refresh the mission summary file using the command below.</li>
              <li>Click <span className="font-medium">Check and Sync Missions</span> to push changes to the database.</li>
            </ol>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono">npm run update:mission-manifest</span>
              <Button variant="outline" size="sm" onClick={handleCopyCommand}>
                Copy command
              </Button>
              {copyStatus && <span className="text-xs text-muted-foreground">{copyStatus}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadManifest}>
                Download mission summary file
              </Button>
              {downloadStatus && <span className="text-xs text-muted-foreground">{downloadStatus}</span>}
            </div>
            <div className="text-muted-foreground">
              Use either the command or the download button to refresh <span className="font-mono">public/mission-manifest.json</span>.
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
                "Check and Sync Missions"
              )}
            </Button>

            <Card className="bg-muted/40">
              <CardHeader>
                <CardTitle className="text-base">Safety Check</CardTitle>
                <CardDescription>
                  This makes sure your local mission list matches the latest main branch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {manifestError && (
                  <div className="text-destructive">Safety check error: {manifestError}</div>
                )}
                {!manifestError && !localManifest && (
                  <div className="text-muted-foreground">Loading manifest data...</div>
                )}
                {localManifest && remoteManifest && (
                  <>
                    <div className="flex justify-between">
                      <span>Your current mission summary</span>
                      <span className="font-mono">{localManifest.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latest mission summary on main</span>
                      <span className="font-mono">{remoteManifest.version}</span>
                    </div>
                    {manifestMismatch ? (
                      <div className="text-destructive">
                        Summary mismatch. Update the summary file, then try again.
                      </div>
                    ) : (
                      <div className="text-emerald-700">All good. Safe to sync.</div>
                    )}
                    <div className="text-muted-foreground">
                      If you edited mission files, run <span className="font-mono">npm run update:mission-manifest</span>.
                    </div>
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
