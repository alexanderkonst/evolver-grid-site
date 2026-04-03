import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawSignal, prompt } = await req.json();

    if (!prompt && !rawSignal) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or rawSignal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an Appleseed Generator that outputs ONLY valid JSON. No markdown, no code blocks, no explanation."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from the response, handling various output formats
    let jsonContent = content.trim();
    
    // Strip markdown code block wrappers
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    let appleseed;
    
    // Strategy 1: Direct parse
    try {
      appleseed = JSON.parse(jsonContent);
    } catch {
      // Strategy 2: Find JSON object boundaries ({ ... })
      const firstBrace = jsonContent.indexOf("{");
      const lastBrace = jsonContent.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          appleseed = JSON.parse(jsonContent.slice(firstBrace, lastBrace + 1));
        } catch {
          // Strategy 3: Try to fix common issues (trailing commas, etc.)
          try {
            const cleaned = jsonContent
              .slice(firstBrace, lastBrace + 1)
              .replace(/,\s*}/g, "}")
              .replace(/,\s*]/g, "]");
            appleseed = JSON.parse(cleaned);
          } catch (finalErr) {
            console.error("All JSON parse strategies failed. Content starts with:", jsonContent.slice(0, 200));
            throw new Error("Could not parse AI response. Please try again — the AI sometimes produces imperfect formatting.");
          }
        }
      } else {
        console.error("No JSON object found in response. Content starts with:", jsonContent.slice(0, 200));
        throw new Error("AI did not return structured data. Please try again.");
      }
    }

    return new Response(
      JSON.stringify({ appleseed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-appleseed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    // Provide user-friendly error messages
    const userMessage = message.includes("parse") || message.includes("JSON")
      ? "Generation produced unexpected formatting. Please try again — it usually works on retry."
      : message;
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
