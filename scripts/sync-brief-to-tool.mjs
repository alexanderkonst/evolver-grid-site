#!/usr/bin/env node
// One source of truth: docs/02-strategy/ai_matchmaker_brief.md
// The prospector tool never holds its own copy of the brief, only a projection of that file.
// Run after any brief edit:  node scripts/sync-brief-to-tool.mjs
import fs from 'node:fs';

const BRIEF = 'docs/02-strategy/ai_matchmaker_brief.md';
const CONFIG = 'commercial-tools/app/config.json';
const START = '### Sendable text';
const END = '### Why each addition is there';

export function extractBrief(markdown) {
  const start = markdown.indexOf(START);
  if (start === -1) throw new Error(`Missing "${START}" heading in the brief`);
  const end = markdown.indexOf(END, start);
  const heading = markdown.slice(start, markdown.indexOf('\n', start));
  const version = heading.match(/v(\d+\.\d+)/)?.[1];
  if (!version) throw new Error(`Could not read a version from: ${heading}`);
  const body = markdown.slice(start, end === -1 ? undefined : end);
  const text = body.split('\n').filter(l => l.startsWith('>')).map(l => l.replace(/^> ?/, '')).join('\n').trim();
  if (!text) throw new Error('Sendable block is empty');
  return { version, text };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { version, text } = extractBrief(fs.readFileSync(BRIEF, 'utf8'));
  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  config.briefVersion = `ai_matchmaker_brief.md v${version}`;
  config.brief = {
    version: `v${version}`,
    source: `${BRIEF} — the only source. Do not edit the brief inside this config; edit the file and re-run scripts/sync-brief-to-tool.mjs.`,
    standalone: true,
    sendableText: text,
  };
  fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
  console.log(`synced brief v${version} → ${CONFIG} (${text.length} chars)`);
}
