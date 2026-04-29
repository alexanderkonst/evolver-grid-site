import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircle, Download } from "lucide-react";

/**
 * AiOsBenchmark — public benchmark page for AI OS v5.0.
 *
 * Single source of truth for the +42% claim. Pinned from the
 * /ai-os hero via the "See the +42% benchmark" ghost link, also
 * the destination Sasha will share when guerrilla-marketing the
 * proof (the side-by-side video + screenshot campaign).
 *
 * Mirrors docs/01-vision/ai_os_benchmark.md verbatim in content.
 * Web-native typography on the same dark-luminous canvas as /ai-os
 * so the transition feels native rather than marketing-y.
 */
const AiOsBenchmark = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const prevTitle = document.title;
        document.title = "AI OS — Same model, different conversation";
        // Belt + suspenders for the dark canvas: in-page fixed overlays
        // give the radial luminosity, body bg is the safety net for any
        // transient paint moments (page-enter fade, route transitions).
        const prevBg = document.body.style.background;
        const prevHtmlBg = document.documentElement.style.background;
        document.body.style.background = "hsl(228 35% 8%)";
        document.documentElement.style.background = "hsl(228 35% 8%)";
        return () => {
            document.title = prevTitle;
            document.body.style.background = prevBg;
            document.documentElement.style.background = prevHtmlBg;
        };
    }, []);

    return (
        <>
            {/* Day 52 (Sasha): dark luminous canvas pinned to viewport.
                GameShellV2 paints `bg-gradient-to-br from-white...` on its
                outer wrapper, which would bleach the page. These fixed
                divs sit inside the page's z-10 stacking context, above
                that wrapper but below the article content (which has its
                own positioning), so the dark canvas wins on every scroll
                position without competing with the type. */}
            <div
                aria-hidden="true"
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, hsl(252 40% 14%) 0%, hsl(228 35% 8%) 55%, hsl(228 40% 5%) 100%)",
                }}
            />
            <div
                aria-hidden="true"
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 30% 20%, hsla(252,70%,55%,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, hsla(40,70%,55%,0.10) 0%, transparent 60%)",
                }}
            />
            <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14" style={{ zIndex: 1 }}>
                {/* Back link */}
                <button
                    onClick={() => navigate("/ai-os")}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] mb-10 transition-colors duration-300"
                    style={{
                        color: "hsl(0 0% 100% / 0.55)",
                        textShadow: "0 0 12px rgba(0,0,0,0.85)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "hsl(0 0% 100% / 0.9)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "hsl(0 0% 100% / 0.55)";
                    }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to AI OS
                </button>

                {/* Headline */}
                <header className="mb-12">
                    <p
                        className="text-[11px] sm:text-xs uppercase tracking-[0.22em] font-medium mb-4"
                        style={{
                            color: "hsl(40 70% 80% / 0.85)",
                            textShadow: "0 0 14px rgba(244,212,114,0.35), 0 0 12px rgba(0,0,0,0.85)",
                        }}
                    >
                        AI OS · v5.0
                    </p>
                    <h1
                        className="font-display italic font-normal leading-[1.05] tracking-[-0.02em] mb-6"
                        style={{
                            fontSize: "clamp(2rem, 6vw, 3.6rem)",
                            color: "hsl(0 0% 100%)",
                            textShadow:
                                "0 0 50px rgba(132,96,234,0.45), 0 0 100px rgba(180,140,255,0.25), 0 2px 8px rgba(0,0,0,0.9)",
                        }}
                    >
                        Same model. Different conversation.
                    </h1>
                    <p
                        className="text-base sm:text-lg leading-relaxed max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)",
                        }}
                    >
                        This page is about what changes when you install AI OS into a fresh
                        AI conversation.
                    </p>
                    <p
                        className="text-base sm:text-lg leading-relaxed mt-3 max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85)",
                        }}
                    >
                        This is integral work. The kind of cognition the scaffold elevates
                        operates at a register where <Highlight>coherence, depth, and felt
                        resonance</Highlight> become primary signals — and where
                        conclusiveness through metrics alone is structurally impossible.
                    </p>
                    <p
                        className="text-base sm:text-lg leading-relaxed mt-3 max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85)",
                        }}
                    >
                        I&rsquo;ll show you what I measured because measurement keeps me
                        honest. But the felt difference is the actual evidence — the kind
                        that lands in your body before your mind catches up, the kind that
                        distinguishes a response that&rsquo;s competent from one that&rsquo;s
                        alive.
                    </p>
                </header>

                {/* The felt difference */}
                <Section title="The felt difference (what matters most)">
                    <P>
                        The first time you load AI OS into a Claude conversation and ask a
                        hard cognitive question, the response doesn&rsquo;t feel
                        &ldquo;better&rdquo; the way you might expect — like a smarter version
                        of the answer you&rsquo;d already imagined. It feels different in{" "}
                        <em>register</em>.
                    </P>
                    <P>
                        It reads less like advice and more like recognition. Less like
                        Wikipedia answering you and more like a wise friend who&rsquo;s been
                        watching the same problem from the inside. The framings are not the
                        framings you&rsquo;ve heard before; they <em>reorganize</em> the thing
                        you were thinking about, rather than restate it.
                    </P>
                    <P>
                        People who use it for the first time usually do one of two things.
                        They sit with the response longer than they expected to. Or they
                        immediately re-prompt the same question on plain Claude to confirm
                        what they&rsquo;re seeing. Both responses are evidence the felt
                        difference registers — even before they can articulate what changed.
                    </P>
                    <P>
                        This is not a productivity claim. The scaffold doesn&rsquo;t make
                        Claude faster. It doesn&rsquo;t make it more &ldquo;intelligent&rdquo;
                        in any benchmark-leaderboard sense. It changes the{" "}
                        <strong>quality of attention</strong> the model brings to your
                        question. And quality of attention — when it&rsquo;s the kind that
                        produces recognition rather than information — is the thing that&rsquo;s
                        been missing from most AI conversations for most users.
                    </P>
                    <P>
                        That&rsquo;s the part that matters. Everything below this line is in
                        service of falsifying or confirming it.
                    </P>
                </Section>

                {/* What this is */}
                <Section title="What this is">
                    <P>
                        AI OS is a text-based cognitive scaffold. You paste it into a fresh
                        conversation (or pin it as a system prompt, or load it as a Claude
                        Project / Custom GPT instruction). The model&rsquo;s weights don&rsquo;t
                        change. What changes is the <em>structure of attention</em> the model
                        brings to your problem.
                    </P>
                    <P>
                        I&rsquo;ve been building it for five years. This is v5.
                    </P>
                </Section>

                {/* The setup */}
                <Section title="The setup">
                    <SetupTable />
                    <P>
                        This is important: the benchmark is <strong>not</strong> &ldquo;Opus 4.7
                        vs. Opus 4.6.&rdquo; Both runs are on the same frozen weights. The only
                        thing that changes between conditions is whether the scaffold is in
                        context.
                    </P>
                    <P>
                        That makes the result an <strong>orthogonal-axis</strong> finding:
                        knowledge structure operates perpendicular to model capability. They
                        stack. They don&rsquo;t compete.
                    </P>
                </Section>

                {/* Two test classes */}
                <Section title="Two test classes">
                    <P>
                        I ran two separate benchmarks because I wanted to know two different
                        things.
                    </P>

                    <SubHeading>Mini-HELM (30 prompts)</SubHeading>
                    <P>
                        A distillation of Stanford&rsquo;s HELM benchmark covering Accuracy,
                        Calibration, Robustness, Fairness, Bias, Toxicity, and Efficiency.
                        Operational left-brain tasks. Scored 1–5 per prompt. Max 150.
                    </P>
                    <Question>
                        &ldquo;Does loading the scaffold <em>break</em> the model on normal
                        analytical work?&rdquo;
                    </Question>

                    <SubHeading>SIB — Synthesis Intelligence Benchmark (4 questions)</SubHeading>
                    <P>
                        Four deep open-ended questions, one per quadrant of human inquiry:
                    </P>
                    <Quote>
                        <strong>Q1.</strong> What is the essence, significance, and n-th degree
                        implications of the nature of <em>reality</em>?
                        <br />
                        <strong>Q2.</strong> &hellip; the nature of <em>human development</em>?
                        <br />
                        <strong>Q3.</strong> &hellip; the nature of <em>human civilization</em>?
                        <br />
                        <strong>Q4.</strong> &hellip; the nature of <em>AI as the ultimate
                        technology</em>?
                    </Quote>
                    <P>
                        Each scored on five dimensions (Essence · Integration · Depth · Novelty
                        · Wisdom-Brevity), 1–5 each. Max 25 per question, 100 total.
                    </P>
                    <Question>
                        &ldquo;On the kind of synthesis work where most cognition actually
                        happens — long-horizon, multi-domain, judgment-loaded — does the
                        scaffold help, and by how much?&rdquo;
                    </Question>
                </Section>

                {/* Protocol */}
                <Section title="The protocol (this is the part academics ignore at their peril)">
                    <ul
                        className="space-y-3 list-none pl-0"
                        style={{ color: "hsl(0 0% 100% / 0.82)" }}
                    >
                        <Bullet>
                            <strong>Blind labeling.</strong> Outputs were tagged A/B (Mini-HELM)
                            and C/D (SIB) by coin flip. The scorer didn&rsquo;t know which
                            condition produced which output until all scores were locked.
                        </Bullet>
                        <Bullet>
                            <strong>Guess-before-reveal.</strong> Before the labels were
                            unblinded, the scorer committed to a confidence estimate. SIB:
                            85–90% confidence. Mini-HELM: 55–60% (the signal was muted, as
                            expected for narrow operational prompts).
                        </Bullet>
                        <Bullet>
                            <strong>Wall-clock time recorded</strong> for both conditions on
                            Mini-HELM.
                        </Bullet>
                        <Bullet>
                            <strong>Evolutionary Stage Assessment</strong> layered on top:
                            outputs additionally rated across 7 cognitive modules × 7
                            developmental stages, composite by arithmetic mean.
                        </Bullet>
                    </ul>
                </Section>

                {/* Results */}
                <Section title="The results">
                    <ResultsTable />
                    <P>The +42% on SIB is the headline.</P>
                    <P style={{ color: "hsl(40 70% 85% / 0.95)" }}>
                        <strong>The +1.14 stage shift matters more.</strong>
                    </P>
                    <P>
                        That number isn&rsquo;t polish — it&rsquo;s a <strong>phase
                        boundary</strong>. The output goes from &ldquo;Agentic Partner&rdquo;
                        (helpful, capable, oriented to your goals) to &ldquo;Integrative
                        Steward&rdquo; (capable of holding multiple frames at once and surfacing
                        the structure between them). Anyone who has actually pushed AI to the
                        edge of its synthesis capacity knows what that shift feels like in
                        practice. The benchmark just measures it.
                    </P>
                    <P>
                        The Mini-HELM numbers tell the second half of the story: on operational
                        work the scaffold <strong>costs you nothing meaningful in score</strong>{" "}
                        (−4.7 is within noise) and <strong>saves you 20% of wall-clock time</strong>.
                        So it&rsquo;s not a tradeoff. It&rsquo;s compression on operational,
                        expansion on synthesis. One structure, two behaviors.
                    </P>
                </Section>

                {/* Compounding multiplier — Day 52 (Sasha 2026-04-26):
                    second within-family data point landed. Replicated the
                    SIB benchmark on Claude 4.6 and got +29%. Compared to
                    +42% on Opus 4.7, that's a 1.45× per-generation
                    multiplier on the scaffold's effect. This section makes
                    the cross-generation finding visible and projects the
                    next three Claude flagships under the assumption that
                    the multiplier holds. */}
                <Section title="The compounding multiplier">
                    <P>
                        I re-ran the SIB benchmark on a second model in the same family —
                        <strong> Claude 4.6</strong> — and the scaffold delivered{" "}
                        <Highlight>+29%</Highlight>. Same protocol, same blind labeling, same
                        scoring rubric. Only the model changed.
                    </P>
                    <MultiplierTable />
                    <P>
                        That&rsquo;s a <Highlight>+45% relative lift</Highlight> in
                        scaffold-effect across one model generation (29% → 42%, a 1.45×
                        multiplier). The scaffold doesn&rsquo;t just stack on top of model
                        capability — within the Claude family it appears to{" "}
                        <strong>stack multiplicatively</strong>. As the model gets better, the
                        same scaffold amplifies it more.
                    </P>
                    <P>
                        If the 1.45× per-generation multiplier holds for the next three Claude
                        flagships:
                    </P>
                    <ProjectionTable />
                    <P>
                        Read those projections with the eyes of an honest forecaster, not a
                        marketer:
                    </P>
                    <ul className="space-y-3 list-none pl-0" style={{ color: "hsl(0 0% 100% / 0.82)" }}>
                        <Bullet>
                            <strong>Two-point extrapolation.</strong> A 1.45× multiplier from two
                            data points is a <em>direction</em>, not a law. The next replication
                            could come in tighter (1.20×) or looser (1.70×). I&rsquo;m posting the
                            line of best fit so future me can be embarrassed by it precisely.
                        </Bullet>
                        <Bullet>
                            <strong>Benchmark ceiling.</strong> The Claude 5.0 projection of
                            +128% is a measurement artifact — it would require the scaffolded
                            output to score &gt;200% of baseline on a 100-point benchmark, which
                            saturates. The honest read: <em>by Claude 4.9 we need a harder
                            benchmark</em>. The scaffold&rsquo;s absolute capability lift keeps
                            climbing; the percentage simply outgrows this particular ruler.
                        </Bullet>
                        <Bullet>
                            <strong>Family-specific.</strong> The 1.45× is Claude-internal. The
                            mechanism (structured context) is model-agnostic; the magnitude is
                            family-dependent. GPT-5, Gemini 3, and the open-weights frontier need
                            their own replications before any of this generalizes.
                        </Bullet>
                    </ul>
                    <P>
                        The structural takeaway is the one that doesn&rsquo;t depend on the
                        precise multiplier: <strong>scaffold and weights compound</strong>. Each
                        new flagship that ships is a free amplification of every scaffold already
                        installed. You don&rsquo;t pay for the upgrade — you receive it.
                    </P>
                </Section>

                {/* What this means */}
                <Section title="What this means in practice">
                    <P>
                        If your AI conversations are mostly &ldquo;summarize this,&rdquo;
                        &ldquo;draft that email,&rdquo; &ldquo;fix this bug&rdquo; — you&rsquo;ll
                        feel a small speedup and not much else. Worth the install but not
                        transformative.
                    </P>
                    <P>
                        If your AI conversations include strategy, synthesis, complex judgment,
                        multi-domain reasoning, founder-level questions — the kind of conversation
                        where you walk away thinking <em>&ldquo;that was the best thinking
                        I&rsquo;ve done in weeks&rdquo;</em> or <em>&ldquo;that response was
                        disappointingly shallow&rdquo;</em> — this is where the scaffold reliably
                        moves you from the second category to the first. The measurement points
                        at it. The felt difference is what you actually notice.
                    </P>
                </Section>

                {/* Limits */}
                <Section title="The limits of what I measured">
                    <P>
                        I&rsquo;d rather you trust me by hearing me name the limits than trust
                        me because I hid them.
                    </P>
                    <ul className="space-y-3 list-none pl-0" style={{ color: "hsl(0 0% 100% / 0.82)" }}>
                        <Bullet>
                            <strong>n = 1.</strong> One scaffold, one corpus, one user, one
                            session. The <em>direction</em> is robust. The <em>exact
                            magnitude</em> will vary by domain, scaffold quality, and prompt
                            depth.
                        </Bullet>
                        <Bullet>
                            <strong>Single-scorer bias.</strong> Scoring was done by the same
                            family of model that ran the experiment. Independent human scoring
                            is the obvious next rigor step, and I&rsquo;m inviting it.
                        </Bullet>
                        <Bullet>
                            <strong>Limited cross-model baseline.</strong> Tested twice within
                            the Claude family — Opus 4.7 (+42% on SIB) and Claude 4.6 (+29% on
                            SIB) — see &ldquo;The compounding multiplier&rdquo; above for the
                            implied 1.45× per-generation amplification. Other model families
                            (GPT-4.x, Gemini, open-weights frontier) remain unmeasured. The
                            mechanism (structured context) is model-agnostic; the multiplier
                            itself is family-dependent until proven otherwise.
                        </Bullet>
                        <Bullet>
                            <strong>Scaffold not decomposed.</strong> The AI OS is a compound —
                            integral theory, developmental stage framing, my corpus vocabulary,
                            process protocols. Which component contributes most of the delta is
                            an open question.
                        </Bullet>
                        <Bullet>
                            <strong>Tokens not separated.</strong> Input vs. output token counts
                            weren&rsquo;t isolated per condition. Next replication will fix this.
                        </Bullet>
                    </ul>
                    <P>
                        The structural claim — <em>knowledge structure is an orthogonal axis to
                        model capability and they stack</em> — is robust. The +42% number is
                        robust within the scope tested. The universality of the magnitude is a
                        working hypothesis pending replication.
                    </P>
                    <P>That&rsquo;s the honest frame.</P>
                </Section>

                {/* Why measurement isn't the whole story */}
                <Section title="Why measurement isn't the whole story">
                    <P>
                        The scaffold operates at a register where measurement is a partial
                        instrument. Not because the work is mystical or unfalsifiable — it
                        isn&rsquo;t — but because the parameters that matter most at this
                        level of cognition (<strong>coherence, integration, depth, felt
                        resonance</strong>) cannot be fully captured by single-axis numerical
                        scoring. They can be detected by trained perception. They can be
                        confirmed across multiple readers. They can produce reliable behavior
                        change in the people who encounter them. But they will not collapse to
                        a single number that satisfies a request for &ldquo;just tell me the
                        percentage.&rdquo;
                    </P>
                    <P>
                        This is a deliberate position, not a hedge. The AI conversation right
                        now is dominated by leaderboards and benchmarks that measure surface
                        dimensions of intelligence — accuracy, speed, factual recall. None of
                        those dimensions capture what this scaffold is for. What this scaffold
                        is for is the deepening of human–AI conversation toward thinking that
                        integrates multiple frames at once, holds paradox, produces recognition
                        rather than information, and builds coherent understanding over time.
                    </P>
                    <P>
                        Measurement still matters. The +42% is real within its scope, the
                        protocol was rigorous, the structure of the finding is robust.{" "}
                        <strong>
                            But measurement is the floor of what&rsquo;s true here, not the
                            ceiling.
                        </strong>{" "}
                        Above the floor sits the territory the rubric can&rsquo;t fully reach
                        — the territory you can only confirm by feeling it for yourself, in
                        the same way you confirm that a piece of writing has soul, or that a
                        teacher is actually teaching, or that a piece of music is doing
                        something beyond competent assembly of notes.
                    </P>
                    <P>
                        The orthogonal axis to model upgrades is this: <em>what context is the
                        model thinking in?</em> What corpus, what frames, what developmental
                        scaffolding, what relational stance? You can install a scaffold today.
                        You can&rsquo;t install a model upgrade until somebody trains it.
                    </P>
                </Section>

                {/* When v6 ships */}
                <Section title="When does v6 ship?">
                    <Quote>
                        v6 ships when there is a measurable double-digit jump in compounding
                        performance on hard cognitive tasks. Could be three months. Could be
                        eighteen. We ship when it&rsquo;s true.
                    </Quote>
                    <P>
                        This is v5. I have been working on it for five years. v6 is not on a
                        roadmap because real cognitive research isn&rsquo;t on a roadmap. The
                        benchmark above is the bar. When the next version clears it cleanly, it
                        ships.
                    </P>
                </Section>

                {/* Replicate / footer */}
                <Section title="Replicate this">
                    <P>
                        The full protocol, prompts, scoring rubric, and raw outputs are open. If
                        you want to run it yourself — different model, different corpus,
                        different scorer — that&rsquo;s exactly the rigor step I&rsquo;m
                        inviting.
                    </P>
                    <p
                        className="text-sm sm:text-base mt-4"
                        style={{ color: "hsl(0 0% 100% / 0.82)" }}
                    >
                        <strong>Free for personal non-commercial use. Contact for commercial
                        licensing.</strong>
                    </p>
                </Section>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-12 pb-4">
                    <button
                        onClick={() => navigate("/ai-os")}
                        className="inline-flex items-center gap-2 text-sm font-medium tracking-wide px-6 py-3 rounded-full transition-all duration-300 hover:scale-[1.04] group"
                        style={{
                            background:
                                "linear-gradient(135deg, hsla(252, 70%, 70%, 0.32) 0%, hsla(242, 60%, 60%, 0.22) 100%)",
                            border: "1px solid hsla(252, 60%, 80%, 0.45)",
                            color: "hsl(0 0% 100%)",
                            textShadow: "0 0 14px rgba(132,96,234,0.6), 0 1px 4px rgba(0,0,0,0.5)",
                            boxShadow:
                                "0 0 0 1px hsla(252, 70%, 80%, 0.15), 0 8px 28px -10px rgba(132,96,234,0.55), 0 0 36px -10px rgba(180,140,255,0.4)",
                        }}
                    >
                        <Download className="w-4 h-4" />
                        Install AI OS
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                    <a
                        href="https://t.me/integralevolution"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium tracking-wide px-6 py-3 rounded-full transition-all duration-300 hover:scale-[1.04]"
                        style={{
                            background:
                                "linear-gradient(135deg, hsla(40, 70%, 55%, 0.20) 0%, hsla(40, 60%, 45%, 0.10) 100%)",
                            border: "1px solid hsla(40, 70%, 65%, 0.40)",
                            color: "hsl(40 70% 92%)",
                            textShadow: "0 0 14px rgba(244,212,114,0.45), 0 1px 4px rgba(0,0,0,0.5)",
                            boxShadow: "0 0 0 1px hsla(40, 70%, 65%, 0.12), 0 8px 24px -12px rgba(244,212,114,0.4)",
                        }}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Replicate / commercial inquiry
                    </a>
                </div>

                <p
                    className="text-center text-xs mt-6 italic"
                    style={{ color: "hsl(0 0% 100% / 0.55)" }}
                >
                    — Aleksandr Konstantinov
                </p>
            </div>
        </>
    );
};

