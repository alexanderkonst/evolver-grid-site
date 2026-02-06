import { useState } from "react";
import { Upload, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";

/**
 * ArtPiecePage - Upload and display personal art piece
 * Only visible to alexanderkonst@gmail.com
 */
const ArtPiecePage = () => {
    const [artUrl, setArtUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setArtUrl(url);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setArtUrl(url);
        }
    };

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto p-6 lg:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--depth-violet)]/20 to-[var(--wabi-orchid)]/20 mb-4">
                        <Sparkles className="w-8 h-8 text-[var(--depth-violet)]" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-[var(--wabi-text-primary)] mb-2">
                        Art Piece
                    </h1>
                    <p className="text-[var(--wabi-text-secondary)]">
                        Visual expression of your unique essence
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        relative rounded-2xl border-2 border-dashed transition-all duration-200
                        ${isDragging
                            ? "border-[var(--depth-violet)] bg-[var(--depth-violet)]/10"
                            : "border-[var(--wabi-lavender)] bg-white/50"
                        }
                        ${artUrl ? "p-4" : "p-12"}
                    `}
                >
                    {artUrl ? (
                        <div className="space-y-4">
                            <img
                                src={artUrl}
                                alt="Your Art Piece"
                                className="w-full rounded-xl shadow-lg"
                            />
                            <div className="flex justify-center">
                                <label className="cursor-pointer">
                                    <Button variant="outline" size="sm" asChild>
                                        <span>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Replace Image
                                        </span>
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--wabi-lavender)]/30 mb-4">
                                <ImageIcon className="w-8 h-8 text-[var(--depth-violet)]" />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--wabi-text-primary)] mb-2">
                                Drop your art here
                            </h3>
                            <p className="text-[var(--wabi-text-muted)] text-sm mb-4">
                                or click to select a file
                            </p>
                            <label className="cursor-pointer">
                                <Button variant="outline" asChild>
                                    <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Select Image
                                    </span>
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-8 p-4 bg-[var(--wabi-pearl)] rounded-xl">
                    <p className="text-sm text-[var(--wabi-text-secondary)]">
                        <strong>Note:</strong> This is a concept module. Upload any image that represents
                        your unique essence. In the future, AI will generate personalized art based on your
                        Zone of Genius archetype.
                    </p>
                </div>
            </div>
        </GameShellV2>
    );
};

export default ArtPiecePage;
