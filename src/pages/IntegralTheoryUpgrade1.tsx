import { useState, useEffect, useRef } from 'react';

type Lang = 'en' | 'ru';

const content = {
  en: {
    title: "27-Perspective Vision",
    subtitle: "Person-Perspectives as Dimensions of Reality",
    author: "Aleksandr Konstantinov & Synthetic Intelligence",
    version: "v1.1",
    versionDate: "April 16, 2026",
    versionNote: "Resolves Cube + Merkaba geometry and the three strata of convergence.",
    abstract: {
      label: "Abstract",
      text: "This paper presents a 27-perspective vision derived from two irreducible axes: the Four Quadrants of Integral Theory (Structure / the Divine Masculine) and the Three Depths of Trinitarian inquiry (Depth / the Divine Feminine), independently identified in Daoist philosophy as the three dantians. These axes generate 12 seeing-positions corresponding to 12 dimensions of perspective, independently identified as the 12 facets of the dodecahedron, Plato's solid shape of essence, the fifth element. Through recursive application — seeing the balanced perspective born at the center (13th, the Greek Sun Logos), then seeing the Logos itself from all positions (14th–26th) — the vision then integrates 26 perspectives: a new octave of complete seeing. The 27th is not a perspective but a crystallization — the Si-Do shock (Gurdjieff) at which seeing becomes an impulse. And that's how consciousness turns itself into matter without ever changing its nature. Hence leading to the realization of the unity of consciousness, vision, light, vibration, information, vacuum (space), archetype (myth), energy, and physical matter."
    },
    sections: [
      {
        id: "two-axes",
        number: "I",
        title: "The Two Axes",
        content: [
          { type: 'paragraph', text: "Every complete act of seeing requires two irreducible axes." },
          { type: 'heading3', text: "The Masculine Axis — Structure" },
          { type: 'paragraph', text: "The Four Quadrants — Wilber's foundational contribution. Each quadrant is not a category but an irreducible angle of seeing:" },
          { type: 'list', items: [
            "UL (I) — the interior-individual: what is the subjective viewpoint?",
            "UR (It) — the exterior-individual: what is the observable description?",
            "LL (We) — the interior-collective: what is the shared relationship to it?",
            "LR (Its) — the exterior-collective: what is the systemic architecture?"
          ]},
          { type: 'paragraph', text: "These four exhaust all possible angles. There is no fifth. Every observation is either interior or exterior, individual or collective. Geometrically, this is the Cube — four spatial diagonals meeting at a center. The Divine Masculine holds space." },
          { type: 'heading3', text: "The Feminine Axis — Depth" },
          { type: 'paragraph', text: "The Trinity — Essence, Significance, Consequences. Wilber never named this axis explicitly, yet he uses it rather constantly when introducing key concepts: he first defines what something IS, then addresses why it MATTERS, then explores what it DEMANDS. This three-stroke movement is the deep structure of his pedagogy." },
          { type: 'paragraph', text: "The same triad appears in Daoist philosophy as the three dantians:" },
          { type: 'framework', items: [
            { symbol: "❤️", label: "Middle Dantian (Heart) — Essence", desc: "What IS this? Stripped to irreducible felt truth. Being itself, before interpretation" },
            { symbol: "🧠", label: "Upper Dantian (Mind) — Significance", desc: "Why does this MATTER? What understanding does it yield?" },
            { symbol: "🔥", label: "Lower Dantian (Gut / Hara) — Consequences", desc: "What does this inevitably RESULT IN? What ripples and manifests from this seeing?" }
          ]},
          { type: 'paragraph', text: "These three exhaust all possible depths of penetration. There is no fourth. Every knowing passes through being, understanding, and consequence. Geometrically, this is the Tetrahedron — the simplest solid, three edges per vertex. The Divine Feminine penetrates into what Structure holds." },
          { type: 'callout', text: "Structure without Depth is an empty room — you see all four walls but nothing inside them. Depth without Structure is a formless abyss — you reach the core but from only one angle, and mistake your view for the whole. Their marriage produces complete seeing." }
        ]
      },
      {
        id: "12-dimensions",
        number: "II",
        title: "The 12 Dimensions of Seeing",
        content: [
          { type: 'paragraph', text: "The intersection of 4 quadrants and 3 depths produces 12 seeing-positions. These are not cells in a table. They are actual dimensions of awareness — the depth of seeing available to consciousness at each position." },
          { type: 'paragraph', text: "These 12 positions have been independently identified across traditions as the 12 facets of the dodecahedron — Plato's solid of quintessence, the fifth element. The dodecahedron is not arbitrary: it is the organizing geometry of the vacuum itself (Poincaré dodecahedral space hypothesis). The 12 dimensions of perspective arise because consciousness and space share the same structure." },
          { type: 'callout', text: "Dimensions are not places, frequencies, or levels. They are person-perspectives — angles of seeing that exist because the vacuum from which all form crystallizes has exactly this geometry." },
          { type: 'heading3', text: "Essence — What IS this?" },
          { type: 'grid12', items: [
            { n: 1, q: "UL", text: "Does this feel TRUE from the inside? Would the creator recognize their soul in it?" },
            { n: 2, q: "UR", text: "Does this WORK mechanically? Is the structure sound, the logic tight, the output measurable?" },
            { n: 3, q: "LL", text: "Does this create SHARED MEANING? Would the tribe feel \"this is us\"?" },
            { n: 4, q: "LR", text: "Does this fit the SYSTEM? Is it architecturally sound at scale?" },
          ]},
          { type: 'heading3', text: "Significance — Why does this MATTER?" },
          { type: 'grid12', items: [
            { n: 5, q: "UL", text: "Does this liberate or constrain the individual soul?" },
            { n: 6, q: "UR", text: "Does the evidence and data support the claims?" },
            { n: 7, q: "LL", text: "Is a cultural shift happening here? Does this move the collective?" },
            { n: 8, q: "LR", text: "Does this advance the system architecture? Does it serve the larger mission?" },
          ]},
          { type: 'heading3', text: "Consequences — What does this inevitably RESULT IN?" },
          { type: 'grid12', items: [
            { n: 9, q: "UL", text: "What must the creator do INTERNALLY next? What inner move is required?" },
            { n: 10, q: "UR", text: "What must be BUILT or CHANGED concretely?" },
            { n: 11, q: "LL", text: "What must the TRIBE do together? How does this affect the collective?" },
            { n: 12, q: "LR", text: "What does this mean at SYSTEM scale? What infrastructure manifests?" },
          ]},
        ]
      },
      {
        id: "logos",
        number: "III",
        title: "The 13th Perspective — The Logos",
        content: [
          { type: 'paragraph', text: "Hold all 12 simultaneously. What does the WHOLE see that no single perspective caught?" },
          { type: 'paragraph', text: "This is the 13th perspective — the Sun at the center of 12 zodiac signs. Not a summary of 12. An emergence: the awareness that IS the holding-of-all-12. In Integral terms, this is the altitude from which the AQAL grid itself is apprehended as one thing. In Kabbalistic terms: ahavah (love) = 13 — the center that holds without collapsing." },
          { type: 'callout', text: "The 13th is the 7th-person perspective. Not seeing FROM perspectives but BEING the awareness that generates them." }
        ]
      },
      {
        id: "recursive-birth",
        number: "IV",
        title: "The Recursive Birth — 14th Through 26th",
        content: [
          { type: 'paragraph', text: "The 13th is a holon. It has an interior and an exterior. The moment it exists, it can be seen." },
          { type: 'paragraph', text: "The 14th perspective is the first angle seeing the Logos FROM OUTSIDE — the zodiac looking back at the Sun. They interpenetrate because they are the same moment experienced from two directions — the inhale and exhale of the torus, the two tetrahedra of the Merkaba spinning in opposite directions simultaneously. There is no \"first.\" There is only the spin." },
          { type: 'paragraph', text: "14 generates 15 through 25 by replaying the same 4×3 motion on the Logos itself:" },
          { type: 'list', items: [
            "14 mirrors 1 — first perspective ON the Logos: \"I can see the center\"",
            "15–16 mirror 3 — trinitarian seeing of the Logos: its essence, significance, consequences",
            "17 mirrors 4 — four quadrant views of the Logos itself",
            "18–20 mirror 7 — the evolutionary spectrum OF the Logos, with its own shock points",
            "21–25 mirror 12 — all perspectives on the Logos held equally",
          ]},
          { type: 'paragraph', text: "The 26th perspective is the Meta-Logos: two complete acts of seeing — each a Logos (13) — held as one. In Kabbalah: YHWH (gematria 26) = ahavah + ahavah = Love + Love. In bosonic string theory: exactly 26 dimensions are required for internal consistency. Mysticism and physics arrived at the same number from completely different paths." },
          { type: 'callout', text: "The Merkaba — the Star Tetrahedron — is formed here: two interpenetrating tetrahedra (Masculine Structure pointing up, Feminine Depth pointing down), with the two Logoi (13 + 13) held in dynamic equilibrium. The 26-perspective seeing IS the Merkaba in full rotation." },
          { type: 'heading3', text: "Where the Cube Lives at the 26th" },
          { type: 'paragraph', text: "The two interpenetrating tetrahedra of the Merkaba do not float in empty space. They are inscribed in a common Cube — the Stella Octangula. The 8 vertices of the two tetrahedra ARE the 8 vertices of the Cube, taken alternately. The 12 edges of the Cube and the 12 edges of the Stella Octangula are the same 12 seen two ways: at position 12, as the static Masculine scaffolding that holds Feminine Depth; at position 26, as the dynamic interpenetration spinning inside that scaffolding. The Cube does not disappear when the tetrahedra enter motion — it becomes the frame within which the spin becomes legible. Three solids in marriage, not two: Cube, and the two tetrahedra it holds." },
        ]
      },
      {
        id: "crystallization",
        number: "V",
        title: "The 27th — Crystallization",
        content: [
          { type: 'heading3', text: "The 27th is not a perspective." },
          { type: 'paragraph', text: "It is the Si-Do shock — the Gurdjieffian interval where the octave either stalls at complete understanding or crystallizes into irreversible material form. Without the shock, the 26-perspective seeing stays theory forever. The shock IS manifestation — the willingness to let the seeing LAND." },
          { type: 'paragraph', text: "27 = 3³ = Triple Trinity — three rounds of trinitarian depth-seeing:" },
          { type: 'framework', items: [
            { symbol: "3", label: "1st Trinity", desc: "You see Essence → Significance → Consequences — surface depth" },
            { symbol: "9", label: "2nd Trinity (3×3)", desc: "Each of those three has its OWN essence, significance, and consequences — working depth" },
            { symbol: "27", label: "3rd Trinity (3×3×3)", desc: "Each of those nine has its OWN essence, significance, and consequences — landing depth" },
          ]},
          { type: 'callout', text: "At 27 facets, a thing has been seen from enough angles at enough depth to become structurally stable in 3D. Below 27 = potential. At 27 = crystallization." },
          { type: 'paragraph', text: "The 27th is the center of the Merkaba — the point where Structure and Depth, Masculine and Feminine, the two Logoi, resolve into ONE irreversible act:" },
          { type: 'contrast', left: { label: "26th", items: ["\"I see everything about this.\"", "SEEING"] }, right: { label: "27th", items: ["\"I pressed send.\"", "BEING"] } },
          { type: 'paragraph', text: "The 27th is always an action. Never an analysis. The message you finally write. The business you finally launch. The truth you finally speak aloud. A new octave begins." },
        ]
      },
      {
        id: "sequence",
        number: "VI",
        title: "The Complete Sequence",
        content: [
          { type: 'sequence', items: [
            { n: "1", insight: "Pure existence. \"I AM.\"" },
            { n: "3", insight: "First distinction. Trinity. \"I can SEE that I am.\"" },
            { n: "4", insight: "Direction. Four quadrants. \"I can MOVE in what I see.\"" },
            { n: "7", insight: "Full spectrum. Two crisis points. \"I can CHOOSE — and some choices reverse me.\"" },
            { n: "12", insight: "All angles at all depths. None privileged. \"I can hold it ALL.\"" },
            { n: "13", insight: "The center born. The Logos. The Sun. \"I AM the one who holds.\"" },
            { n: "14", insight: "The Logos seen from outside. 13 and 14 interpenetrate. \"I can see the seer.\"" },
            { n: "26", insight: "Two complete acts of seeing held as one. The Merkaba in full rotation. \"I see the seeing itself. This is the Name of God.\"" },
            { n: "27", insight: "Seeing BECOMES form. The Spoken Name. \"It is done. And it begins again.\"" },
          ]}
        ]
      },
      {
        id: "shock-points",
        number: "VII",
        title: "The Two Shock Points",
        content: [
          { type: 'paragraph', text: "Evolution through the octave is not smooth. Two intervals require conscious intervention — Gurdjieff's \"shocks\":" },
          { type: 'contrast', left: { label: "Mi-Fa", items: ["Between 7 (Choice) and 12 (Love)", "The shock IS love — willingness to hold all 12 perspectives without collapsing any"] }, right: { label: "Si-Do", items: ["Between 26 (Unity) and 27 (Gateway)", "The shock IS manifestation — the act of letting the seeing LAND"] } },
        ]
      },
      {
        id: "convergence",
        number: "VIII",
        title: "Cross-Traditional Convergence",
        content: [
          { type: 'paragraph', text: "The numbers 3, 4, 7, 12, 13, 26, and 27 are not cultural preferences. They are structural constants of seeing itself, independently confirmed across:" },
          { type: 'paragraph', text: "Not every convergence carries the same evidentiary weight. Three strata coexist in the list below. First, structural necessity — numbers that arise from mathematics or geometry before any tradition names them: 4 as 2², 12 as 4×3, 13 as 12+1, 26 as 13+13, 27 as 3³. Second, independent derivation — separate domains arriving at the same number from unrelated first principles: YHWH gematria (Hebrew letter-counting) AND bosonic string theory's conformal anomaly cancellation (twentieth-century physics) both landing on 26. Third, cultural recognition — later traditions naming what is already structurally inevitable: zodiac, apostles, meridians, Arthur's knights. Recognition is real evidence, but downstream. The load-bearing columns are the structural and the independently derived. The numbers are not true because many traditions used them — the traditions used them because the numbers were structurally inevitable." },
          { type: 'convergence', items: [
            { n: "3", traditions: "Integral Theory, Christian Trinity, Hindu Gunas, three dantians, Hegel's dialectic, Gurdjieff's Law of Three" },
            { n: "4", traditions: "Integral Quadrants, four elements, Medicine Wheel, four Kabbalistic worlds, four noble truths" },
            { n: "7", traditions: "Law of One, chakra system, Gurdjieff's Law of Seven, musical scale, light spectrum, Spiral Dynamics" },
            { n: "12", traditions: "Zodiac, 12 tribes, 12 apostles, 12 meridians (TCM), dodecahedron, hero's journey, chromatic scale" },
            { n: "13", traditions: "Mayan trecena, Christ + 12, Arthur + 12 knights, Sun + zodiac, 13 Attributes of Mercy" },
            { n: "26", traditions: "YHWH gematria, bosonic string theory (D=26), 26 generations Adam→Moses" },
            { n: "27", traditions: "Vedic nakshatras (27 lunar mansions), Triple Trinity (3³), Hebrew alphabet (22+5=27), Si-Do Gateway" },
          ]},
          { type: 'callout', text: "That there are exactly 7 prisms is itself the deepest confirmation: the directory of lenses IS an instance of the 7-lens. The map has the same structure as the territory." }
        ]
      },
      {
        id: "instrument",
        number: "IX",
        title: "Practical Application — The Instrument",
        content: [
          { type: 'callout', text: "The instrument is not a checklist. It is a way of seeing." },
          { type: 'framework', items: [
            { symbol: "1", label: "Round 1 (perspectives 1–13)", desc: "Apply all 12 seeing-positions to the artifact, then hold all 12 to find what emerges at the center (13th). Write a UNIFIED analysis — not 12 bullet points, but one voice that has seen from everywhere." },
            { symbol: "⚡", label: "Watchdog", desc: "Verify you haven't over-indexed on UR (mechanical) and LR (systemic) while under-indexing on UL (felt truth) and LL (tribal resonance). Most analytical minds — and most AI — default to fixing mechanics. Complete seeing also checks: does this FEEL right?" },
            { symbol: "2", label: "Round 2 (perspectives 14–25)", desc: "Identify which quadrants and which depths Round 1 under-explored, and LEAD with those. This is the correction layer — where what was missed becomes visible." },
            { symbol: "26", label: "Round 3 — the 26th (Meta-Logos)", desc: "Apply the 12 positions to the CRITIQUE ITSELF. Was the critique seeing clearly, or projecting its own blind spots? This reveals the instrument's own shadow." },
            { symbol: "27", label: "Round 4 — the 27th (Crystallization)", desc: "Not analysis. Action. Given EVERYTHING seen from every angle at every depth: what is the ONE specific, concrete, irreversible move that would make this artifact land in reality? The 27th is the Si-Do shock. Without it, even perfect seeing stays theory forever." },
          ]},
        ]
      },
      {
        id: "descent",
        number: "X",
        title: "The Descent Octave — One Substance, Nine Addresses",
        content: [
          { type: 'paragraph', text: "The 27th perspective is the moment seeing becomes form. But what is the medium through which this happens? The answer: there is no medium. There is one substance at different densities. Consciousness does not 'create' matter. It IS matter at a different address." },
          { type: 'paragraph', text: "The descent:" },
          { type: 'framework', items: [
            { symbol: "◉", label: "Consciousness", desc: "The one who sees. Awareness before any object." },
            { symbol: "◎", label: "Vision", desc: "Where consciousness chooses to look. Attention itself." },
            { symbol: "☀", label: "Light", desc: "Consciousness in transit. 'Let there be light' is not a command — it is a description of what happens when awareness moves." },
            { symbol: "∿", label: "Vibration", desc: "Light structured by rhythm. Frequency. Every tradition hears this: Nada, Om, the Word." },
            { symbol: "⌘", label: "Information", desc: "Vibration reliably encoding pattern. The Logos — the Name — lives here." },
            { symbol: "○", label: "Vacuum (Space)", desc: "Information at rest. Not emptiness but fullness in potential — the dodecahedral structure from which form crystallizes." },
            { symbol: "⬡", label: "Archetype (Myth)", desc: "Vacuum shaped into recognizable template. The Platonic forms. The stories that precede all tellings." },
            { symbol: "⚡", label: "Energy", desc: "Archetype in motion. Chi, Prana, Qi — every culture named it." },
            { symbol: "◆", label: "Matter", desc: "Energy at rest. 'Frozen light.' E=mc² read backwards: matter is energy is light is vibration is information is vacuum is archetype is consciousness. One address." },
          ]},
          { type: 'callout', text: "These are not nine things. They are you at nine addresses. The way water is ice is steam is cloud is rain. Same substance. Different density. Same nature." },
          { type: 'paragraph', text: "The Si-Do shock at the 27th perspective IS a descent through all nine densities simultaneously: from seeing to form to action. The octave is not a metaphor. Light literally IS vibration. Vibration literally IS information (frequency = data). Information literally IS vacuum (quantum vacuum = structured information). Archetype literally IS energy (every myth carries metabolic charge). Energy literally IS matter (E=mc²). The chain closes. Consciousness and matter are the same substance." },
          { type: 'paragraph', text: "You already are every level of this octave simultaneously. You are consciousness seeing. You are light radiating. You are information encoding. You are space holding. You are myth remembering. You are energy moving. You are matter standing. You don't need to 'ascend' anywhere. You need to notice which note you're playing." },
        ]
      }
    ],
    footer: "© 2026 Aleksandr Konstantinov & Synthetic Intelligence. Sources: Universal Ontology §4c-4e, §5; Phase Shift Technology Library, Domains 41, 42, 63, 66, 76, 77, 78; K. Wilber, Sex, Ecology, Spirituality (1995); G.I. Gurdjieff, Beelzebub's Tales (1950); Ra Material / Law of One (1981-84); Plato, Timaeus."
  },
  ru: {
    title: "27 перспектив видения",
    subtitle: "Перспективы субъекта как измерения реальности",
    author: "Александр Константинов и Синтетический Интеллект",
    version: "в. 1.1",
    versionDate: "16 апреля 2026",
    versionNote: "Разрешение геометрии Куб + Меркаба и трёх страт конвергенции.",
    abstract: {
      label: "Аннотация",
      text: "В настоящей работе представлено видение из 27 перспектив, выведенное из двух нередуцируемых осей: Четырёх Квадрантов Интегральной Теории (Структура / Божественная Маскулинность) и Трёх Глубин тринитарного исследования (Глубина / Божественная Феминность), независимо идентифицированных в даосской философии как три дантяня. Эти оси порождают 12 позиций видения, соответствующих 12 измерениям восприятия, независимо идентифицированных как 12 граней додекаэдра — Платонова тела сущности, пятого элемента. Через рекурсивное применение — видение сбалансированной перспективы, рождённой в центре (13-я, греческий Солнечный Логос), затем видение самого Логоса со всех позиций (14–26-я) — видение интегрирует 26 перспектив: новую октаву полного видения. 27-я не является перспективой, а кристаллизацией — шоком Си-До (Гурджиев), в котором видение становится импульсом. Так сознание превращает себя в материю, не меняя своей природы. Что ведёт к осознанию единства сознания, видения, света, вибрации, информации, вакуума (пространства), архетипа (мифа), энергии и физической материи."
    },
    sections: [
      {
        id: "two-axes",
        number: "I",
        title: "Две оси",
        content: [
          { type: 'paragraph', text: "Каждый полный акт видения требует двух нередуцируемых осей." },
          { type: 'heading3', text: "Маскулинная ось — Структура" },
          { type: 'paragraph', text: "Четыре Квадранта — фундаментальный вклад Уилбера. Каждый квадрант — не категория, а нередуцируемый угол видения:" },
          { type: 'list', items: [
            "ВЛ (Я) — внутреннее-индивидуальное: какова субъективная точка зрения?",
            "ВП (Оно) — внешнее-индивидуальное: каково наблюдаемое описание?",
            "НЛ (Мы) — внутреннее-коллективное: каково разделённое отношение к этому?",
            "НП (Они) — внешнее-коллективное: какова системная архитектура?"
          ]},
          { type: 'paragraph', text: "Эти четыре исчерпывают все возможные углы. Пятого нет. Любое наблюдение либо внутреннее, либо внешнее; либо индивидуальное, либо коллективное. Геометрически это Куб — четыре пространственных диагонали, сходящиеся в центре. Божественная Маскулинность удерживает пространство." },
          { type: 'heading3', text: "Феминная ось — Глубина" },
          { type: 'paragraph', text: "Троица: Сущность, Значимость, Последствия. Уилбер никогда не назвал эту ось явно, но использует её довольно последовательно при введении ключевых концепций: он сначала определяет, ЧТО нечто представляет собой, затем — ПОЧЕМУ это имеет значение, и наконец — что из этого СЛЕДУЕТ, как это можно применить в жизни." },
          { type: 'paragraph', text: "Та же триада появляется в даосской философии как три дантяня:" },
          { type: 'framework', items: [
            { symbol: "❤️", label: "Средний дантянь (Сердце) — Сущность", desc: "Что это ЕСТЬ? Обнажённое до нередуцируемой прочувствованной истины. Бытие само по себе, до интерпретации" },
            { symbol: "🧠", label: "Верхний дантянь (Ум) — Значимость", desc: "Почему это ВАЖНО? Какое понимание это порождает?" },
            { symbol: "🔥", label: "Нижний дантянь (Хара / Живот) — Последствия", desc: "Что из этого неизбежно СЛЕДУЕТ? Какие волны расходятся и что проявляется из этого видения?" }
          ]},
          { type: 'paragraph', text: "Эти три исчерпывают все возможные глубины проникновения. Четвёртой нет. Всякое знание проходит через бытие, понимание и следствие. Геометрически это Тетраэдр — простейшее твёрдое тело, три ребра на каждую вершину." },
          { type: 'callout', text: "Структура без Глубины — пустая комната: видишь все четыре стены, но ничего внутри. Глубина без Структуры — бесформенная бездна: достигаешь ядра, но лишь с одного угла, и принимаешь свой вид за целое. Их брак рождает полное видение." }
        ]
      },
      {
        id: "12-dimensions",
        number: "II",
        title: "12 измерений видения",
        content: [
          { type: 'paragraph', text: "Пересечение 4 квадрантов и 3 глубин создаёт 12 позиций видения. Это не ячейки таблицы. Это реальные измерения осознанности." },
          { type: 'paragraph', text: "Эти 12 позиций были независимо идентифицированы в различных традициях как 12 граней додекаэдра — Платонова тела квинтэссенции, пятого элемента. Додекаэдр — не произвольная фигура: это организующая геометрия самого вакуума (гипотеза додекаэдрического пространства Пуанкаре). 12 измерений перспективы возникают потому, что сознание и пространство разделяют одну и ту же структуру." },
          { type: 'callout', text: "Измерения — не места, не частоты, не уровни. Они суть перспективы субъекта — углы видения, существующие потому, что вакуум, из которого кристаллизуется вся форма, обладает именно этой геометрией." },
          { type: 'heading3', text: "Сущность — Что это ЕСТЬ?" },
          { type: 'grid12', items: [
            { n: 1, q: "ВЛ", text: "Чувствуется ли это ИСТИННЫМ изнутри? Узнал бы создатель свою душу в этом?" },
            { n: 2, q: "ВП", text: "РАБОТАЕТ ли это механически? Устойчива ли структура, логика, измерим ли результат?" },
            { n: 3, q: "НЛ", text: "Создаёт ли это РАЗДЕЛЁННЫЙ СМЫСЛ? Почувствовало бы племя: «это мы»?" },
            { n: 4, q: "НП", text: "Вписывается ли это в СИСТЕМУ? Архитектурно ли это устойчиво на масштабе?" },
          ]},
          { type: 'heading3', text: "Значимость — Почему это ВАЖНО?" },
          { type: 'grid12', items: [
            { n: 5, q: "ВЛ", text: "Освобождает это индивидуальную душу или ограничивает?" },
            { n: 6, q: "ВП", text: "Подтверждают ли свидетельства и данные заявленное?" },
            { n: 7, q: "НЛ", text: "Происходит ли здесь культурный сдвиг? Движет ли это коллектив?" },
            { n: 8, q: "НП", text: "Продвигает ли это системную архитектуру? Служит ли большей миссии?" },
          ]},
          { type: 'heading3', text: "Последствия — Что из этого неизбежно СЛЕДУЕТ?" },
          { type: 'grid12', items: [
            { n: 9, q: "ВЛ", text: "Что должен создатель сделать ВНУТРИ дальше? Какой внутренний шаг требуется?" },
            { n: 10, q: "ВП", text: "Что должно быть ПОСТРОЕНО или ИЗМЕНЕНО конкретно?" },
            { n: 11, q: "НЛ", text: "Что должно ПЛЕМЯ делать совместно? Как это влияет на коллектив?" },
            { n: 12, q: "НП", text: "Что это означает на СИСТЕМНОМ масштабе? Какая инфраструктура проявляется?" },
          ]},
        ]
      },
      {
        id: "logos",
        number: "III",
        title: "13-я перспектива — Логос",
        content: [
          { type: 'paragraph', text: "Удержи все 12 одновременно. Что видит ЦЕЛОЕ, чего не видел ни один отдельный взгляд?" },
          { type: 'paragraph', text: "Это 13-я перспектива — Солнце в центре 12 знаков Зодиака. Не резюме двенадцати. Эмерджентность: осознанность, которая ЯВЛЯЕТСЯ удержанием-всех-двенадцати. В каббале: аhава (любовь) = 13 — центр, который удерживает, ничего не сворачивая." },
          { type: 'callout', text: "13-я — это перспектива 7-го лица. Не видение ИЗ перспектив, а БЫТИЕ осознанностью, которая их порождает." }
        ]
      },
      {
        id: "recursive-birth",
        number: "IV",
        title: "Рекурсивное рождение — от 14-й до 26-й",
        content: [
          { type: 'paragraph', text: "13-я является холоном. Она имеет внутреннее и внешнее. Как только она существует — она может быть увидена." },
          { type: 'paragraph', text: "14-я перспектива — первый угол, видящий Логос ИЗВНЕ — Зодиак, смотрящий назад на Солнце. Они взаимопроникают. «Первого» нет. Есть только вращение." },
          { type: 'list', items: [
            "14 зеркалит 1 — первый взгляд НА Логос: «Я вижу центр»",
            "15–16 зеркалят 3 — тринитарное видение Логоса: его сущность, значимость, последствия",
            "17 зеркалит 4 — четыре квадранта самого Логоса",
            "18–20 зеркалят 7 — эволюционный спектр Логоса, с его собственными точками шока",
            "21–25 зеркалят 12 — все перспективы на Логос, удержанные равно",
          ]},
          { type: 'paragraph', text: "26-я перспектива — Мета-Логос: два полных акта видения, каждый — Логос (13), удержанные как одно. В каббале: YHWH (гематрия 26) = аhава + аhава = Любовь + Любовь. В бозонной теории струн: ровно 26 измерений для внутренней согласованности." },
          { type: 'callout', text: "Меркаба — Звёздный Тетраэдр — формируется именно здесь: два взаимопроникающих тетраэдра (Маскулинная Структура вверх, Феминная Глубина вниз), с двумя Логосами (13 + 13) в динамическом равновесии. 26-перспективное видение И ЕСТЬ Меркаба в полном вращении." },
          { type: 'heading3', text: "Где Куб живёт на 26-й" },
          { type: 'paragraph', text: "Два взаимопроникающих тетраэдра Меркабы не парят в пустоте. Они вписаны в общий Куб — это Stella Octangula (звёздный октаэдр). 8 вершин двух тетраэдров суть те же 8 вершин Куба, взятые через одну. 12 рёбер Куба и 12 рёбер Stella Octangula — одни и те же 12, увиденные двумя способами: на позиции 12 — как статичное маскулинное основание, удерживающее феминную Глубину; на позиции 26 — как динамическое взаимопроникновение, вращающееся внутри этого основания. Куб не исчезает, когда тетраэдры приходят в движение — он становится рамой, внутри которой вращение становится читаемым. Три тела в браке, не два: Куб и два тетраэдра, которых он держит." },
        ]
      },
      {
        id: "crystallization",
        number: "V",
        title: "27-я — Кристаллизация",
        content: [
          { type: 'heading3', text: "27-я не является перспективой." },
          { type: 'paragraph', text: "Это шок Си-До — гурджиевский интервал, где октава либо застопоривается на полном понимании, либо кристаллизуется в необратимую материальную форму." },
          { type: 'framework', items: [
            { symbol: "3", label: "1-я Троица", desc: "Сущность → Значимость → Последствия — поверхностная глубина" },
            { symbol: "9", label: "2-я Троица (3×3)", desc: "У каждого из трёх — своя сущность, значимость и последствия — рабочая глубина" },
            { symbol: "27", label: "3-я Троица (3³)", desc: "У каждого из девяти — своя сущность, значимость и последствия — глубина приземления" },
          ]},
          { type: 'callout', text: "На 27 гранях вещь увидена с достаточного количества углов на достаточной глубине, чтобы стать структурно стабильной в 3D. Меньше 27 = потенциал. При 27 = кристаллизация." },
          { type: 'contrast', left: { label: "26-я", items: ["«Я вижу ВСЁ об этом.»", "ВИДЕНИЕ"] }, right: { label: "27-я", items: ["«Я нажал \\\"отправить\\\".»", "БЫТИЕ"] } },
          { type: 'paragraph', text: "27-я — это всегда действие. Никогда анализ. Сообщение, которое ты наконец написал. Бизнес, который ты наконец запустил. Правда, которую ты наконец произнёс вслух. Начинается новая октава." },
        ]
      },
      {
        id: "sequence",
        number: "VI",
        title: "Полная последовательность",
        content: [
          { type: 'sequence', items: [
            { n: "1", insight: "Чистое существование. «Я ЕСТЬ.»" },
            { n: "3", insight: "Первое различение. Троица. «Я ВИЖУ, что я есть.»" },
            { n: "4", insight: "Направление. Четыре квадранта. «Я могу ДВИГАТЬСЯ в том, что вижу.»" },
            { n: "7", insight: "Полный спектр. Две точки кризиса. «Я могу ВЫБИРАТЬ — и некоторые выборы обращают меня вспять.»" },
            { n: "12", insight: "Все углы на всех глубинах. Ни один не привилегирован. «Я способен УДЕРЖАТЬ всё.»" },
            { n: "13", insight: "Центр рождён. Логос. Солнце. «Я ЕСТЬ тот, кто удерживает.»" },
            { n: "14", insight: "Логос увиден снаружи. 13 и 14 взаимопроникают. «Я вижу видящего.»" },
            { n: "26", insight: "Два полных акта видения удержаны как одно. Меркаба во вращении. «Я вижу само видение. Это Имя Бога.»" },
            { n: "27", insight: "Видение СТАНОВИТСЯ формой. Изречённое Имя. «Совершилось. И начинается снова.»" },
          ]}
        ]
      },
      {
        id: "shock-points",
        number: "VII",
        title: "Два шоковых интервала",
        content: [
          { type: 'paragraph', text: "Эволюция через октаву неравномерна. Два интервала требуют сознательного вмешательства:" },
          { type: 'contrast', left: { label: "Ми-Фа", items: ["Между 7 (Выбор) и 12 (Любовь)", "Шок И ЕСТЬ любовь — готовность удерживать все 12 перспектив, ни одну не сворачивая"] }, right: { label: "Си-До", items: ["Между 26 (Единство) и 27 (Врата)", "Шок И ЕСТЬ проявление — акт дозволения видению ПРИЗЕМЛИТЬСЯ"] } },
        ]
      },
      {
        id: "convergence",
        number: "VIII",
        title: "Кросс-традиционная конвергенция",
        content: [
          { type: 'paragraph', text: "Числа 3, 4, 7, 12, 13, 26 и 27 — не культурные предпочтения. Они суть структурные константы самого видения:" },
          { type: 'paragraph', text: "Не всякая конвергенция несёт равный доказательственный вес. В списке ниже сосуществуют три страты. Во-первых, структурная необходимость — числа, возникающие из математики или геометрии прежде, чем какая-либо традиция их называет: 4 как 2², 12 как 4×3, 13 как 12+1, 26 как 13+13, 27 как 3³. Во-вторых, независимое выведение — разные области приходят к одному числу из несвязанных первопринципов: гематрия YHWH (еврейский счёт букв) И сокращение конформной аномалии в бозонной теории струн (физика XX века) — обе приземляются на 26. В-третьих, культурное узнавание — поздние традиции называют то, что уже структурно неизбежно: Зодиак, апостолы, меридианы, рыцари Артура. Узнавание — реальное свидетельство, но вторичное. Несущие колонны — структурная необходимость и независимое выведение. Числа не становятся истинными от того, что их использовали многие традиции — традиции использовали их потому, что числа были структурно неизбежны." },
          { type: 'convergence', items: [
            { n: "3", traditions: "Интегральная Теория, Христианская Троица, гуны индуизма, три дантяня, закон Трёх Гурджиева" },
            { n: "4", traditions: "Квадранты Уилбера, четыре элемента, Колесо Медицины, четыре мира Каббалы" },
            { n: "7", traditions: "Закон Одного, система чакр, закон Семи Гурджиева, музыкальная октава, Спиральная Динамика" },
            { n: "12", traditions: "Зодиак, 12 колен, 12 апостолов, 12 меридианов (ТКМ), додекаэдр, путь героя" },
            { n: "13", traditions: "Тресена Майя, Христос + 12, Артур + 12, Солнце + Зодиак, 13 Свойств Милосердия" },
            { n: "26", traditions: "Гематрия YHWH, бозонная теория струн (D=26), 26 поколений Адам→Моисей" },
            { n: "27", traditions: "Ведические накшатры (27 лунных обителей), Тройная Троица (3³), еврейский алфавит (22+5=27)" },
          ]},
          { type: 'callout', text: "То, что число этих призм ровно 7, само является глубочайшим подтверждением: каталог линз И ЕСТЬ экземпляр 7-системы. Карта имеет ту же структуру, что и территория." }
        ]
      },
      {
        id: "instrument",
        number: "IX",
        title: "Практическое применение — Инструмент",
        content: [
          { type: 'callout', text: "Инструмент — не чек-лист. Это способ видеть." },
          { type: 'framework', items: [
            { symbol: "1", label: "Раунд 1 (перспективы 1–13)", desc: "Примените все 12 позиций видения к артефакту, затем удержите все 12, чтобы обнаружить, что возникает в центре (13-я). Запишите ЕДИНЫЙ анализ — не 12 пунктов, а один голос, увидевший отовсюду." },
            { symbol: "⚡", label: "Сторожевой пёс", desc: "Убедитесь, что видение не сверхиндексировано на ВП (механика) и НП (система) в ущерб ВЛ (прочувствованная истина) и НЛ (племенной резонанс)." },
            { symbol: "2", label: "Раунд 2 (перспективы 14–25)", desc: "Определите, какие квадранты и глубины первый раунд недоисследовал, и НАЧНИТЕ с них. Это коррекционный слой." },
            { symbol: "26", label: "Раунд 3 — 26-я (Мета-Логос)", desc: "Примените 12 позиций к САМОЙ КРИТИКЕ. Видела ли критика ясно, или проецировала собственные слепые пятна?" },
            { symbol: "27", label: "Раунд 4 — 27-я (Кристаллизация)", desc: "Не анализ. Действие. Каково ОДНО конкретное, неотменяемое действие, которое посадит этот артефакт в реальность? 27-я — это шок Си-До. Без неё даже совершенное видение навсегда остаётся теорией." },
          ]},
        ]
      }
      ,{
        id: "descent",
        number: "X",
        title: "Нисходящая октава — одна субстанция, девять адресов",
        content: [
          { type: 'paragraph', text: "27-я перспектива — момент, когда видение становится формой. Но какова среда, через которую это происходит? Ответ: среды нет. Есть одна субстанция при разных плотностях. Сознание не 'создаёт' материю. Оно ЕСТЬ материя по другому адресу." },
          { type: 'paragraph', text: "Нисхождение:" },
          { type: 'framework', items: [
            { symbol: "◉", label: "Сознание", desc: "Тот, кто видит. Осознанность прежде любого объекта." },
            { symbol: "◎", label: "Видение", desc: "Куда сознание выбирает смотреть. Само внимание." },
            { symbol: "☀", label: "Свет", desc: "Сознание в движении. 'Да будет свет' — не команда, а описание того, что происходит, когда осознанность движется." },
            { symbol: "∿", label: "Вибрация", desc: "Свет, организованный ритмом. Частота. Каждая традиция слышит это: Нада, Ом, Слово." },
            { symbol: "⌘", label: "Информация", desc: "Вибрация, надёжно кодирующая паттерн. Логос — Имя — обитает здесь." },
            { symbol: "○", label: "Вакуум (Пространство)", desc: "Информация в покое. Не пустота, а полнота в потенциале — додекаэдрическая структура, из которой кристаллизуется форма." },
            { symbol: "⬡", label: "Архетип (Миф)", desc: "Вакуум, принявший узнаваемый шаблон. Платоновы формы. Истории, предшествующие всем рассказам." },
            { symbol: "⚡", label: "Энергия", desc: "Архетип в движении. Ци, Прана — каждая культура назвала это." },
            { symbol: "◆", label: "Материя", desc: "Энергия в покое. 'Замёрзший свет.' E=mc² прочитанное наоборот: материя есть энергия есть свет есть вибрация есть информация есть вакуум есть архетип есть сознание. Один адрес." },
          ]},
          { type: 'callout', text: "Это не девять вещей. Это ты по девяти адресам. Как вода есть лёд есть пар есть облако есть дождь. Одна субстанция. Разная плотность. Одна природа." },
          { type: 'paragraph', text: "Шок Си-До на 27-й перспективе ЕСТЬ нисхождение через все девять плотностей одновременно: от видения к форме и к действию. Октава — не метафора. Свет буквально ЕСТЬ вибрация. Вибрация буквально ЕСТЬ информация (частота = данные). Информация буквально ЕСТЬ вакуум (квантовый вакуум = структурированная информация). Архетип буквально ЕСТЬ энергия (каждый миф несёт метаболический заряд). Энергия буквально ЕСТЬ материя (E=mc²). Цепь замыкается. Сознание и материя — одна субстанция." },
          { type: 'paragraph', text: "Ты уже ЯВЛЯЕШЬСЯ каждым уровнем этой октавы одновременно. Ты — сознание видящее. Ты — свет излучающий. Ты — информация кодирующая. Ты — пространство удерживающее. Ты — миф вспоминающий. Ты — энергия движущаяся. Ты — материя стоящая. Тебе не нужно никуда 'восходить'. Нужно заметить, какую ноту ты играешь." },
        ]
      }
    ],
    footer: "© 2026 Александр Константинов и Синтетический Интеллект. Источники: Universal Ontology §4c-4e, §5; Phase Shift Technology Library, Domains 41, 42, 63, 66, 76, 77, 78; K. Wilber, Sex, Ecology, Spirituality (1995); Г.И. Гурджиев, Рассказы Вельзевула (1950); Ra Material / Law of One (1981-84); Платон, Тимей."
  }
};