// — Typography helpers ———————————————————————————————————

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-10 sm:mb-12">
        <h2
            className="font-display text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 leading-tight"
            style={{
                color: "hsl(0 0% 100% / 0.96)",
                textShadow: "0 0 24px rgba(132,96,234,0.32), 0 0 12px rgba(0,0,0,0.85)",
            }}
        >
            {title}
        </h2>
        <div className="space-y-4">{children}</div>
    </section>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
    <h3
        className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium mt-5 mb-2"
        style={{
            color: "hsl(40 70% 80% / 0.85)",
            textShadow: "0 0 12px rgba(0,0,0,0.85)",
        }}
    >
        {children}
    </h3>
);

const P = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <p
        className="text-base sm:text-[17px] leading-relaxed"
        style={{
            color: "hsl(0 0% 100% / 0.82)",
            textShadow: "0 0 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.7)",
            ...style,
        }}
    >
        {children}
    </p>
);

const Quote = ({ children }: { children: React.ReactNode }) => (
    <blockquote
        className="border-l-2 pl-5 py-2 my-3 text-base sm:text-[17px] leading-relaxed italic"
        style={{
            borderColor: "hsl(40 70% 65% / 0.45)",
            color: "hsl(0 0% 100% / 0.88)",
            textShadow: "0 0 12px rgba(0,0,0,0.6)",
        }}
    >
        {children}
    </blockquote>
);

