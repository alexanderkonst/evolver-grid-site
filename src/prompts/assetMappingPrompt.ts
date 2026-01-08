export const ASSET_MAPPING_PROMPT = `Based on everything you know about me from our conversations, please map my assets across these 6 categories:

**CATEGORIES:**
1. **Expertise** — Professional skills and knowledge I've demonstrated
2. **Life Experiences** — Significant experiences that shaped me
3. **Networks** — Communities, organizations, and people I'm connected to
4. **Material Resources** — Physical, digital, or financial resources I have access to
5. **Intellectual Property** — Frameworks, content, methodologies, or creative works I've developed
6. **Influence** — Platforms, recognition, or credibility I've built

**OUTPUT FORMAT (REQUIRED):**
Return **only** a JSON array with this schema and **include "name" and "description" for every asset**:
\`\`\`json
[
  {
    "category": "Expertise|Life Experiences|Networks|Material Resources|Intellectual Property|Influence",
    "subcategory": "e.g. Business & Economics, Cultural Immersion, etc.",
    "name": "Asset name",
    "description": "Brief description (1 sentence)",
    "leverage_score": 1-10,
    "leverage_reason": "Why this asset is high/low leverage"
  }
]
\`\`\`

**DE-DUPLICATION:**
Merge near-duplicates into a single asset. Prefer the most specific wording and fold similar items into the description.

**LEVERAGE SCORING:**
Rate each asset 1-10 based on:
- **Revenue potential** — How quickly could this generate income?
- **Strategic compounding** — Does this asset multiply the value of other assets?
- **Uniqueness** — How rare is this in the market?

Be comprehensive — include everything you've learned about my skills, resources, connections, and interests. Sort the final list by leverage_score (highest first).

I'm using this to map my assets in a personal development tool for potential collaborations and projects.`;
