import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { PARTICLE_MAX, FIRST_NAME_MAX } from "@/lib/particleGuard";
import { clearParticleInvite, type VillageParticlesApi } from "@/hooks/useVillageParticles";
import "./LeaveParticle.css";

/**
 * LeaveParticle — the optional prompt after an Outro (WP-17).
 *
 * «Leave something here for the one who comes next.» One short line, an
 * optional first name, «Leave it» and «Not now». It never blocks anything: it
 * sits beside the way back to the village and can be ignored.
 *
 * Renders nothing for guests, when the player already left a particle here, or
 * while the table is not available (the feature degrades to «no prompt»).
 *
 * `variant="scene"` is for the dark place screen (/village/:place);
 * `variant="card"` for the light celebration modal.
 */

type Props = {
  placeKey: string;
  /** The hook result from the parent, so one fetch serves the whole screen. */
  api: VillageParticlesApi;
  variant?: "scene" | "card";
  /** Open the field straight away (the player just finished the Outro). */
  startOpen?: boolean;
};

const LeaveParticle = ({ placeKey, api, variant = "scene", startOpen = false }: Props) => {
  const { signedIn, available, hasLeft, leave } = api;
  const [open, setOpen] = useState(startOpen);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [thanked, setThanked] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const fieldId = useId();

  if (thanked) {
    return (
      <p className={`lp lp--${variant} lp__thanks`} role="status">
        Left here. Thank you.
      </p>
    );
  }
  if (!signedIn || !available || hasLeft || dismissed) return null;

  const close = () => {
    clearParticleInvite(placeKey);
    setOpen(false);
    setNote(null);
  };

  const notNow = () => {
    clearParticleInvite(placeKey);
    setDismissed(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const res = await leave(text, name);
    setBusy(false);
    if (res.ok === false) {
      setNote(res.message);
      return;
    }
    clearParticleInvite(placeKey);
    setThanked(true);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // Only close the field; do not let the place screen treat it as «back to the map».
      e.stopPropagation();
      close();
    }
  };

  if (!open) {
    return (
      <button type="button" className={`lp lp--${variant} lp__open`} onClick={() => setOpen(true)}>
        Leave something here for the one who comes next
      </button>
    );
  }

  return (
    <form className={`lp lp--${variant} lp__form`} onSubmit={submit} onKeyDown={onKeyDown} noValidate>
      <label className="lp__label" htmlFor={fieldId}>
        Leave something here for the one who comes next.
      </label>
      <input
        id={fieldId}
        className="lp__input"
        type="text"
        value={text}
        maxLength={PARTICLE_MAX}
        placeholder="A line, a feeling, a small light"
        autoComplete="off"
        autoFocus
        onChange={(e) => {
          setText(e.target.value);
          if (note) setNote(null);
        }}
      />
      <input
        className="lp__input lp__input--name"
        type="text"
        value={name}
        maxLength={FIRST_NAME_MAX}
        placeholder="First name (optional)"
        aria-label="First name (optional)"
        autoComplete="off"
        onChange={(e) => setName(e.target.value)}
      />
      {note && (
        <p className="lp__note" role="alert">
          {note}
        </p>
      )}
      <div className="lp__actions">
        <button type="submit" className="lp__go" disabled={busy}>
          Leave it
        </button>
        <button type="button" className="lp__skip" onClick={notNow}>
          Not now
        </button>
      </div>
    </form>
  );
};

export default LeaveParticle;
