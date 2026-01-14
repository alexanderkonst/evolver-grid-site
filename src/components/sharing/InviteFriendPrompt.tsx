import { useMemo, useState } from "react";
import { Copy, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logActionEvent } from "@/lib/actionEvents";
import { cn } from "@/lib/utils";

interface InviteFriendPromptProps {
  profileId?: string | null;
  source: string;
  shareUrl?: string;
  shareText?: string;
  className?: string;
}

const InviteFriendPrompt = ({
  profileId,
  source,
  shareUrl,
  shareText,
  className,
}: InviteFriendPromptProps) => {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const resolvedUrl = useMemo(() => {
    if (shareUrl) return shareUrl;
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/zone-of-genius/entry`;
  }, [shareUrl]);

  const resolvedText = useMemo(() => {
    return (
      shareText ||
      "I just discovered my Zone of Genius. Want to see yours too?"
    );
  }, [shareText]);

  const logInvite = async (method: "share" | "copy") => {
    if (!profileId) return;
    await logActionEvent({
      actionId: "invite:zog",
      profileId,
      source,
      loop: "profile",
      selectedAt: new Date().toISOString(),
      metadata: { method },
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      toast({ title: "Link copied" });
      await logInvite("copy");
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy the link right now.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!resolvedUrl) return;
    setIsSharing(true);
    const canShare = typeof navigator !== "undefined" && !!navigator.share;
    const payload = {
      title: "Discover Your Zone of Genius",
      text: resolvedText,
      url: resolvedUrl,
    };

    try {
      if (canShare) {
        await navigator.share(payload);
        toast({ title: "Invite sent" });
        await logInvite("share");
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
    } finally {
      setIsSharing(false);
    }

    await handleCopy();
  };

  if (dismissed) return null;

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Invite a Friend</p>
          <h3 className="text-lg font-semibold text-slate-900">
            Know someone who&apos;d love to discover their genius?
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            Send them a quick invite while the moment is fresh.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-700"
          aria-label="Dismiss invite"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={handleShare} disabled={isSharing || !resolvedUrl}>
          <Share2 className="w-4 h-4 mr-2" />
          {isSharing ? "Sharing..." : "Share"}
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!resolvedUrl}>
          <Copy className="w-4 h-4 mr-2" />
          Copy link
        </Button>
      </div>
    </div>
  );
};

export default InviteFriendPrompt;
