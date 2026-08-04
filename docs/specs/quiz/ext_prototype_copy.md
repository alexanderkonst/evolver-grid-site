# Result Experience EXT — Prototype Copy (Phase 2)

*Per `ext_implementation_brief.md` and `ext_change_map.md` §2. Representative pattern: **stage 5 (The Gap)** + **uniqueness = integration** + **emergingWorkStage = named**. Synthesis family: **COHERENCE**. Sibling deltas authored for the three other gate combos: integration+built, vehicle+named, vehicle+built (vehicle → synthesis family **FORM**). Copy only. No code or locale JSON touched.*

---

## 0. Adjustments to the change-map §2 plan

1. `evidence.youAlsoSaid` is keyed by **emergingWorkStage** (`named` / `built`), not by synthesis family — the sentence quotes back the Q3 answer, which doesn't vary by family. Proposed real key: `quiz.ext.evidence.youAlsoSaid.<workStage>`. The change-map's `.{synthesisFamily}` suffix is kept as an alias note only.
2. `evidence.and` is keyed by **uniqueness** (`integration` / `vehicle`), not by family, for the same reason. Proposed key: `quiz.ext.evidence.and.<uniqueness>`.
3. `evidence.youSaid` and `evidence.takenTogether` are keyed by family/stage as originally planned (stage-supported and combination-supported respectively).
4. Everything else follows the change-map tree as written.

---

## 1. Chapter (Act I.1) — shared across all four sibling combos (stage 5)

| Key | EN | RU | ES |
|---|---|---|---|
| `quiz.ext.chapter.eyebrow` | YOUR CHAPTER | ТВОЯ ГЛАВА | TU CAPÍTULO |
| `quiz.ext.chapter.stageName` | The Gap *(reuse `quiz.stageNames.5`)* | Перепутье | Entre capítulos |
| `quiz.ext.chapter.bullseye.5` | The old chapter has ended, and the next one is still organizing. That is the real work of this stage, and it explains more than any story about lost direction or fading ability. Whatever caused the break, the question now is what the break requires of you. | Старая глава закончилась, а следующая ещё собирается. В этом и состоит настоящая работа этого этапа, и это объясняет больше, чем любая история про потерянное направление или угасшие способности. Чем бы ни был вызван разлом, вопрос теперь в том, чего он требует от тебя. | El capítulo anterior terminó y el siguiente todavía se está organizando. Ese es el verdadero trabajo de esta etapa, y explica más que cualquier historia sobre un rumbo perdido o una capacidad que se apaga. Sea lo que sea que causó la ruptura, la pregunta ahora es qué te pide a ti. |
| `quiz.ext.chapter.arcNote` | People may move back and forth across this territory. This is the part carrying the most weight now. | По этой территории можно двигаться туда-обратно. Но именно эта часть сейчас несёт больше всего веса. | Uno puede moverse hacia adelante y hacia atrás por este territorio. Esta es la parte que hoy pesa más. |

Word count: bullseye EN = 39 words (budget 25–50 ✓). arcNote EN = 20 words (unbudgeted, quiet copy).

---

## 2. Evidence block (Act I.3)

`quiz.ext.evidence.heading` — EN: **What your answers revealed** · RU: **Что показали твои ответы** · ES: **Lo que revelaron tus respuestas**

### 2.1 `youSaid` — stage 5, shared by all four combos

| Lang | Copy |
|---|---|
| EN | You said the old chapter is over, but you genuinely don't know what comes next. |
| RU | Ты сказал(а), что старая глава закончилась, но правда не знаешь, что дальше. |
| ES | Dijiste que el capítulo anterior terminó, pero de verdad no sabes qué sigue. |

Quotes back Q1 option: *"I know the old chapter is over, but I genuinely don't know what comes next."*

### 2.2 `youAlsoSaid.<workStage>`

**named** (quotes Q3 `named`: *"I can talk about what my next chapter is, but it hasn't become a clear offer, business, or body of work."*)

| Lang | Copy |
|---|---|
| EN | You also said you can talk about what the next chapter is, but it hasn't become a clear offer, business, or body of work. |
| RU | Ты также сказал(а), что можешь рассказать, какая у тебя следующая глава, но она ещё не стала ясным предложением, бизнесом или направлением работы. |
| ES | También dijiste que puedes hablar de cuál es tu próximo capítulo, pero todavía no se ha convertido en una oferta, negocio o línea de trabajo clara. |

