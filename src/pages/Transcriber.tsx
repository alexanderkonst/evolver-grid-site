import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy, Check, Youtube, Sparkles, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* FIRST SCREEN: Input + Magic Button */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mb-4">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">YouTube Transcriber</CardTitle>
            <CardDescription className="text-slate-400">
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
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && handleGetTranscript()}
              />

              {/* MAGIC BUTTON */}
              <Button
                onClick={handleGetTranscript}
                disabled={isLoading || !url.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
                <p className="text-slate-400">Fetching transcript...</p>
              </div>
            )}

            {/* MANUAL INPUT FALLBACK */}
            {showManualInput && !transcript && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Paste transcript manually</span>
                </div>
                <Textarea
                  placeholder="Paste the transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] bg-slate-700 border-slate-600 text-slate-200"
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
                    className="border-slate-600 text-slate-300 hover:text-white"
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
                  className="min-h-[300px] bg-slate-700 border-slate-600 text-slate-200 font-mono text-sm"
                />

                <p className="text-xs text-slate-500 text-center">
                  {transcript.split(' ').length} words
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer tip */}
        <p className="text-center text-slate-500 text-xs mt-4">
          Works with most YouTube videos that have captions enabled
        </p>
      </div>
    </div>
  );
};

export default Transcriber;
