import { Fragment } from "react";

/** Page copy as paragraphs (mini-trainings). Shared by rungs 1 and 2. */

/** `*word*` in the copy marks an italic. */
const Rich = ({ text }: { text: string }) => (
  <>
    {text.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}
  </>
);

const Paragraphs = ({ items }: { items: string[] }) => (
  <div className="space-y-3 text-base leading-relaxed text-foreground">
    {items.map((p, i) => (
      <p key={i}>
        <Rich text={p} />
      </p>
    ))}
  </div>
);

export default Paragraphs;
