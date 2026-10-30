# Economy + AI market taxonomy — v0 (Oct 2026)

For the Evolutionary Mapping workstream. Compiled 2026-10-29 from public pages only (web fetch; no logins). Every category name is taken from a source as written. Anything I inferred or could not see is marked *unverified* or *inferred*. Dates are publication dates.

**Contents:** Part 1 Whole economy (ISIC Rev.5) · Part 2 CB Insights AI taxonomy, reverse-engineered · Part 3 Our AI-branch taxonomy v0 · Gaps · Part 4 Axis test: founder coaching

## Part 1. Top layers of the whole economy: ISIC Rev.5

Source: UN Statistics Division, ISIC Rev.5. The UN Statistical Commission endorsed it at its 54th session (2023), and the manual is in copyediting. Structure taken from the official CSV: https://unstats.un.org/unsd/classifications/Econ/Download/In%20Text/ISIC_Rev_5_english_structure.csv (linked from https://unstats.un.org/unsd/classifications/Econ/isic; explanatory notes XLSX dated 19 Aug 2026). NAICS column: 2022 NAICS structure, US Census Bureau, https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx. NAICS notes record only meaningful scope differences and are my reading of both structures.

**22 sections (A–V), 87 divisions.**

| Sec | ISIC Rev.5 section (L1) | Divisions (L2) | NAICS 2022 equivalent / meaningful difference |
|---|---|---|---|
| **A** | Agriculture, forestry and fishing | A01 Crop and animal production, hunting and related service activities; A02 Forestry and logging; A03 Fishing and aquaculture | 11 (NAICS adds hunting to sector name; same scope) |
| **B** | Mining and quarrying | B05 Mining of coal and lignite; B06 Extraction of crude petroleum and natural gas; B07 Mining of metal ores; B08 Other mining and quarrying; B09 Mining support service activities | 21 |
| **C** | Manufacturing | C10 Manufacture of food products; C11 Manufacture of beverages; C12 Manufacture of tobacco products; C13 Manufacture of textiles; C14 Manufacture of wearing apparel; C15 Manufacture of leather and related products; C16 Manufacture of wood and of products of wood and cork, except furniture; manufacture of articles of straw and plaiting materials; C17 Manufacture of paper and paper products; C18 Printing and reproduction of recorded media; C19 Manufacture of coke and refined petroleum products; C20 Manufacture of chemicals and chemical products; C21 Manufacture of basic pharmaceutical products and pharmaceutical preparations; C22 Manufacture of rubber and plastic products; C23 Manufacture of other non-metallic mineral products; C24 Manufacture of basic metals; C25 Manufacture of fabricated metal products, except machinery and equipment; C26 Manufacture of computer, electronic and optical products; C27 Manufacture of electrical equipment; C28 Manufacture of machinery and equipment n.e.c.; C29 Manufacture of motor vehicles, trailers and semi-trailers; C30 Manufacture of other transport equipment; C31 Manufacture of furniture; C32 Other manufacturing; C33 Repair, maintenance and installation of machinery and equipment | 31-33 |
| **D** | Electricity, gas, steam and air conditioning supply | D35 Electricity, gas, steam and air conditioning supply | 22 Utilities (NAICS 22 also includes water supply & sewerage = ISIC E36-37) |
| **E** | Water supply; sewerage, waste management and remediation activities | E36 Water collection, treatment and supply; E37 Sewerage; E38 Waste collection, treatment and disposal, and recovery activities; E39 Remediation and other waste management service activities | Split: water/sewerage → 22; waste mgmt & remediation → 562 inside 56 |
| **F** | Construction | F41 Construction of residential and non-residential buildings; F42 Civil engineering; F43 Specialized construction activities | 23 |
| **G** | Wholesale and retail trade | G46 Wholesale trade; G47 Retail trade | Split into 42 Wholesale and 44-45 Retail; ISIC G has no separate motor-vehicle-trade division in Rev.5 (only 46, 47) |
| **H** | Transportation and storage | H49 Land transport and transport via pipelines; H50 Water transport; H51 Air transport; H52 Warehousing and support activities for transportation; H53 Postal and courier activities | 48-49 |
| **I** | Accommodation and food service activities | I55 Accommodation; I56 Food and beverage service activities | 72 |
| **J** | Publishing, broadcasting, and content production and distribution activities | J58 Publishing activities; J59 Motion picture, video and television programme production, sound recording and music publishing activities; J60 Programming, broadcasting, news agency and other content distribution activities | 51 Information (512 film/sound, 513 publishing, 516 broadcasting & content providers); NAICS keeps J+K in one sector |
| **K** | Telecommunications, computer programming, consultancy, computing infrastructure, and other information service activities | K61 Telecommunications; K62 Computer programming, consultancy and related activities; K63 Computing infrastructure, data processing, hosting, and other information service activities | 51 Information (517 telecom, 518 computing infrastructure/hosting, 519 web search portals etc.); computer programming/consultancy sits in 5415 under 54, not 51 |
| **L** | Financial and insurance activities | L64 Financial service activities, except insurance and pension funding; L65 Insurance, reinsurance and pension funding, except compulsory social security; L66 Activities auxiliary to financial service and insurance activities | 52 |
| **M** | Real estate activities | M68 Real estate activities | 53 Real Estate AND Rental & Leasing (ISIC puts rental/leasing in O77) |
| **N** | Professional, scientific and technical activities | N69 Legal and accounting activities; N70 Activities of head offices; management consultancy activities; N71 Architectural and engineering activities; technical testing and analysis; N72 Scientific research and development; N73 Activities of advertising, market research and public relations; N74 Other professional, scientific and technical activities; N75 Veterinary activities | 54 Professional, scientific & technical; head offices → separate sector 55 Management of Companies |
| **O** | Administrative and support service activities | O77 Rental and leasing activities; O78 Employment activities; O79 Travel agency, tour operator, and other travel related activities; O80 Investigation and security activities; O81 Services to buildings and landscape activities; O82 Office administrative, office support and other business support activities | 56 Administrative & support (+ waste mgmt); rental/leasing → 53 |
| **P** | Public administration and defence; compulsory social security | P84 Public administration and defence; compulsory social security | 92 Public Administration |
| **Q** | Education | Q85 Education | 61 |
| **R** | Human health and social work activities | R86 Human health activities; R87 Residential care activities; R88 Social work activities without accommodation | 62 Health Care and Social Assistance |
| **S** | Arts, sports and recreation | S90 Arts creation and performing arts activities; S91 Library, archives, museum and other cultural activities; S92 Gambling and betting activities; S93 Sports activities and amusement and recreation activities | 71 Arts, Entertainment, and Recreation |
| **T** | Other service activities | T94 Activities of membership organizations; T95 Repair and maintenance of computers, personal and household goods, and motor vehicles and motorcycles; T96 Personal service activities | 81 Other Services (repair, personal, membership orgs; also private households 814) |
| **U** | Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use | U97 Activities of households as employers of domestic personnel; U98 Undifferentiated goods- and services-producing activities of private households for own use | 81 (814 Private households); own-use production not classified |
| **V** | Activities of extraterritorial organizations and bodies | V99 Activities of extraterritorial organizations and bodies | No NAICS equivalent (out of scope) |

