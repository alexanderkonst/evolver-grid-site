import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * YouTube Transcript Edge Function
 * 
 * Fetches transcript from YouTube videos using the youtube-transcript library approach.
 * Acts as a CORS-bypassing proxy.
 */
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { videoId } = await req.json();

        if (!videoId) {
            return new Response(
                JSON.stringify({ error: "Missing videoId" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch the YouTube video page to get transcript data
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        const response = await fetch(videoUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch video page");
        }

        const html = await response.text();

        // Extract captions data from the page
        const captionsMatch = html.match(/"captionTracks":(\[.*?\])/);

        if (!captionsMatch) {
            // Try alternative pattern
            const altMatch = html.match(/playerCaptionsTracklistRenderer.*?captionTracks.*?(\[.*?\])/s);
            if (!altMatch) {
                return new Response(
                    JSON.stringify({ error: "No captions available for this video" }),
                    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
        }

        let captionTracks;
        try {
            // Parse the captions data
            const captionsJson = captionsMatch ? captionsMatch[1] : "[]";
            captionTracks = JSON.parse(captionsJson);
        } catch {
            return new Response(
                JSON.stringify({ error: "Failed to parse captions data" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!captionTracks || captionTracks.length === 0) {
            return new Response(
                JSON.stringify({ error: "No captions available for this video" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get the first available caption track (prefer English)
        let captionTrack = captionTracks.find((t: any) => t.languageCode === "en") || captionTracks[0];
        const captionUrl = captionTrack.baseUrl;

        // Fetch the actual transcript XML
        const transcriptResponse = await fetch(captionUrl);

        if (!transcriptResponse.ok) {
            throw new Error("Failed to fetch transcript");
        }

        const transcriptXml = await transcriptResponse.text();

        // Parse XML to extract text
        const textMatches = transcriptXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
        const textParts: string[] = [];

        for (const match of textMatches) {
            // Decode HTML entities
            let text = match[1]
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\n/g, " ");
            textParts.push(text);
        }

        const transcript = textParts.join(" ").replace(/\s+/g, " ").trim();

        if (!transcript) {
            return new Response(
                JSON.stringify({ error: "Transcript is empty" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                transcript,
                language: captionTrack.languageCode,
                wordCount: transcript.split(" ").length
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in youtube-transcript:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch transcript" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
