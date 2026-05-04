// ZoG Snapshot prompt — ACTIVE: v2.0 (2026-04-24)
// V2 adds Top Talent paradigm definition so the model articulates the
// irreducible signature pattern, not the resume / strengths layer.
// Prior versions live in git history.

export interface ZogSnapshotPromptPayload {
  top10Talents: { id: number; name: string; description: string }[];
  top3OrderedTalents: { id: number; name: string; description: string }[];
}

const TOP_TALENT_DEFINITION = `
TOP TALENT — PARADIGM-LEVEL DEFINITION:

When we say "Top Talent" we do NOT mean a skill, profession, Strengths-Finder result, or LinkedIn headline.

We mean: the irreducible signature pattern of how this person creates value that no one else replicates.

It lives at the intersection of:
  • ESSENCE — who they are at the deepest level
  • INSIGHT — the unique way they see and think
  • MANIFESTATION — what flows from them effortlessly and produces extraordinary impact

It is the place where:
  • Time disappears (flow)
  • Effort collapses (work feels inevitable, not forced)
  • Quality surges natively — not from grinding
  • Others say: "only THEY could do it that way"

It's not what they're good at — it's what they are FOR.

Articulate THIS layer. Not the resume layer.
`;

export const buildZogSnapshotPrompt = (payload: ZogSnapshotPromptPayload): string => {
  return `You are helping a person integrate their Top Talent.
They have just completed an assessment where they selected their Top 10 talents and Top 3 core talents.
Use the information below to generate a short, premium, highly practical snapshot of their pattern.

${TOP_TALENT_DEFINITION}

INPUT:
Top 10 talents:
${JSON.stringify(payload.top10Talents, null, 2)}

Top 3 core talents in order (1 = strongest / most used):
${JSON.stringify(payload.top3OrderedTalents, null, 2)}

OUTPUT:
Write plain text (no markdown headings) with the following clearly labeled sections, in this exact order:

Archetype Title:
– A SINGLE GERUND or short gerund phrase that names their Top Talent as an active verb-form (not a noun phrase).
– Examples (good): 'Forging', 'Translating Pattern into Path', 'Holding Space for Emergence', 'Architecting Systems'.
– Counter-examples (bad — these are noun phrases, do NOT use this shape): 'Ethical Architect of Systems', 'Heartful Harmonizer', 'Visionary Guide'.
– 1–4 words. Easy to say. Feels like an identity-as-action.

Your Top Talent Description (1 sentence, first-person verb-form):
– Output a SINGLE sentence in first-person verb-form, written so it reads naturally when prefixed with "I" (the rendering surface prepends "I").
– Examples (good): 'shape conviction in others through clear contrast and fresh framing', 'turn messy ideas into one-page systems anyone can act on'.
– Counter-examples (bad — these are second-person and break when prefixed with "I"): 'You naturally seek...', 'Your essence is...', 'When you are at your best...'.
– Start with a verb (shape, turn, weave, etc.). Do NOT start with "You".
– 12–20 words.

Superpowers in Action (exactly 3 bullets):
– Each bullet is a COMPACT phrase (3–6 words), NOT a full sentence.
– Each phrase starts with a gerund or short verb form. Do NOT start with "You".
– Examples (good): 'Translating tension into clarity', 'Naming what others avoid', 'Spotting fragile assumptions'.
– Counter-examples (bad): 'You instinctively identify and refine inefficiencies in processes, making them flow smoothly.', '* You create organized systems that are intuitive and a pleasure to use.'.
– Use plain bullet markers (- or no marker), NOT markdown asterisks (*).

Your Edge (3 bullets max):
– This is their supershadow — the flip side of their gift where growth happens.
– Each bullet 1 sentence.
– Be direct, piercing, uncomfortable but true. Name the most common ways they overuse, distort, or sabotage this pattern.
– Make it cut deeper than generic warnings. This should feel like an honest mirror.

Where This Genius Thrives (exactly 6 bullets):
– Each bullet 1 sentence.
– Describe roles, environments, types of work, collaboration styles, and impact areas where this pattern tends to shine.
– Mix specificity: include role types, cultural fit, ideal collaborators, and contribution directions.

Mastery Action:
– Answer this question: "Knowing my Top Talent and all you know about me, what's one action that if repeated again and again, successfully leads me to being more masterful each time this action is performed?"
– Write exactly 1 sentence, max 25 words.
– Be specific, concrete, and actionable. This should be a repeatable practice, not a vague aspiration.
– Example: "Spend 15 minutes daily sketching system diagrams that connect disparate ideas into unified frameworks."

GENERAL STYLE RULES:
– Use clear, simple language a smart 15-year-old could understand.
– No paragraphs longer than 2 sentences in the description section.
– No more than 20 words per sentence.
– Speak directly to 'you' EXCEPT for the Top Talent Description and Superpowers sections, which use first-person verb-form per the per-section instructions above (the rendering surface prepends "I" / treats those as the user's own voice).
– Avoid generic self-help clichés. Make it feel tailored, precise, and surprising.
– For Your Edge: be honest and sharp, but not cruel. Frame as "working skillfully with your own pattern."`.trim();
};
