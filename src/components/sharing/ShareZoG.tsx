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

/**
 * Virality mechanism: "Curiosity Gap" sharing
 *
 * The share text does NOT include the website link.
 * Instead it asks friends "do you see me this way?"
 *
 * This creates a two-stage viral loop:
 * 1. Friends engage with the post (comments, reactions) → algorithmic boost
 * 2. Friends ask "where did you get this?" → organic word-of-mouth
 * 3. The original sharer becomes the distribution channel
 *
 * The link is intentionally absent. Curiosity > convenience.
 */
const buildShareText = (params: {
  archetypeName: string;
  tagline: string;
  primeDriver: string;
  talents?: string[];
  archetype?: string;
}) => {
  const { archetypeName, tagline, primeDriver, talents } = params;

  let text = `Something just named what I do better than I ever could.\n\n`;
  text += `Apparently my genius is: ${archetypeName}\n`;
  text += `"${tagline}"\n\n`;

  if (talents && talents.length > 0) {
    text += `Top talents: ${talents.join(" · ")}\n`;
  }
  text += `What drives me: ${primeDriver}\n\n`;
  text += `Honestly? It hit hard.\n\n`;
  text += `But I'm curious — do you actually see me this way? 👀\n`;
  text += `Tell me if this lands or if I'm delusional 😂`;

  return text;
};

const ShareZoG = ({ archetypeName, tagline, primeDriver, talents, archetype, profileId, profileUrl }: ShareZoGProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareText = useMemo(
    () =>
      buildShareText({
        archetypeName,
        tagline,
        primeDriver,
        talents,
        archetype,
      }),
    [archetypeName, primeDriver, tagline, talents, archetype]
  );

  const encodedText = encodeURIComponent(shareText);
  // For platforms that need a URL, use the correct domain
  const siteUrl = encodeURIComponent("https://aleksandrkonstantinov.com");

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
      href: `https://www.facebook.com/sharer/sharer.php?u=${siteUrl}&quote=${encodedText}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${siteUrl}&text=${encodedText}`,
    },
    {
      label: "Instagram",
      icon: Instagram,
      href: `https://www.instagram.com/`,
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
      <button
        className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full
                   liquid-glass ring-1 ring-white/15
                   text-sm font-medium text-white/60 hover:text-white/80
                   hover:scale-[1.02] active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="w-4 h-4" />
        <span>Share with a friend</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl liquid-glass ring-1 ring-white/15 shadow-lg z-20 space-y-2">
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors text-white/70"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-5 h-5 text-[#8460ea]" />
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          ))}
          <button
            onClick={handleCopy}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors text-white/70"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
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

