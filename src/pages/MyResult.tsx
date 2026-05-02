import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "@/modules/zone-of-genius/appleseedGenerator";
import { Loader2 } from "lucide-react";

/**
 * MyResult — Standalone dark glass result page for magic link access.
 * 
 * URL: /my-result?token=<access_token>
 * 
 * Looks up game_profiles by access_token, fetches linked zog_snapshot,
 * renders the Appleseed result in the same dark liquid glass aesthetic.
 * No authentication required.
 */
const MyResult = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            if (!token) {
                setError("No access token provided.");
                setLoading(false);
                return;
            }

            try {
                // Find profile by access token (access_token column not in generated types yet)
                const { data: profile, error: profileError } = await (supabase as any)
                    .from("game_profiles")
                    .select("id, last_zog_snapshot_id")
                    .eq("access_token", token)
                    .maybeSingle();

                if (profileError || !profile) {
                    setError("Result not found. This link may be invalid.");
                    setLoading(false);
                    return;
                }

                if (!profile.last_zog_snapshot_id) {
                    setError("No result saved yet.");
                    setLoading(false);
                    return;
                }

                // Fetch the ZoG snapshot
                const { data: snapshot, error: snapshotError } = await supabase
                    .from("zog_snapshots")
                    .select("appleseed_data")
                    .eq("id", profile.last_zog_snapshot_id)
                    .maybeSingle();

                if (snapshotError || !snapshot?.appleseed_data) {
                    setError("Could not load your result. Please try again.");
                    setLoading(false);
                    return;
                }

                setAppleseed(snapshot.appleseed_data as unknown as AppleseedData);
            } catch (err) {
                console.error("[MyResult] Error:", err);
                setError("Something went wrong. Please try again.");
            }

            setLoading(false);
        };

        fetchResult();
    }, [token]);

    return (
        <>
            {/* Dark liquid glass background */}
            <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #0a0a1a, #0f172a, #1a1035)' }}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(132,96,234,0.12)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(104,148,208,0.08)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(164,163,208,0.05)_0%,transparent_40%)]" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                {loading && (
                    <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                        <p className="text-white/50 text-sm">Loading your result...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center space-y-6 max-w-md">
                        <div className="liquid-glass rounded-xl p-8 ring-1 ring-white/10">
                            <p className="text-white/70 text-sm mb-4">{error}</p>
                            <Link
                                to="/"
                                className="inline-block px-6 py-3 rounded-full liquid-glass-strong text-white text-sm font-medium hover:scale-105 transition-transform"
                            >
                                Discover your genius →
                            </Link>
                        </div>
                    </div>
                )}

                {appleseed && !loading && (
                    <div className="max-w-2xl w-full space-y-8">
                        {/* Subtle header */}
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-[4px] text-white/30 mb-2">Your Top Talent</p>
                        </div>

                        {/* The reveal — same component as the live funnel.
                            Day 58 (Sasha 2026-05-02): tagline shifted from
                            "My genius is to be a" to "My top talent is" so
                            the gerund-form archetype reads grammatically;
                            Three-Lenses inner-card retired in favor of the
                            Top Shadow paragraph (the highest-leverage
                            emotional payload). */}
                        <RevelatoryHero
                            type="appleseed"
                            title={appleseed.vibrationalKey.name}
                            tagline="My top talent is"
                            actionStatement={appleseed.bullseyeSentence}
                            topShadow={appleseed.topTalentProfile?.edge_and_traps}
                            darkMode
                        />

                        {/* Quick summary cards */}
                        <div className="space-y-3 max-w-md mx-auto">
                            {appleseed.vibrationalKey.tagline_simple && (
                                <div className="liquid-glass rounded-lg p-4 ring-1 ring-white/10">
                                    <p className="text-[10px] uppercase tracking-[2px] text-white/30 mb-1">In simple words</p>
                                    <p className="text-white/70 text-sm">{appleseed.vibrationalKey.tagline_simple}</p>
                                </div>
                            )}
                            {appleseed.elevatorPitch && (
                                <div className="liquid-glass rounded-lg p-4 ring-1 ring-white/10">
                                    <p className="text-[10px] uppercase tracking-[2px] text-white/30 mb-1">The pitch</p>
                                    <p className="text-white/70 text-sm">{appleseed.elevatorPitch}</p>
                                </div>
                            )}
                        </div>

                        {/* CTA section */}
                        <div className="text-center space-y-4 pt-4">
                            <p className="text-white/30 text-xs">This is yours. It doesn't expire.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a
                                    href="/ignite#hero-video"
                                    className="inline-block px-6 py-3 rounded-full liquid-glass-strong text-white text-sm font-medium hover:scale-105 transition-transform"
                                >
                                    See why this hasn't turned into income →
                                </a>
                                <Link
                                    to="/"
                                    className="inline-block px-6 py-3 rounded-full liquid-glass text-white/60 text-sm hover:text-white/80 transition-colors ring-1 ring-white/10"
                                >
                                    Retake the assessment
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyResult;
