import {
  FOUNDER_TOOLS,
  FOUNDER_TOOL_OPENS_WHEN,
  FOUNDER_TOOL_STAGES,
  type FounderToolStage,
} from "@/data/founderTools";
import { isAdminEmail } from "@/lib/isAdmin";
import type { PlaceSave } from "@/lib/placeState";

/**
 * Which BUILD-pane tools a player is shown (issue #250). Config: src/data/founderTools.ts.
 * Pure: the pane passes in the save (`placeSaveFromSheet`) and the account email.
 */

type PaneRow = { id: string; isHeader?: boolean; locked?: boolean; lockedHint?: string };

/**
 * The player's stage: 0 for a guest or a player with nothing saved, else the position (1…)
 * of the latest stage their save has met. «Latest met», not «all met in a row»: the Market
 * opens on a saved offer alone, and whoever reached it has passed the stages before.
 */
export const founderStage = (met: PlaceSave["met"]): number => {
  let stage = 0;
  FOUNDER_TOOL_STAGES.forEach((req, i) => {
    if (met[req] === true) stage = i + 1;
  });
  return stage;
};

const stageOf = (id: string): number => {
  const rule = FOUNDER_TOOLS[id];
  return rule?.stage ? FOUNDER_TOOL_STAGES.indexOf(rule.stage) + 1 : 0;
};

export type FounderToolsContext = {
  /** `placeSaveFromSheet(sheet).met`. Empty until the save has loaded: nothing is listed. */
  met: PlaceSave["met"];
  email: string | null | undefined;
  /** «Opens when …» for a stage in the reader's language; defaults to the English line. */
  opensWhen?: (stage: FounderToolStage) => string;
};

/**
 * The pane rows this player sees:
 *   - a tool of stage ≤ the player's stage is listed;
 *   - at most ONE tool of the next stage is listed, closed, with its «Opens when …» line;
 *     nothing is teased to a player with no tool open (a guest sees no Founder Tools);
 *   - a personal tool is listed only for its owner's account;
 *   - Sasha's account (admin) sees every staged tool, as before;
 *   - a group header with no row left under it goes too.
 * Rows without a rule pass through. Routes are not touched: a direct link always works.
 */
export function resolveFounderTools<T extends PaneRow>(rows: T[], ctx: FounderToolsContext): T[] {
  const admin = isAdminEmail(ctx.email);
  const email = ctx.email?.toLowerCase() ?? null;
  const stage = founderStage(ctx.met);
  const opensWhen = ctx.opensWhen ?? ((s: FounderToolStage) => FOUNDER_TOOL_OPENS_WHEN[s]);

  const staged = rows.filter((r) => stageOf(r.id) > 0);
  const anyOpen = admin || staged.some((r) => stageOf(r.id) <= stage);
  const teased = admin || !anyOpen ? undefined : staged.find((r) => stageOf(r.id) === stage + 1);

  const listed: T[] = [];
  for (const row of rows) {
    const rule = FOUNDER_TOOLS[row.id];
    if (!rule || row.isHeader) {
      listed.push(row);
    } else if (rule.owner) {
      if (email === rule.owner.toLowerCase()) listed.push(row);
    } else if (admin || stageOf(row.id) <= stage) {
      listed.push(row);
    } else if (row === teased) {
      listed.push({ ...row, locked: true, lockedHint: opensWhen(rule.stage) });
    }
  }

  // A header stays only while a row follows it before the next header.
  return listed.filter((row, i) => {
    if (!row.isHeader) return true;
    const next = listed[i + 1];
    return !!next && !next.isHeader;
  });
}