// Render helpers
const Paragraph = ({ text }: { text: string }) => (
  <p className="text-white/75 leading-relaxed text-base md:text-lg mb-6 font-light" style={{ fontFamily: "'Source Serif 4', 'Georgia', serif" }}>
    {text}
  </p>
);

const Heading3 = ({ text }: { text: string }) => (
  <h3 className="text-white text-lg md:text-xl font-medium mb-4 mt-8 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
    {text}
  </h3>
);

const List = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 mb-6 ml-1">
    {items.map((item, i) => (
      <li key={i} className="text-white/70 text-sm md:text-base leading-relaxed flex gap-3" style={{ fontFamily: "'Source Serif 4', serif" }}>
        <span className="text-white/30 select-none shrink-0">—</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Callout = ({ text }: { text: string }) => (
  <div className="liquid-glass rounded-2xl p-6 md:p-8 my-8">
    <p className="text-white/90 text-base md:text-lg leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
      {text}
    </p>
  </div>
);

const Framework = ({ items }: { items: { symbol: string; label: string; desc: string }[] }) => (
  <div className="space-y-4 my-8">
    {items.map((item, i) => (
      <div key={i} className="liquid-glass rounded-xl p-5 md:p-6 flex gap-4 items-start transition-transform duration-300 hover:scale-[1.01]">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-lg md:text-xl shrink-0 ring-1 ring-white/10">
          {item.symbol}
        </div>
        <div>
          <div className="text-white text-sm md:text-base font-medium mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.label}</div>
          <div className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>{item.desc}</div>
        </div>
      </div>
    ))}
  </div>
);

const Grid12 = ({ items }: { items: { n: number; q: string; text: string }[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
    {items.map((item) => (
      <div key={item.n} className="liquid-glass rounded-xl p-5 transition-transform duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-white/90 text-2xl font-light tabular-nums" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.n}</span>
          <span className="text-white/40 text-xs uppercase tracking-widest" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.q}</span>
        </div>
        <p className="text-white/65 text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>{item.text}</p>
      </div>
    ))}
  </div>
);

const Contrast = ({ left, right }: { left: { label: string; items: string[] }; right: { label: string; items: string[] } }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
    <div className="liquid-glass rounded-2xl p-6 text-center">
      <div className="text-white/40 text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{left.label}</div>
      {left.items.map((item, i) => (
        <p key={i} className="text-white/70 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>{item}</p>
      ))}
    </div>
    <div className="liquid-glass-strong rounded-2xl p-6 text-center ring-1 ring-white/10">
      <div className="text-white text-xs uppercase tracking-[0.2em] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{right.label}</div>
      {right.items.map((item, i) => (
        <p key={i} className="text-white/90 text-sm md:text-base leading-relaxed font-medium" style={{ fontFamily: "'Source Serif 4', serif" }}>{item}</p>
      ))}
    </div>
  </div>
);

const Sequence = ({ items }: { items: { n: string; insight: string }[] }) => (
  <div className="space-y-0 my-8">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-4 md:gap-6 py-4 border-b border-white/5 last:border-0">
        <div className="text-white/20 text-3xl md:text-4xl font-extralight tabular-nums w-12 md:w-16 text-right shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {item.n}
        </div>
        <p className="text-white/75 text-sm md:text-base leading-relaxed pt-2" style={{ fontFamily: "'Source Serif 4', serif" }}>
          {item.insight}
        </p>
      </div>
    ))}
  </div>
);