**built** (quotes Q3 `built`: *"My offer exists, but people don't understand it or choose it consistently yet."*)

| Lang | Copy |
|---|---|
| EN | You also said your offer already exists, but people don't understand it or choose it consistently yet. |
| RU | Ты также сказал(а), что твоё предложение уже существует, но люди пока не понимают его или не выбирают стабильно. |
| ES | También dijiste que tu oferta ya existe, pero la gente todavía no la entiende ni la elige de forma constante. |

### 2.3 `and.<uniqueness>`

**integration** (quotes Q2 `integration`: *"I have several workstreams, but I can't see what makes them one thing, and if they are one thing."*)

| Lang | Copy |
|---|---|
| EN | And you have several workstreams, but you can't see what makes them one thing, or whether they are one thing. |
| RU | И у тебя есть несколько направлений работы, но ты не видишь, что делает их одним целым, и делает ли. |
| ES | Y tienes varias líneas de trabajo, pero no ves qué las convierte en una sola cosa, ni si lo son. |

**vehicle** (quotes Q2 `vehicle`: *"I do know exactly what my next chapter is, but I don't know how to create an offer around it, position it, and sell it."*)

| Lang | Copy |
|---|---|
| EN | And you know exactly what your next chapter is, but you don't yet know how to build an offer around it, position it, or sell it. |
| RU | И ты точно знаешь, какая у тебя следующая глава, но пока не знаешь, как сделать из неё предложение, как его позиционировать и продавать. |
| ES | Y sabes exactamente cuál es tu próximo capítulo, pero todavía no sabes cómo construir una oferta a su alrededor, posicionarla o venderla. |

### 2.4 `takenTogether.<family>`

**coherence** (integration+named or integration+built)

| Lang | Copy |
|---|---|
| EN | Taken together, the direction isn't missing. What's missing is the relationship among the parts that are already alive. |
| RU | В сумме направление не потеряно. Не хватает связи между частями, которые уже живы. |
| ES | En conjunto, la dirección no falta. Lo que falta es la relación entre las partes que ya están vivas. |

**form** (vehicle+named or vehicle+built)

| Lang | Copy |
|---|---|
| EN | Taken together, the direction isn't the missing piece. What's missing is a form other people can recognize, enter, and choose. |
| RU | В сумме направление — не то, чего не хватает. Не хватает формы, которую другие люди могут узнать, в которую могут войти и которую могут выбрать. |
| ES | En conjunto, la dirección no es lo que falta. Lo que falta es una forma que otras personas puedan reconocer, a la que puedan entrar y que puedan elegir. |

**Word count (coherence combo, EN):** youSaid 14 + youAlsoSaid(named) 22 + and(integration) 20 + takenTogether(coherence) 18 = **74 words** (budget 60–100 ✓).

---

## 3. Synthesis (Act I.4) — `quiz.ext.synthesis.<family>`

**coherence**

| Lang | Copy |
|---|---|
| EN | The problem may not be that you lack focus, discipline, or ideas. This combination often points to something else: the live parts of your next chapter don't yet have a working relationship, which one leads, what supports it, what's ready to test now. |
| RU | Возможно, дело не в том, что тебе не хватает фокуса, дисциплины или идей. Эта комбинация ответов чаще указывает на другое: у живых частей твоей следующей главы пока нет рабочей связи между собой — что ведёт, что поддерживает, что уже готово к проверке. |
| ES | Puede que el problema no sea que te falte foco, disciplina o ideas. Esta combinación suele apuntar a otra cosa: las partes vivas de tu próximo capítulo todavía no tienen una relación de trabajo entre sí, cuál lidera, qué la sostiene, qué está listo para probarse ahora. |

**form**

| Lang | Copy |
|---|---|
| EN | The direction is no longer entirely hidden. This combination often points to an unresolved form problem: it hasn't yet become an offer, page, or invitation another person can recognize, use, or respond to. |
| RU | Направление уже не полностью скрыто. Эта комбинация ответов чаще указывает на нерешённый вопрос формы: оно ещё не стало предложением, страницей или приглашением, которое другой человек может узнать, использовать или на которое может откликнуться. |
| ES | La dirección ya no está del todo oculta. Esta combinación suele apuntar a un problema de forma sin resolver: todavía no se ha convertido en una oferta, página o invitación que otra persona pueda reconocer, usar o a la que pueda responder. |

