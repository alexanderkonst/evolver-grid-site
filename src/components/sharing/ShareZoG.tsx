import { useMemo, useState } from "react";
import { Share2, Copy, Linkedin, Facebook, Send, Twitter, Instagram, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareZoGProps {
  archetypeName: string;
  tagline: string;
  primeDriver: string;
  talents?: string[];
  archetype?: string;
  profileId?: string;
  profileUrl?: string;
}

const buildShareText = (params: {
  archetypeName: string;
  tagline: string;
  primeDriver: string;
  talents?: string[];
  archetype?: string;
  profileUrl: string;
}) => {
  const { archetypeName, tagline, primeDriver, talents, archetype, profileUrl } = params;

  let text = `My genius is to be a ${archetypeName}.\n"${tagline}"\n\n`;

  if (talents && talents.length > 0) {
    text += `My top talents: ${talents.join(" • ")}\n`;
  }
  text += `My prime driver: ${primeDriver}\n`;
  if (archetype) {
    text += `My archetype: ${archetype}\n`;
  }
  text += `\nDiscover yours for free at ${profileUrl}`;

  return text;
};

const buildShareUrl = (url: string, profileId?: string) => {
  if (!profileId) return url;
  const shareUrl = new URL(url);
  shareUrl.searchParams.set("ref", profileId);
  return shareUrl.toString();
};

const ShareZoG = ({ archetypeName, tagline, primeDriver, talents, archetype, profileId, profileUrl }: ShareZoGProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const resolvedProfileUrl = profileUrl || "https://www.alexandrkonstantinov.com";
  const shareUrl = buildShareUrl(resolvedProfileUrl, profileId);

  const shareText = useMemo(
    () =>
      buildShareText({
        archetypeName,
        tagline,
        primeDriver,
        talents,
        archetype,
        profileUrl: shareUrl,
      }),
    [archetypeName, primeDriver, tagline, talents, archetype, shareUrl]
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
      href: `https://www.instagram.com/`, // Instagram doesn't support direct share URLs, opens app
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
    <div className="relative max-w-md mx-auto">
      {/* Main Share Button */}
      <Button
        variant="wabi-secondary"
        size="lg"
        className="w-full justify-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="w-5 h-5" />
        <span>Let the world know about my genius and invite others to discover theirs</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
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

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ShareZoG;
