import { ReactNode } from "react";

/**
 * OnboardingShell - A minimal shell for onboarding without sidebar
 * Used for new users who haven't completed ZoG + QoL yet
 */

interface OnboardingShellProps {
    children: ReactNode;
}

export const OnboardingShell = ({ children }: OnboardingShellProps) => {
    // Day 91 (Sasha 2026-06-09): tokenized for Aurum — page wash + header
    // fill + hairline read the skin tokens; fallbacks keep the lapis
    // light look (near-white #f8f7fc page, white/80 frosted header).
    return (
        <div className="min-h-dvh bg-[var(--skin-page-bg,#f8f7fc)]">
            {/* Simple header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] backdrop-blur-sm border-b border-[var(--skin-hairline,rgba(164,163,208,0.2))] z-modal">
                <div className="h-full max-w-4xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="font-semibold text-[var(--skin-text-primary,#2c3150)]">Evolver Grid</span>
                    </div>
                </div>
            </header>

            {/* Main content - full width, no sidebar */}
            <main className="pt-16 min-h-dvh">
                {children}
            </main>
        </div>
    );
};

export default OnboardingShell;
