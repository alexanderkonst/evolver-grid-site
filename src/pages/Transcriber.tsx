import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Check, Youtube, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * YouTube Transcriber — Following the UX Playbook
 * 
 * MASTER RESULT: User pastes YouTube URL → Gets transcript
 * 
 * SCREENS:
 * 1. First Screen: URL input + Magic Button
 * 2. Loading: Progress indicator
 * 3. Last Screen: Transcript displayed + copy button
 */

const Transcriber = () => {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const { toast } = useToast();

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
      /(?:youtube\.com\/v\/)([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleGetTranscript = async () => {
    const videoId = extractVideoId(url);

    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscript("");
    setShowManualInput(false);

    try {
      // API 1: Try kome.ai (CORS-friendly)
      try {
        const komeResponse = await fetch(
          `https://api.kome.ai/api/tools/youtube-transcripts?video_id=${videoId}`,
          { headers: { "Accept": "application/json" } }
        );
        if (komeResponse.ok) {
          const komeData = await komeResponse.json();
          if (komeData.transcript) {
            setTranscript(komeData.transcript);
            toast({ title: "Success!", description: `Transcript ready (${komeData.transcript.split(" ").length} words)` });
            return;
          }
        }
      } catch (e) {
        console.log("kome.ai failed, trying next...");
      }

      // API 2: Try tactiq.io
      try {
        const tactiqResponse = await fetch(
          `https://tactiq-apps-prod.tactiq.io/transcript?videoId=${videoId}&langCode=en`
        );
        if (tactiqResponse.ok) {
          const tactiqData = await tactiqResponse.json();
          if (tactiqData.captions && tactiqData.captions.length > 0) {
            const text = tactiqData.captions.map((c: any) => c.text).join(" ");
            setTranscript(text);
            toast({ title: "Success!", description: `Transcript ready (${text.split(" ").length} words)` });
            return;
          }
        }
      } catch (e) {
        console.log("tactiq.io failed, trying next...");
      }

      // API 3: Try youtubetranscript.com
      try {
        const ytResponse = await fetch(
          `https://youtubetranscript.com/?server_vid2=${videoId}`
        );
        if (ytResponse.ok) {
          const ytText = await ytResponse.text();
          // Parse XML response
          const textMatches = ytText.match(/<text[^>]*>([^<]*)<\/text>/g);
          if (textMatches && textMatches.length > 0) {
            const transcript = textMatches
              .map(t => t.replace(/<[^>]+>/g, ''))
              .join(' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"');
            setTranscript(transcript);
            toast({ title: "Success!", description: `Transcript ready (${transcript.split(" ").length} words)` });
            return;
          }
        }
      } catch (e) {
        console.log("youtubetranscript.com failed");
      }

      // All APIs failed - show manual input
      setShowManualInput(true);
      setError("Automatic transcript not available. You can paste the transcript manually below, or use YouTube's built-in transcript feature (click ⋮ → Show transcript on the video).");

    } catch (err: any) {
      console.error("Transcript error:", err);
      setShowManualInput(true);
      setError("Could not fetch transcript automatically. You can paste it manually below.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Transcript copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d2e] via-[#2c3150] to-[#1a1d2e] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* FIRST SCREEN: Input + Magic Button */}
        <Card className="border-[#a4a3d0]/30 bg-[#2c3150]/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-[#8460ea] to-[#6894d0] flex items-center justify-center mb-4">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">YouTube Transcriber</CardTitle>
            <CardDescription className="text-[#a4a3d0]">
              Paste any YouTube URL → Get the transcript instantly
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* URL Input */}
            <div className="flex gap-2">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-[#1a1d2e] border-[#a4a3d0]/40 text-white placeholder:text-[#a4a3d0]/60"
                onKeyDown={(e) => e.key === 'Enter' && handleGetTranscript()}
              />

              {/* MAGIC BUTTON */}
              <Button
                onClick={handleGetTranscript}
                disabled={isLoading || !url.trim()}
                className="bg-gradient-to-r from-[#8460ea] to-[#6894d0] hover:from-[#7050da] hover:to-[#5884c0] text-white font-semibold"
              >
                {isLoading ? (
                  <span className="premium-spinner w-4 h-4" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Transcript
                  </>
                )}
              </Button>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="py-8 text-center">
                <span className="premium-spinner w-8 h-8 mx-auto mb-2" />
                <p className="text-[#a4a3d0]">Fetching transcript...</p>
              </div>
            )}

            {/* MANUAL INPUT FALLBACK */}
            {showManualInput && !transcript && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#8460ea]">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Paste transcript manually</span>
                </div>
                <Textarea
                  placeholder="Paste the transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] bg-[#1a1d2e] border-[#a4a3d0]/40 text-white"
                />
                {transcript && (
                  <Button
                    onClick={() => toast({ title: "Transcript saved!", description: `${transcript.split(" ").length} words` })}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" /> Confirm Transcript
                  </Button>
                )}
              </div>
            )}

            {/* LAST SCREEN: Transcript Result */}
            {transcript && !isLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">Transcript</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-[#a4a3d0]/40 text-[#a4a3d0] hover:text-white"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>

                <Textarea
                  value={transcript}
                  readOnly
                  className="min-h-[300px] bg-[#1a1d2e] border-[#a4a3d0]/40 text-white font-mono text-sm"
                />

                <p className="text-xs text-[#a4a3d0]/60 text-center">
                  {transcript.split(' ').length} words
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer tip */}
        <p className="text-center text-[#a4a3d0]/60 text-xs mt-4">
          Works with most YouTube videos that have captions enabled
        </p>
      </div>
    </div>
  );
};

export default Transcriber;
