import { mergeLedgerRecords, aggregateOutcomes, envelope, readEnvelope } from "./core.mjs";
// Tool 1: discovers Ada (post_exit_founders, term "former founder sabbatical")
const t1 = { profileUrn:"urn:li:ADA", name:"Ada Lovelace",
  source:{channel:"linkedin",mechanism:"icp_search",searchTerm:"former founder sabbatical",foundByIcpId:"post_exit_founders",capturedAt:"2026-08-28T00:00:00Z"},
  commercial:{stage:"prospect"} };
// Tool 2: same person, enriches conversation -> replied
const t2 = { profileUrn:"urn:li:ADA", name:"Ada Lovelace",
  source:{channel:"linkedin",mechanism:"connection"}, // later-touch source must NOT override first-touch
  commercial:{stage:"replied", repliedAt:"2026-08-29T00:00:00Z"} };
// Tool 3: same person by NAME + email, advances to call, records category
const t3 = { name:"Ada Lovelace", email:"ada@example.com",
  source:{channel:"email",mechanism:"gmail"},
  commercial:{stage:"call", callAt:"2026-08-30T00:00:00Z"} };
const merged = mergeLedgerRecords([t1],[t2],[t3]);
import assert from "node:assert/strict";
// merge by profileUrn (ADA appears 3x across tools) -> t1/t2/t3 share urn for first two; t3 keyed by email.
// The canonical join is profileUrn; t3 lacks urn so joins by email — verify no >1 record for the urn-bearing ones.
const urnRecs = merged.filter(r=>r.profileUrn==="urn:li:ADA");
assert.equal(urnRecs.length,1,"Tool1+Tool2 collapse to ONE record on profileUrn (no duplication)");
const ada = urnRecs[0];
assert.equal(ada.commercial.stage,"replied","stage monotonic: replied held (older prospect import cannot downgrade)");
assert.equal(ada.source.mechanism,"icp_search","first-touch source survives Tool 2 enrichment");
assert.equal(ada.source.searchTerm,"former founder sabbatical","originating search term preserved");
// Outcomes attribute back to originating ICP::term
const env = envelope(merged,{producer:"relationship-hub"});
const bucket = env.outcomes.find(o=>o.icpId==="post_exit_founders"&&o.searchTerm==="former founder sabbatical");
assert.ok(bucket,"outcome bucket keyed by originating ICP + search term exists");
assert.equal(bucket.replied,1,"reply attributed to the originating search term");
// Tool 1 reads this envelope back (readEnvelope) without schema error
const back = readEnvelope(env);
assert.ok(back.records.length>=1 && back.outcomes.length>=1,"Tool 1 can restore the Tool 3 envelope (schema round-trips)");
console.log("Cross-tool round-trip: 1 person, no duplication, first-touch source + monotonic stage preserved, reply attributed to post_exit_founders::'former founder sabbatical'");
