/**
 * Mini-training 2 · AI That Knows You: page copy.
 *
 * Source of truth: docs/02-strategy/ai-suite/mini-trainings/02-ai-that-knows-you-texts.md (draft v0.1,
 * Sasha's signature pending). The words below are copied from it unchanged; edit the doc first,
 * then this file.
 */

export type KnowsYouModuleCopy = {
  /** Micro-module number, 1–7. */
  n: number;
  title: string;
  /** The promise line, shown under the title. */
  promise: string;
  paragraphs: string[];
};

export const KNOWS_YOU_OPENING: string[] = [
  "In the last mini-training, AI got to know you through the game: your talents, your archetype, your mission. Here you take that knowledge with you. In about half an hour you'll write a one-page profile that makes any AI know you, and you'll learn three moves that make every answer better: name the goal, give the context, refine in cycles.",
  "Seven short steps. Each is one idea, a short video and a button. Watch the video first, then press the button. The question is already written; change it or say it by voice if you like.",
  "At the end your profile is saved on this device, ready to use in My AI."
];

export const KNOWS_YOU_MODULE_COPY: KnowsYouModuleCopy[] = [
  {
    "n": 1,
    "title": "Making yourself known",
    "promise": "You see why a stranger AI gives average answers.",
    "paragraphs": [
      "You just asked the same thing twice. The first time, AI knew nothing about you, so it gave advice that fits almost anyone: rest, plan, prioritise. Not wrong. Just average.",
      "The second time it knew your mission and what matters most to you right now. Same question, same minute, and the advice turned toward your life.",
      "That's what personalizing really is: making yourself known. AI can only be as good as what it knows about you. And it starts with you: the clearer you are about yourself, the more precisely AI can meet you. In the next steps you'll put that clarity on one page, so you never have to start from a stranger again."
    ]
  },
  {
    "n": 2,
    "title": "Bring it up to speed",
    "promise": "You stop hunting for clever words.",
    "paragraphs": [
      "Many people think good prompting is a magic formula: the right words in the right order. It isn't. A good prompt is what you'd tell a smart new colleague on their first day: who you are, what you're working on, what matters here, what you need back.",
      "So this time AI asked, and you answered, like a colleague being brought up to speed. Notice: you didn't need any clever words. You needed to talk about your own work, plainly.",
      "Look at what it knows about you now. That's the material for your profile."
    ]
  },
  {
    "n": 3,
    "title": "The one-page profile",
    "promise": "You have your profile on one page.",
    "paragraphs": [
      "Here it is: you, on one page. Five parts. Who you are and the roles you play. Your goals for the next 90 days. Your genius, said concretely, not vaguely. How you like answers: tone, length, format, language. And your limits.",
      "Read it slowly. Where AI guessed, it marked it. Fix what isn't you: press Edit or the microphone and tell it. The words matter more than the polish. Then press Save profile.",
      "This one page is what you can share in conversations with My AI. It's version 1.0. It will grow with you."
    ]
  },
  {
    "n": 4,
    "title": "The layer of «no»",
    "promise": "You set your limits once.",
    "paragraphs": [
      "A good colleague knows what to do. A trusted one also knows what never to do.",
      "Your profile now has a layer of «no»: what AI must never do for you, never assume, never touch. Maybe it's sharing what you tell it, deciding for you, or writing in a voice that isn't yours. You named it once, in your own words.",
      "That's what lets you hand over more without worry. Limits aren't a wall between you and AI. They're what make trust possible. Press Save profile so the «No» section stays with it."
    ]
  },
  {
    "n": 5,
    "title": "Goal, context, cycles",
    "promise": "You have one habit for any AI, any year.",
    "paragraphs": [
      "The tools will change every few months. Three principles will stay.",
      "Name the goal: what you actually want. Give the context: what matters here, what you already tried. Refine in cycles: the first answer is a draft, not a verdict.",
      "You just did all three. You said what you want. AI told you what it understood and what was missing. You filled the gap. That's the whole habit, and it works in any AI, any year."
    ]
  },
  {
    "n": 6,
    "title": "Roast, then next version",
    "promise": "You stop accepting the first answer.",
    "paragraphs": [
      "Clarity doesn't come in one step. It opens in layers.",
      "First you asked AI to roast your profile: to say honestly what is vague, missing or not quite true. It probably stung a little. Good. Then you asked for the next version. Put the two side by side. The second one is sharper, because the roast showed where to look.",
      "Roast, then next version. Use it on anything that matters: a plan, an email, an offer. Never stop at the first answer. Save the new version: it replaces the old one."
    ]
  },
  {
    "n": 7,
    "title": "Try it in My AI",
    "promise": "See how My AI understands your profile.",
    "paragraphs": [
      "Your profile is yours. It doesn't live inside one app.",
      "Some AIs remember you as you talk to them, across conversations. That's one kind of personalization. The other kind is stronger: you tell AI, on purpose, who you are, what you want and what your limits are. The two don't compete. But the second one goes with you.",
      "Copy your profile, open My AI, paste it, and read its answer. If it sounds like it knows you, you're done."
    ]
  }
];

export const KNOWS_YOU_CLOSING: string[] = [
  "Half an hour ago a new AI met you as a stranger. Now any AI can know you in ten seconds: your roles, your goals, your genius, how you like answers, and what it must never do.",
  "Your profile is saved on this device. Once a month, read it again and update what changed: it's a living document.",
  "Next step: bring your business into the same conversation."
];
