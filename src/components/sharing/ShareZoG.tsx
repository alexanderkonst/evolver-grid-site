import { useMemo, useState } from "react";
import { Share2, Copy, Linkedin, Send, Twitter, Check, ChevronDown } from "lucide-react";
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
 * Virality mechanism: Identity Expression sharing
 *
 * Share = expression, NOT validation.
 * "This is me" — not "help me decide."
 *
 * The share text doesn't ask for permission or sanity-checking.
 * It states identity and invites curiosity.
 *
 * Viral loop:
 * 1. User shares because it feels true (ownership energy)
 * 2. Receiver sees something specific + personal → "wait, what is this?"
 * 3. Curiosity gap drives organic inquiry → word-of-mouth
 *
 * No link included. Curiosity > convenience.
 * No validation framing. Expression > hesitation.
 */
const buildShareText = (params: {
  archetypeName: string;
  tagline: string;
  primeDriver: string;
  talents?: string[];
  archetype?: string;
}) => {
  const { archetypeName, tagline, primeDriver, talents } = params;

  let text = `This is how I naturally create value:\n\n`;
  text += `${archetypeName}\n`;
  text += `"${tagline}"\n\n`;

  if (talents && talents.length > 0) {
    text += `${talents.join(" · ")}\n`;
  }
  text += `What drives it: ${primeDriver}\n\n`;
  text += `Curious what you see.`;

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
      label: "WhatsApp",
      icon: Send,
      href: `https://wa.me/?text=${encodedText}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${siteUrl}&text=${encodedText}`,
    },
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
      {/* Collapsed trigger — minimal, optional feel */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                   text-xs text-white/40 hover:text-white/60
                   transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>Optional: Get perspective from others</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Microcopy — only when expanded */}
      {isOpen && (
        <p className="text-center text-[11px] text-white/35 italic mb-2">
          Be honest—does this sound like me?
        </p>
      )}

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