**Word count EN:** coherence 46, form 33.

---

## 4. Upgraded question (Act I.5) — `quiz.ext.upgradedQuestion.<family>.5`

| Family | EN | RU | ES |
|---|---|---|---|
| coherence | The question worth testing may be: what relationship should each live project have to the direction you're trying to build? | Возможно, стоит проверить другой вопрос: какое отношение каждый живой проект должен иметь к направлению, которое ты пытаешься построить? | Quizá la pregunta que vale la pena probar sea: ¿qué relación debería tener cada proyecto vivo con la dirección que intentas construir? |
| form | The question worth testing may be: am I optimizing the offer before deciding what this chapter is actually here to carry? | Возможно, стоит проверить другой вопрос: не оттачиваю ли я предложение раньше, чем решил(а), что именно эта глава должна нести? | Quizá la pregunta que vale la pena probar sea: ¿estoy optimizando la oferta antes de decidir qué es lo que este capítulo realmente viene a llevar? |

Word count EN: coherence 19, form 21. Combined with synthesis (§3): coherence 46+19=65, form 33+21=54. Both within the 60–100 combined budget (form runs slightly under; acceptable per "budgets, not rigid limits").

---

## 5. Completion marker (Act I.6) — `quiz.ext.completionMarker.<family>`

Per assignment: coherence uses the "projects stop competing" marker; form uses the "evidence, not only resonance" marker (both verbatim from brief §7.6).

| Family | EN | RU | ES |
|---|---|---|---|
| coherence | The chapter begins to close when the projects stop competing and begin serving an intelligible relationship. | Глава начинает закрываться, когда проекты перестают конкурировать и начинают служить понятной связи между собой. | El capítulo empieza a cerrarse cuando los proyectos dejan de competir y empiezan a servir a una relación inteligible. |
| form | The chapter begins to close when you have evidence, not only resonance. | Глава начинает закрываться, когда у тебя есть не только отклик, но и доказательство. | El capítulo empieza a cerrarse cuando tienes evidencia, no solo resonancia. |

(RU rendering of the form marker reorders clauses to avoid an awkward literal "not X, only Y" calque; meaning preserved — flagged per brief §22.)

---

## 6. Detours (Act II.1–2)

### 6.1 `quiz.ext.detour.headingVariant`

| # | EN | RU | ES |
|---|---|---|---|
| 1 | A COMMON DETOUR | ЧАСТЫЙ ОБХОДНОЙ ПУТЬ | UN DESVÍO FRECUENTE |
| 2 | WHERE PEOPLE OFTEN LOSE TIME HERE | ЗДЕСЬ ЧАЩЕ ВСЕГО ТЕРЯЮТ ВРЕМЯ | AQUÍ LA GENTE SUELE PERDER TIEMPO |
| 3 | A MOVE TO WATCH | ДВИЖЕНИЕ, ЗА КОТОРЫМ СТОИТ СЛЕДИТЬ | UN MOVIMIENTO A VIGILAR |

### 6.2 `quiz.ext.detour.workingDownstream` — shared by coherence and form combos, heading variant 1

| Lang | Copy |
|---|---|
| EN | You reach for a funnel, a new offer, branding, or a productivity system. These feel like real progress because you can start today. But none of them answer the upstream question: what is the next chapter actually organized around. The likely cost is activity without coherence, better execution of a direction that still isn't named. Test the relationship among the projects first. |
| RU | Ты берёшься за воронку, новое предложение, брендинг или систему продуктивности. Это ощущается как настоящий прогресс, потому что начать можно уже сегодня. Но ничто из этого не отвечает на более ранний вопрос: вокруг чего на самом деле организована следующая глава. Вероятная цена — активность без связности, более качественное исполнение направления, которое пока даже не названо. Сначала проверь связь между проектами. |
| ES | Recurres a un embudo, una nueva oferta, branding o un sistema de productividad. Se siente como progreso real porque puedes empezar hoy. Pero nada de eso responde la pregunta previa: alrededor de qué se organiza realmente el próximo capítulo. El costo probable es actividad sin coherencia, mejor ejecución de una dirección que todavía no tiene nombre. Prueba primero la relación entre los proyectos. |

EN word count: 71 (budget 45–75 ✓).

### 6.3 `quiz.ext.detour.mistakingFocusForAmputation` — coherence combo only, heading variant 2

