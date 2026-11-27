/**
 * One Console card: the result a button gave, in its own shape, with the model's full text under
 * «Read all». Spec: docs/specs/your-ai-console/console-v1.md. Raw JSON is never shown.
 */
import { useTranslation } from "react-i18next";
import {
  type ButtonId,
  type CardRecord,
  type CaseCard,
  type GoalCard,
  type GoalV2Card,
  type SurvivorCard,
  type WeakCard,
} from "@/lib/console/phoenixChain";
import ConsoleMarkdown from "./ConsoleMarkdown";
import { ACCENT, INK, MUTED, SUBHEAD } from "./consoleTheme";

const Md = ({ children, inline = false }: { children: string; inline?: boolean }) => (
  <ConsoleMarkdown inline={inline}>{children}</ConsoleMarkdown>
);
const Para = ({ children }: { children: string }) => (
  <div className="text-[14px] leading-relaxed"><Md>{children}</Md></div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <h5 className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: SUBHEAD }}>{label}</h5>
    {children}
  </div>
);

const List = ({ items, ordered = true }: { items: React.ReactNode[]; ordered?: boolean }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`space-y-2 pl-5 text-[14px] leading-relaxed ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((x, i) => <li key={i} className="pl-1">{typeof x === "string" ? <Md inline>{x}</Md> : x}</li>)}
    </Tag>
  );
};

const Lead = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[16px] leading-snug" style={{ color: ACCENT, fontWeight: 600 }}>{typeof children === "string" ? <Md inline>{children}</Md> : children}</p>
);

const ConsoleCardView = ({ id, record }: { id: ButtonId; record: CardRecord }) => {
  const { t } = useTranslation();
  const f = (k: string) => t(`yourAiConsole.field.${k}`);
  const d = record.data;
  let body: React.ReactNode = null;
  switch (id) {
    case 1: {
      const c = d as GoalCard;
      body = (
        <>
          <Lead>{c.goal}</Lead>
          <Field label={f("why")}><List items={c.why} /></Field>
          <Field label={f("notThis")}><Para>{c.notThis}</Para></Field>
        </>
      );
      break;
    }
    case 2: {
      const c = d as CaseCard;
      body = (
        <>
          <Field label={f("case")}><Para>{c.case}</Para></Field>
          <Field label={f("risks")}><List items={c.risks} /></Field>
          <Field label={f("mistakes")}>
            <List
              items={c.mistakes.map((m) => (
                <>
                  <Md inline>{m.mistake}</Md>
                  <span className="block text-[13px]" style={{ color: MUTED }}>{f("sign")}: <Md inline>{m.sign}</Md></span>
                </>
              ))}
            />
          </Field>
        </>
      );
      break;
    }
    case 3: {
      const c = d as GoalV2Card;
      body = (
        <>
          <Lead>{c.goalV2}</Lead>
          <Field label={f("moves")}><List items={c.moves} /></Field>
          <Field label={f("whatChanged")}><Para>{c.whatChanged}</Para></Field>
        </>
      );
      break;
    }
    case 4: {
      const c = d as WeakCard;
      body = (
        <>
          <Field label={f("weak")}><List items={c.weak} /></Field>
          <Field label={f("fixes")}><List items={c.fixes} /></Field>
          <Field label={f("thirteenth")}><Lead>{c.thirteenth}</Lead></Field>
        </>
      );
      break;
    }
    case 5: {
      const c = d as SurvivorCard;
      body = (
        <>
          <Field label={f("survived")}><Para>{c.survived}</Para></Field>
          <Field label={f("burned")}><Para>{c.burned}</Para></Field>
          <Field label={f("nextMove")}><Lead>{c.nextMove}</Lead></Field>
        </>
      );
      break;
    }
  }
  return (
    <div className="space-y-3" style={{ color: INK }} data-testid={`console-card-${id}`}>
      {body}
      {record.full.trim() && (
        <details className="text-[13px]">
          <summary
            className="flex min-h-11 w-fit cursor-pointer list-none items-center rounded-md underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6] [&::-webkit-details-marker]:hidden"
            style={{ color: ACCENT, WebkitTapHighlightColor: "transparent" }}
          >
            {t("yourAiConsole.readAll")}
          </summary>
          <div className="break-words text-[13px] leading-relaxed" style={{ color: MUTED }}><Md>{record.full}</Md></div>
        </details>
      )}
    </div>
  );
};

export default ConsoleCardView;
