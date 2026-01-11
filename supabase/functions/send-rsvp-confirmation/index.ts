import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventPayload {
  title: string;
  description?: string | null;
  date: string;
  time: string;
  location?: string | null;
  timezone?: string | null;
}

interface RsvpRequest {
  email: string;
  event: EventPayload;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const normalizeTime = (time: string) => {
  const parts = time.split(":");
  if (parts.length === 2) {
    return `${time}:00`;
  }
  return time;
};

const buildDates = (date: string, time: string, durationMinutes = 120) => {
  const normalized = normalizeTime(time);
  const start = new Date(`${date}T${normalized}`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
};

const formatForGoogle = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");

const buildGoogleCalendarUrl = (event: EventPayload) => {
  const { start, end } = buildDates(event.date, event.time);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatForGoogle(start)}/${formatForGoogle(end)}`,
    details: event.description || "",
    location: event.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const buildIcsContent = (event: EventPayload) => {
  const { start, end } = buildDates(event.date, event.time);
  const formatForIcs = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, "").slice(0, -1);
  const timezoneLine = event.timezone ? `TZID=${event.timezone}` : "";
  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART${timezoneLine ? `;${timezoneLine}` : ""}:${formatForIcs(start)}
DTEND${timezoneLine ? `;${timezoneLine}` : ""}:${formatForIcs(end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, event }: RsvpRequest = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!event?.title || !event?.date || !event?.time) {
      return new Response(JSON.stringify({ error: "Invalid event details" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sanitizedEmail = escapeHtml(email);
    const sanitizedTitle = escapeHtml(event.title);
    const sanitizedLocation = escapeHtml(event.location || "TBD");
    const sanitizedDescription = escapeHtml(event.description || "");

    const dateTime = new Date(`${event.date}T${normalizeTime(event.time)}`);
    const formattedDate = dateTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = dateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    const googleLink = buildGoogleCalendarUrl(event);
    const icsContent = buildIcsContent(event);
    const icsLink = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ARKHAZM <onboarding@resend.dev>",
        to: [sanitizedEmail],
        subject: `You're confirmed for ${sanitizedTitle}!`,
        html: `
          <h2>You're confirmed for ${sanitizedTitle}!</h2>
          <p><strong>Date:</strong> ${formattedDate} at ${formattedTime}</p>
          <p><strong>Location:</strong> ${sanitizedLocation}</p>
          <p>${sanitizedDescription}</p>
          <p>
            <a href="${googleLink}" target="_blank">Add to Google Calendar</a>
            &nbsp;|&nbsp;
            <a href="${icsLink}" target="_blank">Download iCal</a>
          </p>
          <p>See you there!</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-rsvp-confirmation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
