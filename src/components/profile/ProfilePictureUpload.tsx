import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

interface ProfilePictureUploadProps {
  userId: string;
  avatarUrl?: string | null;
  displayName?: string;
  size?: number;
  onUpload?: (url: string) => void;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const cropToSquare = async (file: File, size: number) => {
  const imageUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });

  const cropSize = Math.min(img.width, img.height);
  const sx = (img.width - cropSize) / 2;
  const sy = (img.height - cropSize) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);
  URL.revokeObjectURL(imageUrl);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("Failed to create image"));
      } else {
        resolve(result);
      }
    }, "image/png");
  });

  return blob;
};

const ProfilePictureUpload = ({
  userId,
  avatarUrl,
  displayName,
  size = 120,
  onUpload,
}: ProfilePictureUploadProps) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const initials = getInitials(displayName || "User");

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const blob = await cropToSquare(file, 256);
      const filePath = `${userId}/${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: "image/png", upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("game_profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      onUpload?.(publicUrl);
      toast({ title: "Profile picture updated" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Unable to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative rounded-full overflow-hidden bg-slate-800 text-white flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile avatar"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">{initials}</span>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-full bg-white/90 text-[#2c3150] p-2 shadow hover:bg-white"
            aria-label="Upload profile picture"
          >
            {uploading ? <span className="premium-spinner h-4 w-4" /> : <Camera className="h-4 w-4" />}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : "Change photo"}
        </Button>
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePictureUpload;