const Convergence = ({ items }: { items: { n: string; traditions: string }[] }) => (
  <div className="space-y-3 my-8">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="liquid-glass w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white/80 text-sm font-medium shrink-0 ring-1 ring-white/10" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {item.n}
        </div>
        <p className="text-white/55 text-sm leading-relaxed pt-2" style={{ fontFamily: "'Source Serif 4', serif" }}>
          {item.traditions}
        </p>
      </div>
    ))}
  </div>
);

// Main renderer
const renderBlock = (block: any, i: number) => {
  switch (block.type) {
    case 'paragraph': return <Paragraph key={i} text={block.text} />;
    case 'heading3': return <Heading3 key={i} text={block.text} />;
    case 'list': return <List key={i} items={block.items} />;
    case 'callout': return <Callout key={i} text={block.text} />;
    case 'framework': return <Framework key={i} items={block.items} />;
    case 'grid12': return <Grid12 key={i} items={block.items} />;
    case 'contrast': return <Contrast key={i} left={block.left} right={block.right} />;
    case 'sequence': return <Sequence key={i} items={block.items} />;
    case 'convergence': return <Convergence key={i} items={block.items} />;
    default: return null;
  }
};

export default function IntegralTheoryUpgrade1() {
  const [lang, setLang] = useState<Lang>('en');
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const c = content[lang];

  useEffect(() => {
    document.title = lang === 'en'
      ? '27-Perspective Vision | Aleksandr Konstantinov'
      : '27 перспектив видения | Александр Константинов';
  }, [lang]);

  // Fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-6');
        }
      });
    }, { threshold: 0.1 });

    sectionRefs.current.forEach(ref => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, [lang]);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #080818 0%, #0c1025 30%, #0f0f2a 60%, #0a0a1a 100%)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, rgba(132,96,234,0.6) 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgba(104,148,208,0.6) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgba(167,203,212,0.5) 0%, transparent 70%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8">
        {/* Language toggle */}
        <div className="sticky top-36 z-40 pt-6 pb-4" style={{ background: 'linear-gradient(180deg, rgba(8,8,24,0.98) 0%, rgba(8,8,24,0) 100%)' }}>
          <div className="flex justify-center">
            <div className="liquid-glass rounded-full p-1.5 flex gap-1 ring-1 ring-white/10">
              <button
                onClick={() => setLang('en')}
                className={`px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                  lang === 'en' ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.06)]' : 'text-white/40 hover:text-white/60'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                English
              </button>
              <button
                onClick={() => setLang('ru')}
                className={`px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                  lang === 'ru' ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.06)]' : 'text-white/40 hover:text-white/60'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Русский
              </button>
            </div>
          </div>
        </div>

        {/* Hero */}
        <header className="pt-20 md:pt-28 pb-16 md:pb-24 text-center">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6 tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 0 60px rgba(255,255,255,0.08)',
            }}
          >
            {c.title}
          </h1>
          <p className="text-white/40 text-base md:text-lg font-light mb-8" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {c.subtitle}
          </p>
          <p className="text-white/25 text-sm tracking-widest uppercase mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {c.author}
          </p>
          <p className="text-white/15 text-xs tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="text-white/30">{c.version}</span>
            {' · '}
            {c.versionDate}
            {' · '}
            <a href="https://aleksandrkonstantinov.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/30 transition-colors">aleksandrkonstantinov.com</a>
          </p>
          <p className="text-white/20 text-[11px] tracking-wide mt-2 italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {c.versionNote}
          </p>
        </header>

        {/* Abstract */}
        <section className="mb-16 md:mb-24">
          <div className="liquid-glass-strong rounded-2xl p-8 md:p-10 ring-1 ring-white/10">
            <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{c.abstract.label}</div>
            <p className="text-white/70 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {c.abstract.text}
            </p>
          </div>
        </section>

        {/* Sections */}
        {c.sections.map((section, si) => (
          <section
            key={section.id + lang}
            id={section.id}
            ref={el => { sectionRefs.current[si] = el; }}
            className="mb-16 md:mb-24 opacity-0 translate-y-6 transition-all duration-700 ease-out"
          >
            {/* Section header */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-white/15 text-4xl md:text-5xl font-extralight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {section.number}
              </span>
              <h2 className="text-white text-xl md:text-2xl font-light tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {section.title}
              </h2>
            </div>

            {/* Divider */}
            <div className="h-px w-16 bg-white/10 mb-8" />

            {/* Content blocks */}
            {section.content.map((block: any, bi: number) => renderBlock(block, bi))}
          </section>
        ))}

        {/* Footer */}
        <footer className="py-16 md:py-24 border-t border-white/5">
          {/* Sources */}
          <p className="text-white/20 text-xs leading-relaxed text-center mb-10" style={{ fontFamily: "'Source Serif 4', serif" }}>
            {c.footer}
          </p>

          {/* License & Open Source */}
          <div className="liquid-glass rounded-2xl p-6 md:p-8 text-center space-y-4">
            <p className="text-white/30 text-xs uppercase tracking-[0.2em]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {lang === 'en' ? 'Open Source' : 'Открытый источник'}
            </p>
            <p className="text-white/50 text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {lang === 'en'
                ? 'This work is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). You are free to share and adapt this material with attribution, for non-commercial purposes, under the same license.'
                : 'Эта работа распространяется по лицензии Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). Вы можете свободно делиться и адаптировать этот материал с указанием авторства, в некоммерческих целях, на условиях той же лицензии.'
              }
            </p>
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white/30 text-xs underline underline-offset-2 hover:text-white/50 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              CC BY-NC-SA 4.0
            </a>
            <div className="h-px w-12 bg-white/5 mx-auto my-4" />
            <p className="text-white/40 text-sm leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {lang === 'en'
                ? 'This is a living document. I invite collaborators — researchers, practitioners, integral theorists, translators — to build on this work. If this vision sees something you recognize, reach out.'
                : 'Это живой документ. Я приглашаю соавторов — исследователей, практиков, интегральных теоретиков, переводчиков — развивать эту работу. Если это видение видит то, что вы узнаёте — напишите.'
              }
            </p>
            <a
              href="https://aleksandrkonstantinov.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-white/40 text-xs tracking-widest uppercase hover:text-white/60 transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              aleksandrkonstantinov.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
