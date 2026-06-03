import { Helmet } from "react-helmet-async";

// Per-route head. The static head in index.html is the brand
// fallback; <SEO> overrides title / description / canonical / og:*
// per page so each surface is indexable and citable as itself instead
// of collapsing into "/".
//
// Convention:
// - title is rendered as-is; each route owns its full tab title
//   including any brand chrome it wants.
// - canonical is always production (https://findyourtoptalent.com)
//   regardless of which preview/lovable.app/aleksandrkonstantinov
//   alias the user landed on. This is intentional — we have one
//   canonical home and want all signals to consolidate there.
// - og:title/og:description default to title/description but can be
//   overridden when the social hook differs from the SEO hook.

const PROD_ORIGIN = "https://findyourtoptalent.com";
const DEFAULT_OG_IMAGE = `${PROD_ORIGIN}/opengraph-image.png`;
const DEFAULT_OG_IMAGE_ALT = "Find Your Top Talent. Productize It. Find Your People.";

export interface SEOProps {
    title: string;
    description: string;
    /** Path only, e.g. "/ignite". Origin is added automatically. */
    path: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogImageAlt?: string;
    ogType?: "website" | "article" | "profile";
    /** Extra JSON-LD blocks to inject (Article, Person, Service, FAQ, etc.). */
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
    noIndex?: boolean;
}

const SEO = ({
    title,
    description,
    path,
    ogTitle,
    ogDescription,
    ogImage = DEFAULT_OG_IMAGE,
    ogImageAlt = DEFAULT_OG_IMAGE_ALT,
    ogType = "website",
    jsonLd,
    noIndex,
}: SEOProps) => {
    const canonical = `${PROD_ORIGIN}${path}`;
    const finalOgTitle = ogTitle ?? title;
    const finalOgDescription = ogDescription ?? description;
    const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />
            {noIndex && <meta name="robots" content="noindex,nofollow" />}

            <meta property="og:title" content={finalOgTitle} />
            <meta property="og:description" content={finalOgDescription} />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content={ogType} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={ogImageAlt} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalOgTitle} />
            <meta name="twitter:description" content={finalOgDescription} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={ogImageAlt} />

            {blocks.map((block, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(block)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