## Part 2. CB Insights' public AI and frontier-tech taxonomy, reverse-engineered

### 2.0 Sources harvested

| Code | CB Insights page | Date | URL | What was harvestable |
|---|---|---|---|---|
| AI100-26 | AI 100 2026 | 2026-05-05 | https://www.cbinsights.com/research/report/artificial-intelligence-top-startups-2026 | Full category / sub-category / application tree in text + definitions |
| AGT-25N | The AI agent market map (Nov 2025) | 2025-11-10 | https://www.cbinsights.com/research/ai-agent-market-map-2025 | 16 categories (read from the map image https://research-assets.cbinsights.com/2025/11/10114220/ai-agent-market-map-112025_final.png) |
| AGT-25M | The AI agent market map, March 2025 edition | 2025-03-06 | https://www.cbinsights.com/research/ai-agent-market-map | 26 categories (map image https://research-assets.cbinsights.com/2025/03/12114022/AIAgentsMarketMap-032025-8.png) |
| STACK-25 | The AI agent tech stack | 2025-08-22 | https://www.cbinsights.com/research/ai-agent-tech-stack | 6 layers / 17 markets in text |
| PHYS-26 | The physical AI models market map | 2026-01-22 | https://www.cbinsights.com/research/the-physical-ai-models-market-map/ | 4 groups / 10 markets in text + image |
| DC-25 | The data center value chain market map | 2025-12-04 | https://www.cbinsights.com/research/report/data-center-value-chain-market-map | 7 layers / 45 markets in text |
| COM-25 | The agentic commerce market map (Nov 2025 ed.) | 2025-11-13 | https://www.cbinsights.com/research/report/agentic-commerce-market-map/ | 2 groups, journey stages, ~13 markets in text |
| HC-25 | Generative AI in healthcare & life sciences market map | 2025-03-11 | https://www.cbinsights.com/research/generative-ai-healthcare-life-sciences-market-map/ | 20 markets claimed; **only ~13 visible** (public image is cropped) |
| DRUG-25 | The AI in drug R&D market map | 2025-05-23 | https://www.cbinsights.com/research/ai-drug-research-development-market-map/ | 3 phases / 27 markets (image) |
| HUM-25 | The humanoid robots market map | 2025-06-26 | https://www.cbinsights.com/research/humanoid-robots-market-map/ | 8 use cases claimed; **5 visible** (public image is the cropped feature image) |
| MFG-26 | The manufacturing robotics market map | 2026-06-12 | https://www.cbinsights.com/research/the-manufacturing-robotics-market-map/ | 4 groups in text; **14 market names not in public text** |
| TOP-25 | Our top AI market maps of 2025 | 2025-12-17 | https://www.cbinsights.com/research/top-ai-market-maps-2025/ | Meta-grouping of their AI research: AI agent ecosystem / AI infrastructure / Industry applications / Flagship rankings |