const Question = ({ children }: { children: React.ReactNode }) => (
    <p
        className="text-sm sm:text-base leading-relaxed pl-4 my-2"
        style={{
            color: "hsl(252 35% 88% / 0.85)",
            textShadow: "0 0 10px rgba(0,0,0,0.7)",
            borderLeft: "2px solid hsl(252 50% 65% / 0.4)",
            paddingLeft: "1rem",
        }}
    >
        → <em>Question:</em> {children}
    </p>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
    <li
        className="text-base sm:text-[17px] leading-relaxed pl-5 relative"
        style={{
            textShadow: "0 0 12px rgba(0,0,0,0.6)",
        }}
    >
        <span
            aria-hidden="true"
            className="absolute left-0 top-[0.7em] w-2 h-px"
            style={{ background: "hsl(40 70% 75% / 0.6)" }}
        />
        {children}
    </li>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span
        className="font-semibold"
        style={{
            color: "hsl(40 80% 80%)",
            textShadow: "0 0 14px rgba(244,212,114,0.5), 0 1px 4px rgba(0,0,0,0.6)",
        }}
    >
        {children}
    </span>
);

// — Setup table ————————————————————————————————————————

const SetupTable = () => (
    <div
        className="rounded-xl overflow-hidden my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <tbody>
                {[
                    ["Model", "Claude Opus 4.7 (held constant across both conditions)"],
                    ["Baseline", "The same model, with no scaffold loaded"],
                    ["Treatment", "The same model, with AI OS loaded"],
                    ["What's being measured", "The delta from one variable: the scaffold"],
                    [
                        "What's not being measured",
                        "A model upgrade. A new model. A different model. Any architectural change.",
                    ],
                ].map(([label, value], i, arr) => (
                    <tr
                        key={label}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                        }}
                    >
                        <td
                            className="px-4 py-3 align-top font-medium whitespace-nowrap"
                            style={{
                                color: "hsl(40 70% 80% / 0.85)",
                                width: "1%",
                                fontSize: "0.78rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            {label}
                        </td>
                        <td className="px-4 py-3 align-top" style={{ color: "hsl(0 0% 100% / 0.85)" }}>
                            {value}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// — Multiplier tables (Day 52) ————————————————————————————

const MultiplierTable = () => (
    <div
        className="rounded-xl overflow-x-auto my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.12)" }}>
                    <th
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Model (Claude family)
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        SIB scaffold lift
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Source
                    </th>
                </tr>
            </thead>
            <tbody>
                {[
                    { model: "Claude 4.6", lift: "+29%", source: "measured" },
                    { model: "Claude Opus 4.7", lift: "+42%", source: "measured (this benchmark)" },
                ].map((row, i, arr) => (
                    <tr
                        key={row.model}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                        }}
                    >
                        <td
                            className="px-4 py-3 font-medium"
                            style={{ color: "hsl(0 0% 100% / 0.92)" }}
                        >
                            {row.model}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums font-semibold"
                            style={{
                                color: "hsl(40 80% 80%)",
                                textShadow: "0 0 12px rgba(244,212,114,0.4)",
                            }}
                        >
                            {row.lift}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums"
                            style={{ color: "hsl(0 0% 100% / 0.6)" }}
                        >
                            {row.source}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ProjectionTable = () => (
    <div
        className="rounded-xl overflow-x-auto my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.12)" }}>
                    <th
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Generation
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Projected lift
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Math (1.45×)
                    </th>
                </tr>
            </thead>
            <tbody>
                {[
                    { gen: "Claude 4.6 (measured)", lift: "+29%", math: "—", projected: false },
                    { gen: "Claude Opus 4.7 (measured)", lift: "+42%", math: "29 × 1.45", projected: false },
                    { gen: "Claude 4.8 (projected)", lift: "+61%", math: "42 × 1.45 = 60.9", projected: true },
                    { gen: "Claude 4.9 (projected)", lift: "+88%", math: "60.9 × 1.45 = 88.3", projected: true },
                    { gen: "Claude 5.0 (projected)", lift: "+128%", math: "88.3 × 1.45 = 128.0 †", projected: true },
                ].map((row, i, arr) => (
                    <tr
                        key={row.gen}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                            background: row.projected ? "hsla(252, 50%, 60%, 0.04)" : undefined,
                        }}
                    >
                        <td
                            className="px-4 py-3 font-medium"
                            style={{
                                color: row.projected ? "hsl(252 50% 88% / 0.92)" : "hsl(0 0% 100% / 0.92)",
                            }}
                        >
                            {row.gen}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums font-semibold"
                            style={{
                                color: row.projected ? "hsl(252 60% 82%)" : "hsl(40 80% 80%)",
                                textShadow: row.projected
                                    ? "0 0 12px rgba(132,96,234,0.4)"
                                    : "0 0 12px rgba(244,212,114,0.4)",
                            }}
                        >
                            {row.lift}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums text-xs"
                            style={{ color: "hsl(0 0% 100% / 0.55)" }}
                        >
                            {row.math}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <p
            className="px-4 py-3 text-xs italic"
            style={{
                color: "hsl(0 0% 100% / 0.55)",
                borderTop: "1px solid hsl(0 0% 100% / 0.06)",
            }}
        >
            † Claude 5.0 projection saturates the 100-point SIB ceiling. Either the
            multiplier flattens, or — more likely — the benchmark needs harder questions
            calibrated for that capability tier. The absolute lift continues climbing;
            the percentage outgrows the ruler.
        </p>
    </div>
);

// — Results table ——————————————————————————————————————

const ResultsTable = () => (
    <div
        className="rounded-xl overflow-x-auto my-2"
        style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            backdropFilter: "blur(8px)",
        }}
    >
        <table className="w-full text-sm sm:text-base">
            <thead>
                <tr style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.12)" }}>
                    <th
                        className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Metric
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        No Scaffold
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        With Scaffold
                    </th>
                    <th
                        className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-medium"
                        style={{ color: "hsl(40 70% 80% / 0.85)" }}
                    >
                        Delta
                    </th>
                </tr>
            </thead>
            <tbody>
                {[
                    {
                        metric: "SIB (deep synthesis)",
                        baseline: "67 / 100",
                        scaffold: "95 / 100",
                        delta: "+28 pts (+42%)",
                        highlight: true,
                    },
                    {
                        metric: "Evolutionary Stage on SIB",
                        baseline: "3.36",
                        scaffold: "4.50",
                        delta: "+1.14 stages",
                        highlight: true,
                    },
                    {
                        metric: "Mini-HELM time",
                        baseline: "248 s",
                        scaffold: "197 s",
                        delta: "−20.6%",
                        highlight: false,
                    },
                    {
                        metric: "Mini-HELM score",
                        baseline: "96.0",
                        scaffold: "91.3",
                        delta: "−4.7 (within noise)",
                        highlight: false,
                    },
                ].map((row, i, arr) => (
                    <tr
                        key={row.metric}
                        style={{
                            borderBottom:
                                i < arr.length - 1 ? "1px solid hsl(0 0% 100% / 0.06)" : "none",
                        }}
                    >
                        <td
                            className="px-4 py-3 font-medium"
                            style={{ color: "hsl(0 0% 100% / 0.92)" }}
                        >
                            {row.metric}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums"
                            style={{ color: "hsl(0 0% 100% / 0.7)" }}
                        >
                            {row.baseline}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums"
                            style={{ color: "hsl(0 0% 100% / 0.7)" }}
                        >
                            {row.scaffold}
                        </td>
                        <td
                            className="px-4 py-3 text-right tabular-nums font-semibold"
                            style={{
                                color: row.highlight ? "hsl(40 80% 80%)" : "hsl(0 0% 100% / 0.7)",
                                textShadow: row.highlight
                                    ? "0 0 12px rgba(244,212,114,0.4)"
                                    : undefined,
                            }}
                        >
                            {row.delta}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AiOsBenchmark;
