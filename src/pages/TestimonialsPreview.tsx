import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./TestimonialsPreview.css";

/**
 * TestimonialsPreview — private review surface (`/preview/testimonials`).
 *
 * Sasha (2026-10-27): publish the first batch of testimonial clips so he can
 * review them in context; consent from each person comes after his review.
 * Hidden: noindex/nofollow, not in any nav or sitemap.
 * Template: docs/templates/testimonial-clips.md (§7 placement after an Outro).
 */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";

const src = (id: string) => `/testimonials/${id}.mp4`;
const poster = (id: string) => `/testimonials/${id}.jpg`;

type Clip = {
  id: string;
  person: string;
  date: string;
  quote: string;
  /** Original-language line when the subtitle is a translation. */
  original?: string;
  note?: string;
};

const CLIPS: Clip[] = [
  {
    id: "devon_1",
    person: "Devon Seegers",
    date: "2026-04-22",
    quote: "Yeah, thank you for having such clarity. I want your work to be uplifting millions.",
  },
  {
    id: "aleksa_1",
    person: "Aleksa Stojanović",
    date: "2026-09-18",
    quote: "But your way of verbalizing it I think was really, really influential.",
  },
  {
    id: "aleksa_2",
    person: "Aleksa Stojanović",
    date: "2025-09-08",
    quote:
      "So yeah, I'm really grateful because I think I embodied so much from you which I couldn't kind of verbalize before.",
  },
  {
    id: "aleksa_3",
    person: "Aleksa Stojanović",
    date: "2025-09-08",
    quote:
      "So yeah, I'm not sure if I was kind of clear, but I want to express my gratitude because I think it's mostly thanks to your efforts and your conversations with me and yeah, I just want to, I want to say this at the beginning of the call that's something I'm really kind of grateful for, you know?",
  },
  {
    id: "john_2",
    person: "John Hopkins",
    date: "2025-06-06",
    quote:
      "Yes, okay so I'm really I'm feeling very invigorated generally so I'm really grateful for this conversation and I feel like you're the first person I've ever spoken to who's on this wavelength and doing something like this.",
    note: "The clip's subtitles end at “…the first person I've ever”.",
  },
  {
    id: "sandra_1",
    person: "Sandra Otto",
    date: "2025-12-10",
    quote:
      "That is just too much, that is just not, that's not what attracted me is this clarity of doing one thing and it's a high value, it's one high value service.",
  },
  {
    id: "sergey_1",
    person: "Sergey Jay Makarov",
    date: "2026-03-23",
    quote:
      "I think the structure you developed is genius. I moved step by step, I re-checked some blocks, and at some point I'd realize I had to go back to the previous one and refine it a little, but the whole time I was 100% inside your structure, and I didn't want to, and never had to, change the methodology, the approach, the architecture.",
    original:
      "Мне кажется, вот структур, который разработал гениально, я, как бы, я понед двигался, вот я перепроверял какие-то блоки, и в какой-то момент я понимал, что надо вернуться на предыща, чуть-чуть доработать, но я все это время был на 100% в твоей структуре, на том, и там и мне не хотелось, и не приходилось никак менять методом долгие подхода архитектуры.",
    note: "English is a translation of the Russian (raw transcript below). Please listen once and correct.",
  },
];

type Ratio = "16:9" | "9:16";

const RatioToggle = ({ value, onChange }: { value: Ratio; onChange: (r: Ratio) => void }) => (
  <div className="tp-toggle" role="tablist" aria-label="Video format">
    {(["16:9", "9:16"] as Ratio[]).map((r) => (
      <button
        key={r}
        type="button"
        role="tab"
        aria-selected={value === r}
        className={value === r ? "is-on" : ""}
        onClick={() => onChange(r)}
      >
        {r}
      </button>
    ))}
  </div>
);

const Player = ({ id, ratio }: { id: string; ratio: Ratio }) => {
  const file = ratio === "16:9" ? id : `${id}_9x16`;
  return (
    <div className={`tp-frame ${ratio === "9:16" ? "tp-frame--v" : ""}`}>
      <video key={file} controls playsInline preload="metadata" poster={poster(file)}>
        <source src={src(file)} type="video/mp4" />
      </video>
    </div>
  );
};

const ClipCard = ({ clip }: { clip: Clip }) => {
  const [ratio, setRatio] = useState<Ratio>("16:9");
  return (
    <article className="tp-card">
      <header className="tp-card__head">
        <div>
          <h3>{clip.person}</h3>
          <p className="tp-mono">
            {clip.date} · {clip.id}
          </p>
        </div>
        <RatioToggle value={ratio} onChange={setRatio} />
      </header>
      <Player id={clip.id} ratio={ratio} />
      <blockquote className="tp-quote">“{clip.quote}”</blockquote>
      {clip.note && <p className="tp-note">{clip.note}</p>}
      {clip.original && <p className="tp-original">RU (transcript): {clip.original}</p>}
    </article>
  );
};

const TestimonialsPreview = () => {
  const [compRatio, setCompRatio] = useState<Ratio>("16:9");
  const outroClip = CLIPS.find((c) => c.id === "sergey_1")!;

  return (
    <div className="tp-root">
      <Helmet>
        <title>Testimonial clips · private preview</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </Helmet>

      <main className="tp-inner">
        <section className="tp-hero">
          <p className="tp-mono">Private preview · not linked · consent pending</p>
          <h1>Testimonial clips</h1>
          <p className="tp-lede">
            Seven clips from five people, cut verbatim from recorded calls, plus one compilation.
            Nothing here goes public until each person says yes.
          </p>
        </section>

        <section className="tp-section">
          <header className="tp-card__head">
            <div>
              <p className="tp-mono">Compilation · 35 s</p>
              <h2>Devon · Aleksa · Aleksa · John</h2>
            </div>
            <RatioToggle value={compRatio} onChange={setCompRatio} />
          </header>
          <Player id="compilation" ratio={compRatio} />
        </section>

        <section className="tp-section">
          <p className="tp-mono">The clips</p>
          <div className="tp-grid">
            {CLIPS.map((c) => (
              <ClipCard key={c.id} clip={c} />
            ))}
          </div>
        </section>

        <section className="tp-section">
          <p className="tp-mono">In context · after a module Outro</p>
          <h2>How a clip would sit at the Workshop</h2>
          <p className="tp-lede">
            Mock of the placement from the template: the player finishes Myth &amp; Uniqueness, the Outro
            closes, and before the way back to the village a 9:16 note appears from someone who walked
            the same path. Muted autoplay with subtitles, tap for sound.
          </p>

          <div className="tp-outro">
            <img className="tp-outro__scene" src="/game/village/workshop.webp" alt="" />
            <div className="tp-outro__veil" />
            <div className="tp-outro__body">
              <div className="tp-outro__text">
                <p className="tp-mono">The Workshop · Outro complete</p>
                <h3>Your myth is written.</h3>
                <p className="tp-outro__line">
                  What you found here is yours to carry. Before you go, a word from someone who stood
                  where you stand.
                </p>
                <p className="tp-outro__who">
                  {outroClip.person} · after his Uniqueness session
                </p>
                <span className="tp-outro__back">← Back to the village</span>
              </div>
              <div className="tp-outro__clip">
                <video
                  src={src("sergey_1_9x16")}
                  poster={poster("sergey_1_9x16")}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
              </div>
            </div>
          </div>
        </section>

        <footer className="tp-foot tp-mono">Hidden route · noindex · review only</footer>
      </main>
    </div>
  );
};

export default TestimonialsPreview;
