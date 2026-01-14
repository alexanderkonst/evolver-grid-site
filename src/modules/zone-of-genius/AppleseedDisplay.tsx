import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareZoG from "@/components/sharing/ShareZoG";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { AppleseedData } from "./appleseedGenerator";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    onSave?: () => void;
    profileUrl?: string;
}

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <span className="font-medium text-slate-900">{title}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};

const AppleseedDisplay = ({ appleseed, onSave, profileUrl }: AppleseedDisplayProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyPitch = async () => {
        await navigator.clipboard.writeText(appleseed.elevatorPitch);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-8">
            {/* Epic Revelatory Hero - New unified format */}
            <RevelatoryHero
                type="appleseed"
                title={appleseed.vibrationalKey.name}
                tagline="Your genius is to be a"
                actionStatement={appleseed.bullseyeSentence}
                threeLenses={{
                    actions: appleseed.threeLenses.actions,
                    primeDriver: appleseed.threeLenses.primeDriver,
                    archetype: appleseed.threeLenses.archetype,
                }}
            />

            {/* Share Your Genius - Prominent placement for viral loop */}
            <ShareZoG
                archetypeName={appleseed.vibrationalKey.name}
                tagline={appleseed.vibrationalKey.tagline}
                primeDriver={appleseed.threeLenses.primeDriver}
                profileUrl={profileUrl}
            />

            {/* Collapsible Sections */}
            <div className="space-y-3">

                {/* Appreciated For */}
                <CollapsibleSection title="What You're Appreciated & Paid For">
                    <div className="space-y-4">
                        {appleseed.appreciatedFor.map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-slate-900">
                                    <span className="text-amber-600">★</span> {item.effect} → {item.scene} → {item.outcome}
                                </p>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Mastery Stages */}
                <CollapsibleSection title="Mastery Stages">
                    <div className="space-y-3">
                        {appleseed.masteryStages.map((stage) => (
                            <div key={stage.stage} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                                    {stage.stage}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{stage.name}</p>
                                    <p className="text-sm text-slate-600">{stage.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Professional Activities */}
                <CollapsibleSection title="Professional Activities">
                    <div className="space-y-3">
                        {appleseed.professionalActivities.map((activity, idx) => (
                            <div key={idx} className="text-slate-700">
                                <span className="font-medium">{activity.activity}</span>
                                <span className="text-slate-400"> → </span>
                                <span>{activity.targetAudience}</span>
                                <span className="text-slate-400"> → </span>
                                <span className="text-slate-600">{activity.purpose}</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Roles & Environments */}
                <CollapsibleSection title="Roles & Environments">
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-slate-500">As Creator</p>
                            <p className="text-slate-900">{appleseed.rolesEnvironments.asCreator}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">As Team Contributor</p>
                            <p className="text-slate-900">{appleseed.rolesEnvironments.asContributor}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">As Founder</p>
                            <p className="text-slate-900">{appleseed.rolesEnvironments.asFounder}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Environment</p>
                            <p className="text-slate-900">{appleseed.rolesEnvironments.environment}</p>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Complementary Partner */}
                <CollapsibleSection title="Best Complementary Partner">
                    <div className="space-y-2">
                        <p><span className="text-slate-500">Skills-wise:</span> {appleseed.complementaryPartner.skillsWise}</p>
                        <p><span className="text-slate-500">Genius-wise:</span> {appleseed.complementaryPartner.geniusWise}</p>
                        <p><span className="text-slate-500">Archetype-wise:</span> {appleseed.complementaryPartner.archetypeWise}</p>
                        <p className="text-amber-600 font-medium mt-2">Synergy: {appleseed.complementaryPartner.synergy}</p>
                    </div>
                </CollapsibleSection>

                {/* Monetization */}
                <CollapsibleSection title="Monetization Avenues">
                    <ul className="space-y-2">
                        {appleseed.monetizationAvenues.map((avenue, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-500">•</span>
                                <span className="text-slate-700">{avenue}</span>
                            </li>
                        ))}
                    </ul>
                </CollapsibleSection>

                {/* Life Scene */}
                <CollapsibleSection title="Life Scene">
                    <p className="text-slate-700 leading-relaxed italic">
                        {appleseed.lifeScene}
                    </p>
                </CollapsibleSection>

                {/* Visual Codes */}
                <CollapsibleSection title="Visual Codes">
                    <div className="space-y-2">
                        {appleseed.visualCodes.map((code, idx) => (
                            <div key={idx} className="flex gap-3">
                                <span className="font-medium text-slate-900">{code.symbol}</span>
                                <span className="text-slate-400">—</span>
                                <span className="text-slate-600">{code.meaning}</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>

                {/* Elevator Pitch */}
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-2">Elevator Pitch</h3>
                            <p className="text-slate-800 leading-relaxed">
                                {appleseed.elevatorPitch}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyPitch}
                            className="shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            {onSave && (
                <div className="pt-4">
                    <Button
                        onClick={onSave}
                        size="lg"
                        className="w-full bg-amber-500 hover:from-amber-600 hover:to-orange-600"
                    >
                        Save to My Profile
                    </Button>
                </div>
            )}

        </div>
    );
};

export default AppleseedDisplay;
