/**
 * Host a circle (S2) and edit one (S4 → Edit).
 *
 *   /game/meet/create      → one screen, title autofocused, everything else prefilled
 *   /game/meet/:id/edit    → the same screen prefilled, button "Save"
 *
 * Settings are compact rows that show their value; a tap opens a small popover, never a new
 * page (Luma habits 2–4). Picking a kind sets sensible defaults; the host can change any.
 * Spec: docs/specs/circles_v1_spec.md. Copy: src/data/circlesCopy.ts.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, ChevronRight, Image as ImageIcon } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MoonBadge, cardClass } from "@/components/circles/CircleBits";
import { HOST_FORM, KIND_LABEL, KIND_ORDER, WEEKLY } from "@/data/circlesCopy";
import { useToast } from "@/hooks/use-toast";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { supabase } from "@/integrations/supabase/client";
import {
  KIND_DEFAULTS,
  REPEAT_RULES,
  canRun,
  defaultWhen,
  kindOf,
  moonMark,
  nextWeekday,
  parseDateString,
  toDateString,
  visibilityFromColumn,
  zoneLongLabel,
  type CircleKind,
} from "@/lib/circles";
import {
  circleErrorMessage,
  createCircle,
  fetchCircle,
  searchVillagers,
  updateCircle,
  type Circle,
  type CircleDraft,
} from "@/lib/circlesApi";

const COVER_GRADIENT: Record<CircleKind, string> = {
  weekly_circle: "from-[#2c3150] to-[#8460ea]",
  mastermind: "from-[#8460ea] to-[#a4a3d0]",
  practice: "from-[#a4a3d0] to-[#d9d4f5]",
  dinner: "from-[#e8a96b] to-[#f6d9b5]",
  gathering: "from-[#6bb59a] to-[#c5e6d9]",
};

/** A settings row that shows its value and opens a small popover. */
const Row = ({ label, value, sub, children }: { label: string; value: string; sub?: string; children: ReactNode }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:border-foreground/40 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">
          {label} <span className="text-muted-foreground font-normal">· {value}</span>
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-80 space-y-3">
      {children}
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </PopoverContent>
  </Popover>
);

const initialDraft = (): CircleDraft => {
  const when = defaultWhen();
  return {
    title: "",
    description: "",
    kind: "gathering",
    date: when.date,
    start: when.start,
    end: when.end,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    repeat: KIND_DEFAULTS.gathering.repeat,
    location: "",
    onlineUrl: "",
    photoUrl: "",
    requiresApproval: KIND_DEFAULTS.gathering.requiresApproval,
    capacity: KIND_DEFAULTS.gathering.capacity,
    cohostId: null,
    visibility: "village",
  };
};

