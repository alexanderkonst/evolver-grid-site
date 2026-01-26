import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Copy, Check, Youtube, Sparkles } from "lucide-react";
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

    try {
      // Use a free YouTube transcript API
      // Option 1: youtubetranscript.com (free, no auth)
      const response = await fetch(
        `https://yt.lemnoslife.com/noKey/captions?part=snippet&videoId=${videoId}`
      );
      
      if (!response.ok) {
        throw new Error("Could not fetch captions info");
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error("No captions available for this video");
      }

      // Get the first available caption track (usually auto-generated or manual)
      const captionTrack = data.items[0];
      const captionUrl = captionTrack?.snippet?.trackKind === 'asr' 
        ? `https://yt.lemnoslife.com/noKey/captions/${captionTrack.id}`
        : `https://yt.lemnoslife.com/noKey/captions/${captionTrack.id}`;
      
      // Fetch the actual transcript
      const transcriptResponse = await fetch(captionUrl);
      
      if (!transcriptResponse.ok) {
        // Fallback: Try alternative API
        const altResponse = await fetch(
          `https://api.kome.ai/api/tools/youtube-transcripts?video_id=${videoId}`
        );
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          if (altData.transcript) {
            setTranscript(altData.transcript);
            return;
          }
        }
        throw new Error("Could not fetch transcript");
      }

      const transcriptData = await transcriptResponse.json();
      
      // Format the transcript
      if (transcriptData.events) {
        const text = transcriptData.events
          .filter((e: any) => e.segs)
          .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        setTranscript(text);
      } else {
        throw new Error("No transcript data found");
      }

    } catch (err: any) {
      console.error("Transcript error:", err);
      setError(err.message || "Failed to get transcript. The video might not have captions available.");
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
