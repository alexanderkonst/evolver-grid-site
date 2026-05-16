import { useMemo, useState } from "react";
import { Share2, Copy, Linkedin, Facebook, Send, Twitter, Instagram, Check, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";
// Day 67 (Sasha 2026-05-16): migrated from wabi-secondary Button +
// violet/lavender accents (legacy design system) to EditorialCta +
// gold/cream register matching landing + glassmorphism blueprint.
import { EditorialCta } from "@/components/ui/editorial-cta";

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

  const resolvedProfileUrl = profileUrl || "https://findyourtoptalent.com";
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
      {/* Primary CTA — same editorial pill as the landing's "Find Your
          Top Talent" button. Icon replaces the default ignite-logo;
          ChevronDown replaces the default → arrow and rotates on open. */}
      <EditorialCta
        variant="primary"
        label="Share my Quality of Life Map"
        onClick={() => setIsOpen(!isOpen)}
        icon={<Share2 className="w-4 h-4" />}
        rightIcon={
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        }
        className="w-full"
        ariaLabel="Share my Quality of Life Map"
      />

      {/* Subtitle — Cormorant italic in soft gold, matches the
          editorial register of the rest of the page. Replaced the
          previous violet wabi-color subtitle. */}
      <p
        className="text-center mt-2"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "13px",
          fontWeight: 600,
          color: "rgba(11, 42, 90, 0.65)",
          textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          letterSpacing: "0.01em",
        }}
      >
        Invite others to map theirs
      </p>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl z-20 space-y-1"
          style={{
            // Dark glass dropdown — matches the EditorialCta primary's
            // dark register, so trigger and panel read as one material.
            backgroundImage:
              "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.88) 50%, rgba(10,22,40,0.92) 100%)",
            border: "0.5px solid rgba(212, 175, 55, 0.35)",
            boxShadow:
              "0 0 0 1px rgba(212, 175, 55, 0.15), 0 8px 28px -8px rgba(10, 22, 40, 0.6), 0 0 24px -6px rgba(244, 212, 114, 0.20)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          {shareLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.06]"
              style={{
                color: "rgba(245, 245, 250, 0.92)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-5 h-5" style={{ color: "#f4d472" }} />
              <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "0.01em" }}>
                {link.label}
              </span>
            </a>
          ))}
          <button
            onClick={handleCopy}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.06]"
            style={{
              color: "rgba(245, 245, 250, 0.92)",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {copied ? (
              <Check className="w-5 h-5" style={{ color: "#86efac" }} />
            ) : (
              <Copy className="w-5 h-5" style={{ color: "#f4d472" }} />
            )}
            <span style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "0.01em" }}>
              {copied ? "Copied!" : "Copy Text"}
            </span>
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
