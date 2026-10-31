/**
 * Course sales pages (/academy/<slug>) — one entry per Academy course, rendered
 * by ONE template: src/components/CourseSalesPage.tsx (Sasha, 2026-10-30:
 * «давай каждому курсу сделаем продающую страницу!»).
 *
 * Voice: gift-first and clean. No urgency, no scarcity, no fear, no claims,
 * testimonials or numbers that are not in the course's own source. English only.
 *
 * Sources per course:
 *  - Consciousness Meets Science: src/data/courses/consciousnessMeetsScience.ts,
 *    docs/08-content/consciousness_meets_science_course.md.
 *  - Activate Your Dormant Potential: src/data/courses/activateYourDormantPotential.ts,
 *    docs/08-content/activate_your_dormant_potential_transcripts.md.
 *  - Founder Academy / Integral Mystery School: the recorded Cohort 1 sessions on
 *    YouTube @IntegralEvolution (5 + 5, ~2 h each), as distilled in the knowledgegraph
 *    vault (10 Notes/Integral Mystery School/FA L1 S1–S5, IMS L2 S1–S5).
 *    Price and format: Sasha, 2026-10-30 ($111 · recorded each).
 *  - Advanced micro-course (/27): src/data/courses/activationOfInnerVision.ts,
 *    docs/08-content/activation_of_inner_vision_course.md. Price $27 (Sasha, 2026-10-30 22:37), display only.
 *  - Live group: Sasha, 2026-10-30 ("Live group · 1 month · $333 — live version of
 *    Founder Academy + Integral Mystery School · Join the waitlist").
 *
 * No Stripe here: paid courses have no checkout link in the code yet, so their CTA
 * is a Telegram message to Aleksandr; the live group uses the existing waitlist
 * (WaitlistModal → send-waitlist-email).
 */
import type { CourseModule } from "@/data/courses/types";
import { CONSCIOUSNESS_MEETS_SCIENCE, CMS_COURSE_PATH } from "@/data/courses/consciousnessMeetsScience";
import { ACTIVATE_YOUR_DORMANT_POTENTIAL, COURSE_PATH as ADP_COURSE_PATH } from "@/data/courses/activateYourDormantPotential";
import { ACTIVATION_OF_INNER_VISION, AIV_COURSE_PATH } from "@/data/courses/activationOfInnerVision";

export const COURSE_SALES_BASE = "/academy";
export const courseSalesPath = (slug: string) => `${COURSE_SALES_BASE}/${slug}`;

export const TELEGRAM_HANDLE = "integralevolution";
export const telegramHref = (message: string) =>
    `https://t.me/${TELEGRAM_HANDLE}?text=${encodeURIComponent(message)}`;

export type CourseSalesCta =
    | { kind: "start"; label: string; to: string }
    | { kind: "telegram"; label: string; message: string }
    | { kind: "waitlist"; label: string; waitlistName: string };

export interface CourseSalesItem {
    title: string;
    note?: string;
}

export interface CourseSalesData {
    slug: string;
    title: string;
    /** Small label above the title. */
    eyebrow: string;
    /** One-line promise, in Sasha's words where available. */
    promise: string;
    /** One or two plain sentences under the promise. */
    lead?: string;
    forWhom: string[];
    /** Either the course's real modules (rendered with episode titles)… */
    modules?: CourseModule[];
    /** …or a plain list of sessions/parts. */
    inside?: CourseSalesItem[];
    insideLabel?: string;
    practice: string[];
    /** e.g. "$111" or "Free". Omitted = no price shown. */
    price?: string;
    /** e.g. "Recorded · 5 sessions, about 2 hours each". */
    format: string;
    /** Where it sits on the path, e.g. "After Founder Academy". */
    order?: string;
    /** Small status line next to the contents, e.g. "Videos in production". */
    status?: string;
    cta: CourseSalesCta;
    seoDescription: string;
}

const countEpisodes = (modules: CourseModule[], publishedOnly: boolean) =>
    modules.reduce(
        (n, m) => n + m.episodes.filter((e) => !publishedOnly || !e.youtubeId.startsWith("TBD")).length,
        0,
    );

const cmsVideos = countEpisodes(CONSCIOUSNESS_MEETS_SCIENCE.modules, true);
const adpVideos = countEpisodes(ACTIVATE_YOUR_DORMANT_POTENTIAL.modules, true);
const aivVideos = countEpisodes(ACTIVATION_OF_INNER_VISION.modules, false);
const aivPublished = countEpisodes(ACTIVATION_OF_INNER_VISION.modules, true);

