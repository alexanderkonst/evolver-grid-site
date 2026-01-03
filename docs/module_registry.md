# Module Registry

> LEGO blocks for the Planetary OS — Holonic modules from all aligned projects

---

## How This Works

Each **module** is a self-contained holon that:
- Does one thing well
- Can stand alone OR compose with others
- Has clear inputs and outputs
- Can come from any aligned project

This registry catalogs modules from our work AND other projects (Priroda, Holomovement, etc.) so we can:
1. See what exists
2. Identify gaps
3. Plan integrations
4. Avoid reinventing wheels

---

## Module Template

Copy this when adding a new module:

```yaml
## [Module Name]

Source: [Project/Team that created it]
Perspective: [Which of the 12 Planetary OS perspectives it serves]
Version: v0.1 | v0.2 | v1.0
Status: 🔵 Conceptual | 🟡 Building | 🟢 Ready | ⚪ External

### Description
What does this module do? One paragraph.

### Inputs
- What data/context does it need?
- What other modules does it depend on?

### Outputs
- What does it produce?
- What does it unlock?

### Integration Notes
How could this plug into the Member Portal?

### Contact
Who to talk to about this module.
```

---

## Our Modules (Member Portal of the Planetary OS)

### Zone of Genius Assessment

Source: Aleksandr / Member Portal
Perspective: #4 Gamified OS Engine, #6 Consciousness Evolution Academy
Version: v0.4
Status: 🟢 Ready

**Description**
Interactive assessment that helps users discover and articulate their unique genius — what they do better than anyone else. Based on ~81 talents from Enneagram and other frameworks. Creates the foundation of user identity in the system.

**Inputs**
- User attention (5-10 min)
- Optional: existing AI relationship for shortcut

**Outputs**
- Zone of Genius profile (archetype, talents, mastery action)
- First element of user identity
- Unlocks: matchmaking, personalized recommendations, genius offer creation

**Integration Notes**
Entry point for Venture Cooperative track. Can be white-labeled.

**Contact**
Aleksandr

---

### Quality of Life Map

Source: Aleksandr / Member Portal
Perspective: #4 Gamified OS Engine, #6 Consciousness Evolution Academy
Version: v0.3
Status: 🟢 Ready

**Description**
8-domain life assessment with 10 developmental stages per domain. Unlike simple "rate 1-10" wheels, each stage has descriptors so users can accurately self-identify. Produces visual map of current life state.

**Inputs**
- User attention (10-15 min)

**Outputs**
- Quality of Life profile (8 domains × stage)
- Visual wheel/map
- AI recommendations for weakest areas
- Unlocks: personalized practice recommendations

**Integration Notes**
Entry point for Academy track. Feeds recommendation engine.

**Contact**
Aleksandr

---

### Mission Discovery Tool

Source: Aleksandr / Member Portal
Perspective: #2 Joint Planetary Vision, #9 AI Holonic Matchmaking
Version: v0.3
Status: 🟢 Ready (separate tool)

**Description**
Hierarchical explorer of ~1000 planetary missions organized by: Domain → Focus Area → Challenge → Goal (2035) → Mission → Projects. Users drill down to find missions that resonate, then join mission chats.

**Inputs**
- User intention/interest

**Outputs**
- Chosen missions (saved to profile)
- Access to mission-specific communities
- Unlocks: matchmaking with mission-aligned people

**Integration Notes**
Standalone tool, needs to be integrated into main portal. Links to Telegram chats currently.

**Contact**
Aleksandr

---

### Asset Inventory System

Source: Aleksandr / Member Portal
Perspective: #7 Genius Economy Engine, #9 AI Holonic Matchmaking
Version: v0.2
Status: 🟡 Building (spreadsheet prototype)

**Description**
Structured inventory of user assets across 7 types: Expertise, Life Experiences, Networks, Material Resources, IP, Influence, Interests. Enables AI to match complementary assets across users.

**Inputs**
- User reflection on their resources

**Outputs**
- Asset inventory (saved to profile)
- Unlocks: asset-based matchmaking, monetization suggestions

**Integration Notes**
Currently Google Sheets. Needs UI and database integration.

**Contact**
Aleksandr

---

### Upgrade Skill Trees

Source: Aleksandr / Member Portal
Perspective: #4 Gamified OS Engine, #6 Consciousness Evolution Academy
Version: v0.2
Status: 🟡 Building

**Description**
5 developmental lines (Spirit, Mind, Emotions, Uniqueness, Body) with sequential upgrades. Each upgrade has prerequisites, unlocks next steps, and earns XP. Gamification layer over real personal development.

