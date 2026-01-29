/**
 * Test page for GameShellV2 three-panel navigation
 * Access via: /game/test-nav
 */
import GameShellV2 from "@/components/game/GameShellV2";

const TestNavigation = () => {
    return (
        <GameShellV2>
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#2c3150] mb-4">
                    Three-Panel Navigation Test
                </h1>
                <p className="text-[rgba(44,49,80,0.7)] mb-8">
                    This page uses the new GameShellV2 with Discord-style navigation.
                </p>

                <div className="space-y-4">
                    <div className="p-6 bg-white/85 backdrop-blur-sm rounded-xl border border-[#a4a3d0]/20 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                        <h2 className="font-semibold text-lg mb-2">Panel 1: Spaces Rail</h2>
                        <p className="text-[rgba(44,49,80,0.7)]">
                            ✅ Icon-only navigation on left
                        </p>
                    </div>

                    <div className="p-6 bg-white/85 backdrop-blur-sm rounded-xl border border-[#a4a3d0]/20 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                        <h2 className="font-semibold text-lg mb-2">Panel 2: Sections</h2>
                        <p className="text-[rgba(44,49,80,0.7)]">
                            ✅ Expandable sections with sub-sections
                        </p>
                    </div>

                    <div className="p-6 bg-white/85 backdrop-blur-sm rounded-xl border border-[#a4a3d0]/20 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                        <h2 className="font-semibold text-lg mb-2">Panel 3: Content</h2>
                        <p className="text-[rgba(44,49,80,0.7)]">
                            ✅ You're looking at it right now!
                        </p>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                        <h2 className="font-semibold text-lg mb-2 text-amber-900">Mobile Test</h2>
                        <p className="text-amber-700">
                            Resize browser to mobile width to test mobile navigation with back button.
                        </p>
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

export default TestNavigation;
