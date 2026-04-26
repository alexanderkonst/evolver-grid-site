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
        document.title = "AI OS — The Benchmark";
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
                        The Benchmark · v5.0
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
                        I made the same AI think 42% better.
                    </h1>
                    <p
                        className="text-base sm:text-lg leading-relaxed max-w-2xl"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)",
                        }}
                    >
                        Same model. Same weights. Same interface. One install — a structured
                        knowledge scaffold I&rsquo;ve been building for five years — and the
                        model&rsquo;s output on hard synthesis tasks jumps <Highlight>+42%</Highlight>.
                    </p>
                    <p
                        className="text-base sm:text-lg leading-relaxed mt-3"
                        style={{
                            color: "hsl(0 0% 100% / 0.82)",
                            textShadow: "0 0 14px rgba(0,0,0,0.85)",
                        }}
                    >
                        This page is the receipt.
                    </p>
                </header>

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
                        What I tested: does that structure measurably improve output quality
                        on the kind of hard cognitive work the marginal user actually cares
                        about — or is it just a vibe?
                    </P>
                    <P>The answer is the first one. Here&rsquo;s how I know.</P>
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
                        disappointingly shallow&rdquo;</em> — this is where the +42% lives. The
                        scaffold reliably moves you from the second category to the first.
                    </P>
                </Section>

                {/* Caveats */}
                <Section title="Caveats I'm flagging myself">
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
                            <strong>No cross-model baseline.</strong> Tested on Opus 4.7. The
                            effect on GPT-4.x, Gemini, etc. is unmeasured. The mechanism
                            (structured context) is model-agnostic; the magnitude is not yet
                            established.
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

                {/* Why this matters */}
                <Section title="Why this matters more than the number">
                    <P>
                        Most of the AI conversation right now is about model upgrades — GPT-5,
                        Claude 5, the next 100B parameters, the next benchmark leaderboard.
                        That&rsquo;s the masculine axis: more compute, more capability, faster
                        outputs.
                    </P>
                    <P>
                        The orthogonal axis is the feminine one: <em>what context is the model
                        thinking in?</em> What corpus, what frames, what developmental
                        scaffolding, what relational stance? This is the axis nobody is
                        benchmarking.
                    </P>
                    <P>
                        This benchmark is the first time I&rsquo;ve seen anyone measure it
                        cleanly with a blind protocol. The result — that scaffold contribution
                        can match or exceed a model generation jump on the tasks that matter
                        most — has implications for how anyone serious about thinking with AI
                        should be spending their attention.
                    </P>
                    <P>
                        You can install a scaffold today. You can&rsquo;t install a model
                        upgrade until somebody trains it.
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