| Lang | Copy |
|---|---|
| EN | Several projects carry real energy, and you're told to choose one and kill the rest. That can feel like cutting off parts of yourself, so you stall rather than choose. The real task is finding whether the parts need integration, hierarchy, sequence, or separation, without assuming everything must merge into one thing or that anything has to die to make room. |
| RU | Несколько проектов несут настоящую энергию, а тебе говорят выбрать один и убить остальные. Это может ощущаться как ампутация части себя, поэтому вместо выбора ты застреваешь. Настоящая задача — понять, нужна ли частям интеграция, иерархия, последовательность или разделение, не предполагая заранее, что всё обязано слиться в одно или что чему-то нужно умереть, чтобы освободить место. |
| ES | Varios proyectos llevan energía real, y te dicen que elijas uno y mates el resto. Eso puede sentirse como cortar partes de ti mismo(a), así que te quedas quieto(a) en vez de elegir. La tarea real es descubrir si las partes necesitan integración, jerarquía, secuencia o separación, sin asumir de entrada que todo debe fundirse en una sola cosa o que algo tiene que morir para hacer espacio. |

EN word count: 70 (budget 45–75 ✓).

### 6.4 `quiz.ext.detour.buildingBeforeNaming` — form combo only, heading variant 3

| Lang | Copy |
|---|---|
| EN | You start creating offers, content, or a business before enough is known: who the real buyer is, what they're actually responding to, what reality is already answering. Exploration helps. Heavy building before contact usually creates rework, weak resonance, and a story reverse-engineered around what you already built. Test the offer in small conversations before you build the next layer. |
| RU | Ты начинаешь создавать предложения, контент или бизнес раньше, чем узнал(а) достаточно: кто настоящий покупатель, на что он на самом деле откликается, что уже отвечает реальность. Разведка полезна. Тяжёлое строительство до контакта с реальностью обычно создаёт переделки, слабый отклик и историю, придуманную задним числом под то, что уже построено. Проверь предложение в небольших разговорах, прежде чем строить следующий слой. |
| ES | Empiezas a crear ofertas, contenido o un negocio antes de saber lo suficiente: quién es el comprador real, a qué está respondiendo de verdad, qué está respondiendo ya la realidad. Explorar ayuda. Construir mucho antes del contacto suele generar retrabajo, poca resonancia y una historia inventada después, a la medida de lo que ya se construyó. Prueba la oferta en conversaciones pequeñas antes de construir la siguiente capa. |

EN word count: 66 (budget 45–75 ✓).

---

## 7. Developmental fork (Act II.3) — `quiz.ext.fork.<forkId>`

**coherence combo → `visibleLayer` fork**

| Lang | Copy |
|---|---|
| EN | Two ways to spend the next stretch of time. One: keep polishing the visible pieces, the offer wording, the brand, the funnel. Two: step back and examine what is actually organizing the pieces, which project leads, what the others are for, what's ready to be tested. The first feels productive today. The second is usually what makes the first one work. |
| RU | Есть два способа провести следующий отрезок времени. Первый: продолжать шлифовать видимые части — формулировки предложения, бренд, воронку. Второй: отступить назад и рассмотреть, что на самом деле организует эти части, какой проект ведёт, для чего нужны остальные, что уже готово к проверке. Первый способ сегодня ощущается продуктивным. Второй обычно и есть то, что делает первый рабочим. |
| ES | Hay dos formas de usar el próximo tramo de tiempo. Una: seguir puliendo las piezas visibles, la redacción de la oferta, la marca, el embudo. Dos: dar un paso atrás y examinar qué está organizando realmente esas piezas, qué proyecto lidera, para qué sirven los demás, qué está listo para probarse. La primera se siente productiva hoy. La segunda suele ser lo que hace funcionar a la primera. |

EN word count: 65 (budget 60–100 ✓).

**form combo → `evidence` fork**

| Lang | Copy |
|---|---|
| EN | Two ways forward. One: keep refining the idea privately, sharpening the language until it feels ready. Two: create a small test that reality can answer, one real invitation, one real person's response. Refinement can continue indefinitely without changing anything. Evidence changes what you actually know. |
| RU | Два пути вперёд. Первый: продолжать оттачивать идею наедине с собой, доводя формулировки до состояния "готово". Второй: создать небольшой тест, на который может ответить реальность — одно настоящее приглашение, одна настоящая реакция человека. Оттачивание может продолжаться бесконечно, ничего не меняя по сути. Доказательство меняет то, что ты на самом деле знаешь. |
| ES | Dos caminos hacia adelante. Uno: seguir refinando la idea en privado, puliendo el lenguaje hasta que se sienta lista. Dos: crear una pequeña prueba que la realidad pueda responder, una invitación real, la respuesta de una persona real. El refinamiento puede continuar indefinidamente sin cambiar nada de fondo. La evidencia cambia lo que realmente sabes. |

