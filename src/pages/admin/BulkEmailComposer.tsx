/**
 * BulkEmailComposer — Day 62 (Sasha 2026-05-05) Wave 2.
 *
 * Modal that lets the admin compose + send a bulk email to a segment of
 * founders (resolved at the call site from /admin's segment chips).
 * Wraps the `admin-send-bulk-email` edge function.
 *
 * Flow:
 *   1. Admin opens with a recipient list pre-resolved (segment).
 *   2. Writes subject + body (markdown). Preview pane shows variable
 *      substitution applied to the FIRST recipient as a sanity check.
 *   3. Optional: "Send to me first as preview" — fires a dry_run + a
 *      single-recipient real send to the admin's own email so they can
 *      see how it actually renders in inbox before going wide.
 *   4. Clicks Send — confirmation dialog naming the recipient count,
 *      then calls the edge function. Toast reports {sent, suppressed,
 *      failed}.
 *
 * Variables available in subject + body (substitute as `{{name}}`):
 *   • {{first_name}} — recipient first name (or empty)
 *   • {{archetype}}  — recipient Top Talent archetype (or "your Top Talent")
 *   • {{magic_link}} — fresh one-click sign-in link, when "Include magic link"
 *
 * Recipient list cap: 200 per send (server enforces). For larger
 * segments split into multiple sends — the composer flags this above
 * the cap and disables the Send button.
 */

import { useMemo, useState } from "react";
import { Loader2, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { FounderState } from "./useFounderStates";

const MAX_RECIPIENTS = 200;

interface BulkEmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-resolved recipient list from the active segment chip. */
  recipients: FounderState[];
  /** Human-readable segment label (e.g. "TT high resonance (≥8)"). */
  segmentLabel: string;
  /**
   * Admin's own email — used by "Send preview to me." If undefined, the
   * preview path is hidden.
   */
  adminEmail?: string | null;
  /** Called after a real send completes so the parent can refresh the tracker. */
  onSent?: () => void;
}

