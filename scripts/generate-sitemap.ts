// Day 65 (Sasha 2026-05-14): sitemap generator. Replaces the
// hand-edited public/sitemap.xml. Runs via predev/prebuild so the
// file Google sees always reflects whichever public routes are
// currently in src/App.tsx.
//
// Coverage policy:
//   - Include only PUBLIC, INDEXABLE routes (no auth wall, no
//     admin, no /game/* member surfaces).
//   - Include the high-intent funnel pages we explicitly want
//     ranked / cited by LLMs.
//   - Exclude dynamic /founders/:slug for now — that index is
//     admin-gated; revisit when /founders is opened to the public.
//
// To add a route: append to `entries`. lastmod defaults to today.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://findyourtoptalent.com";
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
    path: string;
    changefreq?: "daily" | "weekly" | "monthly" | "yearly";
    priority?: string;
    lastmod?: string;
}

const entries: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/start", changefreq: "monthly", priority: "0.9" },
    { path: "/ignite", changefreq: "weekly", priority: "0.95" },
    { path: "/zone-of-genius", changefreq: "weekly", priority: "0.9" },
    { path: "/zone-of-genius/entry", changefreq: "weekly", priority: "0.85" },
    { path: "/27", changefreq: "monthly", priority: "0.8" },
    { path: "/ai-os", changefreq: "weekly", priority: "0.9" },
    { path: "/ai-os/work-with-us", changefreq: "weekly", priority: "0.85" },
    { path: "/ai-os/clarity", changefreq: "weekly", priority: "0.7" },
    { path: "/ai-os/iteration", changefreq: "weekly", priority: "0.7" },
    { path: "/ai-os/vibe-code", changefreq: "weekly", priority: "0.7" },
    { path: "/ai-os/design", changefreq: "weekly", priority: "0.7" },
    { path: "/ai-os/benchmark", changefreq: "monthly", priority: "0.6" },
    { path: "/intelligences", changefreq: "monthly", priority: "0.6" },
    { path: "/quiz", changefreq: "monthly", priority: "0.6" },
    { path: "/activations", changefreq: "weekly", priority: "0.7" },
];

function xml(entries: SitemapEntry[]): string {
    const urls = entries
        .map((e) =>
            [
                "  <url>",
                `    <loc>${BASE_URL}${e.path}</loc>`,
                `    <lastmod>${e.lastmod ?? TODAY}</lastmod>`,
                e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
                e.priority ? `    <priority>${e.priority}</priority>` : null,
                "  </url>",
            ]
                .filter(Boolean)
                .join("\n"),
        )
        .join("\n");

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        "</urlset>",
        "",
    ].join("\n");
}

const out = resolve("public/sitemap.xml");
writeFileSync(out, xml(entries));
console.log(`sitemap.xml written (${entries.length} entries) → ${out}`);
