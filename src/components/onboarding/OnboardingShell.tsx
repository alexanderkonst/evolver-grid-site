import { ReactNode } from "react";

/**
 * OnboardingShell - A minimal shell for onboarding without sidebar
 * Used for new users who haven't completed ZoG + QoL yet
 */

interface OnboardingShellProps {
    children: ReactNode;
}

export const OnboardingShell = ({ children }: OnboardingShellProps) => {
    return (
        <div className="min-h-dvh bg-slate-50">
            {/* Simple header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-slate-100 z-modal">
                <div className="h-full max-w-4xl mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="font-semibold text-slate-900">Evolver Grid</span>
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