export function BulkEmailComposer({
  open,
  onOpenChange,
  recipients,
  segmentLabel,
  adminEmail,
  onSent,
}: BulkEmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [includeMagicLink, setIncludeMagicLink] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Live preview substitution against the first recipient — quick sanity
  // check that {{first_name}} / {{archetype}} resolve to something
  // meaningful before sending wide.
  const previewSample = recipients[0];
  const previewSubject = useMemo(() => {
    if (!previewSample) return subject;
    return substituteVars(subject, previewSample);
  }, [subject, previewSample]);
  const previewBody = useMemo(() => {
    if (!previewSample) return body;
    return substituteVars(body, previewSample);
  }, [body, previewSample]);

  const overCap = recipients.length > MAX_RECIPIENTS;
  const ready = !!subject.trim() && !!body.trim() && recipients.length > 0 && !overCap;

  const handleSendPreviewToMe = async () => {
    if (!adminEmail) {
      toast.error("Admin email unknown — can't send preview.");
      return;
    }
    setPreviewing(true);
    try {
      // Single-recipient real send to the admin's own email. NOT a
      // dry_run — we want to see it land in our actual inbox.
      const { data, error } = await supabase.functions.invoke(
        "admin-send-bulk-email",
        {
          body: {
            recipients: [
              {
                user_id: "admin-preview",
                email: adminEmail,
                first_name: "Sasha",
                archetype: previewSample?.latest_zog_top_talent ?? "your Top Talent",
              },
            ],
            subject,
            body_markdown: body,
            include_magic_link: includeMagicLink,
            campaign_id: `preview_${Date.now()}`,
          },
        },
      );
      if (error) throw error;
      const sent = (data as { sent?: number } | null)?.sent ?? 0;
      if (sent > 0) {
        toast.success(`Preview sent to ${adminEmail}.`);
      } else {
        toast.error("Preview didn't send — check function logs.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Preview failed.");
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-send-bulk-email",
        {
          body: {
            recipients: recipients.map((r) => ({
              user_id: r.user_id,
              email: r.email,
              first_name: extractFirstName(r),
              archetype: r.latest_zog_top_talent,
            })),
            subject,
            body_markdown: body,
            include_magic_link: includeMagicLink,
          },
        },
      );
      if (error) throw error;
      const result = data as {
        sent: number;
        suppressed: number;
        failed: number;
        campaign_id: string;
      };
      toast.success(
        `Campaign sent — ${result.sent} delivered, ${result.suppressed} suppressed, ${result.failed} failed.`,
      );
      // Reset form
      setSubject("");
      setBody("");
      onOpenChange(false);
      onSent?.();
    } catch (e: any) {
      toast.error(e?.message || "Send failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{
            background:
              "var(--skin-page-bg, linear-gradient(180deg, rgba(252,248,238,0.99) 0%, rgba(248,242,224,0.99) 100%))",
            border: "0.5px solid rgba(212, 175, 55, 0.45)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "24px",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              Send to <em>{segmentLabel}</em>
            </DialogTitle>
            <DialogDescription
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "13.5px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              {recipients.length} recipient{recipients.length === 1 ? "" : "s"}.
              {overCap && (
                <span
                  className="ml-2"
                  style={{ color: "rgba(140, 60, 60, 0.85)", fontWeight: 600 }}
                >
                  Over {MAX_RECIPIENTS} cap — split into multiple sends.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Subject */}
            <div>
              <Label>Subject</Label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="A line that earns the open"
                className="mt-1 w-full rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                style={inputStyle}
              />
            </div>

            {/* Body */}
            <div>
              <Label>Body — markdown</Label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder={`Hey {{first_name}},\n\nA week ago you read your Top Talent: **{{archetype}}**.\n\nIf it landed, here's what's next: [book the session](https://findyourtoptalent.com/path).\n\nIf you'd rather just open your account: {{magic_link}}\n\n— Aleksandr`}
                className="mt-1 w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                style={{
                  ...inputStyle,
                  fontFamily:
                    "'Source Serif 4', ui-serif, system-ui, serif",
                  fontSize: "14px",
                  lineHeight: 1.55,
                  resize: "vertical",
                }}
              />
              <p
                className="mt-1.5 italic"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: "11.5px",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                }}
              >
                Variables: <code>{"{{first_name}}"}</code> ·{" "}
                <code>{"{{archetype}}"}</code> ·{" "}
                <code>{"{{magic_link}}"}</code>. Markdown: <strong>**bold**</strong>{" "}
                · <em>[link text](url)</em> · blank-line paragraphs.
              </p>
            </div>

            {/* Magic link toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMagicLink}
                onChange={(e) => setIncludeMagicLink(e.target.checked)}
                style={{ accentColor: "#b8860b" }}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                Include a fresh magic link per recipient
              </span>
              <span
                className="italic"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: "11.5px",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                }}
              >
                — substitutes <code>{"{{magic_link}}"}</code>; ~1h TTL.
              </span>
            </label>

            {/* Preview */}
            {(subject.trim() || body.trim()) && previewSample && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255, 255, 255, 0.55)",
                  border: "0.5px solid rgba(212, 175, 55, 0.30)",
                }}
              >
                <div
                  className="mb-2"
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "10.5px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--skin-accent-gold, #b8860b)",
                  }}
                >
                  Preview — substituted for {previewSample.display_name}
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "var(--skin-text-primary, #0b2a5a)",
                    marginBottom: "8px",
                  }}
                >
                  {previewSubject || <em style={{ opacity: 0.5 }}>(no subject)</em>}
                </div>
                <pre
                  className="whitespace-pre-wrap"
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
                    margin: 0,
                  }}
                >
                  {previewBody || (
                    <em style={{ opacity: 0.5 }}>(empty body)</em>
                  )}
                </pre>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 mt-4">
            {adminEmail && (
              <button
                onClick={handleSendPreviewToMe}
                disabled={!ready || previewing}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={secondaryPill}
              >
                {previewing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                Send preview to me
              </button>
            )}
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!ready || sending}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50 disabled:cursor-not-allowed"
              style={primaryCta}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send to {recipients.length}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog — last guard before a wide send. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "20px",
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              Send to {recipients.length} recipient{recipients.length === 1 ? "" : "s"}?
            </DialogTitle>
            <DialogDescription
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "13.5px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              Segment: <em>{segmentLabel}</em>. Opted-out users will be skipped automatically. There's no undo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-full px-4 py-2"
              style={secondaryPill}
            >
              Cancel
            </button>
            <button onClick={handleSend} className="rounded-full px-5 py-2.5" style={primaryCta}>
              Yes, send
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function extractFirstName(f: FounderState): string {
  // display_name format from founder_state_v1: "First Last" | "First" |
  // email_local_part. Take the first whitespace-separated token, but
  // skip if it looks like an email local-part (contains digits/dots).
  const dn = f.display_name?.trim() ?? "";
  if (!dn) return "";
  const first = dn.split(/\s+/)[0];
  // Heuristic: if the local-part fallback was used (contains a dot or
  // pure digits), don't substitute as a name.
  if (/[.\d]/.test(first)) return "";
  return first;
}

function substituteVars(template: string, f: FounderState): string {
  const firstName = extractFirstName(f);
  return template
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{archetype\}\}/g, f.latest_zog_top_talent ?? "your Top Talent")
    // Magic link is server-only; show a placeholder in the preview so
    // the operator can tell where it would be inserted without seeing
    // a stale or fake URL.
    .replace(/\{\{magic_link\}\}/g, "<one-click sign-in link>");
}

// ─────────────────────────────────────────────────────────────────────
// Inline UI atoms (kept here to avoid an extra import surface — the
// composer is one big file by design)
// ─────────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontWeight: 500,
        fontSize: "11px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
      }}
    >
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "14px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "rgba(255, 255, 255, 0.85)",
  border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
};

const primaryCta: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "12.5px",
  background:
    "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%)",
  color: "rgba(245, 245, 250, 0.98)",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow:
    "0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45)",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const secondaryPill: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "11.5px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "rgba(255, 255, 255, 0.72)",
  border: "0.5px solid rgba(26, 30, 58, 0.15)",
};