Not harvested: Fintech 100 2026 (2026-10-28, https://www.cbinsights.com/research/report/top-fintech-startups-2026/): says "21 categories", but the names are only in an image I could not fetch. Physical AI 50 is listed on the cbinsights.com homepage as a ranking (unverified: no public report page found). GenAI in financial services market map (55 companies) is referenced on the GenAI hub; not fetched.

### 2.1 AI 100 2026: the master tree (L1 category → L2 sub-category → L3 application)

| L1 category | L2 sub-category | L3 application (only under Infrastructure) |
|---|---|---|
| Enterprise applications | Customer support; Cyber & physical security; HR; Marketing; Productivity & enterprise workflows; Sales; Software development & coding tools | — |
| Industry applications | Financial services; Healthcare & life sciences; Industrials; Legal; Consumer & retail | — |
| Infrastructure & compute | Data | Synthetic data; Data preparation & curation; Vector databases |
| | Development & deployment | Models; AI development & orchestration; Model deployment; Monetization |
| | Hardware & computing | Chips; Servers; Computing infrastructure |
| | Observability & evaluation | AI observability & governance; Model & agent security; Fine-tuning; LLM benchmarking & model routing |
| **Physical AI (new top-level in 2026)** | Robotics software & models; Robots & enabling hardware | — |

Text also names the market "Know Your Agent (KYA) software" and "coordinating heterogeneous fleets" as CBI platform markets.

### 2.2 AI agents: two editions of the application map

| Group | Nov 2025 (16 categories) | March 2025 (26 categories) |
|---|---|---|
| Infrastructure | *(moved out to STACK-25)* | AI agent development platforms; Multi-agent & orchestration; Authentication; Web search & tool use; Data curation; Payments; Memory; Evaluation & observability; Voice |
| Enterprise / horizontal ("Enterprise tech" in Nov; "Core enterprise use cases" in Mar) | Productivity & personal assistants; HR & people operations; Workflow automation & knowledge management; Sales & marketing; Cybersecurity & IT operations; Software development; Customer service; Finance, accounting, & procurement; Market research & intelligence; Legal operations & compliance; Data analytics & business intelligence | Productivity & personal assistants; General enterprise workflows; Customer service; Software development; Data analysis; Accounting; Cybersecurity; Sales; HR; Marketing; Web research & data extraction |
| Industry-specific | Healthcare & life sciences; Retail & hospitality; Industrials; Financial services & insurance; Legal | Financial services & insurance; Supply chain & logistics; Legal & compliance; Gaming; Healthcare; Industrials |

Linked CBI platform markets named in AGT-25N text: Data analytics, Coding, Finance and accounting, Sales, Marketing, Customer service, Recruiting, Security operations centers, Legal (in-house), IT operations & support, AI agent builder platforms.

### 2.3 AI agent tech stack (STACK-25): 6 layers, 17 markets (16 named in text)

| Layer | Markets |
|---|---|
| Foundation models & infrastructure | LLM developers; Model deployment & serving |
| Agent frameworks & development platforms | AI agent development platforms (developer frameworks & platforms; low-code platforms); Voice; Payments infrastructure |
| Tool integration | Browser infrastructure; AI web search APIs & scrapers; Tool libraries & integration platforms |
| Context | LLM data preparation platforms; Vector databases; Memory management |
| Orchestration | Multi-agent systems & orchestration; LLM benchmarking & model routing |
| Oversight | Authentication platforms; Security & risk management platforms; Observability, evaluation, & governance |

White-space markets they flag (not yet categories): AI agent marketplaces; AI agent monetization; Cost management.

### 2.4 Agentic commerce (COM-25)

| Group | Stage | Markets |
|---|---|---|
| AI agent tech stack | — | Multi-agent systems & orchestration; AI agent observability, evaluation, & governance; Vector databases, AI agent memory management, data streaming platforms; AI agent authentication platforms; Know your agent (KYA) (seen on the interactive map https://www.cbinsights.com/learn/agentic-commerce-market-map, 2026-02-09) |
| Commerce solutions | Discovery | GEO monitoring platforms; GEO content platforms |
| | Consideration | AI shopping agents; Product information management; MCP servers for retail |
| | Purchase | Agentic checkout; AI agent payments infrastructure |
| | Service | Customer service AI agents & copilots |

### 2.5 AI infrastructure: data center value chain (DC-25), 7 layers / 45 markets

| Layer | Sub-group → markets |
|---|---|
| Power generation | Next-gen nuclear: Nuclear fusion developers; SMR developers; Molten salt reactor developers · Renewables: Geothermal power providers · Storage: BESS providers |
| AI computing hardware | Specialized: NPUs; AI training processors; AI inference processors; AI accelerator modules · General-purpose: GPUs; CPUs; DPUs |
| Supporting hardware infrastructure | Cooling: Immersion cooling; Direct liquid cooling · Ops software: DCIM; Energy optimization software; Demand flexibility solutions · Platforms: HCI platforms; Virtual power plant providers |
| Networking & connectivity | Security: NDR; Network firewalls · Core: DDI (DNS, DHCP & IPAM); Managed authoritative DNS; WAN optimization · Delivery: CDN; Interconnection fabric services; Network digital twin & verification software |
| Data storage & database infrastructure | Vector databases; Real-time database platforms; NoSQL databases; RDBMS; In-memory data stores; Data streaming platforms; Message queue software & services; Software-defined storage |
| AI cloud services | Cloud management platforms; Cloud monitoring platforms; Cloud migration & modernization; Cloud storage providers; Cloud GPU; AI security |
| Data center facilities & operations | Edge & micro data centers; Hyperscale data center providers; Modular & prefabricated data centers; Space-based data centers |

### 2.6 Physical AI

| Map | Group | Markets |
|---|---|---|
| PHYS-26 | Data & simulation | Synthetic training data — robotics; Robot demonstration data providers; Robotics simulation platforms |
| | Model approaches | Vision language model (VLM) developers; Vision-language-action (VLA) model developers; World model AI developers |
| | Foundation models | Robot foundation model developers; Autonomous driving foundation model developers; Multi-robot coordination model developers |
| | Observability | Robotics observability platforms |
| HUM-25 | Hardware systems (use cases) | Industrial humanoid robot developers; Home assistance humanoid robot developers; Laboratory R&D humanoid robot developers; Healthcare humanoid robot developers; Customer service humanoid robot developers; *+3 not visible in public image (unverified)* |
| MFG-26 | 4 groups (14 markets, names not public) | Perception & sensing systems; Robot software; Mobile robots; Stationary robots & systems |
| Other CBI maps cited inside State of Venture 2025 (https://www.cbinsights.com/research/report/venture-trends-2025, 2026-01-08), not fetched | — | Autonomous driving market map; Drone tech market map; Automated warehouse market map (TOP-25); "Industrial humanoid robot developers" and "UAVs for ISR" as named markets in State of AI Q1'26 (https://www.cbinsights.com/research/report/ai-trends-q1-2026/, 2026-04-14) |

### 2.7 Healthcare & life sciences AI

| Map | Group | Markets |
|---|---|---|
| HC-25 (partial) | Healthcare | AI model developers; Clinical documentation solutions; Supply chain management; Revenue cycle management → Prior authorization software / Automated & assisted coding / End-to-end platforms / Claims optimization platforms; Radiology → Radiology workflow automation / Radiology diagnostics; Synthetic patient data; Call center solutions; *remaining ~7 markets incl. life-sciences block not visible (unverified)* |
| DRUG-25 | Discovery → Discovery engines | AI-derived small molecule drugs; AI-derived biological drugs; AI-powered drug repurposing platforms |
| | Discovery → Software platforms | AI drug target identification platforms; AI protein engineering platforms; AI molecular design platforms; Cell & tissue analysis for drug discovery; AI antibody design platforms; Quantum computing for drug discovery |
| | Preclinical development | Drug development strategy & compliance platforms; Drug analytical chemistry platforms; Pharmaceutical material science software; Toxicology & in vivo studies platforms; In vivo simulations software; Computational platforms for drug formulation; Drug process chemistry software |
| | Clinical development | Clinical trial data analytics platforms; Protocol design & optimization tools; Decentralized clinical trial platforms; Clinical trial management systems; AI in pharmaceutical manufacturing; EHR-based patient recruitment platforms; Clinical trial regulatory solutions; Trial recruitment optimization tools; Clinical trial supply management; Patient-facing trial discovery platforms; AI-enabled pharmacovigilance |

### 2.8 Inferred CB Insights scheme

| Dimension | Inference (evidence) |
|---|---|
| Levels | Four. **Sector / research area** (AI, Industrials, Healthcare & Life Sciences, Financial Services…; site nav) → **Segment** on a map (Enterprise / Industry / Infrastructure / Physical AI; or a value-chain layer) → **Category** (a box on the map) → **Market** (atomic unit: "1,500+ markets" on the homepage, "1,700+ evolving markets"; each has an app.cbinsights.com/market-report/ID). Maps are **views** that regroup the same market atoms; e.g. Vector databases appear in AI100-26, STACK-25, COM-25 and DC-25. |
| Market naming | Atomic markets are **"[object/tech] + [actor noun]"**: "…developers", "…platforms", "…providers", "…solutions", "…software", "…tools" (e.g. "World model AI developers", "Clinical trial management systems"). Groupings above that are **function or industry nouns** ("Sales & marketing", "Healthcare & life sciences"), often paired with "&". |
| Horizontal vs vertical | The fixed split is **Enterprise (horizontal, by job function) vs Industry (vertical, by sector)**. Horizontal = industry-agnostic job functions; vertical = "data, compliance requirements, and workflows of a single industry". "X for Y" appears only at market level, as a suffix ("…for drug discovery", "MCP servers for retail", "…for robotics"). |
| Infrastructure | Split by **stack layer**, bottom-up: hardware/compute → models → data/context → dev & orchestration → oversight (observability, security, identity). Agent infra is its own stack (STACK-25) apart from general genAI infra. For physical sectors they use a **value chain** (power → chips → … → facilities) or a **workflow pipeline** (data → models → foundation models → observability; discovery → preclinical → clinical; discovery → consideration → purchase → service). |
| New in 2025–26 | **Physical AI** as a top-level AI 100 category (2026, 11 companies); agent **oversight/identity** (Know Your Agent, authentication, model & agent security); **Monetization** and **Agent payments**; **GEO**; **World models, VLA, multi-robot coordination**; **space-based data centers**; power generation (fusion, SMR) pulled into AI infra. Between the March and Nov 2025 agent maps, infrastructure was moved out to its own map and categories were merged (Sales + Marketing; Accounting → Finance, accounting & procurement), with **Gaming dropped** and **Retail & hospitality** added. |
| Selection rule | Inclusion is by Mosaic score threshold (400–700 depending on map) and funding recency; categories are "not mutually exclusive" and a company sits in its "primary focus". |

## Part 3. Our AI-branch taxonomy v0 (domain → market → niche)

Other public maps used:

| Code | Map | Date | URL |
|---|---|---|---|
| MEN-25 | Menlo Ventures, 2025: The State of Generative AI in the Enterprise | 2025-12-09 | https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/ |
| MAD-25 | FirstMark / Matt Turck, 2025 MAD (ML, AI & Data) Landscape | 2025-10-28 | https://mad.firstmark.com/ · https://mattturck.com/mad2025 |
| BVP-25 | Bessemer, The State of AI 2025 (roadmaps) | 2025-08-12 | https://www.bvp.com/atlas/the-state-of-ai-2025 |
| A16Z-25 | a16z × Mercury, The AI Application Spending Report | 2025-10-02 | https://a16z.com/the-ai-application-spending-report-where-startup-dollars-really-go/ |

Legend: CBI codes as in Part 2 (AI100-26, AGT-25N, AGT-25M, STACK-25, DC-25, PHYS-26, COM-25, HC-25, DRUG-25, HUM-25, MFG-26). "ours" means a niche no source names as such and that I added to close a gap (unverified as a market).

### 3.0 Domains (L1) and their anchor in the whole economy (Part 1)

| # | Domain | What it covers | ISIC Rev.5 anchor |
|---|---|---|---|
| D1 | Energy & compute substrate | Power, chips, servers, data centers, AI cloud | D35, C26, C27, K63, F42 |
| D2 | Models | Frontier and specialised models across modalities | K62/K63, N72 |
| D3 | Data & context | Training data, retrieval, memory, external data | K63, N72 |
| D4 | Build, run & orchestrate | Dev platforms, agent frameworks, tools, serving, routing | K62, K63 |
| D5 | Trust & oversight | Evals, observability, security, identity, governance | K62, O80, N69 |
| D6 | Agent economy rails | Payments, commerce, marketplaces, monetization, discovery | L64/L66, G47, N73 |
| D7 | Horizontal applications | Cross-role assistants and creation tools | K62, J58 |
| D8 | Functional applications | One business function, any industry | N69–N73, O78, O82, K62 |
| D9 | Industry applications | One industry's data, rules and workflows | maps 1:1 to ISIC sections (see market column) |
| D10 | Physical AI | Machines that perceive and act in the world | C28, C29, C30, H49–H52 |
| D11 | Consumer AI | Products for individuals outside work | S, T96, Q85, J60 |

### 3.1 Taxonomy table

| Domain | Market (L2) | Niche (L3) | Sources | turn: outer → inner → outer-anew |
|---|---|---|---|---|
| D1 | Power for AI | Nuclear fusion; SMR; Molten salt reactors; Geothermal; Battery storage (BESS); Virtual power plants; Demand flexibility | DC-25 | |
| D1 | AI chips | AI training processors; AI inference processors; NPUs; Accelerator modules; GPUs; CPUs; DPUs; Chip-design agents | DC-25, AI100-26, MAD-25 (AI Hardware); chip-design agents: AI100-26 (ChipAgents, inferred) | |
| D1 | Servers & DC hardware | AI servers; Immersion cooling; Direct liquid cooling; HCI | AI100-26, DC-25 | |
| D1 | Data center facilities & ops | Hyperscale DCs; Edge/micro DCs; Modular/prefab DCs; Space-based DCs; DCIM; Energy optimization software | DC-25 | |
| D1 | Networking | Interconnection fabric; CDN; WAN optimization; DDI/DNS; Network digital twin; NDR/firewalls | DC-25 | |
| D1 | AI cloud & GPU compute | Cloud GPU / neoclouds; Computing infrastructure (workload distribution); Cloud management & monitoring; Cloud storage | DC-25, AI100-26, MAD-25 (GPU Cloud / Deployment Infra), MEN-25 | |
| D2 | Frontier LLMs / foundation model APIs | General LLMs; Reasoning models; Open-weight models | STACK-25 (LLM developers), AI100-26 (Models), MEN-25 (Foundation model APIs), BVP-25 (Model layer) | |
| D2 | Media & multimodal models | Image; Video; Audio/voice & speech models; 3D | AI100-26 (Black Forest Labs, Moonvalley in Models), MAD-25 (Speech & Voice AI; Computer Vision), BVP-25 (generative video prediction) | |
| D2 | World & spatial models | World model developers; Spatial intelligence | PHYS-26, AI100-26 (Moonlake, Ami Labs, inferred) | |
| D2 | On-device / edge models | Local LLM runtimes; Edge AI | MAD-25, MEN-25 (prediction) | |
| D2 | AI research labs | Commercial AI R&D; Non-profit/academic | MAD-25 | |
| D3 | Training data | Synthetic data; Data generation & labelling; Expert/human data; Data preparation & curation | AI100-26, MAD-25, STACK-25 (LLM data preparation platforms), AGT-25M (Data curation) | |
| D3 | Retrieval & storage for AI | Vector databases; Unstructured & vector ETL; Graph DBs; Real-time/streaming platforms | AI100-26, STACK-25, DC-25, MAD-25, COM-25 | |
| D3 | Agent memory & context | Memory management; Context engineering | STACK-25, AGT-25M, BVP-25 ("Memory, context and beyond") | |
| D3 | External data access | AI web search APIs & scrapers; Web search & crawl APIs; Data marketplaces; Company/people enrichment; Geospatial/alt data | STACK-25, AGT-25M, MAD-25 (Data Sources & APIs) | |
| D4 | AI / agent development platforms | Developer frameworks & SDKs; Low-code/no-code agent builders; Enterprise AI platforms | STACK-25, AGT-25M, AGT-25N (AI agent builder platforms), MAD-25, AI100-26 (AI development & orchestration) | |
| D4 | Multi-agent orchestration | Multi-agent systems; Agent-to-agent protocols (A2A, ACP) | STACK-25, AGT-25M, COM-25 | |
| D4 | Tool integration | Tool libraries & integration platforms / MCP servers; Browser infrastructure; Code sandboxes & agent computers | STACK-25, AGT-25M, BVP-25 (MCP); sandboxes: AI100-26 (E2B, inferred), MAD-25 (Agent Infra/Tooling) | |
| D4 | Model deployment & inference | Model serving; Inference platforms; Inference runtimes | AI100-26, STACK-25, MAD-25, MEN-25 | |
| D4 | Model adaptation & training infra | Fine-tuning; Model training infrastructure; RL environments | AI100-26, MEN-25; RL environments: ours | |
| D4 | Routing & experimentation | LLM benchmarking & model routing; Prompt management | AI100-26, STACK-25, MAD-25 | |
| D4 | Voice agent infrastructure | Voice AI development platforms; Voice testing | STACK-25, AGT-25M | |
| D4 | MLOps & data science | MLOps; Data science platforms | MAD-25 | |
| D5 | Observability & evaluation | AI observability; Evals; Tracing; Voice-agent testing; Cost management | AI100-26, STACK-25, AGT-25M, MAD-25, MEN-25, BVP-25 (evals prediction); cost mgmt: STACK-25 white space | |
| D5 | AI & agent security | Model & agent security; Continuous red teaming; Runtime protection | AI100-26, STACK-25, MAD-25 (AI Safety & Security), DC-25 (AI security) | |
| D5 | Agent identity | Authentication platforms; Know Your Agent (KYA) | STACK-25, AGT-25M, COM-25, AI100-26 (text) | |
| D5 | Governance & interpretability | AI & agent governance; Compliance; Interpretability | AI100-26, MAD-25, MEN-25 (prediction: explainability) | |
| D6 | Agent payments | AI agent payments infrastructure; Agentic checkout; Agent wallets / virtual cards | STACK-25, COM-25, AGT-25M | |
| D6 | Agentic commerce | AI shopping agents; Product information management; MCP servers for retail | COM-25 | |
| D6 | AI discovery (GEO) | GEO monitoring; GEO content | COM-25, AI100-26 (Profound, Bluefish in Marketing, inferred) | |
| D6 | Agent marketplaces & monetization | Agent marketplaces; AI monetization/billing; Tokenized agents | AI100-26 (Monetization), STACK-25 (white space) | |
| D7 | General assistants & copilots | General LLM assistants; Enterprise copilots | MEN-25 (Copilots), A16Z-25, BVP-25, AGT-25N (Productivity & personal assistants) | |
| D7 | Agent platforms & workflow automation | Horizontal agent platforms; Agentic RPA; Workflow automation | MEN-25 (Agent platforms), MAD-25, AGT-25N, AI100-26 (Productivity & enterprise workflows) | |
| D7 | Knowledge & search | Enterprise search; Text, docs & knowledge agents; AI workspaces | AGT-25N, MAD-25, BVP-25, A16Z-25 | |
| D7 | Personal productivity | Meeting notetakers; Email; Browser agents | MEN-25, A16Z-25, BVP-25 (browser prediction) | |
| D7 | Creative & media generation | Image; Video; Audio; Avatars; 3D/animation/gaming | A16Z-25, MAD-25 (Media Generation; 3D/Animation/Gaming) | |
| D7 | Vibe coding / app builders | AI app builders; Prototyping | A16Z-25, MEN-25 | |
| D8 | Software development | Code completion; Code agents; Code review & testing; SRE/incident; Design-to-code; Docs | AI100-26, AGT-25N/M, MEN-25, MAD-25, BVP-25 | |
| D8 | Customer service | Support agents; Contact-center voice; Multimodal service agents | AI100-26, AGT-25N/M, MAD-25, MEN-25, COM-25 | |
| D8 | Sales | Prospecting & enrichment; AI SDR; Revenue workflows | AI100-26, AGT-25N/M, MEN-25, MAD-25 | |
| D8 | Marketing | Content generation; Campaign optimization; Ad creative | AI100-26, AGT-25N/M, MEN-25, MAD-25 | |
| D8 | HR & talent | Recruiting; Workforce management; Employee experience | AI100-26, AGT-25N/M, MEN-25, MAD-25 | |
| D8 | Finance, accounting & procurement | Accounting close; AP/AR & collections; Procurement; AI-native ERP; FinOps & risk | AGT-25N/M, MEN-25, MAD-25, BVP-25 (ERP) | |
| D8 | Legal (in-house) & compliance | Contract management; Legal ops; Compliance workflows | AGT-25N, MAD-25 | |
| D8 | Security operations | SOC agents; AppSec agents; Cyber & physical security | AI100-26, AGT-25N/M | |
| D8 | IT operations | IT support agents; Incident response | AGT-25N, MEN-25 | |
| D8 | Data analytics & BI | Text-to-SQL / analyst agents; Semantic layer; Product analytics | AGT-25N/M, MAD-25 | |
| D8 | Market research & intelligence | Research agents; Synthetic respondents / simulation | AGT-25N, AGT-25M (Web research & data extraction), MEN-25 | |
| D8 | Design | Design generation | MEN-25 | |
| D9 | Healthcare (ISIC R86) | Clinical documentation / ambient scribes; RCM (prior auth, coding, claims); Call centers & patient access; Radiology workflow & diagnostics; Healthcare model developers; Supply chain; Synthetic patient data | HC-25, AGT-25N, AI100-26, MEN-25, MAD-25 | |
| D9 | Drug R&D & life sciences (ISIC C21, N72) | Discovery engines (small molecules, biologics, repurposing); Target ID; Protein/antibody/molecular design; Cell & tissue analysis; Quantum for drug discovery; Preclinical (tox, formulation, process chemistry, in-vivo simulation); Clinical (trial analytics, protocol design, recruitment, DCT, CTMS, regulatory, pharmacovigilance); Pharma manufacturing | DRUG-25, AI100-26 | |
| D9 | Financial services & insurance (ISIC L) | Investment research; Loan servicing & collections; Financial-crime / compliance; Insurance sales & support; Wealth advisory | AI100-26, AGT-25N/M, MAD-25 | |
| D9 | Legal (ISIC N69) | Legal research; Document & contract analysis; Litigation / case lifecycle | AI100-26, AGT-25N/M, MEN-25 | |
| D9 | Industrials & engineering (ISIC C, N71) | Engineering/CAD copilots; Manufacturing optimization; Materials discovery; Nuclear/regulatory | AI100-26, AGT-25N, MAD-25 | |
| D9 | Supply chain & logistics (ISIC H) | Freight & brokerage agents; Warehouse automation software | AGT-25M, AGT-25N (Industrials) | |
| D9 | Construction & real estate (ISIC F, M) | Construction automation; Space planning | TOP-25 (280 AI companies in construction), AI100-26 (Qbiq, inferred) | |
| D9 | Retail & hospitality (ISIC G47, I) | Shopping & personalization; Restaurant & hotel agents; Fashion design | AGT-25N, AI100-26 | |
| D9 | Government & defense (ISIC P84) | Govtech; Defense AI; ISR | TOP-25 (310+ AI in government), MAD-25, MEN-25 | |
| D9 | Media, creator & gaming (ISIC J, S) | Creator tools; Game agents | MEN-25, AGT-25M (Gaming) | |
| D9 | Education (ISIC Q85) | — (named by Menlo as a vertical; no niche data) | MEN-25 (mention only) | |
| D10 | Physical AI data & simulation | Synthetic robotics data; Robot demonstration data / teleoperation; Robotics simulation | PHYS-26 | |
| D10 | Physical AI models | VLMs; VLAs; World models; Robot foundation models; Autonomous driving foundation models; Multi-robot coordination | PHYS-26, AI100-26 (Robotics software & models) | |
| D10 | Robot ops & observability | Robotics observability; Fleet orchestration | PHYS-26, AI100-26 (text: heterogeneous fleets) | |
| D10 | Humanoids | Industrial; Home assistance; Lab R&D; Healthcare; Customer service; +3 unverified | HUM-25, AI100-26 | |
| D10 | Manufacturing robotics | Perception & sensing; Robot software; Mobile robots; Stationary robots & systems | MFG-26 | |
| D10 | Autonomous mobility | Robotaxis / AVs; Autonomous trucking & delivery; Autonomous vessels; Drones/UAVs | PHYS-26, AI100-26, venture-trends-2025 (refs) | |
| D10 | Robot enabling hardware | Edge AI chips for robots; Actuators/sensors | AI100-26 (BOS Semiconductors, inferred), MAD-25 (Robotics, Autonomy & Industrial) | |
| D11 | Consumer assistants | Everyday assistants; Purpose-built assistants | BVP-25, A16Z-25 | |
| D11 | Consumer creation | Image/video/audio apps; Avatars | A16Z-25, BVP-25 | |
| D11 | Companionship & social | AI companions; AI-native social | BVP-25 (prediction), ours | |
| D11 | Learning & health for individuals | AI tutors; Consumer health / cash-pay clinical AI | ours; BVP State of Health AI 2026 (https://www.bvp.com/atlas/state-of-health-ai-2026, not fetched) | |

## Gaps and caveats

| Gap | Effect | Next step |
|---|---|---|
| CBI's 1,500–1,700 market atoms sit behind login (app.cbinsights.com/market-report/ID); only names shown on public maps were harvested | Part 2 is a sample of their market universe (~190 names), not the full tree | Sign in to CBI, or use its MCP/API if Sasha has access |
| HC-25, HUM-25, MFG-26 and Fintech 100 2026 publish their category names only in images that are cropped or that I could not fetch | 7 healthcare markets, 3 humanoid use cases, 14 manufacturing-robotics markets and 21 fintech categories are missing | Get the full images from the downloadable reports (email-gated) |
| No public CBI maps were fetched for AV/drones, defense, climate/energy AI, education or consumer AI | D9 Government/Education and D11 are thin and lean on VC sources | Fetch CBI's autonomous driving, drone, defense and climate maps |
| a16z consumer taxonomy was read only from report text (Top 100 7th ed. 2026-10, spending report 2025-10); Bessemer from roadmap headings only; Menlo's departmental, vertical and stack maps are images I did not read | A few niche names in Part 3 may be missing | Read the Menlo market-map images and Bessemer roadmap pages |
| ISIC ↔ AI-domain anchors (Part 3.0) are my mapping | Inferred | Check against the ISIC explanatory notes for K62/K63/N72 |
| The "turn" column is empty on purpose | — | Score it in the next pass |

## Part 4. Axis test: founder coaching (2026-10-29)

First test of the inner-turn axis (Technology 177, approved by Sasha 2026-10-29) on one niche. Public pages only, fetched 2026-10-29; no logins, no contact with anyone. Each company is scored on what its program and offer pages say it does, not on funding or size. The sample is 15 players I picked by hand. Some of the boutiques came from a search for "inside-out" founder coaching, so the sample over-represents stage 3 compared with the market (*inferred*). Read the counts as a test of the rubric, not as market shares.

**Axis.** 1 = outer: sells external tactics and results only (growth, fundraising, accountability, KPIs). 2 = inner: works on the founder's inner state or identity (psychology, somatics, purpose, shadow), separate from business mechanics. 3 = outer anew: inner work brought back into business form (identity or uniqueness becomes the product, strategy, team or offer, with business outcomes traced to the inner shift).

### 4.1 Where the niche sits in the classifications

| System | Code and title as the source writes it | Fit | Source |
|---|---|---|---|
| ISIC Rev.5 | N 70 "Activities of head offices; management consultancy activities" → 702 / **7020 "Business and other management consultancy activities"** | Main home for 1:1 founder and CEO coaching. The class note covers "advice, guidance and operational assistance… on management issues" and never mentions coaching. | Official structure CSV (Part 1); UNSD note: https://unstats.un.org/unsd/classifications/Econ/Detail/EN/27/7020 |
| ISIC Rev.5 | Q 85 → **8559 "Other education n.e.c."** | Cohort programs, bootcamps and workshops (*inferred*) | Official structure CSV |
| ISIC Rev.5 | T 96 → **9690 "Other personal service activities n.e.c."** | Personal-growth retreats such as Hoffman (*inferred*) | Official structure CSV |
| NAICS 2022 | **541611 "Administrative Management and General Management Consulting Services"**. Index entries include "Business management consulting services" and "Business start-up consulting services". | Main home (stage 1 firms fit it best) | https://www.census.gov/naics/?details=541611&year=2022 · 2022 NAICS Index File |
| NAICS 2022 | **611430 "Professional and Management Development Training"** (index: "Management development training") | Cohorts, workshops, Vistage-style programs (*inferred*) | 2022 NAICS Index File |
| NAICS 2022 | **541612 "Human Resources Consulting Services"** (index: "Organization development consulting services") | Team and culture coaching (CLG, Reboot for Organizations) (*inferred*) | 2022 NAICS Index File |

**Finding:** neither classification has a code for coaching. The 2022 NAICS index has no entry with "coach" in the executive sense; the only match is doula services under 812990. In the official taxonomies the niche is invisible: it is spread across management consulting, education and personal services. In Part 3 it appears only as AI coaching (BetterUp Grow, CoachHub AIMY™) under D8 HR & talent.

### 4.2 Players scored

| # | Player | What they sell (from their page) | Stage | Evidence (quote) | Conf. |
|---|---|---|---|---|---|
| 1 | Marshall Goldsmith Stakeholder Centered Coaching (mgscc.net) | Coaching on one leadership behavior, re-rated by stakeholders; coach certification | **1** | "You believe behavioral change is more valuable than mindset shifts." (https://mgscc.net/certification/) | high |
| 2 | EOS Worldwide (eosworldwide.com) | Operating system plus Implementers: Vision, Traction, Healthy | **1** | "Bring discipline and accountability to your organization — execute on your vision every 90 days." (https://www.eosworldwide.com/traction-component) | high |
| 3 | Scaling Up (scalingup.com) | Certified coaches, One-Page Strategic Plan, Scoreboard software | **1** | "The 4 DECISIONS™ methodology… PEOPLE, STRATEGY, EXECUTION, CASH" (https://scalingup.com/) | high |
| 4 | Vistage (vistage.com) | CEO peer advisory groups led by Chairs | **1** | "Grow faster and outlast the competition with Vistage." (https://www.vistage.com) | high |
| 5 | Mochary Method (mocharymethod.com) | 1:1 and team coaching for startup CEOs, from $10K/month | **1** | "uses its proven playbooks and proprietary software to help the world's best startup operators" (https://www.mocharymethod.com) | med |
| 6 | BetterUp (betterup.com) | Enterprise human plus AI coaching platform with "performance intelligence" | **1** | "connects your people investment to CEO-friendly metrics like manager effectiveness, attrition, and productivity" (https://www.betterup.com/) | med |
| 7 | CoachHub (coachhub.com) | Enterprise digital, AI and executive coaching | **1** | "Move minds and metrics… Track real-time performance data" (https://www.coachhub.com/) | med |
| 8 | Hoffman Institute (hoffmaninstitute.org) | Week-long residential Process, $6,950 | **2** | "helps participants identify negative behaviors, moods, and ways of thinking that developed unconsciously and were conditioned in childhood" (https://www.hoffmaninstitute.org/the-process/) | high |
| 9 | Hendricks Institute (hendricks.com) | Zone of Genius and conscious-love programs | **2** | "Discover your unique zone of genius to live with more purpose, passion, and inspiration." (https://hendricks.com/) No business offer seen. | low |
| 10 | Reboot (reboot.io) | CEO, co-founder and team coaching; bootcamps; 360s | **3** (3a) | "Your own psychology now scales… At five people, this was a personality trait. At two hundred, it's culture." (https://www.reboot.io/ceo-coaching/) | med |
| 11 | Conscious Leadership Group (conscious.is) | 15 Commitments; individual, team and culture programs | **3** (3a) | "We build trust, speed up decisions, and create cultures where people own outcomes" (https://conscious.is/) | med |
| 12 | Inside-Out Leadership (leadinsideout.io) | Founder-coaches for early and mid-stage CEOs | **3** (3a) | "the radical self-inquiry required to scale into executive leaders… architect high scale, low-drama companies from founding to exit" (https://www.leadinsideout.io/) | med |
| 13 | Strategic Coach (strategiccoach.com) | Quarterly entrepreneur program (owners with ≥$200K net income), Unique Ability® | **3** (3a/3b) | "Unique Ability is the special mix of talents, passions, and energy that makes you who you are. It's how you create the most value" (https://uniqueability.com) | med |
| 14 | Ryan Pink, Entrepreneur's Edge™ (ryanpink.com) | 1:1 coaching for founders at $1–5M revenue | **3** (3b, staged) | "A 2-Phase Process - Moving From Inner to Outer… Vision Realignment… Strategic Focus… Joyful Execution" (https://www.ryanpink.com/) | high |
| 15 | Nina Chin, INCOMPARABLE (ninachin.com) | Group mentorship for founders and creatives | **3** (3b) | "build what only you could build. Your offer. Your methodology… Your business." (https://ninachin.com/incomparable-cocoon) | med |

### 4.3 Distribution

- **Stage 1: 7** (MGSCC, EOS, Scaling Up, Vistage, Mochary, BetterUp, CoachHub). These are the large networks and platforms, with 290 to 3,500+ coaches each.
- **Stage 2: 2** (Hoffman, Hendricks).
- **Stage 3: 6**, all boutiques or mid-size firms. 4 are 3a, where the inner work goes into leadership, team and culture (Reboot, CLG, Inside-Out, Strategic Coach). 2 are 3b, where it goes into the offer or strategy (Ryan Pink, Nina Chin).
- Scale runs opposite to the turn. Every player with enterprise scale is stage 1, and inner work there serves outer metrics (*inferred* from the pages read). Hardly anyone does 3b, where the founder's uniqueness becomes the product or offer, and those who do are solo practitioners.

### 4.4 Stage-3 leaders (guild candidates; no outreach without Sasha's yes)

1. **Reboot** (Jerry Colonna): the deepest inner work with the most business evidence. Its case studies follow founders through IPOs and exits as "identity, relational, and organizational" passages.
2. **Conscious Leadership Group**: the most codified bridge. The 15 Commitments and somatic work feed into culture and decision speed, with CEO testimonials on business effects.
3. **Strategic Coach / Unique Ability**: the only scaled player that makes uniqueness the organizing unit of the business (roles, team, "Who Not How").
4. **Ryan Pink, Entrepreneur's Edge**: the clearest stage 2→3 program design, an explicit inner phase followed by an outer phase (vision, strategy, execution).
5. **Inside-Out Leadership**: founder-coaches who pair self-inquiry with how the company is architected.

Nina Chin is the purest 3b case. She is left out of the top five because the method rests on Human Design and astrology (see 4.5).

### 4.5 What the axis failed to capture

1. **3a vs 3b.** "Business form" lumps together leadership, team and culture (where most stage 3 lives) with the offer, product and strategy (where almost no one lives). The single stage hides the main finding.
2. **Inner as means vs inner as end.** BetterUp and CoachHub coach mindsets, resilience and well-being, but sell them as workforce metrics. Stage 1 says "external tactics only", which is not quite true for them. They are inner methods used for an outer purpose.
3. **Who pays.** Enterprise HR buys, the employee receives. The buyer's framing (KPIs) drives the page, not the session. Founder-paid firms read more inner.
4. **Validity.** The axis scores direction, not whether the method works. An astrology-based 3b and an evidence-based 3a currently get the same score. No one publishes inner shift → business outcome beyond testimonials. MGSCC measures, but only outer behavior (*inferred* from pages read).
5. **Network variance.** For Vistage, Scaling Up, SCC and EOS the stage belongs to the method. Individual Chairs or coaches can sit at 2 or 3 (*inferred*).
6. **Half-steps.** EOS "Healthy" and the Scaling Up One Page Personal Plan are inner modules inside outer systems (1.5). Reboot starts clients from outer problems and goes inward.

### 4.6 Suggested rubric refinements

1. **Split stage 3** into **3a**: inner → leadership, team or culture, and **3b**: inner or identity → offer, product or strategy. Guild core = 3b plus strong 3a. Allow 1.5 and 2.5.
2. **Evidence ladder.** Use program structure or curriculum first, then case studies, then testimonials, then taglines. Each score cites at least one program or offer page. "Inside-out" and "transformation" in a tagline count for nothing on their own.
3. **Three side columns, kept off the stage score:** *validity* (evidence-based / mixed / esoteric), *payer* (founder / enterprise), and *inner-as* (means / end). Together with 3a/3b they let the map separate real turners from inner-washing.