export const COURSE_SALES: CourseSalesData[] = [
    {
        slug: CONSCIOUSNESS_MEETS_SCIENCE.slug,
        title: CONSCIOUSNESS_MEETS_SCIENCE.title,
        eyebrow: "Free mini-course",
        promise: "Inner insight and scientific knowledge are two sides of the same coin.",
        lead: `How inner experience and modern science co-reveal the nature of reality. In ${cmsVideos} short videos, see how what you feel inside and what science finds outside tell one story.`,
        forWhom: [
            "You have had moments you couldn't explain, and you also trust science.",
            "You are tired of choosing between your head and your heart.",
            "You want to know what physics and brain research actually say, and what they don't.",
        ],
        modules: CONSCIOUSNESS_MEETS_SCIENCE.modules,
        practice: [
            "Each episode ends with a short practice: a few breaths, one question, a minute of noticing.",
            "Science claims are marked as established or as hypothesis, so you always know which is which.",
        ],
        price: "Free",
        format: `${cmsVideos} short videos · about 2 minutes each · watch at your own pace`,
        cta: { kind: "start", label: "Start the course", to: CMS_COURSE_PATH },
        seoDescription:
            "A free mini-course by Aleksandr Konstantinov: how inner experience and modern science co-reveal the nature of reality.",
    },
    {
        slug: ACTIVATE_YOUR_DORMANT_POTENTIAL.slug,
        title: ACTIVATE_YOUR_DORMANT_POTENTIAL.title,
        eyebrow: "Free mini-course",
        promise: "You grow first, and then the results follow.",
        lead: "How to master your spirit, mind, emotions, body and unique genius: the five paths of growth, one short video at a time.",
        forWhom: [
            "You want to grow on purpose, not by accident.",
            "You want one map that holds spirit, mind, emotions, body and your unique genius together.",
            "You like short, clear lessons you can come back to.",
        ],
        modules: ACTIVATE_YOUR_DORMANT_POTENTIAL.modules,
        practice: ACTIVATE_YOUR_DORMANT_POTENTIAL.practices.map((p) => `${p.title} (${p.duration}), a guided audio practice.`),
        price: "Free",
        format: `${adpVideos} short videos · ${ACTIVATE_YOUR_DORMANT_POTENTIAL.practices.length} audio practices · watch at your own pace`,
        cta: { kind: "start", label: "Start the course", to: ADP_COURSE_PATH },
        seoDescription:
            "A free mini-course by Aleksandr Konstantinov: how to master your spirit, mind, emotions, body and unique genius.",
    },
    {
        slug: "founder-academy",
        title: "Founder Academy",
        eyebrow: "Recorded course · after the two free courses",
        promise: "A map of how we grow, so that growth speeds up, and a playbook for building from your genius.",
        lead: "Five sessions, recorded live with the first cohort: human development, its acceleration, your Zone of Genius, a conscious entrepreneurship playbook, and AI.",
        forWhom: [
            "You are starting or building something of your own and want to grow as a person while you build.",
            "You want to name what you are uniquely built to do, and turn it into work.",
            "You want a clearer, calmer relationship with AI as a working partner.",
        ],
        insideLabel: "Five sessions",
        inside: [
            { title: "Human Development 101", note: "The map of full human potential: how we grow, and why it matters." },
            { title: "Acceleration of Human Development", note: "Keys to accelerate, balance and sustain growth across consciousness, uniqueness, mind, emotions and body." },
            { title: "Zone of Genius", note: "Articulate it, activate it, and begin to monetize it." },
            { title: "Conscious Entrepreneurship Playbook", note: "A blueprint for a purpose-driven, AI-built startup that starts with zero initial investment and works when it delivers real value." },
            { title: "AI", note: "Clear limiting beliefs about AI and set up your own AI-enabled way of working." },
        ],
        practice: [
            "One master practice, conscious breath and heart-centering, played as a daily game.",
        ],
        price: "$111",
        format: "Recorded · 5 sessions, about 2 hours each",
        cta: {
            kind: "telegram",
            label: "Ask on Telegram",
            message: "Hi Aleksandr, I'd like to join Founder Academy ($111, recorded).",
        },
        seoDescription:
            "Founder Academy by Aleksandr Konstantinov: five recorded sessions on human development, your Zone of Genius, conscious entrepreneurship and AI.",
    },
    {
        slug: "integral-mystery-school",
        title: "Integral Mystery School",
        eyebrow: "Recorded course · after Founder Academy",
        promise: "Bridging consciousness, technology and business into one.",
        lead: "The second level, recorded live with the first cohort: first principles, spirit in leadership, a compass for your soul, integral mastery, and a closing activation.",
        forWhom: [
            "You finished Founder Academy and want to go deeper.",
            "You want to lead from purpose and mission, with practical frameworks to act on them.",
            "You want one clear compass that gathers everything you know about yourself.",
        ],
        insideLabel: "Five sessions",
        inside: [
            { title: "Universal First Principles", note: "The seven Hermetic principles as a backbone for everything that follows." },
            { title: "Inspirited Leadership", note: "Spirit and leadership together: leading from purpose and mission." },
            { title: "Soul's Compass", note: "One compass that brings all your self-understanding into focus." },
            { title: "Integral Mastery", note: "Deeper into uniqueness and mind: stages of perception, up to integral and holonic thinking." },
            { title: "Activation of Dormant Potential", note: "A review of the whole path and a guided breath activation." },
        ],
        practice: [
            "A breathwork activation on the question “why am I here on Earth”.",
            "A closing guided three-part breath activation.",
        ],
        price: "$111",
        format: "Recorded · 5 sessions, about 2 hours each",
        order: "After Founder Academy",
        cta: {
            kind: "telegram",
            label: "Ask on Telegram",
            message: "Hi Aleksandr, I'd like to join Integral Mystery School ($111, recorded).",
        },
        seoDescription:
            "Integral Mystery School by Aleksandr Konstantinov: five recorded sessions on first principles, inspirited leadership, the soul's compass and integral mastery.",
    },
    {
        slug: ACTIVATION_OF_INNER_VISION.slug,
        title: "Advanced micro-course: Activation of Inner Vision",
        eyebrow: "Advanced micro-course · after Integral Mystery School",
        promise: "See any situation whole, from 27 positions, and let the seeing land as one act.",
        lead: `${aivVideos} short videos on the 27-perspective instrument: two axes, twelve dimensions, the Logos, the octave of seeing the seer, and the 27th, where seeing becomes an act.`,
        forWhom: [
            "You finished Integral Mystery School and want an instrument, not only a map.",
            "You have a real situation in front of you and want to see it from every side.",
        ],
        modules: ACTIVATION_OF_INNER_VISION.modules,
        practice: [
            `Every episode ends in a practice on your own real situation, the same one carried through all ${aivVideos}.`,
        ],
        price: "$27",
        format: `${aivVideos} short videos · built on the paper “27-Perspective Vision”`,
        order: "After Integral Mystery School",
        status: aivPublished === 0 ? "Videos in production" : undefined,
        cta: {
            kind: "telegram",
            label: "Ask on Telegram",
            message: "Hi Aleksandr, I'd like to take the advanced micro-course Activation of Inner Vision ($27).",
        },
        seoDescription:
            "An advanced micro-course on 27-perspective seeing, by Aleksandr Konstantinov. After Integral Mystery School.",
    },
    {
        slug: "live-group",
        title: "Live group",
        eyebrow: "Live · 1 month",
        promise: "Founder Academy and Integral Mystery School, live, together.",
        lead: "The live version of both courses: you go through them with a group, with Aleksandr, over one month.",
        forWhom: [
            "You'd rather learn live, with people, than alone with recordings.",
            "You want to bring your questions into the room as they come up.",
        ],
        insideLabel: "Both courses, live",
        inside: [
            { title: "Founder Academy", note: "Human development, its acceleration, Zone of Genius, conscious entrepreneurship, AI." },
            { title: "Integral Mystery School", note: "First principles, inspirited leadership, soul's compass, integral mastery, activation." },
        ],
        practice: ["The practices of both courses, done live with the group."],
        price: "$333",
        format: "Live group · 1 month",
        cta: {
            kind: "waitlist",
            label: "Join the waitlist",
            waitlistName: "Live group: Founder Academy + Integral Mystery School ($333)",
        },
        seoDescription:
            "A one-month live group with Aleksandr Konstantinov: the live version of Founder Academy and Integral Mystery School.",
    },
];

export const getCourseSales = (slug: string | undefined) => COURSE_SALES.find((c) => c.slug === slug);
