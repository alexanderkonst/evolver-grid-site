import { useEffect, useRef, useState } from "react";
import type { VillageParticle } from "@/hooks/useVillageParticles";

/**
 * PlaceParticles — what earlier players left at this place (WP-17).
 *
 * Three small lights at a time, one line each, drifting softly and trading
 * places one by one. No likes, no counts, no replies. Never anonymous: each
 * light carries the player's real photo, real name and uniqueness. Decorative:
 * pointer-events are off and the lines are not announced.
 * Styles live in Village.css (.vl-motes).
 */

const SLOTS = 3;
const TICK_MS = 6500; // one slot changes every tick
const FADE_MS = 1400; // matches the opacity transition in Village.css

type Props = { particles: VillageParticle[] };

/** First `n` indexes: the lights shown when the place opens. */
const initial = (n: number) => Array.from({ length: Math.min(SLOTS, n) }, (_, i) => i);

const PlaceParticles = ({ particles }: Props) => {
  const count = particles.length;
  const [shown, setShown] = useState<number[]>(() => initial(count));
  const [fading, setFading] = useState<boolean[]>(() => initial(count).map(() => false));
  const cursor = useRef(SLOTS);

  // A different set of particles (new place, or one was just added): start over.
  useEffect(() => {
    setShown(initial(count));
    setFading(initial(count).map(() => false));
    cursor.current = SLOTS;
  }, [particles, count]);

  // More than three: one light fades out and another takes its place, round the slots.
  useEffect(() => {
    if (count <= SLOTS) return;
    let turn = 0;
    const timers: number[] = [];
    const id = window.setInterval(() => {
      const slot = turn++ % SLOTS;
      setFading((f) => f.map((v, i) => (i === slot ? true : v)));
      timers.push(
        window.setTimeout(() => {
          setShown((current) => {
            let next = cursor.current % count;
            while (current.includes(next)) next = (next + 1) % count;
            cursor.current = next + 1;
            return current.map((v, i) => (i === slot ? next : v));
          });
          setFading((f) => f.map((v, i) => (i === slot ? false : v)));
        }, FADE_MS),
      );
    }, TICK_MS);
    return () => {
      window.clearInterval(id);
      timers.forEach(window.clearTimeout);
    };
  }, [count, particles]);

  if (count === 0) return null;

  return (
    <div className="vl-motes" aria-hidden="true">
      {shown.map((index, slot) => {
        const particle = particles[index];
        if (!particle) return null;
        return (
          <p key={slot} className={`vl-mote vl-mote--${slot}${fading[slot] ? " is-fading" : ""}`}>
            <span className="vl-mote__body">
              <img className="vl-mote__face" src={particle.avatar_url} alt="" loading="lazy" />
              <span className="vl-mote__text">{particle.text}</span>
              <span className="vl-mote__name">{particle.display_name}</span>
              {particle.uniqueness && <span className="vl-mote__unique">{particle.uniqueness}</span>}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default PlaceParticles;
