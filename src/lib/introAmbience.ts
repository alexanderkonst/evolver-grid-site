/**
 * The intro's ambient bed: the draft clips are silent, so a quiet night air is made in code
 * (WebAudio, nothing downloaded, no music). Soft filtered noise for wind and distant water,
 * slowly swelling, over a barely-there low drone. Fades in after NEW GAME, out at the portal.
 *
 * The NEW GAME click is the user gesture that lets the AudioContext run. If the browser
 * still refuses, the intro simply plays without it.
 */

type Bed = { stop: (fadeMs: number) => void };

const SILENT: Bed = { stop: () => {} };

export function startIntroAmbience(fadeInMs = 2500): Bed {
  if (typeof window === "undefined") return SILENT;
  const Ctx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return SILENT;
  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return SILENT;
  }
  void ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.05, now + fadeInMs / 1000); // quiet
  master.connect(ctx.destination);

  // Brown-ish noise, 4 s loop.
  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    // Cross-fade the loop seam.
    const x = Math.floor(ctx.sampleRate * 0.25);
    for (let i = 0; i < x; i++) {
      const k = i / x;
      d[i] = d[i] * k + d[len - x + i] * (1 - k);
    }
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  noise.loopEnd = 4 - 0.25;

  // Wind: a low-pass whose cutoff drifts slowly, and a slow swell in level.
  const wind = ctx.createBiquadFilter();
  wind.type = "lowpass";
  wind.frequency.value = 520;
  wind.Q.value = 0.6;
  const windLfo = ctx.createOscillator();
  windLfo.frequency.value = 0.07;
  const windLfoAmt = ctx.createGain();
  windLfoAmt.gain.value = 260;
  windLfo.connect(windLfoAmt).connect(wind.frequency);

  const swell = ctx.createGain();
  swell.gain.value = 0.75;
  const swellLfo = ctx.createOscillator();
  swellLfo.frequency.value = 0.11;
  const swellAmt = ctx.createGain();
  swellAmt.gain.value = 0.25;
  swellLfo.connect(swellAmt).connect(swell.gain);

  noise.connect(wind).connect(swell).connect(master);

  // Drone: two soft sines a fifth apart, very low, slightly detuned.
  const drone = ctx.createGain();
  drone.gain.value = 0.12;
  const oscs = [55, 82.4, 55.3].map((f) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(drone);
    return o;
  });
  drone.connect(master);

  noise.start(now);
  windLfo.start(now);
  swellLfo.start(now);
  oscs.forEach((o) => o.start(now));

  let stopped = false;
  return {
    stop: (fadeMs: number) => {
      if (stopped) return;
      stopped = true;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + Math.max(0.05, fadeMs / 1000));
      window.setTimeout(() => {
        void ctx.close().catch(() => {});
      }, fadeMs + 200);
    },
  };
}
