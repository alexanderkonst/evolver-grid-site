export interface MarketplaceProduct {
    id: string;
    slug: string;
    title: string;
    landing_html: string | null;
    blueprint_content: {
        title: string;
        steps: string[];
        ctaSection: string;
    } | null;
    cta_config: {
        type: "session" | "software";
        buttonText: string;
        description: string;
        /** Optional destination (https:, http: or mailto:). No url → no CTA button. */
        url?: string;
    } | null;
    user_id: string;
}

type BlueprintContent = NonNullable<MarketplaceProduct["blueprint_content"]>;
type CtaConfig = NonNullable<MarketplaceProduct["cta_config"]>;

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null && !Array.isArray(v);

export const parseBlueprint = (raw: unknown): BlueprintContent | null => {
    if (!isRecord(raw) || typeof raw.title !== "string" || !Array.isArray(raw.steps)) return null;
    return {
        title: raw.title,
        steps: raw.steps.filter((s): s is string => typeof s === "string"),
        ctaSection: typeof raw.ctaSection === "string" ? raw.ctaSection : "",
    };
};

export const parseCta = (raw: unknown): CtaConfig | null => {
    if (!isRecord(raw) || typeof raw.buttonText !== "string") return null;
    return {
        type: raw.type === "software" ? "software" : "session",
        buttonText: raw.buttonText,
        description: typeof raw.description === "string" ? raw.description : "",
        url: typeof raw.url === "string" ? raw.url : undefined,
    };
};

/** Only follow destinations that cannot run script (blocks javascript:, data:). */
export const safeCtaUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return ["https:", "http:", "mailto:"].includes(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
};


export const blueprintToText = (blueprint: BlueprintContent): string =>
    [
        blueprint.title,
        "",
        ...blueprint.steps.map((step, i) => `${i + 1}. ${step}`),
        ...(blueprint.ctaSection ? ["", blueprint.ctaSection] : []),
        "",
    ].join("\n");