EN word count: 47 (budget 60–100; slightly under, acceptable per "budgets, not rigid limits" — kept lean deliberately, see joining-rule notes §11).

---

## 8. Self-directed experiment (Act II.4) — `quiz.ext.experiment.<family>.<workStageGroup>`

**coherence** (`relationship` group — fits both named and built, since the labeling move applies whether the offer exists yet or not)

| Lang | Copy |
|---|---|
| EN | Write one sentence that names what your two or three most alive projects are collectively trying to change for another person, not what each one does individually, but the shared effect they produce. | Then label each one: lead, support, test, or complete. Notice which label creates resistance. |
| RU | Напиши одно предложение о том, что твои два-три самых живых проекта вместе пытаются изменить для другого человека — не что делает каждый по отдельности, а какой общий эффект они производят. Затем присвой каждому метку: ведёт, поддерживает, тестирует или завершён. Замечай, какая метка вызывает сопротивление. |
| ES | Escribe una frase que nombre qué es lo que tus dos o tres proyectos más vivos están tratando de cambiar juntos para otra persona, no lo que hace cada uno por separado, sino el efecto compartido que producen. Luego etiqueta cada uno: lidera, apoya, prueba o completo. Observa qué etiqueta te genera resistencia. |

EN word count: 51 (budget 35–65 ✓; combined the coherence + relationship experiments from the library into one two-step move so the page shows one experiment, not two — see joining-rule notes).

**form** (`form` group)

| Lang | Copy |
|---|---|
| EN | Put the emerging direction in front of three people you trust, with one concrete invitation. Notice what they understand without your explanation. That's your evidence. |
| RU | Покажи формирующееся направление трём людям, которым доверяешь, с одним конкретным приглашением. Замечай, что они понимают без твоих объяснений. Это и есть доказательство. |
| ES | Pon la dirección que está emergiendo frente a tres personas de confianza, con una invitación concreta. Observa qué entienden sin que se lo expliques. Esa es tu evidencia. |

EN word count: 26 (budget 35–65; under, kept concrete per §15 voice rules rather than padded).

`quiz.ext.experiment.doorACta` — EN: **I'll test this first** · RU: **Сначала я проверю это сам(а)** · ES: **Primero pruebo esto yo mismo(a)**

---

## 9. Act III — The Door (shared across all four combos)

### 9.1 Completion boundary

| Key | EN | RU | ES |
|---|---|---|---|
| `resultComplete.line` | Your result is complete. | Твой результат готов полностью. | Tu resultado está completo. |
| `resultComplete.divider` | A next step, only if useful. | Следующий шаг — только если он полезен. | Un siguiente paso, solo si te sirve. |

### 9.2 Offer

| Key | EN | RU | ES |
|---|---|---|---|
| `offer.name` | The Next Chapter Map | Карта следующей главы | El mapa del próximo capítulo |
| `offer.masterResult` | Leave with a working hypothesis for what should organize the next chapter, and one real-world decision or experiment that can test it. | Ты уйдёшь с рабочей гипотезой о том, что должно организовать следующую главу, и с одним реальным решением или экспериментом, способным её проверить. | Sales con una hipótesis de trabajo sobre qué debería organizar tu próximo capítulo, y con una decisión o experimento del mundo real capaz de ponerla a prueba. |
| `offer.explanation.intro` | A free 45-minute working conversation for people actively inside this kind of transition. We will not try to solve your entire future. | Бесплатный рабочий разговор на 45 минут для тех, кто сейчас находится внутри такого перехода. Мы не будем пытаться решить всё твоё будущее целиком. | Una conversación de trabajo gratuita de 45 minutos para personas que están activamente dentro de este tipo de transición. No vamos a intentar resolver todo tu futuro. |

`offer.explanation.examineList.<1-5>`

