import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Pause, Play, Sunrise } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type DigestSection = "moved" | "waiting" | "outbox";

export interface DigestItem {
  section: DigestSection;
  text: string;
  ref?: string;
}

interface Digest {
  id: string;
  date: string;
  summary_md: string;
  items: DigestItem[];
  created_at: string;
}

interface CockpitSettings {
  agents_paused: boolean;
  digest_time: string;
  timezone: string;
}

const DEFAULT_SETTINGS: CockpitSettings = {
  agents_paused: false,
  digest_time: "08:00",
  timezone: "America/Mexico_City",
};

const SECTION_LABELS: Array<{ id: DigestSection; label: string }> = [
  { id: "moved", label: "What moved" },
  { id: "waiting", label: "Waiting for you" },
];

// Calendar day (YYYY-MM-DD) in the cockpit timezone.
export const todayIn = (timezone: string, now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

export const outboxCount = (items: DigestItem[]) =>
  items.filter((item) => item.section === "outbox").length;

// Tables are not in the generated Supabase types until the migration is applied.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export default function DailyCycleCard() {
  const [settings, setSettings] = useState<CockpitSettings>(DEFAULT_SETTINGS);
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    const [settingsRes, digestRes] = await Promise.all([
      db.from("cockpit_settings").select("agents_paused, digest_time, timezone").eq("user_id", userId).maybeSingle(),
      db.from("cockpit_digests").select("id, date, summary_md, items, created_at").eq("user_id", userId)
        .order("date", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (settingsRes.error || digestRes.error) {
      setError((settingsRes.error ?? digestRes.error).message);
    }
    setSettings({ ...DEFAULT_SETTINGS, ...(settingsRes.data ?? {}) });
    setDigest((digestRes.data as Digest | null) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePause = async () => {
    setSaving(true);
    setError(null);
    const next = !settings.agents_paused;
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      setSaving(false);
      return;
    }
    // Only agents_paused is sent, so digest_time / timezone are never overwritten.
    const { error: saveError } = await db
      .from("cockpit_settings")
      .upsert({ user_id: userId, agents_paused: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (saveError) setError(saveError.message);
    else setSettings((current) => ({ ...current, agents_paused: next }));
    setSaving(false);
  };

  const paused = settings.agents_paused;
  const isToday = digest?.date === todayIn(settings.timezone);
  const items = Array.isArray(digest?.items) ? digest!.items : [];

  return (
    <section className="mb-5 grid gap-4 lg:grid-cols-[0.45fr_1fr]">
      <div
        className={`rounded-2xl border p-5 ${
          paused ? "border-[#f0a37a]/50 bg-[#24100d]" : "border-[#4ecdc4]/30 bg-[#071d1d]"
        }`}
      >
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">Agents</p>
        <p className={`text-2xl font-semibold ${paused ? "text-[#ffc0a5]" : "text-[#93f0e8]"}`}>
          {paused ? "Paused" : "Running"}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#9ea7b3]">
          {paused
            ? "Agents will not start new work until you resume."
            : `Agents work daily. Digest at ${settings.digest_time} (${settings.timezone}).`}
        </p>
        <button
          type="button"
          onClick={() => void togglePause()}
          disabled={saving || loading}
          aria-pressed={paused}
          className={`mt-4 inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition disabled:opacity-60 ${
            paused
              ? "border-[#93f0e8]/60 bg-[#93f0e8] text-[#071d1d] hover:bg-[#c7fffa]"
              : "border-[#f0a37a]/60 bg-[#24100d] text-[#ffc0a5] hover:border-[#ffc0a5]"
          }`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : paused ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          {paused ? "Resume" : "Pause agents"}
        </button>
      </div>

      <div className="rounded-2xl border border-[#d6a84d]/25 bg-[#0d1117] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
            <Sunrise className="h-4 w-4" />
            Morning digest
          </p>
          {digest && <span className="text-xs text-[#9ea7b3]">{digest.date}</span>}
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-[#f0a37a]/35 bg-[#24100d] p-3 text-sm text-[#ffc0a5]">{error}</p>
        )}

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#9ea7b3]" />
        ) : !digest ? (
          <p className="text-sm leading-6 text-[#9ea7b3]">No digest yet. Agents write one each morning.</p>
        ) : (
          <div className="space-y-4">
            {!isToday && (
              <p className="text-xs text-[#ffc0a5]">No digest for today yet. Showing the latest.</p>
            )}
            <div className="text-sm leading-6 text-[#cfc4b5] [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_strong]:text-[#f6efe3]">
              <ReactMarkdown>{digest.summary_md}</ReactMarkdown>
            </div>
            {SECTION_LABELS.map(({ id, label }) => {
              const sectionItems = items.filter((item) => item.section === id);
              if (!sectionItems.length) return null;
              return (
                <div key={id}>
                  <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#93f0e8]">{label}</p>
                  <ul className="space-y-1">
                    {sectionItems.map((item, index) => (
                      <li key={index} className="text-sm leading-6 text-[#cfc4b5]">
                        — {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <p className="border-t border-white/10 pt-3 text-sm text-[#f6efe3]">
              <span className="mr-2 text-xs uppercase tracking-[0.14em] text-[#93f0e8]">Outbox</span>
              {outboxCount(items)} waiting
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
