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
import { ACCENT, INK, MUTED } from "./consoleTheme";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <h5 className="text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED }}>{label}</h5>
    {children}
  </div>
);

const List = ({ items, ordered = true }: { items: React.ReactNode[]; ordered?: boolean }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`space-y-1 pl-5 text-[14px] leading-relaxed ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </Tag>
  );
};

const Lead = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[16px] leading-snug" style={{ color: ACCENT, fontWeight: 600 }}>{children}</p>
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
          <Field label={f("notThis")}><p className="text-[14px] leading-relaxed">{c.notThis}</p></Field>
        </>
      );
      break;
    }
    case 2: {
      const c = d as CaseCard;
      body = (
        <>
          <Field label={f("case")}><p className="text-[14px] leading-relaxed whitespace-pre-wrap">{c.case}</p></Field>
          <Field label={f("risks")}><List items={c.risks} /></Field>
          <Field label={f("mistakes")}>
            <List
              items={c.mistakes.map((m) => (
                <>
                  {m.mistake}
                  <span className="block text-[13px]" style={{ color: MUTED }}>{f("sign")}: {m.sign}</span>
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
          <Field label={f("whatChanged")}><p className="text-[14px] leading-relaxed">{c.whatChanged}</p></Field>
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
          <Field label={f("survived")}><p className="text-[14px] leading-relaxed whitespace-pre-wrap">{c.survived}</p></Field>
          <Field label={f("burned")}><p className="text-[14px] leading-relaxed whitespace-pre-wrap">{c.burned}</p></Field>
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
          <summary className="min-h-11 cursor-pointer py-3 underline underline-offset-4" style={{ color: ACCENT }}>
            {t("yourAiConsole.readAll")}
          </summary>
          <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed" style={{ color: MUTED }}>{record.full}</p>
        </details>
      )}
    </div>
  );
};

export default ConsoleCardView;
