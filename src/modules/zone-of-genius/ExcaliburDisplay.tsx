import { useState } from "react";
import { Sword, ChevronDown, ChevronUp, Copy, Check, Zap, Users, DollarSign, Radio, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import { ExcaliburData } from "./excaliburGenerator";

interface ExcaliburDisplayProps {
    excalibur: ExcaliburData;
    onSave?: () => void;
}

const ExcaliburDisplay = ({ excalibur, onSave }: ExcaliburDisplayProps) => {
    const [copiedOffer, setCopiedOffer] = useState(false);
    const [copiedHook, setCopiedHook] = useState(false);

    const handleCopyOffer = async () => {
        await navigator.clipboard.writeText(excalibur.sword.offer);
        setCopiedOffer(true);
        setTimeout(() => setCopiedOffer(false), 2000);
    };

    const handleCopyHook = async () => {
        await navigator.clipboard.writeText(excalibur.channel.messageHook);
        setCopiedHook(true);
        setTimeout(() => setCopiedHook(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-8">
            {/* Epic Revelatory Hero */}
            <RevelatoryHero
                type="excalibur"
                title="Your Unique Offer"
                subtitle={excalibur.sword.promise}
                tagline="One sword. One offer. One path forward."
            >
                {excalibur.sword.offer}
            </RevelatoryHero>

            {/* The Offer (Hero Card) */}
            <div className="p-6 bg-violet-50 rounded-2xl border border-violet-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-violet-600 font-medium mb-2">Your Offer</p>
                        <p className="text-lg text-slate-900 leading-relaxed">
                            {excalibur.sword.offer}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyOffer}
                        className="shrink-0"
                    >
                        {copiedOffer ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-violet-200">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Form</p>
                        <p className="text-sm font-medium text-slate-900">{excalibur.sword.form}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Price</p>
                        <p className="text-sm font-medium text-slate-900">{excalibur.exchange.pricing}</p>
                    </div>
                </div>
            </div>

            {/* Promise & Deliverable */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <p className="text-sm font-medium text-slate-700">Promise</p>
                    </div>
                    <p className="text-slate-600">{excalibur.sword.promise}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <p className="text-sm font-medium text-slate-700">Deliverable</p>
                    </div>
                    <p className="text-slate-600">{excalibur.sword.deliverable}</p>
                </div>
            </div>

            {/* Value Section */}
            <div className="p-5 bg-slate-50 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-slate-900">Who This Is For</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-slate-500">Ideal Client</p>
                        <p className="text-slate-800">{excalibur.value.whoBenefitsMost}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Survival Block This Cuts</p>
                        <p className="text-slate-800">{excalibur.value.survivalBlock}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-l-4 border-amber-400">
                        <p className="text-sm text-slate-500 mb-1">Their Immediate Aha</p>
                        <p className="text-slate-900 italic">"{excalibur.value.immediateAha}"</p>
                    </div>
                </div>
            </div>

            {/* Channel Section */}
            <div className="p-5 bg-slate-50 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-slate-900">How to Reach Them</h3>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500">Primary Channel</p>
                        <p className="text-slate-800">{excalibur.channel.primary}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Secondary Channel</p>
                        <p className="text-slate-800">{excalibur.channel.secondary}</p>
                    </div>
                </div>

                <div className="p-4 bg-violet-100 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-violet-700 font-medium mb-1">Your Hook</p>
                            <p className="text-slate-900">"{excalibur.channel.messageHook}"</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyHook}
                            className="shrink-0"
                        >
                            {copiedHook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Exchange */}
            <div className="p-5 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-slate-900">Exchange</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-slate-500">Pricing</p>
                        <p className="text-lg font-medium text-slate-900">{excalibur.exchange.pricing}</p>
                    </div>
                    {excalibur.exchange.optionalPathways && (
                        <div>
                            <p className="text-sm text-slate-500">Optional Pathways</p>
                            <p className="text-slate-800">{excalibur.exchange.optionalPathways}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Convergence */}
            <div className="p-5 bg-slate-900 rounded-xl text-white space-y-3">
                <h3 className="font-semibold">The Bigger Arc</h3>
                <p className="text-slate-300">{excalibur.convergence.biggerArc}</p>
                <div className="flex items-center gap-2 text-violet-300">
                    <ArrowRight className="w-4 h-4" />
                    <span>Next: {excalibur.convergence.nextPortal}</span>
                </div>
            </div>

            {/* Immediate Next Step (CTA) */}
            <div className="p-6 bg-emerald-50 rounded-2xl border border-green-200">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    Your Immediate Next Step
                </h3>

                <div className="space-y-3">
                    <div className="flex gap-3">
                        <span className="text-sm text-slate-500 w-20">Action:</span>
                        <span className="text-slate-900 font-medium">{excalibur.immediateNextStep.action}</span>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-sm text-slate-500 w-20">When:</span>
                        <span className="text-slate-900">{excalibur.immediateNextStep.when}</span>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-sm text-slate-500 w-20">With Whom:</span>
                        <span className="text-slate-900">{excalibur.immediateNextStep.withWhom}</span>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            {onSave && (
                <div className="pt-4">
                    <Button
                        onClick={onSave}
                        size="lg"
                        className="w-full bg-violet-500 hover:from-violet-600 hover:to-purple-600"
                    >
                        <Sword className="w-5 h-5 mr-2" />
                        Save My Offer
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ExcaliburDisplay;
