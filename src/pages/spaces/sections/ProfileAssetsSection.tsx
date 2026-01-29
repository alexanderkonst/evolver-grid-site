import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, ChevronDown, ChevronUp, Users } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import EmptyState from "@/components/ui/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_TYPES } from "@/modules/asset-mapping/data/assetTypes";
import { ASSET_SUB_TYPES } from "@/modules/asset-mapping/data/assetSubtypes";
import Panel3Actions from "@/components/game/Panel3Actions";

interface SavedAsset {
    typeId: string;
    subTypeId?: string;
    categoryId?: string;
    title: string;
    description?: string;
    savedAt: string;
    source: string;
}

const ProfileAssetsSection = () => {
    const navigate = useNavigate();
    const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);
    const [showAssets, setShowAssets] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadAssets = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isMounted) return;

            const assetsKey = `user_assets_${user.id}`;
            const storedAssets = localStorage.getItem(assetsKey);
            if (!storedAssets) return;
            try {
                const parsed = JSON.parse(storedAssets);
                if (isMounted) setSavedAssets(parsed);
            } catch (err) {
            }
        };

        loadAssets();
        return () => {
            isMounted = false;
        };
    }, []);

    const getAssetTypeName = (typeId: string) => {
        return ASSET_TYPES.find(t => t.id === typeId)?.title || typeId;
    };

    const getAssetSubTypeName = (subTypeId: string) => {
        return ASSET_SUB_TYPES.find(s => s.id === subTypeId)?.title || subTypeId;
    };

    return (
        <GameShellV2>
            <div className="p-6 pb-24 lg:p-8 lg:pb-8 max-w-3xl mx-auto">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Boxes className="w-6 h-6 text-[#2c3150]" />
                            <h1 className="text-2xl font-bold text-[#2c3150]">Saved Assets</h1>
                        </div>
                        <p className="text-[rgba(44,49,80,0.7)]">Track the skills, tools, and resources you have mapped.</p>
                    </div>
                    <Panel3Actions
                        primaryLabel={savedAssets.length > 0 ? "Find Matches" : "Add more"}
                        primaryIcon={savedAssets.length > 0 ? <Users className="w-4 h-4" /> : undefined}
                        primaryAction={() =>
                            navigate(savedAssets.length > 0 ? "/game/network/matches" : "/asset-mapping")
                        }
                        secondaryLabel={savedAssets.length > 0 ? "Add more" : undefined}
                        secondaryAction={savedAssets.length > 0 ? () => navigate("/asset-mapping") : undefined}
                    />
                </div>

                <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm overflow-hidden shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                    <button
                        onClick={() => setShowAssets(!showAssets)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[#f0f4ff]/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Boxes className="w-5 h-5 text-[#2c3150]/70" />
                            <span className="font-semibold text-[#2c3150]">
                                Your Assets ({savedAssets.length})
                            </span>
                        </div>
                        {showAssets ? (
                            <ChevronUp className="w-5 h-5 text-[#2c3150]/50" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-[#2c3150]/50" />
                        )}
                    </button>

                    {showAssets && (
                        <div className="border-t border-[#a4a3d0]/10 max-h-96 overflow-y-auto">
                            {savedAssets.length === 0 ? (
                                <div className="p-4">
                                    <EmptyState
                                        icon={<Boxes className="w-6 h-6 text-[#2c3150]/50" />}
                                        title="No assets saved"
                                        description="Start mapping your resources to build your library."
                                        action={{
                                            label: "Map Your Assets",
                                            onClick: () => navigate("/asset-mapping"),
                                        }}
                                    />
                                </div>
                            ) : (
                                savedAssets.map((asset, i) => (
                                    <div
                                        key={i}
                                        className="p-4 border-b border-[#a4a3d0]/10 last:border-b-0 hover:bg-[#f0f4ff]/30"
                                    >
                                        <div className="flex flex-wrap items-center gap-1 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#a4a3d0]/20 text-[#2c3150]/70">
                                                {getAssetTypeName(asset.typeId)}
                                            </span>
                                            {asset.subTypeId && (
                                                <span className="text-xs text-[#2c3150]/50">
                                                    → {getAssetSubTypeName(asset.subTypeId)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-[#2c3150]">{asset.title}</p>
                                        {asset.description && (
                                            <p className="text-sm text-[#2c3150]/70 mt-1">{asset.description}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GameShellV2>
    );
};

export default ProfileAssetsSection;
