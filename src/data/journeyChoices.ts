/**
 * The real choice at the end of each Journey module (WP-19).
 * Design: docs/02-strategy/game_of_being_you.md §15.5 (Sid Meier: a game is a series of
 * interesting decisions), §14.12 (the badge records the decision, not the viewing),
 * docs/templates/module-form.md §5.
 *
 * One short, plain question per module, asked on its Outro. It is a life choice, not a test:
 * no right answer, no number, no score. The player's own words go to `module_choices`
 * (one per player per step, 1–280 characters) and appear on their badge with the date.
 *
 * COPY FOR SASHA'S REVIEW BEFORE MERGE. Everything a player reads is in `question` and
 * `placeholder`; nothing else in the app restates it.
 *
 * Keys: J1, J2, J4, J5 use the Journey ids the modules already have (`JourneyItemId`).
 * J6–J12 have no module, and so no id, yet; the ids below are provisional and are the
 * `step_id` their Outro will write. The WP that builds a module either keeps its id or
 * renames it here in the same change. J3 (Spectrum Reading) is not built and has no promise
 * (§17.1), so it has no question.
 */

export type JourneyChoicePrompt = {
  /** `module_choices.step_id`; for built modules the same as `JourneyModuleDef.id`. */
  stepId: string;
  /** The Journey number this prompt belongs to, for the reader of this file. */
  journey: string;
  /** The question on the Outro. Short, plain, a real decision. */
  question: string;
  /** Faint example of an answer inside the empty field. */
  placeholder: string;
};

export const JOURNEY_CHOICES: JourneyChoicePrompt[] = [
  // Built modules (they already have a ModuleOutro).
  {
    stepId: "find-top-talent",
    journey: "J1",
    question: "Who will you tell your top talent to by Sunday?",
    placeholder: "My sister, on Saturday",
  },
  {
    stepId: "discover-mission",
    journey: "J2",
    question: "Who will you tell your mission to by Sunday?",
    placeholder: "My closest friend, over dinner",
  },
  {
    stepId: "assess-qol",
    journey: "J4",
    question: "What do you stop doing this week?",
    placeholder: "Scrolling in bed",
  },
  {
    stepId: "map-assets",
    journey: "J5",
    question: "Which of your assets do you put to work this week?",
    placeholder: "My old client list",
  },

  // Not built yet. Provisional ids; see the header.
  {
    stepId: "uniqueness-phrase",
    journey: "J6",
    question: "Where do you say your phrase out loud today?",
    placeholder: "When I introduce myself at lunch",
  },
  {
    stepId: "tagline",
    journey: "J7",
    question: "Who sees your tagline first?",
    placeholder: "A friend who always tells me the truth",
  },
  {
    stepId: "webinar",
    journey: "J8",
    question: "What step do you choose before the day ends?",
    placeholder: "Book the call I keep postponing",
  },
  {
    stepId: "mastermind",
    journey: "J9",
    question: "What real step do you take this week?",
    placeholder: "Send my offer to three people",
  },
  {
    stepId: "mastery-practice",
    journey: "J10",
    question: "When in your day does the practice live?",
    placeholder: "Right after the first coffee",
  },
  {
    stepId: "first-price",
    journey: "J11",
    question: "Who hears your price first, and when?",
    placeholder: "A client I trust, on Tuesday",
  },
  {
    stepId: "first-sale",
    journey: "J12",
    question: "Who do you offer it to next?",
    placeholder: "The neighbour who asked about my work",
  },
];

/** The database accepts 1–280 characters (module_choices_text_length). */
export const CHOICE_MIN = 1;
export const CHOICE_MAX = 280;

/** The follow-up answers the database accepts (module_choices_followup_check). */
export const FOLLOWUPS = ["yes", "partly", "not_yet"] as const;
export type Followup = (typeof FOLLOWUPS)[number];

/** Button labels for the follow-up. Words only. */
export const FOLLOWUP_LABELS: Record<Followup, string> = {
  yes: "Yes",
  partly: "Partly",
  not_yet: "Not yet",
};

export const getJourneyChoice = (stepId: string | null | undefined): JourneyChoicePrompt | undefined =>
  JOURNEY_CHOICES.find((c) => c.stepId === stepId);

export const isFollowup = (v: unknown): v is Followup =>
  typeof v === "string" && (FOLLOWUPS as readonly string[]).includes(v);

/** The player's text trimmed and checked against the database range; null when it cannot be saved. */
export const cleanChoiceText = (raw: string): string | null => {
  const text = raw.replace(/\s+/g, " ").trim();
  return text.length >= CHOICE_MIN && text.length <= CHOICE_MAX ? text : null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A choice is asked about on a later visit, not straight after the Outro. Three days is long
 * enough that «Back to the village» does not trigger it and short enough to still be «this week».
 */
export const FOLLOWUP_AFTER_DAYS = 3;

export const choiceAgeDays = (createdAt: string, now: Date = new Date()): number => {
  const t = Date.parse(createdAt);
  return Number.isNaN(t) ? 0 : Math.floor((now.getTime() - t) / DAY_MS);
};

export const followupDue = (c: { created_at: string; followup: string | null }, now: Date = new Date()): boolean =>
  c.followup === null && choiceAgeDays(c.created_at, now) >= FOLLOWUP_AFTER_DAYS;

/** «12 October 2026»: the date on the badge. */
export const choiceDate = (createdAt: string, locale?: string): string => {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
};

/**
 * «Last week you chose “…”. How did it go?» The opener follows how long ago it was,
 * never a count: a few days → «A few days ago», one to two weeks → «Last week», longer → the date.
 */
export const followupLine = (
  c: { choice_text: string; created_at: string },
  now: Date = new Date(),
  locale?: string,
): string => {
  const days = choiceAgeDays(c.created_at, now);
  const when = days < 7 ? "A few days ago" : days < 14 ? "Last week" : `On ${choiceDate(c.created_at, locale)}`;
  return `${when} you chose “${c.choice_text}”. How did it go?`;
};
