/**
 * Circles v1 copy, English, exactly as the spec in issue #384 (sections S1–S7, §5; Care of a place: PR #388).
 * One file so the words live in one place; the screens import from here and never rephrase.
 *
 * Not in the i18n JSON on purpose: the spec fixes this wording and the circle words
 * (circle, host, came, Harvest) are chosen. Russian and Spanish are a later pass.
 */
import type { CircleKind, RepeatRule } from "@/lib/circles";

export const CAFE = {
  title: "Café",
  subtitle: "Circles hosted by villagers. Come in person.",
  host: "Host a circle",
  upcoming: "Upcoming",
  past: "Past",
  empty: "No circles yet this week. Host the first one: a dinner, a practice, a mastermind.",
  manage: "Manage",
  going: (n: number) => `${n} going`,
  harvest: "Full moon",
} as const;

export const KIND_LABEL: Record<CircleKind, string> = {
  weekly_circle: "Weekly circle",
  mastermind: "Mastermind",
  practice: "Practice",
  dinner: "Dinner",
  gathering: "Gathering",
  care: "Care of a place",
};

export const KIND_ORDER: CircleKind[] = ["mastermind", "practice", "dinner", "gathering", "care", "weekly_circle"];

/** Care of a place (closes mechanics-atlas invariant #10, "visible care of the shared ground"). */
export const CARE = {
  helper: "Take care of a place we share: a beach, a garden, a street. Come in person.",
  aboutPlaceholder: "What we'll do. Done when…",
  addAfterPhoto: 'Add an "after" photo',
  changeAfterPhoto: 'Change the "after" photo',
  removeAfterPhoto: "Remove",
  afterAlt: "The place after we cared for it",
} as const;

export const WEEKLY = {
  helper:
    "A small circle that meets every Sunday. On Monday each of you sets one step. On Sunday each of you says how it went.",
  bestWith: "Best with 5 to 12",
  mondayNote: (circle: string) => `New week in ${circle}. What is your one step?`,
  myStep: "My step",
  doneWhen: "Done when…",
  whoConfirms: "Who will confirm it?",
  setStep: "Set my step",
  stepIsDone: "My step is done",
  witnessNote: (name: string, doneWhen: string) =>
    `${name} says their step is done. Done when: ${doneWhen}. Do you confirm?`,
  confirm: "I confirm",
  notYet: "Not yet",
  notYetPlaceholder: "One line in words: what is still open?",
  stamp: "Stamp",
  savePoint: [
    "Welcome to the Save Point.",
    "One rule: speak only from your own experience. No advice, no blame.",
    "Each of us answers three questions:",
    "1. What did I intend?",
    "2. What happened?",
    "3. What do I take with me?",
    "Others listen. Then the next person.",
  ],
  savePointTitle: "The Save Point",
  questions: ["What did I intend?", "What happened?", "What do I take with me?"],
  linePlaceholder: "What I take with me",
} as const;

export const HOST_FORM = {
  heading: "Host a circle",
  namePlaceholder: "Name your circle",
  changePhoto: "Change photo",
  repeatsSub: "We'll put the next 4 meetings in the Café. Each one has its own guest list.",
  repeatLabel: (rule: RepeatRule) =>
    ({
      never: "Never",
      weekly: "Every week",
      biweekly: "Every 2 weeks",
      monthly: "Every month",
      new_moon: "Every new moon",
      full_moon: "Every full moon",
    })[rule],
  whereAdd: "Add a place",
  whereSub: "A real place, or a call link.",
  online: "Online",
  onlineLink: "Call link",
  anyAddress: "Any address",
  aboutAdd: "Add a few words",
  aboutPlaceholder: "Who is it for? What will you do together?",
  done: "Done",
  askToJoin: "Ask to join",
  askToJoinSub: "You approve each person before they're in.",
  capacity: "Capacity",
  capacitySub: "Joining closes when the circle is full.",
  unlimited: "Unlimited",
  cohost: "Co-host",
  cohostSub: "Holds the circle with you and can take it over.",
  none: "None",
  whoCanSee: "Who can see",
  village: "Village",
  villageSub: "Shown in the Café",
  linkOnly: "Link only",
  linkOnlySub: "Only people with the link can join",
  submit: "Host circle",
  save: "Save",
  created: "Your circle is in the Café.",
  copyLink: "Copy link",
} as const;

export const CIRCLE_PAGE = {
  hostedBy: "Hosted by",
  write: "Write",
  with: (name: string) => `with ${name}`,
  going: "Going",
  came: "Came",
  onlineAfterJoin: "Online · link after you join",
  joinOpen: (name: string) => `Join, ${name}?`,
  join: "Join",
  askTitle: "The host says yes to each person.",
  ask: "Ask to join",
  askModalTitle: "A line for the host (optional)",
  full: "This circle is full.",
  writeToHost: "Write to the host",
  joined: "You're in.",
  addToCalendar: "Add to calendar",
  cantMakeIt: "Can't make it",
  asked: "Waiting for the host's yes.",
  withdraw: "Withdraw",
  declined: "The host said not this time.",
  cancelled: "This circle was cancelled.",
  meets: (rule: string, next: string | null) => `Meets ${rule}${next ? ` · next: ${next}` : ""}`,
  youHost: "You host this circle.",
  manage: "Manage",
  oneLine: "One line about this circle?",
  linePlaceholder: "What did you take from it?",
  leaveLine: "Leave line",
  offerTitle: (name: string) => `${name} passes this circle to you.`,
  takeCircle: "Take the circle",
  signInToJoin: "Sign in to join.",
  ended: "This circle has ended.",
} as const;

export const MANAGE = {
  endedHeadline: "This circle has ended. Mark who came.",
  recap: "Recap",
  edit: "Edit",
  guests: "Guests",
  yes: "Yes",
  notThisTime: "Not this time",
  tellThem: "Tell them",
  hosts: "Hosts",
  addCohost: "Add co-host",
  handOff: "Hand off",
  handOffSub: (name: string) => `Pass the circle to ${name}. You become a guest.`,
  handOffPick: "Pass the circle to…",
  handOffConfirm: "Pass it on",
  handOffPending: (name: string) => `Waiting for ${name} to take the circle. Until then nothing changes.`,
  writeToAll: "Write to everyone going",
  writePlaceholder: "One message to each person going",
  send: "Send",
  markCame: "Mark who came",
  nextMeeting: "Next meeting",
  nextMeetingSub: "Copy this circle to a new date. Guests aren't copied.",
  copyThis: "Copy circle",
  upcomingMeetings: "Upcoming meetings",
  copyLink: "Copy link",
  cancel: "Cancel circle",
  cancelSub: "Everyone going gets a note in their inbox.",
  cancelConfirm: "Cancel this circle",
  keepItGoing: "Keep it going?",
  keepItGoingSub: "Nobody came to the last 3 meetings, so this circle stopped repeating.",
  remindersTitle: "Reminders",
  remindersSub: "On for everyone going: a note in their inbox 1 day and 1 hour before.",
  reminderLog: (what: string, to: string, date: string) => `${what} · To: ${to} · Sent ${date}`,
} as const;

export const CAME = {
  headline: "Who was really there?",
  sub: "Only people who came count. This is what the village sees.",
  addSomeone: "Add someone who came",
  searchPlaceholder: "Search villagers by name",
  confirm: "Confirm",
  fixed: "This circle is fixed. People who came can no longer be changed.",
  note: (host: string, circle: string) => `${host} confirmed you came to ${circle}. Leave one line?`,
} as const;