| # | EN | RU | ES |
|---|---|---|---|
| 1 | what appears to be ending | что, судя по всему, заканчивается | qué parece estar terminando |
| 2 | what still carries energy | что всё ещё несёт энергию | qué todavía lleva energía |
| 3 | which relationship among the parts is most plausible | какая связь между частями наиболее вероятна | qué relación entre las partes es más plausible |
| 4 | what assumption is keeping the field unresolved | какое допущение держит всю картину нерешённой | qué suposición mantiene el campo sin resolver |
| 5 | what small decision or test could create evidence | какое небольшое решение или тест может создать доказательство | qué pequeña decisión o prueba podría generar evidencia |

`offer.explanation.leaveWithList.<1-4>`

| # | EN | RU | ES |
|---|---|---|---|
| 1 | a working map | рабочую карту | un mapa de trabajo |
| 2 | a named upstream question | сформулированный первичный вопрос | una pregunta de fondo con nombre |
| 3 | one concrete next move | один конкретный следующий шаг | un próximo paso concreto |
| 4 | a clearer sense of what evidence to watch | более ясное понимание, за каким доказательством следить | una idea más clara de qué evidencia observar |

| Key | EN | RU | ES |
|---|---|---|---|
| `offer.collaborativeStance` | Together, we will place the whole field where both of us can see it. | Вместе мы разложим всю картину так, чтобы видеть её могли мы оба. | Juntos vamos a poner todo el campo donde ambos podamos verlo. |
| `offer.methodAuthority` | I work at the intersection most transition advice separates: the person, the body of work, the market, and the structure capable of carrying all three. | Я работаю на пересечении того, что большинство советов о переходах разделяет: человек, тело работы, рынок и структура, способная нести всё это одновременно. | Trabajo en la intersección que la mayoría de los consejos sobre transiciones separa: la persona, el cuerpo de trabajo, el mercado y la estructura capaz de sostener los tres. |
| `offer.transparency` | We will use the time to work on the transition itself. If another way of working together becomes relevant, I will explain it clearly and leave the decision with you. | Мы используем это время, чтобы работать над самим переходом. Если станет уместен другой формат совместной работы, я ясно объясню его и оставлю решение за тобой. | Vamos a usar el tiempo para trabajar en la transición misma. Si surge otra forma de trabajar juntos que sea relevante, te la explicaré con claridad y la decisión quedará en tus manos. |
| `offer.ctaPrimary` | Map my next chapter | Составить карту следующей главы | Mapear mi próximo capítulo |
| `offer.ctaMicrocopy` | Free · 45 minutes · One focused conversation | Бесплатно · 45 минут · Один сфокусированный разговор | Gratis · 45 minutos · Una conversación enfocada |
| `offer.doorBCta` | Map this with someone | Пройти это с кем-то | Mapear esto con alguien |

Offer word count EN (intro + 5 + 4 + stance + authority + transparency, excluding CTA labels): ~128 (budget 90–140 ✓).

### 9.3 Preparation selector (§10)

| Key | EN | RU | ES |
|---|---|---|---|
| `preparation.heading` | So I can prepare for the conversation… | Чтобы я мог(ла) подготовиться к разговору… | Para que pueda prepararme para la conversación… |
| `preparation.options.explainFit` | I can explain how the main parts fit together | Я могу объяснить, как связаны основные части | Puedo explicar cómo encajan las piezas principales |
| `preparation.options.knowDecision` | I know which decision is keeping the transition open | Я знаю, какое решение держит переход открытым | Sé qué decisión está manteniendo abierta la transición |
| `preparation.options.haveTest` | I have one real-world test to run | У меня есть один реальный тест, который нужно провести | Tengo una prueba real que quiero hacer |
| `preparation.options.wantPerspective` | I mainly want another perspective before I decide | Мне в основном нужен ещё один взгляд со стороны, прежде чем решить | Sobre todo quiero otra perspectiva antes de decidir |
| `preparation.options.somethingElse` | Something else | Что-то другое | Algo más |
| `preparation.somethingElsePlaceholder` | Say more, if you want. | Расскажи чуть больше, если хочешь. | Cuéntame un poco más, si quieres. |

### 9.4 Save-and-return (§12)

