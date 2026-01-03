/**
 * Centralized domain/path configuration
 * Maps the 5 core domains (spirit, mind, uniqueness, emotions, body)
 * to their display labels, XP columns, and legacy aliases
 */

export type DomainSlug = 'spirit' | 'mind' | 'uniqueness' | 'emotions' | 'body';

export interface DomainConfig {
    slug: DomainSlug;
    label: string;
    xpColumn: string;
    color: string;
    /** Legacy path slugs that map to this domain */
    legacyAliases: string[];
}

export const DOMAINS: Record<DomainSlug, DomainConfig> = {
    spirit: {
        slug: 'spirit',
        label: 'Waking Up',
        xpColumn: 'xp_spirit',
        color: '#9b5de5',
        legacyAliases: ['waking-up', 'waking_up', 'wakingup'],
    },
    mind: {
        slug: 'mind',
        label: 'Growing Up',
        xpColumn: 'xp_mind',
        color: '#f5a623',
        legacyAliases: ['growing-up', 'growing_up', 'growingup'],
    },
    uniqueness: {
        slug: 'uniqueness',
        label: 'Showing Up',
        xpColumn: 'xp_uniqueness',
        color: '#ff6b35',
        legacyAliases: ['showing-up', 'showing_up', 'showingup'],
    },
    emotions: {
        slug: 'emotions',
        label: 'Cleaning Up',
        xpColumn: 'xp_emotions',
        color: '#4361ee',
        legacyAliases: ['cleaning-up', 'cleaning_up', 'cleaningup', 'heart'],
    },
    body: {
        slug: 'body',
        label: 'Body',
        xpColumn: 'xp_body',
        color: '#2d6a4f',
        legacyAliases: ['grounding', 'rooting-down', 'rooting_down'],
    },
};

/** Array of all domain slugs */
export const DOMAIN_SLUGS: DomainSlug[] = ['spirit', 'mind', 'uniqueness', 'emotions', 'body'];

/** Map of XP columns to domain slugs */
export const XP_COLUMN_TO_DOMAIN: Record<string, DomainSlug> = Object.fromEntries(
    Object.values(DOMAINS).map(d => [d.xpColumn, d.slug])
) as Record<string, DomainSlug>;

/**
 * Normalize any legacy path/domain value to canonical DomainSlug
 * Returns null if not found
 */
export function normalizeDomainSlug(value: string | null | undefined): DomainSlug | null {
    if (!value) return null;

    const normalized = value.toLowerCase().trim();

    // Check if it's already a canonical slug
    if (DOMAIN_SLUGS.includes(normalized as DomainSlug)) {
        return normalized as DomainSlug;
    }

    // Check legacy aliases
    for (const domain of Object.values(DOMAINS)) {
        if (domain.legacyAliases.includes(normalized)) {
            return domain.slug;
        }
    }

    return null;
}

/**
 * Get domain config by any legacy or canonical slug
 */
export function getDomainConfig(slug: string | null | undefined): DomainConfig | null {
    const normalized = normalizeDomainSlug(slug);
    if (!normalized) return null;
    return DOMAINS[normalized];
}

/**
 * Get display label for any domain slug (legacy or canonical)
 */
export function getDomainLabel(slug: string | null | undefined): string {
    const config = getDomainConfig(slug);
    return config?.label || slug || '';
}

/**
 * Get color for any domain slug (legacy or canonical)
 */
export function getDomainColor(slug: string | null | undefined): string {
    const config = getDomainConfig(slug);
    return config?.color || '#888';
}

/**
 * Get XP column name for any domain slug (legacy or canonical)
 */
export function getDomainXpColumn(slug: string | null | undefined): string | null {
    const config = getDomainConfig(slug);
    return config?.xpColumn || null;
}

// Legacy compatibility exports (PATH_NAMES, PATH_COLORS format)
export const PATH_NAMES: Record<string, string> = {
    'waking-up': 'Waking Up',
    'growing-up': 'Growing Up',
    'cleaning-up': 'Cleaning Up',
    'showing-up': 'Showing Up',
    'grounding': 'Body',
    // Canonical slugs
    'spirit': 'Waking Up',
    'mind': 'Growing Up',
    'emotions': 'Cleaning Up',
    'uniqueness': 'Showing Up',
    'body': 'Body',
};

export const PATH_COLORS: Record<string, string> = {
    'waking-up': '#9b5de5',
    'growing-up': '#f5a623',
    'cleaning-up': '#4361ee',
    'showing-up': '#ff6b35',
    'grounding': '#2d6a4f',
    // Canonical slugs
    'spirit': '#9b5de5',
    'mind': '#f5a623',
    'emotions': '#4361ee',
    'uniqueness': '#ff6b35',
    'body': '#2d6a4f',
};

/** Map legacy path slugs to XP columns */
export const PATH_TO_XP_COLUMN: Record<string, string> = {
    'waking-up': 'xp_spirit',
    'growing-up': 'xp_mind',
    'cleaning-up': 'xp_emotions',
    'showing-up': 'xp_uniqueness',
    'grounding': 'xp_body',
    // Canonical slugs
    'spirit': 'xp_spirit',
    'mind': 'xp_mind',
    'emotions': 'xp_emotions',
    'uniqueness': 'xp_uniqueness',
    'body': 'xp_body',
};