**Inputs**
- User profile (ZoG, QoL)
- Completed upgrades history

**Outputs**
- Next recommended upgrade
- Progress visualization
- XP/level tracking

**Integration Notes**
Core to the gamified experience. Needs upgrade database populated.

**Contact**
Aleksandr

---

### Practice Recommendation Engine

Source: Aleksandr / Member Portal
Perspective: #4 Gamified OS Engine, #8 Transformational Marketplace
Version: v0.2
Status: 🟡 Building

**Description**
AI-powered engine that recommends daily practices based on user profile. Targets weakest areas from QoL, aligns with ZoG direction. Draws from curated database of practices (public YouTube links).

**Inputs**
- User profile (ZoG, QoL, Evolutionary Address)
- Practice database

**Outputs**
- Daily recommended practice (one-click)
- Optional filters: duration, type, domain

**Integration Notes**
Needs practice database populated and curated.

**Contact**
Aleksandr

---

## Priroda Modules (Partner Project)

### Values Filter / Membrane

Source: Priroda
Perspective: #3 Holonic Toroidal Culture, #5 White-Label Community OS
Version: v0.2
Status: 🟡 Building

**Description**
Cultural onboarding system that ensures new members align with community values before entering. Uses 3 triads of values (Foundation: Wisdom/Service/Prosperity, State: Love/Sincerity/Freedom, Action: Transformation/Creation/Wholeness).

**Inputs**
- Applicant attention
- Values questionnaire or calls

**Outputs**
- Qualified community members
- Shared cultural foundation

**Integration Notes**
Could be adapted as white-label onboarding for any community in the portal.

**Contact**
Valentin (Priroda)

---

### Ecovillage Development Framework

Source: Priroda
Perspective: #5 White-Label Community OS, #11 Holonic DAO
Version: v0.3
Status: 🟡 Building (physical land acquired)

**Description**
End-to-end framework for physical settlement development: land acquisition, zoning, architecture, governance, community formation. Vernitsa project is the first implementation (1500 people, Karelian Isthmus).

**Inputs**
- Land
- Founding community
- Capital

**Outputs**
- Physical settlement infrastructure
- Governance systems
- Community culture

**Integration Notes**
Physical layer that digital modules support. Model for other settlements.

**Contact**
Priroda team

---

### Conscious Child Development Methodology

Source: Priroda
Perspective: #6 Consciousness Evolution Academy
Version: v0.2
Status: 🟡 Building (research phase)

**Description**
Synthesis of Waldorf, Montessori, Amonashvili, Shchetinin and other conscious education approaches. Research team developing integrated methodology for preschool and school age.

**Inputs**
- Children
- Trained facilitators
- Physical/digital learning environment

**Outputs**
- Developmentally-appropriate conscious education
- Next-generation humans

**Integration Notes**
Potential module for family-focused communities. Research could inform youth track in portal.

**Contact**
Priroda Children's Research Team

---

## External Modules (To Explore)

### Boardy.ai (AI Matchmaking)

Source: External (boardy.ai)
Perspective: #9 AI Holonic Matchmaking
Version: v1.0+
Status: ⚪ External (can integrate)

**Description**
AI matchmaker with 100k+ user database. Conversational interface where users describe themselves and projects, receives personalized introductions via email.

**Inputs**
- User profile description
- Project/need description

**Outputs**
- Curated introductions with context

**Integration Notes**
Could use directly OR build similar functionality internally. API may be available.

**Contact**
boardy.ai

---

### Sociocracy / S3 Governance

Source: Sociocracy 3.0
Perspective: #11 Holonic DAO
Version: v3.0
Status: ⚪ External (methodology)

**Description**
Governance methodology for distributed decision-making. Consent-based, role-focused, pattern-based. Widely adopted in conscious communities.

**Inputs**
- Group willing to adopt
- Training/facilitation

**Outputs**
- Decision-making protocols
- Role clarity
- Meeting formats

**Integration Notes**
Many communities already use. Could document as governance module option.

**Contact**
sociocracy30.org

---

## Gap Analysis

Modules we need but don't have yet:

| Gap | Perspective | Notes |
|-----|-------------|-------|
| Tokenization/Currency | #7 Genius Economy | Need web3 integration or simple credits system |
| Community Directory | #5 White-Label | Browsable list of participating communities |
| Event Calendar | Multiple | Cross-community event visibility |
| Marketplace | #8 Transformational | Product listings, transactions |
| DAO Governance UI | #11 Holonic DAO | Proposals, voting, treasury |

---

*Last updated: 2025-01-03*
