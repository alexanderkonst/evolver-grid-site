import { useMemo, useState } from "react";
import { Share2, Copy, Linkedin, Facebook, Send, Twitter, Instagram, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";

interface ShareQolProps {
  overallStage: string;
  growthDomains: Array<{ domain: { id: DomainId; name: string } }>;
  strengthDomains: Array<{ domain: { id: DomainId; name: string } }>;
  profileId?: string;
  profileUrl?: string;
}

const buildShareText = ({
  overallStage,
  growthDomains,
  strengthDomains,
  profileUrl,
}: {
  overallStage: string;
  growthDomains: Array<{ domain: { name: string } }>;
  strengthDomains: Array<{ domain: { name: string } }>;
  profileUrl: string;
}) => {
  const growth = growthDomains.map(({ domain }) => domain.name).join(" • ");
  const strengths = strengthDomains.map(({ domain }) => domain.name).join(" • ");

  let text = `My Quality of Life Map snapshot: Overall Stage ${overallStage}.\n`;
  if (growth) {
    text += `Top growth: ${growth}\n`;
  }
  if (strengths) {
    text += `Strengths: ${strengths}\n`;
  }
  text += `\nDiscover yours for free at ${profileUrl}`;

  return text;
};

const buildShareUrl = (profileUrl: string, profileId?: string) => {
  if (!profileId) return profileUrl;
  const url = new URL(profileUrl);
  url.searchParams.set("ref", profileId);
  return url.toString();
};

const ShareQol = ({ overallStage, growthDomains, strengthDomains, profileId, profileUrl }: ShareQolProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const resolvedProfileUrl = profileUrl || "https://www.alexandrkonstantinov.com";
  const shareUrl = buildShareUrl(resolvedProfileUrl, profileId);

  const shareText = useMemo(
    () =>
      buildShareText({
        overallStage,
        growthDomains,
        strengthDomains,
        profileUrl: shareUrl,
      }),
    [overallStage, growthDomains, strengthDomains, shareUrl],
  );

  const encodedProfileUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    },
    {
      label: "X (Twitter)",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedProfileUrl}&quote=${encodedText}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedProfileUrl}&text=${encodedText}`,
    },
    {
      label: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com/",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <Button
        variant="wabi-secondary"
        size="lg"
        className="w-full justify-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="w-5 h-5" />
        <span>Share my Quality of Life Map</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      <p className="text-center text-xs text-[#a4a3d0] mt-2">
        Invite others to map theirs
      </p>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-xl border border-[#a4a3d0]/30 shadow-lg z-20 space-y-2">
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#a4a3d0]/10 transition-colors text-[#2c3150]"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-5 h-5 text-[#8460ea]" />
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          ))}
          <button
            onClick={handleCopy}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-[#a4a3d0]/10 transition-colors text-[#2c3150]"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-[#8460ea]" />
            )}
            <span className="text-sm font-medium">{copied ? "Copied!" : "Copy Text"}</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ShareQol;
