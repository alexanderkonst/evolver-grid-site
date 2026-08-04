/**
 * Funnel Analytics — Lightweight client-side funnel event tracking
 * 
 * Tracks the ZoG → Quiz → /ignite → Booking funnel with:
 * - Page-level events (view, scroll depth, time on page)
 * - CTA interaction events (click, hover duration)
 * - Conversion bridge events (email gate submit, quiz complete, booking click)
 * 
 * Storage: Supabase `funnel_events` table (created if not exists via edge function)
 * Fallback: localStorage queue, flushed on next page load
 * 
 * Privacy: No PII. Anonymous session_id only. Email hashed if present.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────

export type FunnelStep =
  | "zog_entry"         // Landing on /
  | "match_landing_view" // Funnel v2 (Day 77): Landing on /?path=match (or /ns/?path=match)
  | "zog_choice_route"  // Clicked "Reveal" → chose AI or manual
  | "zog_ai_prompt"     // Copied prompt
  | "zog_copy_prompt"   // Actually copied the prompt text
  | "zog_paste"         // Pasted AI response
  | "zog_result"        // Appleseed result displayed
  | "zog_email_save"    // Email gate submitted
  | "quiz_start"        // Started /quiz
  | "quiz_complete"     // Completed quiz, viewing result
  // Transition Quiz (vNext) — Quiz v2.1 (2026-07-29) instrumentation.
  // quiz_result covers every result variant (full read / crossed-peer /
  // not-yet is covered by quiz_q1); the template itself (e.g.
  // "discovery", "crossed_peer") travels as the `source` string passed
  // to trackPageView, since FunnelStep stays a fixed union.
  | "quiz_entry"        // Landed on the Transition Quiz entry screen
  | "quiz_q1"           // Q1 (stage placement) screen mount
  | "quiz_q2"           // Q2 (uniqueness) screen mount
  | "quiz_q3"           // Q3 (emerging-work stage) screen mount
  | "quiz_result"       // Result screen rendered (template travels as `source`)
  | "quiz_means"        // Means question screen mount (post buying-frame, ripe routes only)
  | "quiz_cta_click"    // Any Direction Call / crossed-peer CTA click
  | "quiz_permalink_saved" // "Save my read" tapped
  | "quiz_delta_answered"  // Recognition Delta widget answered
  // Result Experience EXT (Day 142) — ext_change_map.md §4. `source`
  // carries the differentiating value (result version, synthesis family,
  // detour ids, selected option, etc.) per the existing quiz_* convention.
  | "quiz_result_version_viewed"  // EXT/v1 result mounted (source = "ext-a_coherence" etc.)
  | "quiz_detours_displayed"      // Act II detours mounted (source = comma-joined detour ids)
  | "quiz_experiment_displayed"   // Act II experiment mounted (source = experiment id)
  | "quiz_experiment_selected"    // Door A "I'll test this first" clicked
  | "quiz_prep_outcome_selected"  // Preparation-selector option chosen
  | "quiz_save_opened"            // EXT "Keep this result" opened
  | "quiz_disagreement_reason"    // Disagreement control option chosen
  | "quiz_retake"                 // Retake clicked (EXT utility row)
  | "quiz_share"                  // Share/copy-link clicked (EXT utility row)
  | "quiz_saved_result_revisited" // /quiz/r/:id mounted for an EXT saved result
  | "quiz_saved_still_accurate"   // Saved-return "This still feels accurate"
  | "quiz_saved_something_shifted" // Saved-return "Something important has shifted"
  | "ignite_view"       // Landed on /ignite
  | "ignite_video"      // Scrolled to / played video
  | "ignite_pricing"    // Scrolled to pricing section
  | "ignite_cta_click"  // Clicked any CTA (pay/book/clarity)
  | "booking_click"     // Clicked Stripe payment link
  | "clarity_call_click"  // Clicked 15-min clarity call
  | "divine_timing"     // Submitted "not now" email
  | "qol_start"         // Started QoL assessment
  | "qol_complete"      // Completed QoL assessment
  | "evolution_portal_view" // Landed on practitioner Evolution Portal
  | "evolution_portal_karime_view" // Landed on Karime's personalized proposal page
  | "activate_click"            // Clicked Activate ($37) Stripe CTA on AppleseedDisplay
  | "activate_coupon_redeemed"  // Redeemed coupon to bypass Stripe (Day 58)
  | "activate_welcome";         // Landed on /activate/welcome (post-payment or coupon)

export interface FunnelEvent {
  step: FunnelStep;
  source?: string;               // e.g., "quiz_result_cta", "zog_result_cta"
  metadata?: Record<string, unknown>;
}

// ─── Session Management ─────────────────────────────────────────

const SESSION_KEY = "funnel_session_id";
const QUEUE_KEY = "funnel_event_queue";

const getSessionId = (): string => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

// ─── Event Queue (Offline Resilience) ───────────────────────────

interface QueuedEvent {
  session_id: string;
  step: FunnelStep;
  source?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  page_url: string;
  referrer: string;
}

const enqueue = (event: QueuedEvent) => {
  try {
    const queue: QueuedEvent[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    queue.push(event);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Silently fail — analytics should never break UX
  }
};

const flushQueue = async () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const queue: QueuedEvent[] = JSON.parse(raw);
    if (queue.length === 0) return;
    
    localStorage.removeItem(QUEUE_KEY);
    
    const { error } = await (supabase as any)
      .from("funnel_events")
      .insert(queue);
    
    if (error) {
      // Re-enqueue on failure
      const existing = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      localStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, ...existing]));
    }
  } catch {
    // Silently fail
  }
};

// ─── Core Tracking Function ─────────────────────────────────────

export const trackFunnelEvent = async (event: FunnelEvent): Promise<void> => {
  const payload: QueuedEvent = {
    session_id: getSessionId(),
    step: event.step,
    source: event.source,
    metadata: event.metadata,
    timestamp: new Date().toISOString(),
    page_url: window.location.pathname + window.location.search,
    referrer: document.referrer || "",
  };

  try {
    const { error } = await (supabase as any)
      .from("funnel_events")
      .insert(payload);
    
    if (error) {
      // Table might not exist yet — queue for later
      enqueue(payload);
    }
  } catch {
    enqueue(payload);
  }
};

// ─── Convenience Hooks ──────────────────────────────────────────

/** Call on page mount to track page views + flush queued events */
export const trackPageView = (step: FunnelStep, source?: string) => {
  flushQueue(); // Attempt to flush any queued events
  trackFunnelEvent({ step, source });
};

/** Track CTA clicks with metadata */
export const trackCTAClick = (
  step: FunnelStep,
  ctaId: string,
  metadata?: Record<string, unknown>
) => {
  trackFunnelEvent({
    step,
    source: ctaId,
    metadata: { ...metadata, cta_id: ctaId },
  });
};
