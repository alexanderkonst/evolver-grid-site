import { Link } from "react-router-dom";
import { User, Target, Sparkles, Map, Boxes, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";

const ProfileOverviewContent = () => {
    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Profile Space</h1>
                    </div>
                    <p className="text-slate-600">Know yourself. Build your character.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-1">Quick summary</h2>
                    <p className="text-sm text-slate-600">
                        Visit each section to refine your mission, map your assets, and showcase your genius.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Target className="w-5 h-5" />
                                    <h3 className="font-semibold">My Mission</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Check or update your mission commitment.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/game/profile/mission">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Sparkles className="w-5 h-5" />
                                    <h3 className="font-semibold">Zone of Genius</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Discover how you create value.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/zone-of-genius/entry">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Map className="w-5 h-5" />
                                    <h3 className="font-semibold">Quality of Life</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Assess your life across 8 domains.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/quality-of-life-map/assessment">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Boxes className="w-5 h-5" />
                                    <h3 className="font-semibold">Assets</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Review and grow your saved assets.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm">
                                <Link to="/game/profile/assets">
                                    Open <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
        </div>
    );
};

const ProfileOverview = () => {
    return (
        <GameShellV2>
            <ProfileOverviewContent />
        </GameShellV2>
    );
};

export default ProfileOverview;
export { ProfileOverviewContent };