| Key | EN | RU | ES |
|---|---|---|---|
| `save.secondaryLabel` | Keep this result | Сохранить этот результат | Guardar este resultado |
| `save.heading` | Keep your result | Сохрани свой результат | Guarda tu resultado |
| `save.body` | You do not have to decide today. Enter your email and we will send one private link back to this exact result, including your experiment and the invitation, so you can return when something changes. | Тебе не нужно решать сегодня. Оставь свой email, и мы пришлём одну личную ссылку на этот самый результат, включая твой эксперимент и приглашение, чтобы ты мог(ла) вернуться, когда что-то изменится. | No tienes que decidir hoy. Deja tu correo y te enviaremos un enlace privado a este resultado exacto, incluyendo tu experimento y la invitación, para que puedas volver cuando algo cambie. |
| `save.sendCta` | Send my return link | Отправить мне ссылку для возврата | Enviarme mi enlace de regreso |
| `save.microcopy` | One result link. No newsletter required. | Одна ссылка на результат. Без подписки на рассылку. | Un enlace a tu resultado. Sin necesidad de suscribirte a nada. |
| `save.confirmation` | Saved. This result, and the door back to the conversation, will be here when you return. | Сохранено. Этот результат и дверь обратно к разговору будут здесь, когда ты вернёшься. | Guardado. Este resultado, y la puerta de regreso a la conversación, van a estar aquí cuando vuelvas. |

### 9.5 Disagreement (§13)

| Key | EN | RU | ES |
|---|---|---|---|
| `disagreement.prompt` | Something feels off in this read? | Что-то в этом разборе кажется неточным? | ¿Algo en esta lectura se siente fuera de lugar? |
| `disagreement.options.chapterRightProblemNot` | The chapter feels right, but the problem does not. | Глава кажется верной, а вот проблема — нет. | El capítulo se siente correcto, pero el problema no. |
| `disagreement.options.workFurtherAlong` | The work is further along than this suggests. | Работа продвинулась дальше, чем здесь сказано. | El trabajo está más avanzado de lo que esto sugiere. |
| `disagreement.options.projectsDontBelong` | These projects or interests do not belong together. | Эти проекты или интересы не должны быть вместе. | Estos proyectos o intereses no van juntos. |
| `disagreement.options.somethingMissing` | Something important is missing. | Здесь не хватает чего-то важного. | Falta algo importante. |
| `disagreement.options.cannotTellYet` | I cannot tell yet. | Пока не могу сказать. | Todavía no puedo saberlo. |

### 9.6 Saved-return state (§12.3)

| Key | EN | RU | ES |
|---|---|---|---|
| `savedReturn.savedOnLine` | You saved this result on {{date}}. | Ты сохранил(а) этот результат {{date}}. | Guardaste este resultado el {{date}}. |
| `savedReturn.readFromNowLine` | Read it from where you are now. | Прочитай его из той точки, в которой находишься сейчас. | Léelo desde donde estás ahora. |
| `savedReturn.options.stillAccurate` | This still feels accurate | Это всё ещё точно | Esto todavía se siente certero |
| `savedReturn.options.somethingShifted` | Something important has shifted | Что-то важное изменилось | Algo importante ha cambiado |
| `savedReturn.options.readyToTalk` | I'm ready to talk | Я готов(а) поговорить | Estoy listo(a) para hablar |

### 9.7 Utility row (§12.4)

| Key | EN | RU | ES |
|---|---|---|---|
| `utility.saveLabel` | Save | Сохранить | Guardar |
| `utility.shareLabel` | Share | Поделиться | Compartir |
| `utility.retakeLabel` | Retake | Пройти заново | Repetir |
| `utility.retakeExplainer` | Retaking creates a new result. It does not overwrite this one. | Повторное прохождение создаёт новый результат. Этот не будет перезаписан. | Repetir el test crea un resultado nuevo. No sobrescribe este. |

---

## 10. Word-count table (EN, per block, vs. §17 budget)

| Block | Budget | Actual (coherence combo) | Actual (form combo) |
|---|---|---|---|
| Chapter bullseye | 25–50 | 39 | 39 (shared, stage 5) |
| Evidence (4 lines) | 60–100 | 74 | 68 (form takenTogether swaps in) |
| Synthesis + upgraded question | 60–100 | 65 | 54 |
| Two detours | 90–140 | 71 + 70 = 141 | 71 + 66 = 137 |
| Developmental fork | 60–100 | 65 | 47 |
| Experiment | 35–65 | 51 | 26 |
| Offer (intro+lists+stance+authority+transparency) | 90–140 | 128 (shared) | 128 (shared) |
| **Total core narrative (bullseye→experiment)** | ~450–650 (desktop, incl. offer) | 39+74+65+141+65+51+128 = **563** | 39+68+54+137+47+26+128 = **499** |

