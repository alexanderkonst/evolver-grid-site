#!/usr/bin/env node
// One vocabulary, one current brief, everything else derived.
//
//   docs/02-strategy/briefs/matchmaker_brief_vX.Y.md  → the sendable brief (highest version wins)
//   commercial-tools/app/config.json  mfLexicon       → the ONLY marker vocabulary
//
// This script copies the current brief into the tool and REGENERATES the search
// queries from the lexicon, so the words can never disagree across surfaces.
// Run after editing either one:  node scripts/sync-brief-to-tool.mjs
import fs from 'node:fs';
import path from 'node:path';

const BRIEFS = 'docs/02-strategy/briefs';
const CONFIG = 'commercial-tools/app/config.json';

export function currentBrief(dir = BRIEFS) {
  const files = fs.readdirSync(dir).filter(f => /^matchmaker_brief_v\d+\.\d+\.md$/.test(f));
  if (!files.length) throw new Error(`No matchmaker_brief_vX.Y.md found in ${dir}`);
  const rank = f => f.match(/v(\d+)\.(\d+)/).slice(1).map(Number);
  files.sort((a, b) => { const [A, a2] = rank(a), [B, b2] = rank(b); return B - A || b2 - a2; });
  const file = files[0];
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  return {
    file,
    version: file.match(/v(\d+\.\d+)/)[1],
    text: raw.replace(/<!--[\s\S]*?-->/g, '').replace(/^#\s+.*$/m, '').trim(),
    superseded: files.slice(1),
  };
}

// Search surfaces are DERIVED from the lexicon. Never hand-maintain them.
export function deriveQueries(lex) {
  const tier = n => lex.tiers.find(t => t.tier === n)?.terms ?? [];
  const insider = [...tier(1), ...tier(2)].filter(t => t.includes(' '));
  const single = [...tier(1), ...tier(2)].filter(t => !t.includes(' '));
  const q = (marker, tail) => `site:linkedin.com/in "${marker}" ${tail}`;
  return {
    apiSearchTerms: {
      note: 'Single terms for the connector path: the API ignores Boolean and truncates to ~7 results per query, so volume comes from MANY queries, not deeper pages.',
      client: [...insider, ...single, 'self-employed', 'solopreneur', 'ex-founder', 'sabbatical', 'career break', 'fractional'],
      partner: ['founder coach', 'executive coach', 'community builder', 'agency founder'],
      operator: (lex.streamMarkers?.terms ?? []),
    },
    xrayQueries: {
      note: 'Google X-ray: real Boolean, indexes the About text, no commercial-use cap. Generated from mfLexicon — do not edit by hand.',
      client: insider.map(m => q(m, 'founder "what\'s next" OR "between ventures"')),
      partner: insider.map(m => q(m, 'coach founders')),
      operator: (lex.streamMarkers?.terms ?? []).map(m => q(m, '"managing partner" OR director')),
      watch: (lex.watchTerms ?? ['cannabis', 'plant medicine']).map(m => q(m, 'founder')),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const brief = currentBrief();
  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  const lex = { ...config.mfLexicon, watchTerms: config.watchlist?.terms };
  const derived = deriveQueries(lex);

  config.briefVersion = `matchmaker_brief_v${brief.version}.md`;
  config.brief = {
    version: `v${brief.version}`,
    source: `${BRIEFS}/${brief.file} — the only source. Edit that file, then re-run this script.`,
    standalone: true,
    supersedes: brief.superseded,
    sendableText: brief.text,
  };
  config.apiSearchTerms = derived.apiSearchTerms;
  config.xrayQueries = derived.xrayQueries;
  for (const icp of config.icps) delete icp.terms; // derived now, not stored per-stream

  fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
  console.log(`brief v${brief.version} (${brief.text.length} chars) + queries derived from ${lex.tiers.length} lexicon tiers → ${CONFIG}`);
  if (brief.superseded.length) console.log(`superseded: ${brief.superseded.join(', ')}`);
}
