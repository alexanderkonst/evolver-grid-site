/**
 * Activate Your Dormant Potential — free mini-course content.
 *
 * ONE data file drives the whole course page (/grow/activate-your-dormant-potential).
 * Adding, replacing or reordering an episode is a one-line change here; adding
 * an infographic is one `infographic` field. No component edits.
 *
 *  - `youtubeId` starting with "TBD" = video not uploaded yet. The UI skips
 *    those episodes; replace the id with the real one and it appears.
 *  - `infographic` (optional) = image URL or /public path shown under the player.
 *  - Videos are Unlisted on YouTube; embedded via youtube-nocookie.com.
 *  - Episode titles stay English in every locale.
 */

export interface CourseEpisode {
    /** Unique within the course. Used in the ?ep= deep link and progress storage. */
    code: string;
    title: string;
    youtubeId: string;
    infographic?: string;
}

export interface CourseModule {
    id: string;
    title: string;
    episodes: CourseEpisode[];
}

export interface CoursePractice {
    id: string;
    /** Duration label shown before the title, e.g. "1 min". */
    duration: string;
    title: string;
    soundcloudUrl: string;
}

export const COURSE_SLUG = "activate-your-dormant-potential";
export const COURSE_PATH = `/grow/${COURSE_SLUG}`;
export const COURSE_TITLE = "Activate Your Dormant Potential";

export const COURSE_MODULES: CourseModule[] = [
    {
        id: "welcome",
        title: "Welcome",
        episodes: [{ code: "00", title: "Welcome", youtubeId: "TBD-00" }],
    },
    {
        id: "foundations",
        title: "Foundations",
        episodes: [
            { code: "F00", title: "Foundations: Introduction", youtubeId: "TBD-F00" },
            { code: "F01E01", title: "The Obvious Secrets of Growth", youtubeId: "cb5ANfGAtJo" },
            { code: "F01E02", title: "Dormant Potential", youtubeId: "3UUwOXDKMUw" },
            { code: "F01E03", title: "Growth Acceleration Cycle", youtubeId: "4BqbNTKfrXc" },
            { code: "F01E04", title: "The Five Paths of Growth", youtubeId: "j4ucFWx_rZ8" },
            { code: "F01E05", title: "The Body Path: Vitality", youtubeId: "RN3_qNKE2EI" },
            { code: "F01E06", title: "The Path to Emotional Mastery", youtubeId: "Dfn35sEs8eQ" },
            { code: "F01E07", title: "Mind Path: Guide to Clarity", youtubeId: "9UOu6tWXHSA" },
            { code: "F01E08", title: "The Genius Path", youtubeId: "LW7MT427bls" },
            { code: "F01E09", title: "Architecture of Spirit", youtubeId: "ZjzigAPA-LM" },
            { code: "F01E10", title: "Balanced Growth", youtubeId: "zLihfsE9M18" },
            { code: "F01E11", title: "Continue? Yes or No", youtubeId: "TBD-F11" },
        ],
    },
    {
        id: "spirit",
        title: "Spirit",
        episodes: [
            { code: "S00", title: "Spirit: Introduction", youtubeId: "TBD-S00" },
            { code: "S01E01", title: "The Meta-Abilities of Spirit", youtubeId: "DXO3qGGFEvk" },
            { code: "S01E02", title: "The Foundation of Presence", youtubeId: "jYRS2d6W0Gs" },
            { code: "S01E03", title: "Perceiving Quality", youtubeId: "SeypsSrhzqY" },
            { code: "S01E04", title: "The Master Practice", youtubeId: "TB-eIK2dgt8" },
            { code: "S01E05", title: "Heart Opening Protocol", youtubeId: "sLBNr2R1x88" },
            { code: "S01E06", title: "Meta-Awareness", youtubeId: "1S1Fwhewqbk" },
            { code: "S01E07", title: "Deciding by Feeling", youtubeId: "kYJYYgVBmZg" },
            { code: "S01E08", title: "Hearing Your Inner Wisdom", youtubeId: "UMAd9cFRQyw" },
            { code: "S01E09", title: "What Is Meditation, Really?", youtubeId: "yQqnlkkYScc" },
            { code: "S01E10", title: "Your Inner Map", youtubeId: "mJsziJmW4tY" },
        ],
    },
    {
        id: "mind",
        title: "Mind",
        episodes: [
            { code: "M00", title: "Mind: Introduction", youtubeId: "TBD-M00" },
            { code: "M01E01", title: "What is Mind?", youtubeId: "6sK_LBoONZw" },
            { code: "M01E02", title: "Lenses of Perception", youtubeId: "f2j2iEjSNCo" },
            { code: "M01E03", title: "Recognizing Your Stage", youtubeId: "RCZ2Iw1l22Q" },
            { code: "M01E04", title: "Intentional Growth", youtubeId: "6z5znGbjn_Y" },
            { code: "M01E05", title: "Our Brain's Glitches", youtubeId: "xdgvjks7tQw" },
        ],
    },
    {
        id: "emotions",
        title: "Emotions",
        episodes: [
            { code: "E00", title: "Emotions: Introduction", youtubeId: "TBD-E00" },
            { code: "E01E01", title: "The Emotional Slider", youtubeId: "dnpYK7zQgak" },
            { code: "E01E02", title: "Recognizing Your Patterns", youtubeId: "Ms2cKJgZnoQ" },
            { code: "E01E03", title: "Processing Your Emotions", youtubeId: "6kUyXRDfip0" },
            { code: "E01E04", title: "Mastering the Storm", youtubeId: "wSAcVg3oF6o" },
        ],
    },
    {
        id: "body",
        title: "Body",
        episodes: [
            { code: "B00", title: "Body: Introduction", youtubeId: "TBD-B00" },
            { code: "B01E01", title: "Body Path: Your Foundation", youtubeId: "A3en7avoljE" },
            { code: "B01E02", title: "Physical Mastery Foundations", youtubeId: "-XzXV9TR9z4" },
            { code: "B01E03", title: "Listening to Your Body", youtubeId: "Pr5E3a1oz5U" },
        ],
    },
    {
        id: "genius",
        title: "Genius",
        episodes: [
            { code: "G00", title: "Genius: Introduction", youtubeId: "TBD-G00" },
            { code: "G01E01", title: "The Architecture of Genius", youtubeId: "RVJqfZ7Z2Vk" },
            { code: "G01E02", title: "Finding Your Zone of Genius", youtubeId: "4p-9HA_6Weg" },
            { code: "G01E03", title: "Forging Your Genius Offer", youtubeId: "Ja710hx_46A" },
            { code: "G01E04", title: "Unmasking Your Genius", youtubeId: "Nq68Ltr3Fyc" },
            { code: "G01E05", title: "Living Your Genius", youtubeId: "_SI1nwk_ZTs" },
            { code: "G01E06", title: "The Blueprint of Genius", youtubeId: "XDWNnouwsBU" },
        ],
    },
    {
        id: "closing",
        title: "Closing",
        episodes: [{ code: "Z01", title: "How to Integrate This Knowledge", youtubeId: "TBD-Z01" }],
    },
];

export const COURSE_PRACTICES: CoursePractice[] = [
    {
        id: "five-breaths",
        duration: "1 min",
        title: "Experience 5 Breaths",
        soundcloudUrl: "https://soundcloud.com/alexander-konstantinov-976475588/quest-4-experience-5-breaths",
    },
    {
        id: "symmetric-breaths",
        duration: "5 min",
        title: "29 Symmetric Breaths",
        soundcloudUrl: "https://soundcloud.com/alexander-konstantinov-976475588/29-symmetric-breaths",
    },
];