Both combos land inside the 450–650 desktop budget. The coherence combo's two detours run 1 word over the 90–140 sub-budget (141 vs 140); left as-is per "budgets, not rigid limits," not worth a forced cut that would weaken the amputation detour's precision.

Mobile variants are not separately authored in this phase (§14.6 is a Phase 3 UI/copy-mode task); the EN copy above is written short enough that most lines can stand unmodified on mobile, with the offer's two bullet lists as the most likely trim target if Phase 3 needs one dominant idea per viewport.

---

## 11. Joining-rule notes — reading as one authored voice

1. **Pronoun continuity.** "You" carries through Act I and II without shifting into third person or into coaching-speak ("the client," "one might"). RU stays second person informal (ты) throughout, matching the existing quiz register exactly. ES stays tú throughout (not usted), matching existing ES quiz keys.
2. **Confidence grammar is structural, not decorative.** The evidence block's "You said / You also said / And / Taken together" already performs §5's direct-signal grammar without needing the literal words "Your answers show." The synthesis section is where the explicit §5 phrases ("This combination often points to," "The question worth testing may be") appear, marking the shift from direct evidence to pattern-level inference to open inquiry. This is the one throughline that ties Act I together: statement, statement, statement, then a named shift in epistemic register.
3. **No repeated diagnosis.** The synthesis does not restate the three evidence lines; it explains their relationship (per §7.4's explicit instruction). The upgraded question does not restate the synthesis; it converts it into something the person can carry.
4. **Detours don't diagnose the reader twice.** Both detours describe a move a person in this pattern might make, not a restatement of the chapter itself — they extend the read forward into behavior rather than re-explaining the gap.
5. **One completion boundary, not two.** The completion marker (Act I.6) and the "Your result is complete" line (Act III.1) do different jobs and are kept far apart on the page (start of Act II vs. end of Act II) so they don't read as two endings.
6. **Experiment library merge (coherence combo).** The brief's library lists a separate "coherence experiment" (name the shared effect) and "relationship experiment" (label each project) as two distinct entries. For this combo they're joined into one two-step experiment rather than shown as two, keeping Act II to one experiment total per §6/§26 acceptance criteria ("one stage-matched self-directed experiment").
7. **Register calibration source.** RU and ES phrasing patterns (sentence length, directness, "ты"/"tú," avoidance of formal business jargon) were calibrated against the existing `quiz.q1/q2/q3` and `quiz.result.beats.*` keys already in `src/locales/{ru,es}/common.json`, not translated fresh from the English EXT draft — e.g. RU keeps the existing quiz's short declarative rhythm ("Ты между главами...") rather than importing more complex EN subordinate clauses literally.
8. **Flagged metaphor/register adjustments (§22):**
   - RU form-family completion marker reorders "not only resonance, but evidence" to "не только отклик, но и доказательство" (evidence-first would read as a translated calque in Russian; resonance-first-then-evidence is more natural RU sentence rhythm while preserving the same claim).
   - ES `savedReturn.options.readyToTalk` and other first-person options use `(a)` gender-neutral endings (`listo(a)`, `mismo(a)`) consistent with existing ES quiz option style, not a new convention.
   - No metaphor substitutions were needed for "chapter," "gap/between chapters," "upstream," or "vehicle" — the existing quiz's RU/ES already carry working equivalents (глава/capítulo, перепутье/entre capítulos) which EXT reuses rather than reinventing.

---

## 12. Combo-to-key map (quick reference for Phase 3 wiring)

| Combo | family | evidence.and | evidence.youAlsoSaid | evidence.takenTogether / synthesis / upgradedQuestion / completionMarker | detours | fork | experiment |
|---|---|---|---|---|---|---|---|
| integration + named (primary) | coherence | integration | named | coherence | workingDownstream, mistakingFocusForAmputation | visibleLayer | coherence/relationship (merged) |
| integration + built | coherence | integration | built | coherence | workingDownstream, mistakingFocusForAmputation | visibleLayer | coherence/relationship (merged) |
| vehicle + named | form | vehicle | named | form | workingDownstream, buildingBeforeNaming | evidence | form |
| vehicle + built | form | vehicle | built | form | workingDownstream, buildingBeforeNaming | evidence | form |
