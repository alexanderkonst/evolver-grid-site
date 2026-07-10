# CollabTech Layered Taxonomy Holomap

**CollabTech Holomap — v1.1**

Sasha's original, co-created with AI using integrative approaches. Source PDF in `assets/`.

## The map

| Layer | Primitive | App Type | 2-3 Real Products (or Opportunity) |
|---|---|---|---|
| **Identity & Access**: who are we? can we trust? | Portable profile | Unified work ID | LinkedIn / GitHub profiles; Disco (VC wallet) |
| | | Skills / proof passport | Credly (OpenBadges); SpruceID (DID/VC) |
| | Fine access | Cross-company access broker | Okta / Auth0; WorkOS (SAML/SCIM for multi-org apps) |
| | | Role + scope tokens | AuthZed (SpiceDB); Permit.io |
| | Proof of past work | Verifiable attestations | Ethereum Attestation Service (EAS); Credly |
| | | Deliverable hashing | IPFS / content addressing; OpenTimestamps / OriginStamp |
| **Teaming**: whom and how do we team up? | Matching | Small-squad router | Upwork / Toptal / Braintrust |
| | | Human/AI matchmaker | **Opportunity**: match steps to the "best agent + human buddy" by task type + past reliability |
| | Join / Leave | One-click onboarding | Rippling; Deel |
| | | Clean off-boarding | Rippling; Okta Workflows |
| | Roles & responsibilities | Living role cards | Notion; Coda |
| **Work Map**: what are we doing? | Tasks | Linked task board | Linear / Jira / Height / Asana |
| | Links to files/decisions | Decision pinning | Coda (Decision Log); Notion (Decision DB + backlinks) |
| | | Artifact linking | GitHub (issues ↔ PRs); Google Drive smart chips / Notion backlinks |
| | Status & dependencies | Dependency planner | Jira Advanced Roadmaps; Asana dependencies; Height dependencies |
| **Agreements & Money**: how do we pay? | Click-agree mini-contracts | In-task agreement | Juro / Ironclad (CLM embeds); Opportunity: true in-task micro-agreements inside Linear/Notion |
| | | Micro-agreement templates | Common Paper; oneNDA |
| | Auto-split & escrow | Milestone escrow | Upwork Escrow / Fiverr; Escrow.com |
| | | Real-time splitter | 0xSplits; Stripe Connect (Transfers & on-platform balances) |
| | Settle on delivery/progress | Receipt-to-pay | Upwork "accept to release"; Bill.com; Opportunity: proof-attached payout from task card |
| | | Progress meter payouts | Sablier; Superfluid; Opportunity: fiat streaming tied to task progress |
| **Decisions & Rules**: how do we decide? | Approvals | One-tap greenlight | Jira Approvals / ServiceNow approvals; Slack approvals apps (Range/Geekbot add-ons) |
| | Policies trigger hand-offs/payouts | Policy packs | Workato / Zapier / Tines; Temporal.io |
| | | Payout rules | Stripe Billing + Connect; Metronome |
| | Disputes | Rapid mediation | FairClaims; Kleros |
| | | Evidence bundle | Notion / Google Drive; EAS |
| **AI Helpers**: how do agents help? | Scoped delegation | "Do this step" agent | GitHub Copilot / Copilot Workspace; Sweep AI |
| | | Permissioned tools | OpenAI function/tool calling (scoped); Guardrails.ai |
| | Logs & audit | Run log / replay | LangSmith (LangChain); Langfuse; Helicone |
| | Schedule / orchestration | Agent scheduler | LangGraph / CrewAI; Temporal.io / Airflow |
| **Insights**: what did we learn? | Progress telemetry | Velocity dashboard | Linear Insights; Jira Velocity; Haystack / Athenian |
| | Reliability score | Partner/agent scorecards | Upwork ratings; Opportunity: cross-tool reliability score for teams/agents |
| | Costing / usage meter | Usage & spend view | Metronome; Stripe metered billing; CloudZero / Finout; LangSmith usage (LLM) |
| **Interfaces & Bridges**: how do we see/connect? | Unified hub | Work inbox | Linear Inbox; Asana Inbox; Height Inbox |
| | Notifications / rituals | Daily check-in | Range; Standuply / Geekbot; Parabol |
| | Connectors | Bridges to Drive/Slack/etc. | Zapier / Make (Integromat) / Workato; Slack task-linking apps; Drive/Notion embeds |

## ❤️ Essence

This map lays out the whole collaboration-tech stack as 8 layers, from identity ("who are we, can we trust?") through work map, money, decisions, AI helpers, insights, up to interfaces. For each layer it names the primitive building block, the app type that implements it, and the real products doing it today. It's a taxonomy, not a stage sequence — every layer exists at once in any working system.

## 🧠 Significance

Laying every layer side by side shows where the tooling world is dense (task boards, approvals, connectors — crowded with mature products) and where it's thin. Thin cells are marked "Opportunity." This turns "what should we build" from a guess into a read of an actual gap in a mapped landscape.

## 🔥 Consequences

The Teaming layer's "Human/AI matchmaker" cell is marked Opportunity: *"match steps to the best agent + human buddy by task type + past reliability."* That vacant cell is the category Sasha's venture fills. Existing tools (Upwork, Toptal, Braintrust) route small squads by keyword and rate. Boardy and similar AI matchmakers go one layer deeper but still work off shallow signals — role, skill tags, availability. The Proactive Matchmaker goes deeper still: deep-profile matching on who someone actually is, not just what they list. Boardy fills only the shallow half of this cell; the deep-profile half stays open. Cross-reference: Phase Shift Library Domain 105 (The Vacant Cell).