const draftFromCircle = (c: Circle): CircleDraft => ({
  title: c.title,
  description: c.description || "",
  kind: kindOf(c.kind),
  date: c.event_date,
  start: c.event_time.slice(0, 5),
  end: (c.end_time || "").slice(0, 5),
  timezone: c.timezone || "UTC",
  repeat: c.repeat_rule || "never",
  location: c.online_url ? "" : c.location || "",
  onlineUrl: c.online_url || "",
  photoUrl: c.photo_url || "",
  requiresApproval: !!c.requires_approval,
  capacity: c.capacity,
  cohostId: c.cohost_id,
  visibility: visibilityFromColumn(c.visibility),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const userId = useSessionUserId();
  const [draft, setDraft] = useState<CircleDraft>(initialDraft);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<Circle | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<string[]>([]);
  const [showPhoto, setShowPhoto] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [cohostName, setCohostName] = useState("");
  const [cohostQuery, setCohostQuery] = useState("");
  const [cohostResults, setCohostResults] = useState<Array<{ userId: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const set = <K extends keyof CircleDraft>(key: K, value: CircleDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // Hosting needs a profile (spec §1). Also the host's recent places.
  useEffect(() => {
    if (!userId) return;
    let live = true;
    (async () => {
      const [{ data: profile }, { data: past }] = await Promise.all([
        supabase.from("game_profiles").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("events").select("location").eq("created_by", userId).not("location", "is", null).order("created_at", { ascending: false }).limit(20),
      ]);
      if (!live) return;
      setHasProfile(!!profile);
      const seen = new Set<string>();
      (past || []).forEach((row) => {
        if (row.location && row.location !== "Online") seen.add(row.location);
      });
      setRecentPlaces(Array.from(seen).slice(0, 6));
    })();
    return () => {
      live = false;
    };
  }, [userId]);

  // Edit: load the meeting, only for people who run it.
  useEffect(() => {
    if (!editId || !userId) return;
    let live = true;
    fetchCircle(editId)
      .then(async (c) => {
        if (!live) return;
        if (!c || !canRun(c, userId)) {
          setLoadError("Only the host can edit this circle.");
          return;
        }
        setEditing(c);
        setDraft(draftFromCircle(c));
        setAboutText(c.description || "");
        if (c.photo_url) setShowPhoto(true);
        if (c.cohost_id) {
          const { data } = await supabase.from("game_profiles").select("first_name, last_name").eq("user_id", c.cohost_id).maybeSingle();
          if (live) setCohostName(`${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "A villager");
        }
      })
      .catch((err) => live && setLoadError(circleErrorMessage(err)));
    return () => {
      live = false;
    };
  }, [editId, userId]);

  useEffect(() => {
    if (cohostQuery.trim().length < 2) {
      setCohostResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const found = await searchVillagers(cohostQuery);
      setCohostResults(found.map((f) => ({ userId: f.userId, name: f.name })));
    }, 250);
    return () => clearTimeout(timer);
  }, [cohostQuery]);

  const pickKind = (kind: CircleKind) => {
    const defaults = KIND_DEFAULTS[kind];
    setDraft((prev) => ({
      ...prev,
      kind,
      capacity: defaults.capacity,
      requiresApproval: defaults.requiresApproval,
      repeat: editing ? prev.repeat : defaults.repeat,
      // the Weekly circle meets on Sunday
      date: kind === "weekly_circle" && !editing ? nextWeekday(parseDateString(prev.date), 0) : prev.date,
    }));
  };

  const place = draft.onlineUrl ? HOST_FORM.online : draft.location || HOST_FORM.whereAdd;
  const canSubmit = draft.title.trim().length > 0 && !saving;
  const today = useMemo(() => toDateString(new Date()), []);
  const dateObj = parseDateString(draft.date);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCircle(editing.id, draft);
        navigate(`/game/meet/${editing.id}/manage`);
      } else {
        const created = await createCircle(draft);
        navigate(`/game/meet/${created.id}`, { state: { justHosted: true } });
      }
    } catch (err) {
      toast({ title: circleErrorMessage(err, "Could not save the circle."), variant: "destructive" });
      setSaving(false);
    }
  };

  if (userId === null || (hasProfile === false && !editing)) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">{HOST_FORM.heading}</h1>
          <p className="text-muted-foreground">
            {userId === null ? "Sign in to host a circle." : "Hosting needs a profile. Set yours up first."}
          </p>
          <Button onClick={() => navigate(userId === null ? "/auth" : "/game")}>
            {userId === null ? "Sign in" : "Open my profile"}
          </Button>
        </div>
      </GameShellV2>
    );
  }

  if (loadError) {
    return (
      <GameShellV2>
        <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center space-y-4">
          <p className="text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => navigate("/game/meet")}>
            Back to the Café
          </Button>
        </div>
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <form onSubmit={submit} className="p-6 pb-[calc(var(--chat-clearance)+1.5rem)] lg:p-8 max-w-4xl mx-auto grid gap-8 md:grid-cols-[18rem_1fr]">
        {/* Left: cover preview, auto from the kind (and the player's skin through the card tokens) */}
        <div className="space-y-3">
          <div
            className={`aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br ${COVER_GRADIENT[draft.kind]} flex items-end p-4`}
          >
            {draft.photoUrl ? (
              <img src={draft.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <CalendarDays className="absolute top-4 right-4 w-8 h-8 text-white/70" aria-hidden />
                <span className="relative text-white font-semibold text-lg drop-shadow">
                  {draft.title.trim() || KIND_LABEL[draft.kind]}
                </span>
              </>
            )}
          </div>
          {showPhoto ? (
            <Input type="url" placeholder="https://..." value={draft.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} aria-label={HOST_FORM.changePhoto} />
          ) : (
            <button type="button" onClick={() => setShowPhoto(true)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ImageIcon className="w-4 h-4" aria-hidden />
              {HOST_FORM.changePhoto}
            </button>
          )}
        </div>

        {/* Right, top to bottom */}
        <div className="space-y-5 min-w-0">
          <input
            ref={titleRef}
            autoFocus
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={HOST_FORM.namePlaceholder}
            aria-label={HOST_FORM.namePlaceholder}
            maxLength={120}
            className="w-full bg-transparent border-0 outline-none text-3xl font-bold text-foreground placeholder:text-muted-foreground/60"
          />

          {/* Kind */}
          <div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kind">
              {KIND_ORDER.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  role="radio"
                  aria-checked={draft.kind === kind}
                  onClick={() => pickKind(kind)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    draft.kind === kind
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-foreground hover:border-foreground/40"
                  }`}
                >
                  {KIND_LABEL[kind]}
                </button>
              ))}
            </div>
            {draft.kind === "weekly_circle" && (
              <p className="text-xs text-muted-foreground mt-2">
                {WEEKLY.helper} <span className="block mt-0.5">{WEEKLY.bestWith}</span>
              </p>
            )}
          </div>

          {/* When */}
          <div className={`${cardClass} p-4 space-y-3`}>
            <div className="flex flex-wrap items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-foreground/40">
                    {dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    <MoonBadge mark={moonMark(draft.date)} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateObj}
                    onSelect={(d) => d && set("date", toDateString(d))}
                    disabled={(d) => toDateString(d) < today}
                    modifiers={{
                      fullMoon: (d) => moonMark(toDateString(d)) === "full",
                      newMoon: (d) => moonMark(toDateString(d)) === "new",
                    }}
                    modifiersClassNames={{
                      fullMoon: "underline decoration-2 underline-offset-4 font-semibold",
                      newMoon: "underline decoration-dotted decoration-2 underline-offset-4",
                    }}
                    initialFocus
                  />
                  <p className="px-3 pb-3 text-xs text-muted-foreground">Full moon underlined, new moon dotted.</p>
                </PopoverContent>
              </Popover>
              <input type="time" value={draft.start} onChange={(e) => set("start", e.target.value)} aria-label="Start time" className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm" />
              <span className="text-muted-foreground">–</span>
              <input type="time" value={draft.end} onChange={(e) => set("end", e.target.value)} aria-label="End time" className="rounded-md border border-border bg-transparent px-2 py-1.5 text-sm" />
            </div>
            <p className="text-xs text-muted-foreground">{zoneLongLabel(draft.timezone)}</p>
          </div>

          {/* Repeats (a new circle only: editing one meeting leaves the series alone) */}
          {!editing && (
            <Row label="Repeats" value={HOST_FORM.repeatLabel(draft.repeat)} sub={HOST_FORM.repeatsSub}>
              <div className="space-y-1">
                {REPEAT_RULES.map((rule) => (
                  <button
                    key={rule}
                    type="button"
                    onClick={() => set("repeat", rule)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${draft.repeat === rule ? "font-semibold" : ""}`}
                  >
                    {HOST_FORM.repeatLabel(rule)}
                  </button>
                ))}
              </div>
            </Row>
          )}

          {/* Where */}
          <Row label="Where" value={place} sub={HOST_FORM.whereSub}>
            {recentPlaces.length > 0 && (
              <div className="space-y-1">
                {recentPlaces.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, location: p, onlineUrl: "" }))}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <Input
              placeholder={HOST_FORM.anyAddress}
              value={draft.location}
              onChange={(e) => setDraft((prev) => ({ ...prev, location: e.target.value, onlineUrl: "" }))}
              aria-label={HOST_FORM.anyAddress}
            />
            <Input
              type="url"
              placeholder={`${HOST_FORM.online}: ${HOST_FORM.onlineLink}`}
              value={draft.onlineUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, onlineUrl: e.target.value, location: e.target.value ? "" : prev.location }))}
              aria-label={`${HOST_FORM.online} ${HOST_FORM.onlineLink}`}
            />
          </Row>

          {/* About */}
          <button
            type="button"
            onClick={() => {
              setAboutText(draft.description);
              setAboutOpen(true);
            }}
            className="w-full flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:border-foreground/40 transition-colors"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {draft.description ? draft.description : HOST_FORM.aboutAdd}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden />
          </button>
          <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About</DialogTitle>
              </DialogHeader>
              <Textarea rows={5} autoFocus placeholder={HOST_FORM.aboutPlaceholder} value={aboutText} onChange={(e) => setAboutText(e.target.value)} />
              <Button
                type="button"
                onClick={() => {
                  set("description", aboutText);
                  setAboutOpen(false);
                }}
              >
                {HOST_FORM.done}
              </Button>
            </DialogContent>
          </Dialog>

          {/* Options */}
          <div className="space-y-2">
            <Row label={HOST_FORM.askToJoin} value={draft.requiresApproval ? "On" : "Off"} sub={HOST_FORM.askToJoinSub}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{HOST_FORM.askToJoin}</span>
                <Switch checked={draft.requiresApproval} onCheckedChange={(v) => set("requiresApproval", v)} aria-label={HOST_FORM.askToJoin} />
              </div>
            </Row>
            <Row label={HOST_FORM.capacity} value={draft.capacity ? String(draft.capacity) : HOST_FORM.unlimited} sub={HOST_FORM.capacitySub}>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={draft.capacity ?? ""}
                  placeholder={HOST_FORM.unlimited}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    set("capacity", Number.isFinite(n) && n > 0 ? n : null);
                  }}
                  aria-label={HOST_FORM.capacity}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => set("capacity", null)}>
                  {HOST_FORM.unlimited}
                </Button>
              </div>
            </Row>
            <Row label={HOST_FORM.cohost} value={draft.cohostId ? cohostName || "Picked" : HOST_FORM.none} sub={HOST_FORM.cohostSub}>
              <Input placeholder="Search villagers by name" value={cohostQuery} onChange={(e) => setCohostQuery(e.target.value)} aria-label={HOST_FORM.cohost} />
              <div className="space-y-1">
                {cohostResults.map((r) => (
                  <button
                    key={r.userId}
                    type="button"
                    onClick={() => {
                      set("cohostId", r.userId);
                      setCohostName(r.name);
                      setCohostQuery("");
                    }}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              {draft.cohostId && (
                <Button type="button" variant="outline" size="sm" onClick={() => { set("cohostId", null); setCohostName(""); }}>
                  {HOST_FORM.none}
                </Button>
              )}
            </Row>
            <Row label={HOST_FORM.whoCanSee} value={draft.visibility === "link" ? HOST_FORM.linkOnly : HOST_FORM.village}>
              {(
                [
                  ["village", HOST_FORM.village, HOST_FORM.villageSub],
                  ["link", HOST_FORM.linkOnly, HOST_FORM.linkOnlySub],
                ] as const
              ).map(([value, label, sub]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("visibility", value)}
                  className={`w-full rounded-md px-2 py-1.5 text-left hover:bg-muted ${draft.visibility === value ? "bg-muted" : ""}`}
                >
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{sub}</span>
                </button>
              ))}
            </Row>
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {editing ? HOST_FORM.save : HOST_FORM.submit}
          </Button>
        </div>
      </form>
    </GameShellV2>
  );
};

export default CreateEvent;
