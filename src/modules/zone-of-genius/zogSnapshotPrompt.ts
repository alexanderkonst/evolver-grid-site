// ZoG Snapshot prompt — versioned. Active version exported as buildZogSnapshotPrompt.
// Prior versions kept for rollback, A/B testing, and signal-evolution audit.
//
// V1 (original): no paradigm-level definition; relies on AI's ambient understanding
// of "Top Talent."
// V2 (2026-04-24): adds Top Talent paradigm definition so the model articulates
// the irreducible signature pattern, not the resume layer.

export interface ZogSnapshotPromptPayload {
  top10Talents: { id: number; name: string; description: string }[];
  top3OrderedTalents: { id: number; name: string; description: string }[];
}

// ---------------------------------------------------------------------------
// TOP TALENT DEFINITION (paradigm-level)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// V1 — original (preserved for rollback / A-B)
// ---------------------------------------------------------------------------

export const buildZogSnapshotPromptV1 = (payload: ZogSnapshotPromptPayload): string => {
  return `You are helping a person integrate their Top Talent.
They have just completed an assessment where they selected their Top 10 talents and Top 3 core talents.
Use the information below to generate a short, premium, highly practical snapshot of their pattern.

INPUT:
Top 10 talents:
${JSON.stringify(payload.top10Talents, null, 2)}

Top 3 core talents in order (1 = strongest / most used):
${JSON.stringify(payload.top3OrderedTalents, null, 2)}

OUTPUT:
Write plain text (no markdown headings) with the following clearly labeled sections, in this exact order:

Archetype Title:
– 1 short phrase that names their Top Talent archetype. It should be 6 words or fewer, easy to say out loud, and feel like a character name (e.g., 'Ethical Architect of Systems').

Your Top Talent Description (3–4 rich sentences):
– What this genius naturally seeks or does when active.
– How it shows up when they are at their best.
– The unique value they bring to environments.
– Make this feel like a fuller character description, not just a summary.

Superpowers in Action (3 bullets max):
– Each bullet 1 sentence.
– Describe concrete ways this pattern shows up in daily life and work when they are at their best.

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
– Speak directly to 'you'.
– Avoid generic self-help clichés. Make it feel tailored, precise, and surprising.
– For Your Edge: be honest and sharp, but not cruel. Frame as "working skillfully with your own pattern."`.trim();
};

// ---------------------------------------------------------------------------
// V2 — active. Adds paradigm-level Top Talent definition.
// ---------------------------------------------------------------------------

export const buildZogSnapshotPromptV2 = (payload: ZogSnapshotPromptPayload): string => {
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
– 1 short phrase that names their Top Talent archetype. It should be 6 words or fewer, easy to say out loud, and feel like a character name (e.g., 'Ethical Architect of Systems').

Your Top Talent Description (3–4 rich sentences):
– What this genius naturally seeks or does when active.
– How it shows up when they are at their best.
– The unique value they bring to environments.
– Make this feel like a fuller character description, not just a summary.

Superpowers in Action (3 bullets max):
– Each bullet 1 sentence.
– Describe concrete ways this pattern shows up in daily life and work when they are at their best.

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
– Speak directly to 'you'.
– Avoid generic self-help clichés. Make it feel tailored, precise, and surprising.
– For Your Edge: be honest and sharp, but not cruel. Frame as "working skillfully with your own pattern."`.trim();
};

// Active version
export const buildZogSnapshotPrompt = buildZogSnapshotPromptV2;
