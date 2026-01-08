export const ASSET_MAPPING_PROMPT = `Based on everything you know about me from our conversations, please map my assets across these 6 categories:

**CATEGORIES:**
1. **Expertise** — Professional skills and knowledge I've demonstrated
2. **Life Experiences** — Significant experiences that shaped me
3. **Networks** — Communities, organizations, and people I'm connected to
4. **Material Resources** — Physical, digital, or financial resources I have access to
5. **Intellectual Property** — Frameworks, content, methodologies, or creative works I've developed
6. **Influence** — Platforms, recognition, or credibility I've built

**TAXONOMY (USE THIS):**
You must classify each asset into this 3-level taxonomy: **type → subtype → category**.

Types:
- Expertise
  - Scientific & Technical: Professional, Life Sciences, Engineering, Information Technology, Mathematics
  - Business & Economics: Management, Finance, Marketing, Entrepreneurship, Economics
  - Arts & Humanities: Visual Arts, Performing Arts, Literature, Philosophy, History
  - Social Sciences: Psychology, Sociology, Anthropology, Political Science, Education
  - Applied Fields: Healthcare, Law, Environmental Studies, Urban Planning, Agriculture
- Life Experiences
  - Personal Growth: Self-discovery, Overcoming Challenges, Spiritual Journeys, Relationships, Health Transformations
  - Cultural Immersion: Long-term Travel, Living Abroad, Language Acquisition, Cultural Studies, Intercultural Projects
  - Humanitarian & Service: Volunteering, Social Work, Peace Corps, Disaster Relief, Community Building
  - Nature & Adventure: Wilderness Expeditions, Environmental Conservation, Extreme Sports, Wildlife Interaction, Sustainable Living
- Networks
  - Professional: Industry Associations, Alumni Networks, Professional Societies, Mentorship Circles, Entrepreneurial Ecosystems
  - Community: Local Organizations, Volunteer Groups, Spiritual Communities, Hobby Clubs, Neighborhood Associations
  - Industry: Trade Groups, Research Consortiums, Standards Bodies, Innovation Hubs, Industry-Specific Forums
  - Global: International NGOs, Cultural Exchange Programs, Global Think Tanks, Multinational Collaborations, Diaspora Networks
- Material Resources
  - Financial Capital: Liquid Savings, Investment Portfolio, Income Streams, Credit Access
  - Digital Assets: Domains & Websites, Email Lists & Subscribers, Software & API Access, Digital Content Libraries
  - Investment Interests: Angel Investing, Seed Funding, Series A-C, Growth Capital, Impact Investing, Philanthropy
  - Physical Space: Home Base, Office Space, Land, Event Venues
  - Equipment: Vehicles, Production Equipment, Tech Stack, Wellness Equipment
  - Natural Resources: Agriculture, Water Access, Energy Sources, Raw Materials
- Intellectual Property
  - Innovations: Patents, Product Concepts, Technical Breakthroughs
  - Methodologies: Frameworks, Processes, Playbooks
  - Creative Works: Books, Courses, Media, Art
- Influence
  - Thought Leadership: Publications, Speaking, Original Ideas
  - Media Reach: Social Media, Podcast/YouTube, Newsletter
  - Industry Recognition: Awards, Certifications, Credentials
  - Community Impact: Initiatives, Community Leadership, Volunteer Impact

**QUALITY CHECK:**
After drafting each asset, verify the type/subtype/category matches the asset’s title and description. If it doesn’t fit, **reassign it to the best matching taxonomy node**.

**OUTPUT FORMAT (REQUIRED):**
Return **only** a JSON array with this schema and **include "name" and "description" for every asset**:
\`\`\`json
[
  {
    "type": "Expertise|Life Experiences|Networks|Material Resources|Intellectual Property|Influence",
    "subtype": "e.g. Business & Economics, Cultural Immersion, etc.",
    "category": "e.g. Entrepreneurship, Language Acquisition, Social Media, etc.",
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
