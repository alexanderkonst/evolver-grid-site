/**
 * Weekly circle (S7): the Save Point script, the Monday step, the witness who confirms.
 *
 * Lives on the circle page of a Weekly circle. Four parts that work only together:
 * the circle, the Sunday rhythm, the Save Point speech rule, confirmation by a peer.
 *
 *   Monday   each member sets ONE step with a "Done when…" and picks who will confirm it.
 *   Sunday   the Save Point: three questions, speak only from your own experience.
 *   After    the witness confirms → a stamp. Never scored, never ranked, never counted.
 *
 * Steps are readable only by their owner and witness (RLS), so this panel shows a player
 * their own steps and the steps they witness, and nothing about anyone else.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cardClass } from "@/components/circles/CircleBits";
import { WEEKLY } from "@/data/circlesCopy";
import { useToast } from "@/hooks/use-toast";
import { dateRailLabel, mondayOf, validStep } from "@/lib/circles";
import {
  VILLAGER,
  circleErrorMessage,
  claimStepDone,
  confirmStep,
  fetchSteps,
  myFirstName,
  setStep,
  stepNotYet,
  type Circle,
  type CirclePerson,
  type CircleStep,
} from "@/lib/circlesApi";

interface Props {
  circle: Circle;
  userId: string | null;
  people: CirclePerson[];
  /** Host or co-host: sees the full script. Everyone else sees the three questions. */
  runsCircle: boolean;
  /** On the circle (going, came, host or co-host): can set a step. */
  isMember: boolean;
}

const WeeklyPanel = ({ circle, userId, people, runsCircle, isMember }: Props) => {
  const { toast } = useToast();
  const seriesId = circle.series_id;
  const weekOf = mondayOf(circle.event_date);
  const [steps, setSteps] = useState<CircleStep[]>([]);
  const [step, setStepText] = useState("");
  const [doneWhen, setDoneWhen] = useState("");
  const [witnessId, setWitnessId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [notYetFor, setNotYetFor] = useState<string | null>(null);
  const [notYetText, setNotYetText] = useState("");

  const load = useCallback(async () => {
    if (!seriesId || !userId) return;
    setSteps(await fetchSteps(seriesId));
  }, [seriesId, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const nameOf = useCallback(
    (id: string) => people.find((p) => p.userId === id)?.name || VILLAGER,
    [people],
  );

  // Who can confirm: other people on the circle. Default: someone who has walked it (came before), else the host.
  const candidates = useMemo(() => people.filter((p) => p.userId !== userId), [people, userId]);
  useEffect(() => {
    if (witnessId || candidates.length === 0) return;
    const walked = candidates.find((p) => p.role === "guest" && p.came) || candidates.find((p) => p.role !== "guest") || candidates[0];
    setWitnessId(walked.userId);
  }, [candidates, witnessId]);

  const mine = steps.find((s) => s.user_id === userId && s.week_of === weekOf) || null;
  const stamps = steps.filter((s) => s.user_id === userId && s.confirmed_at);
  const toConfirm = steps.filter((s) => s.witness_id === userId && s.week_of === weekOf && s.claimed_done_at && !s.confirmed_at);

  const save = async () => {
    if (!seriesId || !userId) return;
    const valid = validStep(step, doneWhen);
    if (!valid) {
      toast({ title: "Write both lines: your step and when it is done.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await setStep({ seriesId, userId, weekOf, step: valid.step, doneWhen: valid.doneWhen, witnessId: witnessId || null });
      setStepText("");
      setDoneWhen("");
      await load();
    } catch (err) {
      toast({ title: circleErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (err) {
      toast({ title: circleErrorMessage(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4" aria-label={WEEKLY.savePointTitle}>
      {/* Sunday: the Save Point */}
      <div className={`${cardClass} p-5`}>
        <h2 className="font-semibold text-foreground mb-2">{WEEKLY.savePointTitle}</h2>
        {runsCircle ? (
          <div className="space-y-1 text-sm text-foreground">
            {WEEKLY.savePoint.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : (
          <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground">
            {WEEKLY.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        )}
      </div>

      {/* Monday: my step */}
      {userId && isMember && seriesId && (
        <div className={`${cardClass} p-5 space-y-3`}>
          <h2 className="font-semibold text-foreground">{WEEKLY.myStep}</h2>
          {mine ? (
            <div className="space-y-2 text-sm">
              <p className="text-foreground">{mine.step}</p>
              <p className="text-muted-foreground">
                {WEEKLY.doneWhen} {mine.done_when}
              </p>
              {mine.witness_id && <p className="text-muted-foreground">{WEEKLY.whoConfirms} {nameOf(mine.witness_id)}</p>}
              {mine.confirmed_at ? (
                <p className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-medium text-foreground">
                  <Check className="w-4 h-4" aria-hidden /> {WEEKLY.stamp}
                </p>
              ) : mine.claimed_done_at ? (
                <p className="text-muted-foreground">Waiting for {mine.witness_id ? nameOf(mine.witness_id) : "your witness"}.</p>
              ) : (
                <div className="space-y-2">
                  {mine.witness_note && <p className="text-muted-foreground">Not yet: {mine.witness_note}</p>}
                  <Button
                    size="sm"
                    disabled={busy || !mine.witness_id}
                    onClick={() =>
                      act(async () => {
                        await claimStepDone(mine, await myFirstName(userId));
                      })
                    }
                  >
                    {WEEKLY.stepIsDone}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Input placeholder={WEEKLY.myStep} value={step} maxLength={200} onChange={(e) => setStepText(e.target.value)} aria-label={WEEKLY.myStep} />
              <Input placeholder={WEEKLY.doneWhen} value={doneWhen} maxLength={200} onChange={(e) => setDoneWhen(e.target.value)} aria-label={WEEKLY.doneWhen} />
              <label className="block text-sm text-muted-foreground">
                {WEEKLY.whoConfirms}
                <select
                  value={witnessId}
                  onChange={(e) => setWitnessId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {candidates.map((p) => (
                    <option key={p.userId} value={p.userId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button disabled={busy || !witnessId} onClick={save}>
                {WEEKLY.setStep}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* As a witness: "{Name} says their step is done…" */}
      {toConfirm.map((s) => (
        <div key={s.id} className={`${cardClass} p-5 space-y-3`}>
          <p className="text-sm text-foreground">{WEEKLY.witnessNote(nameOf(s.user_id), s.done_when)}</p>
          <p className="text-sm text-muted-foreground">{s.step}</p>
          {notYetFor === s.id ? (
            <div className="space-y-2">
              <Input placeholder={WEEKLY.notYetPlaceholder} value={notYetText} maxLength={200} onChange={(e) => setNotYetText(e.target.value)} aria-label={WEEKLY.notYetPlaceholder} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      await stepNotYet(s, notYetText, userId ? await myFirstName(userId) : "Your witness");
                      setNotYetFor(null);
                      setNotYetText("");
                    })
                  }
                >
                  {WEEKLY.notYet}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setNotYetFor(null)}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={() => act(() => confirmStep(s))}>
                {WEEKLY.confirm}
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => setNotYetFor(s.id)}>
                {WEEKLY.notYet}
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Stamps: mine only, never a number */}
      {stamps.length > 0 && (
        <div className={`${cardClass} p-5`}>
          <h2 className="font-semibold text-foreground mb-2">{WEEKLY.stamp}</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {stamps.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-foreground shrink-0" aria-hidden />
                <span>
                  {dateRailLabel(s.week_of)} · {s.step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default WeeklyPanel;
