import { useMemo, useState } from "react";
import { Copy, Link2, Linkedin, Facebook, Send, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareZoGProps {
  archetypeName: string;
  tagline: string;
  primeDriver: string;
  profileUrl?: string;
}

const buildShareText = (params: {
  archetypeName: string;
  tagline: string;
  primeDriver: string;
  profileUrl: string;
}) => {
  const { archetypeName, tagline, primeDriver, profileUrl } = params;
  return `✦ I just discovered my Zone of Genius ✦\n\nI'm the "${archetypeName}"\n"${tagline}"\n\nMy Prime Driver: ${primeDriver}\n\nDiscover your genius: ${profileUrl}\n\n#ZoneOfGenius #EvolverGrid`;
};

const ShareZoG = ({ archetypeName, tagline, primeDriver, profileUrl }: ShareZoGProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const resolvedProfileUrl =
    profileUrl || (typeof window !== "undefined" ? `${window.location.origin}/game/profile` : "");

  const shareText = useMemo(
    () =>
      buildShareText({
        archetypeName,
        tagline,
        primeDriver,
        profileUrl: resolvedProfileUrl,
      }),
    [archetypeName, primeDriver, resolvedProfileUrl, tagline]
  );

  const encodedProfileUrl = encodeURIComponent(resolvedProfileUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedProfileUrl}&quote=${encodedText}`,
    },
    {
      label: "Twitter/X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedProfileUrl}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedProfileUrl}&text=${encodedText}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: "Share text copied" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy share text.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Share Your Genius</h3>
          <p className="text-sm text-slate-500">Invite others to discover their Zone of Genius.</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {shareLinks.map((link) => (
          <Button
            key={link.label}
            variant="outline"
            className="justify-start"
            asChild
          >
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <link.icon className="w-4 h-4 mr-2" />
              {link.label}
            </a>
          </Button>
        ))}
        <Button variant="outline" className="justify-start" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          {copied ? "Copied" : "Copy Text"}
        </Button>
      </div>
    </div>
  );
};

export default ShareZoG;
